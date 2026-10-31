/**
 * BLT Brilliant Lifts & Escalators - Proposal Generator Frontend Engine
 * Interactive Edition (v3)
 * Features:
 * 1. State dropdown with default = Odisha for Bikash & Bijaya, West Bengal for others.
 * 2. Site PIN Code placed after Site Address.
 * 3. All technical specification blocks start completely EMPTY until user selects/inputs.
 * 4. Removed Glass / Frameless option from Door Finish.
 * 5. Removed Marble Stone Flooring option from Car Flooring.
 * 6. Continuous dynamic lift index numbering (1, 2, 3...) without skipping on add/remove/re-add.
 */

// Replace this with your Google Apps Script Web App Deployment URL
const APPS_SCRIPT_WEB_APP_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// Comprehensive list of sales team members from the database sheet
let salesTeamData = [
  { name: "KANCHAN DASGUPTA", designation: "ENGINEER – SALES", phone: "+91 98321 40598", email: "sales@bltbrilliant.com" },
  { name: "SOURAV BASAK", designation: "SR. EXECUTIVE – SALES", phone: "+91 81005 76967", email: "sales@bltbrilliant.com" },
  { name: "SANJEEV KUMAR SINGH", designation: "ASST. MANAGER – SALES & SERVICE", phone: "+91 70015 64906", email: "sales@bltbrilliant.com" },
  { name: "ARNAB DUTTA", designation: "ENGINEER – SALES", phone: "+91 90077 70329", email: "sales@bltbrilliant.com" },
  { name: "BIKASH NAYAK", designation: "ENGINEER – SALES & SERVICE", phone: "+91 63620 09323", email: "bikash@bltbrilliant.com" },
  { name: "BIJAYA KUMAR PRADHAN", designation: "BRANCH MANAGER – ODISHA", phone: "+91 96925 80228", email: "bijaya@bltbrilliant.com" },
  { name: "KALYAN CHATTERJEE", designation: "MANAGER – SALES", phone: "+91 99030 71732", email: "kalyan@bltbrilliant.com" },
  { name: "JOY MUKHERJEE", designation: "MANAGER – SALES", phone: "+91 97694 35113", email: "joy@bltbrilliant.com" },
  { name: "KARTICK BASAK", designation: "ASST. MANAGER – SALES & SERVICE", phone: "+91 70015 64906", email: "sales@bltbrilliant.com" }
];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Sales Team Profile
  initSalesTeamProfile();

  // 2. Setup Checkpoints & Phone Number Restrictions
  setupFormCheckpointsAndValidation();

  // 3. Add first lift card on page load if not already in HTML
  if (document.querySelectorAll(".lift-card").length === 0) {
    addLiftCard();
  } else {
    renumberAllLifts();
  }

  // 4. Attach button listeners
  document.getElementById("btnAddLift").addEventListener("click", () => {
    addLiftCard();
  });

  document.getElementById("proposalForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("btnModalClose").addEventListener("click", closeModal);
});

/**
 * Initializes and populates the Sales Person profile section in the upper right
 */
async function initSalesTeamProfile() {
  populateSalesDropdown(salesTeamData);

  if (APPS_SCRIPT_WEB_APP_URL && !APPS_SCRIPT_WEB_APP_URL.includes("YOUR_APPS_SCRIPT")) {
    try {
      const response = await fetch(`${APPS_SCRIPT_WEB_APP_URL}?action=getSalesTeam`);
      const resData = await response.json();
      if (resData.status === "success" && Array.isArray(resData.salesTeam) && resData.salesTeam.length > 0) {
        salesTeamData = resData.salesTeam;
        populateSalesDropdown(salesTeamData);
      }
    } catch (e) {
      console.log("Using default/cached sales team:", e);
    }
  }
}

function populateSalesDropdown(team) {
  const select = document.getElementById("salesPersonSelect");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = "";

  team.forEach((rep, idx) => {
    const opt = document.createElement("option");
    opt.value = rep.name;
    opt.text = rep.name;
    if (idx === 0) opt.selected = true;
    select.appendChild(opt);
  });

  if (currentVal) {
    select.value = currentVal;
  }

  select.addEventListener("change", handleSalesPersonChange);
  handleSalesPersonChange();
}

/**
 * Requirement 1: State dropdown where default is Odisha for Bikash & Bijaya,
 * and West Bengal for others.
 */
