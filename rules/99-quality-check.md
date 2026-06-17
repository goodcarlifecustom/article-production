# 99 品質チェックルール

## 目的

投稿前に記事・HTML・設定の重大な不備を検出する。

## 必須ファイル

- `input.yml`
- `serp.md`
- `headings.csv`
- `heading-analysis.md`
- `heading-plan.md`
- `draft.md`
- `article.html`
- `article-linked.html`
- `article-decorated.html`
- `external-links.md`

## チェック項目

- `heading-plan.md` が存在する
- `heading-plan.md` が空でない
- `heading-plan.md` がHTMLタグのみで構成されている
- `heading-plan.md` に `<h2>` が3つ以上ある
- `heading-plan.md` に `<h3>` が必要に応じてある
- `heading-plan.md` にH1がない
- `outline.md` が存在しない
- `article-decorated.html` が存在する
- `article-decorated.html` のHTMLタグ除去後本文が500文字以上
- `target_word_count` がある場合、記事本文が目標文字数に対して極端に短すぎない
- `post_to_wp` 未指定またはfalseの場合、WordPress投稿しない
- 投稿ステータスが `draft` 以外になっていないか
- `.env` がコミット対象になっていないか
- 認証情報がファイルに残っていない
- WordPressアプリケーションパスワード、認証ヘッダー、Basic認証値、nonce、preview token が残っていない

## 実行

```bash
npm run check -- --slug {slug}
```

## 出力

`articles/{slug}/check-report.md` に結果を保存する。失敗時は原因と次アクションを必ず記録する。
