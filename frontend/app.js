/**
 * BOOND — Municipal Water-Leak Reporting & Triage Engine
 * Vanilla JavaScript Frontend Implementation (Spray Brutalism)
 * Phase 2B: Heat & Water Design Polish + Contract Audit
 */

(function () {
  "use strict";

  // ============================================================================
  // TRANSLATION DICTIONARY (EN / हिं)
  // ============================================================================
  const I18N = {
    en: {
      tagline: "MUNICIPAL LEAK TRIAGE",
      statusOnline: "CONNECTED",
      statusOffline: "API NOT CONFIGURED",
      statusError: "DISCONNECTED",
      statusDemo: "DEMO / SIMULATED",
      engineerBtn: "ENGINEER MODE",
      engineerActive: "ENGINEER ACTIVE",
      heroTag: "WATER EMERGENCY TRIAGE ENGINE",
      heroProtocol: "MUNICIPAL PROTOCOL",
      heroTitle: "# EVERY LEAK. RANKED.",
      heroPitch: "Turn scattered leak reports into the next repair that matters.",
      reportBtn: "REPORT A LEAK",
      queueBtn: "VIEW REPAIR QUEUE",
      guidelinesNavBtn: "GUIDELINES",
      seedBtn: "SEED 12 DEMO LEAKS",
      ledgerAddressed: "ESTIMATED LEAKAGE RATE ADDRESSED",
      ledgerClosed: "TICKETS CLOSED W/ PROOF",
      ledgerMerged: "DUPLICATE REPORTS MERGED",
      ledgerOpen: "OPEN LEAKS IN QUEUE",
      ledgerDisclaimer: "NOT VERIFIED WATER SAVINGS",
      ledgerCedarVerified: "Cedar Policy Verified",
      ledgerWithin30m: "< 30m Proximity",
      ledgerPendingRepair: "Active Triage",
      mapHeader: "MUNICIPAL LEAK MAP",
      locateBtn: "USE MY LOCATION",
      legendGush: "GUSH (4K-15K L/d)",
      legendSteady: "STEADY (500-2K L/d)",
      legendDrip: "DRIP (50-200 L/d)",
      legendClosed: "FIXED (✓)",
      legendSimulated: "SIMULATED",
      formTitle: "REPORT LEAK",
      flowSeverity: "OBSERVED FLOW SEVERITY",
      drinkingLine: "DRINKING WATER LINE?",
      drinkingSub: "Applies 1.5x priority weight",
      coordsLabel: "SELECTED LOCATION",
      readyTag: "READY",
      photoLabel: "LEAK PHOTO (OPTIONAL)",
      photoPrompt: "📸 Tap or click to select / capture photo",
      submitReportBtn: "SUBMIT LEAK REPORT",
      submittingReport: "SUBMITTING REPORT...",
      queueBadge: "CEDAR GOVERNED QUEUE",
      queueHeading: "FIX THIS FIRST",
      queueUpdated: "Last updated:",
      refreshBtn: "REFRESH",
      filterAll: "ALL",
      filterOpen: "OPEN",
      filterFixed: "FIXED (CLOSED)",
      filterDrinking: "DRINKING WATER",
      filterGush: "GUSH ONLY",
      filterSimulated: "SIMULATED",
      searchPlaceholder: "🔍 Search ID, flow, location...",
      loadingQueue: "Loading municipal queue...",
      noTicketsFound: "NO LEAKS FOUND IN THIS VIEW.",
      reportersCount: "citizen reports",
      drinkingPriorityBadge: "DRINKING WATER PRIORITY",
      simulatedBadge: "SIMULATED",
      whyBtn: "WHY?",
      closeBtn: "CLOSE TICKET",
      stillLeakingBtn: "STILL LEAKING?",
      nowFixingPrefix: "NOW FIXING:",
      noOpenLeaks: "NO OPEN LEAKS IN QUEUE · GOOD JOB",
      guidelinesBadge: "STANDARD OPERATING PROTOCOL",
      guidelinesHeading: "HOW BOOND WORKS: 8-STEP PROTOCOL",
      step1Title: "Locate Leak",
      step1Desc: "Locate the leak on the map or use the location button to record coordinates.",
      step2Title: "Select Flow",
      step2Desc: "Select Drip, Steady or Gush based on the observed water flow rate.",
      step3Title: "Drinking Water",
      step3Desc: "Indicate whether a drinking water line is affected (applies 1.5x priority weight).",
      step4Title: "Photo Evidence",
      step4Desc: "Add an on-site photo when available and submit the report to the triage engine.",
      step5Title: "30m Proximity Merge",
      step5Desc: "Similar open reports within 30 metres are automatically merged into one ticket.",
      step6Title: "Ranked Queue",
      step6Desc: "Follow the ranked queue to understand which repair needs immediate attention.",
      step7Title: "Cedar Closure Rule",
      step7Desc: "Only an authorized engineer can close a ticket, and after-repair photo proof is mandatory.",
      step8Title: "Neighbor Disputes",
      step8Desc: "Residents can dispute premature closure; 2 disputes trigger automated reopening.",
      priorityFormulaTitle: "TRIAGE PRIORITY FORMULA (HEURISTIC AID)",
      priorityAssumptions: "Midpoints: Drip (125 L/d) · Steady (1,250 L/d) · Gush (9,500 L/d). Reporter multiplier adds +0.25 per additional citizen report.",
      triageAidTitle: "TRIAGE AID DISCLAIMER",
      triageAidText: "Priority ranking is a triage aid for maintenance prioritization, not an official municipal order or a verified physical measurement of actual water saved. Seeded reports are simulated for demonstration.",
      feedbackSubjectLabel: "SUBJECT *",
      feedbackEmailLabel: "CONTACT EMAIL (OPTIONAL)",
      feedbackMessageLabel: "MESSAGE *",
      generateDraftBtn: "GENERATE FEEDBACK DRAFT",
      copyDraftBtn: "COPY DRAFT",
      copyCoordsBtn: "COPY",
      coordsCopied: "COPIED ✓",
      showOnMapBtn: "MAP",
      locationDemoTag: "📍 DEMO REFERENCE (DELHI)",
      locationClickedTag: "👆 MAP CLICKED POINT",
      locationGpsTag: "🎯 GPS CONFIRMED (DEVICE)",
      honestyHeading: "HOW THE NUMBERS WORK (METHODOLOGY & HONESTY)",
      calcTitle: "1. Flow Rates & Heuristic Priority",
      calcBody: "Flows are estimated: Drip (50–200 L/d, midpoint 125), Steady (500–2,000 L/d, midpoint 1,250), and Gush (4,000–15,000 L/d, midpoint 9,500). Priority formula applies a 1.5x multiplier for drinking water lines and +0.25 per additional reporter.",
      mergeTitle: "2. 30-Metre Proximity Merging",
      mergeBody: "New reports within 30 metres of an existing open leak are automatically merged using the Haversine formula. The reporter count increases and the flow severity upgrades to the higher value observed.",
      cedarTitle: "3. Cedar Policy Authorization",
      cedarBody: "Ticket closures require authenticated engineer status and verified after-repair photo proof. Reopening closed tickets requires at least 2 citizen disputes. Authorization decisions fail closed by design.",
      disclaimerTitle: "4. Honest Estimation Disclaimer",
      disclaimerBody: "Estimated leakage addressed represents triage ranking metrics, NOT verified water saved. Demo seed tickets are simulated and never claimed as live reports. Prototype PIN authentication must be replaced with Cognito in production.",
      trailReported: "REPORTED",
      trailOpen: "OPEN",
      trailProof: "REPAIR PROOF",
      trailClosed: "CLOSED",
      beforePhotoBadge: "BEFORE REPAIR PHOTO",
      afterPhotoBadge: "AFTER REPAIR (PROOF)",
      demoGalleryBtn: "DEMO ASSETS",
      photoUnavailable: "Photo unavailable",
      evidenceNotUploaded: "Evidence not uploaded",
      pendingRepairProof: "Pending repair proof",
      simulatedDemoBadge: "SIMULATED DEMO — ILLUSTRATION, NOT REPAIR EVIDENCE",
      simulatedRepairedNote: "Conceptual illustration of repaired pipe · Not proof of actual repair",
      simulatedNoPhoto: "Simulated scenario — No demo photo attached",
      curatedDemoViewBtn: "CURATED DEMO (20)",
      allTicketsViewBtn: "ALL MUNICIPAL TICKETS"
    },
    hi: {
      tagline: "नगरपालिका रिसाव निवारण",
      statusOnline: "कनेक्टेड",
      statusOffline: "एपीआई कॉन्फ़िगर नहीं",
      statusError: "डिस्कनेक्टेड",
      statusDemo: "डेमो / सिम्युलेटेड",
      engineerBtn: "इंजीनियर मोड",
      engineerActive: "इंजीनियर सक्रिय",
      heroTag: "जल आपातकालीन प्राथमिकता प्रणाली",
      heroProtocol: "नगरपालिका प्रोटोकॉल",
      heroTitle: "# हर रिसाव। प्राथमिकता में।",
      heroPitch: "नागरिक रिपोर्टों को अगली महत्वपूर्ण मरम्मत में बदलें।",
      reportBtn: "रिसाव की रिपोर्ट करें",
      queueBtn: "मरम्मत कतार देखें",
      guidelinesNavBtn: "दिशानिर्देश",
      seedBtn: "12 डेमो रिसाव दर्ज करें",
      ledgerAddressed: "अनुमानित रिसाव दर रोकथाम",
      ledgerClosed: "प्रमाण सहित बंद टिकट",
      ledgerMerged: "मर्ज की गई डुप्लिकेट रिपोर्टें",
      ledgerOpen: "कतार में खुले रिसाव",
      ledgerDisclaimer: "सत्यापित बचत नहीं (केवल अनुमान)",
      ledgerCedarVerified: "सीडर नीति द्वारा सत्यापित",
      ledgerWithin30m: "< 30 मीटर दूरी",
      ledgerPendingRepair: "सक्रिय कतार",
      mapHeader: "नगरपालिका रिसाव मानचित्र",
      locateBtn: "मेरा स्थान उपयोग करें",
      legendGush: "तीव्र (4K-15K ली/दिन)",
      legendSteady: "स्थिर (500-2K ली/दिन)",
      legendDrip: "टपकन (50-200 ली/दिन)",
      legendClosed: "सुधारा गया (✓)",
      legendSimulated: "सिम्युलेटेड",
      formTitle: "रिसाव रिपोर्ट दर्ज करें",
      flowSeverity: "रिसाव की तीव्रता",
      drinkingLine: "पेयजल पाइपलाइन?",
      drinkingSub: "1.5x प्राथमिकता भार लागू",
      coordsLabel: "चुना गया स्थान",
      readyTag: "तैयार",
      photoLabel: "रिसाव की फोटो (वैकल्पिक)",
      photoPrompt: "📸 फोटो चुनने या खींचने के लिए टैप करें",
      submitReportBtn: "रिपोर्ट जमा करें",
      submittingReport: "जमा हो रहा है...",
      queueBadge: "सीडर अधिकृत कतार",
      queueHeading: "पहले इसे ठीक करें",
      queueUpdated: "अंतिम अपडेट:",
      refreshBtn: "ताज़ा करें",
      filterAll: "सभी",
      filterOpen: "खुले",
      filterFixed: "सुधारे गए",
      filterDrinking: "पेयजल लाइन",
      filterGush: "केवल तीव्र",
      filterSimulated: "सिम्युलेटेड",
      searchPlaceholder: "🔍 आईडी, बहाव, स्थान खोजें...",
      loadingQueue: "कतार लोड हो रही है...",
      noTicketsFound: "इस दृश्य में कोई रिसाव नहीं मिला।",
      reportersCount: "नागरिक रिपोर्टें",
      drinkingPriorityBadge: "पेयजल प्राथमिकता",
      simulatedBadge: "सिम्युलेटेड",
      whyBtn: "क्यों?",
      closeBtn: "टिकट बंद करें",
      stillLeakingBtn: "अभी भी रिस रहा है?",
      nowFixingPrefix: "वर्तमान प्राथमिकता:",
      noOpenLeaks: "कतार में कोई खुला रिसाव नहीं · बहुत बढ़िया",
      guidelinesBadge: "मानक संचालन प्रोटोकॉल",
      guidelinesHeading: "बूंद कार्यप्रणाली: 8-चरणीय प्रोटोकॉल",
      step1Title: "स्थान चुनें",
      step1Desc: "मानचित्र पर रिसाव खोजें या जीपीएस निर्देशांक दर्ज करने हेतु बटन दबाएं।",
      step2Title: "बहाव चुनें",
      step2Desc: "देखे गए बहाव के अनुसार टपकन, स्थिर या तीव्र चुनें।",
      step3Title: "पेयजल लाइन",
      step3Desc: "दर्ज करें कि क्या पेयजल पाइपलाइन प्रभावित है (1.5x भार लागू)।",
      step4Title: "फोटो प्रमाण",
      step4Desc: "उपलब्ध होने पर घटनास्थल की फोटो जोड़ें और रिपोर्ट जमा करें।",
      step5Title: "30 मी. निकटता विलय",
      step5Desc: "खुले रिसाव के 30 मीटर के भीतर समान रिपोर्टें स्वचालित रूप से विलय हो जाती हैं।",
      step6Title: "प्राथमिकता कतार",
      step6Desc: "रैंक की गई कतार से समझें कि किस मरम्मत पर तत्काल ध्यान देने की आवश्यकता है।",
      step7Title: "सीडर समापन नियम",
      step7Desc: "केवल अधिकृत इंजीनियर टिकट बंद कर सकता है, और मरम्मत पश्चात फोटो अनिवार्य है।",
      step8Title: "नागरिक आपत्तियां",
      step8Desc: "नागरिक समयपूर्व बंद होने पर आपत्ति दर्ज कर सकते हैं; 2 आपत्तियां टिकट पुनः खोलती हैं।",
      priorityFormulaTitle: "प्राथमिकता सूत्र (सहायक मीट्रिक)",
      priorityAssumptions: "मध्यबिंदु: टपकन (125 ली/दिन) · स्थिर (1,250 ली/दिन) · तीव्र (9,500 ली/दिन)। अतिरिक्त रिपोर्टर पर +0.25x भार।",
      triageAidTitle: "प्राथमिकता अस्वीकरण",
      triageAidText: "प्राथमिकता रैंकिंग मरम्मत नियोजन हेतु एक सहायता प्रणाली है, आधिकारिक नगरपालिका आदेश या सत्यापित जल बचत नहीं। डेमो रिपोर्टें सिम्युलेटेड हैं।",
      feedbackSubjectLabel: "विषय *",
      feedbackEmailLabel: "संपर्क ईमेल (वैकल्पिक)",
      feedbackMessageLabel: "संदेश *",
      generateDraftBtn: "फीडबैक ड्राफ्ट तैयार करें",
      copyDraftBtn: "ड्राफ्ट कॉपी करें",
      copyCoordsBtn: "कॉपी",
      coordsCopied: "कॉपी हुआ ✓",
      showOnMapBtn: "मानचित्र",
      locationDemoTag: "📍 संदर्भ केंद्र (दिल्ली डेमो)",
      locationClickedTag: "👆 मानचित्र पर चुना गया",
      locationGpsTag: "🎯 जीपीएस सत्यापित (उपकरण)",
      honestyHeading: "आंकड़े कैसे काम करते हैं (विधि और सत्यता)",
      calcTitle: "1. बहाव दर और प्राथमिकता",
      calcBody: "अनुमानित बहाव: टपकन (50–200 ली/दिन), स्थिर (500–2,000 ली/दिन), तीव्र (4,000–15,000 ली/दिन)। पेयजल के लिए 1.5x और प्रत्येक अतिरिक्त रिपोर्टर पर +0.25 वृद्धि होती है।",
      mergeTitle: "2. 30-मीटर निकटता विलय",
      mergeBody: "खुले रिसाव के 30 मीटर के भीतर नई रिपोर्टें हैवर्सिन सूत्र द्वारा स्वचालित रूप से विलय हो जाती हैं। रिपोर्टर संख्या बढ़ जाती है और गंभीर बहाव लागू होता है।",
      cedarTitle: "3. सीडर नीति प्रमाणीकरण",
      cedarBody: "टिकट बंद करने के लिए इंजीनियर प्रमाणीकरण और मरम्मत के बाद का फोटो प्रमाण आवश्यक है। बंद टिकट पुनः खोलने के लिए 2 नागरिक आपत्तियां आवश्यक हैं।",
      disclaimerTitle: "4. स्पष्ट अनुमान अस्वीकरण",
      disclaimerBody: "अनुमानित जल बचत प्राथमिकता मीट्रिक है, सत्यापित बचत नहीं। डेमो टिकट सिम्युलेटेड हैं। उत्पादन में पिन प्रमाणीकरण को कॉग्निटो से बदला जाना चाहिए।",
      trailReported: "दर्ज किया गया",
      trailOpen: "खुला",
      trailProof: "मरम्मत प्रमाण",
      trailClosed: "बंद",
      beforePhotoBadge: "मरम्मत पूर्व फोटो",
      afterPhotoBadge: "मरम्मत पश्चात प्रमाण",
      demoGalleryBtn: "डेमो चित्र",
      photoUnavailable: "फोटो अनुपलब्ध",
      evidenceNotUploaded: "प्रमाण अपलोड नहीं है",
      pendingRepairProof: "मरम्मत प्रमाण लंबित",
      simulatedDemoBadge: "सिम्युलेटेड डेमो — उदाहरण, वास्तविक प्रमाण नहीं",
      simulatedRepairedNote: "मरम्मत किए गए पाइप का वैचारिक चित्रण · वास्तविक मरम्मत का प्रमाण नहीं",
      simulatedNoPhoto: "सिम्युलेटेड परिदृश्य — कोई डेमो फोटो संलग्न नहीं",
      curatedDemoViewBtn: "क्यूरेटेड डेमो (20)",
      allTicketsViewBtn: "सभी नगरपालिका टिकट"
    }
  };

  let currentLang = "en";

  // ============================================================================
  // CURATED DEMONSTRATION MANIFEST (EXACTLY 20 DISTINCT SCENARIOS ACROSS DELHI)
  // References existing simulated backend IDs while distributing markers across
  // plausible urban zones with balanced severities, flows, drinking status & states.
  // ============================================================================
  const CURATED_DEMO_MANIFEST = [
    {
      id: "sim-01-e09440b0",
      neighborhood: "Connaught Place (Inner Circle Radial 1)",
      lat: 28.6315,
      lng: 77.2167,
      flow: "gush",
      drinking: true,
      reporters: 5,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Major pressurized leak on primary municipal drinking line. Severe surface flooding.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 28500
    },
    {
      id: "sim-01-ddc73035",
      neighborhood: "Karol Bagh (Arya Samaj Road)",
      lat: 28.6520,
      lng: 77.1906,
      flow: "gush",
      drinking: true,
      reporters: 4,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "photo",
      notes: "Main feeder line rupture near market intersection. Water gushing across carriageway.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 24937.5
    },
    {
      id: "sim-01-2b998e42",
      neighborhood: "Lajpat Nagar (Central Market Gate 2)",
      lat: 28.5683,
      lng: 77.2433,
      flow: "steady",
      drinking: true,
      reporters: 3,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Steady flow from exposed distribution joint on pedestrian path.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 2812.5
    },
    {
      id: "sim-01-511fb29c",
      neighborhood: "Chanakyapuri (Diplomatic Enclave Gate 4)",
      lat: 28.5983,
      lng: 77.1931,
      flow: "drip",
      drinking: true,
      reporters: 2,
      status: "CLOSED",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      has_after_photo: true,
      after_photo_key: "sim-repaired",
      notes: "Drinking water connection joint repaired and verified by municipal crew.",
      leakage_estimate: { min_litres_per_day: 50, max_litres_per_day: 200, midpoint_litres_per_day: 125, flow_category: "drip" },
      priority_score: 234.375
    },
    {
      id: "sim-01-cc825c4f",
      neighborhood: "Hauz Khas (Sri Aurobindo Marg Junc)",
      lat: 28.5494,
      lng: 77.2001,
      flow: "gush",
      drinking: false,
      reporters: 4,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Non-potable irrigation distribution main breached along roadside median.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 16625
    },
    {
      id: "sim-01-926993a2",
      neighborhood: "Civil Lines (Rajpur Road)",
      lat: 28.6814,
      lng: 77.2228,
      flow: "steady",
      drinking: false,
      reporters: 2,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Steady runoff from secondary municipal line valve casing.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 1562.5
    },
    {
      id: "sim-02-81bd4351",
      neighborhood: "Rohini (Sector 7 Metro Station)",
      lat: 28.7159,
      lng: 77.1189,
      flow: "gush",
      drinking: true,
      reporters: 6,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "photo",
      notes: "Ruptured 200mm drinking water main with severe road subsidence.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 32062.5
    },
    {
      id: "sim-02-da04fea3",
      neighborhood: "Dwarka (Sector 10 Main Market)",
      lat: 28.5810,
      lng: 77.0597,
      flow: "steady",
      drinking: true,
      reporters: 3,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Sub-surface leak surfacing at stormwater curb cut.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 2812.5
    },
    {
      id: "sim-02-8a64335a",
      neighborhood: "Mayur Vihar (Phase 1 Pocket 1)",
      lat: 28.6080,
      lng: 77.2950,
      flow: "drip",
      drinking: false,
      reporters: 1,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Continuous drip from municipal supply meter box.",
      leakage_estimate: { min_litres_per_day: 50, max_litres_per_day: 200, midpoint_litres_per_day: 125, flow_category: "drip" },
      priority_score: 125
    },
    {
      id: "sim-02-23b5c027",
      neighborhood: "Saket (District Centre Press Enclave)",
      lat: 28.5284,
      lng: 77.2185,
      flow: "steady",
      drinking: true,
      reporters: 3,
      status: "CLOSED",
      dispute_count: 1,
      is_simulated: true,
      asset_type: "photo",
      has_after_photo: true,
      after_photo_key: "sim-repaired",
      notes: "Repaired pipe clamp installed by DJB repair crew. 1 citizen dispute logged.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 2812.5
    },
    {
      id: "sim-02-be4f1d35",
      neighborhood: "Paharganj (Main Bazaar Chowk)",
      lat: 28.6427,
      lng: 77.2142,
      flow: "gush",
      drinking: false,
      reporters: 5,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "High pressure burst behind commercial lane. Rapid runoff accumulation.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 19000
    },
    {
      id: "sim-02-f5474188",
      neighborhood: "Greater Kailash (M-Block Market)",
      lat: 28.5447,
      lng: 77.2428,
      flow: "steady",
      drinking: true,
      reporters: 2,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Steady stream from potable service pipe near pedestrian arcade.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 2343.75
    },
    {
      id: "sim-04-54686bb8",
      neighborhood: "Chandni Chowk (Red Fort West)",
      lat: 28.6562,
      lng: 77.2309,
      flow: "gush",
      drinking: true,
      reporters: 4,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "photo",
      notes: "Heavy gushing leak on high-density heritage pipeline corridor.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 24937.5
    },
    {
      id: "sim-04-2a55f475",
      neighborhood: "Vasant Kunj (Nelson Mandela Marg)",
      lat: 28.5355,
      lng: 77.1578,
      flow: "drip",
      drinking: true,
      reporters: 2,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Minor leak in residential delivery branch line.",
      leakage_estimate: { min_litres_per_day: 50, max_litres_per_day: 200, midpoint_litres_per_day: 125, flow_category: "drip" },
      priority_score: 234.375
    },
    {
      id: "sim-04-1dafd2b0",
      neighborhood: "Pitampura (Netaji Subhash Place)",
      lat: 28.6946,
      lng: 77.1491,
      flow: "steady",
      drinking: false,
      reporters: 3,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Municipal raw water transmission pipe joint leaking steadily.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 1875
    },
    {
      id: "sim-04-42246ad5",
      neighborhood: "Nizamuddin East (Mathura Rd Flyover)",
      lat: 28.5888,
      lng: 77.2486,
      flow: "drip",
      drinking: false,
      reporters: 1,
      status: "CLOSED",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      has_after_photo: true,
      after_photo_key: "sim-repaired",
      notes: "Non-potable bypass line valve packing tightened and sealed.",
      leakage_estimate: { min_litres_per_day: 50, max_litres_per_day: 200, midpoint_litres_per_day: 125, flow_category: "drip" },
      priority_score: 125
    },
    {
      id: "sim-04-39ae4006",
      neighborhood: "Janakpuri (District Centre Complex)",
      lat: 28.6297,
      lng: 77.0825,
      flow: "steady",
      drinking: true,
      reporters: 4,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Potable line fracture leaking into service utility duct.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 3281.25
    },
    {
      id: "sim-04-0a0c7809",
      neighborhood: "Shahdara (GT Road Main)",
      lat: 28.6738,
      lng: 77.2882,
      flow: "gush",
      drinking: false,
      reporters: 3,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Pressurized industrial supply line breach near railway crossing.",
      leakage_estimate: { min_litres_per_day: 4000, max_litres_per_day: 15000, midpoint_litres_per_day: 9500, flow_category: "gush" },
      priority_score: 14250
    },
    {
      id: "sim-03-78311db6",
      neighborhood: "New Friends Colony (Community Centre)",
      lat: 28.5630,
      lng: 77.2690,
      flow: "steady",
      drinking: false,
      reporters: 2,
      status: "OPEN",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "vector",
      notes: "Steady trickle from utility main access hatch.",
      leakage_estimate: { min_litres_per_day: 500, max_litres_per_day: 2000, midpoint_litres_per_day: 1250, flow_category: "steady" },
      priority_score: 1562.5
    },
    {
      id: "sim-03-2b57cf42",
      neighborhood: "Delhi Cantt (Jail Road Junction)",
      lat: 28.6019,
      lng: 77.1264,
      flow: "drip",
      drinking: true,
      reporters: 1,
      status: "CLOSED",
      dispute_count: 0,
      is_simulated: true,
      asset_type: "photo",
      has_after_photo: true,
      after_photo_key: "sim-repaired",
      notes: "Service riser sleeve repaired with heavy duty clamp. Verified closed.",
      leakage_estimate: { min_litres_per_day: 50, max_litres_per_day: 200, midpoint_litres_per_day: 125, flow_category: "drip" },
      priority_score: 187.5
    }
  ];

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const state = {
    selectedLat: 28.6139,
    selectedLng: 77.2090,
    selectedFlow: "drip",
    selectedDrinking: false,
    selectedPhotoFile: null,
    locationSource: "demo", // "demo", "clicked", "gps"
    tickets: [],
    closedTickets: [], // Retains closed tickets for trail and dispute flows
    filter: "all",
    viewMode: "curated", // "curated" (20 representative leaks) or "all" (complete municipal queue)
    searchQuery: "",
    lastUpdated: null,
    closingTicketId: null,
    closingPhotoFile: null,
    pollingTimer: null,
    hasAnimatedLedger: false
  };

  // Dedicated helper to resolve visible tickets based on view mode (curated vs all)
  function getVisibleTickets() {
    const allBackendTickets = [...state.tickets, ...state.closedTickets];
    const realCitizenTickets = allBackendTickets.filter((t) => !t.is_simulated);

    if (state.viewMode === "all") {
      return allBackendTickets;
    }

    // Curated demo view (exactly 20 simulated demo tickets + any genuine citizen submissions)
    const curated = CURATED_DEMO_MANIFEST.map((demoTicket) => {
      const liveMatch = allBackendTickets.find((t) => t.id === demoTicket.id);
      if (liveMatch) {
        return {
          ...demoTicket,
          status: liveMatch.status || demoTicket.status,
          dispute_count: liveMatch.dispute_count !== undefined ? liveMatch.dispute_count : demoTicket.dispute_count,
          after_photo_key: liveMatch.after_photo_key || demoTicket.after_photo_key,
          has_after_photo: liveMatch.has_after_photo !== undefined ? liveMatch.has_after_photo : demoTicket.has_after_photo,
          closed_at: liveMatch.closed_at || demoTicket.closed_at
        };
      }
      return demoTicket;
    });

    return [...realCitizenTickets, ...curated];
  }

  // ============================================================================
  // UNIFIED API HELPER
  // ============================================================================
  function getApiBaseUrl() {
    const configured = (window.BOOND && window.BOOND.API) || "";
    return configured.trim().replace(/\/+$/, "");
  }

  function getEngineerPin() {
    // PIN is saved strictly in sessionStorage as per security guidelines
    return sessionStorage.getItem("boond_engineer_pin") || "";
  }

  function setEngineerPin(pin) {
    if (pin) {
      sessionStorage.setItem("boond_engineer_pin", pin.trim());
    } else {
      sessionStorage.removeItem("boond_engineer_pin");
    }
    updateEngineerUIState();
    renderTickets();
  }

  async function apiRequest(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error("API_NOT_CONFIGURED");
    }

    const url = `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const pin = getEngineerPin();
    if (pin) {
      headers["X-Boond-Pin"] = pin;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorObj = new Error(data.message || `HTTP ${response.status}`);
        errorObj.status = response.status;
        errorObj.data = data;
        throw errorObj;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Request timed out (12s)");
      }
      throw err;
    }
  }

  // ============================================================================
  // TOAST NOTIFICATIONS
  // ============================================================================
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
      <button type="button" style="border:none; background:transparent; font-weight:900; cursor:pointer;" aria-label="Dismiss">✕</button>
    `;

    toast.querySelector("button").addEventListener("click", () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ============================================================================
  // STATUS INDICATOR
  // ============================================================================
  function updateConnectionStatus(status) {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    if (!dot || !text) return;

    dot.className = `status-dot ${status}`;
    const dict = I18N[currentLang];

    if (status === "connected") {
      text.textContent = dict.statusOnline;
    } else if (status === "demo") {
      text.textContent = dict.statusDemo;
    } else if (status === "error") {
      text.textContent = dict.statusError;
    } else {
      text.textContent = dict.statusOffline;
    }
  }

  function updateEngineerUIState() {
    const pin = getEngineerPin();
    const engineerBtn = document.getElementById("engineer-mode-btn");
    const seedBtn = document.getElementById("seed-demo-btn");
    const dict = I18N[currentLang];

    if (pin) {
      if (engineerBtn) {
        engineerBtn.className = "btn btn-spray";
        engineerBtn.innerHTML = `<span>✓ ${dict.engineerActive}</span>`;
      }
      if (seedBtn) seedBtn.style.display = "inline-flex";
    } else {
      if (engineerBtn) {
        engineerBtn.className = "btn btn-ink";
        engineerBtn.innerHTML = `<span>${dict.engineerBtn}</span>`;
      }
      if (seedBtn) seedBtn.style.display = "none";
    }
  }

  // ============================================================================
  // LEAFLET MAP SETUP & MARKERS
  // ============================================================================
  // ============================================================================
  // LEAFLET MAP SETUP & MARKERS
  // ============================================================================
  let leafletMap = null;
  let selectedMarker = null;
  let ticketMarkersGroup = null;
  const ticketMarkersMap = new Map();

  function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement || typeof L === "undefined") return;

    leafletMap = L.map("map", {
      center: [state.selectedLat, state.selectedLng],
      zoom: 13
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(leafletMap);

    ticketMarkersGroup = L.layerGroup().addTo(leafletMap);

    // Initial selected coordinate marker (Explicit default demo location)
    updateSelectedPin(state.selectedLat, state.selectedLng, "demo");

    // Map click handler to pick report location
    leafletMap.on("click", (e) => {
      updateSelectedPin(e.latlng.lat, e.latlng.lng, "clicked");
    });

    // Handle "Use my location"
    const locateBtn = document.getElementById("locate-me-btn");
    if (locateBtn) {
      locateBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
          showToast("Geolocation is not supported by your browser", "error");
          return;
        }

        locateBtn.disabled = true;
        locateBtn.textContent = "LOCATING...";

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locateBtn.disabled = false;
            locateBtn.textContent = `🎯 ${I18N[currentLang].locateBtn}`;
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            updateSelectedPin(lat, lng, "gps");
            leafletMap.setView([lat, lng], 15);
            showToast("Location updated from confirmed GPS coordinates", "info");
          },
          (err) => {
            locateBtn.disabled = false;
            locateBtn.textContent = `🎯 ${I18N[currentLang].locateBtn}`;
            showToast(`Location access denied or unavailable: ${err.message}`, "error");
          },
          { timeout: 8000 }
        );
      });
    }
  }

  function updateSelectedPin(lat, lng, source = "clicked") {
    state.selectedLat = parseFloat(lat.toFixed(6));
    state.selectedLng = parseFloat(lng.toFixed(6));
    state.locationSource = source;

    const coordsDisplay = document.getElementById("coords-text");
    if (coordsDisplay) {
      coordsDisplay.textContent = `Lat: ${state.selectedLat.toFixed(5)}, Lng: ${state.selectedLng.toFixed(5)}`;
    }

    const sourceTag = document.getElementById("coords-source-tag");
    const dict = I18N[currentLang];
    if (sourceTag) {
      if (source === "gps") {
        sourceTag.className = "sticker sticker-spray";
        sourceTag.textContent = dict.locationGpsTag || "🎯 GPS CONFIRMED (DEVICE)";
      } else if (source === "clicked") {
        sourceTag.className = "sticker sticker-paper";
        sourceTag.textContent = dict.locationClickedTag || "👆 MAP CLICKED POINT";
      } else {
        sourceTag.className = "sticker sticker-paper";
        sourceTag.textContent = dict.locationDemoTag || "📍 DEMO REFERENCE (DELHI)";
      }
    }

    if (!leafletMap) return;

    const squareIcon = L.divIcon({
      className: "leaflet-marker-square drip",
      html: "📍",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (selectedMarker) {
      selectedMarker.setLatLng([state.selectedLat, state.selectedLng]);
    } else {
      selectedMarker = L.marker([state.selectedLat, state.selectedLng], {
        icon: squareIcon,
        draggable: true
      }).addTo(leafletMap);

      selectedMarker.on("dragend", (e) => {
        const pt = e.target.getLatLng();
        updateSelectedPin(pt.lat, pt.lng, "clicked");
      });
    }
  }

  function renderMapTickets(allTickets = null) {
    if (!leafletMap || !ticketMarkersGroup) return;
    ticketMarkersGroup.clearLayers();
    ticketMarkersMap.clear();

    const ticketsToDisplay = allTickets || getVisibleTickets();

    ticketsToDisplay.forEach((t) => {
      if (!t.lat || !t.lng) return;

      const isClosed = t.status === "CLOSED";
      const flow = (t.flow || "drip").toLowerCase();
      let iconClass = isClosed ? "closed" : flow;
      if (t.is_simulated) {
        iconClass += " simulated";
      }

      let label = isClosed ? "✓" : flow[0].toUpperCase();

      const markerIcon = L.divIcon({
        className: `leaflet-marker-square ${iconClass}`,
        html: `<span>${label}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([t.lat, t.lng], { icon: markerIcon });
      const estMidpoint = t.leakage_estimate?.midpoint_litres_per_day || "~";
      const locationText = t.neighborhood || `Lat: ${Number(t.lat).toFixed(4)}, Lng: ${Number(t.lng).toFixed(4)}`;

      marker.bindPopup(`
        <div style="font-family: var(--font-body); padding: 4px;">
          <strong style="text-transform: uppercase;"># ${escapeHtml(t.id)}</strong><br>
          <span style="font-size:11px; color:#555;">📍 ${escapeHtml(locationText)}</span><br>
          <span>Flow: ${escapeHtml(t.flow).toUpperCase()}</span><br>
          ${t.drinking ? '<span style="color:var(--drip); font-weight:700;">🚰 DRINKING WATER LINE</span><br>' : ''}
          <span>Reporters: ${escapeHtml(t.reporters || 1)}</span><br>
          <span>Est. Flow: ~${escapeHtml(estMidpoint)} L/d (Midpoint)</span><br>
          ${t.is_simulated ? '<span style="background:#FFE600; font-size:10px; font-weight:700; padding:1px 4px;">SIMULATED</span><br>' : ''}
          <span style="font-weight:700; color:${isClosed ? 'var(--ink)' : 'var(--drip)'}">${t.status}</span>
        </div>
      `);

      // Marker click synchronisation: trigger ripple & scroll ticket in queue
      marker.on("click", () => {
        const el = marker.getElement();
        if (el) {
          el.classList.add("ripple-active");
          setTimeout(() => el.classList.remove("ripple-active"), 1200);
        }
        highlightTicketInQueue(t.id);
      });

      ticketMarkersGroup.addLayer(marker);
      ticketMarkersMap.set(t.id, marker);
    });
  }

  function selectTicketOnMap(ticketId) {
    if (!leafletMap) return;
    const marker = ticketMarkersMap.get(ticketId);
    const visible = getVisibleTickets();
    const ticket = visible.find((t) => t.id === ticketId);
    if (ticket && marker) {
      leafletMap.setView([ticket.lat, ticket.lng], Math.max(leafletMap.getZoom(), 14), { animate: true });
      marker.openPopup();
      const el = marker.getElement();
      if (el) {
        el.classList.add("ripple-active");
        setTimeout(() => el.classList.remove("ripple-active"), 1200);
      }
      showToast(`Focused ticket #${ticketId.substring(0, 8)} on municipal map`, "info");
    }
  }

  function highlightTicketInQueue(ticketId) {
    const card = document.getElementById(`card-${ticketId}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("highlight-selected-ticket");
      setTimeout(() => card.classList.remove("highlight-selected-ticket"), 3000);
    }
  }

  function triggerMascotReaction(type = "report") {
    const mascotBox = document.getElementById("boondy-mascot-box");
    const bubble = document.getElementById("mascot-bubble");
    if (!mascotBox) return;

    mascotBox.classList.add("cheer");
    if (bubble) {
      bubble.textContent = type === "close" ? "FIXED! ✓" : "REPORTED! 💧";
    }

    setTimeout(() => {
      mascotBox.classList.remove("cheer");
      if (bubble) {
        bubble.textContent = "FIELD READY";
      }
    }, 2500);
  }

  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      if (onSuccess) onSuccess();
    } catch {
      showToast("Unable to copy automatically. Please copy manually.", "error");
    } finally {
      ta.remove();
    }
  }

  function updateLastUpdatedIndicator() {
    const el = document.getElementById("queue-last-updated");
    if (!el) return;
    const dict = I18N[currentLang];
    const prefix = dict.queueUpdated || "Last updated:";
    if (!getApiBaseUrl()) {
      el.textContent = `${prefix} OFFLINE PREVIEW`;
      return;
    }
    if (!state.lastUpdated) {
      el.textContent = `${prefix} Waiting for refresh...`;
      return;
    }
    const timeStr = state.lastUpdated.toLocaleTimeString();
    el.textContent = `${prefix} ${timeStr}`;
  }

  // ============================================================================
  // SECTION 2: REPORT SUBMISSION FLOW
  // ============================================================================
  function setupReportForm() {
    // Flow selector buttons
    const flowButtons = document.querySelectorAll(".flow-btn");
    flowButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        flowButtons.forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-checked", "true");
        state.selectedFlow = btn.getAttribute("data-flow");
      });
    });

    // Drinking water toggle
    const drinkingToggle = document.getElementById("drinking-toggle");
    if (drinkingToggle) {
      drinkingToggle.addEventListener("change", (e) => {
        state.selectedDrinking = e.target.checked;
      });
    }

    // Photo input
    const photoInput = document.getElementById("report-photo-input");
    const photoLabelText = document.getElementById("file-chosen-text");
    if (photoInput) {
      photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        state.selectedPhotoFile = file || null;
        if (photoLabelText) {
          photoLabelText.textContent = file ? `✓ ${file.name} (${Math.round(file.size / 1024)} KB)` : I18N[currentLang].photoPrompt;
        }
      });
    }

    // Submit button
    const submitBtn = document.getElementById("submit-report-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", handleReportSubmit);
    }
  }

  async function handleReportSubmit() {
    const submitBtn = document.getElementById("submit-report-btn");
    const dict = I18N[currentLang];
    const baseUrl = getApiBaseUrl();

    if (!baseUrl) {
      showToast("API not configured. Set API URL in frontend/config.js to submit live reports.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = dict.submittingReport;

    try {
      let photoKey = null;

      // S3 Presigned URL Upload Flow if photo was selected
      if (state.selectedPhotoFile) {
        showToast("Requesting S3 presigned upload URL...", "info");
        const presignedData = await apiRequest("/photo-url", {
          method: "POST",
          body: JSON.stringify({ kind: "before", content_type: state.selectedPhotoFile.type || "image/jpeg" })
        });

        if (!presignedData.upload_url || !presignedData.key) {
          throw new Error("Invalid presigned URL response from server");
        }

        // Direct S3 PUT upload
        showToast("Uploading photo binary to S3...", "info");
        const putRes = await fetch(presignedData.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": state.selectedPhotoFile.type || "image/jpeg"
          },
          body: state.selectedPhotoFile
        });

        if (!putRes.ok) {
          throw new Error(`S3 direct PUT upload failed with status ${putRes.status}`);
        }

        photoKey = presignedData.key;
      }

      // Submit report to backend
      const payload = {
        lat: state.selectedLat,
        lng: state.selectedLng,
        flow: state.selectedFlow,
        drinking: state.selectedDrinking,
        photo_key: photoKey
      };

      const result = await apiRequest("/reports", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (result.merged) {
        showToast(`Merged with an existing report within 30m! (${result.ticket?.id || ""})`, "success");
      } else {
        showToast(`New leak added to municipal queue! (#${result.ticket?.id || ""})`, "success");
      }

      // Celebrate with mascot reaction
      triggerMascotReaction("report");

      // Reset photo field
      state.selectedPhotoFile = null;
      const photoInput = document.getElementById("report-photo-input");
      if (photoInput) photoInput.value = "";
      const photoLabelText = document.getElementById("file-chosen-text");
      if (photoLabelText) photoLabelText.textContent = dict.photoPrompt;

      // Refresh tickets
      await loadTickets();
    } catch (err) {
      console.error("Report submission failed:", err);
      showToast(`Submission failed: ${err.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = `🚀 ${dict.submitReportBtn}`;
    }
  }

  // ============================================================================
  // SECTION 3: RANKED QUEUE & REPAIR EVIDENCE TRAIL
  // ============================================================================
  async function loadTickets() {
    const container = document.getElementById("tickets-container");
    const baseUrl = getApiBaseUrl();

    if (!baseUrl) {
      updateConnectionStatus("disconnected");
      if (container) {
        container.innerHTML = `
          <div class="unconfigured-card">
            <span class="unconfigured-tag">OFFLINE PREVIEW MODE</span>
            <h3 style="font-size: 24px;">API NOT CONFIGURED</h3>
            <p style="font-weight:600; color:#333; max-width:650px; margin:0 auto;">
              The frontend is currently unconfigured and not connected to an AWS API Gateway endpoint.
              Live tickets, Cedar authorization evaluations, and impact statistics require a backend URL.
            </p>
            <div class="unconfigured-code">
              // To connect your backend, configure frontend/config.js:<br>
              window.BOOND = {<br>
              &nbsp;&nbsp;API: "https://&lt;api-id&gt;.execute-api.&lt;region&gt;.amazonaws.com"<br>
              };
            </div>
            <p style="font-size:13px; color:#555; font-weight:700;">
              No fake data or synthetic submissions will be fabricated in offline mode.
            </p>
          </div>
        `;
      }
      updateNowFixingBar([]);
      updateLedgerMetrics([], null);
      updateLastUpdatedIndicator();
      return;
    }

    try {
      const data = await apiRequest("/tickets");
      state.tickets = data.tickets || [];
      updateConnectionStatus("connected");

      // Merge with any locally tracked closed tickets from close/seed
      const combined = [...state.tickets];
      state.closedTickets.forEach((ct) => {
        if (!combined.some((t) => t.id === ct.id)) {
          combined.push(ct);
        }
      });

      state.lastUpdated = new Date();
      updateLastUpdatedIndicator();

      renderTickets();
      renderMapTickets();
      updateNowFixingBar(getVisibleTickets());

      // Attempt GET /ledger or compute from tickets
      await loadLedger(getVisibleTickets());
    } catch (err) {
      console.warn("Failed to fetch tickets from backend:", err);
      updateConnectionStatus("error");
      updateLastUpdatedIndicator();
      if (container) {
        container.innerHTML = `
          <div class="slab" style="padding: 32px; grid-column: 1 / -1; text-align: center; border-color: var(--alarm);">
            <h3 style="color: var(--alarm); margin-bottom: 8px;">UNABLE TO REACH BOOND API</h3>
            <p style="font-weight:600;">Check network connection or API URL in <code>frontend/config.js</code>.</p>
            <small style="color:#777;">${escapeHtml(err.message)}</small>
          </div>
        `;
      }
    }
  }

  function renderTickets(ticketsToRender = null) {
    const container = document.getElementById("tickets-container");
    if (!container) return;

    const source = ticketsToRender || getVisibleTickets();
    let filtered = source;

    if (state.filter === "open") {
      filtered = filtered.filter((t) => t.status === "OPEN");
    } else if (state.filter === "fixed" || state.filter === "closed") {
      filtered = filtered.filter((t) => t.status === "CLOSED");
    } else if (state.filter === "gush") {
      filtered = filtered.filter((t) => (t.flow || "").toLowerCase() === "gush");
    } else if (state.filter === "drinking") {
      filtered = filtered.filter((t) => t.drinking === true);
    } else if (state.filter === "simulated") {
      filtered = filtered.filter((t) => t.is_simulated === true);
    }

    if (state.searchQuery && state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      filtered = filtered.filter((t) => {
        const idMatch = (t.id || "").toLowerCase().includes(q);
        const flowMatch = (t.flow || "").toLowerCase().includes(q);
        const statusMatch = (t.status || "").toLowerCase().includes(q);
        const neighborhoodMatch = (t.neighborhood || "").toLowerCase().includes(q);
        const latLngMatch = `${t.lat},${t.lng}`.includes(q);
        return idMatch || flowMatch || statusMatch || neighborhoodMatch || latLngMatch;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="slab" style="padding: 32px; grid-column: 1 / -1; text-align: center;">
          <p style="font-weight: 700;">${I18N[currentLang].noTicketsFound}</p>
        </div>
      `;
      return;
    }

    const isEngineer = Boolean(getEngineerPin());

    container.innerHTML = filtered
      .map((t, idx) => {
        const rank = idx + 1;
        const flow = (t.flow || "drip").toLowerCase();
        const estMin = t.leakage_estimate?.min_litres_per_day || 0;
        const estMax = t.leakage_estimate?.max_litres_per_day || 0;
        const estMid = t.leakage_estimate?.midpoint_litres_per_day || 0;
        const isClosed = t.status === "CLOSED";
        const hasAfterProof = Boolean(t.has_after_photo || t.after_photo_key || t.after_photo_url);
        const isSimulated = t.is_simulated === true;
        const disputes = t.dispute_count || 0;
        const latStr = Number(t.lat || 0).toFixed(5);
        const lngStr = Number(t.lng || 0).toFixed(5);

        // Before Photo Rendering: Deterministic visual asset for simulated scenarios; genuine S3 evidence or placeholder for real reports
        let beforePhotoHtml = "";
        if (isSimulated) {
          if (t.asset_type === "photo") {
            beforePhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label">📷 ${I18N[currentLang].beforePhotoBadge}</span>
                <div class="demo-photo-container">
                  <img src="assets/active-leak-pipe.png" alt="Simulated active leak documentary photo" class="ticket-photo-thumb demo-svg-thumb photo" loading="lazy">
                  <div class="demo-illustration-badge" title="Simulated illustration for demonstration">
                    ⚠️ ${I18N[currentLang].simulatedDemoBadge}
                  </div>
                  <span class="demo-disclaimer-sub">AI-generated documentary photo · Synthetic demo data</span>
                </div>
              </div>
            `;
          } else {
            beforePhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label">📷 ${I18N[currentLang].beforePhotoBadge}</span>
                <div class="demo-photo-container">
                  <img src="assets/demo-leaking-pipe.svg" alt="Simulated leaking municipal water pipe vector illustration" class="ticket-photo-thumb demo-svg-thumb" loading="lazy">
                  <div class="demo-illustration-badge" title="Simulated illustration for demonstration">
                    ⚠️ ${I18N[currentLang].simulatedDemoBadge}
                  </div>
                  <span class="demo-disclaimer-sub">Vector illustration · Synthetic demo data</span>
                </div>
              </div>
            `;
          }
        } else {
          // Real citizen report: genuine evidence or graceful placeholder. Never replace with illustrations.
          if (t.before_photo_url) {
            beforePhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label">📷 ${I18N[currentLang].beforePhotoBadge}</span>
                <img src="${escapeHtml(t.before_photo_url)}" alt="Before repair leak photo" class="ticket-photo-thumb" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'photo-badge-label\\'>📷 ${escapeHtml(I18N[currentLang].beforePhotoBadge)}</span><div class=\\'photo-placeholder-box\\'><span class=\\'photo-placeholder-icon\\'>📷</span><span class=\\'photo-placeholder-text\\'>${escapeHtml(I18N[currentLang].photoUnavailable)}</span></div>';">
              </div>
            `;
          } else {
            beforePhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label">📷 ${I18N[currentLang].beforePhotoBadge}</span>
                <div class="photo-placeholder-box">
                  <span class="photo-placeholder-icon">📷</span>
                  <span class="photo-placeholder-text">${I18N[currentLang].evidenceNotUploaded}</span>
                </div>
              </div>
            `;
          }
        }

        // After Photo Rendering: Display SVG/photo ONLY if explicitly simulated with after-repair metadata; otherwise graceful placeholder
        let afterPhotoHtml = "";
        if (isSimulated) {
          const hasSimAfter = Boolean(t.after_photo_key || t.has_after_photo);
          if (hasSimAfter) {
            const afterImgSrc = t.asset_type === "photo" ? "assets/repaired-pipe-joint.png" : "assets/demo-repaired-pipe.svg";
            const afterImgClass = t.asset_type === "photo" ? "ticket-photo-thumb demo-svg-thumb photo" : "ticket-photo-thumb demo-svg-thumb";
            afterPhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                <div class="demo-photo-container">
                  <img src="${afterImgSrc}" alt="Simulated repaired municipal pipe illustration with sealed joint" class="${afterImgClass}" loading="lazy">
                  <div class="demo-illustration-badge demo-repaired" title="Simulated illustration for demonstration">
                    ✓ ${I18N[currentLang].simulatedDemoBadge}
                  </div>
                  <span class="demo-disclaimer-sub">${I18N[currentLang].simulatedRepairedNote}</span>
                </div>
              </div>
            `;
          } else if (isClosed) {
            afterPhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                <div class="photo-placeholder-box simulated">
                  <span class="photo-placeholder-icon">📸</span>
                  <span class="photo-placeholder-text">${I18N[currentLang].photoUnavailable}</span>
                </div>
              </div>
            `;
          } else {
            afterPhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                <div class="photo-placeholder-box pending">
                  <span class="photo-placeholder-icon">⏳</span>
                  <span class="photo-placeholder-text">${I18N[currentLang].pendingRepairProof}</span>
                </div>
              </div>
            `;
          }
        } else {
          // Real citizen report
          if (isClosed) {
            if (t.after_photo_url) {
              afterPhotoHtml = `
                <div class="photo-evidence-item">
                  <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                  <img src="${escapeHtml(t.after_photo_url)}" alt="After repair proof photo" class="ticket-photo-thumb" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'photo-badge-label after\\'>📸 ${escapeHtml(I18N[currentLang].afterPhotoBadge)}</span><div class=\\'photo-placeholder-box\\'><span class=\\'photo-placeholder-icon\\'>📸</span><span class=\\'photo-placeholder-text\\'>${escapeHtml(I18N[currentLang].photoUnavailable)}</span></div>';">
                </div>
              `;
            } else {
              afterPhotoHtml = `
                <div class="photo-evidence-item">
                  <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                  <div class="photo-placeholder-box">
                    <span class="photo-placeholder-icon">📸</span>
                    <span class="photo-placeholder-text">${I18N[currentLang].photoUnavailable}</span>
                  </div>
                </div>
              `;
            }
          } else {
            afterPhotoHtml = `
              <div class="photo-evidence-item">
                <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                <div class="photo-placeholder-box pending">
                  <span class="photo-placeholder-icon">⏳</span>
                  <span class="photo-placeholder-text">${I18N[currentLang].pendingRepairProof}</span>
                </div>
              </div>
            `;
          }
        }

        return `
          <article class="ticket-card" id="card-${escapeHtml(t.id)}" data-id="${escapeHtml(t.id)}">
            <div>
              <div class="ticket-top-row">
                <span class="ticket-rank-box">#${rank}</span>
                <div class="ticket-badges">
                  <!-- Flow Severity Badge -->
                  <span class="sticker sticker-${flow === 'gush' ? 'alarm' : flow === 'steady' ? 'drip' : 'spray'}">
                    ${flow === 'gush' ? '💥 GUSH' : flow === 'steady' ? '🌊 STEADY' : '💧 DRIP'}
                  </span>

                  <!-- Water Priority Cue: ONLY on drinking water tickets -->
                  ${t.drinking ? `
                    <span class="drinking-priority-badge">
                      🚰 ${I18N[currentLang].drinkingPriorityBadge}
                    </span>
                  ` : ''}

                  ${isClosed ? '<span class="sticker sticker-ink">CLOSED ✓</span>' : '<span class="sticker sticker-spray">OPEN</span>'}
                  ${isSimulated ? '<span class="sticker sticker-simulated">SIMULATED</span>' : ''}
                </div>
              </div>

              <div class="ticket-location-row">
                <span class="ticket-id">ID: ${escapeHtml(t.id)}</span>
                <div class="ticket-coords-tools">
                  <span class="ticket-location-tag">📍 ${t.neighborhood ? escapeHtml(t.neighborhood) : `${latStr}°, ${lngStr}°`}</span>
                  <button type="button" class="btn-mini-tool btn-copy-coords" data-coords="${latStr}, ${lngStr}" title="Copy ticket coordinates" aria-label="Copy coordinates for ticket ${escapeHtml(t.id)}">
                    📋 ${I18N[currentLang].copyCoordsBtn || 'COPY'}
                  </button>
                  <button type="button" class="btn-mini-tool btn-show-map" data-id="${escapeHtml(t.id)}" title="Focus on municipal map" aria-label="Focus ticket ${escapeHtml(t.id)} on map">
                    🗺️ ${I18N[currentLang].showOnMapBtn || 'MAP'}
                  </button>
                </div>
              </div>
              ${isSimulated ? `
                <div style="font-size: 11px; color: #555; font-weight: 600; margin-top: 3px;">
                  ⚠️ <em>Simulated scenario for demonstration. Coordinates represent urban neighborhood reference (${latStr}°, ${lngStr}°), not a verified real-world leak.</em>
                </div>
              ` : ''}
            </div>

            <!-- REPAIR EVIDENCE TRAIL: Compact progression using real backend fields -->
            <div class="evidence-trail" aria-label="Repair Evidence Trail">
              <div class="trail-step completed" title="Reported at ${escapeHtml(t.created_at || 'now')}">
                <span class="trail-dot">✓</span>
                <span class="trail-text">${I18N[currentLang].trailReported}</span>
              </div>
              <span class="trail-arrow">→</span>
              <div class="trail-step ${isClosed ? 'completed' : 'active'}" title="Active in triage queue">
                <span class="trail-dot">✓</span>
                <span class="trail-text">${I18N[currentLang].trailOpen}</span>
              </div>
              <span class="trail-arrow">→</span>
              <div class="trail-step ${hasAfterProof ? 'completed' : 'pending'}" title="${hasAfterProof ? 'After-repair photo verified' : 'Awaiting repair proof'}">
                <span class="trail-dot">${hasAfterProof ? '✓' : '○'}</span>
                <span class="trail-text">${I18N[currentLang].trailProof}</span>
              </div>
              <span class="trail-arrow">→</span>
              <div class="trail-step ${isClosed ? 'completed' : 'pending'}" title="${isClosed ? 'Closed following Cedar authorization' : 'Pending resolution'}">
                <span class="trail-dot">${isClosed ? '✓' : '○'}</span>
                <span class="trail-text">${I18N[currentLang].trailClosed}</span>
              </div>
            </div>

            <!-- Photo Evidence Grid -->
            <div class="photo-evidence-grid">
              ${beforePhotoHtml}
              ${afterPhotoHtml}
            </div>

            <!-- Estimated Leakage Metrics -->
            <div class="ticket-metric-box">
              <span class="ticket-rate-label">ESTIMATED DAILY LEAKAGE (NOT VERIFIED WATER SAVINGS)</span>
              <span class="ticket-rate-val">${Number(estMin).toLocaleString()} – ${Number(estMax).toLocaleString()} L/d</span>
              <small style="font-size:10px; color:#555;">
                Midpoint: ~${Number(estMid).toLocaleString()} L/d · Priority Score: ${escapeHtml(t.priority_score || 'N/A')}
              </small>
            </div>

            <div class="ticket-details-row">
              <span>👥 ${escapeHtml(t.reporters || 1)} ${I18N[currentLang].reportersCount}</span>
              <span>Disputes: ${disputes}/2</span>
            </div>

            <!-- Denial display container if close was rejected -->
            <div id="denial-${escapeHtml(t.id)}" style="display:none;" class="cedar-denial-box"></div>

            <div class="ticket-actions-row">
              <button type="button" class="btn btn-paper btn-why" data-id="${escapeHtml(t.id)}">
                ❓ ${I18N[currentLang].whyBtn}
              </button>

              ${!isClosed && isEngineer ? `
                <button type="button" class="btn btn-alarm btn-close-ticket" data-id="${escapeHtml(t.id)}">
                  🔒 ${I18N[currentLang].closeBtn}
                </button>
              ` : ''}

              ${isClosed ? `
                <button type="button" class="btn btn-ink btn-dispute-ticket" data-id="${escapeHtml(t.id)}">
                  ⚠️ ${I18N[currentLang].stillLeakingBtn} (${disputes}/2)
                </button>
              ` : ''}
            </div>
          </article>
        `;
      })
      .join("");

    // Attach Action Listeners
    container.querySelectorAll(".btn-why").forEach((btn) => {
      btn.addEventListener("click", () => openWhyDrawer(btn.getAttribute("data-id")));
    });

    container.querySelectorAll(".btn-close-ticket").forEach((btn) => {
      btn.addEventListener("click", () => openCloseModal(btn.getAttribute("data-id")));
    });

    container.querySelectorAll(".btn-dispute-ticket").forEach((btn) => {
      btn.addEventListener("click", () => handleDispute(btn.getAttribute("data-id")));
    });

    container.querySelectorAll(".btn-copy-coords").forEach((btn) => {
      btn.addEventListener("click", () => {
        const coords = btn.getAttribute("data-coords");
        copyToClipboard(coords, () => {
          btn.textContent = `✓ ${I18N[currentLang].coordsCopied || 'COPIED'}`;
          showToast(`Coordinates copied: ${coords}`, "info");
          setTimeout(() => {
            btn.textContent = `📋 ${I18N[currentLang].copyCoordsBtn || 'COPY'}`;
          }, 2000);
        });
      });
    });

    container.querySelectorAll(".btn-show-map").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectTicketOnMap(btn.getAttribute("data-id"));
      });
    });
  }

  // ============================================================================
  // SECTION 4: STICKY "NOW FIXING" BAR
  // ============================================================================
  function updateNowFixingBar(tickets) {
    const textEl = document.getElementById("now-fixing-text");
    const jumpBtn = document.getElementById("now-fixing-jump-btn");
    const dict = I18N[currentLang];

    const openTickets = tickets.filter((t) => t.status === "OPEN");
    if (openTickets.length === 0) {
      if (textEl) textEl.textContent = dict.noOpenLeaks;
      if (jumpBtn) jumpBtn.style.display = "none";
      return;
    }

    const topTicket = openTickets[0];
    const flowText = (topTicket.flow || "drip").toUpperCase();
    const lineText = topTicket.drinking ? "DRINKING WATER PRIORITY" : "NON-DRINKING";
    const midpointEst = topTicket.leakage_estimate?.midpoint_litres_per_day
      ? `~${Number(topTicket.leakage_estimate.midpoint_litres_per_day).toLocaleString()} L/DAY (EST.)`
      : "";

    if (textEl) {
      textEl.textContent = `#1 · ${flowText} · ${lineText} · ${midpointEst}`;
    }

    if (jumpBtn) {
      jumpBtn.style.display = "inline-flex";
      jumpBtn.onclick = () => {
        const targetCard = document.getElementById(`card-${topTicket.id}`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
          targetCard.classList.add("highlight-now-fixing");
          setTimeout(() => targetCard.classList.remove("highlight-now-fixing"), 3500);
        }
      };
    }
  }

  // ============================================================================
  // SECTION 5: BENTO IMPACT LEDGER
  // ============================================================================
  async function loadLedger(tickets) {
    let ledgerData = null;
    try {
      ledgerData = await apiRequest("/ledger");
    } catch {
      // Endpoint /ledger not implemented or 404, calculate from active tickets
      ledgerData = null;
    }

    updateLedgerMetrics(tickets, ledgerData);
  }

  function updateLedgerMetrics(tickets, serverLedger) {
    const addressedEl = document.getElementById("metric-addressed");
    const closedEl = document.getElementById("metric-closed");
    const mergedEl = document.getElementById("metric-merged");
    const openEl = document.getElementById("metric-open");

    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      if (addressedEl) addressedEl.textContent = "—";
      if (closedEl) closedEl.textContent = "—";
      if (mergedEl) mergedEl.textContent = "—";
      if (openEl) openEl.textContent = "—";
      return;
    }

    let estAddressed = 0;
    let closedCount = 0;
    let mergedCount = 0;
    let openCount = 0;

    if (serverLedger) {
      estAddressed = serverLedger.estimated_leakage_addressed_lpd || serverLedger.leakage_addressed || 0;
      closedCount = serverLedger.tickets_closed_with_proof || serverLedger.closed_tickets || 0;
      mergedCount = serverLedger.duplicate_reports_merged || serverLedger.merged_reports || 0;
      openCount = serverLedger.open_leaks || serverLedger.open_tickets || 0;
    } else {
      // Calculate from available tickets
      tickets.forEach((t) => {
        if (t.status === "CLOSED" && t.has_after_photo) {
          closedCount += 1;
          const mid = t.leakage_estimate?.midpoint_litres_per_day || 0;
          estAddressed += mid;
        } else if (t.status === "OPEN") {
          openCount += 1;
        }
        if (t.reporters && t.reporters > 1) {
          mergedCount += (t.reporters - 1);
        }
      });
    }

    if (!state.hasAnimatedLedger) {
      state.hasAnimatedLedger = true;
      animateCounter(addressedEl, estAddressed, " L/d");
      animateCounter(closedEl, closedCount, "");
      animateCounter(mergedEl, mergedCount, "");
      animateCounter(openEl, openCount, "");
    } else {
      if (addressedEl) addressedEl.textContent = `${Number(estAddressed).toLocaleString()} L/d`;
      if (closedEl) closedEl.textContent = Number(closedCount).toLocaleString();
      if (mergedEl) mergedEl.textContent = Number(mergedCount).toLocaleString();
      if (openEl) openEl.textContent = Number(openCount).toLocaleString();
    }
  }

  function animateCounter(element, target, suffix = "") {
    if (!element) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      element.textContent = `${Number(target).toLocaleString()}${suffix}`;
      return;
    }

    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(start + (target - start) * progress);
      element.textContent = `${Number(current).toLocaleString()}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${Number(target).toLocaleString()}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  // ============================================================================
  // ENGINEER MODE & TICKET CLOSURE
  // ============================================================================
  function setupEngineerModals() {
    const engineerModeBtn = document.getElementById("engineer-mode-btn");
    const modal = document.getElementById("engineer-modal");
    const closeBtn = document.getElementById("engineer-modal-close-btn");
    const cancelBtn = document.getElementById("engineer-modal-cancel-btn");
    const submitBtn = document.getElementById("engineer-modal-submit-btn");
    const pinInput = document.getElementById("engineer-pin-input");
    const afterPhotoInput = document.getElementById("after-photo-input");
    const closeFields = document.getElementById("engineer-close-fields");
    const feedbackBox = document.getElementById("engineer-feedback-box");

    function closeModal() {
      modal.classList.remove("open");
      state.closingTicketId = null;
      state.closingPhotoFile = null;
      if (feedbackBox) feedbackBox.style.display = "none";
    }

    engineerModeBtn.addEventListener("click", () => {
      state.closingTicketId = null;
      if (closeFields) closeFields.style.display = "none";
      if (submitBtn) submitBtn.textContent = "AUTHENTICATE";
      if (pinInput) pinInput.value = getEngineerPin();
      modal.classList.add("open");
    });

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    if (afterPhotoInput) {
      afterPhotoInput.addEventListener("change", (e) => {
        state.closingPhotoFile = e.target.files[0] || null;
      });
    }

    submitBtn.addEventListener("click", async () => {
      const pin = pinInput.value.trim();
      if (!pin) {
        showToast("Please enter an Engineer PIN", "error");
        return;
      }

      setEngineerPin(pin);

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "EVALUATING CEDAR...";

      try {
        if (state.closingTicketId) {
          const success = await executeTicketClose(state.closingTicketId, state.closingPhotoFile);
          if (success) {
            closeModal();
          }
        } else {
          showToast("Engineer PIN stored in session — Close Ticket buttons activated", "success");
          closeModal();
          renderTickets();
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // Seed Demo Button with lock against accidental duplicate seeding
    const seedBtn = document.getElementById("seed-demo-btn");
    if (seedBtn) {
      seedBtn.addEventListener("click", async () => {
        const hasSimulated = state.tickets.some((t) => t.is_simulated) || state.closedTickets.some((t) => t.is_simulated);
        if (hasSimulated) {
          showToast("Demo tickets already exist in database. Seed locked to prevent duplicate clutter.", "info");
          if (!confirm("Simulated tickets already exist in the database. Are you sure you want to add another 12 seeded tickets?")) {
            return;
          }
        }

        seedBtn.disabled = true;
        seedBtn.textContent = "SEEDING IN PROGRESS...";
        showToast("Seeding 12 municipal demo tickets...", "info");
        try {
          const res = await apiRequest("/seed", { method: "POST" });
          showToast(`Success: Created ${res.count || 12} simulated tickets!`, "success");

          // Extract closed tickets from seeded set to demonstrate evidence trail and dispute flow
          if (Array.isArray(res.tickets)) {
            const closedSeeded = res.tickets.filter((t) => t.status === "CLOSED");
            closedSeeded.forEach((ct) => {
              if (!state.closedTickets.some((item) => item.id === ct.id)) {
                state.closedTickets.push(ct);
              }
            });
          }

          await loadTickets();
        } catch (err) {
          showToast(`Seeding failed: ${err.message}`, "error");
        } finally {
          seedBtn.disabled = false;
          seedBtn.textContent = `⚡ ${I18N[currentLang].seedBtn}`;
        }
      });
    }
  }

  function openCloseModal(ticketId) {
    const modal = document.getElementById("engineer-modal");
    const closeFields = document.getElementById("engineer-close-fields");
    const submitBtn = document.getElementById("engineer-modal-submit-btn");
    const pinInput = document.getElementById("engineer-pin-input");
    const afterPhotoInput = document.getElementById("after-photo-input");
    const feedbackBox = document.getElementById("engineer-feedback-box");

    state.closingTicketId = ticketId;
    state.closingPhotoFile = null;
    if (afterPhotoInput) afterPhotoInput.value = "";
    if (feedbackBox) {
      feedbackBox.style.display = "none";
      feedbackBox.innerHTML = "";
    }

    if (closeFields) closeFields.style.display = "block";
    if (submitBtn) submitBtn.textContent = `CLOSE TICKET #${ticketId.substring(0, 8)}`;
    if (pinInput) pinInput.value = getEngineerPin();

    modal.classList.add("open");
  }

  async function executeTicketClose(ticketId, photoFile) {
    const card = document.getElementById(`card-${ticketId}`);
    const denialBox = document.getElementById(`denial-${ticketId}`);
    const feedbackBox = document.getElementById("engineer-feedback-box");

    showToast(`Evaluating Cedar policy for ticket closure...`, "info");

    try {
      let afterPhotoKey = null;

      // Upload after-repair photo if provided
      if (photoFile) {
        const presignedData = await apiRequest("/photo-url", {
          method: "POST",
          body: JSON.stringify({ kind: "after", content_type: photoFile.type || "image/jpeg" })
        });

        await fetch(presignedData.upload_url, {
          method: "PUT",
          headers: { "Content-Type": photoFile.type || "image/jpeg" },
          body: photoFile
        });

        afterPhotoKey = presignedData.key;
      }

      // Submit close request with X-Boond-Pin
      const closeRes = await apiRequest(`/tickets/${ticketId}/close`, {
        method: "POST",
        body: JSON.stringify({ after_photo_key: afterPhotoKey })
      });

      if (closeRes.authorization?.allowed) {
        showToast(`Ticket #${ticketId} closed! Cedar Reason: ${(closeRes.authorization.reasons || []).join(", ") || "Policy matched"}`, "success");
        if (card) {
          card.classList.add("just-fixed");
        }

        // Celebrate closure with mascot reaction
        triggerMascotReaction("close");

        // Add closed ticket to local state cache so evidence trail can be viewed
        if (closeRes.ticket) {
          state.closedTickets = state.closedTickets.filter((t) => t.id !== ticketId);
          state.closedTickets.push(closeRes.ticket);
        }

        await loadTickets();
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Closure denied or failed:", err);
      const auth = err.data?.authorization;
      const reasons = auth?.reasons || [];
      const errorMsg = err.data?.message || err.message;

      // Keep modal open and display feedback directly in modal
      if (feedbackBox) {
        feedbackBox.style.display = "block";
        feedbackBox.className = "cedar-denial-box";
        feedbackBox.innerHTML = `
          <strong style="color:var(--alarm);">🛑 CEDAR CLOSURE DENIED</strong>
          <span style="font-size:12px; font-weight:600; margin-top:4px; display:block;">${escapeHtml(errorMsg)}</span>
          ${reasons.length ? `<span class="cedar-reasons-list" style="margin-top:4px; display:block;">Reasons: ${escapeHtml(reasons.join(", "))}</span>` : ""}
        `;
      }

      if (denialBox) {
        denialBox.style.display = "flex";
        denialBox.innerHTML = `
          <span>🛑 CEDAR CLOSURE DENIED</span>
          <span style="font-size:11px; font-weight:500;">${escapeHtml(errorMsg)}</span>
          ${reasons.length ? `<span class="cedar-reasons-list">Reasons: ${escapeHtml(reasons.join(", "))}</span>` : ""}
        `;
      }

      if (card) {
        card.classList.add("deny-shake");
        setTimeout(() => card.classList.remove("deny-shake"), 600);
      }

      showToast(`Closure denied by Cedar policy: ${errorMsg}`, "error");
      return false;
    }
  }

  // ============================================================================
  // SECTION 6: NEIGHBOUR DISPUTES
  // ============================================================================
  async function handleDispute(ticketId) {
    showToast(`Logging resident dispute for #${ticketId}...`, "info");
    try {
      const res = await apiRequest(`/tickets/${ticketId}/dispute`, { method: "POST" });
      if (res.status === "reopened" || res.ticket?.status === "OPEN") {
        showToast(`Cedar Policy Reopened Ticket #${ticketId}! Returned to repair queue.`, "success");
        // Remove from closed tickets cache
        state.closedTickets = state.closedTickets.filter((t) => t.id !== ticketId);
      } else {
        const count = res.ticket?.dispute_count || 1;
        showToast(`Dispute logged (${count}/2). Cedar policy requires 2 disputes to reopen.`, "info");
        // Update closed ticket dispute count
        const ct = state.closedTickets.find((t) => t.id === ticketId);
        if (ct) ct.dispute_count = count;
      }
      await loadTickets();
    } catch (err) {
      showToast(`Failed to register dispute: ${err.message}`, "error");
    }
  }

  // ============================================================================
  // "WHY?" DRAWER
  // ============================================================================
  function setupWhyModal() {
    const modal = document.getElementById("why-modal");
    const closeBtn = document.getElementById("why-modal-close-btn");
    const doneBtn = document.getElementById("why-modal-done-btn");

    function closeModal() {
      modal.classList.remove("open");
    }

    closeBtn.addEventListener("click", closeModal);
    doneBtn.addEventListener("click", closeModal);
  }

  function openWhyDrawer(ticketId) {
    const modal = document.getElementById("why-modal");
    const body = document.getElementById("why-modal-body");
    const allTickets = [...state.tickets, ...state.closedTickets];
    const ticket = allTickets.find((t) => t.id === ticketId);

    if (!ticket) {
      body.innerHTML = `<p>Ticket information not found.</p>`;
      modal.classList.add("open");
      return;
    }

    const flow = (ticket.flow || "drip").toLowerCase();
    const est = ticket.leakage_estimate || {};

    body.innerHTML = `
      <div>
        <span class="sticker sticker-${flow === 'gush' ? 'alarm' : flow === 'steady' ? 'drip' : 'spray'}">
          ${escapeHtml(flow).toUpperCase()}
        </span>
        ${ticket.drinking ? `<span class="drinking-priority-badge" style="margin-left:6px;">🚰 DRINKING WATER PRIORITY</span>` : ''}
        <h4 style="margin-top: 10px;">TICKET ID: ${escapeHtml(ticket.id)}</h4>
      </div>

      <div class="drawer-row">
        <span>Triage Priority Score:</span>
        <strong>${escapeHtml(ticket.priority_score || 'N/A')}</strong>
      </div>

      <div class="drawer-row">
        <span>Estimated Daily Leakage:</span>
        <strong>${Number(est.min_litres_per_day || 0).toLocaleString()} – ${Number(est.max_litres_per_day || 0).toLocaleString()} L/d</strong>
      </div>

      <div class="drawer-row">
        <span>Midpoint Heuristic:</span>
        <strong>~${Number(est.midpoint_litres_per_day || 0).toLocaleString()} L/d</strong>
      </div>

      <div class="drawer-row">
        <span>Reporter Volume Multiplier:</span>
        <strong>${escapeHtml(ticket.reporters || 1)} citizen reports (${est.reporter_multiplier || 1.0}x)</strong>
      </div>

      <div class="drawer-row">
        <span>Drinking Water Multiplier:</span>
        <strong>${ticket.drinking ? '1.5x (Priority Drinking Water Line)' : '1.0x (Standard Line)'}</strong>
      </div>

      <div class="drawer-row">
        <span>Dispute Count:</span>
        <strong>${escapeHtml(ticket.dispute_count || 0)} / 2 required to reopen</strong>
      </div>

      <div class="drawer-row">
        <span>Status / Evidence:</span>
        <strong>${ticket.status === 'CLOSED' ? 'CLOSED (Proof Verified)' : 'ACTIVE TRIAGE (OPEN)'}</strong>
      </div>

      <div class="policy-reference-box">
        <strong>CEDAR AUTHORIZATION POLICY REFERENCE</strong>
        <p style="margin-top: 6px;">
          <em>Note: This is an explanation of Cedar rules defined in <code>backend/policies/boond.cedar</code>, not a client-fabricated decision:</em>
        </p>
        <ul style="margin: 8px 0 0 16px; line-height: 1.4;">
          <li><code>engineer_close_ticket</code>: Engineers can close a ticket ONLY when <code>has_after_photo == true</code>.</li>
          <li><code>resident_reopen_ticket</code>: Residents can reopen a closed ticket ONLY when <code>dispute_count &gt;= 2</code>.</li>
          <li>Residents are NEVER permitted to close tickets (default-deny).</li>
          <li>Authorization fails closed on errors.</li>
        </ul>
      </div>
    `;

    modal.classList.add("open");
  }

  // ============================================================================
  // GUIDELINES ACCORDION
  // ============================================================================
  function setupGuidelinesAccordion() {
    const toggleBtn = document.getElementById("toggle-guidelines-btn");
    const content = document.getElementById("guidelines-content");
    if (!toggleBtn || !content) return;

    toggleBtn.addEventListener("click", () => {
      const isCollapsed = content.classList.toggle("collapsed");
      toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
      toggleBtn.innerHTML = isCollapsed
        ? `<span id="toggle-guidelines-text">EXPAND</span> ▼`
        : `<span id="toggle-guidelines-text">COLLAPSE</span> ▲`;
    });
  }

  // ============================================================================
  // SECTION 9: CONTACT & FEEDBACK (LOCAL DRAFT / NO FAKE ENDPOINT)
  // ============================================================================
  function setupFeedbackForm() {
    const form = document.getElementById("feedback-form");
    const subjectEl = document.getElementById("feedback-subject");
    const emailEl = document.getElementById("feedback-email");
    const messageEl = document.getElementById("feedback-message");
    const draftContainer = document.getElementById("feedback-draft-container");
    const draftText = document.getElementById("feedback-draft-text");
    const copyBtn = document.getElementById("copy-feedback-btn");
    const statusMsg = document.getElementById("feedback-status-msg");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const subject = subjectEl ? subjectEl.options[subjectEl.selectedIndex]?.text || subjectEl.value : "Field Observation";
      const email = emailEl ? emailEl.value.trim() : "";
      const message = messageEl ? messageEl.value.trim() : "";

      if (!message) {
        showToast("Please enter a feedback message.", "error");
        return;
      }

      const timestamp = new Date().toISOString();
      const draftContent = [
        "===========================================================",
        "BOOND — WATER EMERGENCY TRIAGE ENGINE (FEEDBACK DRAFT)",
        "===========================================================",
        `Generated: ${timestamp}`,
        `Subject:   ${subject}`,
        `Contact:   ${email || "Not provided (Anonymous Field Observation)"}`,
        `Notice:    Local prototype draft — dispatch manually`,
        "-----------------------------------------------------------",
        "MESSAGE:",
        message,
        "==========================================================="
      ].join("\n");

      if (draftText) draftText.textContent = draftContent;
      if (draftContainer) draftContainer.style.display = "block";
      if (statusMsg) {
        statusMsg.style.color = "var(--water-primary)";
        statusMsg.textContent = "✓ Draft generated! Review and copy below.";
      }
      showToast("Feedback draft generated! Ready to copy.", "info");
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        if (!draftText) return;
        copyToClipboard(draftText.textContent, () => {
          copyBtn.textContent = "COPIED ✓";
          showToast("Feedback draft copied to clipboard!", "success");
          setTimeout(() => {
            copyBtn.textContent = "📋 COPY DRAFT";
          }, 2500);
        });
      });
    }
  }

  // ============================================================================
  // DEMO ASSET GALLERY MODAL (HACKATHON VERIFICATION)
  // ============================================================================
  function setupDemoGalleryModal() {
    const modal = document.getElementById("demo-gallery-modal");
    const openBtn1 = document.getElementById("open-demo-gallery-btn");
    const openBtn2 = document.getElementById("open-demo-gallery-btn-2");
    const closeBtn = document.getElementById("demo-gallery-close-btn");
    const doneBtn = document.getElementById("demo-gallery-done-btn");

    if (!modal) return;

    function openModal() {
      modal.classList.add("open");
    }

    function closeModal() {
      modal.classList.remove("open");
    }

    if (openBtn1) openBtn1.addEventListener("click", openModal);
    if (openBtn2) openBtn2.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (doneBtn) doneBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  // ============================================================================
  // LANGUAGE TOGGLE & TRANSLATIONS
  // ============================================================================
  function setupLanguageToggle() {
    const enBtn = document.getElementById("lang-en-btn");
    const hiBtn = document.getElementById("lang-hi-btn");

    function setLanguage(lang) {
      currentLang = lang;
      if (lang === "en") {
        enBtn.classList.add("active");
        enBtn.setAttribute("aria-pressed", "true");
        hiBtn.classList.remove("active");
        hiBtn.setAttribute("aria-pressed", "false");
      } else {
        hiBtn.classList.add("active");
        hiBtn.setAttribute("aria-pressed", "true");
        enBtn.classList.remove("active");
        enBtn.setAttribute("aria-pressed", "false");
      }

      applyTranslations();
      renderTickets();
    }

    enBtn.addEventListener("click", () => setLanguage("en"));
    hiBtn.addEventListener("click", () => setLanguage("hi"));
  }

  function applyTranslations() {
    const dict = I18N[currentLang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });

    updateConnectionStatus(getApiBaseUrl() ? "connected" : "disconnected");
    updateEngineerUIState();
    updateLastUpdatedIndicator();

    // Update location tag
    const sourceTag = document.getElementById("coords-source-tag");
    if (sourceTag) {
      if (state.locationSource === "gps") {
        sourceTag.textContent = dict.locationGpsTag || "🎯 GPS CONFIRMED (DEVICE)";
      } else if (state.locationSource === "clicked") {
        sourceTag.textContent = dict.locationClickedTag || "👆 MAP CLICKED POINT";
      } else {
        sourceTag.textContent = dict.locationDemoTag || "📍 DEMO REFERENCE (DELHI)";
      }
    }
  }

  // ============================================================================
  // VIEW MODE TOGGLE (CURATED DEMO 20 VS ALL MUNICIPAL TICKETS)
  // ============================================================================
  function setupViewModeToggle() {
    const curatedBtn = document.getElementById("view-mode-curated-btn");
    const allBtn = document.getElementById("view-mode-all-btn");
    const bannerText = document.getElementById("demo-mode-banner-text");

    if (!curatedBtn || !allBtn) return;

    function updateViewModeUI() {
      if (state.viewMode === "curated") {
        curatedBtn.className = "btn btn-spray view-mode-btn active";
        curatedBtn.setAttribute("aria-pressed", "true");
        allBtn.className = "btn btn-paper view-mode-btn";
        allBtn.setAttribute("aria-pressed", "false");
        if (bannerText) {
          bannerText.innerHTML = `Showing <strong>exactly 20 curated municipal leak scenarios</strong> distributed across Delhi urban zones (heuristic triage estimates). Real citizen reports appear at top.`;
        }
      } else {
        curatedBtn.className = "btn btn-paper view-mode-btn";
        curatedBtn.setAttribute("aria-pressed", "false");
        allBtn.className = "btn btn-spray view-mode-btn active";
        allBtn.setAttribute("aria-pressed", "true");
        const total = state.tickets.length + state.closedTickets.length;
        if (bannerText) {
          bannerText.innerHTML = `Showing <strong>all ${total} municipal tickets</strong> currently recorded in the database.`;
        }
      }
    }

    curatedBtn.addEventListener("click", () => {
      state.viewMode = "curated";
      updateViewModeUI();
      renderTickets();
      renderMapTickets();
      updateNowFixingBar(getVisibleTickets());
      updateLedgerMetrics(getVisibleTickets());
      showToast("Switched to Curated Demo View (20 representative leaks)", "info");
    });

    allBtn.addEventListener("click", () => {
      state.viewMode = "all";
      updateViewModeUI();
      renderTickets();
      renderMapTickets();
      updateNowFixingBar(getVisibleTickets());
      updateLedgerMetrics(getVisibleTickets());
      showToast("Switched to All Municipal Tickets Queue", "info");
    });
  }

  // ============================================================================
  // POLLING & INITIALIZATION
  // ============================================================================
  function startPolling() {
    if (state.pollingTimer) clearInterval(state.pollingTimer);

    // Poll every 15s only when API URL is configured
    state.pollingTimer = setInterval(() => {
      if (getApiBaseUrl()) {
        loadTickets().catch(() => {});
      }
    }, 15000);
  }

  // Initialization when DOM is ready
  window.addEventListener("DOMContentLoaded", () => {
    initMap();
    setupReportForm();
    setupEngineerModals();
    setupViewModeToggle();
    setupWhyModal();
    setupLanguageToggle();
    setupGuidelinesAccordion();
    setupFeedbackForm();
    setupDemoGalleryModal();

    // Search bar handling
    const searchInput = document.getElementById("ticket-search-input");
    const clearSearchBtn = document.getElementById("clear-search-btn");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = state.searchQuery ? "inline-flex" : "none";
        }
        renderTickets();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        state.searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderTickets();
      });
    }

    // Refresh queue button
    const refreshBtn = document.getElementById("refresh-queue-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.disabled = true;
        refreshBtn.textContent = "REFRESHING...";
        try {
          await loadTickets();
          showToast("Repair queue and metrics refreshed", "info");
        } catch {
          showToast("Failed to refresh queue", "error");
        } finally {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = `🔄 <span>${I18N[currentLang].refreshBtn || 'REFRESH'}</span>`;
        }
      });
    }

    // Filter buttons in queue
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.filter = btn.getAttribute("data-filter");
        renderTickets();
      });
    });

    applyTranslations();
    loadTickets();
    startPolling();
  });
})();
