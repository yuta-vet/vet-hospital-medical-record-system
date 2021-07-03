/*!-----------------------------------------------------------------------------
 * 動物病院　カルテシステム　Lucky 
 * v1.0.0 - built 2021-01-30
 * Licensed under the MIT License.
 * Copyright (c) 2021 Yuta Hosoi https://meknowledge.jpn.org/
 * See LICENSE.md and README.md
* --------------------------------------------------------------------------*/

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// ページが読み込まれたときのアクション
// render側では、診療日の入力
// main process側では、config.txtファイル内からデータベースのパスを入手
window.onload = function () {
    const today = new Date();
    const y1 = today.getFullYear().toString().padStart(4, '0');
    const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
    const d1 = today.getDate().toString().padStart(2, '0');
    document.getElementById("shinryobi").value = `${y1}-${m1}-${d1}`
    preloaded.send("onload-action", "wake up")
};

// ページが読み込まれ、データベースが見つかったときにボタンの表示を変える
preloaded.on("onload-action-reply", (event, arg) => {
    setTimeout(() => {
        let databasebutton_first = document.getElementById('database');
        databasebutton_first.innerText = "データベース接続中"
        databasebutton_first.classList.remove("btn-info") //色変更
        databasebutton_first.classList.add("btn-primary") //色変更
    }, 3000)
});

// headerのスライドショーを設定
$(".jumbotron").vegas({
    overlay: true,
    timer: false,
    delay: 10000,
    slidesToKeep: 1,
    transition: 'fade2',
    transitionDuration: 8000,
    animation: 'random',
    animationDuration: 10000,
    slides: [
        { src: "img/dog.jpg" },
        { src: "img/flower_1.jpg" },
        { src: "img/cat.jpg" },
        { src: "img/flower_2.jpg" }
    ]
});

// データベース接続ボタンを押したときのアクションを既定
// main processにシグナルを送る
// main processがデータベースのフォルダパスを入手・config.txtに書き込む
$("#database").click(function () {
    preloaded.send("database", "connected")
});

// データベース接続ボタンを押したときのアクションを既定
// main processがデータベースのフォルダパスを入手・config.txtに書き込んた
// データ接続ボタンの色を変える
preloaded.on("database-reply", (event, arg) => {
    let databasebutton = document.getElementById('database');
    databasebutton.innerText = "データベース接続中"
    databasebutton.classList.remove("btn-info") //色変更
    databasebutton.classList.add("btn-primary") //色変更
});

// リセットボタンを押されたときのアクション
// 入力事項を消す
$("#reset").click(function () {
    document.getElementById("kanjyabango").value = ""
    document.getElementById("tanto").value = ""
    document.getElementById("kainushiname").value = ""
    document.getElementById("denwa").value = ""
    document.getElementById("inputAddress01").value = ""
    document.getElementById("inputAddress02").value = ""
    document.getElementById("name").value = ""
    document.getElementById("animalList").value = ""
    document.getElementById("sexList").value = ""
    document.getElementById("birthDay").value = ""
    document.getElementById("age").value = ""
    document.getElementById("syuso").value = ""
    document.getElementById("shindan").value = ""
    document.getElementById("kensa").value = ""
    document.getElementById("chiryohoushin").value = ""
    document.getElementById("formFileMultiple").value = ""
    document.getElementById("belowsave").innerText = ""

    //// 以前の診療データを表示したtable要素の子要素を全部消去する
    let div_previous_view = document.getElementById('previous_view');
    if (document.querySelector("table") != null) {  //// 既にファイルを読み込みが行われているかをtable要素の有無で判定する
        while (div_previous_view.firstChild) {
            div_previous_view.removeChild(div_previous_view.firstChild);　 //// 子要素を全て消すアルゴリズム
        }
    };

});


// 患者番号を入力し終わって、blurとなったときのアクション
// main processのほうで患者番号検索を行う
$("#kanjyabango").blur(function () {
    preloaded.send("kanjyabango", $("#kanjyabango").val())
});

