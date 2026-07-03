const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const supportedExt = [".pdf", ".txt", ".md", ".docx"];

const state = {
  language: "en",
  voiceStream: null,
  voiceMuted: false,
  activeFilter: "all",
  analysisSource: "static",
  hasUploadedTenderFiles: false,
  activeSlide: 0,
  report: null,
};

const t = {
  en: {
    track: "Agents for Business",
    navHowTo: "How to Use",
    navAnalysis: "Analysis",
    navDiscuss: "Discuss with TenderLens",
    navMap: "Tender Map",
    navDeck: "Briefing Deck",
    navQuestions: "Tender Questions",
    voiceMode: "Talk to TenderLens",
    tenderIntake: "Tender Files",
    sampleTender: "Preloaded Example Files",
    chooseTender: "Choose preloaded files",
    usePreloaded: "Use Preloaded Example Files",
    preloadedNote: "Preloaded example files use pre-generated example results so you can explore TenderLens quickly and conserve API calls. Your uploaded Tender Files are analyzed when you run them.",
    runAnalysis: "Run analysis",
    secureUpload: "Upload Tender Files",
    uploadRule: "Main Tender File is required. Add optional Supporting Files. TXT, MD, and DOCX can be analyzed now. PDF text reading will be added after parser support is stable. Max 5 files, 5 MB each, 12 MB total.",
    mainTenderFile: "Main Tender File",
    supportingFiles: "Supporting Files",
    bidderProfile: "Bidder Profile",
    typingMode: "Discuss",
    askAgent: "Discuss with TenderLens",
    recommendation: "Recommendation",
    agentSystem: "Analysis",
    summaryTitle: "Bid-ready, with one delivery watch item",
    summaryText: "The bidder profile meets the core eligibility requirements. Confirm specialized HVAC partner capacity before final approval.",
    a2aAudit: "Evidence Checked",
    auditPass: "Passed",
    auditText: "7 claims checked, 0 unsupported",
    evidenceWarRoom: "Proof Behind This Recommendation",
    inspectClaims: "Inspect the evidence",
    all: "All",
    eligibility: "Eligibility",
    risk: "Risk",
    deadline: "Deadline",
    okfGraph: "Tender Map",
    linkedTenderKnowledge: "How the tender fits together",
    sourceFiles: "Source Files",
    sampleSource: "Preloaded Example Files",
    mainSource: "Main Tender File",
    supportingSource: "Supporting File",
    compliance: "Compliance",
    gapChecklist: "Gap checklist",
    riskHeatmap: "Risk Heatmap",
    deliveryRisk: "Delivery risk",
    strategySimulator: "Strategy Simulator",
    scenarioTradeoffs: "Scenario tradeoffs",
    teamCapacity: "Team capacity",
    margin: "Estimated margin",
    partnerAvailable: "Partner available",
    clarifications: "Tender Questions",
    askIssuer: "Ask the Issuer",
    prepareToAnswer: "Prepare to Answer",
    briefingDeck: "Briefing Deck",
    deckTitle: "Boardroom-ready slides",
    howToEyebrow: "How to Use",
    howToTitle: "Start with files, then follow the evidence",
    preparedBadge: "Pre-generated example result",
    guideFilesTitle: "Use preloaded files or upload yours",
    guideFilesText: "Preloaded example files use pre-generated example results so you can explore TenderLens quickly and conserve API calls. Your uploaded Tender Files are analyzed when you run them.",
    guideAnalysisTitle: "Review Analysis",
    guideAnalysisText: "See the bid/no-bid recommendation, confidence, gaps, risks, and next actions in one decision view.",
    guideDiscussTitle: "Discuss with TenderLens",
    guideDiscussText: "Ask by typing or talking. Try: Can we bid? What are the top risks? What should we ask the issuer?",
    guideMapTitle: "Explore Tender Map",
    guideMapText: "Tender Map connects requirements, evidence, deadlines, risks, gaps, and actions so the recommendation is easy to inspect.",
    guideQuestionsTitle: "Use Tender Questions",
    guideQuestionsText: "Ask the Issuer lists clarification questions. Prepare to Answer shows what evaluators may ask you after reading your bid.",
    guideDeckTitle: "Create the Briefing Deck",
    guideDeckText: "Use the slide carousel for an internal bid decision meeting: decision, fit, gaps, risks, proof, questions, and action plan.",
    whatYouGet: "What you will get",
    exampleDecision: "Decision: Bid with one watch item",
    exampleText: "Confidence 90%. Top gap: confirm HVAC subcontractor capacity. Evidence: source section 2.1 requires ISO certifications and two similar smart facilities projects.",
    miniMap: "Tender Map: Eligibility -> Proof -> Gaps",
    miniQuestions: "Tender Questions: Ask the Issuer + Prepare to Answer",
    miniDeck: "Briefing Deck: 8 boardroom-ready slides",
    analysisBanner: "You are viewing pre-generated example results for the preloaded files. Upload your own Tender Files to run a new analysis.",
    uploadedAnalysisBanner: "Your uploaded Tender Files were analyzed for this session. TenderLens does not save your files.",
    uploadedBadge: "Uploaded Tender Files",
    welcomeEyebrow: "Welcome to TenderLens",
    welcomeTitle: "Make the bid decision with proof",
    welcomeText: "Start with preloaded example files, upload your Tender Files, or open How to Use for a quick walkthrough. Voice starts only when you choose Talk to TenderLens.",
    uploadMine: "Upload my Tender Files",
    openHowTo: "Open How to Use",
    dontShow: "Don't show again",
    voiceSession: "Voice Session",
    voiceIdle: "Idle",
    voiceHelp: "Voice starts only after you choose Talk to TenderLens.",
    mute: "Mute",
    interrupt: "Interrupt",
    endVoice: "End",
    profilePlaceholder: "Confirm HVAC subcontractor capacity before final bid gate.",
    chatPlaceholder: "Ask about risks, evidence, or strategy...",
    analysisReady: "Analysis complete. Bid recommendation is ready with evidence audit.",
    analysisFallback: "Pre-generated example results are loaded for the preloaded files.",
    liveUnavailable: "Live analysis is unavailable right now. Your uploaded files were not saved.",
    analysisRunning: "Preparing the evidence-backed analysis...",
    stageIntake: "Files ready",
    stageOkf: "Tender mapped",
    stageRetrieval: "Proof found",
    stageParallel: "Specialists checked",
    stageSynthesis: "Decision drafted",
    stageAudit: "Evidence checked",
  },
  ar: {
    track: "وكلاء للأعمال",
    navHowTo: "طريقة الاستخدام",
    navAnalysis: "التحليل",
    navDiscuss: "ناقش مع TenderLens",
    navMap: "خريطة المناقصة",
    navDeck: "ملخص العرض",
    navQuestions: "أسئلة المناقصة",
    voiceMode: "تحدث مع TenderLens",
    tenderIntake: "ملفات المناقصة",
    sampleTender: "ملفات مثال جاهزة",
    chooseTender: "اختر ملفات مثال جاهزة",
    usePreloaded: "استخدم ملفات مثال جاهزة",
    preloadedNote: "تستخدم ملفات المثال الجاهزة نتائج معدة مسبقا حتى تستكشف TenderLens بسرعة وتحافظ على استهلاك واجهة Gemini. ملفات المناقصة التي ترفعها يتم تحليلها عند تشغيل التحليل.",
    runAnalysis: "تشغيل التحليل",
    secureUpload: "رفع ملفات المناقصة",
    uploadRule: "ملف المناقصة الرئيسي مطلوب. أضف ملفات داعمة اختيارية. يمكن تحليل TXT وMD وDOCX الآن. قراءة نص PDF ستضاف بعد استقرار دعم المحلل. الحد الأقصى 5 ملفات، 5 ميجابايت لكل ملف، و12 ميجابايت إجمالا.",
    mainTenderFile: "ملف المناقصة الرئيسي",
    supportingFiles: "ملفات داعمة",
    bidderProfile: "ملف الشركة",
    typingMode: "النقاش",
    askAgent: "ناقش مع TenderLens",
    recommendation: "التوصية",
    agentSystem: "التحليل",
    summaryTitle: "مناسب للتقديم مع نقطة متابعة تشغيلية",
    summaryText: "ملف الشركة يطابق المتطلبات الأساسية. يجب تأكيد قدرة شريك التغطية الفنية قبل الموافقة النهائية.",
    a2aAudit: "تم فحص الأدلة",
    auditPass: "ناجح",
    auditText: "تم فحص 7 ادعاءات، ولا يوجد ادعاء غير مدعوم",
    evidenceWarRoom: "الدليل وراء التوصية",
    inspectClaims: "افحص الأدلة",
    all: "الكل",
    eligibility: "الأهلية",
    risk: "المخاطر",
    deadline: "المواعيد",
    okfGraph: "خريطة المناقصة",
    linkedTenderKnowledge: "كيف ترتبط أجزاء المناقصة",
    sourceFiles: "ملفات المصدر",
    sampleSource: "ملفات مثال جاهزة",
    mainSource: "ملف المناقصة الرئيسي",
    supportingSource: "ملف داعم",
    compliance: "الامتثال",
    gapChecklist: "قائمة الفجوات",
    riskHeatmap: "خريطة المخاطر",
    deliveryRisk: "مخاطر التنفيذ",
    strategySimulator: "محاكي الاستراتيجية",
    scenarioTradeoffs: "مقارنة السيناريوهات",
    teamCapacity: "سعة الفريق",
    margin: "الهامش المتوقع",
    partnerAvailable: "الشريك متاح",
    clarifications: "أسئلة المناقصة",
    askIssuer: "اسأل الجهة الطارحة",
    prepareToAnswer: "استعد للإجابة",
    briefingDeck: "ملخص العرض",
    deckTitle: "شرائح جاهزة للاجتماع",
    howToEyebrow: "طريقة الاستخدام",
    howToTitle: "ابدأ بالملفات ثم اتبع الدليل",
    preparedBadge: "نتيجة مثال معدة مسبقا",
    guideFilesTitle: "استخدم ملفات جاهزة أو ارفع ملفاتك",
    guideFilesText: "تستخدم ملفات المثال الجاهزة نتائج معدة مسبقا حتى تستكشف TenderLens بسرعة وتحافظ على استهلاك واجهة Gemini. ملفات المناقصة التي ترفعها يتم تحليلها عند تشغيل التحليل.",
    guideAnalysisTitle: "راجع التحليل",
    guideAnalysisText: "شاهد توصية التقديم، درجة الثقة، الفجوات، المخاطر، والخطوات التالية في لوحة واحدة.",
    guideDiscussTitle: "ناقش مع TenderLens",
    guideDiscussText: "اسأل بالكتابة أو الصوت. جرب: هل يمكننا التقديم؟ ما أهم المخاطر؟ ماذا نسأل الجهة الطارحة؟",
    guideMapTitle: "استكشف خريطة المناقصة",
    guideMapText: "تربط خريطة المناقصة المتطلبات، الأدلة، المواعيد، المخاطر، الفجوات، والخطوات حتى تصبح التوصية واضحة.",
    guideQuestionsTitle: "استخدم أسئلة المناقصة",
    guideQuestionsText: "اسأل الجهة الطارحة يعرض أسئلة الاستيضاح. استعد للإجابة يعرض ما قد تسأله لجنة التقييم بعد قراءة عرضك.",
    guideDeckTitle: "أنشئ ملخص العرض",
    guideDeckText: "استخدم عرض الشرائح لاجتماع قرار التقديم: القرار، الملاءمة، الفجوات، المخاطر، الدليل، الأسئلة، وخطة العمل.",
    whatYouGet: "ما الذي ستحصل عليه",
    exampleDecision: "القرار: تقديم مع نقطة متابعة",
    exampleText: "درجة الثقة 90%. أهم فجوة: تأكيد قدرة مقاول HVAC. الدليل: القسم 2.1 يطلب شهادات ISO ومشروعين مشابهين للمرافق الذكية.",
    miniMap: "خريطة المناقصة: الأهلية -> الدليل -> الفجوات",
    miniQuestions: "أسئلة المناقصة: اسأل الجهة الطارحة + استعد للإجابة",
    miniDeck: "ملخص العرض: 8 شرائح جاهزة للاجتماع",
    analysisBanner: "أنت تشاهد نتائج مثال معدة مسبقا للملفات الجاهزة. ارفع ملفات المناقصة الخاصة بك لتشغيل تحليل جديد.",
    uploadedAnalysisBanner: "تم تحليل ملفات المناقصة المرفوعة لهذه الجلسة. لا يحفظ TenderLens ملفاتك.",
    uploadedBadge: "ملفات المناقصة المرفوعة",
    welcomeEyebrow: "مرحبا بك في TenderLens",
    welcomeTitle: "اتخذ قرار التقديم بالدليل",
    welcomeText: "ابدأ بملفات مثال جاهزة، ارفع ملفات المناقصة، أو افتح طريقة الاستخدام لجولة سريعة. الصوت يبدأ فقط عندما تختار تحدث مع TenderLens.",
    uploadMine: "ارفع ملفات المناقصة",
    openHowTo: "افتح طريقة الاستخدام",
    dontShow: "لا تظهر مرة أخرى",
    voiceSession: "جلسة صوتية",
    voiceIdle: "جاهز",
    voiceHelp: "الصوت يبدأ فقط بعد اختيار تحدث مع TenderLens.",
    mute: "كتم",
    interrupt: "مقاطعة",
    endVoice: "إنهاء",
    profilePlaceholder: "أكد قدرة مقاول التغطية الفنية قبل قرار التقديم النهائي.",
    chatPlaceholder: "اسأل عن المخاطر أو الأدلة أو الاستراتيجية...",
    analysisReady: "اكتمل التحليل. توصية التقديم جاهزة مع تدقيق الأدلة.",
    analysisFallback: "تم تحميل نتائج المثال المعدة مسبقا للملفات الجاهزة.",
    liveUnavailable: "التحليل المباشر غير متاح الآن. لم يتم حفظ ملفاتك المرفوعة.",
    analysisRunning: "جار إعداد التحليل المدعوم بالأدلة...",
    stageIntake: "الملفات جاهزة",
    stageOkf: "تم رسم الخريطة",
    stageRetrieval: "تم العثور على الدليل",
    stageParallel: "تم فحص التخصصات",
    stageSynthesis: "تم إعداد القرار",
    stageAudit: "تم فحص الأدلة",
  },
};

