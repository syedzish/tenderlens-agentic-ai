const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_UPLOAD_FILES = 5;
const supportedExt = [".pdf", ".txt", ".md", ".docx", ".jpg", ".jpeg", ".png", ".webp"];

const state = {
  language: "en",
  activeTab: "analysis",
  activeRow: 0,
  activeSlide: 0,
  onboardingSlide: 0,
  currentResult: null,
  uploadedFiles: [],
  analysisSource: "empty",
  voiceStream: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const ICONS = Object.freeze({
  "upload-cloud": '<path d="M12 13v8"/><path d="m8 17 4-4 4 4"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H3Z"/><path d="M21 18a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h6Z"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  files: '<path d="M15 2H6a2 2 0 0 0-2 2v14"/><path d="M8 6h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M11 12h6"/><path d="M11 16h4"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  "file-check": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-5"/>',
  "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/><path d="M8 9h2"/>',
  "rotate-ccw": '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  gauge: '<path d="M20.2 14.2a8 8 0 1 0-16.4 0"/><path d="M12 14l3-3"/><path d="M8 19h8"/>',
  "clipboard-check": '<path d="M9 3h6"/><path d="M10 2h4a2 2 0 0 1 2 2v1H8V4a2 2 0 0 1 2-2Z"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="m9 14 2 2 4-5"/>',
  "message-circle": '<path d="M21 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.3-5A8.5 8.5 0 1 1 21 11.5Z"/>',
  network: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.6 7.5 10.8 15"/><path d="m15.4 7.5-2.2 7.5"/><path d="M9 6h6"/>',
  presentation: '<path d="M2 3h20v14H2z"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  "circle-help": '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.6-1.4 1.1-1.4 2.1"/><path d="M12 17h.01"/>',
  "triangle-alert": '<path d="m21.7 18-8.9-15.4a1 1 0 0 0-1.7 0L2.3 18a1 1 0 0 0 .9 1.5h17.6a1 1 0 0 0 .9-1.5Z"/><path d="M12 8v5"/><path d="M12 16h.01"/>',
  "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.4 8.8a2 2 0 0 1-1.2 0C7.5 20.5 4 18 4 13V5l8-3 8 3Z"/><path d="m9 12 2 2 4-5"/>',
  "search-check": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8.5 11 1.7 1.7 3.4-4"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
});

function iconMarkup(name) {
  const paths = ICONS[name] || ICONS["circle-help"];
  return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function hydrateIcons(scope = document) {
  scope.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = iconMarkup(node.dataset.icon);
  });
}

