/**
 * build_print.mjs — 2027 生涯探索年历 · A4 四合一打印版生成器
 *
 * 版式：一张 A4 纵向排 4 个 A5 页（2 列 × 2 行），每格 105 × 148.5 mm，
 *       A5 原稿 148 × 210 mm 等比缩放 0.70946 置入，四边留裁切线，无装订孔位。
 *
 * 用法：
 *   node build_print.mjs                        # 默认读同目录 2027生涯探索年历_data.json，输出到同目录
 *   node build_print.mjs --data xxx.json --out ./print
 *
 * 产物：
 *   print_index.html      屏幕入口（打印设置说明，本身不用于打印）
 *   print_year.html       全年：12 个月封面 + 365 天，共 377 个 A5 页
 *   print_m01..m12.html   按月分册：月封面 + 当月日页
 *   print_majors.html     24 个专业专属日
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));

function argOf(name, dflt) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const DATA_PATH = path.resolve(HERE, argOf('data', '2027生涯探索年历_data.json'));
const OUT_DIR = path.resolve(HERE, argOf('out', '.'));

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const MONTHS = data.months || [];
const DAYS = (data.days || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
const MAJORS = data.major_days || [];
const CARDS = data.cards || {};
const META = data.meta || {};

const COLOR = {
  锚定日: '#B4553C', 归档日: '#6B7A8F', 专业专属日: '#7C6AA8', 节气观察: '#2E7D6F',
  季度体检: '#C9A227', 周闭环: '#3F6E8C', 工具卡日: '#0F3D2E', 月度成果: '#B4553C', 弹性日: '#8A8F7E'
};
const LINE_NAME = { A: '升学', B: '就业', C: '创业', D: '考编', E: '参军' };

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
:root{ --ink:#1f2a24; --sub:#5b625c; --paper:#fffdf8; --line:#ddd6c6; }
@page{ size:A4 portrait; margin:0; }
*{ box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
html,body{ margin:0; padding:0; }
body{ background:#e7e4dc; font-family:"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif; color:var(--ink); }
.screen-note{ max-width:210mm; margin:8mm auto 6mm; background:#fff; border:1px solid #d8d2c4; border-left:4px solid #0F3D2E; border-radius:4px; padding:10px 14px; font-size:13px; line-height:1.75; color:#33403a; }
.screen-note b{ color:#0F3D2E; }
.screen-note code{ background:#f2efe6; padding:1px 5px; border-radius:3px; font-size:12px; }
.a4{ width:210mm; height:297mm; background:#fff; display:grid; grid-template-columns:105mm 105mm; grid-template-rows:148.5mm 148.5mm; overflow:hidden; margin:0 auto 6mm; box-shadow:0 2px 10px rgba(0,0,0,.16); page-break-after:always; break-after:page; }
.cell{ position:relative; width:105mm; height:148.5mm; overflow:hidden; }
.cell::after{ content:""; position:absolute; inset:0; border:0.2mm dashed #cfc9ba; pointer-events:none; z-index:5; }
.sheet{ position:absolute; left:0; top:0; width:148mm; height:210mm; padding:8.5mm 8.5mm 6.5mm; background:var(--paper); transform:scale(0.707143); transform-origin:top left; display:flex; flex-direction:column; }
.sheet .top{ display:flex; align-items:flex-end; justify-content:space-between; gap:3mm; border-bottom:0.7mm solid var(--c,#0F3D2E); padding-bottom:1.8mm; }
.dt{ font-size:19pt; font-weight:800; line-height:1; letter-spacing:.3pt; }
.dt small{ font-size:8.6pt; font-weight:600; color:#6b7169; margin-left:1.6mm; letter-spacing:0; }
.meta{ text-align:right; line-height:1.55; }
.chip{ display:inline-block; background:var(--c); color:#fff; padding:0.5mm 2mm; border-radius:1mm; font-size:7pt; font-weight:700; letter-spacing:.2pt; }
.lines{ display:block; margin-top:1mm; font-size:6.8pt; color:#5b625c; }
.sheet h1{ font-size:13.6pt; line-height:1.34; font-weight:800; margin:2.8mm 0 1.8mm; letter-spacing:.2pt; }
.desc{ font-size:8.5pt; line-height:1.6; color:#2c352f; margin:0 0 2.2mm; }
.kv{ display:flex; flex-wrap:wrap; gap:1.4mm 2.6mm; font-size:7.4pt; color:#4a534c; margin-bottom:2mm; }
.kv i{ font-style:normal; color:#9aa19a; }
.cbox{ border:0.35mm solid var(--line); border-radius:1.2mm; background:#fff; padding:2.6mm 3mm 2.8mm; }
.cbox .ch{ display:flex; justify-content:space-between; align-items:baseline; gap:2mm; font-size:8pt; font-weight:800; color:#0F3D2E; border-bottom:0.3mm dashed var(--line); padding-bottom:1.3mm; margin-bottom:1.8mm; }
.cbox .ch em{ font-style:normal; font-size:6.8pt; font-weight:600; color:#7b837c; }
.pool{ font-size:7.3pt; line-height:1.5; color:#4a534c; margin:0 0 1.6mm; }
ol.steps{ margin:0; padding-left:4.4mm; font-size:7.5pt; line-height:1.52; }
ol.steps li{ margin-bottom:0.7mm; }
.out{ margin-top:1.6mm; font-size:7.3pt; color:#33403a; background:#f5f2e8; border-radius:0.8mm; padding:1.3mm 1.8mm; }
.out b{ color:#0F3D2E; }
.vars{ display:flex; gap:1.5mm; margin-top:1.8mm; }
.vars div{ flex:1; background:#f6f3ea; border-radius:1mm; padding:1.2mm 1.4mm; font-size:6.6pt; line-height:1.45; color:#4a534c; }
.vars div b{ display:block; color:#0F3D2E; font-size:6.8pt; margin-bottom:0.5mm; }
.hook{ margin-top:1.8mm; font-size:7.2pt; line-height:1.5; color:#7a5a3a; background:#fdf6ea; border-left:0.8mm solid #d9a55a; padding:1.6mm 2mm; }
.foot{ margin-top:auto; padding-top:1.2mm; border-top:0.25mm solid #e6e0d2; display:flex; justify-content:space-between; font-size:6.4pt; color:#9aa19a; letter-spacing:.2pt; }
/* 月封面 */
.sheet.mon{ justify-content:flex-start; }
.sheet.mon .mnum{ font-size:44pt; font-weight:800; line-height:.86; color:var(--c,#0F3D2E); letter-spacing:-1pt; }
.sheet.mon .mttl{ font-size:15pt; font-weight:800; margin-top:2mm; }
.sheet.mon .mq{ margin-top:3.5mm; font-size:9.4pt; line-height:1.65; color:#2c352f; background:#f5f2e8; border-left:1mm solid var(--c,#0F3D2E); padding:2.6mm 3mm; }
.mrow{ margin-top:2.4mm; font-size:7.8pt; line-height:1.55; color:#33403a; }
.mrow b{ color:#0F3D2E; display:inline-block; min-width:11mm; }
.pool-chips{ margin-top:3mm; display:flex; flex-wrap:wrap; gap:1.2mm; }
.pool-chips span{ background:#f0ece0; border-radius:0.8mm; padding:0.9mm 1.6mm; font-size:6.8pt; color:#4a534c; }
/* 专业日页 */
.sheet.maj .anchor{ margin-top:2.4mm; font-size:7.6pt; color:#5b4a86; background:#f3f0fa; border-radius:1mm; padding:1.8mm 2.2mm; line-height:1.5; }
.sheet.maj .reason{ margin-top:2mm; font-size:7.8pt; line-height:1.55; color:#2c352f; }
.sheet.maj ol{ margin:1.8mm 0 0; padding-left:4.4mm; font-size:7.6pt; line-height:1.55; }
.sheet.maj ol li{ margin-bottom:0.9mm; }
@media screen{
  .a4{ margin-top:0; }
  .a4:first-of-type{ margin-top:6mm; }
}
@media print{
  body{ background:#fff; }
  .screen-note{ display:none !important; }
  .a4{ margin:0 !important; box-shadow:none !important; }
  .a4:last-of-type{ page-break-after:auto; break-after:auto; }
  .cell::after{ border-color:#d8d2c4; }
}
`;

function head(title) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head><body>
`;
}

function noteScreen(text) {
  return `<div class="screen-note">${text}</div>`;
}

/* ---------- A5 单页 ---------- */

function sheetDay(d, idx, total, monthLabel) {
  const c = COLOR[d.type] || '#0F3D2E';
  const card = CARDS[d.card] || null;
  const mmdd = String(d.mmdd || '');
  const md = mmdd.length === 4 ? `${Number(mmdd.slice(0, 2))}月${Number(mmdd.slice(2))}日` : (d.date || '');
  const lineTxt = (d.lines && d.lines.length) ? '走向 ' + d.lines.map((x) => `${x}${LINE_NAME[x] || ''}`).join(' / ') : '通用（不分线）';
  const steps = card && Array.isArray(card.steps) ? card.steps : [];
  const variants = (card && card.variants && d.lines) ? d.lines.filter((x) => card.variants[x]).map((x) => ({ k: x, v: card.variants[x] })) : [];
  return `<div class="cell"><section class="sheet" style="--c:${c}">
  <div class="top">
    <div class="dt">${esc(md)}<small>${esc(d.weekday || '')}</small></div>
    <div class="meta"><span class="chip">${esc(d.type || '')}</span><span class="lines">${esc(lineTxt)}</span></div>
  </div>
  <h1>${esc(d.title || '')}</h1>
  <p class="desc">${esc(d.desc || '')}</p>
  <div class="kv">
    ${d.minutes ? `<span><i>用时</i> ${esc(d.minutes)} 分钟</span>` : ''}
    ${d.material ? `<span><i>材料</i> ${esc(d.material)}</span>` : ''}
  </div>
  ${card ? `<div class="cbox">
    <div class="ch"><span>工具卡 ${esc(card.code)} · ${esc(card.name)}</span><em>${esc(card.minutes || '')}${card.minutes ? ' 分钟' : ''}${card.star ? ' · 核心卡' : ''}</em></div>
    ${card.pool ? `<p class="pool">${esc(card.pool)}</p>` : ''}
    <ol class="steps">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    ${card.output ? `<div class="out"><b>本卡产出：</b>${esc(card.output)}</div>` : ''}
    ${variants.length ? `<div class="vars">${variants.map((x) => `<div><b>${esc(x.k)} ${esc(LINE_NAME[x.k] || '')}</b>${esc(x.v)}</div>`).join('')}</div>` : ''}
  </div>` : ''}
  ${d.hook ? `<div class="hook">${esc(d.hook)}</div>` : ''}
  <div class="foot"><span>2027 生涯探索年历 · ${esc(monthLabel || '')}</span><span>第 ${idx} / ${total} 页</span></div>
</section></div>`;
}

function sheetMonth(m, idx, total) {
  const pool = (m.pool || []).map((k) => {
    const cc = CARDS[k];
    return `<span>${esc(k)}${cc ? ' ' + esc(cc.name) : ''}</span>`;
  }).join('');
  return `<div class="cell"><section class="sheet mon" style="--c:${(data.meta && data.meta.month_colors && data.meta.month_colors[m.month]) || '#0F3D2E'}">
  <div class="mnum">${String(m.month).padStart(2, '0')}</div>
  <div class="mttl">${esc(m.name)}　${esc(m.title)}</div>
  <div class="mq">${esc(m.core_question || '')}</div>
  <div class="mrow"><b>本月目标</b>${esc(m.goal || '')}</div>
  <div class="mrow"><b>做法</b>${esc(m.method || '')}</div>
  <div class="mrow"><b>月度产出</b>${esc(m.output || '')}</div>
  <div class="mrow"><b>节奏</b>${esc(m.rhythm || '')}</div>
  ${m.line_note ? `<div class="mrow"><b>分线提示</b>${esc(m.line_note)}</div>` : ''}
  <div class="pool-chips">${pool}</div>
  <div class="foot"><span>2027 生涯探索年历 · 月封面</span><span>第 ${idx} / ${total} 页</span></div>
</section></div>`;
}

function sheetMajor(md, idx, total) {
  const acts = (md.actions || []).map((a) => `<li>${esc(a.text)}</li>`).join('');
  const rel = (md.cards || []).map((k) => {
    const cc = CARDS[k];
    return `<span>${esc(k)}${cc ? ' ' + esc(cc.name) : ''}</span>`;
  }).join('');
  return `<div class="cell"><section class="sheet maj" style="--c:#7C6AA8">
  <div class="top">
    <div class="dt" style="font-size:15pt">${esc(md.major)}</div>
    <div class="meta"><span class="chip" style="--c:#7C6AA8;background:#7C6AA8">专业专属日</span><span class="lines">${esc(md.date || '')}　${esc(md.weekday || '')}</span></div>
  </div>
  <h1 style="font-size:11.6pt;color:#5b4a86">${esc(md.college || '')}　·　${esc(md.anchor || '')}</h1>
  <div class="reason">${esc(md.reason || '')}</div>
  <div class="anchor">材料：${esc(md.materials || '')}　|　用时：${esc(md.minutes || '')} 分钟　|　产出：${esc(md.output || '')}</div>
  <ol>${acts}</ol>
  ${rel ? `<div class="pool-chips">${rel}</div>` : ''}
  <div class="foot"><span>2027 生涯探索年历 · 专业专属日</span><span>第 ${idx} / ${total} 页</span></div>
</section></div>`;
}

/* ---------- A4 拼版 ---------- */
function a4Pages(cells) {
  const out = [];
  for (let i = 0; i < cells.length; i += 4) {
    const four = cells.slice(i, i + 4);
    while (four.length < 4) four.push('<div class="cell"></div>');
    out.push(`<section class="a4">${four.join('')}</section>`);
  }
  return out;
}

function writePage(file, title, note, cells) {
  const pages = a4Pages(cells);
  const html = head(title) + noteScreen(note) + pages.join('\n') + '\n</body></html>\n';
  fs.writeFileSync(path.join(OUT_DIR, file), html, 'utf8');
  return { file, a5: cells.length, a4: pages.length, kb: Math.round(Buffer.byteLength(html) / 1024) };
}

/* ---------- 组装 ---------- */
fs.mkdirSync(OUT_DIR, { recursive: true });
const results = [];
const baseNote = (what) => `<b>打印设置</b>：Ctrl+P → 纸张 <code>A4 纵向</code>、缩放 <code>默认（100%）</code>、边距 <code>无</code>、勾选 <code>背景图形</code>。每张 A4 排 4 个 A5 页（左上 → 右上 → 左下 → 右下），格间虚线为裁切线，裁开后即为 A5 卡片，<b>无装订孔位</b>。本说明不参与打印。${what ? '　' + what : ''}`;

// 1) 全年
{
  const cells = [];
  const total = MONTHS.length + DAYS.length;
  let n = 0;
  for (const m of MONTHS) {
    n++; cells.push(sheetMonth(m, n, total));
    const mdays = DAYS.filter((d) => d.month === m.month);
    for (const d of mdays) { n++; cells.push(sheetDay(d, n, total, m.name)); }
  }
  results.push(writePage('print_year.html', '2027 生涯探索年历 · 全年打印版（A4 四合一）', baseNote(`全年 ${total} 个 A5 页，共 ${Math.ceil(total / 4)} 张 A4。`), cells));
}

// 2) 按月
for (const m of MONTHS) {
  const mdays = DAYS.filter((d) => d.month === m.month);
  const cells = [];
  const total = 1 + mdays.length;
  cells.push(sheetMonth(m, 1, total));
  mdays.forEach((d, i) => cells.push(sheetDay(d, i + 2, total, m.name)));
  const fn = `print_m${String(m.month).padStart(2, '0')}.html`;
  results.push(writePage(fn, `2027 生涯探索年历 · ${m.name}打印版（A4 四合一）`, baseNote(`${m.name}共 ${total} 个 A5 页，共 ${Math.ceil(total / 4)} 张 A4。`), cells));
}

// 3) 专业日
{
  const cells = MAJORS.map((md, i) => sheetMajor(md, i + 1, MAJORS.length));
  results.push(writePage('print_majors.html', '2027 生涯探索年历 · 24 专业专属日打印版（A4 四合一）', baseNote(`24 个专业专属日，共 ${Math.ceil(MAJORS.length / 4)} 张 A4。`), cells));
}

// 4) 入口页
{
  const rows = results.map((r) => `<tr><td><a href="${r.file}">${r.file}</a></td><td>${r.a5}</td><td>${r.a4}</td><td>${r.kb} KB</td></tr>`).join('');
  const html = head('2027 生涯探索年历 · 打印版入口') + `
<div style="max-width:820px;margin:40px auto;font-family:'Microsoft YaHei',sans-serif;color:#1f2a24;line-height:1.8">
  <h1 style="font-size:22px;color:#0F3D2E;margin-bottom:6px">2027 生涯探索年历 · A4 四合一打印版</h1>
  <p style="color:#5b625c;margin-top:0">每张 A4 排 4 个 A5 页，格间虚线裁切，无装订孔位。全部单文件、零外链，离线可打印。</p>
  <div style="background:#fdf6ea;border-left:4px solid #d9a55a;padding:12px 16px;border-radius:4px;font-size:14px">
    <b>打印设置</b>：Ctrl+P → 纸张 <b>A4 纵向</b>、缩放 <b>默认 100%</b>、边距 <b>无</b>、勾选 <b>背景图形</b>。
  </div>
  <table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:14px">
    <thead><tr style="background:#0F3D2E;color:#fff"><th style="padding:8px;text-align:left">文件</th><th style="padding:8px">A5 页</th><th style="padding:8px">A4 张</th><th style="padding:8px">大小</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size:13px;color:#7b837c;margin-top:18px">重新生成：<code>node build_print.mjs</code>（改数据后重跑，勿手改 HTML）。</p>
</div>
</body></html>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'print_index.html'), html, 'utf8');
}

console.log('数据:', DATA_PATH);
console.log('输出:', OUT_DIR);
for (const r of results) console.log(`  ${r.file.padEnd(22)} A5=${String(r.a5).padStart(4)}  A4=${String(r.a4).padStart(3)}  ${r.kb} KB`);
console.log(`合计 A5=${results.reduce((s, r) => s + r.a5, 0)}  A4=${results.reduce((s, r) => s + r.a4, 0)}`);