const workflowStages = [
  { selector: "#stageIntake", match: ["intake.", "router.", "voice_session_adapter."] },
  { selector: "#stageOkf", match: ["okf.", "mcp.validate_okf_contract"] },
  { selector: "#stageRetrieval", match: ["retrieval."] },
  { selector: "#stageParallel", match: ["parallel."] },
  { selector: "#stageSynthesis", match: ["synthesis."] },
  { selector: "#stageAudit", match: ["a2a.", "bounded_quality_loop."] },
];

const fallbackWorkflowTrace = [
  "router.accept_input",
  "intake.validate_tender",
  "okf.select_bundle",
  "retrieval.search_evidence",
  "parallel.start_specialists",
  "synthesis.create_draft",
  "a2a.evidence_audit",
  "bounded_quality_loop.pass",
  "final.structured_report",
];

let evidence = [
  {
    id: "eligibility-1",
    type: "eligibility",
    title: "Mandatory eligibility is aligned",
    titleAr: "الأهلية الإلزامية متوافقة",
    agent: "Compliance Agent",
    excerpt: "Bidders must provide ISO 9001, ISO 27001, a Riyadh operating permit, and two similar smart facilities projects.",
    excerptAr: "يجب تقديم ISO 9001 و ISO 27001 وتصريح تشغيل في الرياض ومشروعين مشابهين في المرافق الذكية.",
    citation: "Synthetic tender section 2.1 Mandatory bidder eligibility.",
  },
  {
    id: "deadlines-1",
    type: "deadline",
    title: "Clarification and final submission windows are tight",
    titleAr: "نافذة الاستفسارات والتقديم النهائي ضيقة",
    agent: "Timeline Agent",
    excerpt: "Clarification questions are due by 2026-07-08 and final proposal is due by 2026-07-18.",
    excerptAr: "آخر موعد للاستفسارات هو 2026-07-08 وآخر موعد للتقديم النهائي هو 2026-07-18.",
    citation: "Synthetic tender sections 6.1 and 6.2.",
  },
  {
    id: "risks-1",
    type: "risk",
    title: "HVAC partner confirmation is the main watch item",
    titleAr: "تأكيد شريك HVAC هو نقطة المتابعة الرئيسية",
    agent: "Risk Agent",
    excerpt: "Mobilization is required within 21 days and specialized HVAC coverage may require confirmed subcontractor capacity.",
    excerptAr: "التعبئة مطلوبة خلال 21 يوما وقد تتطلب تغطية HVAC المتخصصة قدرة مؤكدة من مقاول فرعي.",
    citation: "Synthetic tender section 8.1 and 8.2.",
  },
  {
    id: "evaluation-1",
    type: "strategy",
    title: "Technical quality dominates price",
    titleAr: "الجودة الفنية أهم من السعر",
    agent: "Bid Strategy Agent",
    excerpt: "Technical quality and experience account for 70 percent of evaluation, while price accounts for 20 percent.",
    excerptAr: "الجودة الفنية والخبرة تمثلان 70 بالمئة من التقييم، بينما السعر يمثل 20 بالمئة.",
    citation: "Synthetic tender section 5.1 Evaluation weighting.",
  },
];

