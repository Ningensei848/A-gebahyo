import { Eta } from 'eta'
import * as path from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { parseArgs } from 'node:util'

import { default as constructPortal } from './portal'
import {
    isHorseRecord,
    isKaisaiIds,
    isNumber,
    isRaceDetail,
    isResultData,
    makeFilepath,
} from './util'
import {
    type KaisaiIds,
    RaceDetail,
    ResultData,
    HorseRecord,
} from './definition'

// load `.env` file -----------------------------------------------------------
// cf. https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
    require('dotenv').config()
}
// ----------------------------------------------------------------------------

const ENDPOINT = process.env.ENDPOINT

process.env.TZ = 'Asia/Tokyo'

// cf. http://var.blog.jp/archives/86671156.html
const parsed = parseArgs({
    options: {
        yyyymmdd: { type: 'string' },
    },
})

const eta = new Eta({
    autoEscape: false,
    views: path.join(__dirname, 'views'),
})

const main = async (dt?: string) => {
    // jra, nar をキーとした辞書になっている
    const yyyymmdd = dt || getTargetDate()
    console.log(`[main] target date is ${yyyymmdd}\n`)

    const kaisai = await getKaisaiList(yyyymmdd)
    console.log('[main] Kaisai list is below:\n')
    console.log(JSON.stringify(kaisai, null, '\t'))

    const races_jra = await parallelizedProcess(kaisai, 'jra')
    const races_nar = await parallelizedProcess(kaisai, 'nar')

    // すべての race_details を portal.ts に渡してポータルページを作る
    const races_all = races_jra.concat(races_nar)
    await constructPortal(yyyymmdd, races_all)

    return
}

const getTargetDate = (): string => {
    // 現在の日付を取得し、次の日へ変換
    // 本来は UTC だけど、js 実行までに env.TZ を指定すれば変更できる
    const dt = new Date()
    if (dt.getHours() < 12) {
        /* AM */
        // dt is Today
    } else {
        /* PM */
        // dt is Tommorow
        dt.setDate(dt.getDate() + 1)
    }

    return getFormattedDateString(dt)
}

const getFormattedDateString = (dt: Date) => {
    // 年、月、日を取得
    const year = dt.getFullYear()
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')

    // 'yyyymmdd' 形式の文字列を生成します
    return `${year}${month}${day}`
}

// 01. 現在の日付を元に、`/getKaisaiList` を叩いて race_id のリストを得る
const getKaisaiList = async (yyyymmdd: string): Promise<KaisaiIds> => {
    // fetch して得たJSONをそのまま返す
    const entrypoint = 'getKaisaiList'
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        dt: yyyymmdd, // string
        key: process.env.API_KEY || '', // string
    })
    const response = await fetch(`${url}?${query.toString()}`)
    const data: unknown = await response.json()

    if (isKaisaiIds(data)) {
        // `production` じゃない場合、race_id 末尾が 11 のものだけを対象とする
        if (process.env.NODE_ENV !== 'production') {
            Object.keys(data).forEach((key) => {
                if (key == 'jra' || key == 'nar') {
                    const values_in_not_prod = data[key].filter(
                        (race_id: string) => /11$/.test(race_id),
                    )
                    data[key] = values_in_not_prod
                }
            })
        }
        // place_code が 65 なら、帯広のばんえい競馬なので除外する
        Object.keys(data).forEach((key) => {
            if (key == 'jra' || key == 'nar') {
                const values_without_banei = data[key].filter(
                    // const place_code = race_id.slice(4, 6)
                    (race_id: string) => !/\w{4}65\w+/.test(race_id),
                )
                data[key] = values_without_banei
            }
        })
        // finally ...
        return data
    } else {
        throw new Error(
            '[getKaisaiList] Invalid value is returned from server.' +
                'Check that the vars `url` and `query` are set to the correct values.',
        )
    }
}

