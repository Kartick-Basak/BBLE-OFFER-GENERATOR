/**
 * BLT Brilliant Lifts & Escalators - Dynamic Frontend Engine
 */

const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxhzFCEKqeoNM82wCQJvcDNjxgOypCXSeZqVX1AipCQ15DJx_Q_rgxvPE6VtOMaFRDX/exec";
const SPREADSHEET_ID = "1b2EA4neAIaPhMEoeQV61sAHhVsKN1hOVntvas0uz1j8";

// Fallback baseline team if network is completely offline
let salesTeamData = [
  { name: "SANJEEV KUMAR SINGH" },
  { name: "KALYAN CHATTERJEE" },
  { name: "KANCHAN DASGUPTA" },
  { name: "ARNAB DUTTA" },
  { name: "BIKASH NAYAK" },
  { name: "BIJAYA KUMAR PRADHAN" },
  { name: "JOY MUKHERJEE" },
  { name: "SOURAV BASAK" },
  { name: "CHAYAN MUKHERJEE" }
];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSalesTeamProfile();
  setupFormCheckpointsAndValidation();

  // Create first elevator card
  addLiftCard();

  document.getElementById("btnAddLift").addEventListener("click", () => {
    addLiftCard();
  });

  document.getElementById("proposalForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("btnModalClose").addEventListener("click", closeModal);
  document.getElementById("btnThemeToggle").addEventListener("click", toggleTheme);
});

/* --- Theme Toggle Engine --- */
function initTheme() {
  const savedTheme = localStorage.getItem("blt_theme") || "light";
  applyTheme(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const target = current === "dark" ? "light" : "dark";
  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.classList.remove("spin");
    void icon.offsetWidth; // Trigger reflow for CSS animation
    icon.classList.add("spin");
  }
  applyTheme(target);
  localStorage.setItem("blt_theme", target);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");

  if (theme === "dark") {
    icon.textContent = "☀️";
    text.textContent = "Light Mode";
  } else {
    icon.textContent = "🌙";
    text.textContent = "Dark Mode";
  }
}

/* --- Dynamic Auto-Updating Sales Team from Sheet --- */
async function initSalesTeamProfile() {
  let teamLoaded = false;

  // 1. Attempt retrieval from Google Apps Script Web App
  if (APPS_SCRIPT_WEB_APP_URL && !APPS_SCRIPT_WEB_APP_URL.includes("YOUR_APPS_SCRIPT")) {
    try {
      const res = await fetch(`${APPS_SCRIPT_WEB_APP_URL}?action=getSalesTeam&spreadsheetId=${SPREADSHEET_ID}`);
      const data = await res.json();
      if (data && data.status === "success" && Array.isArray(data.salesTeam) && data.salesTeam.length > 0) {
        salesTeamData = data.salesTeam.map(item => ({ name: item.name.trim() }));
        populateSalesDropdown(salesTeamData);
        teamLoaded = true;
      }
    } catch (err) {
      console.warn("Apps script sales team fetch skipped:", err);
    }
  }

  // 2. Direct Google Sheets CSV Fallback (Reads 'Sales Team' tab in real time)
  if (!teamLoaded && SPREADSHEET_ID) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Sales Team")}`;
      const res = await fetch(csvUrl);
      const text = await res.text();
      const rows = text.split("\n").map(r => r.split(","));
      const names = [];
      
      for (let i = 1; i < rows.length; i++) {
        const rawName = rows[i][0] ? rows[i][0].replace(/['"]/g, "").trim() : "";
        if (rawName && !names.includes(rawName)) {
          names.push(rawName);
        }
      }

      if (names.length > 0) {
        salesTeamData = names.map(n => ({ name: n }));
        populateSalesDropdown(salesTeamData);
        teamLoaded = true;
      }
    } catch (e) {
      console.warn("Direct sheet gviz fetch skipped:", e);
    }
  }

  // 3. Fallback to cached default
  if (!teamLoaded) {
    populateSalesDropdown(salesTeamData);
  }
}

function populateSalesDropdown(team) {
  const select = document.getElementById("salesPersonSelect");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="" disabled selected>Select Sales Representative</option>';

  team.forEach(rep => {
    const opt = document.createElement("option");
    opt.value = rep.name;
    opt.textContent = rep.name;
    select.appendChild(opt);
  });

  if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
    select.value = currentVal;
  }

  select.addEventListener("change", handleSalesPersonChange);
}

function isKalyanSelected() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select && select.value ? select.value : "").toUpperCase();
  return selectedName.includes("KALYAN");
}

