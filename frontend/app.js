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
  currentReport: null,
  uploadedFiles: [],
  analysisSource: "empty",
  isAnalyzing: false,
  isDiscussing: false,
  chatHistory: [],
  voiceStream: null,
  recognition: null,
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
      "Upload tender files or run the example files. TenderLens Agentic AI will then fill this workspace with a bid score, checklist, evidence, map, deck, and questions. Use example files to explore prepared results, or upload your own Tender Files to run a new analysis.",
    emptyOverallTitle: "No analysis yet",
    emptyOverallBody: "Your overall score and executive summary will appear here after TenderLens checks the files.",
    overall: "Overall result",
    sampleRun: "Prepared example",
    uploadedRun: "Uploaded files",
    verify: "AI-generated review. Verify before making procurement decisions.",
    analysis: "Analysis",
    ask: "Discuss with TenderLens",
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
    askDesc: "Discuss the documents, evidence, risks, and next steps by chat or voice.",
    mapDesc: "A simple view of how files, requirements, evidence, risks, and actions connect.",
    deckDesc: "A lightweight stakeholder briefing created from the analysis result.",
    questionsDesc: "Practical questions to send to the issuer or project owner before submission.",
    exampleTitle: "Example Files",
    exampleDescription: "Use these example files to explore prepared results without uploading your own documents.",
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
    chatIntro: "Discuss the active analysis. You can ask about risks, missing documents, evidence, or next actions.",
    chatNeedsAnalysis: "Run an analysis first so TenderLens can answer using your documents.",
    voiceNeedsAnalysis: "Run an analysis first, then use voice to discuss the active result.",
    emptyChecklistTitle: "No requirements checked yet",
    emptyChecklistBody: "TenderLens will list tender requirements, evidence, and risk levels here after analysis.",
    emptyEvidenceTitle: "Evidence will appear after analysis",
    emptyEvidenceBody: "Select a checked requirement after analysis to see the source quote.",
    emptyAttentionTitle: "No risks found yet",
    emptyAttentionBody: "Risks and clarifications will appear here once TenderLens reviews the files.",
    emptyTraceTitle: "Nothing checked yet",
    emptyTraceBody: "The review steps will appear here after analysis.",
    emptyMapTitle: "Tender Map will appear after analysis",
    emptyMapBody: "TenderLens will connect files, requirements, evidence, risks, and actions.",
    emptyDeckTitle: "Briefing Deck will appear after analysis",
    emptyDeckBody: "The deck will summarize the result, strengths, risks, evidence, and next actions.",
    emptyQuestionsTitle: "Questions will appear after analysis",
    emptyQuestionsBody: "TenderLens will prepare practical questions for the issuer or project owner.",
    noDeckCounter: "No deck yet",
    noMajorRisks: "No major risks listed.",
    uploadAccepted: (count) => `${count} file${count === 1 ? "" : "s"} accepted. Run analysis to review them.`,
    running: "TenderLens is checking the evidence...",
    analysisLoadingTitle: "TenderLens is reviewing evidence...",
    analysisLoadingBody: "Please keep this workspace open while the agents read the files and prepare the report.",
    discussing: "TenderLens is preparing a grounded answer...",
    discussUnavailable: "Live Discuss with TenderLens is unavailable. Check the model configuration and try again.",
    voiceReady: "Ready",
    voiceListening: "Listening",
    voiceProcessing: "Processing",
    voiceSpeaking: "Speaking",
    voiceUnsupported: "Unsupported",
    voiceError: "Error",
    backendUnavailable: "Live backend analysis is unavailable. A bounded local text review was generated for this session.",
    unsupportedLocal:
      "Live backend analysis is required for PDF, DOCX, and image parsing. Use TXT/MD here or connect the cloud runtime.",
    quickQuestions: [
      "What are the biggest risks?",
      "Why is this partial?",
      "What should I ask the issuer?",
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
        title: "Explore prepared results",
        body: "Use example files to explore prepared results, or upload your own Tender Files to run a new analysis.",
      },
      {
        counter: "2 OF 2",
        title: "Discuss the analysis",
        body: "After analysis, TenderLens fills the workspace with a checklist, evidence, map, briefing deck, and questions. Discuss with TenderLens by chat or voice.",
      },
    ],
    onboardingChecks: ["Use example files", "Upload Tender Files", "Discuss results"],
    onboardingSteps: ["Use example files or upload Tender Files", "Review the workspace", "Discuss by chat or voice", "Download after analysis"],
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
      "ارفع ملفات المناقصة أو شغل ملفات المثال. سيملأ TenderLens Agentic AI مساحة العمل بنتيجة قرار التقديم والقائمة والأدلة والخريطة والعرض والأسئلة. استخدم ملفات المثال لاستكشاف نتائج معدة، أو ارفع ملفاتك لتشغيل تحليل جديد.",
    emptyOverallTitle: "لا يوجد تحليل بعد",
    emptyOverallBody: "ستظهر النتيجة العامة والملخص التنفيذي هنا بعد فحص الملفات.",
    overall: "النتيجة العامة",
    sampleRun: "مثال معد مسبقا",
    uploadedRun: "ملفات مرفوعة",
    verify: "مراجعة مولدة بالذكاء الاصطناعي. تحقق قبل اتخاذ قرارات الشراء.",
    analysis: "التحليل",
    ask: "ناقش مع TenderLens",
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
    askDesc: "ناقش المستندات والأدلة والمخاطر والخطوات التالية بالكتابة أو الصوت.",
    mapDesc: "عرض بسيط يوضح ارتباط الملفات والمتطلبات والأدلة والمخاطر والإجراءات.",
    deckDesc: "ملخص خفيف لأصحاب المصلحة يتم إنشاؤه من نتيجة التحليل.",
    questionsDesc: "أسئلة عملية لإرسالها إلى المورد أو مالك المشروع قبل التقديم.",
    exampleTitle: "ملفات مثال",
    exampleDescription: "استخدم ملفات المثال لاستكشاف نتائج معدة بدون رفع ملفاتك.",
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
    chatIntro: "ناقش التحليل الحالي. يمكنك السؤال عن المخاطر أو المستندات الناقصة أو الأدلة أو الخطوات التالية.",
    chatNeedsAnalysis: "شغل التحليل أولا حتى يتمكن TenderLens من الإجابة باستخدام مستنداتك.",
    voiceNeedsAnalysis: "شغل التحليل أولا، ثم استخدم الصوت لمناقشة النتيجة الحالية.",
    emptyChecklistTitle: "لم يتم فحص المتطلبات بعد",
    emptyChecklistBody: "سيعرض TenderLens المتطلبات والأدلة ومستويات المخاطر هنا بعد التحليل.",
    emptyEvidenceTitle: "ستظهر الأدلة بعد التحليل",
    emptyEvidenceBody: "اختر متطلبا مفحوصا بعد التحليل لرؤية الاقتباس من المصدر.",
    emptyAttentionTitle: "لا توجد مخاطر بعد",
    emptyAttentionBody: "ستظهر المخاطر والتوضيحات هنا بعد مراجعة الملفات.",
    emptyTraceTitle: "لم يتم فحص أي شيء بعد",
    emptyTraceBody: "ستظهر خطوات المراجعة هنا بعد التحليل.",
    emptyMapTitle: "ستظهر خريطة المناقصة بعد التحليل",
    emptyMapBody: "سيربط TenderLens الملفات والمتطلبات والأدلة والمخاطر والإجراءات.",
    emptyDeckTitle: "سيظهر العرض الموجز بعد التحليل",
    emptyDeckBody: "سيلخص العرض النتيجة ونقاط القوة والمخاطر والأدلة والخطوات التالية.",
    emptyQuestionsTitle: "ستظهر الأسئلة بعد التحليل",
    emptyQuestionsBody: "سيعد TenderLens أسئلة عملية لإرسالها إلى جهة الطرح أو مالك المشروع.",
    noDeckCounter: "لا يوجد عرض بعد",
    noMajorRisks: "لا توجد مخاطر رئيسية مدرجة.",
    uploadAccepted: (count) => `تم قبول ${count} ملف. شغل التحليل لمراجعتها.`,
    running: "يقوم TenderLens بمراجعة الأدلة...",
    analysisLoadingTitle: "يقوم TenderLens بمراجعة الأدلة...",
    analysisLoadingBody: "يرجى إبقاء مساحة العمل مفتوحة بينما تقرأ الوكلاء الملفات وتجهز التقرير.",
    discussing: "يقوم TenderLens بإعداد إجابة مستندة إلى التحليل...",
    discussUnavailable: "المحادثة الحية مع TenderLens غير متاحة. تحقق من إعداد النموذج ثم حاول مرة أخرى.",
    voiceReady: "جاهز",
    voiceListening: "يستمع",
    voiceProcessing: "يعالج",
    voiceSpeaking: "يتحدث",
    voiceUnsupported: "غير مدعوم",
    voiceError: "خطأ",
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
        title: "استكشف نتائج معدة",
        body: "استخدم ملفات المثال لاستكشاف نتائج معدة، أو ارفع ملفات المناقصة الخاصة بك لتشغيل تحليل جديد.",
      },
      {
        counter: "2 من 2",
        title: "ناقش التحليل",
        body: "بعد التحليل، يملأ TenderLens مساحة العمل بقائمة متطلبات وأدلة وخريطة وعرض موجز وأسئلة. ناقش النتيجة بالكتابة أو الصوت.",
      },
    ],
    onboardingChecks: ["استخدم ملفات المثال", "ارفع ملفات المناقصة", "ناقش النتائج"],
    onboardingSteps: ["استخدم ملفات المثال أو ارفع ملفات المناقصة", "راجع مساحة العمل", "ناقش بالكتابة أو الصوت", "نزل التحليل بعد اكتماله"],
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
  missingDocuments: [
    "120-day bid bond letter",
    "ISO 27001 certificate or independent security evidence",
    "Written confirmation for 50 training seats",
    "Revised go-live plan for 30 September 2026",
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

function emptyState(title, body, icon = "gauge") {
  return `
    <div class="empty-panel-state">
      <span class="empty-panel-icon" aria-hidden="true">${iconMarkup(icon)}</span>
      <strong>${escapeText(title)}</strong>
      <p>${escapeText(body)}</p>
    </div>
  `;
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
    missingDocuments: result.missingDocuments || result.missing_documents || [],
    nextActions: result.nextActions || [],
    files: result.files || [],
  };
}

