import {
    type KaisaiIds,
    RaceDetail,
    ResultData,
    HorseRecord,
} from './definition'

export const makeFilepath = (
    race_id: string,
    timestamp: string,
    place = '',
): string => {
    const date = new Date(timestamp) // UTC
    const parent_dir = date.toLocaleDateString('ja-JP', {
        // convert to JST and format to `YYYY/mm/dd`
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })

    const target_dir = `${process.cwd()}/content/docs/${parent_dir}`

    return place.length === 0
        ? `${target_dir}/${race_id}.mdx`
        : `${target_dir}/${place}/${race_id}.mdx`
}

/**
 * User Defined Type Guard!
 */

export const isObject = (arg: unknown): arg is object => {
    return arg instanceof Object && !(arg instanceof Array) ? true : false
}

export const isNumber = (arg: unknown): arg is number => {
    return typeof arg === 'number' && isFinite(arg)
}

export const isKaisaiIds = (arg: unknown): arg is KaisaiIds => {
    if (isObject(arg) && 'jra' in arg && 'nar' in arg) {
        if (Array.isArray(arg.jra) && Array.isArray(arg.nar)) {
            return true
        }
    }
    return false
}

export const isRaceDetail = (arg: unknown): arg is RaceDetail => {
    // そもそもオブジェクトであるか判定
    if (!isObject(arg)) {
        return false
    }

    // 含まれていれば `RaceDetail` のはず
    if (
        'race_id' in arg &&
        'org' in arg &&
        'metadata' in arg &&
        'entries' in arg
    ) {
        // TODO: もうちょいちゃんとやる
        return true
    }
    return false
}

export const isResultData = (arg: unknown): arg is ResultData => {
    // if (!isRaceDetail(arg)) {
    //     return false
    // }

    if (
        isObject(arg) &&
        'rank' in arg &&
        'time' in arg &&
        'diff' in arg &&
        'rank_at_corner' in arg &&
        'max_speed' in arg &&
        'owner_id' in arg &&
        'owner_name' in arg &&
        'bounty' in arg
    ) {
        // TODO: もうちょいちゃんとやる
        return true
    }
    return false
}

export const isHorseRecord = (arg: unknown): arg is HorseRecord => {
    if (isObject(arg) && 'horse_id' in arg && 'results' in arg) {
        // TODO: もうちょいちゃんとやる
        return true
    }
    return false
}