function handleSalesPersonChange() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select.value || "").toUpperCase();
  const rep = salesTeamData.find(r => r.name.toUpperCase() === selectedName) || salesTeamData[0];

  if (rep) {
    document.getElementById("salesDesignation").innerText = rep.designation || "SALES EXECUTIVE";
    document.getElementById("salesPhone").innerText = rep.phone || "+91 70015 64906";
    document.getElementById("salesEmail").innerText = rep.email || "sales@bltbrilliant.com";
  }

  // Set default state based on sales person territory
  const stateSelect = document.getElementById("state");
  if (stateSelect) {
    if (selectedName.includes("BIKASH") || selectedName.includes("BIJAYA")) {
      stateSelect.value = "Odisha";
    } else {
      stateSelect.value = "West Bengal";
    }
  }
}

/**
 * Requirement 2: Checkpoints for Customer/Contact and Office/Site Address auto-syncing
 * with Site PIN Code placed after Site Address.
 */
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

  // --- Checkpoint 1: Same as Customer Name ---
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

  // --- Checkpoint 2: Same as Office Address & PIN ---
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
  pinCode.addEventListener("input", () => {
    pinCode.value = pinCode.value.replace(/\D/g, "").slice(0, 6);
    if (chkSameAddress.checked) {
      sitePinCode.value = pinCode.value;
    }
  });

  sitePinCode.addEventListener("input", () => {
    sitePinCode.value = sitePinCode.value.replace(/\D/g, "").slice(0, 6);
  });

  // --- Phone Number: 10 Digits Only ---
  contactPhone.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  contactPhone.addEventListener("paste", function(e) {
    setTimeout(() => {
      this.value = this.value.replace(/^\+?91/, "").replace(/\D/g, "").slice(0, 10);
    }, 10);
  });
}

/**
 * Requirement 3: All technical specifications remain completely EMPTY initially.
 * Requirement 4: Removed Glass / Frameless from Door Finish.
 * Requirement 5: Removed Marble Stone Flooring from Car Flooring.
 * Requirement 6: Continuous sequential numbering (1, 2, 3...) without skipping.
 */