const checklist = [
  ["ISO 9001 and ISO 27001 certificates", "pass"],
  ["Riyadh operating permit", "pass"],
  ["Two similar smart facilities references", "pass"],
  ["Signed method statement", "watch"],
  ["HVAC subcontractor confirmation", "watch"],
];

const risks = [
  ["Specialized HVAC coverage", "Medium", "Confirm subcontractor availability before bid gate."],
  ["21-day mobilization", "Medium", "Prepare named team roster and mobilization plan."],
  ["Data sharing boundaries", "Low", "Ask how dashboard data may be shared with subcontractors."],
];

const questions = [
  "Please confirm the complete HVAC asset inventory and required specialist certifications.",
  "How will SLA response time be measured for incidents logged outside business hours?",
  "Can the buyer clarify which dashboard data may be shared with subcontractors?",
];

const prepareQuestions = [
  "Can you prove two similar smart facilities projects with signed references?",
  "Who is your confirmed HVAC subcontractor and what capacity is reserved?",
  "How will your team mobilize within 21 days after award?",
];

const deckSlides = [
  {
    title: "Decision Summary",
    titleAr: "ملخص القرار",
    body: "Bid recommended with one watch item: confirm HVAC partner capacity before final approval.",
    bodyAr: "التوصية هي التقديم مع نقطة متابعة: تأكيد قدرة شريك HVAC قبل الموافقة النهائية.",
  },
  {
    title: "Tender Fit",
    titleAr: "ملاءمة المناقصة",
    body: "The bidder profile matches ISO, Riyadh permit, bilingual support, and smart facilities experience.",
    bodyAr: "ملف الشركة يطابق شهادات ISO وتصريح الرياض والدعم ثنائي اللغة وخبرة المرافق الذكية.",
  },
  {
    title: "Eligibility & Gaps",
    titleAr: "الأهلية والفجوات",
    body: "Core eligibility passes. Watch items: method statement and HVAC subcontractor confirmation.",
    bodyAr: "الأهلية الأساسية ناجحة. نقاط المتابعة: بيان المنهجية وتأكيد مقاول HVAC.",
  },
  {
    title: "Risks to Watch",
    titleAr: "المخاطر المهمة",
    body: "The tight 21-day mobilization window makes delivery readiness the main operational risk.",
    bodyAr: "نافذة التعبئة خلال 21 يوما تجعل جاهزية التنفيذ أهم خطر تشغيلي.",
  },
  {
    title: "Proof Behind Recommendation",
    titleAr: "الدليل وراء التوصية",
    body: "Evidence cites mandatory eligibility, submission deadlines, evaluation weight, and mobilization clauses.",
    bodyAr: "الأدلة تستند إلى الأهلية الإلزامية ومواعيد التقديم ووزن التقييم وبنود التعبئة.",
  },
  {
    title: "Tender Questions: Ask the Issuer",
    titleAr: "أسئلة المناقصة: اسأل الجهة الطارحة",
    body: "Clarify HVAC inventory, SLA measurement, and subcontractor data sharing before submission.",
    bodyAr: "استوضح قائمة أصول HVAC وقياس SLA ومشاركة بيانات المقاولين قبل التقديم.",
  },
  {
    title: "Tender Questions: Prepare to Answer",
    titleAr: "أسئلة المناقصة: استعد للإجابة",
    body: "Prepare proof for similar projects, subcontractor capacity, and mobilization plan.",
    bodyAr: "جهز إثبات المشاريع المشابهة وقدرة المقاول وخطة التعبئة.",
  },
  {
    title: "Action Plan",
    titleAr: "خطة العمل",
    body: "Confirm partner, finalize method statement, submit clarification questions, and prepare executive approval.",
    bodyAr: "أكد الشريك، أكمل بيان المنهجية، أرسل أسئلة الاستيضاح، وجهز موافقة الإدارة.",
  },
];

