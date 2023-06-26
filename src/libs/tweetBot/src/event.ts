// スプレッドシートを開いた際に実行される関数
// [メニュー] 項目を定義する
export const onOpen = () => {
    SpreadsheetApp.getUi()
        .createMenu('[管理者メニュー]')
        .addItem('認証を開始', 'startOAuth')
        .addSeparator()
        .addItem('ログアウト', 'reset')
        .addToUi()
}