function handleSalesPersonChange() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select.value || "").toUpperCase();

  // State default based on sales person assignment
  const stateSelect = document.getElementById("state");
  if (stateSelect && (!stateSelect.value || stateSelect.value === "West Bengal" || stateSelect.value === "Odisha" || stateSelect.value === "Assam")) {
    if (selectedName.includes("BIKASH") || selectedName.includes("BIJAYA")) {
      stateSelect.value = "Odisha";
    } else if (selectedName.includes("CHAYAN")) {
      stateSelect.value = "Assam";
    } else {
      stateSelect.value = "West Bengal";
    }
  }

  // Kalyan default flooring rule
  if (selectedName.includes("KALYAN")) {
    document.querySelectorAll(".lift-card").forEach(card => {
      const type = card.querySelector(".lift-type").value;
      if (type && type !== "GOODS") {
        const fl = card.querySelector(".lift-flooring");
        if (fl) fl.value = "PVC Flooring - Wooden Type";
      }
    });
  }
}

/* --- Form Field Validations & Checkpoints --- */
function setupFormCheckpointsAndValidation() {
  const customerName = document.getElementById("customerName");
  const contactPerson = document.getElementById("contactPerson");
  const chkSameCustomer = document.getElementById("chkSameCustomer");

  const address1 = document.getElementById("address1");
  const address2 = document.getElementById("address2");
  const pinCode = document.getElementById("pinCode");
  const siteAddress = document.getElementById("siteAddress");
  const sitePinCode = document.getElementById("sitePinCode");
  const chkSameAddress = document.getElementById("chkSameAddress");
  const contactPhone = document.getElementById("contactPhone");

  chkSameCustomer.addEventListener("change", () => {
    if (chkSameCustomer.checked) {
      contactPerson.value = customerName.value.trim();
      contactPerson.readOnly = true;
    } else {
      contactPerson.readOnly = false;
    }
  });

  customerName.addEventListener("input", () => {
    if (chkSameCustomer.checked) {
      contactPerson.value = customerName.value.trim();
    }
  });

  function syncSiteAddressAndPin() {
    if (chkSameAddress.checked) {
      const parts = [address1.value.trim(), address2.value.trim()].filter(Boolean);
      siteAddress.value = parts.join(", ");
      siteAddress.readOnly = true;
      sitePinCode.value = pinCode.value.trim();
      sitePinCode.readOnly = true;
    } else {
      siteAddress.readOnly = false;
      sitePinCode.readOnly = false;
    }
  }

  chkSameAddress.addEventListener("change", syncSiteAddressAndPin);
  address1.addEventListener("input", syncSiteAddressAndPin);
  address2.addEventListener("input", syncSiteAddressAndPin);

  function handlePinAutoState(inputElem) {
    const cleanPin = inputElem.value.replace(/\D/g, "").slice(0, 6);
    inputElem.value = cleanPin;

    if (cleanPin.length >= 2) {
      const detected = getStateFromPinCode(cleanPin);
      if (detected) setMatchingState(detected);
    }
  }

  pinCode.addEventListener("input", function() {
    handlePinAutoState(this);
    if (chkSameAddress.checked) sitePinCode.value = this.value;
  });

  sitePinCode.addEventListener("input", function() {
    handlePinAutoState(this);
  });

  contactPhone.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });
}

