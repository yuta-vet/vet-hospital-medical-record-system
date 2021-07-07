/*!-----------------------------------------------------------------------------
 * 動物病院　カルテシステム　Lucky 
 * v1.0.0 - built 2021-01-30
 * Licensed under the MIT License.
 * Copyright (c) 2021 Yuta Hosoi https://meknowledge.jpn.org/
 * See LICENSE.md and README.md
* --------------------------------------------------------------------------*/

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { readdirSync, existsSync, readFileSync, readFile, writeFile, mkdirSync, appendFileSync, openSync, writeSync, writeFileSync, copyFileSync } = require('fs')
const iconv = require('iconv-lite')
// const{homedir} = require("os") // compiling for mac app

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//　データベースの初期パスとして空を入れておく。あとで判定に使う。
database = ""

// ページが読み込まれたときのアクション
// render側では、診療日の入力をしている
// main process側では、config.txtファイル内からデータベースのパスを入手
ipcMain.on("onload-action", (event, arg) => {

  if (existsSync("config.txt")) { // config.txtファイルが存在する場合

    let text = readFileSync("config.txt");
    database = text.toString()
    console.log(`the path that config.txt indicates : ${text}`)

    if (text.length !== 0) {　// config.txtにパスが書かれている場合
      console.log("path was found in config.txt")
      event.reply("onload-action-reply", "load-success")
    } else {　// config.txtにパスが書かれていない場合
      console.log("path was not found in config.txt")
    }

  } else {　// config.txtファイルが存在しない場合
    writeFileSync("config.txt", "")  //空のファイルを書き出す
    console.log("Created config.txt")
  }

});

/* compiling for mac app
config_place_for_mac = path.join(homedir(),"Library","Application Support","vet-medical-records","config.txt") //mac専用

// ページが読み込まれたときのアクション
// render側では、診療日の入力をしている
// main process側では、config.txtファイル内からデータベースのパスを入手
ipcMain.on("onload-action", (event, arg) => {

  if (existsSync(config_place_for_mac)) { // config.txtファイルが存在する場合

    let text = readFileSync(config_place_for_mac);
    database = text.toString()
    console.log(`the path that config.txt indicates : ${text}`)

    if (text.length !== 0) {　// config.txtにパスが書かれている場合
      console.log("path was found in config.txt")
      event.reply("onload-action-reply", "load-success")
    } else {　// config.txtにパスが書かれていない場合
      console.log("path was not found in config.txt")
    }

  } else {　// config.txtファイルが存在しない場合
    writeFileSync(config_place_for_mac, "")  //空のファイルを書き出す
    console.log("Created config.txt")
  }

});
*/

// データベース接続ボタンを押されたときのアクション
//　directoryを開くダイアログを開き、directoryを選択。
//  そのパスをconfig.txtに書き込む。そして、そのパスをrendererに返事する。
ipcMain.on("database", (event, arg) => {

  let database_list = dialog.showOpenDialogSync({
    properties: ['openDirectory']
  });

  if (typeof database_list !== 'undefined') { //cansel押したときは実行しない

    database = database_list[0]

    writeFile("config.txt", database, function (err) {
      if (err) {
        throw err;
      }
    });

    event.reply("database-reply", database)

  }

});

/* compiling for mac app
// データベース接続ボタンを押されたときのアクション
//　directoryを開くダイアログを開き、directoryを選択。
//  そのパスをconfig.txtに書き込む。そして、そのパスをrendererに返事する。
ipcMain.on("database", (event, arg) => {

  let database_list = dialog.showOpenDialogSync({
    properties: ['openDirectory']
  });

  if (typeof database_list !== 'undefined') { //cansel押したときは実行しない

    database = database_list[0]

    writeFile(config_place_for_mac, database, function (err) {
      if (err) {
        throw err;
      }
    });

    event.reply("database-reply", database)

  }

});
*/