const defaultSourceDocuments = [
  {
    id: "sample-main-tender",
    role: "sample",
    filename: "smart_city_maintenance_tender.json",
    file_type: ".json",
    size_bytes: 0,
    parser_status: "preloaded_example",
    text_char_count: 0,
  },
];

let sourceDocuments = [...defaultSourceDocuments];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function localized(key) {
  return t[state.language][key] || t.en[key] || key;
}

function escapeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyLanguage(language) {
  state.language = language;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  $("#langEn").classList.toggle("active", language === "en");
  $("#langAr").classList.toggle("active", language === "ar");
  $$("[data-i18n]").forEach((node) => {
    node.textContent = t[language][node.dataset.i18n] || node.textContent;
  });
  $$("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t[language][node.dataset.i18nPlaceholder] || node.placeholder;
  });
  updateAnalysisBanner(state.analysisSource);
  renderEvidence();
  renderLists();
  renderSourceDocuments();
  renderDeck();
  renderWorkflowTrace(state.report?.workflow_trace || fallbackWorkflowTrace);
  updateScenario();
}

function renderEvidence() {
  const list = $("#evidenceList");
  const visible = evidence.filter((item) => state.activeFilter === "all" || item.type === state.activeFilter);
  list.innerHTML = visible
    .map((item) => {
      const title = state.language === "ar" ? item.titleAr : item.title;
      const excerpt = state.language === "ar" ? item.excerptAr : item.excerpt;
      return `
        <article class="evidence-card" data-id="${escapeText(item.id)}">
          <header>
            <strong>${escapeText(title)}</strong>
            <span class="tag">${escapeText(item.agent)}</span>
          </header>
          <p>${escapeText(excerpt)}</p>
          <div class="citation">${escapeText(item.citation)}</div>
        </article>`;
    })
    .join("");
}

