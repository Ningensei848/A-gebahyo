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
    -   [x] Hello world
    -   [x] 自動生成
    -   [ ] 複勝圏内をカスタムドット https://recharts.org/en-US/examples/CustomizedDotLineChart
        -   https://iconmonstr.com/star-3-svg/
-   [ ] `prism-react-renderer` のバージョンを上げるかどうか検証
-   [x] （最優先）JRA 出力されてない問題の解決

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
-   entries(result) における `diff` は、先頭との差にしたい
-   ReCharts で ToolTip をカスタマイズして見やすく（体重データに競走結果を乗せるとか）

-   新馬戦の場合は過去データがないので、`/profile` , `/pedigree` からデータを取る

-   グラフ表示において、コンポネントに与える data を timestamp で区切る機能（過去何ヶ月分だけ表示、とか）
    -   特定の枠だけ表示する機能も欲しい
    -   ついでに「画像出力」できるように
    -   GUI 入力でデータ追加して可視化できたら嬉しそう（簡易シミュができるとうれしい）

## グラフでほしいもの

-   PieChart

### LineChart:

-   [x] weight, impost: 体重遷移 + 体重に占める斤量の割合　を示すグラフ
-   [x] rank, rank_at_corner: 縦軸を順位、横軸を 1-4 コーナー + ゴール地点として、順位の遷移を表示するグラフ
    -   [ ] ToolTip が見づらいのでカスタマイズ
        -   ~~[ ] x,y を逆にして、各順位ごとの ToolTip を出したい~~
        -   ~~そうすれば、各枠ごとの勝率を並べられるはず~~
        -   X の値に対する遷移しか見られないため、これは実現不可能
-   [ ] 距離ごとの上り+タイムの遷移（tooltip でカスタムな情報提供も）
-   laptime, pacemaker で先頭との比較…をしたいが、距離が異なってしまう問題を解決できない

### PieChart

-   jockey_name, rank: 騎手別割合(+ 勝利割合)
-   direction, rank: 左右どちらが得意なのか
-   distance, rank: どの距離が得意か
-   going, rank: どの馬場状態が得意か
-   course_code, rank: どの会場が得意か（raca_id を利用したほうがいいかも）

## Github Actions

-   repoA: eta.js で MDX 生成 & index.mdx だけ main にプッシュ & `/docs/YYYY/*` を repoB に push
-   repoB: repoA を clone してきて main にある `/docs/YYYY/*` をビルド & ホスト先にデプロイ

repoA は public にして、repoB は private にしておく
（ロジックは公開するが、コンテンツはあくまで非公開）

### repo A (A-gebahyo)

-   `.gitignore` で `content/docs/202*` を除く
-   GitHub Actions は未定
-   GitHub Pages は無し

### repo B (Content Repository)

-   `content/docs/202*` のみを置く
-   GitHub Actions を毎日実行
    -   checkout 後に repo A を clone する & `content/docs/` 以下に移動させてビルド
    -   ビルド（記事生成＋ブログ出力）
-   GitHub Pages を Private の上で設定

## ぶつかった壁

-   [ ] ばんえい競馬を排除するロジックの構築

## その他

<details>
<summary>完了済みタスクとか諸々</summary>

-   [x] 実装完了 cf. `/getHorseResult`
-   [x] ~~各馬ごとの過去成績を参照する際に、 `entries` のデータだけを引っこ抜くと `metadata` に紐づく情報が一発で得られない…~~
    -   [x] ~~`entries.race_id` を参照して、entries + metadata を join したデータを返す処理が必要~~
    -   [x] ~~`metadata` のキーを作ってそこにぶら下げるというよりは、`RaceMetadata` + `ResultData` を作るイメージ~~
-   [x] ~~毎回コマンド実行するたびに、数十〜数百回のリクエストが走り、かなり出費が痛い~~
    -   ~~ENV.dev みたいな感じで、一部のファイルのみ出力するように設定したい~~
    -   KaisaiIds を メインレースのみに絞った
-   [x] ~~Saturday なのに JRA が表示されていない！~~
    -   ~~horse_id が振られていないばんえい競馬を除去するために `entries`　を弄ったからか？？？~~
    -   修正時に raceDomain を org そのまま渡していただけだった( JRA のときは `race`)

</details>
