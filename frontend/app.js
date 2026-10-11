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
      heroTitle: "EVERY LEAK. RANKED.",
      heroPitch: "Turn scattered leak reports into the next repair that matters.",
      reportBtn: "REPORT A LEAK",
      queueBtn: "VIEW REPAIR QUEUE",
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
      coordsLabel: "SELECTED LOCATION (CLICK MAP)",
      readyTag: "READY",
      photoLabel: "LEAK PHOTO (OPTIONAL)",
      photoPrompt: "📸 Tap or click to select / capture photo",
      submitReportBtn: "SUBMIT LEAK REPORT",
      submittingReport: "SUBMITTING REPORT...",
      queueBadge: "CEDAR GOVERNED QUEUE",
      queueHeading: "FIX THIS FIRST",
      filterAll: "ALL TICKETS",
      filterGush: "GUSH ONLY",
      filterDrinking: "DRINKING WATER",
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
      afterPhotoBadge: "AFTER REPAIR (PROOF)"
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
      heroTitle: "हर रिसाव। प्राथमिकता में।",
      heroPitch: "नागरिक रिपोर्टों को अगली महत्वपूर्ण मरम्मत में बदलें।",
      reportBtn: "रिसाव की रिपोर्ट करें",
      queueBtn: "मरम्मत कतार देखें",
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
      coordsLabel: "चुना गया स्थान (मानचित्र पर क्लिक करें)",
      readyTag: "तैयार",
      photoLabel: "रिसाव की फोटो (वैकल्पिक)",
      photoPrompt: "📸 फोटो चुनने या खींचने के लिए टैप करें",
      submitReportBtn: "रिपोर्ट जमा करें",
      submittingReport: "जमा हो रहा है...",
      queueBadge: "सीडर अधिकृत कतार",
      queueHeading: "पहले इसे ठीक करें",
      filterAll: "सभी टिकट",
      filterGush: "केवल तीव्र",
      filterDrinking: "पेयजल लाइन",
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
      afterPhotoBadge: "मरम्मत पश्चात प्रमाण"
    }
  };

  let currentLang = "en";

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const state = {
    selectedLat: 28.6139,
    selectedLng: 77.2090,
    selectedFlow: "drip",
    selectedDrinking: false,
    selectedPhotoFile: null,
    tickets: [],
    closedTickets: [], // Retains closed tickets for trail and dispute flows
    filter: "all",
    closingTicketId: null,
    closingPhotoFile: null,
    pollingTimer: null,
    hasAnimatedLedger: false
  };

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
  let leafletMap = null;
  let selectedMarker = null;
  let ticketMarkersGroup = null;

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

    // Initial selected coordinate marker
    updateSelectedPin(state.selectedLat, state.selectedLng);

    // Map click handler to pick report location
    leafletMap.on("click", (e) => {
      updateSelectedPin(e.latlng.lat, e.latlng.lng);
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
            updateSelectedPin(lat, lng);
            leafletMap.setView([lat, lng], 15);
            showToast("Location updated from GPS", "info");
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

  function updateSelectedPin(lat, lng) {
    state.selectedLat = parseFloat(lat.toFixed(6));
    state.selectedLng = parseFloat(lng.toFixed(6));

    const coordsDisplay = document.getElementById("coords-text");
    if (coordsDisplay) {
      coordsDisplay.textContent = `Lat: ${state.selectedLat.toFixed(5)}, Lng: ${state.selectedLng.toFixed(5)}`;
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
        updateSelectedPin(pt.lat, pt.lng);
      });
    }
  }

  function renderMapTickets(allTickets) {
    if (!leafletMap || !ticketMarkersGroup) return;
    ticketMarkersGroup.clearLayers();

    allTickets.forEach((t) => {
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

      marker.bindPopup(`
        <div style="font-family: var(--font-body); padding: 4px;">
          <strong style="text-transform: uppercase;"># ${escapeHtml(t.id)}</strong><br>
          <span>Flow: ${escapeHtml(t.flow).toUpperCase()}</span><br>
          ${t.drinking ? '<span style="color:var(--drip); font-weight:700;">🚰 DRINKING WATER LINE</span><br>' : ''}
          <span>Reporters: ${escapeHtml(t.reporters || 1)}</span><br>
          <span>Est. Flow: ~${escapeHtml(estMidpoint)} L/d (Midpoint)</span><br>
          ${t.is_simulated ? '<span style="background:#FFE600; font-size:10px; font-weight:700; padding:1px 4px;">SIMULATED</span><br>' : ''}
          <span style="font-weight:700; color:${isClosed ? 'var(--ink)' : 'var(--drip)'}">${t.status}</span>
        </div>
      `);

      ticketMarkersGroup.addLayer(marker);
    });
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

      renderTickets(combined);
      renderMapTickets(combined);
      updateNowFixingBar(state.tickets);

      // Attempt GET /ledger or compute from tickets
      await loadLedger(combined);
    } catch (err) {
      console.warn("Failed to fetch tickets from backend:", err);
      updateConnectionStatus("error");
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

    const source = ticketsToRender || [...state.tickets, ...state.closedTickets];
    let filtered = source;
    if (state.filter === "gush") {
      filtered = filtered.filter((t) => (t.flow || "").toLowerCase() === "gush");
    } else if (state.filter === "drinking") {
      filtered = filtered.filter((t) => t.drinking === true);
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

              <div style="margin-top: 10px; display:flex; justify-content:space-between; align-items:center;">
                <span class="ticket-id">ID: ${escapeHtml(t.id)}</span>
                <span class="ticket-location-tag">📍 ${Number(t.lat || 0).toFixed(5)}°, ${Number(t.lng || 0).toFixed(5)}°</span>
              </div>
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
              ${t.before_photo_url ? `
                <div class="photo-evidence-item">
                  <span class="photo-badge-label">📷 ${I18N[currentLang].beforePhotoBadge}</span>
                  <img src="${escapeHtml(t.before_photo_url)}" alt="Before repair leak photo" class="ticket-photo-thumb" loading="lazy">
                </div>
              ` : ''}

              ${t.after_photo_url ? `
                <div class="photo-evidence-item">
                  <span class="photo-badge-label after">📸 ${I18N[currentLang].afterPhotoBadge}</span>
                  <img src="${escapeHtml(t.after_photo_url)}" alt="After repair proof photo" class="ticket-photo-thumb" loading="lazy">
                </div>
              ` : ''}
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

      if (state.closingTicketId) {
        await executeTicketClose(state.closingTicketId, state.closingPhotoFile);
        closeModal();
      } else {
        showToast("Engineer PIN stored in session", "success");
        closeModal();
        renderTickets();
      }
    });

    // Seed Demo Button
    const seedBtn = document.getElementById("seed-demo-btn");
    if (seedBtn) {
      seedBtn.addEventListener("click", async () => {
        seedBtn.disabled = true;
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
        }
      });
    }
  }

  function openCloseModal(ticketId) {
    const modal = document.getElementById("engineer-modal");
    const closeFields = document.getElementById("engineer-close-fields");
    const submitBtn = document.getElementById("engineer-modal-submit-btn");
    const pinInput = document.getElementById("engineer-pin-input");

    state.closingTicketId = ticketId;
    state.closingPhotoFile = null;

    if (closeFields) closeFields.style.display = "block";
    if (submitBtn) submitBtn.textContent = `CLOSE TICKET #${ticketId.substring(0, 8)}`;
    if (pinInput) pinInput.value = getEngineerPin();

    modal.classList.add("open");
  }

  async function executeTicketClose(ticketId, photoFile) {
    const card = document.getElementById(`card-${ticketId}`);
    const denialBox = document.getElementById(`denial-${ticketId}`);

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
        showToast(`Ticket #${ticketId} closed! Cedar Reason: ${closeRes.authorization.reasons.join(", ")}`, "success");
        if (card) {
          card.classList.add("just-fixed");
        }

        // Add closed ticket to local state cache so evidence trail can be viewed
        if (closeRes.ticket) {
          state.closedTickets = state.closedTickets.filter((t) => t.id !== ticketId);
          state.closedTickets.push(closeRes.ticket);
        }

        await loadTickets();
      }
    } catch (err) {
      console.warn("Closure denied or failed:", err);
      const auth = err.data?.authorization;
      const reasons = auth?.reasons || [];
      const errorMsg = err.data?.message || err.message;

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
  // LANGUAGE TOGGLE
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
    updateConnectionStatus(getApiBaseUrl() ? "connected" : "disconnected");
    updateEngineerUIState();
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
    setupWhyModal();
    setupLanguageToggle();

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