function renderLists() {
  $("#checklist").innerHTML = checklist
    .map(([label, status]) => `<li><strong>${state.language === "ar" ? status === "pass" ? "ناجح" : "متابعة" : status === "pass" ? "Pass" : "Watch"}:</strong> ${escapeText(label)}</li>`)
    .join("");
  $("#riskGrid").innerHTML = risks
    .map(([title, severity, mitigation]) => `<div class="risk-item"><strong>${escapeText(title)}</strong><span>${escapeText(severity)} - ${escapeText(mitigation)}</span></div>`)
    .join("");
  $("#questions").innerHTML = questions
    .map((question) => `<li><strong>Q:</strong> ${escapeText(question)}</li>`)
    .join("");
  $("#prepareQuestions").innerHTML = prepareQuestions
    .map((question) => `<li><strong>Q:</strong> ${escapeText(question)}</li>`)
    .join("");
}

function sourceRoleLabel(role) {
  if (role === "main") return localized("mainSource");
  if (role === "supporting") return localized("supportingSource");
  return localized("sampleSource");
}

function renderSourceDocuments() {
  const target = $("#sourceDocuments");
  if (!target) return;
  target.innerHTML = sourceDocuments
    .map((document) => {
      const chars = Number(document.text_char_count || 0);
      const detail = chars > 0
        ? `${chars.toLocaleString(state.language === "ar" ? "ar" : "en")} chars`
        : document.parser_status || "";
      return `
        <article class="source-document">
          <strong>${escapeText(sourceRoleLabel(document.role))}</strong>
          <span>${escapeText(document.filename)}</span>
          <em>${escapeText(detail)}</em>
        </article>`;
    })
    .join("");
}

function renderDeck() {
  const slide = deckSlides[state.activeSlide] || deckSlides[0];
  const title = state.language === "ar" ? slide.titleAr : slide.title;
  const body = state.language === "ar" ? slide.bodyAr : slide.body;
  $("#slidePreview").innerHTML = `
    <article class="deck-slide">
      <p class="eyebrow">${escapeText(localized("briefingDeck"))}</p>
      <h3>${escapeText(title)}</h3>
      <p>${escapeText(body)}</p>
      <span>${escapeText(localized("preparedBadge"))}</span>
    </article>`;
  $("#slideCount").textContent = `${state.activeSlide + 1} / ${deckSlides.length}`;
  $("#slideRail").innerHTML = deckSlides
    .map((item, index) => {
      const label = state.language === "ar" ? item.titleAr : item.title;
      return `<button class="${index === state.activeSlide ? "active" : ""}" data-slide="${index}" type="button">${escapeText(index + 1)}. ${escapeText(label)}</button>`;
    })
    .join("");
}

function updateAnalysisBanner(source) {
  const badge = $(".transparency-banner .result-badge");
  const text = $(".transparency-banner p");
  if (!badge || !text) return;
  if (source === "upload-api") {
    badge.textContent = localized("uploadedBadge");
    text.textContent = localized("uploadedAnalysisBanner");
    return;
  }
  badge.textContent = localized("preparedBadge");
  text.textContent = localized("analysisBanner");
}

function renderWorkflowTrace(trace = [], currentIndex = -1) {
  const traceText = trace.join(" ");
  workflowStages.forEach((stage, index) => {
    const node = $(stage.selector);
    const done = stage.match.some((needle) => traceText.includes(needle));
    node.classList.toggle("done", done);
    node.classList.toggle("current", index === currentIndex);
  });
}