function addLiftCard() {
  const container = document.getElementById("liftsContainer");
  const card = document.createElement("div");
  card.className = "lift-card";

  card.innerHTML = `
    <div class="lift-card-header">
      <div class="lift-badge">Elevator Specification</div>
      <button type="button" class="btn-remove-lift" onclick="removeLiftCard(this)">✕ Remove Elevator</button>
    </div>

    <!-- Basic Configuration -->
    <div class="grid-4">
      <div class="form-group">
        <label>Lift Type <span class="req">*</span></label>
        <select class="form-control lift-type" required onchange="handleLiftTypeChange(this)">
          <option value="" disabled selected>-- Select Lift Type --</option>
          <option value="PASSENGER">Passenger Elevator</option>
          <option value="HOME LIFT">Home Lift / Villa</option>
          <option value="STRETCHER">Stretcher / Hospital Lift</option>
          <option value="GOODS">Goods / Freight Lift</option>
        </select>
      </div>

      <div class="form-group">
        <label>No. of Units <span class="req">*</span></label>
        <input type="number" class="form-control lift-qty" value="" placeholder="e.g. 1" min="1" max="50" inputmode="numeric" required oninput="updateTechnicalSummary()">
      </div>

      <div class="form-group">
        <label>Machine Room Config <span class="req">*</span></label>
        <select class="form-control lift-mr" required onchange="handleMachineAndTractionChange(this)">
          <option value="" disabled selected>-- Select MR / MRL --</option>
          <option value="MRL">MRL (Machine Room Less)</option>
          <option value="MR">MR (Machine Room)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Traction Unit <span class="req">*</span></label>
        <select class="form-control lift-traction" required onchange="handleMachineAndTractionChange(this)">
          <option value="" disabled selected>-- Select Traction --</option>
          <option value="Gearless">Gearless</option>
          <option value="Geared">Geared</option>
        </select>
      </div>
    </div>

    <!-- Capacity, Speed, Stops -->
    <div class="grid-4">
      <div class="form-group grp-capacity">
        <label>Capacity (Persons) <span class="req">*</span></label>
        <select class="form-control lift-capacity" required onchange="handleCapacityChange(this)">
          <option value="" disabled selected>-- Select Capacity --</option>
          <option value="4">4 Persons</option>
          <option value="6">6 Persons</option>
          <option value="8">8 Persons</option>
          <option value="10">10 Persons</option>
          <option value="13">13 Persons (Stretcher)</option>
          <option value="15">15 Persons</option>
          <option value="20">20 Persons</option>
        </select>
      </div>

      <div class="form-group">
        <label>Rated Load (Kg) <span class="req">*</span></label>
        <input type="text" class="form-control lift-load" value="" placeholder="e.g. 884 Kg" required>
      </div>

      <div class="form-group">
        <label>Speed (Mtr/sec) <span class="req">*</span></label>
        <select class="form-control lift-speed" required>
          <option value="" disabled selected>-- Select Speed --</option>
          <option value="0.5 Mtr/sec">0.5 Mtr/sec</option>
          <option value="0.63 Mtr/sec">0.63 Mtr/sec</option>
          <option value="1.0 Mtr/sec">1.0 Mtr/sec</option>
          <option value="1.5 Mtr/sec">1.5 Mtr/sec</option>
          <option value="1.75 Mtr/sec">1.75 Mtr/sec</option>
        </select>
      </div>

      <div class="form-group">
        <label>No. of Stops <span class="req">*</span></label>
        <input type="number" class="form-control lift-stops" value="" placeholder="e.g. 6" min="2" max="60" inputmode="numeric" required oninput="handleStopsChange(this)">
      </div>
    </div>

    <!-- Floors, Travel, Headroom -->
    <div class="grid-3">
      <div class="form-group">
        <label>Serving Floors <span class="req">*</span></label>
        <input type="text" class="form-control lift-floors" value="" placeholder="e.g. G+5 or B+G+4" required>
      </div>

      <div class="form-group">
        <label>Travel Distance (Mtrs) <span class="req">*</span></label>
        <input type="text" class="form-control lift-travel" value="" placeholder="e.g. 15.0 Mtrs." required>
      </div>

      <div class="form-group">
        <label>Head Room (MM) <span class="req">*</span></label>
        <input type="text" class="form-control lift-headroom" value="" placeholder="e.g. 4800 MM" required>
      </div>
    </div>

    <!-- Shaft Dimensions & Door Specs -->
    <div class="grid-4">
      <div class="form-group">
        <label>Shaft Width (W in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-w" value="" placeholder="e.g. 2050" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>

      <div class="form-group">
        <label>Shaft Depth (D in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-d" value="" placeholder="e.g. 2050" inputmode="numeric" required>
      </div>

      <div class="form-group">
        <label>Door Opening Type <span class="req">*</span></label>
        <select class="form-control lift-door-type" required onchange="validateShaftDimensions(this)">
          <option value="" disabled selected>-- Select Door Opening --</option>
          <option value="Automatic Center Opening Door">Center Opening Door</option>
          <option value="Automatic Telescopic Opening Door">Telescopic Opening Door</option>
        </select>
      </div>

      <div class="form-group">
        <label>Clear Door Width (MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-door-w" value="" placeholder="e.g. 900" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>
    </div>

    <!-- Live Dimension Warning Alert -->
    <div class="dim-alert"></div>

    <!-- Door Finishes & Vision -->
    <div class="grid-2">
      <div class="form-group">
        <label>Door Finish <span class="req">*</span></label>
        <select class="form-control lift-door-finish" required>
          <option value="" disabled selected>-- Select Door Finish --</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated">MS Powder Coated</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Vision Type</label>
        <select class="form-control lift-vision">
          <option value="" disabled selected>-- Select Vision Type --</option>
          <option value="No Vision">No Vision</option>
          <option value="Small Glass Vision">Small Glass Vision</option>
          <option value="Half Glass Vision">Half Glass Vision</option>
          <option value="Full Glass Vision">Full Glass Vision</option>
        </select>
      </div>
    </div>

      <div class="form-group">
        <label>Car Panels <span class="req">*</span></label>
        <select class="form-control lift-panels" required>
          <option value="" disabled selected>-- Select Car Panels --</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated">MS Powder Coated</option>
          <option value="SS Mirror Gold">SS Mirror Gold</option>
        </select>
      </div>
    <!-- Cabin Finishes & Design -->
    <div class="grid-3">
      <div class="form-group">
        <label>Car Ceiling <span class="req">*</span></label>
        <select class="form-control lift-ceiling" required>
          <option value="" disabled selected>-- Select Car Ceiling --</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated Finish">MS Powder Coated Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Car Flooring <span class="req">*</span></label>
        <select class="form-control lift-flooring" required>
          <option value="" disabled selected>-- Select Car Flooring --</option>
          <option value="PVC Flooring">PVC Flooring</option>
          <option value="MS Chequered Plate">MS Chequered Plate</option>
          <option value="Granite Stone Flooring">Granite Stone Flooring</option>
        </select>
      </div>
      </div>
    </div>

    <!-- Car Dimensions & Optional Features -->
    <div class="grid-3">
      <div class="form-group">
        <label>Car Dimension (W x D) MM</label>
        <input type="text" class="form-control lift-cardim" placeholder="e.g. 1580 x 1300 or as per GA Drawing">
      </div>

      <div class="form-group">
        <label>Optional Feature 1</label>
        <input type="text" class="form-control lift-feature1" placeholder="e.g. Voice Announcement System">
      </div>

      <div class="form-group">
        <label>Optional Feature 2</label>
        <input type="text" class="form-control lift-feature2" placeholder="e.g. Overload Sensor & Indicator">
      </div>
    </div>
  `;

  container.appendChild(card);
  renumberAllLifts();
}

