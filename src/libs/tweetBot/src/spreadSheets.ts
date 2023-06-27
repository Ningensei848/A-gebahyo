// spreadsheet --------------------------------------------------------------------------------------
const spreadSheet = SpreadsheetApp.getActiveSpreadsheet() //スクリプトに紐づいたSpreadsheetを取得(基本これを使う)
// const spreadSheet = SpreadsheetApp.openById(SHEET_ID); //IDから取得

const transpose = (arr: Array<unknown[]>): Array<unknown[]> => {
    // cf. https://gist.github.com/femto113/1784503
    return arr[0].map((_, c) => arr.map((r) => r[c]))
}

// 並び順をもとに取得
const getSheetByName_ = (name: string): GoogleAppsScript.Spreadsheet.Sheet => {
    const sheet = spreadSheet.getSheetByName(name)
    if (!sheet) {
        throw Error(
            '[getSheetByName] sheet name is invalid (may be null object)',
        )
    } else {
        return sheet
    }
}

// sheet を辞書に変換して取得する
const getDictFromSheet_ = (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    axis = 0,
): Record<string, unknown[]> => {
    if (!sheet) {
        throw Error('[getDictFromSheet] sheet is invalid (may be null object)')
    }
    // getDataRange() はすべての範囲を取得する（取得したいデータ以外を手入力してはダメ！）
    const nestedArray =
        axis == 0
            ? sheet.getDataRange().getValues()
            : transpose(sheet.getDataRange().getValues())
    const keys = nestedArray[0]
    const values =
        nestedArray.length > 1
            ? transpose(nestedArray.slice(1))
            : Array(keys.length).fill(null)
    const tableDict: Record<string, Array<unknown>> = {}
    for (let i = 0; i < keys.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        tableDict[keys[i]] = values[i] || []
    }
    return tableDict
}

// sheet から行（あるいは axis = 1 のとき 列） をオブジェクトの配列にして返す
const getAllRowsAsObject_ = (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    axis = 0,
): Array<{ [k: string]: unknown }> => {
    const tableDict: Record<string, Array<unknown>> = getDictFromSheet_(
        sheet,
        axis,
    )
    const size = Math.max(...Object.values(tableDict).map((arr) => arr.length))
    const rows = [...Array(size).keys()].map((_, idx) => {
        return Object.fromEntries(
            Object.keys(tableDict).map((key) => [key, tableDict[key][idx]]),
        )
    })
    return rows
}

// 対象シートのヘッダーを取得する
const getSheetHeader_ = (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    axis = 0,
): string[] => {
    if (!sheet) {
        throw Error('[getSheetHeader] sheet is invalid (may be null object)')
    }
    // (1,1) から (1, 最終列) までのセルを取得
    // getRange(row, column, numRows, numColumns)
    const range =
        axis == 0
            ? sheet.getRange(1, 1, 1, sheet.getLastColumn())
            : sheet.getRange(1, 1, sheet.getLastRow(), 1)
    const values = range.getValues()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return values[0]
}

// カラム名を指定して、その列の値の一覧を取得する
const getValuesByTitle_ = (
    sheet: GoogleAppsScript.Spreadsheet.Sheet,
    titleName: string,
    axis = 0,
): unknown[] => {
    const header = getSheetHeader_(sheet, axis)
    // getRange(row, column, numRows, numColumns)
    try {
        const values =
            axis == 0
                ? sheet
                      .getRange(
                          2,
                          header.findIndex((e) => e == titleName) + 1,
                          sheet.getLastRow() - 1,
                          1,
                      )
                      .getValues()
                      .flat()
                : sheet
                      .getRange(
                          header.findIndex((e) => e == titleName) + 1,
                          2,
                          1,
                          sheet.getLastColumn() - 1,
                      )
                      .getValues()
                      .flat()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return values
    } catch (e) {
        // loggingError(e as Error, 'getValuesByTitle')
        console.error(e)
        if (header.length < 1) {
            const msg = '[getValuesByTitle] Invalid header'
            // loggingError(new Error(msg), 'getValuesByTitle')
            throw new Error(msg)
        } else {
            return []
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MySheet {
    // export function foo() {}
    // function bar() {}  // this function can only be addressed from within the `Module` namespace
    export function _getSheetByName(arg: string) {
        return getSheetByName_(arg)
    }
    export function _getAllRowsAsObject(
        sheet: GoogleAppsScript.Spreadsheet.Sheet,
        axis = 0,
    ) {
        return getAllRowsAsObject_(sheet, axis)
    }
    export function _getValuesByTitle(
        sheet: GoogleAppsScript.Spreadsheet.Sheet,
        titleName: string,
        axis = 0,
    ) {
        return getValuesByTitle_(sheet, titleName, axis)
    }
    export function _getSheetHeader(
        sheet: GoogleAppsScript.Spreadsheet.Sheet,
        axis = 0,
    ): string[] {
        return getSheetHeader_(sheet, axis)
    }
}