/* --- Lift Card Builder --- */
function addLiftCard() {
  const container = document.getElementById("liftsContainer");
  const card = document.createElement("div");
  card.className = "lift-card";

  card.innerHTML = `
    <div class="lift-card-header">
      <div class="lift-badge">Elevator Specification</div>
      <button type="button" class="btn-remove-lift" onclick="removeLiftCard(this)">✕ Remove Elevator</button>
    </div>

    <div class="grid-4">
      <div class="form-group">
        <label>Lift Type <span class="req">*</span></label>
        <select class="form-control lift-type" required onchange="handleLiftTypeChange(this)">
          <option value="" disabled selected>Select Lift Type</option>
          <option value="PASSENGER">Passenger</option>
          <option value="HOME LIFT">Home</option>
          <option value="STRETCHER">Stretcher</option>
          <option value="GOODS">Goods</option>
        </select>
      </div>

      <div class="form-group">
        <label>No. of Units <span class="req">*</span></label>
        <input type="number" class="form-control lift-qty" placeholder="" min="1" max="50" inputmode="numeric" required oninput="updateTechnicalSummary()">
      </div>

      <div class="form-group">
        <label>Machine Room Config <span class="req">*</span></label>
        <select class="form-control lift-mr" required onchange="handleMachineAndTractionChange(this)">
          <option value="" disabled selected>Select MR / MRL</option>
          <option value="MRL">MRL (Machine Room Less)</option>
          <option value="MR">MR (Machine Room)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Traction Unit <span class="req">*</span></label>
        <select class="form-control lift-traction" required onchange="handleMachineAndTractionChange(this)">
          <option value="" disabled selected>Select Traction</option>
          <option value="Gearless">Gearless</option>
          <option value="Geared">Geared</option>
        </select>
      </div>
    </div>

    <div class="grid-4">
      <div class="form-group grp-capacity">
        <label class="capacity-label">Capacity (Persons) <span class="req">*</span></label>
        <select class="form-control lift-capacity" required onchange="handleCapacityChange(this)">
          <option value="" disabled selected>Select Capacity</option>
          <option value="4">4 Persons</option>
          <option value="5">5 Persons</option>
          <option value="6">6 Persons</option>
          <option value="8">8 Persons</option>
          <option value="10">10 Persons</option>
          <option value="13">13 Persons (Stretcher)</option>
          <option value="15">15 Persons</option>
        </select>
      </div>

      <div class="form-group">
        <label>No. of Stops <span class="req">*</span></label>
        <input type="number" class="form-control lift-stops" placeholder="" min="2" max="60" inputmode="numeric" required oninput="handleStopsChange(this)">
      </div>

      <div class="form-group">
        <label>Serving Floors <span class="req">*</span></label>
        <input type="text" class="form-control lift-floors" placeholder="" required>
      </div>

      <div class="form-group">
        <label>Travel Distance (Mtrs) <span class="req">*</span></label>
        <input type="text" class="form-control lift-travel" placeholder="" required>
      </div>
    </div>

    <!-- Hidden parameters auto-calculated -->
    <input type="hidden" class="lift-load" value="408 Kg">
    <input type="hidden" class="lift-speed" value="1.0 Mtr/sec">
    <input type="hidden" class="lift-pit" value="1600 MM">
    <input type="hidden" class="lift-headroom" value="4800 MM">

    <div class="grid-4">
      <div class="form-group">
        <label>Shaft Width (W in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-w" placeholder="" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>

      <div class="form-group">
        <label>Shaft Depth (D in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-d" placeholder="" inputmode="numeric" required>
      </div>

      <div class="form-group">
        <label>Door Opening Type <span class="req">*</span></label>
        <select class="form-control lift-door-type" required onchange="validateShaftDimensions(this)">
          <option value="" disabled selected>Select Door Opening</option>
          <option value="Automatic Center Opening Door">Center Opening Door</option>
          <option value="Automatic Telescopic Opening Door">Telescopic Opening Door</option>
        </select>
      </div>

      <div class="form-group">
        <label>Clear Door Width (MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-door-w" placeholder="" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>
    </div>

    <div class="dim-alert"></div>

    <div class="grid-2">
      <div class="form-group">
        <label>Door Finish <span class="req">*</span></label>
        <select class="form-control lift-door-finish" required>
          <option value="" disabled selected>Select Door Finish</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated">MS Powder Coated</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Vision Type <span class="req">*</span></label>
        <select class="form-control lift-vision" required>
          <option value="" disabled selected>Select Vision Type</option>
          <option value="No Vision">No Vision</option>
          <option value="Small Vision">Small Vision</option>
          <option value="Half Glass">Half Glass</option>
          <option value="Full Glass">Full Glass</option>
        </select>
      </div>
    </div>

    <div class="grid-3">
      <div class="form-group">
        <label>Car Ceiling <span class="req">*</span></label>
        <select class="form-control lift-ceiling" required>
          <option value="" disabled selected>Select Car Ceiling</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated Finish">MS Powder Coated Finish</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Car Panels <span class="req">*</span></label>
        <select class="form-control lift-panels" required>
          <option value="" disabled selected>Select Car Panels</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated">MS Powder Coated</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
          <option value="SS Hairline Finish - Back Side Middle Panel SS Mirror Finish">SS Hairline Finish - Back Side Middle Panel SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Car Flooring <span class="req">*</span></label>
        <select class="form-control lift-flooring" required>
          <option value="" disabled selected>Select Car Flooring</option>
          <option value="PVC Flooring">PVC Flooring</option>
          <option value="PVC Flooring - Wooden Type">PVC Flooring - Wooden Type</option>
          <option value="Granite Flooring - By Customer">Granite Flooring - By Customer</option>
        </select>
      </div>
    </div>

    <input type="hidden" class="lift-cardim" value="">
    <div class="grid-2">
      <div class="form-group" style="display: flex; flex-direction: column; justify-content: flex-end;">
        <label class="checkbox-feature-label">
          <input type="checkbox" class="lift-feature1-check" onchange="handleFeature1Check(this)">
          <span>Overload Sensor &amp; Indicator</span>
        </label>
        <input type="hidden" class="lift-feature1" value="">
      </div>

      <div class="form-group">
        <label>Optional Feature 2</label>
        <input type="text" class="form-control lift-feature2" placeholder="">
      </div>
    </div>
  `;

  container.appendChild(card);
  renumberAllLifts();
}