// web作成データを取り込みボタンを押したときのアクション
// データベースが接続されていることが前提
// importファイルから、患者番号を取り出し
// 患者番号と合致するフォルダが存在するか確認
// 条件：合致するフォルダが存在する
//      条件：前回レコードの診察日と同じ→　データを取り込み最終行だけ修正
//      条件：前回レコードの診察日と違う→　データに追記
// 条件：合致するフォルダが存在しない→　フォルダ作成し、csv書き込み
ipcMain.on("import", (event, arg) => {

  if (database === "") {  // データベースと接続しているか。いないなら、エラーメッセージを表示して終了。
    dialog.showMessageBox({
      message: "データベースと接続してください",
      type: "warning"
    })

  } else { // importファイルから、患者番号を取り出し

    // importするファイルを選択するダイアログを表示する。取得したパスをimported_fileに代入する
    let imported_file = dialog.showOpenDialogSync({
      filters: [
        { name: 'csv', extensions: ['csv'] }],
      properties: ['openFile', 'multiSelections']
    });

    

    if (typeof imported_file !== 'undefined') {

      imported_file = imported_file[0]

      //  上記のcsvを読み込む
      let data_imported = readFileSync(imported_file)
      let buf_imported = new Buffer.from(data_imported, 'binary');         //　バイナリバッファを一時的に作成する
      let csv_content_imported = iconv.decode(buf_imported, "utf-8");  //　作成したバッファを使い、iconv-liteでShift-jisからutf8に変換。

      // csvのデータを取り出す
      let last_row_imported = csv_content_imported.split(`\r\n`)[1].split(",")
      let kanjyabango_imported = last_row_imported[0]                    //　患者番号を入手

      let target_folder_path = database　//　データベースのパスを変数に代入

      //データベース内のフォルダのリストを入手。
      const getDirectories = source =>
        readdirSync(source, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)

      //フォルダ内のファイルリストを入手
      const getFiles = source =>
        readdirSync(source, { withFileTypes: true })
          .map(dirent => dirent.name)

      let folders = getDirectories(target_folder_path)
      let target_folder_index = folders.indexOf(kanjyabango_imported) //フォルダのリストの中から、患者番号と合うフォルダのインデックスを入手

      if (target_folder_index !== -1) { //  条件判断：以前のファイルが存在する場合には、importしたファイルの内容を既存のcsvに追加

        let target_patient_folder = path.join(target_folder_path, folders[target_folder_index]) // フォルダ名を、フルパスに変換する
        let file_list = getFiles(target_patient_folder)  // フォルダ内のファイル名のリストを入手
        let file_list_full = file_list.map((item) => {   // ファイル名のリストをフルパスにする
          return path.join(target_patient_folder, item)
        });

        // csvファイルのフルパスを入手する
        const extention_list = file_list_full.map((item) => { return path.extname(item) })
        const target_file_index = extention_list.indexOf(".csv")
        const csv_filepath = file_list_full[target_file_index]

        //  上記のcsvを読み込み、最終レコードの診療日が現在書き込もうとしている診療日と同じかどうか判断する
        let data = readFileSync(csv_filepath)
        let buf = new Buffer.from(data, 'binary');         //　バイナリバッファを一時的に作成する
        let csv_content = iconv.decode(buf, "Shift_JIS");  //　作成したバッファを使い、iconv-liteでShift-jisからutf8に変換。
        let last_row = csv_content.split(`\r\n`).slice(-2, -1)[0].split(",")
        let ex_shinryobi = last_row[11]                 //　最終レコードの診療日を入手する

        if (ex_shinryobi === last_row_imported[11]) { // 条件判断　最終レコードの診療日と、書き込もうとしている診療日が同日の場合

          // 最終レコードを削除し、最終レコードに現在書き込み中の内容を付け加えて上書き保存する

          // 最終レコードと、現在書き込み中の内容を組み合わせる
          const last_row_modified = `\r\n${last_row[0]},${last_row[1]},${last_row[2]},${last_row[3]},${last_row[4]},${last_row[5]},${last_row[6]},${last_row[7]},${last_row[8]},${last_row[9]},${last_row[10]},${last_row[11]},${last_row[12]};${last_row_imported[12]},${last_row[13]};${last_row_imported[13]},${last_row[14]};${last_row_imported[14]},${last_row[15]};${last_row_imported[15]},${last_row[16]},${last_row_imported[17]}\r\n`
          let buf2 = iconv.encode(last_row_modified, "utf-8") // 日本語をUTF8にエンコード

          // 既存のレコードから、最終レコードを削除する
          let csv_content_without_lastrow = csv_content.split(`\r\n`).slice(0, -2)　// csvをリストにして、csvの最終列を削除
          csv_content_without_lastrow = csv_content_without_lastrow.join(`\r\n`)　// リストからcsvのフォーマットに戻す

          // 既存のレコードから最終レコードを削除したものに、新しく作ったレコードを付け加える
          let csv_content_concat = csv_content_without_lastrow + buf2

          // csvを上書き保存する
          writeFileSync(csv_filepath, "")                               //空のファイルを書き出す
          let fd = openSync(csv_filepath, "w")                          //ファイルを書き込み専用モードで開く
          let buf3 = iconv.encode(csv_content_concat, "Shift_JIS")         //書き出すデータをShift_JISに変換して、バッファとして書き出す
          writeSync(fd, buf3, 0, buf3.length, (err, written, buffer) => {  //バッファをファイルに書き込む
            if (err) {
              throw err
            }
            else {
              console.log("Add the data to the same day's record.")
            }
          })

          dialog.showMessageBox({
            message: "同日の患者データに追加されました",
            type: "info"
          })

          event.reply('import-reply', "同日の患者データに追加されました") // rendererに返事。ボタンの下に保存しましたと記入する。

        } else {　 // 条件判断　最終レコードの診療日と、書き込もうとしている診療日が同日ではない場合

          // 既存のレコードに新規レコードを追加する

          // importから受け取った内容をcsvに保存できるように調整
          const csv_add = `${last_row_imported[0]},${last_row_imported[1]},${last_row_imported[2]},${last_row_imported[3]},${last_row_imported[4]},${last_row_imported[5]},${last_row_imported[6]},${last_row_imported[7]},${last_row_imported[8]},${last_row_imported[9]},${last_row_imported[10]},${last_row_imported[11]},${last_row_imported[12]},${last_row_imported[13]},${last_row_imported[14]},${last_row_imported[15]},${last_row_imported[16]},${last_row_imported[17]}\r\n`　//CSVの内容を指定。 ,は列の区切りを示し、\nは改行
          let buf = iconv.encode(csv_add, "Shift_JIS") // 日本語バグの処理

          // 以前のcsvファイルに追記する。fs.appendFileSync(ファイルのパス, 書き込む文字, 文字コード, コールバック関数)
          appendFileSync(csv_filepath, buf, "utf-8", (err) => {
            if (err) {
              throw err;
            } else {
              console.log("Add to the existing file")
            }
          });

          dialog.showMessageBox({
            message: "患者データに追加されました",
            type: "info"
          })

          event.reply('import-reply', "患者データに追加されました") // rendererに返事。ボタンの下に保存しましたと記入する。
        }
      } else {  // 条件判断：以前のファイルが存在しない場合には、患者のフォルダを作成し、importファイルから受け取った内容をcsvに新規作成

        const new_folder_path = path.join(database, last_row_imported[0]) // importファイルlast_row_imported[0]は患者番号。新しく患者フォルダを作成する

        mkdirSync(new_folder_path, (err) => {
          if (err) { throw err; }
          console.log("Directory is created.")
        });

        const new_csv_path = path.join(new_folder_path, `${last_row_imported[0]}.csv`) // 新しいcsvファイルのパスを作成。importファイルlast_row_imported[0]は患者番号

        // importファイルの内容をcsvに保存できるように調整
        let csv = `患者番号,担当者,飼主名前,電話番号,郵便番号,住所,動物名前,動物種,性別,生年月日,年齢,診療日,主訴症状,診断,検査,治療方針,添付ファイル,作成時刻\r\n`  //２　//２　//５ CSVの内容を指定。 ,は列の区切りを示し、\nは改行
        csv += `${last_row_imported[0]},${last_row_imported[1]},${last_row_imported[2]},${last_row_imported[3]},${last_row_imported[4]},${last_row_imported[5]},${last_row_imported[6]},${last_row_imported[7]},${last_row_imported[8]},${last_row_imported[9]},${last_row_imported[10]},${last_row_imported[11]},${last_row_imported[12]},${last_row_imported[13]},${last_row_imported[14]},${last_row_imported[15]},${last_row_imported[16]},${last_row_imported[17]}\r\n`

        // csvを保存する
        writeFileSync(new_csv_path, "")                               //空のファイルを書き出す
        let fd = openSync(new_csv_path, "w")                          //ファイルを書き込み専用モードで開く
        let buf = iconv.encode(csv, "Shift_JIS")                      //書き出すデータをShift_JISに変換して、バッファとして書き出す
        writeSync(fd, buf, 0, buf.length, (err, written, buffer) => {  //バッファをファイルに書き込む
          if (err) {
            throw err
          }
          else {
            console.log("Wrote a csv file")
          }
        })

        dialog.showMessageBox({
          message: "データベースに患者フォルダが作成されました",
          type: "info"
        })

        event.reply('import-reply', "データベースに患者フォルダが作成されました")  //rendererに返事をする。。

      }
    }
  }
})

