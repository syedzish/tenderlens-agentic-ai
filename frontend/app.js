const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_UPLOAD_FILES = 5;
const WELCOME_STORAGE_KEY = "tenderlens-welcome-dismissed-v3";
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
  analysisError: null,
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
    exampleStatus: "Example files show prepared results so you can explore the workspace quickly.",
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
    discussUnavailable: "TenderLens could not reach the model right now. Please try again after some time.",
    modelRetryTitle: "Model connection needs a moment",
    modelRetryBody: "Please try again after some time. Your current analysis stays available in the workspace.",
    voiceReady: "Ready",
    voiceListening: "Listening",
    voiceProcessing: "Processing",
    voiceSpeaking: "Speaking",
    voiceUnsupported: "Unsupported",
    voiceError: "Error",
    voiceMuted: "Muted",
    voiceInterrupted: "Interrupted",
    voiceReadyBody: "Ask about risks, evidence, missing documents, or next actions.",
    voiceListeningBody: "Listening for your question.",
    voiceUnsupportedBody: "This browser does not support speech recognition. Please use typed chat.",
    voiceErrorBody: "Microphone or speech recognition failed. Typed chat remains available.",
    voiceMute: "Mute",
    voiceListenAgain: "Listen again",
    voiceEnd: "End",
    backendUnavailable: "TenderLens could not reach the analysis model right now. Please try again after some time.",
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
    exampleStatus: "تعرض ملفات المثال نتائج معدة حتى تتمكن من استكشاف مساحة العمل بسرعة.",
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
    discussUnavailable: "تعذر على TenderLens الوصول إلى النموذج الآن. يرجى المحاولة بعد بعض الوقت.",
    modelRetryTitle: "اتصال النموذج يحتاج بعض الوقت",
    modelRetryBody: "يرجى المحاولة بعد بعض الوقت. سيبقى التحليل الحالي متاحا في مساحة العمل.",
    voiceReady: "جاهز",
    voiceListening: "يستمع",
    voiceProcessing: "يعالج",
    voiceSpeaking: "يتحدث",
    voiceUnsupported: "غير مدعوم",
    voiceError: "خطأ",
    voiceMuted: "تم الكتم",
    voiceInterrupted: "تم الإيقاف",
    voiceReadyBody: "اسأل عن المخاطر أو الأدلة أو المستندات الناقصة أو الخطوات التالية.",
    voiceListeningBody: "يتم الاستماع إلى سؤالك.",
    voiceUnsupportedBody: "هذا المتصفح لا يدعم التعرف على الكلام. يمكنك استخدام المحادثة النصية.",
    voiceErrorBody: "تعذر استخدام الميكروفون أو التعرف على الكلام. المحادثة النصية ما زالت متاحة.",
    voiceMute: "كتم",
    voiceListenAgain: "استمع مرة أخرى",
    voiceEnd: "إنهاء",
    backendUnavailable: "تعذر على TenderLens الوصول إلى نموذج التحليل الآن. يرجى المحاولة بعد بعض الوقت.",
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