const labels = {
  en: {
    howToUse: "How to use",
    uploadTitle: "Upload tender/RFP files",
    uploadHelp: "PDF, DOCX, TXT, JPG, PNG, WEBP. We do not save your files.",
    uploadRun: "Upload files & Run Analysis",
    or: "OR",
    runExample: "Run Analysis with example files",
    viewExample: "View example files",
    analyzedFiles: "Analyzed files",
    startFresh: "Start fresh",
    addMore: "Add more files",
    noFiles: "No files selected yet.",
    previewNotice: "Start your analysis by uploading files or running the example.",
    startTitle: "Start your analysis",
    startBody:
      'Upload tender files or run the example files. TenderLens Agentic AI will then fill this workspace with a bid score, checklist, evidence, map, deck, and questions. The example files use prepared example results so you can understand the workflow without spending model quota. Upload your own Tender Files to run a new analysis.',
    emptyOverallTitle: "No analysis yet",
    emptyOverallBody: "Your overall score and executive summary will appear here after TenderLens checks the files.",
    overall: "Overall result",
    sampleRun: "Prepared example",
    uploadedRun: "Uploaded files",
    verify: "AI-generated review. Verify before making procurement decisions.",
    analysis: "Analysis",
    ask: "Ask TenderLens",
    voiceMode: "Voice Mode",
    map: "Tender Map",
    deck: "Briefing Deck",
    questions: "Questions to Ask",
    checklist: "Checklist",
    checklistDesc: "Every row links a requirement to evidence and risk.",
    evidence: "Evidence",
    evidenceDesc: "Selected evidence for the active requirement.",
    attention: "What needs attention",
    attentionDesc: "Risks that may need clarification.",
    checked: "What TenderLens checked",
    askDesc: "Ask follow-up questions about the documents, evidence, risks, and next steps.",
    mapDesc: "A simple view of how files, requirements, evidence, risks, and actions connect.",
    deckDesc: "A lightweight stakeholder briefing created from the analysis result.",
    questionsDesc: "Practical questions to send to the vendor or project owner before submission.",
    exampleTitle: "Example Files",
    exampleDescription: "Use these fictional example files to test TenderLens Agentic AI without uploading your own documents.",
    useExamples: "Use these files",
    skip: "Skip",
    nextSlide: "Next",
    getStarted: "Get started",
    ready: "Ready",
    analyzed: "Analyzed",
    compliantRows: (count) => `${count} compliant rows`,
    riskRows: (count) => `${count} items need attention`,
    resultTitleNoEvidence: "Bid evidence needed",
    resultTitleStrong: "Bid-ready with a few checks",
    resultTitleRisk: "Conditional bid with risks to resolve",
    uploadLimit: "Upload up to 5 files. 4.0 MB per file.",
    chatIntro: "Ask me about the biggest risks, why a requirement is partial, or what you should ask the issuer next.",
    noMajorRisks: "No major risks listed.",
    uploadAccepted: (count) => `${count} file${count === 1 ? "" : "s"} accepted. Run analysis to review them.`,
    running: "TenderLens is checking the evidence...",
    backendUnavailable: "Live backend analysis is unavailable. A bounded local text review was generated for this session.",
    unsupportedLocal:
      "Live backend analysis is required for PDF, DOCX, and image parsing. Use TXT/MD here or connect the cloud runtime.",
    quickQuestions: [
      "What are the biggest risks?",
      "Why is this partial?",
      "What should I ask the vendor?",
      "Summarize this in Arabic",
    ],
    riskLabel: { Low: "Low", Medium: "Medium", High: "High" },
    statusLabel: { Compliant: "Compliant", Partial: "Partial", Gap: "Gap", "Needs Review": "Needs Review" },
    mapSvgTitle: "TenderLens Agentic AI Tender Map",
    mapHeaders: ["Files", "Requirements", "Evidence", "Risks & actions"],
    score: "Score",
    deckSlide: (current, total) => `Slide ${current} of ${total}`,
    onboarding: [
      {
        counter: "1 OF 2",
        title: "Understand tender documents faster",
        body: "TenderLens Agentic AI reads tender files, checks them against your bid readiness, and highlights risks.",
      },
      {
        counter: "2 OF 2",
        title: "Three simple steps",
        body: "Follow these simple steps to analyze your proposals. You can also read the detailed instructions in the user guide.",
      },
    ],
    onboardingChecks: ["Extract requirements", "Match evidence", "Highlight risks"],
    onboardingSteps: ["Upload files or use example files", "Wait for results", "Ask questions by typing or voice", "Download the analysis"],
  },
  ar: {
    howToUse: "طريقة الاستخدام",
    uploadTitle: "ارفع ملفات المناقصة",
    uploadHelp: "PDF و DOCX و TXT وصور. لا نحفظ ملفاتك.",
    uploadRun: "ارفع الملفات وابدأ التحليل",
    or: "أو",
    runExample: "حلل ملفات المثال",
    viewExample: "عرض ملفات المثال",
    analyzedFiles: "الملفات المحللة",
    startFresh: "بدء جديد",
    addMore: "إضافة ملفات",
    noFiles: "لم يتم اختيار ملفات بعد.",
    previewNotice: "ابدأ التحليل برفع الملفات أو تشغيل المثال.",
    startTitle: "ابدأ التحليل",
    startBody:
      "ارفع ملفات المناقصة أو شغل ملفات المثال. سيملأ TenderLens Agentic AI مساحة العمل بنتيجة قرار التقديم والقائمة والأدلة والخريطة والعرض والأسئلة.",
    emptyOverallTitle: "لا يوجد تحليل بعد",
    emptyOverallBody: "ستظهر النتيجة العامة والملخص التنفيذي هنا بعد فحص الملفات.",
    overall: "النتيجة العامة",
    sampleRun: "مثال معد مسبقا",
    uploadedRun: "ملفات مرفوعة",
    verify: "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء.",
    analysis: "التحليل",
    ask: "اسأل TenderLens",
    voiceMode: "وضع الصوت",
    map: "خريطة المناقصة",
    deck: "ملخص العرض",
    questions: "أسئلة يجب طرحها",
    checklist: "قائمة المتطلبات",
    checklistDesc: "كل صف يربط المتطلب بالدليل ومستوى المخاطر.",
    evidence: "الأدلة",
    evidenceDesc: "الدليل المختار للمتطلب النشط.",
    attention: "ما يحتاج الانتباه",
    attentionDesc: "مخاطر قد تحتاج إلى توضيح.",
    checked: "ما الذي فحصه TenderLens",
    askDesc: "اسأل أسئلة متابعة عن المستندات والأدلة والمخاطر والخطوات التالية.",
    mapDesc: "عرض بسيط يوضح ارتباط الملفات والمتطلبات والأدلة والمخاطر والإجراءات.",
    deckDesc: "ملخص خفيف لأصحاب المصلحة يتم إنشاؤه من نتيجة التحليل.",
    questionsDesc: "أسئلة عملية لإرسالها إلى المورد أو مالك المشروع قبل التقديم.",
    exampleTitle: "ملفات مثال",
    exampleDescription: "استخدم ملفات المثال الخيالية لتجربة TenderLens Agentic AI بدون رفع ملفاتك.",
    useExamples: "استخدام هذه الملفات",
    skip: "تخطي",
    nextSlide: "التالي",
    getStarted: "ابدأ",
    ready: "جاهز",
    analyzed: "تم التحليل",
    compliantRows: (count) => `${count} بنود ممتثلة`,
    riskRows: (count) => `${count} بنود تحتاج انتباها`,
    resultTitleNoEvidence: "تحتاج إلى أدلة للتقديم",
    resultTitleStrong: "جاهز للتقديم مع بعض المراجعات",
    resultTitleRisk: "تقديم مشروط مع مخاطر يجب حلها",
    uploadLimit: "يمكن رفع 5 ملفات كحد أقصى. 4.0 MB لكل ملف.",
    chatIntro: "اسألني عن أكبر المخاطر أو سبب اعتبار متطلب ما جزئيا أو ما الذي يجب سؤاله لجهة الطرح.",
    noMajorRisks: "لا توجد مخاطر رئيسية مدرجة.",
    uploadAccepted: (count) => `تم قبول ${count} ملف. شغل التحليل لمراجعتها.`,
    running: "يقوم TenderLens بمراجعة الأدلة...",
    backendUnavailable: "تعذر الوصول إلى تحليل الخادم. تم إنشاء مراجعة نصية محلية محدودة لهذه الجلسة.",
    unsupportedLocal: "يتطلب تحليل PDF و DOCX والصور اتصالا بالخادم السحابي. استخدم TXT/MD هنا أو صل بيئة التشغيل السحابية.",
    quickQuestions: ["ما أكبر المخاطر؟", "لماذا هذا البند جزئي؟", "ما الذي يجب أن أسأله للمورد؟", "لخص النتائج بالعربية"],
    riskLabel: { Low: "منخفض", Medium: "متوسط", High: "عال" },
    statusLabel: { Compliant: "ممتثل", Partial: "جزئي", Gap: "فجوة", "Needs Review": "يحتاج مراجعة" },
    mapSvgTitle: "خريطة TenderLens Agentic AI",
    mapHeaders: ["الملفات", "المتطلبات", "الأدلة", "المخاطر والإجراءات"],
    score: "النتيجة",
    deckSlide: (current, total) => `الشريحة ${current} من ${total}`,
    onboarding: [
      {
        counter: "1 من 2",
        title: "افهم مستندات المناقصة بسرعة",
        body: "يقرأ TenderLens Agentic AI ملفات المناقصة، ويفحص جاهزية تقديمك، ويبرز المخاطر.",
      },
      {
        counter: "2 من 2",
        title: "ثلاث خطوات بسيطة",
        body: "اتبع هذه الخطوات البسيطة لتحليل العروض. يمكنك أيضا قراءة التعليمات التفصيلية في دليل الاستخدام.",
      },
    ],
    onboardingChecks: ["استخراج المتطلبات", "مطابقة الأدلة", "إبراز المخاطر"],
    onboardingSteps: ["ارفع الملفات أو استخدم ملفات المثال", "انتظر النتائج", "اسأل عن مستنداتك", "نزل التحليل"],
  },
};

const exampleFiles = [
  {
    display: "Tender example",
    name: "Jeddah Fleet Maintenance RFP.pdf",
    size: "4 KB",
    format: "PDF",
    path: "./example-files/jeddah-fleet-maintenance-rfp.pdf",
  },
  {
    display: "Bid readiness notes",
    name: "Bid Readiness Notes.docx",
    size: "9 KB",
    format: "DOCX",
    path: "./example-files/bid-readiness-notes.docx",
  },
  {
    display: "Commercial addendum",
    name: "Commercial Clarification Addendum.pdf",
    size: "4 KB",
    format: "PDF",
    path: "./example-files/commercial-clarification-addendum.pdf",
  },
];