/**
 * Removes a lift card and renumbers remaining cards continuously (1, 2, 3...)
 */
function removeLiftCard(btnOrElement) {
  const card = btnOrElement.closest(".lift-card");
  if (card) {
    card.remove();
    renumberAllLifts();
  }
}

/**
 * Requirement 6: Renumber all elevator cards sequentially without any gaps or skips.
 */
function renumberAllLifts() {
  const cards = document.querySelectorAll(".lift-card");
  cards.forEach((card, idx) => {
    const liftNum = idx + 1;
    card.id = `liftCard_${liftNum}`;
    card.dataset.liftIndex = liftNum;

    const badge = card.querySelector(".lift-badge");
    if (badge) {
      badge.innerText = `Elevator #${liftNum} Specification`;
    }

    const alertBox = card.querySelector(".dim-alert");
    if (alertBox) {
      alertBox.id = `dimAlert_${liftNum}`;
    }
  });

  updateRemoveButtonsVisibility();
  updateTechnicalSummary();
}

function updateRemoveButtonsVisibility() {
  const cards = document.querySelectorAll(".lift-card");
  const buttons = document.querySelectorAll(".btn-remove-lift");
  buttons.forEach(btn => {
    btn.style.display = cards.length > 1 ? "block" : "none";
  });
}

/**
 * Handles Lift Type selection
 */
function handleLiftTypeChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const capacitySelect = card.querySelector(".lift-capacity");
  // If GOODS is selected, passenger capacity is not applicable
  if (type === "GOODS") {
    capacitySelect.disabled = true;
    capacitySelect.value = "";
  } else {
    capacitySelect.disabled = false;

  }

  // No fields are autofilled when choosing Lift Type; all remain empty for user input
  updateTechnicalSummary();
}
/**
 * Handles Machine Room (MR/MRL) and Traction (Gearless/Geared) transitions
 */
function handleMachineAndTractionChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const mr = card.querySelector(".lift-mr").value;
  const traction = card.querySelector(".lift-traction");


  if (mr === "MRL") {
    traction.value = "Gearless";
    traction.disabled = true;
  } else if (mr === "MR") {
  } else if (mr === "MR") {
    traction.disabled = false;
  }

  updateSpeedOptions(card);
}

/**
 * Dynamic Speed management:
 * Machine Room (MR) + Geared restricts speed to: 0.63, 0.7, 1.0 Mtr/sec ONLY
 */
function updateSpeedOptions(card) {
  if (!card) return;

  const mr = card.querySelector(".lift-mr").value;
  const traction = card.querySelector(".lift-traction").value;
  const speedSelect = card.querySelector(".lift-speed");
  const currentSpeed = speedSelect.value;

  let allowedSpeeds = [];
  if (mr === "MR" && traction === "Geared") {
    allowedSpeeds = ["0.63 Mtr/sec", "0.7 Mtr/sec", "1.0 Mtr/sec"];
  } else {
    allowedSpeeds = ["0.5 Mtr/sec", "0.63 Mtr/sec", "1.0 Mtr/sec", "1.5 Mtr/sec", "1.75 Mtr/sec"];
  }

  speedSelect.innerHTML = `<option value="" disabled ${!currentSpeed ? "selected" : ""}>-- Select Speed --</option>`;
  allowedSpeeds.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.text = s;
    if (s === currentSpeed) {
      opt.selected = true;
    }
    speedSelect.appendChild(opt);
  });
}

/**
 * Rated load calculation (Pax * 68 Kg)
 */
function handleCapacityChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const pax = parseInt(card.querySelector(".lift-capacity").value);
  if (pax) {
    const loadInput = card.querySelector(".lift-load");
    loadInput.value = `${pax * 68} Kg`;
  }
  updateTechnicalSummary();
}

