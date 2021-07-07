# Medical record for veterinary medicine Lucky

This is an electronic medical record system for veterinary hospitals. It is intended for use in Japan.
Use it for personal research purposes. Do not use it for clinical purposes.
Also check the [web version](https://kindpark.jpn.org/record-system/)! 

Features
- A node.js application powered by electron.
- A system for electronic medical records with very basic functions. 
- Patient number is a key to connect the database. Putting patient number in the text box evokes auto inflow of the patient data. 
- Entering a zip code will automatically display the predicted address.
- Beautiful interface and easy to view previous records.
- By using CSV as the database, past records can be viewed with common software.
- Attachments can be uploaded by simply dragging and dropping.
- Collaboration with Web version https://kindpark.jpn.org/record-system/
- Web version can input text using speech to text technology 

# Set up

```bash
git clone https://github.com/yuta-vet/vet-hospital-medical-record-system
npm install
npm start
```

# How to use
1. Set up a folder to be the database.
2. Enter the patient number, and when you move to another item, the system will automatically search for the same patient information in the database based on the patient number and automatically complete the search. 
3. The zip code search is accessing an external database. Patient information is not sent. 
4. Attachments can be dragged and dropped to attach multiple files.
5. After entering the patient's information, click the Save button.
6. The csv data created in the web version can be imported into the database by clicking the "Import web-created data" button.

# Disclaimer
1. Before using this file, please agree to the disclaimer and start using it. By downloading this file, you are deemed to have agreed to the disclaimer. 
2. The user of this file assumes all responsibility for his or her own actions, and any problems caused by this file shall be solved by the user himself or herself, and the producer shall be exempted from any responsibility. 
3. The producer shall not be liable for any damage to the user or any damage to a third party caused by the user's use of the file. The producer assumes no obligation to compensate for damages caused by computer system damage, data corruption, inaccuracy of the obtained data, or any other cause caused by the use of this file.
4. This program has not been approved by the Act on Quality, Efficacy and Safety of Drugs and Medical Devices. Therefore, it should not be used for medical treatment. Please use it for personal research or entertainment purposes.

## License

Copyright 2021 Yuta Hosoi https://meknowledge.jpn.org/

MIT(LICENSE.md)

# 動物病院　カルテシステム　Lucky

動物病院の電子カルテです。日本国内での使用を想定しています。  
個人的な研究用途に使用してください。臨床目的では使用しないでください。
[ウェブバージョン](https://kindpark.jpn.org/record-system/)もチェックしてください!

特徴
- electronを使用したnode.jsアプリケーション。
- 基本的な機能（のみ！）を備えた電子カルテのシステム。
- データベースと接続することで、患者番号を入力するだけで患者情報が自動入力される。
- 郵便番号を入力すると、自動的に住所が表示される。
- 前回の記録が見やすい、美しいインターフェイス。
- データベースにCSVを利用することで、一般的なソフトでも過去の記録を見ることができる。
- 添付ファイルはドラッグ・ドロップだけでアップロードできる。
- ウェブバージョンとの連携ができる https://kindpark.jpn.org/record-system/
- ウェブバージョンはカルテの音声入力ができる。 

# セットアップ

```bash
git clone https://github.com/yuta-vet/vet-hospital-medical-record-system
npm install
npm start
```

# 使い方
1. データベースとなるフォルダを設定します。  
2. 患者番号を入力し、他の項目に移動すると患者番号から自動的にデータベース内から同一の患者情報を検索して自動補完します。  
3. 郵便番号検索は、外部のデータベースにアクセスをしています。患者情報は送信されません。  
4. 添付ファイルはドラッグドロップで複数個を添付できます。  
5. 患者の情報を入力した後は保存ボタンを押してください。
6. ウェブバージョンで作成したcsvデータは、web作成データ取込ボタンを押してデータベースに取り込んでください。

# 免責事項
1. 当ファイルをご利用する前に免責事項に同意し、同意後にご利用を開始してください。当ファイルをダウンロードすることによってご利用者は、免責事項に同意したものとみなします。  
2. 当ファイルのご利用者は、自らの行為に一切の責任を負うものとし、当ファイルによって生じた問題については、ご利用者自らで解決し、製作者は一切免責されるものとします。  
3. 製作者は、ご利用者のファイルの利用により発生した、ご利用者の損害又は第三者の損害に対し、いかなる責任も負いません。製作者は、当ファイル使用によるコンピューターシステムの破損、データ破損、得られたデータの不正確性、及びそれ以外のいかなる原因に基づき生じた損害について賠償する義務を一切負わないものとします。  
4. 本プログラムは、医薬品、医療機器等の品質、有効性及び安全性の確保等に関する法律の承認を受けたものではありません。そのため、診療には使用しないでください。個人的な研究又は娯楽の用途でお使いください。  

## ライセンス

Copyright 2021 Yuta Hosoi https://meknowledge.jpn.org/

MIT(LICENSE.md)