const exampleResult = {
  score: 78,
  executiveBrief:
    "TenderLens recommends a conditional bid. The tender fits our language support, hosted operations, data residency, support, API, and sustainability capabilities, but the bid team must close security-evidence, bid-bond validity, go-live, and training-capacity gaps before submission.",
  matrix: [
    {
      requirement: "Bid security must equal 2% of contract value and remain valid for at least 120 days.",
      category: "Commercial",
      status: "Partial",
      risk: "Medium",
      response: "The finance note confirms a 2% bid bond, but the current bank letter template is valid for 90 days unless extended.",
      citations: [{ file: "bid-readiness-notes.docx", quote: "Bid security: 2% of contract value, valid for 90 days unless the bank issues the extended letter." }],
    },
    {
      requirement: "Portal, resident notifications, and enforcement interface must support Arabic and English.",
      category: "Functional",
      status: "Compliant",
      risk: "Low",
      response: "The implementation team has bilingual product, support, and notification coverage for the required workflows.",
      citations: [{ file: "bid-readiness-notes.docx", quote: "Arabic and English interfaces are available for operators, residents, enforcement users, and support scripts." }],
    },
    {
      requirement: "Hosted production service must meet 99.5% monthly uptime with 72-hour maintenance notice.",
      category: "SLA",
      status: "Compliant",
      risk: "Low",
      response: "The operations playbook and addendum commit to the required uptime and maintenance notice window.",
      citations: [{ file: "commercial-clarification-addendum.pdf", quote: "The hosted production service will meet 99.5% monthly uptime with planned maintenance announced at least 72 hours in advance." }],
    },
    {
      requirement: "Supplier must provide ISO 27001, SOC 2 Type II, or equivalent independent security audit evidence.",
      category: "Security",
      status: "Partial",
      risk: "Medium",
      response: "The security pack includes a recent independent penetration test, but ISO 27001 certification is not yet issued.",
      citations: [{ file: "bid-readiness-notes.docx", quote: "ISO 27001 final audit is scheduled for Q4; current evidence includes an independent penetration test and remediation letter." }],
    },
    {
      requirement: "Production go-live for the five pilot districts must be completed by 30 September 2026.",
      category: "Delivery",
      status: "Gap",
      risk: "High",
      response: "The bid team's current delivery plan reaches full production on 15 October 2026, after the mandatory deadline.",
      citations: [{ file: "bid-readiness-notes.docx", quote: "Full production go-live is currently planned for 15 October 2026 after staged depot onboarding." }],
    },
    {
      requirement: "Resident personal data and plate metadata must be stored in Saudi Arabia.",
      category: "Data Residency",
      status: "Compliant",
      risk: "Low",
      response: "The architecture note keeps primary data and backups inside Saudi Arabia.",
      citations: [{ file: "commercial-clarification-addendum.pdf", quote: "Resident personal data, vehicle metadata, logs, and backups remain within the Kingdom of Saudi Arabia." }],
    },
    {
      requirement: "Critical incidents need human response within 30 minutes and standard tickets within 4 business hours.",
      category: "Support",
      status: "Compliant",
      risk: "Low",
      response: "The support plan meets both incident and standard ticket response targets.",
      citations: [{ file: "commercial-clarification-addendum.pdf", quote: "Critical production incidents receive a named support engineer within 30 minutes." }],
    },
    {
      requirement: "Platform must integrate with the municipal payment gateway and expose REST APIs.",
      category: "Integration",
      status: "Compliant",
      risk: "Low",
      response: "The product roadmap includes payment gateway integration and REST APIs for occupancy, permits, violations, and payments.",
      citations: [{ file: "bid-readiness-notes.docx", quote: "The platform exposes REST APIs for occupancy, permits, violation status, and payment events." }],
    },
    {
      requirement: "Supplier must deliver role-based training for at least 50 municipal staff before go-live.",
      category: "Training",
      status: "Partial",
      risk: "Medium",
      response: "The training plan currently covers 40 staff. Ten additional remote seats are possible but need written confirmation.",
      citations: [{ file: "commercial-clarification-addendum.pdf", quote: "Base role-based training covers 40 users; 10 remote seats may be added at no additional license cost." }],
    },
    {
      requirement: "Supplier must provide quarterly sustainability reporting.",
      category: "Reporting",
      status: "Compliant",
      risk: "Low",
      response: "The bid can include quarterly sustainability reports covering hosting and maintenance travel impact.",
      citations: [{ file: "commercial-clarification-addendum.pdf", quote: "Quarterly sustainability reporting will cover hosting region energy profile and maintenance-trip reductions." }],
    },
  ],
  trace: ["Validated example files", "Found mandatory tender requirements", "Matched bid-readiness evidence", "Ran independent evidence check", "Calibrated bid risk"],
  risks: [
    "The current go-live plan misses the mandatory deadline.",
    "The bid bond validity is shorter than required.",
    "Security certification evidence is not final.",
    "Training capacity is below the stated minimum unless the extra seats are confirmed.",
  ],
  nextActions: [
    "Revise the delivery plan to meet 30 September 2026 before deciding to bid.",
    "Obtain a 120-day bid bond letter from the bank.",
    "Attach independent security evidence and explain the ISO 27001 timeline.",
    "Confirm 50 training seats before submission.",
  ],
  files: exampleFiles.map((file) => file.name),
};

const STATUS_SCORES = {
  Compliant: 100,
  Partial: 55,
  "Needs Review": 35,
  Gap: 0,
};

const RISK_PENALTIES = {
  Low: 0,
  Medium: 5,
  High: 10,
};