function resultToReport(result) {
  if (!result) return {};
  return result.rawReport || {
    executive_summary: result.executiveBrief,
    score: result.score,
    findings: result.matrix.map((row, index) => ({
      agent: row.category || "Checklist",
      status: row.status === "Compliant" ? "pass" : row.status === "Gap" ? "fail" : "watch",
      summary: row.requirement,
      actions: [row.response],
      evidence_ids: [`row-${index}`],
    })),
    evidence: result.matrix.flatMap((row, index) =>
      row.citations.map((citation, citationIndex) => ({
        id: `row-${index}-${citationIndex}`,
        citation: citation.file,
        excerpt: citation.quote,
      })),
    ),
    risks: result.risks.map((risk) => (typeof risk === "string" ? { title: risk } : risk)),
    missing_documents: result.missingDocuments,
    next_actions: result.nextActions,
    source_documents: result.files.map((filename) => ({ filename })),
    workflow_trace: result.trace,
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
    missingDocuments: report.missing_documents || [],
    nextActions: report.next_actions || [],
    files,
    rawReport: report,
  });
  if (!Number.isFinite(report.score)) {
    normalized.score = calculateComplianceScore(normalized.matrix);
  }
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
  $("#chatInput").placeholder = state.language === "ar" ? "اسأل عن هذه المستندات أو التحليل..." : "Ask about these documents or the analysis...";
  $("#langEn").classList.toggle("active", state.language === "en");
  $("#langAr").classList.toggle("active", state.language === "ar");
  renderOnboarding();
  if (state.currentResult) renderResult();
  else renderEmptyWorkspace();
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
  $("#resultShell").classList.remove("hidden");
  $(".result-summary").classList.toggle("hidden", !show);
  updateControlState();
}

