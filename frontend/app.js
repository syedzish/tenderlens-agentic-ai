const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const supportedExt = [".pdf", ".txt", ".md", ".docx"];

const state = {
  language: "en",
  voiceStream: null,
  voiceMuted: false,
  activeFilter: "all",
  analysisSource: "static",
  report: null,
};

const t = {
  en: {
    track: "Agents for Business",
    voiceMode: "Voice Mode",
    tenderIntake: "Tender Intake",
    sampleTender: "Sample tender",
    chooseTender: "Choose tender",
    runAnalysis: "Run analysis",
    secureUpload: "Secure upload",
    uploadRule: "PDF, TXT, MD, DOCX. Max 5 MB.",
    bidderProfile: "Bidder Profile",
    typingMode: "Typing Mode",
    askAgent: "Ask the agent",
    recommendation: "Recommendation",
    agentSystem: "Agentic System",
    summaryTitle: "Bid-ready, with one delivery watch item",
    summaryText: "The bidder profile meets the core eligibility requirements. Confirm specialized HVAC partner capacity before final approval.",
    a2aAudit: "A2A Evidence Audit",
    auditPass: "Passed",
    auditText: "7 claims checked, 0 unsupported",
    evidenceWarRoom: "Evidence War Room",
    inspectClaims: "Inspect grounded claims",
    all: "All",
    eligibility: "Eligibility",
    risk: "Risk",
    deadline: "Deadline",
    okfGraph: "OKF Concept Graph",
    linkedTenderKnowledge: "Linked tender knowledge",
    compliance: "Compliance",
    gapChecklist: "Gap checklist",
    riskHeatmap: "Risk Heatmap",
    deliveryRisk: "Delivery risk",
    strategySimulator: "Strategy Simulator",
    scenarioTradeoffs: "Scenario tradeoffs",
    teamCapacity: "Team capacity",
    margin: "Estimated margin",
    partnerAvailable: "Partner available",
    clarifications: "Clarifications",
    askIssuer: "Questions for issuer",
    voiceSession: "Voice Session",
    voiceIdle: "Idle",
    voiceHelp: "Voice starts only after you choose Voice Mode.",
    mute: "Mute",
    interrupt: "Interrupt",
    endVoice: "End",
    profilePlaceholder: "Confirm HVAC subcontractor capacity before final bid gate.",
    chatPlaceholder: "Ask about risks, evidence, or strategy...",
    analysisReady: "Analysis complete. Bid recommendation is ready with evidence audit.",
    analysisFallback: "Using reliable sample analysis while backend is unavailable.",
    analysisRunning: "Running agent workflow...",
  },
  ar: {
    track: "وكلاء للأعمال",
    voiceMode: "وضع الصوت",
    tenderIntake: "استقبال المناقصة",
    sampleTender: "مناقصة تجريبية",
    chooseTender: "اختر المناقصة",
    runAnalysis: "تشغيل التحليل",
    secureUpload: "رفع آمن",
    uploadRule: "PDF أو TXT أو MD أو DOCX. الحد الأقصى 5 ميجابايت.",
    bidderProfile: "ملف الشركة",
    typingMode: "وضع الكتابة",
    askAgent: "اسأل الوكيل",
    recommendation: "التوصية",
    agentSystem: "النظام الوكيلي",
    summaryTitle: "مناسب للتقديم مع نقطة متابعة تشغيلية",
    summaryText: "ملف الشركة يطابق المتطلبات الأساسية. يجب تأكيد قدرة شريك التغطية الفنية قبل الموافقة النهائية.",
    a2aAudit: "تدقيق الأدلة عبر A2A",
    auditPass: "ناجح",
    auditText: "تم فحص 7 ادعاءات، ولا يوجد ادعاء غير مدعوم",
    evidenceWarRoom: "غرفة الأدلة",
    inspectClaims: "افحص الادعاءات المدعومة",
    all: "الكل",
    eligibility: "الأهلية",
    risk: "المخاطر",
    deadline: "المواعيد",
    okfGraph: "خريطة OKF",
    linkedTenderKnowledge: "معرفة المناقصة المترابطة",
    compliance: "الامتثال",
    gapChecklist: "قائمة الفجوات",
    riskHeatmap: "خريطة المخاطر",
    deliveryRisk: "مخاطر التنفيذ",
    strategySimulator: "محاكي الاستراتيجية",
    scenarioTradeoffs: "مقارنة السيناريوهات",
    teamCapacity: "سعة الفريق",
    margin: "الهامش المتوقع",
    partnerAvailable: "الشريك متاح",
    clarifications: "الاستفسارات",
    askIssuer: "أسئلة للجهة الطارحة",
    voiceSession: "جلسة صوتية",
    voiceIdle: "جاهز",
    voiceHelp: "الصوت يبدأ فقط بعد اختيار وضع الصوت.",
    mute: "كتم",
    interrupt: "مقاطعة",
    endVoice: "إنهاء",
    profilePlaceholder: "أكد قدرة مقاول التغطية الفنية قبل قرار التقديم النهائي.",
    chatPlaceholder: "اسأل عن المخاطر أو الأدلة أو الاستراتيجية...",
    analysisReady: "اكتمل التحليل. توصية التقديم جاهزة مع تدقيق الأدلة.",
    analysisFallback: "يتم استخدام التحليل التجريبي الموثوق لأن الخلفية غير متاحة.",
    analysisRunning: "جار تشغيل سير العمل الوكيلي...",
  },
};

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
  renderEvidence();
  renderLists();
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
    .map(([label, status]) => `<li><strong>${status === "pass" ? "Pass" : "Watch"}:</strong> ${escapeText(label)}</li>`)
    .join("");
  $("#riskGrid").innerHTML = risks
    .map(([title, severity, mitigation]) => `<div class="risk-item"><strong>${escapeText(title)}</strong><span>${escapeText(severity)} - ${escapeText(mitigation)}</span></div>`)
    .join("");
  $("#questions").innerHTML = questions
    .map((question) => `<li><strong>Q:</strong> ${escapeText(question)}</li>`)
    .join("");
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
  $("#recommendation").textContent = formatRecommendation(report.recommendation);
  $("#confidence").textContent = `${Math.round(Number(report.confidence || 0) * 100)}%`;
  $("#summaryTitle").textContent =
    state.language === "ar" ? "نتيجة تحليل الوكلاء" : "Agent workflow result";
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
      titleAr: item.title,
      agent: "Evidence Tool",
      excerpt: item.excerpt,
      excerptAr: item.excerpt,
      citation: item.citation,
    }));
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
  renderEvidence();
  renderLists();
}