// 患者番号を入力し終わって、blurとなったときのアクション
// mainからCSVデータ受取＋前回データをHTML上に表示する
preloaded.on("kanjyabango-reply", (event, arg) => {

    let div_previous_view = document.getElementById('previous_view');　// previous_viewというidを付けたdiv要素内にtagを入れていくためまずは、この要素を取得

    //// 前回のファイルを読み込みを２回（以上）行う場合には、１回目のときに作成したtable要素の子要素を全部消去する。
    if (document.querySelector("table") != null) {  //// 既にファイルを読み込みが行われているかをtable要素の有無で判定する
        while (div_previous_view.firstChild) {
            div_previous_view.removeChild(div_previous_view.firstChild);　 //// 子要素を全て消すアルゴリズム
        }
    };

    // html要素を作成
    const csv_data = arg.split(`\r\n`).slice(1, -1);　//// CSVのデータを改行ごとに分割。１番目は列名で、最後は空白なのでsliceで除く

    //// 過去の記載内容をtableタグで挿入する
    for (let csv_row of csv_data) {   ////// csvのrowごとに処理していく

        let row = csv_row.split(",")　////// rowを要素に分ける

        let table = document.createElement('table');　////// table要素を作る
        table.classList.add("table", "table-bordered", "table-hover", "previous_view_add");　////// previous_view_addは上とのmargin

        let thead = document.createElement('thead')　////// table要素内のthead要素を作る
        thead.classList.add("table-active")         ////// table-activeは色
        let th0_0 = document.createElement('th')　　　////// table要素内のthead要素内のth要素を作る
        th0_0.scope = "col"                         ////// colはcssで色
        th0_0.textContent = "項目"                  ////// 項目という列名にする

        thead.appendChild(th0_0)                    ////// thを、table要素内のthead要素内に挿入する

        let th0_1 = document.createElement('th')
        th0_1.scope = "col"
        th0_1.textContent = "記入内容"
        thead.appendChild(th0_1)                    ////// thを、table要素内のthead要素内に挿入する

        table.appendChild(thead)　　　　　　　　　　　　////// theadを、table要素内に挿入する

        let tbody = document.createElement('tbody');　　////// table要素内のtbody要素を作る

        let tr1 = document.createElement('tr')         ////// table要素内のtbody要素内のtr要素をつくる

        let th1 = document.createElement('th')　　　　　////// table要素内のtbody要素内のtr要素内のthを作る
        th1.classList.add("table-info")                 ////// thの色
        th1.scope = "row"                               ////// thのフォント
        th1.textContent = "診療日"                      ////// thの内容
        tr1.appendChild(th1)                            ////// thを、table要素内のtbody要素内のtr要素内に挿入

        let td1 = document.createElement('td')          ////// table要素内のtbody要素内のtr要素内のtdを作る
        td1.textContent = row[11];                       ////// tdの色
        tr1.appendChild(td1)                            ////// tdの色
        tbody.appendChild(tr1)                          ////// tdを、table要素内のtbody要素内のtr要素内に挿入

        let tr2 = document.createElement('tr')

        let th2 = document.createElement('th')
        th2.classList.add("table-info")
        th2.scope = "row"
        th2.textContent = "主訴・症状"
        tr2.appendChild(th2)

        let td2 = document.createElement('td')
        let row12 = row[12].replace(/;/g,"<br>")
        td2.innerHTML = row12
        tr2.appendChild(td2)
        tbody.appendChild(tr2)

        let tr3 = document.createElement('tr')

        let th3 = document.createElement('th')
        th3.classList.add("table-info")
        th3.scope = "row"
        th3.textContent = "診断"
        tr3.appendChild(th3)

        let td3 = document.createElement('td')
        let row13 = row[13].replace(/;/g,"<br>")
        td3.innerHTML = row13
        tr3.appendChild(td3)
        tbody.appendChild(tr3)

        let tr4 = document.createElement('tr')

        let th4 = document.createElement('th')
        th4.classList.add("table-info")
        th4.scope = "row"
        th4.textContent = "検査"
        tr4.appendChild(th4)

        let td4 = document.createElement('td')
        let row14 = row[14].replace(/;/g,"<br>")
        td4.innerHTML = row14
        tr4.appendChild(td4)
        tbody.appendChild(tr4)

        let tr5 = document.createElement('tr')

        let th5 = document.createElement('th')
        th5.classList.add("table-info")
        th5.scope = "row"
        th5.textContent = "治療方針"
        tr5.appendChild(th5)

        let td5 = document.createElement('td')
        let row15 = row[15].replace(/;/g,"<br>")
        td5.innerHTML = row15
        tr5.appendChild(td5)
        tbody.appendChild(tr5)

        let tr6 = document.createElement('tr')

        let th6 = document.createElement('th')
        th6.classList.add("table-info")
        th6.scope = "row"
        th6.textContent = "添付ファイル"
        tr6.appendChild(th6)

        // 添付ファイルは別ウインドウで開く。以下の形のタグを追加することを目標とする
        //  <td> <a href = "ファイルパス">ファイル</a>  </td>
        //  <td> <a href = "ファイルパス">ファイルその１</a> <br> <a href = "ファイルパス">ファイルその２</a> </td>
        let td6 = document.createElement('td')
        let file_full_names = row[16].split(";")

        if (file_full_names.length > 1) {　　// 添付ファイルが２つ以上の場合は<br>を入れる

            for (let item of file_full_names) {
                let a_element = document.createElement("a")
                a_element.href = item
                a_element.target = "_blank"　                            // 外部ウィンドウで開く
                a_element.innerHTML = `${item.replace(/^.*[\\\/]/, '')}` // フルパスからファイル名だけ抽出
                a_element.classList.add("clickAdjust")　                 // a tagのcssを調整。onmouseの判定位置がおかしかった
                td6.appendChild(a_element)

                var br = document.createElement("br")                    // brを追加する
                td6.appendChild(br)
            }

        } else if (file_full_names.length === 1 && row[16] !== "") {　// 添付ファイルが１つの場合は<br>を入れない

            let a_element = document.createElement("a")
            a_element.href = file_full_names
            a_element.target = "_blank"
            a_element.classList.add("clickAdjust")
            a_element.textContent = file_full_names[0].replace(/^.*[\\\/]/, '')  // file_full_names[0]の０を入れないとリストのママ
            td6.appendChild(a_element)

        } else {　// 添付ない場合も、aを入れないとレイアウトがおかしくなる

            let a_element = document.createElement("a")
            a_element.href = ""
            a_element.classList.add("clickAdjust")
            a_element.textContent = ""
            td6.appendChild(a_element)
        }

        tr6.appendChild(td6)
        tbody.appendChild(tr6)

        table.appendChild(tbody)                        ////// tbodyを、table要素内に挿入する。
        div_previous_view.appendChild(table)            ////// tableを、div要素内に挿入する。

    }

    // 読み込んだCSVの最終行を取得しそれぞれの空欄に入れていく
    last_row = arg.split(`\r\n`).slice(-2, -1)[0].split(",")
    document.getElementById("tanto").value = last_row[1]
    document.getElementById("kainushiname").value = last_row[2]
    document.getElementById("denwa").value = last_row[3]
    document.getElementById("inputAddress01").value = last_row[4]
    document.getElementById("inputAddress02").value = last_row[5]
    document.getElementById("name").value = last_row[6]
    document.getElementById("animalList").value = last_row[7]
    document.getElementById("sexList").value = last_row[8]
    document.getElementById("birthDay").value = last_row[9]

    //　年齢取得
    const birthDate = new Date($('#birthDay').val())

    // 文字列に分解
    const y2 = birthDate.getFullYear().toString().padStart(4, '0');
    const m2 = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const d2 = birthDate.getDate().toString().padStart(2, '0');

    // 今日の日付
    const today = new Date();
    const y1 = today.getFullYear().toString().padStart(4, '0');
    const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
    const d1 = today.getDate().toString().padStart(2, '0');

    // 引き算
    const age = Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);
    document.getElementById("age").value = age

});