function updateControlState() {
  const busy = state.isAnalyzing || state.isDiscussing;
  const hasResult = Boolean(state.currentResult);
  [
    "uploadRunButton",
    "heroUploadButton",
    "emptyUploadButton",
    "useSampleButton",
    "heroSampleButton",
    "emptySampleButton",
    "viewExamplesButton",
    "startFreshButton",
    "addMoreButton",
    "langEn",
    "langAr",
  ].forEach((id) => {
    const node = $(`#${id}`);
    if (node) node.disabled = busy;
  });
  ["downloadPdf", "downloadDocx", "downloadTxt", "downloadPptx", "downloadMapSvg"].forEach((id) => {
    const node = $(`#${id}`);
    if (node) node.disabled = busy || !hasResult;
  });
  const canUseVoiceButton = !state.isAnalyzing && !state.isDiscussing;
  $("#voiceModeButton").disabled = !canUseVoiceButton;
  $("#chatInput").disabled = state.isAnalyzing || state.isDiscussing;
  $("#sendChat").disabled = state.isAnalyzing || state.isDiscussing || !$("#chatInput").value.trim();
}

function setAnalyzing(value) {
  state.isAnalyzing = value;
  $("#analysisOverlay").classList.toggle("hidden", !value);
  document.body.classList.toggle("is-analyzing", value);
  updateControlState();
}

function renderEmptyWorkspace() {
  showResultShell(false);
  renderChecklist();
  renderAttention();
  renderTrace();
  renderChat();
  renderMap();
  renderDeck();
  renderQuestions();
  switchTab(state.activeTab);
  updateControlState();
}

function resultTitle(result) {
  if (result.score === 0) return text().resultTitleNoEvidence;
  if (result.score >= 80) return text().resultTitleStrong;
  return text().resultTitleRisk;
}