function fallbackReport() {
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

async function runAnalysis() {
  addChatMessage(localized("analysisRunning"));
  try {
    const result = await postJson("/api/analyze", {
      tender_id: $("#tenderSelect").value,
      profile_id: "default-bidder-profile",
      language: state.language,
      voice: false,
    });
    applyReport(result.report, "api");
    addChatMessage(localized("analysisReady"));
  } catch (error) {
    applyReport(fallbackReport(), "static");
    addChatMessage(localized("analysisFallback"));
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

function validateUpload(file) {
  if (!file) return;
  const lower = file.name.toLowerCase();
  const okType = supportedExt.some((ext) => lower.endsWith(ext));
  const status = $("#uploadStatus");
  status.classList.remove("error");
  if (!okType) {
    status.textContent = state.language === "ar" ? "نوع الملف غير مدعوم." : "Unsupported file type.";
    status.classList.add("error");
    return;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    status.textContent = state.language === "ar" ? "الملف أكبر من حد 5 ميجابايت." : "File is larger than the 5 MB limit.";
    status.classList.add("error");
    return;
  }
  status.textContent = state.language === "ar" ? "تم قبول بيانات الملف. لن نحفظ الملف." : "File metadata accepted. We do not save your file.";
}

async function validateUploadWithBackend(file) {
  if (!file) return;
  validateUpload(file);
  const status = $("#uploadStatus");
  if (status.classList.contains("error")) return;
  try {
    const result = await postJson("/api/upload/validate", {
      filename: file.name,
      size_bytes: file.size,
    }, 4000);
    if (!result.accepted) {
      status.textContent = result.reason || result.message || status.textContent;
      status.classList.add("error");
      return;
    }
    status.textContent = state.language === "ar"
      ? "تم قبول بيانات الملف من الخلفية. لن نحفظ الملف."
      : "File metadata accepted by backend. We do not save your file.";
  } catch (error) {
    status.textContent = state.language === "ar"
      ? "تم قبول بيانات الملف محليا. الخلفية غير متاحة الآن."
      : "File metadata accepted locally. Backend validation is unavailable.";
  }
}

async function startVoice() {
  $("#voiceOverlay").classList.remove("hidden");
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
  $$(".evidence-card").forEach((card) => card.classList.remove("active"));
}

function highlightEvidence(id) {
  $$(".evidence-card").forEach((card) => card.classList.toggle("active", card.dataset.id === id));
}

$("#langEn").addEventListener("click", () => applyLanguage("en"));
$("#langAr").addEventListener("click", () => applyLanguage("ar"));
$("#analyzeButton").addEventListener("click", runAnalysis);
$("#sendChat").addEventListener("click", () => {
  const value = $("#chatInput").value.trim();
  if (!value) return;
  addChatMessage(value, "user");
  $("#chatInput").value = "";
  addChatMessage(state.language === "ar" ? "أقوى دليل هو توافق الأهلية، وأهم مخاطرة هي تغطية HVAC." : "The strongest evidence is eligibility fit; the main watch item is HVAC coverage.");
  highlightEvidence("risks-1");
});
$("#fileInput").addEventListener("change", (event) => validateUploadWithBackend(event.target.files[0]));
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

addChatMessage("I am ready with the curated tender, bidder profile, OKF evidence, and A2A audit signal.");
renderEvidence();
renderLists();
updateScenario();
