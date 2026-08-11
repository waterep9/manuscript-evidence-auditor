# 文稿证据链审计工具

用于章节稿件和资料库的证据链审计 CLI。

它做三件事：

1. 扫描稿件目录和参考资料目录
2. 识别引用痕迹、脚注痕迹和来源区块
3. 输出覆盖情况、未覆盖资料和风险提示

## 运行

需要 Node.js 18+。

```powershell
npm test
node src/index.js "D:\青岛双百上合项目组"
```

默认输出：

```text
<root>\reports\evidence-audit.json
```

## 设计

- `src/fswalk.js` 负责目录遍历
- `src/text.js` 负责基础文本抽取
- `src/references.js` 负责引用痕迹识别
- `src/i18n.js` 负责中文标签和消息
- `src/audit.js` 负责报告汇总

工具为只读模式，不会修改原始稿件和资料。