/**
 * Auto-calculate Travel Height and Serving Floors from stops
 */
function handleStopsChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const stops = parseInt(card.querySelector(".lift-stops").value);
  if (stops && stops > 1) {
    const travelInput = card.querySelector(".lift-travel");
    travelInput.value = `${((stops - 1) * 3).toFixed(1)} Mtrs.`;

    const floorsInput = card.querySelector(".lift-floors");
    if (!floorsInput.value) {
      floorsInput.value = `G+${stops - 1}`;
    }
  }
}

/**
 * Real-time Shaft Dimension Formula Check
 */
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
  const formulaStr = isCenter ? `(2 × ${doorW}) + 200 = ${minRequired} mm` : `(1.5 × ${doorW}) + 200 = ${minRequired} mm`;

  if (doorW > 0 && shaftW > 0 && shaftW < minRequired) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `⚠️ <strong>Shaft Width Warning:</strong> ${shaftW} mm is less than required minimum <strong>${minRequired} mm</strong> for ${doorType} with ${doorW} mm door. [Rule: ${formulaStr}]`;
  } else {
    alertBox.style.display = "none";
    alertBox.innerHTML = "";
  }
}

/**
 * Updates Technical Configuration Summary (Non-Priced)
 */
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

/**
 * Handles Form Submission and sends payload to Apps Script Web App
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  const phoneInput = document.getElementById("contactPhone");
  const phoneVal = phoneInput.value.trim();

  // Strict Phone Validation (exactly 10 numeric digits)
  if (!/^\d{10}$/.test(phoneVal)) {
    alert("Please enter a valid 10-digit phone number without alphabets or special characters.");
    phoneInput.focus();
    return;
  }

  const customerNameVal = document.getElementById("customerName").value.trim();
  if (!customerNameVal) {
    alert("Please enter Customer / Company Name.");
    document.getElementById("customerName").focus();
    return;
  }

  const cards = document.querySelectorAll(".lift-card");
  if (cards.length === 0) {
    alert("Please add at least one elevator specification.");
    return;
  }

  // Validate that user filled basic required technical blocks
  for (let idx = 0; idx < cards.length; idx++) {
    const card = cards[idx];
    const liftNum = idx + 1;
    const typeVal = card.querySelector(".lift-type").value;
    const qtyVal = card.querySelector(".lift-qty").value;
    const mrVal = card.querySelector(".lift-mr").value;
    const loadVal = card.querySelector(".lift-load").value.trim();

    if (!typeVal) {
      alert(`Please select the Lift Type for Elevator #${liftNum}.`);
      card.querySelector(".lift-type").focus();
      return;
    }
    if (!qtyVal || parseInt(qtyVal) < 1) {
      alert(`Please enter the Number of Units for Elevator #${liftNum}.`);
      card.querySelector(".lift-qty").focus();
      return;
    }
    if (!mrVal) {
      alert(`Please select Machine Room Configuration for Elevator #${liftNum}.`);
      card.querySelector(".lift-mr").focus();
      return;
    }
    if (!loadVal) {
      alert(`Please specify the Rated Load for Elevator #${liftNum}.`);
      card.querySelector(".lift-load").focus();
      return;
    }

    const ceilingSelect = card.querySelector(".lift-ceiling");
    if (ceilingSelect && !ceilingSelect.value) {
      alert(`Please select the Car Ceiling for Elevator #${liftNum}.`);
      ceilingSelect.focus();
      return;
    }
  }

  if (!APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL.includes("YOUR_APPS_SCRIPT")) {
    alert("Please configure your APPS_SCRIPT_WEB_APP_URL in script.js before submitting!");
    return;
  }

  const selectedSalesPerson = document.getElementById("salesPersonSelect").value;
  const stateVal = document.getElementById("state").value;

  // 1. Gather Client Information
  const payload = {
    customerName: customerNameVal,
    address1: document.getElementById("address1").value.trim(),
    address2: document.getElementById("address2").value.trim(),
    state: stateVal,
    pinCode: document.getElementById("pinCode").value.trim(),
    contactPerson: document.getElementById("contactPerson").value.trim(),
    contactPhone: phoneVal,
    siteAddress: document.getElementById("siteAddress").value.trim(),
    sitePinCode: document.getElementById("sitePinCode").value.trim(),
    salesPerson: selectedSalesPerson,
    lifts: []
  };

  // 2. Gather All Lift Cards
  let hasDimensionError = false;
  let errorMsg = "";

  cards.forEach((card, idx) => {
    const liftNum = idx + 1;
    const doorType = card.querySelector(".lift-door-type").value;
    const doorW = parseFloat(card.querySelector(".lift-door-w").value) || 0;
    const shaftW = parseFloat(card.querySelector(".lift-shaft-w").value) || 0;

    const isCenter = doorType.toLowerCase().includes("center");
    const minW = isCenter ? (2 * doorW) + 200 : (1.5 * doorW) + 200;

    if (shaftW > 0 && doorW > 0 && shaftW < minW) {
      hasDimensionError = true;
      errorMsg += `\n- Elevator #${liftNum}: Shaft Width (${shaftW}mm) < Minimum (${minW}mm)`;
    }

    const typeVal = card.querySelector(".lift-type").value || "PASSENGER";
    const isGoods = typeVal === "GOODS";

    const liftObj = {
      liftType: typeVal,
      numElevators: parseInt(card.querySelector(".lift-qty").value) || 1,
      mrConfig: card.querySelector(".lift-mr").value || "MRL",
      tractionUnit: card.querySelector(".lift-traction").value || "Gearless",
      capacity: isGoods ? "-" : (card.querySelector(".lift-capacity").value || "6"),
      ratedLoad: card.querySelector(".lift-load").value.trim() || "408 Kg",
      speed: card.querySelector(".lift-speed").value || "1.0 Mtr/sec",
      numStops: parseInt(card.querySelector(".lift-stops").value) || 2,
      servingFloors: card.querySelector(".lift-floors").value.trim() || "G+1",
      travel: card.querySelector(".lift-travel").value.trim() || "3.0 Mtrs.",
      headRoom: card.querySelector(".lift-headroom").value.trim() || "4800 MM",
      shaftWidth: shaftW,
      shaftDepth: parseFloat(card.querySelector(".lift-shaft-d").value) || 0,
      carDimensions: card.querySelector(".lift-cardim").value.trim(),
      doorOpeningType: doorType || "Automatic Center Opening Door",
      doorWidth: doorW || 900,
      doorFinish: card.querySelector(".lift-door-finish").value || "SS Hairline Finish",
      visionType: card.querySelector(".lift-vision").value || "No Vision",
      carPanels: card.querySelector(".lift-panels").value || "SS Hairline Finish",
      carFlooring: card.querySelector(".lift-flooring").value || "PVC Flooring",
      carCeiling: (card.querySelector(".lift-ceiling") && card.querySelector(".lift-ceiling").value) ? card.querySelector(".lift-ceiling").value : "SS Hairline Finish",
      optionalFeature1: card.querySelector(".lift-feature1").value.trim(),
      optionalFeature2: card.querySelector(".lift-feature2").value.trim(),
      unitPrice: 0 // Non-priced edition
    };

    payload.lifts.push(liftObj);
  });

  if (hasDimensionError) {
    const proceed = confirm(`Shaft dimension warnings detected:${errorMsg}\n\nDo you still wish to submit?`);
    if (!proceed) return;
  }

  // 3. UI Loading Feedback
  showLoadingModal();
  const btnSubmit = document.getElementById("btnSubmit");
  btnSubmit.disabled = true;

  try {
    const res = await fetch(APPS_SCRIPT_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    showSuccessModal("Your multi-lift proposal document has been generated and logged into Google Drive.");
  } catch (err) {
    console.error("Submission failed:", err);
    showErrorModal(`Failed to connect to proposal engine: ${err.message}`);
  } finally {
    btnSubmit.disabled = false;
  }
}

// Modal Display Functions
function showLoadingModal() {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="spinner"></div>
    <div class="modal-title">Generating Proposal Document...</div>
    <p class="modal-msg">Formatting multi-lift stacked technical specifications and generating Google Doc in Drive.</p>
  `;
}

function showSuccessModal(message) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="modal-icon">✅</div>
    <div class="modal-title">Proposal Created Successfully!</div>
    <p class="modal-msg">${message}</p>
    <a href="https://drive.google.com/drive/folders/1cDIi9YPle7jtQvzYvmbWYbZ6l3uRiYxG" target="_blank" class="btn-doc-link">
      Open Offers Folder in Google Drive ↗
    </a>
  `;
}

function showErrorModal(error) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  overlay.style.display = "flex";
  content.innerHTML = `
    <div class="modal-icon">❌</div>
    <div class="modal-title">Generation Disrupted</div>
    <p class="modal-msg" style="color: #ef4444;">${error}</p>
  `;
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

