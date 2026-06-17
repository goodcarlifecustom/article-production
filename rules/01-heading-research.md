# 01 見出し調査ルール

## 目的

`main_keyword`（既存互換で `keyword` も可）から検索意図を把握し、参考に適した上位3サイト相当のH2/H3を抽出する。優先順位は `main_keyword > keyword` とする。

## 入力

- `articles/{slug}/input.yml`
- `main_keyword` または `keyword`
- `title`
- `target_word_count`
- 任意: `reference_urls`

## reference_urls がある場合

- 検索結果ではなく、指定URLを1位〜3位相当として扱う。
- 指定URLからH2/H3を抽出する。
- 参考に不適切なURLが含まれる場合は、理由を `articles/{slug}/serp.md` に記録する。

## reference_urls がない場合

- `main_keyword` で検索し、検索結果から参考にできるSEO記事・アフィリエイト記事・比較記事・おすすめ記事を上位から3件選定する。
- 上位3件が不適切な場合は、順位を下げてでも参考になるSEO記事を3件探す。

## 参考対象にするページ

- アフィリエイト記事
- SEO記事
- 比較記事
- おすすめ記事
- 買取業者紹介記事
- ノウハウ記事
- 検索意図に合っている記事

## 除外するページ

- 公式サイト
- 官公庁、自治体、警察、運輸局などの公的機関
- Wikipedia
- Yahoo!知恵袋、教えてgoo、5ch、RedditなどのUGC
- ECサイト、通販サイト
- 中古車・バイク在庫データベースだけのページ
- YouTube、SNS、PDF
- 検索意図が明らかに異なるページ
- アフィリエイト記事・SEO記事ではないページ
- バイク買取MAXと関係ない旧メディア文脈

公的機関や公式情報は、見出し参考には使わず、外部リンク追加工程で信頼性補強として利用する。

## 検索失敗時の安全ルール

検索結果取得や競合サイトのH2/H3抽出に失敗した場合、上位3サイトや見出しを推測で作らない。

対応:

1. `reference_urls` が指定されている場合は、そのURLから見出し抽出を行う。
2. `reference_urls` がない場合は、`serp.md` と `check-report.md` に失敗理由を記録し、ユーザーに参考URLの指定を促す。

禁止:

- 架空の上位サイトを作る
- 競合見出しを推測で生成する
- 実際に取得していないURLを参考URLとして記録する

## 出力

必ず以下を作成する。

- `articles/{slug}/serp.md`
- `articles/{slug}/headings.csv`
- `articles/{slug}/heading-analysis.md`
- `articles/{slug}/heading-plan.md`

### serp.md

以下を記録する。

- main_keyword
- title
- target_word_count
- 検索日
- 参考にしたURL
- 参考にした順位
- 除外したURL
- 除外理由
- 参考サイトごとのタイトル
- 参考サイトごとのH2/H3概要

### headings.csv

列は以下に固定する。

```csv
rank,url,page_title,tag,heading_text,parent_h2,order
```

- `rank`: 1, 2, 3
- `tag`: h2 または h3
- `heading_text`: 抽出した見出し
- `parent_h2`: H3の場合、親H2を可能な範囲で入れる
- `order`: ページ内の出現順