function guideCopy() {
  if (state.language === "ar") {
    return {
      back: "العودة إلى مساحة العمل",
      badge: "طريقة استخدام TenderLens Agentic AI",
      title: "راجع ملفات المناقصة بدون فقدان مسار قرار التقديم.",
      body:
        "يساعد TenderLens Agentic AI فريق العطاءات على رفع ملفات المناقصة، تشغيل تحليل مستند إلى الأدلة، مراجعة المخاطر، مناقشة النتيجة بالكتابة أو الصوت، وتصدير ملفات مراجعة صالحة.",
      open: "افتح مساحة العمل",
      examples: "عرض ملفات المثال",
      cards: [
        {
          icon: "shield-check",
          tone: "mint",
          title: "ما المشكلة التي يحلها؟",
          body: "تحويل حزم المناقصات الطويلة إلى قائمة متطلبات مرتبطة بالأدلة والمخاطر والمستندات الناقصة والخطوات التالية.",
        },
        {
          icon: "presentation",
          tone: "cobalt",
          title: "ماذا تحصل عليه؟",
          body: "نتيجة قرار، قائمة متطلبات، أدلة، خريطة مناقصة، ملخص عرض، أسئلة، محادثة حية، وتصديرات.",
        },
      ],
      stepsLabel: "كيف يعمل TenderLens",
      steps: [
        ["ارفع الملفات أو استخدم المثال", "أضف ملفات المناقصة أو شغل ملفات المثال لاستكشاف نتائج معدة."],
        ["شغل التحليل", "يستخرج TenderLens المتطلبات والأدلة والمخاطر والمستندات الناقصة والخطوات التالية."],
        ["ناقش مع TenderLens", "ناقش التحليل الحالي بالكتابة أو الصوت بناء على سياق التقرير."],
        ["صدر وراجع", "نزل ملفات PDF و DOCX و PPTX و TXT و SVG صالحة لمراجعة الفريق."],
      ],
      previewBadge: "نتيجة تحليل مثال",
      previewTitle: "شكل المخرجات بعد التحليل",
      previewBody: "تعرض مساحة العمل نتيجة، صفوف متطلبات، أدلة مقتبسة، بطاقات مخاطر، وأسئلة عملية.",
      score: "نتيجة /100",
      examplesTitle: "ملفات المثال",
      examplesBody: "استخدم ملفات المثال الخيالية لاختبار التطبيق بسرعة بدون رفع مستنداتك.",
      expectedTitle: "النتائج المتوقعة",
      expectedBody: "نتيجة عامة مع صفوف قائمة مدعومة بالأدلة، أسئلة للطرح، خريطة مناقصة، ملخص عرض، وتصديرات.",
      chips: ["ما أكبر المخاطر؟", "ما المستندات الناقصة؟", "ما الدليل الذي يدعم ذلك؟", "لخص بالعربية."],
    };
  }
  return {
    back: "Back to workspace",
    badge: "How to use TenderLens Agentic AI",
    title: "Review tender documents without losing the bid decision thread.",
    body:
      "TenderLens Agentic AI helps a bidding team upload tender files, run a grounded analysis, inspect evidence, discuss the result by text or voice, and export valid briefing files for review.",
    open: "Open the workspace",
    examples: "View example files",
    cards: [
      {
        icon: "shield-check",
        tone: "mint",
        title: "What problem does it solve?",
        body: "Long tender packs become a checklist with evidence, risks, missing documents, and next actions.",
      },
      {
        icon: "presentation",
        tone: "cobalt",
        title: "What do you get?",
        body: "A score, checklist, evidence panel, Tender Map, Briefing Deck, questions, live discussion, and exports.",
      },
    ],
    stepsLabel: "How TenderLens works",
    steps: [
      ["Upload files or use examples", "Add tender/RFP files or run example files to explore prepared results."],
      ["Run the analysis", "TenderLens extracts requirements, evidence, risks, missing documents, and next actions."],
      ["Discuss with TenderLens", "Discuss the active analysis by text or voice, grounded in the report context."],
      ["Export and review", "Download valid PDF, DOCX, PPTX, TXT, and SVG outputs for team review."],
    ],
    previewBadge: "Example analysis result",
    previewTitle: "What the output looks like after analysis",
    previewBody: "The workspace shows a score, requirement rows, cited evidence, risk attention cards, and practical questions.",
    score: "score /100",
    examplesTitle: "Example files",
    examplesBody: "Use the fictional example files to test the app quickly without uploading your own documents.",
    expectedTitle: "Expected results",
    expectedBody: "Overall result with a score, cited checklist rows, questions to ask, Tender Map, Briefing Deck, and exports.",
    chips: ["What are the biggest risks?", "Which documents are missing?", "What evidence supports this?", "Summarize in Arabic."],
  };
}

function renderGuide() {
  const copy = guideCopy();
  $("#guidePage").innerHTML = `
    <div class="guide-shell">
      <a class="guide-back" href="#workspace">
        <span class="icon" data-icon="book-open" aria-hidden="true"></span>
        ${escapeText(copy.back)}
      </a>
      <section class="guide-hero">
        <div class="guide-hero-main">
          <span class="soft-badge">${escapeText(copy.badge)}</span>
          <h1 id="guideTitle">${escapeText(copy.title)}</h1>
          <p>${escapeText(copy.body)}</p>
          <div class="guide-actions">
            <a class="primary-action compact" href="#workspace">${escapeText(copy.open)}</a>
            <a class="secondary-action compact" href="#examples">${escapeText(copy.examples)}</a>
          </div>
        </div>
        <aside class="guide-side">
          ${copy.cards
            .map(
              (card) => `
                <article>
                  <span class="title-icon ${card.tone}" data-icon="${card.icon}" aria-hidden="true"></span>
                  <h2>${escapeText(card.title)}</h2>
                  <p>${escapeText(card.body)}</p>
                </article>
              `,
            )
            .join("")}
        </aside>
      </section>
      <section class="guide-steps" aria-label="${escapeText(copy.stepsLabel)}">
        ${copy.steps
          .map(
            ([title, body], index) => `
              <article>
                <strong>${index + 1}</strong>
                <h2>${escapeText(title)}</h2>
                <p>${escapeText(body)}</p>
              </article>
            `,
          )
          .join("")}
      </section>
      <section class="guide-preview">
        <div>
          <span class="soft-badge">${escapeText(copy.previewBadge)}</span>
          <h2>${escapeText(copy.previewTitle)}</h2>
          <p>${escapeText(copy.previewBody)}</p>
        </div>
        <div class="guide-score"><strong>78</strong><span>${escapeText(copy.score)}</span></div>
      </section>
      <section class="guide-grid" id="examples">
        <article>
          <h2>${escapeText(copy.examplesTitle)}</h2>
          <p>${escapeText(copy.examplesBody)}</p>
          <a href="./example-files/jeddah-fleet-maintenance-rfp.pdf" download>Jeddah Fleet Maintenance RFP · PDF</a>
          <a href="./example-files/bid-readiness-notes.docx" download>Bid readiness notes · DOCX</a>
          <a href="./example-files/commercial-clarification-addendum.pdf" download>Commercial clarification addendum · PDF</a>
        </article>
        <article>
          <h2>${escapeText(copy.expectedTitle)}</h2>
          <p>${escapeText(copy.expectedBody)}</p>
          <div class="guide-chips">
            ${copy.chips.map((chip) => `<span>${escapeText(chip)}</span>`).join("")}
          </div>
        </article>
      </section>
    </div>
  `;
  hydrateIcons($("#guidePage"));
}

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

