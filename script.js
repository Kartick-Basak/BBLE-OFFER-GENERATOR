/*
 * BLT Brilliant Lifts & Escalators — Frontend Form Logic
 */

// REPLACE THIS WITH YOUR ACTUAL DEPLOYED WEB APP URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrRH0s1ioalQ-sL03kz35st3b4F3Fnu07eec_hcwGEctIZPrXind7_1QvAmDxCiFwv/exec";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bltProposalForm");
  const submitBtn = document.getElementById("submitBtn");
  const resultBox = document.getElementById("resultBox");

  const salesSelect = document.getElementById("salesPersonName");
  const repEmail = document.getElementById("repEmail");

  const machineConfig = document.getElementById("machineConfig");
  const tractionDiv = document.getElementById("tractionDiv");
  const tractionType = document.getElementById("tractionType");
  const speedSelect = document.getElementById("speedSelect");

  const travelSelect = document.getElementById("travelSelect");
  const customTravelDiv = document.getElementById("customTravelDiv");

  const doorType = document.getElementById("doorType");
  const doorWidth = document.getElementById("doorWidth");
  const shaftWidth = document.getElementById("shaftWidth");
  const shaftFeedback = document.getElementById("shaftFeedback");

  // 1. Auto-fill Sales Executive Email
  const salesEmails = {
    "SANJEEV KUMAR SINGH": "sanjeevks499@gmail.com",
    "ARNAB DUTTA": "arnabdutta707@gmail.com",
    "SOURAV BASAK": "souravbasak121@gmail.com",
    "KALYAN CHATTERJEE": "kalyan@bltbrilliant.com",
    "BIJAYA KUMAR PRADHAN": "bijaya@bltbrilliant.com",
    "BIKASH NAYAK": "bikash@bltbrilliant.com",
    "KANCHAN DASGUPTA": "sales@bltbrilliant.com"
  };

  if (salesSelect && repEmail) {
    salesSelect.addEventListener("change", function () {
      repEmail.value = salesEmails[this.value] || "";
    });
  }

  // 2. Dynamic Speed & Traction Unit based on Machine Room Configuration
  function updateSpeeds() {
    if (!speedSelect) return;
    const isMRL = machineConfig && machineConfig.value.includes("MRL");
    const isGearless = isMRL || (tractionType && tractionType.value.includes("Gearless"));

    speedSelect.innerHTML = "";
    const speeds = isGearless
      ? ["1.0 Mtr/sec", "1.5 Mtr/sec", "1.75 Mtr/sec"]
      : ["0.5 Mtr/sec", "0.63 Mtr/sec", "1.0 Mtr/sec"];

    speeds.forEach(function (s) {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === (isGearless ? "1.0 Mtr/sec" : "0.63 Mtr/sec")) {
        opt.selected = true;
      }
      speedSelect.appendChild(opt);
    });

    if (tractionDiv && tractionType) {
      if (isMRL) {
        tractionType.value = "Permanent Magnet Synchronous Gearless Traction Machine";
      }
    }
  }

  if (machineConfig) machineConfig.addEventListener("change", updateSpeeds);
  if (tractionType) tractionType.addEventListener("change", updateSpeeds);
  // Initialize on load
  updateSpeeds();

  // 3. Custom Travel Distance Toggle
  if (travelSelect && customTravelDiv) {
    travelSelect.addEventListener("change", function () {
      customTravelDiv.style.display = this.value.includes("Other") ? "block" : "none";
    });
  }

  // 4. Real-time Shaft Width Formula Validation
  function validateShaft() {
    if (!doorType || !doorWidth || !shaftWidth || !shaftFeedback) return true;
    
    const dw = parseFloat(doorWidth.value) || 0;
    const sw = parseFloat(shaftWidth.value) || 0;
    
    if (!dw || !sw) {
      shaftFeedback.style.display = "none";
      return true;
    }

    const isCenter = doorType.value.toLowerCase().includes("center");
    const minW = isCenter ? (2 * dw) + 200 : (1.5 * dw) + 200;

    if (sw < minW) {
      shaftFeedback.style.display = "block";
      shaftFeedback.innerHTML = "⚠️ Shaft Width (" + sw + " mm) is less than minimum required (" + minW + " mm) for " + doorType.value + " with " + dw + " mm door width.";
      return false;
    } else {
      shaftFeedback.style.display = "none";
      return true;
    }
  }

  if (doorType) doorType.addEventListener("change", validateShaft);
  if (doorWidth) doorWidth.addEventListener("change", validateShaft);
  if (shaftWidth) shaftWidth.addEventListener("input", validateShaft);

  // 5. Intercept Form Submission and POST to Google Apps Script
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!validateShaft()) {
        if (!confirm("Shaft width is below recommended engineering dimensions. Do you still wish to submit?")) {
          return;
        }
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "⏳ Submitting & Generating Proposal...";
      resultBox.style.display = "none";

      const formData = {};
      const elements = form.elements;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el.name) {
          formData[el.name] = el.value.trim();
        }
      }

      try {
        const response = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.status === "success" || data.success) {
          resultBox.className = "alert alert-success text-center shadow-sm";
          
          // THIS IS THE FIXED SECTION
          let docLinkHtml = "";
          if (data.docUrl) {
            docLinkHtml = `<p>✅ Proposal generated successfully! <a href="${data.docUrl}" target="_blank">Click here to view/download the proposal</a>.</p>`;
          } else {
            docLinkHtml = `<p>✅ Proposal generated successfully! However, the document link is not available.</p>`;
          }

          resultBox.innerHTML = docLinkHtml;
          resultBox.style.display = "block";
        } else {
          throw new Error(data.message || "Unknown error from server.");
        }
      } catch (error) {
        console.error("Error generating proposal: ", error);
        resultBox.className = "alert alert-danger text-center shadow-sm";
        resultBox.innerHTML = "❌ Error generating proposal: " + error.message;
        resultBox.style.display = "block";
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});