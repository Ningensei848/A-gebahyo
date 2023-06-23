import { Eta } from 'eta'
import * as path from 'path'
import { mkdir, writeFile } from 'fs/promises'

import { makeFilepath } from './util'

const eta = new Eta({ views: path.join(__dirname, 'views') })

// 04. 最終的に、オブジェクトのリストが得られるので、これを `portal.ts` に渡す
// 各ページではなく、それらをまとめたインデックスページを作る
const main = async (yyyymmdd: string, data: Array<RaceDetail>) => {
    // TODO: data.length が 0 なときにどうする？
    // your code here ...

    // else:

    const [yyyy, mm, dd] = [
        yyyymmdd.slice(0, 4), // year
        yyyymmdd.slice(4, 6), // month
        yyyymmdd.slice(6, 8), // day
    ]
    const dt = `${yyyy}-${mm}-${dd}`

    const title = `開催場所の一覧 (${yyyy}年${mm}月${dd}日)`

    const props = {
        title,
        date: dt,
        frontmatter: {
            page_title: title,
            pagination_label: title,
            // 一年ごとにサイトを切り替えるから、値の範囲は [0101, 1231] になるはず
            sidebar_position: 1250 - (Number(mm) * 100 + Number(dd)),
            sidebar_label: dd,
            date: dt,
            keywords: ['開催場所の一覧', '競馬'],
            thumbnail: 'https://raw.githubusercontent.com/Ningensei848/A-gebahyo/main/static/social-card.png',
        },
    }

    const rendered_text = await eta.renderAsync(
        './kaisai_portal/template',
        props,
    )
    const filepath = makeFilepath('index', dt)

    try {
        // tips: parent_dir が存在しないと、ファイルに書き込めない
        await mkdir(path.dirname(filepath), { recursive: true })
        await writeFile(filepath, rendered_text)

        // console.log('\n\n', rendered_text, '\n\n') // for debug
    } catch (err) {
        console.error('An unexpected error has occurred: ', err)
    }

    // 開催地ごとの portal ページを作る
    const places = retrieveKaisaiPlace(data)
    await Promise.allSettled(
        places.map((place) => renderPortalForeach(yyyymmdd, place)),
    )
}

const retrieveKaisaiPlace = (
    data: Array<RaceDetail>,
): Array<{ [key: string]: string }> => {
    const place_list = data.map((race_detail) => {
        const { race_id, metadata } = race_detail
        const place_code = race_id.slice(4, 6)
        const place = metadata.schedule
            .replace(/\d+回*/i, '')
            .replace(/\d+(日目)*/i, '')

        return { place, place_code }
    })

    return Array.from(new Set(place_list)) // unique()
}

const renderPortalForeach = async (
    yyyymmdd: string,
    kaisai: { [key: string]: string },
) => {
    const [yyyy, mm, dd] = [
        yyyymmdd.slice(0, 4), // year
        yyyymmdd.slice(4, 6), // month
        yyyymmdd.slice(6, 8), // day
    ]
    const dt = `${yyyy}-${mm}-${dd}`

    const { place, place_code } = kaisai

    const title = `開催レース`

    const props = {
        title: `${title} 【${place}】`,
        date: dt,
        frontmatter: {
            page_title: `【${place}】${title}の一覧`,
            pagination_label: `【${place}】${title}の一覧`,
            date: dt,
            sidebar_label: place, // additional
            keywords: ['レース一覧', place, '競馬'],
            thumbnail: 'https://raw.githubusercontent.com/Ningensei848/A-gebahyo/main/static/social-card.png',
        },
    }

    const rendered_text = await eta.renderAsync(
        './kaisai_portal/template',
        props,
    )
    const filepath = makeFilepath('index', dt, place_code)

    try {
        // tips: parent_dir が存在しないと、ファイルに書き込めない
        await mkdir(path.dirname(filepath), { recursive: true })
        await writeFile(filepath, rendered_text)
    } catch (err) {
        console.error('An unexpected error has occurred: ', err)
    }
}

export default main