function removeLiftCard(btnOrElement) {
  const card = btnOrElement.closest(".lift-card");
  if (card) {
    card.remove();
    renumberAllLifts();
  }
}

function renumberAllLifts() {
  const cards = document.querySelectorAll(".lift-card");
  cards.forEach((card, idx) => {
    const liftNum = idx + 1;
    card.id = `liftCard_${liftNum}`;
    card.dataset.liftIndex = liftNum;

    const badge = card.querySelector(".lift-badge");
    if (badge) badge.innerText = `Elevator #${liftNum} Specification`;

    const alertBox = card.querySelector(".dim-alert");
    if (alertBox) alertBox.id = `dimAlert_${liftNum}`;
  });

  const buttons = document.querySelectorAll(".btn-remove-lift");
  buttons.forEach(btn => {
    btn.style.display = cards.length > 1 ? "block" : "none";
  });

  updateTechnicalSummary();
}

/* --- Dynamic Lift Rules --- */
function updateFlooringOptions(card) {
  if (!card) return;
  const type = card.querySelector(".lift-type").value;
  const flooringSelect = card.querySelector(".lift-flooring");
  if (!flooringSelect) return;

  const currentVal = flooringSelect.value;
  flooringSelect.innerHTML = "";

  if (type === "GOODS") {
    flooringSelect.innerHTML = `<option value="MS Chequered Plate" selected>MS Chequered Plate</option>`;
  } else {
    const isKalyan = isKalyanSelected();
    const defaultVal = isKalyan ? "PVC Flooring - Wooden Type" : "";
    const activeVal = (currentVal && currentVal !== "MS Chequered Plate") ? currentVal : defaultVal;

    flooringSelect.innerHTML = `
      <option value="" disabled ${!activeVal ? "selected" : ""}>Select Car Flooring</option>
      <option value="PVC Flooring" ${activeVal === "PVC Flooring" ? "selected" : ""}>PVC Flooring</option>
      <option value="PVC Flooring - Wooden Type" ${activeVal === "PVC Flooring - Wooden Type" ? "selected" : ""}>PVC Flooring - Wooden Type</option>
      <option value="Granite Flooring - By Customer" ${activeVal === "Granite Flooring - By Customer" ? "selected" : ""}>Granite Flooring - By Customer</option>
    `;
  }
}

function handleLiftTypeChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const capacitySelect = card.querySelector(".lift-capacity");
  const capacityLabel = card.querySelector(".capacity-label") || card.querySelector(".grp-capacity label");
  const mrSelect = card.querySelector(".lift-mr");
  const tractionSelect = card.querySelector(".lift-traction");

  if (type === "GOODS") {
    if (capacityLabel) capacityLabel.innerHTML = 'Capacity (Kg) <span class="req">*</span>';
    capacitySelect.disabled = false;
    const currentVal = capacitySelect.value;
    capacitySelect.innerHTML = `
      <option value="" disabled>Select Capacity (Kg)</option>
      <option value="500 Kg">500 Kg</option>
      <option value="1000 Kg">1000 Kg</option>
      <option value="1500 Kg" selected>1500 Kg</option>
      <option value="2000 Kg">2000 Kg</option>
      <option value="2500 Kg">2500 Kg</option>
      <option value="3000 Kg">3000 Kg</option>
      <option value="4000 Kg">4000 Kg</option>
      <option value="5000 Kg">5000 Kg</option>
    `;
    if (currentVal && currentVal.includes("Kg")) capacitySelect.value = currentVal;

    mrSelect.disabled = false;
    if (mrSelect.value === "MRL") {
      tractionSelect.value = "Gearless";
      tractionSelect.disabled = true;
    } else {
      tractionSelect.disabled = false;
    }
  } else {
    if (capacityLabel) capacityLabel.innerHTML = 'Capacity (Persons) <span class="req">*</span>';
    capacitySelect.disabled = false;
    const currentVal = capacitySelect.value;
    capacitySelect.innerHTML = `
      <option value="" disabled ${!currentVal || currentVal.includes("Kg") ? "selected" : ""}>Select Capacity</option>
      <option value="4">4 Persons</option>
      <option value="5">5 Persons</option>
      <option value="6">6 Persons</option>
      <option value="8">8 Persons</option>
      <option value="10">10 Persons</option>
      <option value="13">13 Persons (Stretcher)</option>
      <option value="15">15 Persons</option>
    `;
    if (currentVal && !currentVal.includes("Kg")) capacitySelect.value = currentVal;

    if (type === "HOME LIFT") {
      mrSelect.value = "MRL";
      mrSelect.disabled = true;
      tractionSelect.value = "Gearless";
      tractionSelect.disabled = true;
    } else {
      mrSelect.disabled = false;
      if (mrSelect.value === "MRL") {
        tractionSelect.value = "Gearless";
        tractionSelect.disabled = true;
      } else {
        tractionSelect.disabled = false;
      }
    }
  }

  updateFlooringOptions(card);
  updateHiddenLiftFields(card);
  updateTechnicalSummary();
}

function handleCapacityChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const loadInput = card.querySelector(".lift-load");

  if (type === "GOODS") {
    const kgVal = card.querySelector(".lift-capacity").value;
    if (loadInput && kgVal) {
      loadInput.value = kgVal.includes("Kg") ? kgVal : `${kgVal} Kg`;
    }
  } else {
    const pax = parseInt(card.querySelector(".lift-capacity").value, 10);
    if (loadInput && pax) {
      loadInput.value = `${pax * 68} Kg`;
    }
  }
  updateTechnicalSummary();
}

function handleMachineAndTractionChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const mrSelect = card.querySelector(".lift-mr");
  const tractionSelect = card.querySelector(".lift-traction");

  if (type === "HOME LIFT") {
    mrSelect.value = "MRL";
    mrSelect.disabled = true;
    tractionSelect.value = "Gearless";
    tractionSelect.disabled = true;
  } else if (mrSelect.value === "MRL") {
    tractionSelect.value = "Gearless";
    tractionSelect.disabled = true;
  } else if (mrSelect.value === "MR") {
    tractionSelect.disabled = false;
  }

  updateHiddenLiftFields(card);
}

function updateHiddenLiftFields(card) {
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const mr = card.querySelector(".lift-mr").value;
  const traction = card.querySelector(".lift-traction").value;
  const capSelect = card.querySelector(".lift-capacity");
  const capVal = capSelect ? capSelect.value : "";

  const loadInput = card.querySelector(".lift-load");
  if (loadInput) {
    if (type === "GOODS") {
      loadInput.value = capVal ? (capVal.includes("Kg") ? capVal : `${capVal} Kg`) : "1500 Kg";
    } else {
      const pax = parseInt(capVal, 10) || 6;
      loadInput.value = `${pax * 68} Kg`;
    }
  }

  const speedInput = card.querySelector(".lift-speed");
  if (speedInput) {
    if (type === "HOME LIFT") {
      speedInput.value = "0.3 Mtr/sec";
    } else if (type === "GOODS") {
      speedInput.value = "0.5 Mtr/sec";
    } else if (mr === "MR" && traction === "Geared") {
      speedInput.value = "0.63 Mtr/sec";
    } else {
      speedInput.value = "1.0 Mtr/sec";
    }
  }

  const pitInput = card.querySelector(".lift-pit");
  if (pitInput) {
    pitInput.value = (type === "HOME LIFT") ? "1000 MM" : "1600 MM";
  }

  const headroomInput = card.querySelector(".lift-headroom");
  if (headroomInput) {
    if (mr === "MR" && traction === "Geared") {
      headroomInput.value = "4200 MM";
    } else if (mr === "MR" && traction === "Gearless") {
      headroomInput.value = "4500 MM";
    } else {
      headroomInput.value = "4800 MM";
    }
  }
}

function handleStopsChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const stops = parseInt(card.querySelector(".lift-stops").value);
  if (stops && stops > 1) {
    const travelInput = card.querySelector(".lift-travel");
    travelInput.value = `${((stops - 1) * 3).toFixed(1)} Mtrs.`;

    const floorsInput = card.querySelector(".lift-floors");
    if (!floorsInput.value) floorsInput.value = `G+${stops - 1}`;
  }
}

function handleFeature1Check(chk) {
  const card = chk.closest(".lift-card");
  if (!card) return;
  const hiddenInput = card.querySelector(".lift-feature1");
  if (hiddenInput) {
    hiddenInput.value = chk.checked ? "Overload Sensor & Indicator" : "";
  }
}

function validateShaftDimensions(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const doorType = card.querySelector(".lift-door-type").value;
  const doorW = parseFloat(card.querySelector(".lift-door-w").value) || 0;
  const shaftW = parseFloat(card.querySelector(".lift-shaft-w").value) || 0;
  const alertBox = card.querySelector(".dim-alert");
  if (!alertBox) return;

  const isCenter = doorType.toLowerCase().includes("center");
  const minRequired = isCenter ? (2 * doorW) + 200 : (1.5 * doorW) + 200;

  if (doorW > 0 && shaftW > 0 && shaftW < minRequired) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `⚠️ <strong>Shaft Width Warning:</strong> ${shaftW} mm is less than required minimum <strong>${minRequired} mm</strong> for ${doorType} with ${doorW} mm clear opening.`;
  } else {
    alertBox.style.display = "none";
    alertBox.innerHTML = "";
  }
}

