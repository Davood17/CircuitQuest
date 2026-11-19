/* eslint-disable @typescript-eslint/no-require-imports -- Node document-generation script (not app code) */
/**
 * Task 19 — Lesson redesign dossier (RTL Persian docx)
 * «الکترونیک چیست؟» slides 2–10 full content redesign for CircuitQuest (l0-1).
 * Cover: recipe R4 (Top Color Block) + DM-1 palette, RTL-adapted (symmetric pads,
 * bidi paragraphs with start-alignment). All structural rules of the recipe kept:
 * 16838 exact wrapper, allNoBorders, dynamic title layout & spacing, divider.
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, NumberFormat, AlignmentType, HeadingLevel,
  WidthType, BorderStyle, ShadingType, SectionType, TableOfContents,
  PageBreak, TableLayoutType,
} = require("docx");
const fs = require("fs");

// ---------------------------------------------------------------- palette
const P = {
  bg: "162235", accent: "37DCF2",
  titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "6E7680", footerColor: "687078",
  primary: "0F3E47", body: "000000", quoteText: "0F172A",
  tbl: { headerBg: "1B6B7A", headerText: "FFFFFF", line: "C8DDE2", surface: "EDF3F5" },
};
const FONT = { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma" };

// ---------------------------------------------------------------- helpers
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { ...noBorders, insideHorizontal: NB, insideVertical: NB };
const emptyPara = () => new Paragraph({ children: [] });

/** Persian/Latin run — rtl + complex-script mirrors so Word sizes Persian text correctly */
function run(text, opts = {}) {
  const size = opts.size || 24;
  return new TextRun({
    text, font: FONT, size, sizeComplexScript: size,
    bold: opts.bold || false, boldComplexScript: opts.bold || false,
    italics: opts.italics || false, rightToLeft: opts.ltr ? false : true,
    color: opts.color || P.body,
  });
}

/** RTL paragraph; alignment omitted by default -> bidi start (= right). Use "j" for justified, "c" for centered. */
function para(children, opts = {}) {
  const alignment = opts.align === "j" ? AlignmentType.JUSTIFIED
    : opts.align === "c" ? AlignmentType.CENTER : undefined;
  return new Paragraph({
    bidirectional: opts.ltr ? false : true,
    alignment,
    heading: opts.heading,
    keepNext: opts.keepNext || false,
    spacing: {
      line: opts.lineOverride || 312, lineRule: opts.lineRule || undefined,
      before: opts.before || 0, after: opts.after == null ? 120 : opts.after,
    },
    indent: opts.indent,
    border: opts.border,
    shading: opts.shading,
    children: Array.isArray(children) ? children : [children],
  });
}

const h1 = (text) => para(run(text, { size: 32, bold: true, color: P.primary }), {
  heading: HeadingLevel.HEADING_1, before: 360, after: 160, keepNext: true,
});
const h2 = (text) => para(run(text, { size: 28, bold: true, color: P.primary }), {
  heading: HeadingLevel.HEADING_2, before: 300, after: 120, keepNext: true,
});
const label = (text) => para(run(text, { bold: true, color: P.primary }), {
  before: 160, after: 60, keepNext: true,
});
const body = (text, opts = {}) => para(run(text, opts.run || {}), { align: "j", after: 120, ...opts });

/** kid-facing display line — light surface card, direction-neutral shading */
const line = (text) => para(run(text, { color: P.quoteText }), {
  after: 60,
  indent: { left: 200, right: 200 },
  shading: { type: ShadingType.CLEAR, fill: P.tbl.surface },
});
const bullet = (text) => new Paragraph({
  bidirectional: true, bullet: { level: 0 },
  spacing: { line: 312, after: 80 },
  children: [run(text)],
});

/** list-style line without bullet engine (robust across engines) — items read as a list */
const listLine = (text) => para(run(text), {
  after: 80,
  indent: { left: 240, right: 240 },
});

