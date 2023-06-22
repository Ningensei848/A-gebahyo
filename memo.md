## TODO:

- [ ] Contribute 環境の整備
    - [ ] サンプル MDX の準備
    - [ ] Contribute.md を書く
-   [ ] Top ページ(Home) の自動生成
-   [ ] PieChart の充実
-   [ ] 自動ツイート
    -   [ ] Pub/Sub の準備
    -   [ ] ツイートする関数の作成＆デプロイ
    -   [ ] Scheduler の準備スクリプト
    -   [ ] Scheduler のお片付けスクリプト
    -   [ ] ↑ を実施する `Actions.yml`
-   [ ] `prism-react-renderer` のバージョンを上げるかどうか検証
-   [x] Google Tag Manager の準備
-   [ ] Feed
-   [x] search console
-   [x] adsense
    -   [x] サイト全体の見た目を整える
-   [x] 体重グラフ　横 padding
-   [x] コーナー順位　横 padding
-   [x] 出力できなかったレースについて、ログを残す
-   [x] eta template の分割
    -   [x] 新馬戦にも体重とかコーナーの遷移があるので消す

## カイゼン

-   強いビルド環境
-   result_table の見た目を調整 by CSS
-   タグ検索したときの表示順制御 → BlogTagsPostsPage とか BlogTagsPostsPageContent
    -   `tags` ページでの並ぶ順を、「アルファベット順」から「更新順」にすげ替える

## あとまわし

-   ~~もし金曜だったら、土日のレースの記事を生成する機能~~
-   `husky` `lint-staged` 等の開発時に便利な機能のカスタマイズ
-   検索機能
-   タグ検索したときの表示順制御 → BlogTagsPostsPage とか BlogTagsPostsPageContent
    -   `tags` ページでの並ぶ順を、「アルファベット順」から「更新順」にすげ替える
-   PoC: 関数それ自体も props として与えれば、eta 側でも使えるんじゃね？　 → 　 getRecordsFromPreviousResult() を eta 側でやらせたほうが、より並列化されるため

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

頻度について：

-   ~~当日の最終レースが NAR の最も遅いもので 20:30 発走とか~~
-   ~~なので、次の日のレースについてはそのくらいの時間には……と考えていたら、未だ内容が更新されないことがある~~
-   ~~時間を区切るか、~~複数回の更新が必要
    -   ~~21:30 には終わっとるやろ！ｗ　ということで、cron を UTC 12:34 に設定~~
    -   よる２１時くらい＋朝８時くらいの２回更新

セキュリティのやつ：　https://engineering.mercari.com/blog/entry/20230609-github-actions-guideline/

-   repoA: eta.js で MDX 生成 & index.mdx だけ main にプッシュ & `/docs/YYYY/*` を repoB に push
-   repoB: repoA を clone してきて main にある `/docs/YYYY/*` をビルド & ホスト先にデプロイ

repoA は public にして、repoB は private にしておく
（ロジックは公開するが、コンテンツはあくまで非公開）

-   GitHub Actions で コンテンツ生成
-   Cloudflare Pages でビルド&デプロイ

    -   files limit が 20000 なので、案外早く利用不能になりそう

-   GitHub Pages の場合はもっと少なくて、1GB に達してはいけないようだ

-   結局のところ、長期利用を考えると上記以外のクラウドサービスを利用することになりそうだ
-   ローンチから一年までは Cloudflare pages それ以降は GCS + Cloud CDN みたいな構成か

-   eta の部分は計算機が貧弱でもある程度耐えるが、ビルド部分には強力な物が必要
-   スポット利用できる仕組みを考案せねばならない……
    -   Cloud Build ? Cloud Deploy ?
    -   GitHub x GCP は OIDC 連携するとセキュリティ的に安心

## ぶつかった壁

-   [ ] ばんえい競馬を排除するロジックの構築

## フィードバックのメモ

-   ユーザ目線で考えていない
-   マネタイズするならもっと工夫をこらす必要がある
-   見るだけになってて良くない、もっとインタラクティブを

## ロゴに関する覚書

-   cf. https://www.designevo.com/apps/logo/?name=circle-abstract-seahorse
-   font
    -   title: audiowide
    -   sub: play
-   color ... #2e5e85, #a1c2df

## その他

<!-- ---------------------------------------------------------------------- -->

<details>
<summary>完了済みタスクとか諸々</summary>

-   config と metadata(by frontmatter) は異なることに留意
-   frontmatter を見て調整
    https://docusaurus.io/docs/next/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter

## 実際に出力してみる

-   race_id ごとのページ、およびそれらを一覧するページ（ポータル、というかインデックス）がほしい

    -   `each_race`, `kaisai_index` でそれぞれ対応する
    -   `each_race` では race のメタデータ情報が得られるので、それを元に `kaisai_index` を作る方が良さそう

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
-   ~~[x] 前夜から計画を立てるのだから、生成するのは明日のレースに対する記事~~

## リリース時に最低限必要な機能

-   [x] ページ共有機能 → docs 向けに Swizzling (cf. DocItem) する
-   [x] twitter 検索への導線をつくるとか → 　馬名のハッシュタグ化
-   ~~[x] ReCharts での可視化~~
    -   ~~[x] Hello world~~
    -   ~~[x] 自動生成~~
    -   ~~[x] 複勝圏内をカスタムドット https://recharts.org/en-US/examples/CustomizedDotLineChart~~
        -   https://iconmonstr.com/star-3-svg/
-   ~~[x] （最優先）JRA 出力されてない問題の解決~~

## Github Actions

### repo A (A-gebahyo)

-   [x] `.gitignore` で `content/docs/202*` を除く
-   [x] GitHub Actions は未定
-   [x] GitHub Pages は無し

### repo B (Content Repository)

-   [x] `content/docs/202*` のみを置く
-   [x] GitHub Actions を毎日実行
    -   [x] checkout 後に repo A を clone する & `content/docs/` 以下に移動させてビルド
    -   [x] ビルド（記事生成＋ブログ出力）
-   ~~[x] GitHub Pages を Private の上で設定~~

</details>
<!-- ---------------------------------------------------------------------- -->