function formatRecommendation(recommendation) {
  const value = String(recommendation || "bid").replaceAll("_", " ");
  return state.language === "ar"
    ? value.toUpperCase()
    : value.toUpperCase();
}

function evidenceType(item) {
  const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
  const text = `${item.id || ""} ${item.concept_id || ""} ${item.title || ""} ${tags}`.toLowerCase();
  if (text.includes("deadline")) return "deadline";
  if (text.includes("risk")) return "risk";
  if (text.includes("eligib") || text.includes("compliance")) return "eligibility";
  return "strategy";
}

function applyReport(report, source = "api") {
  state.report = report;
  state.analysisSource = source;
  updateAnalysisBanner(source);
  $("#recommendation").textContent = formatRecommendation(report.recommendation);
  $("#confidence").textContent = `${Math.round(Number(report.confidence || 0) * 100)}%`;
  $("#summaryTitle").textContent =
    state.language === "ar" ? "نتيجة التحليل" : "Analysis result";
  $("#summaryText").textContent = report.executive_summary || t[state.language].summaryText;
  const audit = report.audit || {};
  $("#auditStatus").textContent = audit.status === "pass"
    ? t[state.language].auditPass
    : state.language === "ar" ? "بحاجة لمراجعة" : "Needs review";
  const audited = Number(audit.audited_claims || 0);
  const unsupported = Number(audit.unsupported_claim_count || 0);
  const auditText = state.language === "ar"
    ? `تم فحص ${audited} ادعاءات، ${unsupported} غير مدعومة`
    : `${audited} claims checked, ${unsupported} unsupported`;
  const auditSpan = document.querySelector(".audit-tile span");
  if (auditSpan) auditSpan.textContent = auditText;

  if (Array.isArray(report.evidence) && report.evidence.length) {
    evidence = report.evidence.slice(0, 8).map((item) => ({
      id: item.id,
      type: evidenceType(item),
      title: item.title,
      titleAr: item.titleAr || item.title_ar || item.title,
      agent: "Evidence Tool",
      excerpt: item.excerpt,
      excerptAr: item.excerptAr || item.excerpt_ar || item.excerpt,
      citation: item.citation,
    }));
  }
  if (Array.isArray(report.source_documents) && report.source_documents.length) {
    sourceDocuments = report.source_documents;
  }
  if (Array.isArray(report.findings) && report.findings.length) {
    checklist.length = 0;
    report.findings.slice(0, 7).forEach((finding) => {
      checklist.push([finding.summary, finding.status === "pass" ? "pass" : "watch"]);
    });
  }
  if (Array.isArray(report.risks) && report.risks.length) {
    risks.length = 0;
    report.risks.forEach((risk) => {
      risks.push([risk.title, risk.severity, risk.mitigation]);
    });
  }
  if (Array.isArray(report.clarification_questions) && report.clarification_questions.length) {
    questions.length = 0;
    report.clarification_questions.forEach((item) => {
      questions.push(item.question);
    });
  }
  if (Array.isArray(report.prepare_to_answer) && report.prepare_to_answer.length) {
    prepareQuestions.length = 0;
    report.prepare_to_answer.forEach((item) => {
      prepareQuestions.push(item.question || item);
    });
  }
  renderWorkflowTrace(report.workflow_trace || fallbackWorkflowTrace);
  renderEvidence();
  renderLists();
  renderSourceDocuments();
  renderDeck();
}

function preparedExampleReport() {
  return {
    recommendation: "bid",
    confidence: Number($("#confidence").textContent.replace("%", "")) / 100 || 0.95,
    executive_summary: t[state.language].summaryText,
    audit: {
      status: "pass",
      audited_claims: 7,
      unsupported_claim_count: 0,
    },
    evidence,
    findings: checklist.map(([summary, status]) => ({
      summary,
      status,
    })),
    risks: risks.map(([title, severity, mitigation]) => ({
      title,
      severity,
      mitigation,
    })),
    clarification_questions: questions.map((question) => ({ question })),
    prepare_to_answer: prepareQuestions.map((question) => ({ question })),
    source_documents: defaultSourceDocuments,
    workflow_trace: fallbackWorkflowTrace,
  };
}

