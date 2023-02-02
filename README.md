# アプリケーション名

### WeatherChecker（ウェザーチェッカー）
![アプリ画像](https://github.com/yukikaze223422/portfolio-app/blob/main/WeatherChecker.png)

<br>

# アプリケーション概要

旅行に行く人などが、直近５日間の天気をすぐに確認することができるアプリです。

<br>

# アプリ URL

[weather-react-dn0hxa8vg-yukikaze223422.vercel.app/](https://weather-react-dn0hxa8vg-yukikaze223422.vercel.app/)

<br>

# アプリを作成して学んだこと

APIをあまり触れたことがなかったためJSONデータの扱い方や呼び出し方などを学んだことで知識を増やすことがができました。<br>
また、インターネットの情報が少ない中で開発したため、ポートフォリオと違ったプログラムロジックを深く考えるきっかけとなり成長できる良い機会となりました。

<br>

# 利用方法

1. 日付を選択
   
2. 都道府県を選択
   
3. 市区町村を選択
   
4. 「天気チェック」ボタンを押下
   - 過去に同条件で検索した天気情報はFirebaseから読み込まれる。（初回はAPIから読み込み）
   - API or Firebaseのどちらから読み込んだかわかるアラートメッセージを表示
   
5. 条件に該当する３時間ごとの天気、気温が表示

<br>

# 開発環境

- フロントエンド
  - React(v18.2.0)
  - TypeScript
  - Chakra UI(v2.4.9)
- バックエンド
  - Firebase (v9.16.0)
- API
  - RESAS-API
  - Geocoding API 
  - 5 Day / 3 Hour Forecast
- ライブラリ
  - axios
  - react-hook-form
  - react-helmet
  - react-icons
- その他
  - Vercel

<br>

# テーブル構成
### WeaherDataテーブル（collection）
- ドキュメント
  - 日付＋都道府県＋市区町村<br>
- フィールド
  - searchTime（追加された時間）
  - weather（天気情報）
    - icon（気候アイコン）
    - temperature（気温）
    - timeText（日付 yyyy-mm-dd）
    - weather（気候）
    
![テーブル画像](https://github.com/yukikaze223422/portfolio-app/blob/main/table.png)


<br>

# 工夫した点

### 1. 都道府県と市区町村の連動

都道府県のプルダウンを選択すると、それに対応した市区町村が表示されるようにすることでユーザーが簡単に選択できるように対応<br>

<br>

### 2. ユーザー目線のレイアウト

極力、ユーザーに対してわかりやすいような配置にしたりや必要最低限の情報を提供することで見栄えをよくしました。

<br>

# 苦労した点

### 1. JSONデータの扱い
私自身がAPIにあまり触れたことがなかったため、出力されたJSONデータを必要なデータだけを取り出して格納や表示をさせることに苦労しました。
また、API中心のアプリとなるのでどのAPIをどこで使うのかという細かい調整を意識してプログラムを作りました。


<br>

### 2. Firebaseとの連携

ポートフォリオ作成でFirebaseは使ったことはあったのですが、同一条件だった場合はFirebaseからそれ以外はAPIから呼び出すといった分岐が思ったより苦労しました。
前述したJSONデータの扱いの関係でAPIから格納したデータとFirebaseで同じオブジェクト配列の構造にしないといけなかったのが苦労した１番の原因でした。
今回のアプリ作成で、苦手な部分が明確に分かったためそこを重点的に学習していこうと考えています。

<br>
