interface RaceMetadata {
    R:
        | '01'
        | '02'
        | '03'
        | '04'
        | '05'
        | '06'
        | '07'
        | '08'
        | '09'
        | '10'
        | '11'
        | '12'
    course_code: string
    direction: string | null // TODO: ばんえい競馬も混ざるので、より正規化を目指すべき
    distance: number
    going: '良' | '稍重' | '重' | '不良' | '' // TODO: 空白要素を含まないようにしたい
    kaisai_days: string
    kaisai_times: string
    name: string
    race_id: string
    regulation: string
    schedule: string
    timestamp: string
    track: string | null // TODO: ばんえい競馬も混ざるので、より正規化を目指すべき
    weather: string
}

interface Metadata {
    metadata: RaceMetadata
    org: 'jra' | 'nar'
}

interface Row {
    timestamp: string
    race_id: string | number
    is_posted: boolean
}

// const isString = (arg: unknown): arg is string => {
//     if (typeof arg === 'string') {
//         return true
//     } else {
//         return false
//     }
// }

const isObject_ = (arg: unknown): arg is object => {
    return arg instanceof Object && !(arg instanceof Array) ? true : false
}

const isMetadata_ = (arg: unknown): arg is Metadata => {
    if (isObject_(arg) && 'metadata' in arg && 'org' in arg) {
        return true
    }

    return false
}

const isRowObject_ = (arg: unknown): arg is Row => {
    if (
        isObject_(arg) &&
        'timestamp' in arg &&
        'race_id' in arg &&
        'is_posted' in arg
    ) {
        return true
    } else {
        return false
    }
}

const isRows_ = (arg: unknown): arg is Array<Row> => {
    if (!Array.isArray(arg)) {
        return false
    }
    const pre = arg.length
    const pos = arg.filter((a) => isRowObject_(a)).length
    return pre === pos
}

const getQueryString_ = (obj: Record<string, unknown>, encode = false) => {
    // :param encode use encodeURIComponent defalut:false
    return Object.keys(obj)
        .filter((key) => Boolean(obj[key]))
        .map((key) => {
            if (encode) {
                return (
                    key +
                    '=' +
                    encodeURIComponent(obj[key] as string | number | boolean)
                )
            } else {
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                return key + '=' + obj[key]
            }
        })
        .join('&')
}

// LINE_NOTIFY_TOKEN = os.environ.get("LINE_NOTIFY_TOKEN", None)

// def Notify2LINE(message, *args):
//     # 諸々の設定
//     line_notify_api = "https://notify-api.line.me/api/notify"
//     headers = {"Authorization": "Bearer " + LINE_NOTIFY_TOKEN}

//     # メッセージ
//     payload = {"message": message}

//     # 画像を含むか否か
//     if len(args) == 0:
//         requests.post(line_notify_api, data=payload, headers=headers)
//     else:
//         # 画像
//         files = {"imageFile": open(args[0], "rb")}
//         requests.post(line_notify_api, data=payload, headers=headers, files=files)

const notifyToLINE_ = (msg: string) => {
    const line_notify_endpoint = 'https://notify-api.line.me/api/notify'
    const props = PropertiesService.getScriptProperties()
    const line_notify_token = props.getProperty('LINE_NOTIFY_TOKEN') || ''

    const headers = { Authorization: 'Bearer ' + line_notify_token }
    const message = { message: msg }

    const response = UrlFetchApp.fetch(line_notify_endpoint, {
        method: 'post',
        headers,
        muteHttpExceptions: true,
        payload: JSON.stringify(message),
        contentType: 'application/json',
    })

    const result: unknown = JSON.parse(response.getContentText())
    Logger.log(JSON.stringify(result, null, 2))

    return
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Util {
    export function _isObject(arg: unknown): arg is object {
        return isObject_(arg)
    }
    export function _isMetadata(arg: unknown): arg is Metadata {
        return isMetadata_(arg)
    }
    export function _isRowObject(arg: unknown): arg is Row {
        return isRowObject_(arg)
    }
    export function _isRows(arg: unknown): arg is Array<Row> {
        return isRows_(arg)
    }
    export function _getQueryString(
        obj: Record<string, unknown>,
        encode = false,
    ): string {
        return getQueryString_(obj, encode)
    }
    export function _notifyToLINE(msg: string) {
        return notifyToLINE_(msg)
    }
}
