# 99 品質チェックルール

## 目的

投稿前に記事・HTML・設定の重大な不備を検出する。

## チェック項目

- 必須ファイルが存在するか
- `draft.md`、`article.html`、`article-linked.html`、`article-decorated.html` が空でないか
- `article-decorated.html` に外部リンクが含まれるか
- `article-decorated.html` は存在だけでなく、HTMLタグを除いた本文500文字以上があるか
- 本文500文字未満の場合はWordPress下書き投稿へ進まないか
- WordPress投稿対象が `article-decorated.html` になっているか
- 途中生成HTMLを投稿対象として使う記述が残っていないか
- `post_to_wp: true` の場合のみ投稿工程に進む仕様になっているか
- `post_to_wp` の初期推奨値が `false` で、未指定時に勝手にWordPress投稿しないか
- 投稿ステータスが `draft` 以外になっていないか
- 公開状態の投稿指示が入っていないか
- `.env` がコミット対象になっていないか

## 実行

```bash
npm run check -- --slug {slug}
```

## 出力

`articles/{slug}/check-report.md` に結果を保存する。失敗時は原因と次アクションを必ず記録する。