const AR_ANALYSIS_TRANSLATIONS = new Map([
  [
    "TenderLens recommends a conditional bid. The tender fits our language support, hosted operations, data residency, support, API, and sustainability capabilities, but the bid team must close security-evidence, bid-bond validity, go-live, and training-capacity gaps before submission.",
    "يوصي TenderLens بتقديم مشروط. تتوافق المناقصة مع قدرات اللغة والتشغيل المستضاف وإقامة البيانات والدعم وواجهات API والاستدامة، لكن يجب إغلاق فجوات أدلة الأمن وصلاحية خطاب الضمان وموعد التشغيل والطاقة التدريبية قبل التقديم.",
  ],
  ["Commercial", "تجاري"],
  ["Functional", "وظيفي"],
  ["SLA", "مستوى الخدمة"],
  ["Security", "أمن المعلومات"],
  ["Delivery", "التنفيذ"],
  ["Data Residency", "إقامة البيانات"],
  ["Support", "الدعم"],
  ["Integration", "التكامل"],
  ["Training", "التدريب"],
  ["Reporting", "التقارير"],
  ["Bid security must equal 2% of contract value and remain valid for at least 120 days.", "يجب أن يساوي ضمان العطاء 2% من قيمة العقد وأن يبقى صالحا لمدة لا تقل عن 120 يوما."],
  ["The finance note confirms a 2% bid bond, but the current bank letter template is valid for 90 days unless extended.", "تؤكد المذكرة المالية وجود ضمان بنسبة 2%، لكن نموذج خطاب البنك الحالي صالح لمدة 90 يوما ما لم يتم تمديده."],
  ["Portal, resident notifications, and enforcement interface must support Arabic and English.", "يجب أن تدعم البوابة وإشعارات السكان وواجهة الإنفاذ اللغتين العربية والإنجليزية."],
  ["The implementation team has bilingual product, support, and notification coverage for the required workflows.", "يمتلك فريق التنفيذ تغطية ثنائية اللغة للمنتج والدعم والإشعارات الخاصة بسير العمل المطلوب."],
  ["Hosted production service must meet 99.5% monthly uptime with 72-hour maintenance notice.", "يجب أن تحقق الخدمة المستضافة توافرا شهريا بنسبة 99.5% مع إشعار صيانة قبل 72 ساعة."],
  ["The operations playbook and addendum commit to the required uptime and maintenance notice window.", "يلتزم دليل التشغيل والملحق بنسبة التوافر المطلوبة ونافذة إشعار الصيانة."],
  ["Supplier must provide ISO 27001, SOC 2 Type II, or equivalent independent security audit evidence.", "يجب على المورد تقديم ISO 27001 أو SOC 2 Type II أو دليل تدقيق أمني مستقل مكافئ."],
  ["The security pack includes a recent independent penetration test, but ISO 27001 certification is not yet issued.", "تتضمن حزمة الأمن اختبار اختراق مستقلا حديثا، لكن شهادة ISO 27001 لم تصدر بعد."],
  ["Production go-live for the five pilot districts must be completed by 30 September 2026.", "يجب إكمال التشغيل الفعلي للمناطق التجريبية الخمس بحلول 30 سبتمبر 2026."],
  ["The bid team's current delivery plan reaches full production on 15 October 2026, after the mandatory deadline.", "تصل خطة التنفيذ الحالية للفريق إلى التشغيل الكامل في 15 أكتوبر 2026، أي بعد الموعد الإلزامي."],
  ["Resident personal data and plate metadata must be stored in Saudi Arabia.", "يجب تخزين بيانات السكان وبيانات اللوحات داخل المملكة العربية السعودية."],
  ["The architecture note keeps primary data and backups inside Saudi Arabia.", "توضح مذكرة البنية أن البيانات الأساسية والنسخ الاحتياطية تبقى داخل المملكة العربية السعودية."],
  ["Critical incidents need human response within 30 minutes and standard tickets within 4 business hours.", "تحتاج الحوادث الحرجة إلى استجابة بشرية خلال 30 دقيقة والتذاكر العادية خلال 4 ساعات عمل."],
  ["The support plan meets both incident and standard ticket response targets.", "تلبي خطة الدعم أهداف الاستجابة للحوادث والتذاكر العادية."],
  ["Platform must integrate with the municipal payment gateway and expose REST APIs.", "يجب أن تتكامل المنصة مع بوابة الدفع البلدية وأن توفر واجهات REST API."],
  ["The product roadmap includes payment gateway integration and REST APIs for occupancy, permits, violations, and payments.", "تشمل خارطة طريق المنتج التكامل مع بوابة الدفع وواجهات REST API للإشغال والتصاريح والمخالفات والمدفوعات."],
  ["Supplier must deliver role-based training for at least 50 municipal staff before go-live.", "يجب على المورد تقديم تدريب حسب الدور لما لا يقل عن 50 موظفا بلديا قبل التشغيل."],
  ["The training plan currently covers 40 staff. Ten additional remote seats are possible but need written confirmation.", "تغطي خطة التدريب الحالية 40 موظفا. يمكن إضافة عشرة مقاعد عن بعد لكن ذلك يحتاج إلى تأكيد كتابي."],
  ["Supplier must provide quarterly sustainability reporting.", "يجب على المورد تقديم تقارير استدامة ربع سنوية."],
  ["The bid can include quarterly sustainability reports covering hosting and maintenance travel impact.", "يمكن أن يتضمن العرض تقارير استدامة ربع سنوية تغطي أثر الاستضافة والتنقل للصيانة."],
  ["Validated example files", "تم التحقق من ملفات المثال"],
  ["Found mandatory tender requirements", "تم تحديد متطلبات المناقصة الإلزامية"],
  ["Matched bid-readiness evidence", "تمت مطابقة أدلة جاهزية العطاء"],
  ["Ran independent evidence check", "تم تشغيل فحص أدلة مستقل"],
  ["Calibrated bid risk", "تمت معايرة مخاطر التقديم"],
  ["The current go-live plan misses the mandatory deadline.", "خطة التشغيل الحالية تتجاوز الموعد الإلزامي."],
  ["The bid bond validity is shorter than required.", "صلاحية خطاب الضمان أقصر من المطلوب."],
  ["Security certification evidence is not final.", "أدلة الشهادة الأمنية ليست نهائية."],
  ["Training capacity is below the stated minimum unless the extra seats are confirmed.", "الطاقة التدريبية أقل من الحد الأدنى المعلن ما لم يتم تأكيد المقاعد الإضافية."],
  ["120-day bid bond letter", "خطاب ضمان عطاء لمدة 120 يوما"],
  ["ISO 27001 certificate or independent security evidence", "شهادة ISO 27001 أو دليل أمني مستقل"],
  ["Written confirmation for 50 training seats", "تأكيد كتابي لـ 50 مقعدا تدريبيا"],
  ["Revised go-live plan for 30 September 2026", "خطة تشغيل معدلة بتاريخ 30 سبتمبر 2026"],
  ["Revise the delivery plan to meet 30 September 2026 before deciding to bid.", "راجع خطة التنفيذ للالتزام بتاريخ 30 سبتمبر 2026 قبل قرار التقديم."],
  ["Obtain a 120-day bid bond letter from the bank.", "احصل على خطاب ضمان عطاء لمدة 120 يوما من البنك."],
  ["Attach independent security evidence and explain the ISO 27001 timeline.", "أرفق دليلا أمنيا مستقلا واشرح الجدول الزمني لشهادة ISO 27001."],
  ["Confirm 50 training seats before submission.", "أكد توفر 50 مقعدا تدريبيا قبل التقديم."],
]);