const parallelizedProcess = async (
    kaisai: KaisaiIds,
    org: 'jra' | 'nar',
): Promise<RaceDetail[]> => {
    const results = await Promise.allSettled(
        kaisai[org].map((race_id: string) =>
            fetchDataAndRenderMarkdown(race_id, org),
        ),
    )

    return results
        .map((res: PromiseSettledResult<RaceDetail>) => {
            res.status === 'fulfilled' ? res.value : false
            if (res.status === 'fulfilled') {
                return res.value
            } else {
                /* res.status === 'rejected' */
                console.error(res.reason)
                return false
            }
        })
        .filter(isRaceDetail)
}

const fetchDataAndRenderMarkdown = async (
    race_id: string,
    org: 'jra' | 'nar',
): Promise<RaceDetail> => {
    const race_detail = await getRaceDetail(race_id, org)
    await renderToMarkdown(race_detail)
    return race_detail
}

// 02. 得られた race_id をもとに、メタデータ情報を作成
const getRaceDetail = async (race_id: string, org: 'jra' | 'nar') => {
    const entrypoint = 'getRaceDetail'
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        race_id, // string
        org,
        key: process.env.API_KEY || '',
    })
    const response = await fetch(`${url}?${query.toString()}`)
    const data: unknown = await response.json()

    if (isRaceDetail(data)) {
        return data
    } else {
        throw new Error(
            '[getRaceDetail] Invalid value is returned from server.' +
                'Check that the vars `url` and `query` are set to the correct values.',
        )
    }
}

// 03. このオブジェクトをもとに、各 md ファイルに出力
const renderToMarkdown = async (race_detail: RaceDetail) => {
    // race_id, org, metadata, entries をもとに、md 記事を作成する
    // 野望：骨組みを渡して、Chat-GPT に執筆させる ←  あくまで野望なので、まず枠組みを完成させてから！
    // 現実的な案：過去データを取ってきて、統計情報の可視化（有利不利をわかりやすくする等）
    // race_detail があるので、df.query() にいい感じのリクエストができるはず
    // → そこから過去データは取れるのでは？
    // 新馬は無理としても、それ以外の馬なら競走成績が取得できる
    // 新馬も peds は得られるので、それをレーティングすることもできるはず
    // この辺の構想は、過去のブログ記事を回顧するべきか

    const { race_id, org, metadata, entries } = race_detail
    const { name: title } = metadata
    const { R, direction, distance, regulation, schedule, track, timestamp } =
        metadata
    const R_i = R.padStart(2, '0')
    const place = schedule.replace(/\d+回*/i, '').replace(/\d+(日目)*/i, '')
    const start_time = (timestamp.split(/\s/).pop() || '').slice(0, 5)
    const description = `発走時刻 ${start_time} ${track} ${direction} ${distance}m`

    const promised_records = await Promise.allSettled(
        entries
            .filter((entry) => entry.horse_id.match(/\w{10}/i))
            .map((entry) =>
                getRecordsFromPreviousResult(entry.horse_id, timestamp),
            ),
    )

    const records = promised_records
        .map((res) => {
            if (res.status === 'fulfilled') {
                return res.value
            } else {
                /* res.status === 'rejected' */
                console.error(res.reason)
                return false
            }
        })
        .filter(isHorseRecord)

    const props = {
        race_id,
        org,
        title: `${title}【R${R_i}】`,
        records,
        data: getChartData(records), // horse_id をキーとするオブジェクトを返す
        distance,
        description:
            typeof regulation === 'string' && regulation.length !== 0
                ? `${description} 〈${regulation}〉`
                : description,
        frontmatter: {
            page_id: race_id,
            page_title: `【R${R_i}】${title}【${place}】`,
            pagination_label: `【${place}R${R_i}】${title}`,
            sidebar_label: title,
            date: timestamp.split(/\s+/).shift(),
            keywords: [
                `${place}競馬`,
                `R${R_i}`,
                `${track}${direction}${distance}m`,
                regulation || '',
                'データ分析',
            ],
            description: `【R${R_i}】 ${description} 【${place}】`,
            thumbnail:
                'https://raw.githubusercontent.com/Ningensei848/A-gebahyo/main/static/social-card.png',
            slug: R_i,
        },
        entries,
        date_today: timestamp.split(/\s+/).shift(),
    }

    const rendered_text = await eta.renderAsync('./each_race/template', props)
    const place_code = race_id.slice(4, 6)
    const filepath = makeFilepath(race_id, timestamp, place_code)

    try {
        // tips: parent_dir が存在しないと、ファイルに書き込めない
        await mkdir(path.dirname(filepath), { recursive: true })
        await writeFile(filepath, rendered_text)

        // console.log('\n\n', rendered_text, '\n\n') // for debug
    } catch (err) {
        console.error('An unexpected error has occurred: ', err)
    }
}

