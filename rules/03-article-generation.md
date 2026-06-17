# 03 記事本文生成ルール

## 目的

確定した `heading-plan.md` をもとに、バイク買取MAXへの送客を意識したSEO記事を作成する。

## 必須入力

本文作成時は、必ず以下を入力として使う。

- `articles/{slug}/input.yml`
- `articles/{slug}/serp.md`
- `articles/{slug}/headings.csv`
- `articles/{slug}/heading-analysis.md`
- `articles/{slug}/heading-plan.md`

## 本文作成

- `heading-plan.md` のH2/H3順を維持する。
- 勝手にH2/H3を増やさない。
- 必要な補足は本文中に入れる。
- `target_word_count` を目標文字数として使う。
- 目標文字数の±15%を目安にする。
- 大きく不足する場合は、本文を補強する。
- 無理に冗長にしない。
- 結論ファーストで書く。
- 初心者にもわかる表現にする。
- バイク買取MAXへの自然な相談導線を入れる。
- 誇大表現や根拠のないNo.1表現は使わない。
- 検索順位や査定額を保証する表現は禁止。
- 不自然なKW連呼は禁止。
- 法律・手続き・税金・保険は断定しすぎない。
- 公的情報や公式情報が必要な箇所には外部リンク工程で補強する。

## 出力

- `articles/{slug}/draft.md`
- `articles/{slug}/article.html`
