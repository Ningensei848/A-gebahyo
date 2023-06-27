import { sheets as getSheets, auth } from '@googleapis/sheets'
import { isMetadata_ as isMetadata } from './mylib'

// load `.env` file -----------------------------------------------------------
// cf. https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    require('dotenv').config()
}
// ----------------------------------------------------------------------------

const API_KEY = process.env.API_KEY || ''
const ENDPOINT = process.env.ENDPOINT || ''
const ENTRY_POINT = process.env.ENTRY_POINT || ''

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const SHEET_ID = process.env.SPREADSHEET_ID || ''
const SHEET_NAME = 'race_list'

type Row = string | number | boolean

interface KaisaiIds {
    jra: Array<string>
    nar: Array<string>
}

const main = async () => {
    const authClient = await auth.getClient({
        scopes: SCOPES,
    })
    const sheets = getSheets({ version: 'v4', auth: authClient })

    const request = {
        // cf. https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
        spreadsheetId: SHEET_ID, // The ID of the spreadsheet to retrieve data from.
        range: SHEET_NAME, // The A1 notation of the values to retrieve.
        valueInputOption: 'USER_ENTERED',
        resource: {
            majorDimension: 'ROWS',
            // TODO: values の内容を getKaisaiList から得る
            // ネストされた配列を返せばいい
            values: await getValuesFromKaisaiList(),
        },
        auth: authClient,
    }

    // Update
    await sheets.spreadsheets.values.update(request)

    // finally ...
    return
}

const getValuesFromKaisaiList = async (): Promise<Array<Row[]>> => {
    const today = new Date()
    const yyyymmdd = getFormattedDateString(today)
    const races = await getKaisaiList(yyyymmdd)
    const races_all = getFilteredRaces(races.jra.concat(races.nar))

    const promised_list = await Promise.allSettled(
        races_all.map((race_id: string) => getRowData(race_id)),
    )

    const header = ['timestamp', 'race_id', 'is_posted']
    const rows = promised_list
        .map((res: PromiseSettledResult<Row[]>) => {
            res.status === 'fulfilled' ? res.value : false
            if (res.status === 'fulfilled') {
                return res.value
            } else {
                /* res.status === 'rejected' */
                console.error(res.reason)
                return []
            }
        })
        .filter((row) => row.length > 2)

    // timestamp で sort する
    const rows_sorted = rows.sort((a, b): number => {
        if (typeof a[0] !== 'string' || typeof b[0] !== 'string') {
            return -1
        }
        // 文字列を Date 型に変換して比較
        const [t1, t2] = [new Date(a[0]), new Date(b[0])]
        return t1 < t2 ? -1 : 1
    })

    return [header, ...rows_sorted]
}

const getFormattedDateString = (dt: Date) => {
    // 年、月、日を取得
    const year = dt.getFullYear()
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')

    // 'yyyymmdd' 形式の文字列を生成
    return `${year}${month}${day}`
}

// 現在の日付を元に、`/getKaisaiList` を叩いて race_id のリストを得る
const getKaisaiList = async (yyyymmdd: string): Promise<KaisaiIds> => {
    // fetch して得たJSONをそのまま返す
    const entrypoint = 'getKaisaiList'
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        dt: yyyymmdd, // string
        key: API_KEY, // string
    })
    const response = await fetch(`${url}?${query.toString()}`)
    const data: unknown = await response.json()

    if (isKaisaiIds(data)) {
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

const getFilteredRaces = (race_list: string[]): string[] => {
    // Twitter の Rate Limit が一日あたり 50 件までなので、
    // 50 件以下になるまで、1 ~ 12 R を削っていく
    let filtered = [...race_list]

    if (race_list.length > 50) {
        for (let i = 1; i < 12; i++) {
            // i 番目のレース行を削除する
            filtered = removeExtraRaces(filtered, i)
            if (filtered.length > 50) {
                continue
            } else {
                break
            }
        }
    }
    // finally ...
    return filtered
}

const getRowData = async (race_id: string): Promise<Array<Row>> => {
    const entrypoint = ENTRY_POINT
    const url = `${ENDPOINT}/${entrypoint}`
    const query = new URLSearchParams({
        race_id,
        key: API_KEY, // string
    })
    const response = await fetch(`${url}?${query.toString()}`)
    const data: unknown = await response.json()

    if (isMetadata(data)) {
        const { metadata } = data
        const { timestamp } = metadata
        return [timestamp, race_id, false]
    } else {
        return []
    }
}

const removeExtraRaces = (race_id_list: string[], num: number): string[] => {
    const n = num.toString().padStart(2, '0')
    const regexp = new RegExp(`${n}$`)

    // 正規表現に一致した race_id は返り値に含めない
    return race_id_list.filter((race_id) => !regexp.test(race_id))
}

const isObject = (arg: unknown): arg is object => {
    return arg instanceof Object && !(arg instanceof Array) ? true : false
}

const isKaisaiIds = (arg: unknown): arg is KaisaiIds => {
    if (isObject(arg) && 'jra' in arg && 'nar' in arg) {
        if (Array.isArray(arg.jra) && Array.isArray(arg.nar)) {
            return true
        }
    }
    return false
}

const promise = main()

// Run a `promise`ed processes !
promise
    .then(() => {
        console.log('completed.')
    })
    .catch((error) => {
        console.error(error)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw Error(error)
    })
