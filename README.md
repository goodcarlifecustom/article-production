# Article Production Template

Codex cloudでSEO記事を作成し、HTML確認後にWordPressへ下書き投稿するためのテンプレートです。

## 基本フロー

1. `briefs/` に記事ごとの指示書を作成
2. Codex cloudに記事作成を依頼
3. `drafts/` にMarkdown記事を生成
4. `public/` にHTML確認版を生成
5. HTML確認後、WordPressへ下書き投稿

## よく使うコマンド

```bash
npm install
npm run html -- drafts/sample-article.md public/sample-article.html
npm run validate -- drafts/sample-article.md
npm run wp:draft -- drafts/sample-article.md
```

## 注意

- WordPress投稿は必ず `draft` 状態で行います。
- 認証情報は `.env` に保存し、GitHubへコミットしないでください。
- `.env.example` をコピーして `.env` を作成してください。