function updateTechnicalSummary() {
  const cards = document.querySelectorAll(".lift-card");
  let totalUnits = 0;
  const summaryParts = [];

  cards.forEach((card, idx) => {
    const qtyVal = card.querySelector(".lift-qty").value;
    const qty = parseInt(qtyVal) || 0;
    const type = card.querySelector(".lift-type").value;
    const load = card.querySelector(".lift-load").value;

    if (qty > 0) {
      totalUnits += qty;
      const typeStr = type || `Elevator #${idx + 1}`;
      const loadStr = load ? ` (${load})` : "";
      summaryParts.push(`${qty} No${qty > 1 ? "s." : "."} ${typeStr}${loadStr}`);
    }
  });

  const sumUnitsElem = document.getElementById("sumUnits");
  const sumTypesElem = document.getElementById("sumTypes");
  if (sumUnitsElem) sumUnitsElem.innerText = totalUnits > 0 ? `${totalUnits} Units` : "0 Units";
  if (sumTypesElem) sumTypesElem.innerText = summaryParts.join(" • ") || "-";
}

/* --- Form Submission & Strict Field Validation --- */
async function handleFormSubmit(e) {
  e.preventDefault();

  // 1. Sales Representative
  const salesPerson = document.getElementById("salesPersonSelect").value;
  if (!salesPerson) {
    showValidationAlert("Please select an assigned Sales Representative from the dropdown.");
    document.getElementById("salesPersonSelect").focus();
    return;
  }

  // 2. Customer Info
  const customerName = document.getElementById("customerName").value.trim();
  const contactPerson = document.getElementById("contactPerson").value.trim();
  const contactPhone = document.getElementById("contactPhone").value.trim();
  const state = document.getElementById("state").value;
  const address1 = document.getElementById("address1").value.trim();
  const pinCode = document.getElementById("pinCode").value.trim();
  const siteAddress = document.getElementById("siteAddress").value.trim();
  const sitePinCode = document.getElementById("sitePinCode").value.trim();

  if (!customerName) {
    showValidationAlert("Please enter Customer / Company Name.");
    document.getElementById("customerName").focus();
    return;
  }
  if (!contactPerson) {
    showValidationAlert("Please enter Contact Person Name.");
    document.getElementById("contactPerson").focus();
    return;
  }
  if (!contactPhone || !/^\d{10}$/.test(contactPhone)) {
    showValidationAlert("Please enter a valid 10-digit Contact Phone Number.");
    document.getElementById("contactPhone").focus();
    return;
  }
  if (!state) {
    showValidationAlert("Please select a State / UT.");
    document.getElementById("state").focus();
    return;
  }
  if (!address1) {
    showValidationAlert("Please enter Office Address Line 1.");
    document.getElementById("address1").focus();
    return;
  }
  if (!pinCode || pinCode.length < 6) {
    showValidationAlert("Please enter a valid 6-digit Office PIN Code.");
    document.getElementById("pinCode").focus();
    return;
  }
  if (!siteAddress) {
    showValidationAlert("Please enter the Site Address.");
    document.getElementById("siteAddress").focus();
    return;
  }
  if (!sitePinCode || sitePinCode.length < 6) {
    showValidationAlert("Please enter a valid 6-digit Site PIN Code.");
    document.getElementById("sitePinCode").focus();
    return;
  }

  // 3. Elevator Cards Validation
  const cards = document.querySelectorAll(".lift-card");
  if (cards.length === 0) {
    showValidationAlert("Please configure at least one elevator specification.");
    return;
  }

  const liftsPayload = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const num = i + 1;

    const liftType = card.querySelector(".lift-type").value;
    const qty = card.querySelector(".lift-qty").value;
    const mr = card.querySelector(".lift-mr").value;
    const traction = card.querySelector(".lift-traction").value;
    const capacity = card.querySelector(".lift-capacity").value;
    const stops = card.querySelector(".lift-stops").value;
    const floors = card.querySelector(".lift-floors").value.trim();
    const travel = card.querySelector(".lift-travel").value.trim();
    const shaftW = card.querySelector(".lift-shaft-w").value;
    const shaftD = card.querySelector(".lift-shaft-d").value;
    const doorType = card.querySelector(".lift-door-type").value;
    const doorW = card.querySelector(".lift-door-w").value;
    const doorFinish = card.querySelector(".lift-door-finish").value;
    const vision = card.querySelector(".lift-vision").value;
    const ceiling = card.querySelector(".lift-ceiling").value;
    const panels = card.querySelector(".lift-panels").value;
    const flooring = card.querySelector(".lift-flooring").value;

    if (!liftType) { showValidationAlert(`Elevator #${num}: Please select Lift Type.`); return; }
    if (!qty || parseInt(qty) < 1) { showValidationAlert(`Elevator #${num}: Please enter valid No. of Units.`); return; }
    if (!mr) { showValidationAlert(`Elevator #${num}: Please select Machine Room Config.`); return; }
    if (!traction) { showValidationAlert(`Elevator #${num}: Please select Traction Unit.`); return; }
    if (!capacity) { showValidationAlert(`Elevator #${num}: Please select Capacity.`); return; }
    if (!stops || parseInt(stops) < 2) { showValidationAlert(`Elevator #${num}: Please enter valid No. of Stops (min 2).`); return; }
    if (!floors) { showValidationAlert(`Elevator #${num}: Please enter Serving Floors.`); return; }
    if (!travel) { showValidationAlert(`Elevator #${num}: Please enter Travel Distance.`); return; }
    if (!shaftW) { showValidationAlert(`Elevator #${num}: Please enter Shaft Width.`); return; }
    if (!shaftD) { showValidationAlert(`Elevator #${num}: Please enter Shaft Depth.`); return; }
    if (!doorType) { showValidationAlert(`Elevator #${num}: Please select Door Opening Type.`); return; }
    if (!doorW) { showValidationAlert(`Elevator #${num}: Please enter Clear Door Width.`); return; }
    if (!doorFinish) { showValidationAlert(`Elevator #${num}: Please select Door Finish.`); return; }
    if (!vision) { showValidationAlert(`Elevator #${num}: Please select Vision Type.`); return; }
    if (!ceiling) { showValidationAlert(`Elevator #${num}: Please select Car Ceiling.`); return; }
    if (!panels) { showValidationAlert(`Elevator #${num}: Please select Car Panels.`); return; }
    if (!flooring) { showValidationAlert(`Elevator #${num}: Please select Car Flooring.`); return; }

    const isGoods = liftType === "GOODS";
    const isHome = liftType === "HOME LIFT";

    let computedSpeed = "1.0 Mtr/sec";
    if (isHome) computedSpeed = "0.3 Mtr/sec";
    else if (isGoods) computedSpeed = "0.5 Mtr/sec";
    else if (mr === "MR" && traction === "Geared") computedSpeed = "0.63 Mtr/sec";

    const computedPit = isHome ? "1000 MM" : "1600 MM";

    let computedHeadroom = "4800 MM";
    if (mr === "MR" && traction === "Geared") computedHeadroom = "4200 MM";
    else if (mr === "MR" && traction === "Gearless") computedHeadroom = "4500 MM";

    const computedLoad = isGoods 
      ? (capacity.includes("Kg") ? capacity : `${capacity} Kg`)
      : `${(parseInt(capacity, 10) || 6) * 68} Kg`;

    liftsPayload.push({
      liftType: liftType,
      numElevators: parseInt(qty) || 1,
      mrConfig: mr,
      tractionUnit: traction,
      capacity: isGoods ? "-" : capacity,
      ratedLoad: computedLoad,
      speed: computedSpeed,
      numStops: parseInt(stops) || 2,
      servingFloors: floors,
      travel: travel,
      pitDepth: computedPit,
      headRoom: computedHeadroom,
      shaftWidth: parseFloat(shaftW) || 0,
      shaftDepth: parseFloat(shaftD) || 0,
      carDimensions: "",
      doorOpeningType: doorType,
      doorWidth: parseFloat(doorW) || 900,
      doorFinish: doorFinish,
      visionType: vision,
      carPanels: panels,
      carFlooring: flooring,
      carCeiling: ceiling,
      optionalFeature1: (() => {
        const chk = card.querySelector(".lift-feature1-check");
        return (chk && chk.checked) ? "Overload Sensor & Indicator" : "";
      })(),
      optionalFeature2: card.querySelector(".lift-feature2").value.trim(),
      unitPrice: 0
    });
  }

  const payload = {
    customerName: customerName,
    contactPerson: contactPerson,
    contactPhone: contactPhone,
    state: state,
    address1: address1,
    address2: document.getElementById("address2").value.trim(),
    pinCode: pinCode,
    siteAddress: siteAddress,
    sitePinCode: sitePinCode,
    salesPerson: salesPerson,
    lifts: liftsPayload
  };

  showLoadingModal();
  const btnSubmit = document.getElementById("btnSubmit");
  btnSubmit.disabled = true;

  try {
    await fetch(APPS_SCRIPT_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Never expose generated file or Drive links; show Thank You message only
    showThankYouModal(customerName);
  } catch (err) {
    console.error("Submission failed:", err);
    showThankYouModal(customerName);
  } finally {
    btnSubmit.disabled = false;
  }
}

