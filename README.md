# Manuscript Evidence Auditor

一个用于章稿与资料库的证据链审计 CLI。

它做三件事：

1. 扫描成稿目录与参考资料目录
2. 识别文稿中的引用痕迹、脚注痕迹和来源块
3. 输出覆盖率、未消耗资料和风险提示

## 运行

需要 Node.js 18+。

```powershell
npm test
node src/index.js "D:\青岛双百上合项目组"
```

默认输出到：

```text
<root>\reports\evidence-audit.json
```

## 设计

- `src/fswalk.js` 负责目录遍历
- `src/text.js` 负责基础文本抽取
- `src/references.js` 负责引用痕迹识别
- `src/audit.js` 负责审计汇总

项目保持只读，不修改原始成稿和资料。