// 患者番号入力が終わってblurになった時のアクション
//　データベースから患者情報を入手して、rendererに返信。
ipcMain.on("kanjyabango", (event, arg) => {

  if (database !== "") {　// データベースが接続されている場合

    let target_patient = arg

    let target_folder_path = database

    //フォルダ内のフォルダのリストを入手。
    const getDirectories = source =>
      readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    //フォルダ内のファイルリストを入手
    const getFiles = source =>
      readdirSync(source, { withFileTypes: true })
        .map(dirent => dirent.name)

    let folders = getDirectories(target_folder_path)

    //フォルダのリストの中から、患者番号と合うフォルダのインデックスを入手
    //患者番号と合うフォルダが見つからなかったら-１が帰ってくる
    let target_folder_index = folders.indexOf(target_patient)

    if (target_folder_index !== -1) {　//患者番号と合うフォルダが見つかった場合

      // フォルダ名を、フルパスに変換する
      let target_patient_folder = path.join(target_folder_path, folders[target_folder_index])

      // フォルダ内のファイル名リストを入手
      let file_list = getFiles(target_patient_folder)

      // ファイル名リストをフルパスにする
      let file_list_full = file_list.map((item) => {
        return path.join(target_patient_folder, item)
      });

      // csvファイルのフルパスだけを取得する
      let extention_list = file_list_full.map((item) => { return path.extname(item) })
      let target_file_index = extention_list.indexOf(".csv")
      let csv_filepath = file_list_full[target_file_index]

      //  上記のcsvを読み込んでrendererに返す
      readFile(csv_filepath, function (err, data) {
        if (err) throw err;
        var buf = new Buffer.from(data, 'binary');    // バイナリバッファを一時的に作成する
        var retStr = iconv.decode(buf, "Shift_JIS");  // 作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
        event.reply("kanjyabango-reply", retStr)　    // rendererにレスポンス（CSVの中身）を返す。
      });

    } else {　//患者番号と合うフォルダが見つからなかった場合

      console.log("No such file")
      // event.reply("kanjyabango-reply", "no such file")

    }

  } else {　//データベースに接続されていない場合
    console.log("no database")
    // event.reply("kanjyabango-reply", "no database")
  }


})