// 誕生日を変更した際のアクション
$('#birthDay').change(function () {

    const birthDate = new Date($('#birthDay').val())

    // 文字列に分解
    const y2 = birthDate.getFullYear().toString().padStart(4, '0');
    const m2 = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const d2 = birthDate.getDate().toString().padStart(2, '0');

    // 今日の日付
    const today = new Date();
    const y1 = today.getFullYear().toString().padStart(4, '0');
    const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
    const d1 = today.getDate().toString().padStart(2, '0');

    // 引き算
    const age = Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);
    document.getElementById("age").value = age

});


// 郵便番号を入れた時のアクション。AjaxZip3を使用。
// https://github.com/ajaxzip3/ajaxzip3.github.io
// ここで郵便番号から住所データを取得する外部通信がある。そのため、Content-Security-Policyに接続先を登録している。
$("#inputAddress01").keyup(function () {
    AjaxZip3.zip2addr(this, '', 'addr11', 'addr11');
});


// 保存ボタンが押されたときのアクション
const content_save = document.getElementById("save"); //  保存ボタンの要素を取得

content_save.addEventListener("click", function () {

    // ファイルアップロードエレメントから、アップロードされたファイルのパスの位置を取得する。
    // アップロードされたファイルのフルパスを入手することで、後に患者のフォルダにコピーを行う。
    let files_uploaded = document.getElementById("formFileMultiple").files
    let file_paths = []
    for (let item of files_uploaded) {
        file_paths.push(item.path)
    }

    preloaded.send("save-action",　　　　//// main processに各入力項目を送る
        [document.getElementById("kanjyabango").value,
        document.getElementById("tanto").value,
        document.getElementById("kainushiname").value,
        document.getElementById("denwa").value,
        document.getElementById("inputAddress01").value,
        document.getElementById("inputAddress02").value,
        document.getElementById("name").value,
        document.getElementById("animalList").value,
        document.getElementById("sexList").value,
        document.getElementById("birthDay").value,
        document.getElementById("age").value,
        document.getElementById("shinryobi").value,
        document.getElementById("syuso").value,
        document.getElementById("shindan").value,
        document.getElementById("kensa").value,
        document.getElementById("chiryohoushin").value,
            file_paths
        ]
    );
});

// 保存ボタンが押されたときのアクション
// main processが終わったらボタンのしたに保存しましたと記入する。
preloaded.on("save-action-reply", (event, arg) => {
    console.log("saved")
    document.getElementById("save").blur()
    document.getElementById("belowsave").innerText = arg
});