/** goal-coverage table (RTL) */
function goalsTable(rows) {
  const cell = (text, opts = {}) => new TableCell({
    width: { size: opts.w, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: opts.fill || "FFFFFF" },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [para(run(text, { size: 22, bold: opts.bold || false, color: opts.color || P.body }), { after: 0 })],
  });
  return new Table({
    visuallyRightToLeft: true,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: P.tbl.line },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: P.tbl.line },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: P.tbl.line },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: P.tbl.line },
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: [
          cell("هدف آموزشی کودک", { w: 62, fill: P.tbl.headerBg, color: P.tbl.headerText, bold: true }),
          cell("کجا پوشش داده می‌شود", { w: 38, fill: P.tbl.headerBg, color: P.tbl.headerText, bold: true }),
        ],
      }),
      ...rows.map(([goal, where], i) => new TableRow({
        cantSplit: true,
        children: [
          cell(goal, { w: 62, fill: i % 2 ? P.tbl.surface : "FFFFFF" }),
          cell(where, { w: 38, fill: i % 2 ? P.tbl.surface : "FFFFFF" }),
        ],
      })),
    ],
  });
}

// ---------------------------------------------------------------- cover (R4, RTL-adapted)
/** Persian-aware title layout: same dynamic sizing/orphan rules as calcTitleLayout,
 *  char width ~ pt*11 twips (Persian glyphs are narrower than CJK pt*20). */
function calcTitleLayoutFa(lines, maxWidthTwips, preferredPt = 38, minPt = 26) {
  const widest = Math.max(...lines.map((l) => l.length));
  let pt = preferredPt;
  while (pt > minPt && widest * pt * 11 > maxWidthTwips) pt -= 2;
  return { titlePt: pt, titleLines: lines };
}

function buildCoverR4(config) {
  const pad = 1200;
  const availableWidth = 11906 - pad * 2;
  const { titlePt, titleLines } = calcTitleLayoutFa(config.titleLines, availableWidth, 38, 26);
  const titleSize = titlePt * 2;

  const titleBlockHeight = titleLines.length * (titlePt * 23 + 200);
  const englishLabelH = config.englishLabel ? (9 * 23 + 500) : 0;
  const subtitleH = config.subtitle ? (12 * 23 + 200) : 0;
  const upperContentH = englishLabelH + titleBlockHeight + subtitleH;
  const UPPER_H = Math.max(7500, upperContentH + 1500 + 800);
  const DIVIDER_H = 60;
  const spacerIntrinsic = 280;
  const topSpacing = Math.max(UPPER_H - upperContentH - spacerIntrinsic - 800, 400);

  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        verticalAlign: "top",
        margins: { left: pad, right: pad },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          config.englishLabel ? new Paragraph({
            alignment: AlignmentType.RIGHT, spacing: { after: 500 },
            children: [new TextRun({
              text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Tahoma", hAnsi: "Tahoma" }, characterSpacing: 60,
            })],
          }) : null,
          ...titleLines.map((t, i) => para(run(t, { size: titleSize, bold: true, color: P.titleColor }), {
            after: i < titleLines.length - 1 ? 100 : 200,
            lineOverride: Math.ceil(titlePt * 23), lineRule: "atLeast",
          })),
          config.subtitle ? para(run(config.subtitle, { size: 24, color: P.subtitleColor }), { after: 100 }) : null,
        ].filter(Boolean),
      })],
    })],
  });

  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({
        borders: noBorders,
        shading: { type: ShadingType.CLEAR, fill: P.accent }, children: [emptyPara()],
      })],
    })],
  });

  const lowerContent = [
    new Paragraph({ spacing: { before: 800 } }),
    ...(config.metaLines || []).map((t) => para(run(t, { size: 28, color: P.metaColor }), {
      after: 100, indent: { left: pad, right: pad },
    })),
    new Paragraph({ spacing: { before: 2000 } }),
    para(
      [
        run(config.footerLeft || "", { size: 22, color: "909090", ltr: false }),
        new TextRun({ text: "          ", font: FONT }),
        run(config.footerRight || "", { size: 22, color: "909090", ltr: false }),
      ],
      { after: 0, indent: { left: pad, right: pad } },
    ),
  ];

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: "FFFFFF" }, borders: noBorders,
        verticalAlign: "top",
        children: [upperBlock, divider, ...lowerContent],
      })],
    })],
  })];
}

module.exports = { P, FONT, run, para, h1, h2, label, body, line, bullet, listLine, goalsTable, buildCoverR4, NB, noBorders, allNoBorders };