function displayAnalysisText(value) {
  const raw = String(value || "");
  return state.language === "ar" ? AR_ANALYSIS_TRANSLATIONS.get(raw) || raw : raw;
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
  if (state.analysisSource === "sample") {
    $("#uploadStatus").textContent = copy.exampleStatus;
  } else if (state.analysisError === "model") {
    $("#uploadStatus").textContent = copy.backendUnavailable;
  }
  $("#muteVoice").textContent = copy.voiceMute;
  $("#interruptVoice").textContent = copy.voiceListenAgain;
  $("#endVoice").textContent = copy.voiceEnd;
  const alertNode = $("#modelStatusAlert");
  if (alertNode && !alertNode.classList.contains("hidden")) {
    const textNode = alertNode.querySelector(".alert-text");
    if (textNode) textNode.textContent = copy.discussUnavailable;
  }
  renderGuide();
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
  $("#executiveBrief").textContent = displayAnalysisText(result.executiveBrief);
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
            <strong>${escapeText(displayAnalysisText(row.requirement))}</strong>
            <small>${escapeText(displayAnalysisText(row.category))}</small>
          </span>
          <span class="status-pill ${statusClass(row.status)}">${escapeText(copy.statusLabel[row.status])}</span>
          <span class="risk-${row.risk.toLowerCase()}">${escapeText(copy.riskLabel[row.risk])}</span>
          <span class="row-response">${escapeText(displayAnalysisText(row.response))}</span>
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
          <blockquote>${escapeText(citation.quote || displayAnalysisText(row.response))}</blockquote>
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
  $("#attentionList").innerHTML = risks.map((risk) => `<li>${escapeText(displayAnalysisText(risk))}</li>`).join("");
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
    .map((step, index) => `<li><span>${index + 1}</span>${escapeText(displayAnalysisText(step))}</li>`)
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
  const rows = result.matrix.slice(0, Math.max(6, files.length));
  return {
    files,
    rows: rows.map((row, index) => {
      const fileIndex = files.length && index < files.length ? index : sourceFileIndexForRow(row, files, index);
      return {
        ...row,
        id: `requirement-${index}-${slug(row.requirement)}`,
        evidence: row.citations[0]?.quote || row.response,
        file: files[fileIndex] || sourceFileForRow(row, files, index),
        fileIndex,
      };
    }),
  };
}

function sourceFileIndexForRow(row, files, index) {
  if (!files.length) return 0;
  const citation = String(row.citations?.[0]?.file || "").toLowerCase();
  if (!citation) return index % files.length;
  const matchIndex = files.findIndex((file) => {
    const lower = file.toLowerCase();
    const short = shortFileName(file).toLowerCase().replace(/\s+/g, "-");
    return lower.includes(citation) || citation.includes(short);
  });
  return matchIndex >= 0 ? matchIndex : index % files.length;
}

