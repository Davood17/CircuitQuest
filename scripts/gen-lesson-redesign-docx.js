/* eslint-disable @typescript-eslint/no-require-imports -- Node document-generation script (not app code) */
/** Task 19 — assembler: builds the RTL Persian lesson-redesign docx (cover R4 + TOC + body). */
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, SectionType, TableOfContents, PageBreak,
} = require("docx");
const fs = require("fs");
const {
  P, run, para, h1, h2, label, body, line, listLine, goalsTable, buildCoverR4,
} = require("./lesson-doc-helpers");
const { frameworkParas, slidesA } = require("./lesson-doc-slides-a");
const { slidesB, pathIntro, pathList, goalsRows, closingPara } = require("./lesson-doc-slides-b");

const OUT = "/home/z/my-project/download/lesson-redesign-l0-1-fa.docx";
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1417, right: 1701 }; // mirrored for RTL binding

// ---------------------------------------------------------------- slide block renderer
function slideBlock(s) {
  return [
    h2(s.title),
    label("هدف آموزشی"),
    body(s.goal),
    label("متن اسلاید (نهایی و قابل نمایش)"),
    ...s.lines.map(line),
    label("پیشنهاد تصویر"),
    body(s.image),
    label("متن روی تصویر"),
    body(s.onImage),
    label("سؤال / تعامل"),
    body(s.interaction),
    label("پل به اسلاید بعد"),
    body(s.bridge, { after: 240 }),
  ];
}

// ---------------------------------------------------------------- headers & footers
const docHeader = () => new Header({
  children: [para(run("بازطراحی درس الکترونیک چیست؟ — سند محتوا", { size: 18, color: "888888" }), {
    after: 0, border: { bottom: { style: "single", size: 4, color: P.tbl.line, space: 4 } },
  })],
});
const pageNumFooter = () => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: { ascii: "Tahoma", hAnsi: "Tahoma" }, color: "888888" })],
  })],
});

// ---------------------------------------------------------------- cover config
const cover = buildCoverR4({
  titleLines: ["بازطراحی آموزشی", "درس «الکترونیک چیست؟»"],
  subtitle: "بازنویسی کامل اسلایدهای ۲ تا ۱۰ — محتوا، ساختار و پیشنهاد تصاویر",
  englishLabel: "LESSON REDESIGN - CIRCUITQUEST",
  metaLines: [
    "درس: الکترونیک چیست؟ — اولین درس سطح مقدماتی",
    "مخاطب: کودکان ۶ تا ۱۲ سال (دورهٔ ابتدایی)",
    "دامنه: اسلایدهای ۲ تا ۱۰ + نقشهٔ مسیر آموزشی",
    "وضعیت: پیش‌نویس محتوا برای بازبینی — بدون تغییر تصاویر",
  ],
  footerLeft: "سِرکوئست — مسیر یادگیری الکترونیک برای کودکان",
  footerRight: "سند شمارهٔ ۱ — نسخهٔ بازبینی",
});

// ---------------------------------------------------------------- TOC section children
const tocChildren = [
  para(run("فهرست مطالب", { size: 32, bold: true, color: P.primary }), {
    align: "c", before: 480, after: 360,
  }),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  para(run("یادآوری: این فهرست با کد فیلد ساخته می‌شود؛ پس از باز کردن سند در Word، برای به‌روز شدن شمارهٔ صفحه‌ها روی فهرست راست‌کلیک کنید و «Update Field» را انتخاب کنید.", {
    size: 18, color: "888888", italics: true,
  }), { before: 200 }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---------------------------------------------------------------- body children
const bodyChildren = [
  // 1. framework
  h1("۱. چارچوب بازطراحی"),
  ...frameworkParas.flatMap(({ h, t }) => [label(h), body(t)]),

  // 2. slides 2..10
  h1("۲. اسلایدهای بازطراحی‌شده (اسلاید ۲ تا ۱۰)"),
  body("هر اسلاید در هشت بخشِ مورد نیاز ارائه شده است: شماره و عنوان، هدف آموزشی، متن نهاییِ قابل نمایش، پیشنهاد تصویر، متن کوتاه روی تصویر، سؤال یا تعامل، و پل ارتباطی با اسلاید بعد. متن‌ها عیناً همان چیزی است که در برنامه به کودک نمایش داده می‌شود."),
  ...slidesA.flatMap(slideBlock),
  ...slidesB.flatMap(slideBlock),

  // 3. learning path
  h1("۳. مسیر آموزشی این بخش"),
  body(pathIntro),
  ...pathList.map(listLine),
  label("پوشش اهداف آموزشی درس"),
  body("جدول زیر نشان می‌دهد هر یک از اهداف آموزشی اعلام‌شده برای این بخش، دقیقاً در کدام اسلایدها پوشش داده شده است:"),
  goalsTable(goalsRows),
  para(run(closingPara), { align: "j", before: 200 }),
];

// ---------------------------------------------------------------- document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma" }, size: 24, color: P.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Tahoma", hAnsi: "Tahoma", cs: "Tahoma" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 300, after: 120, line: 312 } },
      },
    },
  },
  sections: [
    { // Section 1: cover — margin 0, no header/footer, no page number
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: cover,
    },
    { // Section 2: TOC — Roman numerals
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: { default: docHeader() },
      footers: { default: pageNumFooter() },
      children: tocChildren,
    },
    { // Section 3: body — Arabic numerals from 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: { default: docHeader() },
      footers: { default: pageNumFooter() },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("WROTE", OUT, buf.length, "bytes");
});