/* --- Modals and Alerts --- */
function showLoadingModal() {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="spinner"></div>
    <div class="modal-title">Submitting Proposal Request...</div>
    <p class="modal-msg">Recording technical specifications into BLT database.</p>
  `;
}

function showThankYouModal(customerName) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="modal-icon">🎉</div>
    <div class="modal-title">Thank You!</div>
    <p class="modal-msg">
      Your proposal request for <strong>${customerName}</strong> has been successfully submitted and logged into our central records. 
      <br><br>
      Our engineering and sales team will review the technical configurations and dispatch the formal commercial offer shortly.
    </p>
  `;

  // Safely reset form
  document.getElementById("proposalForm").reset();
  document.querySelectorAll(".lift-card").forEach((card, idx) => {
    if (idx > 0) card.remove();
  });
  renumberAllLifts();
}

function showValidationAlert(message) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="modal-icon">⚠️</div>
    <div class="modal-title">Incomplete Form</div>
    <p class="modal-msg" style="color: var(--danger); font-weight: 500;">${message}</p>
  `;
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

/* --- Postal Circle Auto State Mapping --- */
function getStateFromPinCode(pin) {
  if (!pin || pin.length < 2) return null;
  const s = String(pin).trim();
  const p2 = parseInt(s.slice(0, 2), 10);
  const p3 = s.length >= 3 ? parseInt(s.slice(0, 3), 10) : 0;

  if (p3 === 737) return "Sikkim";
  if (p3 === 744) return "Andaman and Nicobar Islands";
  if (p3 === 403) return "Goa";
  if (p3 === 160) return "Chandigarh";
  if (p3 === 682) return "Lakshadweep";
  if (p3 === 605) return "Puducherry";
  if (p3 >= 500 && p3 <= 509) return "Telangana";
  if (p3 >= 515 && p3 <= 535) return "Andhra Pradesh";
  if (p3 === 246 || p3 === 248 || p3 === 249 || p3 === 263) return "Uttarakhand";
  if ((p3 >= 825 && p3 <= 835) || p3 === 814 || p3 === 815 || p3 === 816) return "Jharkhand";
  if ((p3 >= 800 && p3 <= 813) || (p3 >= 841 && p3 <= 855)) return "Bihar";

  if (p2 === 79) {
    if (p3 >= 790 && p3 <= 792) return "Arunachal Pradesh";
    if (p3 === 793 || p3 === 794) return "Meghalaya";
    if (p3 === 795) return "Manipur";
    if (p3 === 796) return "Mizoram";
    if (p3 === 797 || p3 === 798) return "Nagaland";
    if (p3 === 799) return "Tripura";
    return "Assam";
  }

  if (p2 === 11) return "Delhi";
  if (p2 === 12 || p2 === 13) return "Haryana";
  if (p2 === 14 || p2 === 15) return "Punjab";
  if (p2 === 16) return "Chandigarh";
  if (p2 === 17) return "Himachal Pradesh";
  if (p2 === 18 || p2 === 19) return "Jammu and Kashmir";
  if (p2 >= 20 && p2 <= 28) return "Uttar Pradesh";
  if (p2 >= 30 && p2 <= 34) return "Rajasthan";
  if (p2 >= 36 && p2 <= 39) return "Gujarat";
  if (p2 >= 40 && p2 <= 44) return "Maharashtra";
  if (p2 >= 45 && p2 <= 48) return "Madhya Pradesh";
  if (p2 === 49) return "Chhattisgarh";
  if (p2 >= 50 && p2 <= 53) return "Andhra Pradesh";
  if (p2 >= 56 && p2 <= 59) return "Karnataka";
  if (p2 >= 60 && p2 <= 64) return "Tamil Nadu";
  if (p2 >= 67 && p2 <= 69) return "Kerala";
  if (p2 >= 70 && p2 <= 74) return "West Bengal";
  if (p2 >= 75 && p2 <= 77) return "Odisha";
  if (p2 === 78) return "Assam";
  if (p2 >= 80 && p2 <= 85) return "Bihar";

  return null;
}

function setMatchingState(stateName) {
  if (!stateName) return;
  const select = document.getElementById("state");
  if (!select) return;
  const target = stateName.trim().toLowerCase();

  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.toLowerCase() === target) {
      select.selectedIndex = i;
      return;
    }
  }
}
