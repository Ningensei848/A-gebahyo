// POST /2/tweets | Docs | Twitter Developer Platform
// cf. https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets

import { MyOAuth2 } from './oauth2'
import { MySheet } from './spreadSheets'
import { Util } from './mylib'

// Workaround; on Googlg App Script, `import/export` does not work well ...
// cf. https://github.com/google/clasp/blob/master/docs/typescript.md#the-namespace-statement-workaround
const checkOAuth = MyOAuth2._checkOAuth
const getSheetByName = MySheet._getSheetByName
const getSheetHeader = MySheet._getSheetHeader
const getAllRowsAsObject = MySheet._getAllRowsAsObject
const isRows = Util._isRows
const isMetadata = Util._isMetadata
const isRowObject = Util._isRowObject
const notifyToLINE = Util._notifyToLINE
const getQueryString = Util._getQueryString

const tweet_endpoint = 'https://api.twitter.com/2/tweets'

const getTweetText = (race_id: string) => {
    const props = PropertiesService.getScriptProperties()
    const api_key = props.getProperty('API_KEY') || ''
    const endpoint = props.getProperty('ENDPOINT') || ''
    const entry_point = props.getProperty('ENTRY_POINT') || ''
    const params = getQueryString({ race_id, key: api_key })

    const response = UrlFetchApp.fetch(
        `${endpoint}/${entry_point}?${params}`,
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

    const { metadata, org } = result
    const { name: title } = metadata
    const {
        R,
        schedule,
        track,
        direction,
        distance,
        weather,
        going,
        timestamp,
    } = metadata
    const month = new Date(timestamp).getMonth() + 1
    const R_i = R.padStart(2, '0')
    const place = schedule.replace(/\d+回*/i, '').replace(/\d+(日目)*/i, '')
    const path = [
        race_id.slice(0, 4),
        /jra/i.test(org)
            ? month.toString().padStart(2, '0')
            : race_id.slice(6, 8),
        race_id.slice(8, 10),
        race_id.slice(4, 6),
        race_id.slice(10, 12),
    ].join('/')
    const url = /jra/i.test(org)
        ? `https://ningensei848.github.io/A-gebahyo/${path}`
        : `https://a-gebahyo.pages.dev/${path}`
    const hashtag = '上馬評で下す'

    const text = `
        【${place}R${R_i}】 ${title}
        ${track || ''} ${direction || ''} ${distance}m
        天候：${weather || '-'} 馬場：${going || '-'}

        #${hashtag} #A_gebahyo

        ${url}
    `
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim()

    return text
}

const postTweet = (msg: string) => {
    const service = checkOAuth()

    if (!service.hasAccess()) {
        throw Error('認証が実行されていません')
    } else {
        const message = {
            text: msg,
        }

        const headers = {
            Authorization: 'Bearer ' + service.getAccessToken(),
        }

        const response = UrlFetchApp.fetch(tweet_endpoint, {
            method: 'post',
            headers,
            // muteHttpExceptions: true,
            payload: JSON.stringify(message),
            contentType: 'application/json',
        })

        const result: unknown = JSON.parse(response.getContentText())

        /* result is ...
        {
            "data": {
                "id": "1445880548472328192",
                "text": "Are you excited for the weekend?"
            }
        }
        */

        Logger.log(JSON.stringify(result, null, 2))
    }
    return
}

const main = () => {
    const today = new Date()
    const sheet = getSheetByName('race_list')
    const header = getSheetHeader(sheet)

    const rows = getAllRowsAsObject(sheet).filter((r) => isRowObject(r))
    if (!isRows(rows)) {
        throw Error('[main] `row` object is invalid!')
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const timestamp = new Date(row.timestamp)
        // 出走時刻を過ぎているか、すでに投稿済みならスキップ
        if (today > timestamp || row.is_posted) {
            continue
        } else {
            // 実行時刻がレース出走時刻を過ぎていない、かつ記事投稿もされていないとき：
            // 時刻の差分を求めて、t 時間以下（つまり t 時間前）だったらツイートする
            // （スクリプトは１０分に一度実行されるので、実行されるたび差は縮まる）
            const delta_ms = timestamp.getTime() - today.getTime()
            const delta = Math.floor(delta_ms / (60 * 60 * 1000)) // x1000 ... 秒, x60 ... 分, x60 ... 時間
            if (delta < 1) {
                const text = getTweetText(row.race_id.toString())

                // Fire !
                postTweet(text)

                // is_posted を true に反転させる -----------------------------------
                // 0 ではなく 1 からのカウント & ヘッダー行を考慮して
                // "+1 * 2" したものが index になる
                // 1. 更新対象の Range を指定
                const range = sheet.getRange(i + 2, 1, 1, header.length)
                // 2. value を用意
                const value = [row.timestamp, row.race_id, true]
                // 3. range オブジェクトにセットする
                range.setValues([value])
                // -----------------------------------------------------------
            }
            // finally ...
            break
        }
    }
    Logger.log('completed.')
}

export const trigger = () => {
    try {
        main()
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error(e.message)
            // 失敗したらLINE NOTIFY に通知させるようにしたい→OAuthが期限切れとかでも木づけるはず
            const msg = `[A-gebahyo TweetBOT] エラーが発生しました
                正常にツイートが送信できていないかもしれません

                以下の URL から詳細を確認してください：
                https://script.google.com/home

                エラー内容は以下の通りです：
                ${e.name}
                ==> ${e.message}

                ${e.stack || ''}
            `
                .split('\n')
                .map((line) => line.trim())
                .join('\n')
                .trim()
            // finally ...
            notifyToLINE(msg)
        }
    }
}
