// spreadsheet からデータを読み出してツイートする
// 1. spreadsheet からデータを読み出す
// 2. ツイートする

import { Util } from './mylib'

// - startOAuthを実行して認証を実行する
// 参照元記事
// cf. https://officeforest.org/wp/2023/01/14/google-apps-scriptからtwitter-apiをoauth2-0認証で使う/

const isObject = Util._isObject

//認証用の各種変数
const props = PropertiesService.getScriptProperties()
const client_id = props.getProperty('CLIENT_ID') || ''
const client_secret = props.getProperty('CLIENT_SECRET') || ''
const whitespace = ''.padEnd(1)
const scope = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access',
].join(whitespace)
const authurl = 'https://twitter.com/i/oauth2/authorize'
const tokenurl = 'https://api.twitter.com/2/oauth2/token'

export const startOAuth = () => {
    //UIを取得する
    const ui = SpreadsheetApp.getUi()

    //認証済みかチェックする
    const service = checkOAuth_()
    if (!service.hasAccess()) {
        //認証画面を出力
        const output = HtmlService.createHtmlOutputFromFile('template')
            .setHeight(450)
            .setWidth(500)
            .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        ui.showModalDialog(output, 'OAuth2.0認証')
    } else {
        //認証済みなので終了する
        ui.alert('すでに認証済みです。')
    }

    return
}

/* FAQ: アクセストークンの期限について
 > アクセストークンは明示的に期限切れとなることはありません。
 > ユーザーがTwitterのアカウント設定でアプリケーションを明示的に取り消すか、
 > Twitterがアプリケーションを停止すると、アクセストークンは無効となります。
 cf. https://developer.twitter.com/ja/docs/authentication/faq
*/

//アクセストークンURLを含んだHTMLを返す関数
export const getOAuthPage = () => {
    const service = checkOAuth_()
    const authorizationUrl = service.getAuthorizationUrl()

    console.log(authorizationUrl)

    const html =
        "<center><b><a href='" +
        authorizationUrl +
        "' target='_blank' onclick='closeMe();'>アクセス承認</a></b></center>"
    return html
}

//認証チェック
const checkOAuth_ = (): GoogleAppsScriptOAuth2.OAuth2Service => {
    pkceChallengeVerifier()
    const prop = PropertiesService.getUserProperties()

    return OAuth2.createService('twitter')
        .setAuthorizationBaseUrl(authurl)
        .setTokenUrl(
            tokenurl + '?code_verifier=' + prop.getProperty('code_verifier'),
        )
        .setClientId(client_id)
        .setClientSecret(client_secret)
        .setScope(scope)
        .setCallbackFunction('authCallback') //認証を受けたら受け取る関数を指定する
        .setPropertyStore(PropertiesService.getScriptProperties()) //スクリプトプロパティに保存する
        .setParam('response_type', 'code')
        .setParam('code_challenge_method', 'S256')
        .setParam('code_challenge', prop.getProperty('code_challenge'))
        .setTokenHeaders({
            Authorization:
                'Basic ' +
                Utilities.base64Encode(client_id + ':' + client_secret),
            'Content-Type': 'application/x-www-form-urlencoded',
        })
}

//認証コールバック
export const authCallback = (request: unknown) => {
    const service = checkOAuth_()
    const isAuthorized = isObject(request)
        ? service.handleCallback(request)
        : false
    if (isAuthorized) {
        return HtmlService.createHtmlOutput(
            '認証に成功しました。ページを閉じてください。',
        )
    } else {
        return HtmlService.createHtmlOutput('認証に失敗しました。')
    }
}

//ログアウト
export const reset = () => {
    checkOAuth_().reset()
    SpreadsheetApp.getUi().alert('ログアウトしました。')
    return
}

const pkceChallengeVerifier = () => {
    const prop = PropertiesService.getUserProperties()
    if (!prop.getProperty('code_verifier')) {
        let verifier = ''
        const possible =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

        for (let i = 0; i < 128; i++) {
            verifier += possible.charAt(
                Math.floor(Math.random() * possible.length),
            )
        }

        const sha256Hash = Utilities.computeDigest(
            Utilities.DigestAlgorithm.SHA_256,
            verifier,
        )

        const challenge = Utilities.base64Encode(sha256Hash)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
        prop.setProperty('code_verifier', verifier)
        prop.setProperty('code_challenge', challenge)
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MyOAuth2 {
    export function _checkOAuth(): GoogleAppsScriptOAuth2.OAuth2Service {
        return checkOAuth_()
    }
}
