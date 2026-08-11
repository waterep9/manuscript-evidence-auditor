# Manuscript Evidence Auditor

An evidence-chain audit CLI for chapter drafts and source libraries.

It does three things:

1. Scans manuscript folders and reference libraries
2. Detects citation traces, footnotes, and source sections
3. Emits coverage, unused sources, and risk signals

## Run

Requires Node.js 18+.

```powershell
npm test
node src/index.js "D:\青岛双百上合项目组"
```

## Bilingual mode / 双语模式

Use `--lang bilingual` to emit English and Chinese labels, summaries, risk details and manuscript signal details in the JSON report.

使用 `--lang bilingual` 可以在 JSON 报告中同时输出英文和中文的字段标签、摘要、风险说明和稿件问题说明。

```powershell
node src/index.js "D:\青岛双百上合项目组" --lang bilingual
```

Supported values: `en`, `zh`, `bilingual`.

Default output:

```text
<root>\reports\evidence-audit.json
```

## Design

- `src/fswalk.js` handles directory traversal
- `src/text.js` handles basic text extraction
- `src/references.js` handles reference trace detection
- `src/i18n.js` handles bilingual labels and messages
- `src/audit.js` handles report assembly

The project is read-only and never mutates the original drafts or source files.