function renderResult() {
  const result = state.currentResult;
  if (!result) {
    renderEmptyWorkspace();
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
  updateControlState();
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function renderChecklist() {
  const result = state.currentResult;
  const copy = text();
  if (!result) {
    $("#checklistRows").innerHTML = emptyState(copy.emptyChecklistTitle, copy.emptyChecklistBody, "clipboard-check");
    renderActiveEvidence();
    return;
  }
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
    const copy = text();
    $("#activeEvidence").innerHTML = emptyState(copy.emptyEvidenceTitle, copy.emptyEvidenceBody, "file-text");
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
  if (!state.currentResult) {
    const copy = text();
    $("#attentionList").innerHTML = `<li class="empty-list-state">${escapeText(copy.emptyAttentionTitle)}. ${escapeText(copy.emptyAttentionBody)}</li>`;
    return;
  }
  const risks = state.currentResult.risks.length ? state.currentResult.risks : [text().noMajorRisks];
  $("#attentionList").innerHTML = risks.map((risk) => `<li>${escapeText(risk)}</li>`).join("");
}

function renderTrace() {
  if (!state.currentResult) {
    const copy = text();
    $("#traceList").innerHTML = `<li class="empty-list-state"><span>0</span>${escapeText(copy.emptyTraceTitle)}. ${escapeText(copy.emptyTraceBody)}</li>`;
    return;
  }
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
  const files = (result.files && result.files.length ? result.files : exampleFiles.map((file) => file.name)).slice(0, MAX_UPLOAD_FILES);
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
  if (!state.currentResult) {
    const copy = text();
    $("#tenderMapSvg").innerHTML = emptyState(copy.emptyMapTitle, copy.emptyMapBody, "network");
    $("#downloadMapSvg").disabled = true;
    updateControlState();
    return;
  }
  const map = buildTenderMap(state.currentResult);
  $("#tenderMapSvg").innerHTML = buildTenderMapSvg(map);
  $("#downloadMapSvg").disabled = false;
  updateControlState();
}

function colorForRisk(risk) {
  if (risk === "High") return { fill: "#fff1ef", stroke: "#e2b4ad", dot: "#b42318" };
  if (risk === "Medium") return { fill: "#fff8e9", stroke: "#e2c585", dot: "#bd750f" };
  return { fill: "#eef3ff", stroke: "#b7c9ff", dot: "#4165d8" };
}

function buildTenderMapSvg(map) {
  const rows = map.rows;
  const rowHeight = 148;
  const height = Math.max(690, 122 + Math.max(rows.length, map.files.length) * rowHeight);
  const headers = text().mapHeaders;
  const fileRows = map.files.map((file, index) => ({ label: shortFileName(file), y: 140 + index * rowHeight }));
  const lastFileY = fileRows[fileRows.length - 1]?.y || 140;
  const pathColor = "#aeb8b5";

  const fileCards = fileRows
    .map(
      (file, index) => `
        <g data-card="file-${index}">
        <rect x="36" y="${file.y}" width="230" height="84" rx="14" fill="#fffdf8" stroke="#d7dfda" stroke-width="1.5"/>
        ${svgTextLines(file.label, state.language === "ar" ? 246 : 54, file.y + 30, 184, 3)}
        <circle cx="226" cy="${file.y + 18}" r="5" fill="#4968d9"/>
        ${index === fileRows.length - 1 ? rows.map((_, rowIndex) => {
          const targetY = 140 + rowIndex * rowHeight + 36;
          return `<path d="M266 ${file.y + 42} C 306 ${file.y + 42}, 296 ${targetY}, 338 ${targetY}" fill="none" stroke="${pathColor}" stroke-width="1.5"/>`;
        }).join("") : ""}
        </g>
      `,
    )
    .join("");

  const rowCards = rows
    .map((row, index) => {
      const y = 140 + index * rowHeight;
      const risk = colorForRisk(row.risk);
      const riskLabel = `${text().riskLabel[row.risk]}${state.language === "ar" ? "" : " risk"}`;
      return `
        <g data-card="requirement-${index}">
        <rect x="340" y="${y}" width="250" height="92" rx="14" fill="#fff8e9" stroke="#e5c884" stroke-width="1.5"/>
        ${svgTextLines(row.requirement, state.language === "ar" ? 570 : 358, y + 28, 198, 3)}
        <circle cx="558" cy="${y + 18}" r="5" fill="#bd750f"/>
        <path d="M580 ${y + 36} L 655 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        </g>
        <g data-card="evidence-${index}">
        <rect x="660" y="${y}" width="270" height="92" rx="14" fill="#effaf6" stroke="#91d4c6" stroke-width="1.5"/>
        ${svgTextLines(row.evidence, state.language === "ar" ? 910 : 678, y + 28, 216, 3)}
        <circle cx="888" cy="${y + 18}" r="5" fill="#3f8e73"/>
        <path d="M910 ${y + 36} L 985 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        </g>
        <g data-card="risk-${index}">
        <rect x="990" y="${y}" width="230" height="92" rx="14" fill="${risk.fill}" stroke="${risk.stroke}" stroke-width="1.5"/>
        ${svgTextLines(riskLabel, state.language === "ar" ? 1200 : 1008, y + 40, 172, 2)}
        <circle cx="1198" cy="${y + 18}" r="5" fill="${risk.dot}"/>
        </g>
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
      ${rows.length && fileRows.length ? `<path d="M266 ${lastFileY + 42} C 300 ${lastFileY + 42}, 298 ${lastFileY + 42}, 338 ${lastFileY + 42}" fill="none" stroke="${pathColor}" stroke-width="1.5"/>` : ""}
      ${rowCards}
    </svg>
  `;
}

function buildBriefingDeck(result) {
  const compliant = result.matrix.filter((row) => row.status === "Compliant").slice(0, 3);
  const risky = result.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").slice(0, 4);
  const evidence = result.matrix.flatMap((row) => row.citations.slice(0, 1).map((citation) => `${firstWords(row.requirement, 8)}: ${citation.quote}`));
  if (state.language === "ar") {
    return [
      { eyebrow: "لمحة", title: "النتيجة العامة", bullets: [`${text().score}: ${result.score}/100`, "ملخص التحليل متاح مع الأدلة والمخاطر والخطوات التالية."] },
      { eyebrow: "نقاط قوة", title: "أهم البنود الممتثلة", bullets: compliant.length ? compliant.map((row) => row.requirement) : ["لا توجد بنود ممتثلة بالكامل بعد."] },
      { eyebrow: "انتباه", title: "أكبر المخاطر", bullets: risky.length ? risky.map((row) => `${text().riskLabel[row.risk]}: ${row.requirement}`) : ["لا توجد مخاطر رئيسية مدرجة."] },
      { eyebrow: "أدلة", title: "أبرز الأدلة", bullets: evidence.length ? evidence.slice(0, 4) : ["لا توجد أدلة متاحة."] },
      { eyebrow: "إجراء", title: "الخطوات التالية", bullets: result.nextActions.length ? result.nextActions.slice(0, 5) : ["راجع المتطلبات مع فريق المشروع."] },
    ];
  }
  return [
    { eyebrow: "Snapshot", title: "Overall result", bullets: [`${text().score}: ${result.score}/100`, result.executiveBrief] },
    { eyebrow: "Strengths", title: "Top compliance wins", bullets: compliant.length ? compliant.map((row) => row.requirement) : ["No fully compliant rows found yet."] },
    { eyebrow: "Attention", title: "Biggest risks", bullets: risky.length ? risky.map((row) => `${text().riskLabel[row.risk]} risk: ${row.requirement}`) : ["No major risks detected."] },
    { eyebrow: "Evidence", title: "Evidence highlights", bullets: evidence.length ? evidence.slice(0, 4) : ["No evidence highlights available."] },
    { eyebrow: "Action", title: "Next actions", bullets: result.nextActions.length ? result.nextActions.slice(0, 5) : ["Review requirements with the project team."] },
  ];
}

function renderDeck() {
  if (!state.currentResult) {
    const copy = text();
    $("#slidePill").textContent = copy.noDeckCounter;
    $("#deckCounter").textContent = "0/0";
    $("#deckFooterText").textContent = copy.noDeckCounter;
    $("#deckEyebrow").textContent = copy.deck;
    $("#deckTitle").textContent = copy.emptyDeckTitle;
    $("#deckBullets").innerHTML = `<li class="deck-empty-state">${escapeText(copy.emptyDeckBody)}</li>`;
    $("#deckDots").innerHTML = "";
    $("#prevSlide").disabled = true;
    $("#nextSlide").disabled = true;
    $("#downloadPptx").disabled = true;
    updateControlState();
    return;
  }
  const deck = buildBriefingDeck(state.currentResult);
  $("#prevSlide").disabled = false;
  $("#nextSlide").disabled = false;
  $("#downloadPptx").disabled = false;
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
  updateControlState();
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
    question:
      state.language === "ar"
        ? `ما المطلوب لتنفيذ هذا الإجراء: ${action}?`
        : action.endsWith("?")
          ? action
          : `${action}?`,
    why:
      state.language === "ar"
        ? result.risks[index] || "هذا الإجراء موصى به من TenderLens Agentic AI."
        : result.risks[index] || "This action was recommended by TenderLens Agentic AI.",
  }));
  return [...rowQuestions, ...actionQuestions].slice(0, 8);
}

function renderQuestions() {
  if (!state.currentResult) {
    const copy = text();
    $("#questionsList").innerHTML = emptyState(copy.emptyQuestionsTitle, copy.emptyQuestionsBody, "circle-help");
    return;
  }
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
  return node;
}

async function discussWithTenderLens(message, mode = "text") {
  if (!state.currentResult) {
    return { answer: text().chatNeedsAnalysis, citations: [], followups: [] };
  }
  const payload = {
    message,
    language: state.language,
    mode,
    report: state.currentReport || resultToReport(state.currentResult),
    history: state.chatHistory.slice(-8),
  };
  const response = await postJson("/api/discuss", payload, 30000);
  return {
    answer: response.answer || text().discussUnavailable,
    citations: response.citations || [],
    followups: response.followups || [],
  };
}

function svgTextLines(value, x, y, width, maxLines = 3, lineHeight = 18, options = {}) {
  const words = String(value || "").split(/\s+/).filter(Boolean);
  const approxChars = Math.max(8, Math.floor(width / 7.4));
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > approxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  const clipped = lines.slice(0, maxLines);
  if (lines.length > maxLines) clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/\.*$/, "")}...`;
  const anchor = options.anchor || (state.language === "ar" ? "end" : "start");
  const direction = options.direction || (state.language === "ar" ? "rtl" : "ltr");
  return `<text x="${x}" y="${y}" font-size="${options.size || 13}" fill="${options.fill || "#101214"}" text-anchor="${anchor}" direction="${direction}">${clipped
    .map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeText(item)}</tspan>`)
    .join("")}</text>`;
}