function sourceFileForRow(row, files, index) {
  if (!files.length) return row.citations?.[0]?.file || "Uploaded document";
  return files[sourceFileIndexForRow(row, files, index)] || files[0];
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
  const rowHeight = 136;
  const height = Math.max(690, 132 + Math.max(rows.length, map.files.length) * rowHeight);
  const headers = text().mapHeaders;
  const fileRows = map.files.map((file, index) => ({ label: shortFileName(file), y: 140 + index * rowHeight }));
  const pathColor = "#aeb8b5";

  const fileCards = fileRows
    .map(
      (file, index) => {
        const isAr = state.language === "ar";
        const fileHasAr = /[\u0600-\u06FF]/.test(file.label);
        const fileX = isAr ? (fileHasAr ? 246 : 58) : 54;
        const fileCircleCx = isAr ? 46 : 226;
        return `
          <g data-card="file-${index}">
          <rect x="36" y="${file.y}" width="230" height="84" rx="14" fill="#fffdf8" stroke="#d7dfda" stroke-width="1.5"/>
          ${svgTextLines(file.label, fileX, file.y + 30, 184, 3)}
          <circle cx="${fileCircleCx}" cy="${file.y + 18}" r="5" fill="#4968d9"/>
          </g>
        `;
      }
    )
    .join("");

  const fileConnectors = rows
    .map((row, index) => {
      const source = fileRows[row.fileIndex] || fileRows[index % Math.max(1, fileRows.length)];
      if (!source) return "";
      const sourceY = source.y + 42;
      const targetY = 140 + index * rowHeight + 42;
      return `<path d="M266 ${sourceY} C 304 ${sourceY}, 300 ${targetY}, 338 ${targetY}" fill="none" stroke="${pathColor}" stroke-width="1.5"/>`;
    })
    .join("");

  const rowCards = rows
    .map((row, index) => {
      const y = 140 + index * rowHeight;
      const risk = colorForRisk(row.risk);
      const riskLabel = `${text().riskLabel[row.risk]}${state.language === "ar" ? "" : " risk"}`;
      const requirement = displayAnalysisText(row.requirement);
      const evidence = state.language === "ar" ? `دليل المصدر: ${row.evidence}` : row.evidence;

      const isAr = state.language === "ar";
      
      const reqHasAr = /[\u0600-\u06FF]/.test(requirement);
      const reqX = isAr ? (reqHasAr ? 570 : 362) : 358;
      const reqCircleCx = isAr ? 350 : 558;

      const evHasAr = /[\u0600-\u06FF]/.test(evidence);
      const evX = isAr ? (evHasAr ? 910 : 682) : 678;
      const evCircleCx = isAr ? 670 : 888;

      const riskHasAr = /[\u0600-\u06FF]/.test(riskLabel);
      const riskX = isAr ? (riskHasAr ? 1200 : 1012) : 1008;
      const riskCircleCx = isAr ? 1000 : 1198;

      return `
        <g data-card="requirement-${index}" data-source-file="${escapeText(row.file)}">
        <rect x="340" y="${y}" width="250" height="92" rx="14" fill="#fff8e9" stroke="#e5c884" stroke-width="1.5"/>
        ${svgTextLines(requirement, reqX, y + 28, 198, 3)}
        <circle cx="${reqCircleCx}" cy="${y + 18}" r="5" fill="#bd750f"/>
        <path d="M580 ${y + 36} L 655 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        </g>
        <g data-card="evidence-${index}" data-source-file="${escapeText(row.file)}">
        <rect x="660" y="${y}" width="270" height="92" rx="14" fill="#effaf6" stroke="#91d4c6" stroke-width="1.5"/>
        ${svgTextLines(evidence, evX, y + 28, 216, 3)}
        <circle cx="${evCircleCx}" cy="${y + 18}" r="5" fill="#3f8e73"/>
        <path d="M910 ${y + 36} L 985 ${y + 36}" stroke="${pathColor}" stroke-width="1.5" marker-end="url(#arrow)"/>
        </g>
        <g data-card="risk-${index}" data-source-file="${escapeText(row.file)}">
        <rect x="990" y="${y}" width="230" height="92" rx="14" fill="${risk.fill}" stroke="${risk.stroke}" stroke-width="1.5"/>
        ${svgTextLines(riskLabel, riskX, y + 40, 172, 2)}
        <circle cx="${riskCircleCx}" cy="${y + 18}" r="5" fill="${risk.dot}"/>
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
      <text x="${state.language === "ar" ? 1224 : 36}" y="46" font-size="28" font-weight="760" fill="#101214" text-anchor="start" direction="${state.language === "ar" ? "rtl" : "ltr"}">${escapeText(text().mapSvgTitle)}</text>
      <text x="${state.language === "ar" ? 266 : 36}" y="86" font-size="14" font-weight="700" fill="#5a646d" text-anchor="start" direction="${state.language === "ar" ? "rtl" : "ltr"}">${escapeText(headers[0])}</text>
      <text x="${state.language === "ar" ? 590 : 340}" y="86" font-size="14" font-weight="700" fill="#5a646d" text-anchor="start" direction="${state.language === "ar" ? "rtl" : "ltr"}">${escapeText(headers[1])}</text>
      <text x="${state.language === "ar" ? 930 : 660}" y="86" font-size="14" font-weight="700" fill="#5a646d" text-anchor="start" direction="${state.language === "ar" ? "rtl" : "ltr"}">${escapeText(headers[2])}</text>
      <text x="${state.language === "ar" ? 1220 : 990}" y="86" font-size="14" font-weight="700" fill="#5a646d" text-anchor="start" direction="${state.language === "ar" ? "rtl" : "ltr"}">${escapeText(headers[3])}</text>
      ${fileCards}
      ${fileConnectors}
      ${rowCards}
    </svg>
  `;
}

function buildBriefingDeck(result) {
  const compliant = result.matrix.filter((row) => row.status === "Compliant").slice(0, 3);
  const risky = result.matrix.filter((row) => row.risk !== "Low" || row.status !== "Compliant").slice(0, 4);
  const evidence = result.matrix.flatMap((row) => row.citations.slice(0, 1).map((citation) => `${firstWords(displayAnalysisText(row.requirement), 8)}: ${citation.quote}`));
  if (state.language === "ar") {
    return [
      { eyebrow: "لمحة", title: "النتيجة العامة", bullets: [`${text().score}: ${result.score}/100`, displayAnalysisText(result.executiveBrief)] },
      { eyebrow: "نقاط قوة", title: "أهم البنود الممتثلة", bullets: compliant.length ? compliant.map((row) => displayAnalysisText(row.requirement)) : ["لا توجد بنود ممتثلة بالكامل بعد."] },
      { eyebrow: "انتباه", title: "أكبر المخاطر", bullets: risky.length ? risky.map((row) => `${text().riskLabel[row.risk]}: ${displayAnalysisText(row.requirement)}`) : ["لا توجد مخاطر رئيسية مدرجة."] },
      { eyebrow: "أدلة", title: "أبرز الأدلة", bullets: evidence.length ? evidence.slice(0, 4) : ["لا توجد أدلة متاحة."] },
      { eyebrow: "إجراء", title: "الخطوات التالية", bullets: result.nextActions.length ? result.nextActions.slice(0, 5).map(displayAnalysisText) : ["راجع المتطلبات مع فريق المشروع."] },
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
          ? `يرجى توضيح كيفية تلبية هذا المتطلب: ${displayAnalysisText(row.requirement)}`
          : `Can you clarify how you will satisfy this requirement: ${row.requirement.charAt(0).toLowerCase()}${row.requirement.slice(1)}`,
      why:
        state.language === "ar"
          ? `${text().statusLabel[row.status]} بمستوى مخاطر ${text().riskLabel[row.risk]}. ${displayAnalysisText(row.response)}`
          : `${row.status} item with ${row.risk.toLowerCase()} risk. ${row.response}`,
    }));
  const actionQuestions = result.nextActions.slice(0, 4).map((action, index) => ({
    question:
      state.language === "ar"
        ? `ما المطلوب لتنفيذ هذا الإجراء: ${displayAnalysisText(action)}?`
        : action.endsWith("?")
          ? action
          : `${action}?`,
    why:
      state.language === "ar"
        ? displayAnalysisText(result.risks[index]) || "هذا الإجراء موصى به من TenderLens Agentic AI."
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
  if (tab === "ask") {
    void checkModelStatus();
  }
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
  const approxChars = Math.max(8, Math.floor(width / 7.6));
  const words = String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => {
      if (word.length <= approxChars) return [word];
      const chunks = [];
      for (let index = 0; index < word.length; index += approxChars) {
        chunks.push(word.slice(index, index + approxChars));
      }
      return chunks;
    });
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
  
  const hasArabic = /[\u0600-\u06FF]/.test(String(value || ""));
  const isArText = state.language === "ar" && hasArabic;
  const anchor = options.anchor || "start";
  const direction = options.direction || (isArText ? "rtl" : "ltr");
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
    const fallback = friendlyModelRetryMessage(error);
    thinking.className = "message agent warning";
    thinking.textContent = fallback;
    state.chatHistory.push({ role: "agent", content: fallback });
    showModelStatusAlert(true);
    return fallback;
  } finally {
    setDiscussing(false);
  }
}

function friendlyModelRetryMessage(error) {
  const message = String(error?.message || "");
  if (message.toLowerCase().includes("please try again after some time")) return message;
  return text().discussUnavailable;
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
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        detail = typeof body.detail === "string" ? body.detail : body.detail?.message || body.message || detail;
      } catch {
        // Keep HTTP status as detail.
      }
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function getJson(path, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(requestUrl(path), {
      method: "GET",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function checkModelStatus() {
  try {
    const status = await getJson("/api/model-status", 5000);
    const connected = status?.discuss?.connected;
    showModelStatusAlert(!connected);
  } catch (error) {
    console.warn("Failed to check model status:", error);
    showModelStatusAlert(true);
  }
}

function showModelStatusAlert(show) {
  const alertNode = $("#modelStatusAlert");
  if (!alertNode) return;
  alertNode.classList.toggle("hidden", !show);
  const textNode = alertNode.querySelector(".alert-text");
  if (textNode) {
    textNode.textContent = text().discussUnavailable;
  }
  hydrateIcons(alertNode);
}

function configuredBackendUrl() {
  return String(window.TENDERLENS_CONFIG?.backendUrl || "").replace(/\/+$/, "");
}

function requestUrl(path, options = {}) {
  const backendUrl = configuredBackendUrl();
  return options.preferBackend && backendUrl ? `${backendUrl}${path}` : path;
}

async function postJson(path, data, timeoutMs = 60000, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(requestUrl(path, options), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        detail = typeof body.detail === "string" ? body.detail : body.detail?.message || body.message || detail;
      } catch {
        // Ignore
      }
      throw new Error(detail);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
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
        detail = typeof body.detail === "string" ? body.detail : body.detail?.message || body.message || detail;
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
    state.reportEn = result.report;
    state.reportAr = result.report_ar || result.report;
    state.currentReport = state.language === "ar" ? state.reportAr : state.reportEn;
    state.currentResult = reportToComplianceResult(state.currentReport);
    state.analysisSource = "uploaded";
    state.analysisError = null;
    $("#uploadStatus").textContent = text().uploadAccepted(state.uploadedFiles.length);
  } catch (error) {
    state.currentResult = null;
    state.currentReport = null;
    state.analysisError = "model";
    $("#uploadStatus").textContent = friendlyAnalysisRetryMessage(error);
    $("#uploadStatus").classList.add("error");
    renderEmptyWorkspace();
    return;
  } finally {
    setAnalyzing(false);
  }
  state.activeRow = 0;
  state.activeSlide = 0;
  renderResult();
}

function friendlyAnalysisRetryMessage(error) {
  const message = String(error?.message || "");
  if (message.toLowerCase().includes("please try again after some time")) return message;
  return text().backendUnavailable;
}

function useExampleFiles() {
  state.currentResult = normalizeResult(structuredClone(exampleResult));
  state.currentReport = resultToReport(state.currentResult);
  state.analysisSource = "sample";
  state.analysisError = null;
  state.uploadedFiles = [];
  state.activeRow = 0;
  state.activeSlide = 0;
  $("#fileInput").value = "";
  $("#uploadStatus").classList.remove("error");
  $("#uploadStatus").textContent = text().exampleStatus;
  renderResult();
}

function selectFiles(files) {
  state.uploadedFiles = Array.from(files).slice(0, MAX_UPLOAD_FILES);
  state.analysisError = null;
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
  state.analysisError = null;
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
    window.localStorage.setItem(WELCOME_STORAGE_KEY, "yes");
  }
}

function showWelcomeIfNeeded() {
  if (window.localStorage.getItem(WELCOME_STORAGE_KEY) !== "yes") {
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
    displayAnalysisText(result.executiveBrief),
    "",
    text().checklist,
    ...result.matrix.map(
      (row, index) =>
        `${index + 1}. [${text().statusLabel[row.status]} / ${text().riskLabel[row.risk]}] ${displayAnalysisText(row.requirement)} - ${displayAnalysisText(row.response)}`,
    ),
    "",
    state.language === "ar" ? "الخطوات التالية" : "Next actions",
    ...result.nextActions.map((action, index) => `${index + 1}. ${displayAnalysisText(action)}`),
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
  const rect = pptx.ShapeType?.rect || "rect";
  const slideW = 13.333;
  const slideH = 7.5;
  deck.forEach((item, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0B302F" };
    slide.addShape(rect, { x: 0, y: 0, w: slideW, h: slideH, fill: { color: "0B302F" }, line: { color: "0B302F" } });
    slide.addShape(rect, { x: 0.52, y: 0.46, w: 12.28, h: 6.55, fill: { color: "F8F2E6" }, line: { color: "E3D8C5", transparency: 20 } });
    slide.addShape(rect, { x: state.language === "ar" ? 11.98 : 0.52, y: 0.46, w: 0.18, h: 6.55, fill: { color: "0F8B83" }, line: { color: "0F8B83" } });
    slide.addShape(rect, { x: state.language === "ar" ? 0.8 : 11.2, y: 0.75, w: 1.2, h: 0.42, fill: { color: "0B302F" }, line: { color: "0B302F" } });
    slide.addText(`${index + 1}/${deck.length}`, {
      x: state.language === "ar" ? 0.8 : 11.2,
      y: 0.84,
      w: 1.2,
      h: 0.2,
      fontFace: "Arial",
      fontSize: 10,
      bold: true,
      color: "F8F2E6",
      align: "center",
    });
    slide.addText(item.eyebrow.toUpperCase(), {
      x: 0.92,
      y: 0.78,
      w: 4.2,
      h: 0.3,
      fontFace: "Arial",
      fontSize: 11,
      bold: true,
      color: "0F8B83",
      align: state.language === "ar" ? "right" : "left",
    });
    slide.addText(item.title, {
      x: 0.92,
      y: 1.2,
      w: 10.7,
      h: 0.75,
      fontFace: "Arial",
      fontSize: 30,
      bold: true,
      color: "101214",
      fit: "shrink",
      align: state.language === "ar" ? "right" : "left",
    });
    slide.addShape(rect, { x: 0.92, y: 2.2, w: 10.95, h: 3.85, fill: { color: "FFFFFF", transparency: 5 }, line: { color: "E5DED1" } });
    slide.addText(item.bullets.slice(0, 5).map((bullet) => ({ text: String(bullet), options: { bullet: { type: "ul" } } })), {
      x: 1.15,
      y: 2.48,
      w: 10.35,
      h: 3.32,
      fontFace: "Arial",
      fontSize: 15,
      color: "30363D",
      breakLine: false,
      fit: "shrink",
      align: state.language === "ar" ? "right" : "left",
    });
    slide.addText("TENDERLENS AGENTIC AI", {
      x: state.language === "ar" ? 0.92 : 9.15,
      y: 6.55,
      w: 2.8,
      h: 0.25,
      fontFace: "Arial",
      fontSize: 9,
      bold: true,
      color: "0F8B83",
      align: state.language === "ar" ? "left" : "right",
    });
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

async function startVoice(isNextTurn = false) {
  const nextTurn = isNextTurn === true;
  $("#voiceOverlay").classList.remove("hidden");
  if (!nextTurn) {
    $("#transcript").textContent = "";
    window.speechSynthesis?.cancel?.();
  }
  if (state.recognition) {
    state.recognition.onend = null;
    state.recognition.abort?.();
    state.recognition = null;
  }
  if (!state.currentResult) {
    $("#voiceStateLabel").textContent = state.language === "ar" ? "التحليل مطلوب" : "Analysis needed";
    $("#voiceHelp").textContent = text().voiceNeedsAnalysis;
    $("#transcript").textContent = text().chatNeedsAnalysis;
    return;
  }
  const Recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  if (!Recognition) {
    $("#voiceStateLabel").textContent = text().voiceUnsupported;
    $("#voiceHelp").textContent = text().voiceUnsupportedBody;
    $("#transcript").textContent = text().voiceUnsupportedBody;
    return;
  }
  $("#voiceStateLabel").textContent = text().voiceReady;
  $("#voiceHelp").textContent = text().voiceReadyBody;
  if (!nextTurn) {
    $("#transcript").textContent =
      state.language === "ar"
        ? `جاهز للمناقشة: ${displayAnalysisText(state.currentResult.executiveBrief)}`
        : `Ready to discuss: ${displayAnalysisText(state.currentResult.executiveBrief)}`;
  }
  try {
    const recognition = new Recognition();
    state.recognition = recognition;
    let handlingResult = false;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = state.language === "ar" ? "ar-SA" : "en-US";
    recognition.onstart = () => {
      $("#voiceStateLabel").textContent = text().voiceListening;
      if (nextTurn) {
        $("#voiceHelp").textContent = state.language === "ar" ? "جاري الاستماع للرد..." : "Listening for your response...";
      } else {
        $("#voiceHelp").textContent = text().voiceListeningBody;
      }
    };
    recognition.onerror = () => {
      $("#voiceStateLabel").textContent = text().voiceError;
      $("#voiceHelp").textContent = text().voiceErrorBody;
      state.recognition = null;
    };
    recognition.onresult = async (event) => {
      handlingResult = true;
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
          $("#voiceHelp").textContent = text().voiceReadyBody;
          if (!$("#voiceOverlay").classList.contains("hidden")) {
            void startVoice(true);
          }
        };
        window.speechSynthesis.speak(utterance);
      } else {
        $("#voiceStateLabel").textContent = text().voiceReady;
        if (!$("#voiceOverlay").classList.contains("hidden")) {
          setTimeout(() => {
            if (!$("#voiceOverlay").classList.contains("hidden")) {
              void startVoice(true);
            }
          }, 1000);
        }
      }
      state.recognition = null;
      handlingResult = false;
    };
    recognition.onend = () => {
      if (state.recognition === recognition) state.recognition = null;
      if (!handlingResult && $("#voiceOverlay").classList.contains("hidden") === false) {
        // Silence timeout: automatically restart listening after a brief pause to keep microphone active
        setTimeout(() => {
          if (!$("#voiceOverlay").classList.contains("hidden") && !state.recognition) {
            void startVoice(true);
          }
        }, 300);
      }
    };
    recognition.start();
  } catch {
    $("#voiceStateLabel").textContent = text().voiceError;
    $("#voiceHelp").textContent = text().voiceErrorBody;
    state.recognition = null;
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

async function updateLanguageForCurrentResult() {
  updateI18n();
  if (state.currentResult && state.analysisSource === "uploaded") {
    if (state.reportEn && state.reportAr) {
      state.currentReport = state.language === "ar" ? state.reportAr : state.reportEn;
      state.currentResult = reportToComplianceResult(state.currentReport);
      renderResult();
    } else {
      try {
        const copy = text();
        $("#uploadStatus").textContent = state.language === "ar" ? "جاري ترجمة التقرير..." : "Translating report...";
        $("#uploadStatus").classList.remove("error");
        const payload = {
          report: state.currentReport || resultToReport(state.currentResult),
          target_language: state.language
        };
        const response = await postJson("/api/translate-report", payload, 60000, { preferBackend: true });
        if (response && response.report) {
          state.currentResult = reportToComplianceResult(response.report);
          state.currentReport = response.report;
          renderResult();
        }
        $("#uploadStatus").textContent = text().uploadAccepted(state.uploadedFiles.length || 3);
      } catch (err) {
        console.error("Failed to translate report", err);
        $("#uploadStatus").textContent = text().uploadAccepted(state.uploadedFiles.length || 3);
      }
    }
  }
}

function bindEvents() {
  $("#langEn").addEventListener("click", () => {
    state.language = "en";
    void updateLanguageForCurrentResult();
  });
  $("#langAr").addEventListener("click", () => {
    state.language = "ar";
    void updateLanguageForCurrentResult();
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
    window.speechSynthesis?.cancel?.();
    $("#voiceStateLabel").textContent = text().voiceMuted;
  });
  $("#interruptVoice").addEventListener("click", () => {
    $("#voiceStateLabel").textContent = text().voiceInterrupted;
    void startVoice();
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
  void checkModelStatus();
}

init();
