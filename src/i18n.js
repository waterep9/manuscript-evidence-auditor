'use strict';

const LABELS = {
  rootDir: '根目录',
  outputPath: '输出路径',
  manuscriptCount: '稿件数量',
  sourceCount: '资料数量',
  risks: '风险提示',
  unusedSources: '未覆盖资料'
};

const RISK_MESSAGES = {
  missing_reference_blocks: '至少一份稿件缺少明确的参考资料或来源区块。',
  low_source_consumption: '资料库中较大比例的资料没有在稿件文本中形成可见消耗。'
};

const SIGNAL_MESSAGES = {
  text_too_short: '抽取文本过短，证据链审计可靠性不足。',
  no_reference_section: '未发现明确的参考资料、脚注或来源区块。',
  no_source_match: '未发现与该稿件形成可见匹配的资料文件名。'
};

function labelsFor() {
  return LABELS;
}

function riskDetails(codes) {
  return codes.map((code) => ({ code, message: RISK_MESSAGES[code] || code }));
}

function signalDetails(codes) {
  return codes.map((code) => ({ code, message: SIGNAL_MESSAGES[code] || code }));
}

function summaryFor(report) {
  return `已扫描 ${report.manuscriptCount} 份稿件和 ${report.sourceCount} 份资料，发现 ${report.riskCodes.length} 项项目级风险。`;
}

module.exports = {
  labelsFor,
  riskDetails,
  signalDetails,
  summaryFor
};