function text() {
  return labels[state.language];
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extension(name) {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function fileFormat(name) {
  return extension(name).replace(".", "").toUpperCase() || "FILE";
}

function shortFileName(name) {
  return name
    .replace(/jeddah-fleet-maintenance-/i, "")
    .replace(/bid-readiness-/i, "")
    .replace(/commercial-clarification-/i, "")
    .replace(/\.(pdf|docx|txt|md|jpg|jpeg|png|webp)$/i, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstWords(value, limit = 12) {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  return words.length > limit ? `${words.slice(0, limit).join(" ")}...` : words.join(" ");
}

function slug(value, fallback = "node") {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
  return normalized || fallback;
}

function calculateComplianceScore(matrix) {
  if (!matrix.length) return 0;
  const total = matrix.reduce((sum, row) => {
    const penalty = row.status === "Compliant" ? 0 : RISK_PENALTIES[row.risk] || 0;
    return sum + Math.max(0, (STATUS_SCORES[row.status] ?? 35) - penalty);
  }, 0);
  return Math.min(100, Math.max(0, Math.round(total / matrix.length / 5) * 5));
}

function normalizeResult(result) {
  const matrix = (result.matrix || []).map((row) => ({
    requirement: row.requirement || "Structured compliance review",
    category: row.category || "Tender",
    status: ["Compliant", "Partial", "Gap", "Needs Review"].includes(row.status) ? row.status : "Needs Review",
    risk: ["Low", "Medium", "High"].includes(row.risk) ? row.risk : "Medium",
    response: row.response || "No response evidence found.",
    citations: Array.isArray(row.citations) && row.citations.length
      ? row.citations.slice(0, 3)
      : [{ file: "Uploaded document", quote: row.response || "No cited evidence was returned." }],
  }));
  return {
    ...result,
    matrix,
    score: Number.isFinite(result.score) ? result.score : calculateComplianceScore(matrix),
    trace: result.trace || [],
    risks: result.risks || [],
    nextActions: result.nextActions || [],
    files: result.files || [],
  };
}

function reportToComplianceResult(report) {
  const evidenceById = new Map((report.evidence || []).map((item) => [item.id, item]));
  const rows = (report.findings || []).slice(0, 10).map((finding) => {
    const evidenceItems = (finding.evidence_ids || []).map((id) => evidenceById.get(id)).filter(Boolean);
    const status = finding.status === "pass" ? "Compliant" : finding.status === "fail" ? "Gap" : "Partial";
    const combined = `${finding.agent} ${finding.summary} ${(finding.actions || []).join(" ")}`.toLowerCase();
    let risk = status === "Compliant" ? "Low" : "Medium";
    if (/deadline|late|penalt|bond|security|risk|mandatory|fail|blocker/.test(combined) && status !== "Compliant") {
      risk = "High";
    }
    return {
      requirement: finding.summary,
      category: String(finding.agent || "Tender").replace(/\s*Agent$/i, ""),
      status,
      risk,
      response: (finding.actions || [finding.summary])[0] || finding.summary,
      citations: evidenceItems.length
        ? evidenceItems.slice(0, 3).map((item) => ({
            file: citationFile(item.citation),
            quote: item.excerpt || item.title || item.citation,
          }))
        : [{ file: "Uploaded document", quote: finding.summary }],
    };
  });

  const risks = (report.risks || []).map((risk) => (typeof risk === "string" ? risk : risk.title || risk.mitigation)).filter(Boolean);
  const files = (report.source_documents || []).map((item) => item.filename).filter(Boolean);
  const normalized = normalizeResult({
    score: Number.isFinite(report.score) ? report.score : undefined,
    executiveBrief: report.executive_summary || "TenderLens completed a source-backed review of the uploaded files.",
    matrix: rows.length ? rows : [
      {
        requirement: "Structured uploaded-file review",
        category: "System",
        status: "Needs Review",
        risk: "Medium",
        response: "The backend returned a report without checklist rows.",
        citations: [{ file: files[0] || "Uploaded document", quote: report.executive_summary || "Review returned without row details." }],
      },
    ],
    trace: report.workflow_trace || [],
    risks,
    nextActions: report.next_actions || [],
    files,
  });
  normalized.score = calculateComplianceScore(normalized.matrix);
  return normalized;
}

function citationFile(citation) {
  const value = String(citation || "Uploaded document");
  const colon = value.lastIndexOf(":");
  return colon >= 0 ? value.slice(colon + 1).trim() : value;
}

function validateSelectedFiles(files) {
  if (!files.length) return { ok: false, message: "Select at least one file." };
  if (files.length > MAX_UPLOAD_FILES) return { ok: false, message: "Upload is limited to 5 files." };
  for (const file of files) {
    if (!supportedExt.includes(extension(file.name))) {
      return { ok: false, message: `${file.name}: unsupported file type.` };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { ok: false, message: `${file.name}: file is larger than the 4 MB limit.` };
    }
    if (file.size <= 0) {
      return { ok: false, message: `${file.name}: uploaded file is empty.` };
    }
  }
  return { ok: true, message: text().uploadAccepted(files.length) };
}

function updateI18n() {
  const copy = text();
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";
  $("[data-i18n='uploadLimitText']");
  Object.entries(copy).forEach(([key, value]) => {
    if (typeof value !== "string") return;
    $$(`[data-i18n="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  });
  $("#uploadLimitText").textContent = copy.uploadLimit;
  $("#chatInput").placeholder = state.language === "ar" ? "اسأل أي شيء عن هذه المستندات..." : "Ask anything about these documents...";
  $("#langEn").classList.toggle("active", state.language === "en");
  $("#langAr").classList.toggle("active", state.language === "ar");
  renderOnboarding();
  if (state.currentResult) renderResult();
}

function renderFiles(status = state.currentResult ? text().analyzed : text().ready) {
  const list = $("#analyzedFiles");
  const files = state.uploadedFiles.length
    ? state.uploadedFiles.map((file) => ({
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        format: fileFormat(file.name),
      }))
    : state.analysisSource === "sample"
      ? exampleFiles
      : [];

  if (!files.length) {
    list.innerHTML = `<div class="empty-file-state">${escapeText(text().noFiles)}</div>`;
    return;
  }

  list.innerHTML = files
    .map(
      (file, index) => `
        <article class="file-chip">
          <span class="file-chip-icon" aria-hidden="true">${iconMarkup("file-text")}</span>
          <span>
            <strong>${escapeText(file.display || shortFileName(file.name))}</strong>
            <span>${escapeText(file.size || "")} · ${escapeText(file.format || fileFormat(file.name))}</span>
          </span>
          <span class="file-state">${escapeText(status)}</span>
          <button class="file-remove" type="button" data-remove="${index}" aria-label="Remove file">×</button>
        </article>
      `,
    )
    .join("");
}

function showResultShell(show) {
  $("#startHero").classList.toggle("hidden", show);
  $("#emptyResult").classList.toggle("hidden", show);
  $("#resultShell").classList.toggle("hidden", !show);
  $$(".download-group button").forEach((button) => {
    button.disabled = !show;
  });
}

function resultTitle(result) {
  if (result.score === 0) return text().resultTitleNoEvidence;
  if (result.score >= 80) return text().resultTitleStrong;
  return text().resultTitleRisk;
}

function renderResult() {
  const result = state.currentResult;
  if (!result) {
    showResultShell(false);
    return;
  }

  showResultShell(true);
  $("#preparedBadge").textContent = state.analysisSource === "sample" ? text().sampleRun : text().uploadedRun;
  $("#resultTitle").textContent = resultTitle(result);
  $("#executiveBrief").textContent = result.executiveBrief;
  $("#scoreValue").textContent = String(result.score);
  $("#scoreRing").style.setProperty("--score-deg", `${result.score * 3.6}deg`);

  const compliant = result.matrix.filter((row) => row.status === "Compliant").length;
  const attention = result.matrix.filter((row) => row.status !== "Compliant" || row.risk !== "Low").length;
  $("#compliantRows").textContent = text().compliantRows(compliant);
  $("#riskRows").textContent = text().riskRows(attention);

  renderFiles(text().analyzed);
  renderChecklist();
  renderAttention();
  renderTrace();
  renderChat();
  renderMap();
  renderDeck();
  renderQuestions();
  switchTab(state.activeTab);
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function renderChecklist() {
  const result = state.currentResult;
  const copy = text();
  $("#checklistRows").innerHTML = result.matrix
    .map(
      (row, index) => `
        <button class="checklist-row ${index === state.activeRow ? "active" : ""}" data-row="${index}" type="button">
          <span>
            <strong>${escapeText(row.requirement)}</strong>
            <small>${escapeText(row.category)}</small>
          </span>
          <span class="status-pill ${statusClass(row.status)}">${escapeText(copy.statusLabel[row.status])}</span>
          <span class="risk-${row.risk.toLowerCase()}">${escapeText(copy.riskLabel[row.risk])}</span>
          <span class="row-response">${escapeText(row.response)}</span>
        </button>
      `,
    )
    .join("");
  renderActiveEvidence();
}

function renderActiveEvidence() {
  const row = state.currentResult?.matrix[state.activeRow] || state.currentResult?.matrix[0];
  if (!row) {
    $("#activeEvidence").innerHTML = "";
    return;
  }
  $("#activeEvidence").innerHTML = row.citations
    .map(
      (citation) => `
        <figure class="evidence-quote">
          <figcaption>${escapeText(citation.file || "Uploaded document")}${citation.page ? ` · ${escapeText(citation.page)}` : ""}</figcaption>
          <blockquote>${escapeText(citation.quote || row.response)}</blockquote>
        </figure>
      `,
    )
    .join("");
}

function renderAttention() {
  const risks = state.currentResult.risks.length ? state.currentResult.risks : [text().noMajorRisks];
  $("#attentionList").innerHTML = risks.map((risk) => `<li>${escapeText(risk)}</li>`).join("");
}

function renderTrace() {
  const trace = state.currentResult.trace.length
    ? state.currentResult.trace
    : ["Validated upload", "Found mandatory requirements", "Matched evidence", "Calibrated risks"];
  $("#traceList").innerHTML = trace
    .slice(0, 8)
    .map((step, index) => `<li><span>${index + 1}</span>${escapeText(step)}</li>`)
    .join("");
}

function renderChat() {
  if (!$("#chatLog").children.length) {
    addChatMessage(text().chatIntro, "agent");
  }
  $("#quickQuestions").innerHTML = text().quickQuestions
    .map((question) => `<button type="button" data-question="${escapeText(question)}">${escapeText(question)}</button>`)
    .join("");
}

function buildTenderMap(result) {
  const files = (result.files && result.files.length ? result.files : exampleFiles.map((file) => file.name)).slice(0, 4);
  const rows = result.matrix.slice(0, 6);
  return {
    files,
    rows: rows.map((row, index) => ({
      ...row,
      id: `requirement-${index}-${slug(row.requirement)}`,
      evidence: row.citations[0]?.quote || row.response,
      file: row.citations[0]?.file || files[0] || "Uploaded document",
    })),
  };
}

function renderMap() {
  const map = buildTenderMap(state.currentResult);
  $("#tenderMapSvg").innerHTML = buildTenderMapSvg(map);
}

function colorForRisk(risk) {
  if (risk === "High") return { fill: "#fff1ef", stroke: "#e2b4ad", dot: "#b42318" };
  if (risk === "Medium") return { fill: "#fff8e9", stroke: "#e2c585", dot: "#bd750f" };
  return { fill: "#eef3ff", stroke: "#b7c9ff", dot: "#4165d8" };
}

function buildTenderMapSvg(map) {
  const rows = map.rows;
  const rowHeight = 132;
  const height = Math.max(640, 122 + rows.length * rowHeight);
  const headers = text().mapHeaders;
  const fileRows = map.files.map((file, index) => ({ label: shortFileName(file), y: 140 + index * 132 }));
  const lastFileY = fileRows[fileRows.length - 1]?.y || 140;
  const pathColor = "#aeb8b5";

  const fileCards = fileRows
    .map(
      (file, index) => `
        <rect x="36" y="${file.y}" width="210" height="72" rx="14" fill="#fffdf8" stroke="#d7dfda" stroke-width="1.5"/>
        <text x="52" y="${file.y + 34}" font-size="14" fill="#101214">${escapeText(firstWords(file.label, 4))}</text>
        <circle cx="226" cy="${file.y + 18}" r="5" fill="#4968d9"/>
        ${index === fileRows.length - 1 ? rows.map((_, rowIndex) => {
          const targetY = 140 + rowIndex * rowHeight + 36;
          return `<path d="M246 ${file.y + 36} C 306 ${file.y + 36}, 286 ${targetY}, 338 ${targetY}" fill="none" stroke="${pathColor}" stroke-width="1.5"/>`;
        }).join("") : ""}
      `,
    )
    .join("");

  const rowCards = rows
    .map((row, index) => {
      const y = 140 + index * rowHeight;
      const risk = colorForRisk(row.risk);
      return `
        <rect x="340" y="${y}" width="240" height="72" rx="14" fill="#fff8e9" stroke="#e5c884" stroke-width="1.5"/>
        <text x="358" y="${y + 28}" font-size="14" fill="#101214">${escapeText(firstWords(row.requirement, 7))}</text>
        <text x="358" y="${y + 48}" font-size="14" fill="#101214">${escapeText(firstWords(row.requirement.split(" ").slice(7).join(" "), 7))}</text>
        <circle cx="558" cy="${y + 18}" r="5" fill="#bd750f"/>
        <path d="M580 ${y + 36} L 655 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        <rect x="660" y="${y}" width="250" height="72" rx="14" fill="#effaf6" stroke="#91d4c6" stroke-width="1.5"/>
        <text x="678" y="${y + 28}" font-size="14" fill="#101214">${escapeText(firstWords(row.evidence, 7))}</text>
        <text x="678" y="${y + 48}" font-size="14" fill="#101214">${escapeText(firstWords(row.evidence.split(" ").slice(7).join(" "), 7))}</text>
        <circle cx="888" cy="${y + 18}" r="5" fill="#3f8e73"/>
        <path d="M910 ${y + 36} L 985 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        <rect x="990" y="${y}" width="230" height="72" rx="14" fill="${risk.fill}" stroke="${risk.stroke}" stroke-width="1.5"/>
        <text x="1008" y="${y + 36}" font-size="14" fill="#101214">${escapeText(text().riskLabel[row.risk])} risk</text>
        <circle cx="1198" cy="${y + 18}" r="5" fill="${risk.dot}"/>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 1260 ${height}" role="img" aria-label="${escapeText(text().mapSvgTitle)}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" fill="${pathColor}"/>
        </marker>
      </defs>
      <rect x="0" y="0" width="1260" height="${height}" rx="24" fill="#fffdf8" stroke="#d7dfda" stroke-width="1.5"/>
      <text x="36" y="46" font-size="28" font-weight="760" fill="#101214">${escapeText(text().mapSvgTitle)}</text>
      <text x="36" y="86" font-size="14" font-weight="700" fill="#5a646d">${escapeText(headers[0])}</text>
      <text x="340" y="86" font-size="14" font-weight="700" fill="#5a646d">${escapeText(headers[1])}</text>
      <text x="660" y="86" font-size="14" font-weight="700" fill="#5a646d">${escapeText(headers[2])}</text>
      <text x="990" y="86" font-size="14" font-weight="700" fill="#5a646d">${escapeText(headers[3])}</text>
      ${fileCards}
      ${rows.length && fileRows.length ? `<path d="M246 ${lastFileY + 36} C 300 ${lastFileY + 36}, 298 ${lastFileY + 36}, 338 ${lastFileY + 36}" fill="none" stroke="${pathColor}" stroke-width="1.5"/>` : ""}
      ${rowCards}
    </svg>
  `;
}

function buildBriefingDeck(result) {
  const compliant = result.matrix.filter((row) => row.status === "Compliant").slice(0, 3);
  const risky = result.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").slice(0, 4);
  const evidence = result.matrix.flatMap((row) => row.citations.slice(0, 1).map((citation) => `${firstWords(row.requirement, 8)}: ${citation.quote}`));
  return [
    { eyebrow: "Snapshot", title: "Overall result", bullets: [`${text().score}: ${result.score}/100`, result.executiveBrief] },
    { eyebrow: "Strengths", title: "Top compliance wins", bullets: compliant.length ? compliant.map((row) => row.requirement) : ["No fully compliant rows found yet."] },
    { eyebrow: "Attention", title: "Biggest risks", bullets: risky.length ? risky.map((row) => `${text().riskLabel[row.risk]} risk: ${row.requirement}`) : ["No major risks detected."] },
    { eyebrow: "Evidence", title: "Evidence highlights", bullets: evidence.length ? evidence.slice(0, 4) : ["No evidence highlights available."] },
    { eyebrow: "Action", title: "Next actions", bullets: result.nextActions.length ? result.nextActions.slice(0, 5) : ["Review requirements with the project team."] },
  ];
}

function renderDeck() {
  const deck = buildBriefingDeck(state.currentResult);
  state.activeSlide = Math.min(state.activeSlide, deck.length - 1);
  const slide = deck[state.activeSlide];
  const label = text().deckSlide(state.activeSlide + 1, deck.length);
  $("#slidePill").textContent = label;
  $("#deckCounter").textContent = `${state.activeSlide + 1}/${deck.length}`;
  $("#deckFooterText").textContent = label;
  $("#deckEyebrow").textContent = slide.eyebrow;
  $("#deckTitle").textContent = slide.title;
  $("#deckBullets").innerHTML = slide.bullets
    .slice(0, 5)
    .map((bullet, index) => `<li><span>${index + 1}</span>${escapeText(bullet)}</li>`)
    .join("");
  $("#deckDots").innerHTML = deck
    .map((item, index) => `<button class="${index === state.activeSlide ? "active" : ""}" data-slide="${index}" type="button" aria-label="${escapeText(text().deckSlide(index + 1, deck.length))}"></button>`)
    .join("");
}

function buildQuestions(result) {
  const rowQuestions = result.matrix
    .filter((row) => row.status !== "Compliant" || row.risk !== "Low")
    .slice(0, 6)
    .map((row) => ({
      question:
        state.language === "ar"
          ? `يرجى توضيح كيفية تلبية هذا المتطلب: ${row.requirement}`
          : `Can you clarify how you will satisfy this requirement: ${row.requirement.charAt(0).toLowerCase()}${row.requirement.slice(1)}`,
      why:
        state.language === "ar"
          ? `${text().statusLabel[row.status]} بمستوى مخاطر ${text().riskLabel[row.risk]}. ${row.response}`
          : `${row.status} item with ${row.risk.toLowerCase()} risk. ${row.response}`,
    }));
  const actionQuestions = result.nextActions.slice(0, 4).map((action, index) => ({
    question: action.endsWith("?") ? action : `${action}?`,
    why: result.risks[index] || "This action was recommended by TenderLens Agentic AI.",
  }));
  return [...rowQuestions, ...actionQuestions].slice(0, 8);
}

function renderQuestions() {
  const questions = buildQuestions(state.currentResult);
  $("#questionsList").innerHTML = questions
    .map(
      (item, index) => `
        <article class="question-card">
          <div class="question-row">
            <span class="question-number">${index + 1}</span>
            <div>
              <h3>${escapeText(item.question)}</h3>
              <p>${escapeText(item.why)}</p>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function switchTab(tab) {
  state.activeTab = tab;
  $$(".workspace-tabs button").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  $$(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== tab));
}

function addChatMessage(content, role = "agent") {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = content;
  $("#chatLog").appendChild(node);
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function answerQuestion(question) {
  const lower = question.toLowerCase();
  const result = state.currentResult;
  if (!result) return "Run an analysis first so TenderLens can answer using your documents.";
  if (lower.includes("arabic") || /عرب/.test(question)) {
    return "الخلاصة: توجد نقاط قوة واضحة، لكن يجب توضيح المخاطر والمتطلبات الجزئية قبل التقديم.";
  }
  if (lower.includes("risk") || lower.includes("مخاطر")) {
    return result.risks.slice(0, 3).join(" ");
  }
  if (lower.includes("partial") || lower.includes("جزئي")) {
    const row = result.matrix.find((item) => item.status === "Partial") || result.matrix[0];
    return `${row.requirement}: ${row.response}`;
  }
  if (lower.includes("ask") || lower.includes("vendor") || lower.includes("سأ")) {
    return buildQuestions(result)[0]?.question || "Ask the issuer to confirm every mandatory requirement with source-backed evidence.";
  }
  return result.executiveBrief;
}

async function postJson(path, payload, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(requestUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function configuredBackendUrl() {
  return String(window.TENDERLENS_CONFIG?.backendUrl || "").replace(/\/+$/, "");
}

function requestUrl(path, options = {}) {
  const backendUrl = configuredBackendUrl();
  return options.preferBackend && backendUrl ? `${backendUrl}${path}` : path;
}

async function postFormData(path, formData, timeoutMs = 60000, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(requestUrl(path, options), { method: "POST", body: formData, signal: controller.signal });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        // Keep HTTP status as detail.
      }
      throw new Error(detail);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function createUploadAnalysisFormData() {
  const formData = new FormData();
  state.uploadedFiles.forEach((file, index) => {
    formData.append(index === 0 ? "main_file" : "supporting_files", file);
  });
  formData.append("profile_id", "default-bidder-profile");
  formData.append("language", state.language);
  formData.append("voice", "false");
  return formData;
}

async function buildLocalUploadedResult() {
  const textFiles = state.uploadedFiles.filter((file) => [".txt", ".md"].includes(extension(file.name)));
  if (!textFiles.length) throw new Error(text().unsupportedLocal);
  const entries = await Promise.all(textFiles.map(async (file) => ({ file, content: await file.text() })));
  const combined = entries.map((entry) => entry.content).join("\n\n").toLowerCase();
  const has = (pattern) => pattern.test(combined);
  const rows = [
    {
      requirement: "Mandatory certifications and eligibility evidence should be present.",
      category: "Eligibility",
      status: has(/iso|certification|license|qualified/) ? "Compliant" : "Needs Review",
      risk: has(/iso|certification|license|qualified/) ? "Low" : "Medium",
      response: has(/iso|certification|license|qualified/)
        ? "Uploaded text contains certification or eligibility language."
        : "No clear certification or eligibility evidence was found in text-readable files.",
      citations: [{ file: entries[0].file.name, quote: firstWords(entries[0].content, 24) }],
    },
    {
      requirement: "Submission deadline and required documents should be confirmed.",
      category: "Submission",
      status: has(/deadline|submission|submit|envelope/) ? "Partial" : "Needs Review",
      risk: has(/deadline|submission|submit|envelope/) ? "Medium" : "High",
      response: has(/deadline|submission|submit|envelope/)
        ? "Deadline or submission language is present, but the exact checklist should be verified."
        : "No reliable deadline language was found in text-readable files.",
      citations: [{ file: entries[0].file.name, quote: firstWords(entries[0].content, 24) }],
    },
    {
      requirement: "Delivery risks, service levels, and implementation constraints should be assessed.",
      category: "Delivery",
      status: has(/risk|sla|delivery|implementation|mobilization|penalty/) ? "Partial" : "Needs Review",
      risk: has(/penalty|late|delay|risk/) ? "High" : "Medium",
      response: has(/risk|sla|delivery|implementation|mobilization|penalty/)
        ? "Delivery or service-level language was detected and should be clarified."
        : "No delivery risk language was found in text-readable files.",
      citations: [{ file: entries[entries.length - 1].file.name, quote: firstWords(entries[entries.length - 1].content, 24) }],
    },
    {
      requirement: "Pricing, bid security, insurance, or commercial attachments should be checked.",
      category: "Commercial",
      status: has(/price|commercial|bond|security|insurance|guarantee/) ? "Partial" : "Gap",
      risk: has(/bond|security|insurance|guarantee/) ? "Medium" : "High",
      response: has(/price|commercial|bond|security|insurance|guarantee/)
        ? "Commercial language is present, but TenderLens needs source-backed validation."
        : "No clear commercial evidence was found in text-readable files.",
      citations: [{ file: entries[0].file.name, quote: firstWords(entries[0].content, 24) }],
    },
  ];
  return normalizeResult({
    executiveBrief:
      "Uploaded text-readable files were reviewed locally because the live backend was unavailable. Treat this as a bounded draft until the cloud runtime validates every source document.",
    matrix: rows,
    trace: ["Validated files", "Read text locally", "Derived checklist rows", "Calculated deterministic score"],
    risks: ["Cloud backend validation is not connected for this run.", "PDF, DOCX, and image parsing require the production backend."],
    nextActions: ["Connect the deployed backend runtime.", "Verify all mandatory requirements against source documents."],
    files: state.uploadedFiles.map((file) => file.name),
  });
}

async function runAnalysis() {
  $("#uploadStatus").classList.remove("error");
  $("#uploadStatus").textContent = text().running;
  if (!state.uploadedFiles.length) {
    useExampleFiles();
    return;
  }

  const validation = validateSelectedFiles(state.uploadedFiles);
  if (!validation.ok) {
    $("#uploadStatus").textContent = validation.message;
    $("#uploadStatus").classList.add("error");
    return;
  }

  try {
    const result = await postFormData("/api/upload/analyze", createUploadAnalysisFormData(), 60000, { preferBackend: true });
    state.currentResult = reportToComplianceResult(result.report);
    state.analysisSource = "uploaded";
    $("#uploadStatus").textContent = text().uploadAccepted(state.uploadedFiles.length);
  } catch (error) {
    try {
      state.currentResult = await buildLocalUploadedResult();
      state.analysisSource = "uploaded";
      $("#uploadStatus").textContent = text().backendUnavailable;
    } catch (localError) {
      $("#uploadStatus").textContent = localError.message || error.message || text().unsupportedLocal;
      $("#uploadStatus").classList.add("error");
      return;
    }
  }
  state.activeRow = 0;
  state.activeSlide = 0;
  renderResult();
}

function useExampleFiles() {
  state.currentResult = normalizeResult(structuredClone(exampleResult));
  state.analysisSource = "sample";
  state.uploadedFiles = [];
  state.activeRow = 0;
  state.activeSlide = 0;
  $("#fileInput").value = "";
  $("#uploadStatus").classList.remove("error");
  $("#uploadStatus").textContent = "Example files use a prepared example result so you can test the interface without spending model quota.";
  renderResult();
}

function selectFiles(files) {
  state.uploadedFiles = Array.from(files).slice(0, MAX_UPLOAD_FILES);
  const validation = validateSelectedFiles(state.uploadedFiles);
  $("#uploadStatus").textContent = validation.message;
  $("#uploadStatus").classList.toggle("error", !validation.ok);
  state.analysisSource = "uploaded";
  renderFiles(text().ready);
  if (validation.ok) {
    void runAnalysis();
  }
}

function startFresh() {
  state.currentResult = null;
  state.uploadedFiles = [];
  state.analysisSource = "empty";
  state.activeRow = 0;
  state.activeSlide = 0;
  $("#fileInput").value = "";
  $("#supportingFileInput").value = "";
  $("#uploadStatus").textContent = "";
  $("#chatLog").innerHTML = "";
  renderFiles();
  showResultShell(false);
}

function renderExamplesModal() {
  $("#exampleFileList").innerHTML = exampleFiles
    .map(
      (file) => `
        <article class="example-file-row">
          <span class="file-chip-icon" aria-hidden="true">${iconMarkup("file-text")}</span>
          <div>
            <strong>${escapeText(file.display)}</strong>
            <p>${escapeText(file.name)} · ${escapeText(file.size)} · ${escapeText(file.format)}</p>
          </div>
          <a href="${escapeText(file.path)}" target="_blank" rel="noreferrer">Open</a>
        </article>
      `,
    )
    .join("");
}

function renderOnboarding() {
  const copy = text();
  const slide = copy.onboarding[state.onboardingSlide];
  $("#onboardingCounter").textContent = slide.counter;
  $("#welcomeTitle").textContent = slide.title;
  $("#welcomeBody").textContent = slide.body;
  $("#dotOne").classList.toggle("active", state.onboardingSlide === 0);
  $("#dotTwo").classList.toggle("active", state.onboardingSlide === 1);
  $("#nextOnboarding").textContent = state.onboardingSlide === 0 ? copy.nextSlide : copy.getStarted;
  if (state.onboardingSlide === 0) {
    $("#onboardingVisual").innerHTML = `
      <div class="onboarding-checks">
        ${copy.onboardingChecks.map((item, index) => `<div><span class="title-icon ${["cobalt", "mint", "danger"][index]}" aria-hidden="true">${iconMarkup(["search-check", "shield-check", "triangle-alert"][index])}</span>${escapeText(item)}</div>`).join("")}
      </div>
    `;
  } else {
    $("#onboardingVisual").innerHTML = `
      <div class="numbered-steps">
        ${copy.onboardingSteps.map((item, index) => `<div><span>${index + 1}</span>${escapeText(item)}</div>`).join("")}
      </div>
    `;
  }
}

function closeWelcome(persist = true) {
  $("#welcomeModal").classList.add("hidden");
  if (persist) {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  }
}

function showWelcomeIfNeeded() {
  if (window.localStorage.getItem("tenderlens-welcome-dismissed") !== "yes") {
    $("#welcomeModal").classList.remove("hidden");
  }
}

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function reportText() {
  const result = state.currentResult;
  if (!result) return "";
  return [
    "TenderLens Agentic AI",
    `${text().score}: ${result.score}/100`,
    "",
    result.executiveBrief,
    "",
    "Checklist",
    ...result.matrix.map((row, index) => `${index + 1}. [${row.status} / ${row.risk}] ${row.requirement} - ${row.response}`),
    "",
    "Next actions",
    ...result.nextActions.map((action, index) => `${index + 1}. ${action}`),
  ].join("\n");
}

function downloadReport(format) {
  if (!state.currentResult) return;
  const content = reportText();
  const ext = format === "docx" ? "doc" : format;
  downloadTextFile(`tenderlens-analysis.${ext}`, content, format === "pdf" ? "application/pdf" : "text/plain");
}

function downloadMap() {
  const svg = $("#tenderMapSvg svg")?.outerHTML || "";
  if (svg) downloadTextFile("tenderlens-map.svg", svg, "image/svg+xml");
}

async function startVoice() {
  $("#voiceOverlay").classList.remove("hidden");
  $("#voiceStateLabel").textContent = "Connecting";
  try {
    state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    $("#voiceStateLabel").textContent = "Listening";
    $("#voiceHelp").textContent = "Ask about risks, evidence, or next actions.";
  } catch {
    $("#voiceStateLabel").textContent = "Error";
    $("#voiceHelp").textContent = "Microphone unavailable. Typing mode remains available.";
  }
}

function stopVoice() {
  if (state.voiceStream) state.voiceStream.getTracks().forEach((track) => track.stop());
  state.voiceStream = null;
  $("#voiceOverlay").classList.add("hidden");
}

function bindEvents() {
  $("#langEn").addEventListener("click", () => {
    state.language = "en";
    updateI18n();
  });
  $("#langAr").addEventListener("click", () => {
    state.language = "ar";
    updateI18n();
  });

  ["uploadRunButton", "heroUploadButton", "emptyUploadButton", "addMoreButton"].forEach((id) => {
    $(`#${id}`).addEventListener("click", () => $("#fileInput").click());
  });
  ["useSampleButton", "heroSampleButton", "emptySampleButton", "useExamplesFromModal"].forEach((id) => {
    $(`#${id}`).addEventListener("click", () => {
      $("#examplesModal").classList.add("hidden");
      useExampleFiles();
    });
  });

  $("#fileInput").addEventListener("change", (event) => selectFiles(event.target.files || []));
  $("#supportingFileInput").addEventListener("change", (event) => selectFiles(event.target.files || []));
  $("#startFreshButton").addEventListener("click", startFresh);

  $("#analyzedFiles").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    state.uploadedFiles.splice(index, 1);
    if (state.analysisSource === "sample") {
      startFresh();
      return;
    }
    renderFiles();
  });

  $(".workspace-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (button) switchTab(button.dataset.tab);
  });

  $("#checklistRows").addEventListener("click", (event) => {
    const row = event.target.closest("[data-row]");
    if (!row) return;
    state.activeRow = Number(row.dataset.row);
    renderChecklist();
  });

  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = $("#chatInput").value.trim();
    if (!value) return;
    addChatMessage(value, "user");
    $("#chatInput").value = "";
    window.setTimeout(() => addChatMessage(answerQuestion(value), "agent"), 180);
  });

  $("#quickQuestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    const question = button.dataset.question;
    addChatMessage(question, "user");
    window.setTimeout(() => addChatMessage(answerQuestion(question), "agent"), 180);
  });

  $("#voiceModeButton").addEventListener("click", startVoice);

  $("#prevSlide").addEventListener("click", () => {
    const deck = buildBriefingDeck(state.currentResult);
    state.activeSlide = (state.activeSlide - 1 + deck.length) % deck.length;
    renderDeck();
  });
  $("#nextSlide").addEventListener("click", () => {
    const deck = buildBriefingDeck(state.currentResult);
    state.activeSlide = (state.activeSlide + 1) % deck.length;
    renderDeck();
  });
  $("#deckDots").addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide]");
    if (!button) return;
    state.activeSlide = Number(button.dataset.slide);
    renderDeck();
  });

  $("#downloadTxt").addEventListener("click", () => downloadReport("txt"));
  $("#downloadPdf").addEventListener("click", () => downloadReport("pdf"));
  $("#downloadDocx").addEventListener("click", () => downloadReport("docx"));
  $("#downloadPptx").addEventListener("click", () => downloadReport("pptx"));
  $("#downloadMapSvg").addEventListener("click", downloadMap);

  $("#viewExamplesButton").addEventListener("click", () => $("#examplesModal").classList.remove("hidden"));
  $("#closeExamples").addEventListener("click", () => $("#examplesModal").classList.add("hidden"));
  $("#examplesModal").addEventListener("click", (event) => {
    if (event.target.id === "examplesModal") $("#examplesModal").classList.add("hidden");
  });

  $("#howToButton").addEventListener("click", () => {
    state.onboardingSlide = 0;
    renderOnboarding();
    $("#welcomeModal").classList.remove("hidden");
  });
  $("#welcomeClose").addEventListener("click", () => closeWelcome());
  $("#skipOnboarding").addEventListener("click", () => closeWelcome());
  $("#nextOnboarding").addEventListener("click", () => {
    if (state.onboardingSlide === 0) {
      state.onboardingSlide = 1;
      renderOnboarding();
    } else {
      closeWelcome();
    }
  });

  $("#muteVoice").addEventListener("click", () => {
    $("#voiceStateLabel").textContent = "Muted";
  });
  $("#interruptVoice").addEventListener("click", () => {
    $("#voiceStateLabel").textContent = "Interrupted";
  });
  $("#endVoice").addEventListener("click", stopVoice);
}

function init() {
  hydrateIcons();
  renderExamplesModal();
  renderFiles();
  bindEvents();
  updateI18n();
  showResultShell(false);
  showWelcomeIfNeeded();
}

init();