async function postJson(path, payload, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

async function postFormData(path, formData, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        // Keep the HTTP status detail.
      }
      throw new Error(detail);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function createUploadAnalysisFormData() {
  const mainFile = $("#fileInput").files[0];
  const supportingFiles = Array.from($("#supportingFileInput")?.files || []);
  const formData = new FormData();
  formData.append("main_file", mainFile);
  supportingFiles.forEach((file) => formData.append("supporting_files", file));
  formData.append("profile_id", "default-bidder-profile");
  formData.append("language", state.language);
  formData.append("voice", "false");
  return formData;
}

async function runAnalysis() {
  addChatMessage(localized("analysisRunning"));
  renderWorkflowTrace(["router.accept_input"], 0);
  if (!state.hasUploadedTenderFiles) {
    applyReport(preparedExampleReport(), "prepared-example");
    addChatMessage(localized("analysisFallback"));
    return;
  }
  try {
    const result = await postFormData("/api/upload/analyze", createUploadAnalysisFormData());
    applyReport(result.report, "upload-api");
    addChatMessage(localized("analysisReady"));
  } catch (error) {
    addChatMessage(`${localized("liveUnavailable")} ${error.message || ""}`.trim());
  }
}

function updateScenario() {
  const capacity = Number($("#capacitySlider").value);
  const margin = Number($("#marginSlider").value);
  const partner = $("#partnerToggle").checked;
  let score = 0.86;
  if (capacity >= 24) score += 0.04;
  if (capacity < 18) score -= 0.12;
  score += partner ? 0.05 : -0.08;
  if (margin < 8) score -= 0.05;
  score = Math.max(0, Math.min(1, score));
  const pct = Math.round(score * 100);
  $("#confidence").textContent = `${pct}%`;
  $("#scenarioResult").textContent =
    state.language === "ar"
      ? `درجة السيناريو ${pct}%. ${partner ? "الشريك يقلل مخاطر التنفيذ." : "عدم توفر الشريك يزيد المخاطر."}`
      : `Scenario score ${pct}%. ${partner ? "Partner coverage reduces delivery risk." : "No partner coverage increases delivery risk."}`;
}

function addChatMessage(text, role = "agent") {
  const node = document.createElement("div");
  node.className = "message";
  node.textContent = `${role === "user" ? "You" : "TenderLens"}: ${text}`;
  $("#chatLog").appendChild(node);
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
}

function validateSingleFile(file, roleLabel) {
  const lower = file.name.toLowerCase();
  const okType = supportedExt.some((ext) => lower.endsWith(ext));
  if (!okType) {
    return state.language === "ar" ? `${roleLabel}: نوع الملف غير مدعوم.` : `${roleLabel}: unsupported file type.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return state.language === "ar" ? `${roleLabel}: الملف أكبر من حد 5 ميجابايت.` : `${roleLabel}: file is larger than the 5 MB limit.`;
  }
  return "";
}

function validateTenderFiles() {
  const status = $("#uploadStatus");
  const mainFile = $("#fileInput").files[0];
  const supportingFiles = Array.from($("#supportingFileInput")?.files || []);
  const files = [mainFile, ...supportingFiles].filter(Boolean);
  status.classList.remove("error");
  state.hasUploadedTenderFiles = false;

  if (!files.length) {
    status.textContent = "";
    return false;
  }
  if (!mainFile) {
    status.textContent = state.language === "ar" ? "يرجى إضافة ملف المناقصة الرئيسي أولا." : "Please add the Main Tender File first.";
    status.classList.add("error");
    return false;
  }
  if (files.length > 5) {
    status.textContent = state.language === "ar" ? "يمكن رفع 5 ملفات كحد أقصى." : "You can add up to 5 files total.";
    status.classList.add("error");
    return false;
  }
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  if (totalBytes > 12 * 1024 * 1024) {
    status.textContent = state.language === "ar" ? "إجمالي الملفات أكبر من حد 12 ميجابايت." : "Tender Files are larger than the 12 MB total limit.";
    status.classList.add("error");
    return false;
  }
  for (const file of files) {
    const role = file === mainFile ? localized("mainTenderFile") : localized("supportingFiles");
    const error = validateSingleFile(file, role);
    if (error) {
      status.textContent = error;
      status.classList.add("error");
      return false;
    }
  }
  state.hasUploadedTenderFiles = true;
  status.textContent = state.language === "ar"
    ? `تم قبول ${files.length} ملف. لن نحفظ ملفاتك.`
    : `${files.length} file${files.length === 1 ? "" : "s"} accepted. We do not save your files.`;
  return true;
}

function validateUpload() {
  return validateTenderFiles();
}

async function validateUploadWithBackend(file) {
  if (!file) {
    validateTenderFiles();
    return;
  }
  validateTenderFiles();
  const status = $("#uploadStatus");
  if (status.classList.contains("error")) return;
  try {
    const mainFile = $("#fileInput").files[0];
    const supportingFiles = Array.from($("#supportingFileInput")?.files || []);
    const files = [
      { filename: mainFile.name, size_bytes: mainFile.size, role: "main" },
      ...supportingFiles.map((item) => ({
        filename: item.name,
        size_bytes: item.size,
        role: "supporting",
      })),
    ];
    const result = await postJson("/api/upload/tender-files/validate", { files }, 4000);
    if (!result.accepted) {
      status.textContent = result.reason || result.message || status.textContent;
      status.classList.add("error");
      return;
    }
    status.textContent = state.language === "ar"
      ? "تم قبول بيانات الملفات. لن نحفظ ملفاتك."
      : "Tender Files accepted. We do not save your files.";
  } catch (error) {
    status.textContent = state.language === "ar"
      ? "تم قبول بيانات الملفات محليا. لن نحفظ ملفاتك."
      : "Tender Files accepted locally. We do not save your files.";
  }
}

async function startVoice() {
  $("#voiceOverlay").classList.remove("hidden", "error");
  const card = $(".voice-card");
  card.className = "voice-card";
  $("#voiceStateLabel").textContent = state.language === "ar" ? "جار الاتصال" : "Connecting";
  $("#voiceHelp").textContent = state.language === "ar" ? "سيظهر طلب إذن الميكروفون الآن." : "Microphone permission will appear now.";
  try {
    state.voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    card.classList.add("listening");
    $("#voiceStateLabel").textContent = state.language === "ar" ? "أستمع" : "Listening";
    $("#voiceHelp").textContent = state.language === "ar" ? "اسأل عن قرار التقديم أو المخاطر أو الأدلة." : "Ask about bid fit, risks, or evidence.";
    $("#transcript").textContent =
      state.language === "ar"
        ? "مثال: هل يمكننا التقديم؟ الوكيل سيعرض الأدلة في اللوحة."
        : "Example: Can we bid? The agent will keep evidence visible in the cockpit.";
    highlightEvidence("eligibility-1");
  } catch (error) {
    $("#voiceOverlay").classList.add("error");
    $("#voiceStateLabel").textContent = state.language === "ar" ? "تعذر الاتصال" : "Error";
    $("#voiceHelp").textContent = state.language === "ar" ? "تعذر الوصول للميكروفون. وضع الكتابة متاح." : "Microphone unavailable. Typing mode remains available.";
  }
}

function stopVoice() {
  if (state.voiceStream) {
    state.voiceStream.getTracks().forEach((track) => track.stop());
  }
  state.voiceStream = null;
  $("#voiceOverlay").classList.add("hidden");
  $("#voiceOverlay").classList.remove("error");
  $$(".evidence-card").forEach((card) => card.classList.remove("active"));
}

function highlightEvidence(id) {
  $$(".evidence-card").forEach((card) => card.classList.toggle("active", card.dataset.id === id));
}

function usePreloadedExample() {
  $("#fileInput").value = "";
  if ($("#supportingFileInput")) $("#supportingFileInput").value = "";
  state.hasUploadedTenderFiles = false;
  $("#uploadStatus").textContent = localized("preloadedNote");
  $("#uploadStatus").classList.remove("error");
  sourceDocuments = [...defaultSourceDocuments];
  applyReport(preparedExampleReport(), "prepared-example");
  addChatMessage(localized("analysisFallback"));
}

function showWelcomeIfNeeded() {
  const modal = $("#welcomeModal");
  if (!modal) return;
  if (window.localStorage.getItem("tenderlens-welcome-dismissed") === "yes") return;
  modal.classList.remove("hidden");
}

function closeWelcome(persist = false) {
  const modal = $("#welcomeModal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (persist) {
    window.localStorage.setItem("tenderlens-welcome-dismissed", "yes");
  }
}

$("#langEn").addEventListener("click", () => applyLanguage("en"));
$("#langAr").addEventListener("click", () => applyLanguage("ar"));
$("#analyzeButton").addEventListener("click", runAnalysis);
$("#useSampleButton").addEventListener("click", usePreloadedExample);
$("#sendChat").addEventListener("click", () => {
  const value = $("#chatInput").value.trim();
  if (!value) return;
  addChatMessage(value, "user");
  $("#chatInput").value = "";
  addChatMessage(state.language === "ar" ? "أقوى دليل هو توافق الأهلية، وأهم مخاطرة هي تغطية HVAC." : "The strongest evidence is eligibility fit; the main watch item is HVAC coverage.");
  highlightEvidence("risks-1");
});
$("#fileInput").addEventListener("change", (event) => validateUploadWithBackend(event.target.files[0]));
$("#supportingFileInput").addEventListener("change", () => validateUploadWithBackend($("#fileInput").files[0]));
$("#voiceButton").addEventListener("click", startVoice);
$("#endVoice").addEventListener("click", stopVoice);
$("#muteVoice").addEventListener("click", () => {
  state.voiceMuted = !state.voiceMuted;
  $("#voiceStateLabel").textContent = state.voiceMuted
    ? state.language === "ar" ? "مكتوم" : "Muted"
    : state.language === "ar" ? "أستمع" : "Listening";
});
$("#interruptVoice").addEventListener("click", () => {
  $("#voiceStateLabel").textContent = state.language === "ar" ? "تمت المقاطعة" : "Interrupted";
  $("#voiceHelp").textContent = state.language === "ar" ? "تم إيقاف الرد الصوتي. يمكنك المتابعة كتابة." : "Spoken response stopped. You can continue typing.";
});
$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  state.activeFilter = button.dataset.filter;
  $$("#filters .chip").forEach((chip) => chip.classList.toggle("active", chip === button));
  renderEvidence();
});
["capacitySlider", "marginSlider", "partnerToggle"].forEach((id) => {
  $(`#${id}`).addEventListener("input", updateScenario);
});
$("#prevSlide").addEventListener("click", () => {
  state.activeSlide = (state.activeSlide - 1 + deckSlides.length) % deckSlides.length;
  renderDeck();
});
$("#nextSlide").addEventListener("click", () => {
  state.activeSlide = (state.activeSlide + 1) % deckSlides.length;
  renderDeck();
});
$("#slideRail").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-slide]");
  if (!button) return;
  state.activeSlide = Number(button.dataset.slide);
  renderDeck();
});
$("#welcomeSample").addEventListener("click", () => {
  usePreloadedExample();
  closeWelcome();
  document.querySelector("#analysis").scrollIntoView({ behavior: "smooth" });
});
$("#welcomeUpload").addEventListener("click", () => {
  closeWelcome();
  $("#fileInput").focus();
});
$("#welcomeHowTo").addEventListener("click", () => {
  closeWelcome();
  document.querySelector("#how-to-use").scrollIntoView({ behavior: "smooth" });
});
$("#welcomeDismiss").addEventListener("click", () => closeWelcome(true));

addChatMessage("I am ready with the preloaded files, bidder profile, proof, and evidence check.");
applyReport(preparedExampleReport(), "prepared-example");
renderEvidence();
renderLists();
renderSourceDocuments();
renderDeck();
updateScenario();
showWelcomeIfNeeded();
