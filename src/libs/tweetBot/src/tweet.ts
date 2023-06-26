// POST /2/tweets | Docs | Twitter Developer Platform
// cf. https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets

import { Util } from './mylib'
import { checkOAuth } from './oauth2'
import { MySheet } from './spreadSheets'
// import { getSheetByName, getValuesByTitle } from './spreadSheets'

// Workaround; on Googlg App Script, `import/export` does not work well ...
// cf. https://github.com/google/clasp/blob/master/docs/typescript.md#the-namespace-statement-workaround
const getSheetByName = MySheet._getSheetByName
const getValuesByTitle = MySheet._getValuesByTitle
const getAllRowsAsObject = MySheet._getAllRowsAsObject
const isObject = Util._isObject
const isMetadata = Util._isMetadata
const isRowObject = Util._isRowObject
const isRows = Util._isRows

const tweet_endpoint = 'https://api.twitter.com/2/tweets'

const getOrganization = (race_id: string): string => {
    const place_code = parseInt(race_id.slice(4, 6), 10)
    // パースできない、あるいは会場コードが 10 より大きい場合、NAR (または海外)である
    if (isNaN(place_code) || place_code > 10) {
        return 'nar'
    } else {
        return 'jra'
    }
}

const getTweetText = (race_id: string) => {
    const props = PropertiesService.getScriptProperties()
    const api_key = props.getProperty('API_KEY') || ''
    const endpoint = props.getProperty('ENDPOINT') || ''
    const entry_point = props.getProperty('ENTRY_POINT') || ''
    // 不便だから API の方を更新したいね
    const params = { race_id, org: getOrganization(race_id), key: api_key }

    const response = UrlFetchApp.fetch(
        `${endpoint}/${entry_point}?${params.toString()}`,
        {
            method: 'get',
            muteHttpExceptions: true,
        },
    )
    // リクエスト結果を取得する
    const result: unknown = JSON.parse(response.getContentText())

    if (!isMetadata(result)) {
        throw Error('[getTweetText] `result` object is invalid!')
    }

    // TODO: ツイート内容を構築する
    const { metadata } = result

    return 'sample text'
}

// ツイートする
const tweet = (msg: string) => {
    //トークン確認
    const service = checkOAuth()

    if (!service.hasAccess()) {
        throw Error('認証が実行されていません')
    } else {
        //message本文
        const message = {
            text: msg,
        }

        //リクエストヘッダ
        const headers = {
            Authorization: 'Bearer ' + service.getAccessToken(),
        }

        //リクエスト実行
        // const response = UrlFetchApp.fetch(tweet_endpoint, {
        //     method: 'post',
        //     headers,
        //     muteHttpExceptions: true,
        //     payload: JSON.stringify(message),
        //     contentType: 'application/json',
        // })

        //リクエスト結果を取得する
        // const result: unknown = JSON.parse(response.getContentText())

        /* result is ...
        {
            "data": {
                "id": "1445880548472328192",
                "text": "Are you excited for the weekend?"
            }
        }
        */

        //リクエスト結果を表示
        // console.log(JSON.stringify(result, null, 2))
    }
    return
}

export const main = () => {
    const today = new Date()
    const sheet = getSheetByName('race_list')

    const rows = getAllRowsAsObject(sheet).filter((r) => isRowObject(r))
    if (!isRows(rows)) {
        throw Error('[main] `row` object is invalid!')
    }

    for (const row of rows) {
        const timestamp = new Date(row.timestamp)
        // 出走時刻を過ぎているか、すでに投稿済みならスキップ
        if (today > timestamp || row.is_posted) {
            continue
        } else {
            // 実行時刻がレース出走時刻を過ぎていない、かつ記事投稿もされていないとき：
            // 時刻の差分を求めて、t 時間以下（つまり t 時間前）だったらツイートする
            // （スクリプトは１０分に一度実行されるので、実行されるたび差は縮まる）
            const delta_ms = timestamp.getTime() - today.getTime()
            const delta = Math.floor((delta_ms / 60) * 60 * 1000) // x1000 ... 秒, x60 ... 分, x60 ... 時間
            if (delta < 1) {
                const text = getTweetText(row.race_id)
                tweet(text)
                // TODO: is_posted を true に反転させる処理
                // soemthing ...
            }
            break
        }
    }
    Logger.log('completed.')
}