function setDiscussing(value) {
  state.isDiscussing = value;
  updateControlState();
}

async function handleChatQuestion(question, mode = "text") {
  const value = question.trim();
  if (!value) return "";
  addChatMessage(value, "user");
  state.chatHistory.push({ role: "user", content: value });
  const thinking = addChatMessage(text().discussing, "agent thinking");
  setDiscussing(true);
  try {
    const response = await discussWithTenderLens(value, mode);
    thinking.className = "message agent";
    thinking.textContent = response.answer;
    state.chatHistory.push({ role: "agent", content: response.answer });
    if (response.followups?.length) {
      $("#quickQuestions").innerHTML = response.followups
        .slice(0, 4)
        .map((questionText) => `<button type="button" data-question="${escapeText(questionText)}">${escapeText(questionText)}</button>`)
        .join("");
    }
    return response.answer;
  } catch (error) {
    const fallback = error.message?.includes("503") ? text().discussUnavailable : answerQuestion(value);
    thinking.className = "message agent";
    thinking.textContent = fallback;
    state.chatHistory.push({ role: "agent", content: fallback });
    return fallback;
  } finally {
    setDiscussing(false);
  }
}

function answerQuestion(question) {
  const lower = question.toLowerCase();
  const result = state.currentResult;
  if (!result) return text().chatNeedsAnalysis;
  if (lower.includes("arabic") || /عرب/.test(question)) {
    return "الخلاصة: توجد نقاط قوة واضحة، لكن يجب توضيح المخاطر والمتطلبات الجزئية قبل التقديم.";
  }
  if (lower.includes("missing") || lower.includes("document") || /مستند|وثيق|ناقص/.test(question)) {
    const documents = result.missingDocuments?.length ? result.missingDocuments : result.nextActions;
    return documents.length
      ? `Documents or confirmations to close: ${documents.slice(0, 4).join(" ")}`
      : "No missing documents are listed in the current analysis.";
  }
  if (lower.includes("next") || lower.includes("action") || /خطو|إجراء/.test(question)) {
    return result.nextActions.length
      ? `Next actions: ${result.nextActions.slice(0, 4).join(" ")}`
      : "No next actions are listed in the current analysis.";
  }
  if (lower.includes("evidence") || lower.includes("citation") || lower.includes("checklist") || /دليل|أدلة/.test(question)) {
    const row = result.matrix[state.activeRow] || result.matrix[0];
    const evidence = row?.citations?.map((citation) => `${citation.file}: ${citation.quote}`).join(" ");
    return row && evidence
      ? `${row.requirement} Evidence: ${evidence}`
      : "No evidence quote is selected yet.";
  }
  if (lower.includes("risk") || lower.includes("مخاطر")) {
    return result.risks.slice(0, 3).join(" ");
  }
  if (lower.includes("partial") || lower.includes("جزئي")) {
    const row = result.matrix.find((item) => item.status === "Partial") || result.matrix[0];
    return `${row.requirement}: ${row.response}`;
  }
  if (lower.includes("ask") || lower.includes("issuer") || lower.includes("vendor") || lower.includes("سأ")) {
    return buildQuestions(result)[0]?.question || "Ask the issuer to confirm every mandatory requirement with source-backed evidence.";
  }
  const queryTerms = lower.split(/[^a-z0-9]+/).filter((word) => word.length > 4);
  const matchedRow = result.matrix.find((row) => {
    const haystack = `${row.requirement} ${row.response} ${row.category} ${row.citations.map((citation) => `${citation.file} ${citation.quote}`).join(" ")}`.toLowerCase();
    return queryTerms.some((word) => haystack.includes(word));
  });
  if (matchedRow) {
    const citation = matchedRow.citations[0];
    return `${matchedRow.requirement} ${matchedRow.response}${citation ? ` Evidence: ${citation.file}: ${citation.quote}` : ""}`;
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

  setAnalyzing(true);
  try {
    const result = await postFormData("/api/upload/analyze", createUploadAnalysisFormData(), 60000, { preferBackend: true });
    state.currentResult = reportToComplianceResult(result.report);
    state.currentReport = result.report;
    state.analysisSource = "uploaded";
    $("#uploadStatus").textContent = text().uploadAccepted(state.uploadedFiles.length);
  } catch (error) {
    try {
      state.currentResult = await buildLocalUploadedResult();
      state.currentReport = resultToReport(state.currentResult);
      state.analysisSource = "uploaded";
      $("#uploadStatus").textContent = text().backendUnavailable;
    } catch (localError) {
      $("#uploadStatus").textContent = localError.message || error.message || text().unsupportedLocal;
      $("#uploadStatus").classList.add("error");
      return;
    }
  } finally {
    setAnalyzing(false);
  }
  state.activeRow = 0;
  state.activeSlide = 0;
  renderResult();
}

function useExampleFiles() {
  state.currentResult = normalizeResult(structuredClone(exampleResult));
  state.currentReport = resultToReport(state.currentResult);
  state.analysisSource = "sample";
  state.uploadedFiles = [];
  state.activeRow = 0;
  state.activeSlide = 0;
  $("#fileInput").value = "";
  $("#uploadStatus").classList.remove("error");
  $("#uploadStatus").textContent = "Example files show prepared results so you can explore the workspace quickly.";
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
  state.currentReport = null;
  state.uploadedFiles = [];
  state.analysisSource = "empty";
  state.chatHistory = [];
  state.activeRow = 0;
  state.activeSlide = 0;
  $("#fileInput").value = "";
  $("#supportingFileInput").value = "";
  $("#uploadStatus").textContent = "";
  $("#chatLog").innerHTML = "";
  renderFiles();
  renderEmptyWorkspace();
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

function showGuide(show) {
  $("#guidePage").classList.toggle("hidden", !show);
  $(".page-shell").classList.toggle("hidden", show);
  if (show) {
    closeWelcome(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function handleHashRoute() {
  showGuide(window.location.hash === "#how-to-use");
}

function downloadTextFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  downloadBlob(filename, blob);
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

async function downloadPdfReport(content) {
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) throw new Error("PDF generator is unavailable.");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const lines = doc.splitTextToSize(content, 500);
  let y = 48;
  lines.forEach((line) => {
    if (y > 780) {
      doc.addPage();
      y = 48;
    }
    doc.text(line, 48, y);
    y += 16;
  });
  doc.save("tenderlens-analysis.pdf");
}

async function downloadDocxReport(content) {
  if (!window.JSZip) throw new Error("DOCX generator is unavailable.");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  const paragraphs = content
    .split(/\n+/)
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`)
    .join("");
  zip.folder("word").file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr/></w:body></w:document>`);
  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  downloadBlob("tenderlens-analysis.docx", blob);
}

async function downloadPptxReport() {
  const PptxGenJS = window.PptxGenJS || window.pptxgen || window.pptxgenjs;
  if (!PptxGenJS) throw new Error("PPTX generator is unavailable.");
  const deck = buildBriefingDeck(state.currentResult);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  deck.forEach((item) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFDF8" };
    slide.addText(item.eyebrow.toUpperCase(), { x: 0.6, y: 0.45, w: 4, h: 0.3, fontFace: "Arial", fontSize: 11, bold: true, color: "0F8B83" });
    slide.addText(item.title, { x: 0.6, y: 0.9, w: 11.8, h: 0.65, fontFace: "Arial", fontSize: 28, bold: true, color: "101214", fit: "shrink" });
    slide.addText(item.bullets.slice(0, 5).map((bullet) => ({ text: String(bullet), options: { bullet: { type: "ul" } } })), {
      x: 0.8,
      y: 1.9,
      w: 11.2,
      h: 4.8,
      fontFace: "Arial",
      fontSize: 16,
      color: "30363D",
      breakLine: false,
      fit: "shrink",
    });
    slide.addText("TENDERLENS AGENTIC AI", { x: 9.6, y: 6.85, w: 2.8, h: 0.25, fontFace: "Arial", fontSize: 9, bold: true, color: "0F8B83", align: "right" });
  });
  await pptx.writeFile({ fileName: "tenderlens-analysis.pptx" });
}

async function downloadReport(format) {
  if (!state.currentResult) return;
  const content = reportText();
  if (format === "txt") {
    downloadTextFile("tenderlens-analysis.txt", content);
    return;
  }
  if (format === "pdf") {
    await downloadPdfReport(content);
    return;
  }
  if (format === "docx") {
    await downloadDocxReport(content);
    return;
  }
  if (format === "pptx") {
    await downloadPptxReport();
  }
}

function downloadMap() {
  const svg = $("#tenderMapSvg svg")?.outerHTML || "";
  if (svg) downloadTextFile("tenderlens-map.svg", svg, "image/svg+xml");
}

async function startVoice() {
  $("#voiceOverlay").classList.remove("hidden");
  $("#transcript").textContent = "";
  if (!state.currentResult) {
    $("#voiceStateLabel").textContent = "Analysis needed";
    $("#voiceHelp").textContent = text().voiceNeedsAnalysis;
    $("#transcript").textContent = text().chatNeedsAnalysis;
    return;
  }
  const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  if (!Recognition) {
    $("#voiceStateLabel").textContent = text().voiceUnsupported;
    $("#voiceHelp").textContent = "This browser does not support speech recognition. Please use typed chat.";
    $("#transcript").textContent = "Speech recognition is unavailable in this browser.";
    return;
  }
  $("#voiceStateLabel").textContent = text().voiceReady;
  $("#voiceHelp").textContent = "Ask about risks, evidence, missing documents, or next actions.";
  $("#transcript").textContent = `Ready to discuss: ${state.currentResult.executiveBrief}`;
  try {
    const recognition = new Recognition();
    state.recognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = state.language === "ar" ? "ar-SA" : "en-US";
    recognition.onstart = () => {
      $("#voiceStateLabel").textContent = text().voiceListening;
      $("#voiceHelp").textContent = "Listening for your question.";
    };
    recognition.onerror = () => {
      $("#voiceStateLabel").textContent = text().voiceError;
      $("#voiceHelp").textContent = "Microphone or speech recognition failed. Typed chat remains available.";
    };
    recognition.onresult = async (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (!transcript.trim()) return;
      $("#voiceStateLabel").textContent = text().voiceProcessing;
      $("#transcript").textContent = transcript;
      const answer = await handleChatQuestion(transcript, "voice");
      $("#transcript").textContent = `${transcript}\n\n${answer}`;
      if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
        $("#voiceStateLabel").textContent = text().voiceSpeaking;
        if (Array.isArray(window.__spokenText)) window.__spokenText.push(answer);
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = state.language === "ar" ? "ar-SA" : "en-US";
        utterance.onend = () => {
          $("#voiceStateLabel").textContent = text().voiceReady;
        };
        window.speechSynthesis.speak(utterance);
      } else {
        $("#voiceStateLabel").textContent = text().voiceReady;
      }
    };
    recognition.start();
  } catch {
    $("#voiceStateLabel").textContent = text().voiceError;
    $("#voiceHelp").textContent = "Microphone unavailable. Typing mode remains available.";
  }
}

function stopVoice() {
  if (state.voiceStream) state.voiceStream.getTracks().forEach((track) => track.stop());
  if (state.recognition) state.recognition.abort?.();
  window.speechSynthesis?.cancel?.();
  state.voiceStream = null;
  state.recognition = null;
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
    $("#chatInput").value = "";
    updateControlState();
    void handleChatQuestion(value);
  });
  $("#chatInput").addEventListener("input", updateControlState);

  $("#quickQuestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    const question = button.dataset.question;
    void handleChatQuestion(question);
  });

  $("#voiceModeButton").addEventListener("click", startVoice);

  $("#prevSlide").addEventListener("click", () => {
    if (!state.currentResult) return;
    const deck = buildBriefingDeck(state.currentResult);
    state.activeSlide = (state.activeSlide - 1 + deck.length) % deck.length;
    renderDeck();
  });
  $("#nextSlide").addEventListener("click", () => {
    if (!state.currentResult) return;
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

  $("#downloadTxt").addEventListener("click", () => void downloadReport("txt"));
  $("#downloadPdf").addEventListener("click", () => void downloadReport("pdf"));
  $("#downloadDocx").addEventListener("click", () => void downloadReport("docx"));
  $("#downloadPptx").addEventListener("click", () => void downloadReport("pptx"));
  $("#downloadMapSvg").addEventListener("click", downloadMap);

  $("#viewExamplesButton").addEventListener("click", () => $("#examplesModal").classList.remove("hidden"));
  $("#closeExamples").addEventListener("click", () => $("#examplesModal").classList.add("hidden"));
  $("#examplesModal").addEventListener("click", (event) => {
    if (event.target.id === "examplesModal") $("#examplesModal").classList.add("hidden");
  });

  $("#howToButton").addEventListener("click", () => {
    window.location.hash = "how-to-use";
    handleHashRoute();
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
  window.addEventListener("hashchange", handleHashRoute);
}

function init() {
  hydrateIcons();
  renderExamplesModal();
  renderFiles();
  bindEvents();
  updateI18n();
  renderEmptyWorkspace();
  showWelcomeIfNeeded();
  handleHashRoute();
}

init();