const getRecordsFromPreviousResult = async (
    horse_id: string,
    timestamp: string,
): Promise<{ horse_id: string; results: ResultData[] }> => {
    const entrypoint = 'getHorseResult'
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        q: `horse_id == "${horse_id}" and timestamp < "${timestamp}"`,
        key: process.env.API_KEY || '',
    })
    const response = await fetch(`${url}?${query.toString()}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data } = await response.json()
    if (!Array.isArray(data)) {
        throw new Error(
            '[getRecordsFromPreviousResult] Invalid value is returned from server.' +
                'Check that the vars `url` and `query` are set to the correct values.' +
                `horse_id is ${horse_id}`,
        )
    } else {
        const results = data.filter(isResultData)

        results.sort(
            (a, b) =>
                // order by desc
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
        )

        return { horse_id, results }
    }
}

// horse_id をキーとするオブジェクトを返す
// 値の中身は、「オブジェクトの配列」
const getChartData = (
    records: HorseRecord[],
): { [key: string]: unknown[] } => {
    const key_and_value_list = records.map((record) => {
        const { horse_id, results } = record
        const data = results.map((result) => {
            const {
                weight,
                impost,
                timestamp,
                race_id,
                rank,
                rank_at_corner,
                waku,
            } = result
            return {
                name: timestamp.split(/\s+|T/).shift() || '',
                race_id,
                rank,
                rank_at_corner,
                waku,
                weight,
                impost_ratio:
                    isNumber(impost) && isNumber(weight)
                        ? ((impost / weight) * 100).toPrecision(3)
                        : null,
            }
        })

        data.sort(
            (a, b) =>
                // order by asc
                new Date(a.name).getTime() - new Date(b.name).getTime(),
        )
        return [horse_id, data]
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.fromEntries(key_and_value_list)
}

// finally ...
const getMainPromise = async () => {
    const { yyyymmdd } = parsed.values
    // `--date` が与えられている時、その引数だけで実行
    if (typeof yyyymmdd === 'string' && yyyymmdd.length !== 0) {
        await main(yyyymmdd)
        return
    }
    // `--date` が無いとき（つまり自動実行のとき）、金曜日であれば週末の分も取得する
    const today = new Date()
    console.log(`Day number is ${today.getDay()}`)
    if (today.getDay() === 5) {
        // today is Friday
        const saturday = new Date(new Date().setDate(today.getDate() + 1))
        const sunday = new Date(new Date().setDate(today.getDate() + 2))

        await main(getFormattedDateString(today))
        await main(getFormattedDateString(saturday))
        await main(getFormattedDateString(sunday))
    } else if (today.getDay() === 6) {
        // today is Saturday
        const sunday = new Date(new Date().setDate(today.getDate() + 1))

        await main(getFormattedDateString(today))
        await main(getFormattedDateString(sunday))
    } else if (today.getDay() === 0) {
        // today is Sunday
        if (today.getHours() < 16) {
            await main(getFormattedDateString(today))
        } else {
            // 16 時以降の場合は、月曜のレース情報を取得する
            await main()
        }
    } else {
        await main()
    }

    return
}
const promise = getMainPromise()

// Run a `promise`ed processes !
promise
    .then(() => {
        console.log('completed.')
    })
    .catch((error) => {
        console.error(error)
    })
