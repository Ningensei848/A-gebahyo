-   config と metadata(by frontmatter) は異なることに留意
-   frontmatter を見て調整
    https://docusaurus.io/docs/next/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter

## 実際に出力してみる

-   race_id ごとのページ、およびそれらを一覧するページ（ポータル、というかインデックス）がほしい
    -   `each_race`, `kaisai_index` でそれぞれ対応する
    -   `each_race` では race のメタデータ情報が得られるので、それを元に `kaisai_index` を作る方が良さそう

## リリース時に最低限必要な機能

-   [x] ページ共有機能 → docs 向けに Swizzling (cf. DocItem) する
-   [x] twitter 検索への導線をつくるとか → 　馬名のハッシュタグ化
-   [ ] ReCharts での可視化
-   [ ] `prism-react-renderer` のバージョンを上げるかどうか検証

## あとまわし

-   `husky` `lint-staged` 等の開発時に便利な機能のカスタマイズ
-   検索機能
-   タグ検索したときの表示順制御 → BlogTagsPostsPage とか BlogTagsPostsPageContent
    -   `tags` ページでの並ぶ順を、「アルファベット順」から「更新順」にすげ替える
-   関数それ自体も props として与えれば、eta 側でも使えるんじゃね？　 → 　 getRecordsFromPreviousResult() を eta 側でやらせたほうが、より並列化されるため
-   result_table の見た目を調整 by CSS

-   静的サイトのホスティング先
    -   第一候補は Cloudflare Pages https://www.cloudflare.com/ja-jp/plans/developer-platform/
    -   GCP の場合：
        -   最初は GCS + カスタムドメインだけでいいはず
        -   知名度が上がってきたら、Cloud CDN + Load balancer の構成へ

## ゆめのまたゆめ

-   introduction に「注目レース」をピックアップする処理
-   ChatGPT 連携で記事生成
-   写真追加（多分 next.js が必要；サーバ側で処理する必要がある）
-   jockey, trainer ごとのページをつくる
    -   race ではなく、人に注目して作成
-   脚質判定

## だいたいいい感じになってきた

-   コンテンツの充実
-   `TODO: ` を潰していけばだいたい良さそう
-   きれいに書こうとしない、それはあと

-   メタな部分はおおよそ終わったので、レースごとの記事の中身を充実させることに注力

## ぶつかった壁

→ 　実装完了 cf. `/getHorseResult`

-   [ ] 毎回コマンド実行するたびに、数十〜数百回のリクエストが走り、かなり出費が痛い
    -   ENV.dev みたいな感じで、一部のファイルのみ出力するように設定したい

## その他

<details>
<summary>完了済みタスクとか諸々</summary>

-   [x] ~~各馬ごとの過去成績を参照する際に、 `entries` のデータだけを引っこ抜くと `metadata` に紐づく情報が一発で得られない…~~
    -   [x] ~~`entries.race_id` を参照して、entries + metadata を join したデータを返す処理が必要~~
    -   [x] ~~`metadata` のキーを作ってそこにぶら下げるというよりは、`RaceMetadata` + `ResultData` を作るイメージ~~

</details>
