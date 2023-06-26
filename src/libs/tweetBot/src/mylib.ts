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
}

interface Row {
    timestamp: string
    race_id: string
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
    if (isObject_(arg) && 'metadata' in arg) {
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
}
