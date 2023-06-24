export interface KaisaiIds {
    jra: Array<string>
    nar: Array<string>
}

export interface RaceDetail {
    race_id: string
    org: 'jra' | 'nar'
    metadata: RaceMetadata
    entries: EntryData[]
}

export interface RaceMetadata {
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

export interface EntryData {
    barei: string
    gain: number
    horse_id: string
    horse_name: string
    impost: number
    jockey_id: string
    jockey_name: string
    ninki: string
    odds: string
    race_id: string
    timestamp: string
    trainer_id: string
    trainer_name: string
    umaban: string
    waku: string
    weight: number
}

export interface ResultData extends EntryData, RaceMetadata {
    rank: string
    time: number
    diff: string
    rank_at_corner: string
    max_speed: number
    owner_id: string
    owner_name: string
    bounty: number
}

export interface HorseRecord {
    horse_id: string
    results: ResultData[]
}