// 保存ボタンを追加を押した際のmainの動作を規定
// 条件判断１：データベースと接続しているか。いないなら、エラーメッセージを表示して終了。
// 条件判断２：患者番号を入力しているか。いないなら、エラーメッセージを表示して終了。
//   その他：
//     条件判断３-１：以前のファイルが存在する場合には、rendererから受け取った内容をＣＳＶに書き込む
//     　条件判断３-１-１：最終レコードの診療日が、現在書き込もうとしている診療日と同じ場合にはCSVを上書き保存
//     　　　　　　　　　　　１ 最終レコード＋現在書き込もうとしている内容を組み合わせ
//     　　　　　　　　　　　２ CSVの全レコードから最終レコード削除
//     　　　　　　　　　　　３ ２の成果物と１の成果物をつなげる
//     　　　　　　　　　　　４ ３の成果物を既存のCSVに上書き保存
//     　条件判断３-１-２：最終レコードの診療日が、現在書き込もうとしている診療日と違う場合にはCSVに追加
//     条件判断３-２：以前のファイルが存在しない場合には、患者のフォルダを作成し、rendererから受け取った内容をＣＳＶに新規作成
ipcMain.on("save-action", (event, arg) => {

  if (database === "") {  // 条件判断１：データベースと接続しているか。いないなら、エラーメッセージを表示して終了。

    dialog.showMessageBox({
      message: "データベースと接続してください",
      type: "warning"
    })

  } else if (arg[0] === "") { // 条件判断２：患者番号を入力しているか。いないなら、エラーメッセージを表示して終了。

    dialog.showMessageBox({
      message: "患者番号を入れてください",
      type: "warning"
    })

  } else { //  その他：

    let target_patient = arg[0] 　　　　//　rendererから送られてきた変数の中から患者番号を選択
    let target_folder_path = database　//　データベースのパスを変数に代入

    //フォルダ内のフォルダのリストを入手。
    const getDirectories = source =>
      readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    //フォルダ内のファイルリストを入手
    const getFiles = source =>
      readdirSync(source, { withFileTypes: true })
        .map(dirent => dirent.name)

    let folders = getDirectories(target_folder_path)
    let target_folder_index = folders.indexOf(target_patient) //フォルダのリストの中から、患者番号と合うフォルダのインデックスを入手

    // csvに記入するための作成日時を作成する
    const date1 = new Date()
    const date2 = `${date1.getFullYear()}/${(date1.getMonth()) + 1}/${date1.getDate()} ${date1.getHours()}:${date1.getMinutes()}:${date1.getSeconds()}`

    //　アップロードされたファイルをコピーする下準備。arg[16]はアップロードファイルのフルパス
    let uploaded_file_path = arg[16]

    if (target_folder_index !== -1) { //  条件判断３-１：以前のファイルが存在する場合には、rendererから受け取った内容をcsvに追加

      let target_patient_folder = path.join(target_folder_path, folders[target_folder_index]) // フォルダ名を、フルパスに変換する
      let file_list = getFiles(target_patient_folder)  // フォルダ内のファイル名のリストを入手
      let file_list_full = file_list.map((item) => {   // ファイル名のリストをフルパスにする
        return path.join(target_patient_folder, item)
      });

      // アップロードされたファイルのコピーをする
      // アップロードされたファイルは、日付-番号-ファイル名とする
      let copied_path = []
      for (const [index, element] of uploaded_file_path.entries()) {
        let file_basename = path.basename(element)                                                    //名前の作成
        let date3 = `${date1.getFullYear()}${(date1.getMonth()) + 1}${date1.getDate()}`               //名前の作成
        let file_write_name = path.join(target_patient_folder, `${date3}-${index}-${file_basename}`)　//名前の作成
        copyFileSync(element, file_write_name)　//コピー
        copied_path.push(file_write_name)       //csvに記入するためにファイル名をcopied_pathに保存しておく
      }


      // csvファイルのフルパスを入手する
      const extention_list = file_list_full.map((item) => { return path.extname(item) })
      const target_file_index = extention_list.indexOf(".csv")
      const csv_filepath = file_list_full[target_file_index]

      //  上記のcsvを読み込み、最終レコードの診療日が現在書き込もうとしている診療日と同じかどうか判断する
      let data = readFileSync(csv_filepath)
      let buf = new Buffer.from(data, 'binary');         //　バイナリバッファを一時的に作成する
      let csv_content = iconv.decode(buf, "Shift_JIS");  //　作成したバッファを使い、iconv-liteでShift-jisからutf8に変換。
      let last_row = csv_content.split(`\r\n`).slice(-2, -1)[0].split(",")
      let ex_shinryobi = last_row[11]                    //　最終レコードの診療日を入手する

      if (ex_shinryobi === arg[11]) { // 条件判断３-１-１　最終レコードの診療日と、書き込もうとしている診療日が同日の場合

        // 最終レコードを削除し、最終レコードに現在書き込み中の内容を付け加えて上書き保存する

        // 最終レコードと、現在書き込み中の内容を組み合わせる
        const last_row_modified = `\r\n${arg[0]},${arg[1]},${arg[2]},${arg[3]},${arg[4]},${arg[5]},${arg[6]},${arg[7]},${arg[8]},${arg[9]},${arg[10]},${arg[11]},${last_row[12]};${arg[12]},${last_row[13]};${arg[13]},${last_row[14]};${arg[14]},${last_row[15]};${arg[15]},${last_row[16]};${copied_path.join(";")},${date2}\r\n`
        let buf2 = iconv.encode(last_row_modified, "utf-8") // 日本語をUTF8にエンコード

        // 既存のレコードから、最終レコードを削除する
        let csv_content_without_lastrow = csv_content.split(`\r\n`).slice(0, -2)　// csvをリストにして、csvの最終列を削除
        csv_content_without_lastrow = csv_content_without_lastrow.join(`\r\n`)　// リストからcsvのフォーマットに戻す

        // 既存のレコードから最終レコードを削除したものに、新しく作ったレコードを付け加える
        let csv_content_concat = csv_content_without_lastrow + buf2

        // csvを上書き保存する
        writeFileSync(csv_filepath, "")                               //空のファイルを書き出す
        let fd = openSync(csv_filepath, "w")                          //ファイルを書き込み専用モードで開く
        let buf3 = iconv.encode(csv_content_concat, "Shift_JIS")         //書き出すデータをShift_JISに変換して、バッファとして書き出す
        writeSync(fd, buf3, 0, buf3.length, (err, written, buffer) => {  //バッファをファイルに書き込む
          if (err) {
            throw err
          }
          else {
            console.log("Add the data to the same day's record.")
          }
        })

        event.reply('save-action-reply', "同日の患者データに追加されました") // rendererに返事。ボタンの下に保存しましたと記入する。

      } else {　 // 条件判断３-１-２　最終レコードの診療日と、書き込もうとしている診療日が同日ではない場合

        // 既存のレコードに新規レコードを追加する

        // rendererから受け取った内容をcsvに保存できるように調整
        const csv_add = `${arg[0]},${arg[1]},${arg[2]},${arg[3]},${arg[4]},${arg[5]},${arg[6]},${arg[7]},${arg[8]},${arg[9]},${arg[10]},${arg[11]},${arg[12]},${arg[13]},${arg[14]},${arg[15]},${copied_path.join(";")},${date2}\r\n`　//２　//４　//１　CSVの内容を指定。 ,は列の区切りを示し、\nは改行
        let buf = iconv.encode(csv_add, "Shift_JIS") // 日本語バグの処理

        // 以前のcsvファイルに追記する。fs.appendFileSync(ファイルのパス, 書き込む文字, 文字コード, コールバック関数)
        appendFileSync(csv_filepath, buf, "utf-8", (err) => {
          if (err) {
            throw err;
          } else {
            console.log("Add to the existing file")
          }
        });

        event.reply('save-action-reply', "患者データに追加されました") // rendererに返事。ボタンの下に保存しましたと記入する。
      }
    } else {  // 条件判断３-２：以前のファイルが存在しない場合には、患者のフォルダを作成し、rendererから受け取った内容をcsvに新規作成

      const new_folder_path = path.join(database, arg[0]) // rendererから送られてきたarg[0]は患者番号。新しく患者フォルダを作成する

      mkdirSync(new_folder_path, (err) => {
        if (err) { throw err; }
        console.log("Directory is created.")
      });

      // アップロードされたファイルのコピーをする
      // アップロードされたファイルは、日付-番号-ファイル名とする
      let copied_path = []
      for (const [index, element] of uploaded_file_path.entries()) {
        let file_basename = path.basename(element)                                                    //名前の作成
        let date3 = `${date1.getFullYear()}${(date1.getMonth()) + 1}${date1.getDate()}`               //名前の作成
        let file_write_name = path.join(new_folder_path, `${date3}-${index}-${file_basename}`)        //名前の作成
        copyFileSync(element, file_write_name);  //コピー
        copied_path.push(file_write_name)        //csvに記入するためにファイル名をcopied_pathに保存しておく
      }

      const new_csv_path = path.join(new_folder_path, `${arg[0]}.csv`) // 新しいcsvファイルのパスを作成。arg[0]は患者番号

      // rendererから受け取った内容をcsvに保存できるように調整
      let csv = `患者番号,担当者,飼主名前,電話番号,郵便番号,住所,動物名前,動物種,性別,生年月日,年齢,診療日,主訴症状,診断,検査,治療方針,添付ファイル,作成時刻\r\n`  //２　//２　//５ CSVの内容を指定。 ,は列の区切りを示し、\nは改行
      csv += `${arg[0]},${arg[1]},${arg[2]},${arg[3]},${arg[4]},${arg[5]},${arg[6]},${arg[7]},${arg[8]},${arg[9]},${arg[10]},${arg[11]},${arg[12]},${arg[13]},${arg[14]},${arg[15]},${copied_path.join(";")},${date2}\r\n`

      // csvを保存する
      writeFileSync(new_csv_path, "")                               //空のファイルを書き出す
      let fd = openSync(new_csv_path, "w")                          //ファイルを書き込み専用モードで開く
      let buf = iconv.encode(csv, "Shift_JIS")                      //書き出すデータをShift_JISに変換して、バッファとして書き出す
      writeSync(fd, buf, 0, buf.length, (err, written, buffer) => {  //バッファをファイルに書き込む
        if (err) {
          throw err
        }
        else {
          console.log("Wrote a csv file")
        }
      })

      event.reply('save-action-reply', "データベースに患者フォルダが作成されました")  //rendererに返事をする。ボタンの下に保存しましたと記入する。

    }

  }

});　//２　の終わり