/**
 * BLT Brilliant Lifts & Escalators - Proposal Generator Frontend Engine
 */

const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxhzFCEKqeoNM82wCQJvcDNjxgOypCXSeZqVX1AipCQ15DJx_Q_rgxvPE6VtOMaFRDX/exec";

let salesTeamData = [
  { name: "SANJEEV KUMAR SINGH", designation: "ASST. MANAGER – SALES & SERVICE", phone: "+91 70015 64906", email: "sales@bltbrilliant.com" },
  { name: "KALYAN CHATTERJEE", designation: "MANAGER – SALES", phone: "+91 99030 71732", email: "kalyan@bltbrilliant.com" },
  { name: "KANCHAN DASGUPTA", designation: "ENGINEER – SALES", phone: "+91 98321 40598", email: "sales@bltbrilliant.com" },
  { name: "ARNAB DUTTA", designation: "ENGINEER – SALES", phone: "+91 90077 70329", email: "sales@bltbrilliant.com" },
  { name: "BIKASH NAYAK", designation: "ENGINEER – SALES & SERVICE", phone: "+91 63620 09323", email: "bikash@bltbrilliant.com" },
  { name: "BIJAYA KUMAR PRADHAN", designation: "BRANCH MANAGER – ODISHA", phone: "+91 96925 80228", email: "bijaya@bltbrilliant.com" },
  { name: "JOY MUKHERJEE", designation: "MANAGER – SALES", phone: "+91 97694 35113", email: "joy@bltbrilliant.com" },
  { name: "SOURAV BASAK", designation: "SR. EXECUTIVE – SALES", phone: "+91 81005 76967", email: "sales@bltbrilliant.com" },
  { name: "CHAYAN MUKHERJEE", designation: "BRANCH MANAGER – NORTH EAST", phone: "+91 96357 55205", email: "chayan@bltbrilliant.com" }
];

document.addEventListener("DOMContentLoaded", () => {
  initSalesTeamProfile();
  setupFormCheckpointsAndValidation();

  if (document.querySelectorAll(".lift-card").length === 0) {
    addLiftCard();
  } else {
    renumberAllLifts();
  }

  document.getElementById("btnAddLift").addEventListener("click", () => {
    addLiftCard();
  });

  document.getElementById("proposalForm").addEventListener("submit", handleFormSubmit);
  document.getElementById("btnModalClose").addEventListener("click", closeModal);
});

async function initSalesTeamProfile() {
  populateSalesDropdown(salesTeamData);

  if (APPS_SCRIPT_WEB_APP_URL && !APPS_SCRIPT_WEB_APP_URL.includes("YOUR_APPS_SCRIPT")) {
    try {
      const url = `${APPS_SCRIPT_WEB_APP_URL}?action=getSalesTeam&spreadsheetId=1b2EA4neAIaPhMEoeQV61sAHhVsKN1hOVntvas0uz1j8`;
      const response = await fetch(url);
      const resData = await response.json();
      if (resData.status === "success" && Array.isArray(resData.salesTeam) && resData.salesTeam.length > 0) {
        const map = new Map();
        resData.salesTeam.forEach(rep => {
          if (rep && rep.name) map.set(rep.name.trim().toUpperCase(), rep);
        });
        salesTeamData.forEach(rep => {
          if (rep && rep.name && !map.has(rep.name.trim().toUpperCase())) {
            map.set(rep.name.trim().toUpperCase(), rep);
          }
        });
        salesTeamData = Array.from(map.values());
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

function isKalyanSelected() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select && select.value ? select.value : "").toUpperCase();
  return selectedName.includes("KALYAN");
}

function handleSalesPersonChange() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select.value || "").toUpperCase();
  const rep = salesTeamData.find(r => r.name.toUpperCase() === selectedName) || salesTeamData[0];

  if (rep) {
    document.getElementById("salesDesignation").innerText = rep.designation || "SALES EXECUTIVE";
    document.getElementById("salesPhone").innerText = rep.phone || "+91 70015 64906";
    document.getElementById("salesEmail").innerText = rep.email || "sales@bltbrilliant.com";
  }

  const stateSelect = document.getElementById("state");
  if (stateSelect) {
    if (selectedName.includes("BIKASH") || selectedName.includes("BIJAYA")) {
      stateSelect.value = "Odisha";
    } else if (selectedName.includes("CHAYAN")) {
      stateSelect.value = "Assam";
    } else {
      stateSelect.value = "West Bengal";
    }
  }

  if (selectedName.includes("KALYAN")) {
    document.querySelectorAll(".lift-card").forEach(card => {
      const type = card.querySelector(".lift-type").value;
      if (type !== "GOODS") {
        const fl = card.querySelector(".lift-flooring");
        if (fl) {
          fl.value = "PVC Flooring - Wooden Type";
        }
      }
    });
  }
}

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
    if (cleanPin.length === 6) {
      fetchStateFromPinApi(cleanPin).then(apiState => {
        if (apiState) setMatchingState(apiState);
      });
    }
  }

  pinCode.addEventListener("input", function() {
    handlePinAutoState(this);
    if (chkSameAddress.checked) {
      sitePinCode.value = this.value;
    }
  });

  sitePinCode.addEventListener("input", function() {
    handlePinAutoState(this);
  });

  contactPhone.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  contactPhone.addEventListener("paste", function(e) {
    setTimeout(() => {
      this.value = this.value.replace(/^\+?91/, "").replace(/\D/g, "").slice(0, 10);
    }, 10);
  });
}

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
      <option value="" disabled ${!activeVal ? "selected" : ""}>-- Select Car Flooring --</option>
      <option value="PVC Flooring" ${activeVal === "PVC Flooring" ? "selected" : ""}>PVC Flooring</option>
      <option value="PVC Flooring - Wooden Type" ${activeVal === "PVC Flooring - Wooden Type" ? "selected" : ""}>PVC Flooring - Wooden Type</option>
      <option value="Granite Flooring - By Customer" ${activeVal === "Granite Flooring - By Customer" || activeVal.includes("Granite") ? "selected" : ""}>Granite Flooring - By Customer</option>
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
    if (capacityLabel) {
      capacityLabel.innerHTML = 'Capacity (Kg) <span class="req">*</span>';
    }
    capacitySelect.disabled = false;
    const currentVal = capacitySelect.value;
    capacitySelect.innerHTML = `
      <option value="" disabled>-- Select Capacity (Kg) --</option>
      <option value="500 Kg">500 Kg</option>
      <option value="1000 Kg">1000 Kg</option>
      <option value="1500 Kg" selected>1500 Kg</option>
      <option value="2000 Kg">2000 Kg</option>
      <option value="2500 Kg">2500 Kg</option>
      <option value="3000 Kg">3000 Kg</option>
      <option value="4000 Kg">4000 Kg</option>
      <option value="5000 Kg">5000 Kg</option>
    `;
    if (currentVal && currentVal.includes("Kg")) {
      capacitySelect.value = currentVal;
    }

    mrSelect.disabled = false;
    if (mrSelect.value === "MRL") {
      tractionSelect.value = "Gearless";
      tractionSelect.disabled = true;
    } else {
      tractionSelect.disabled = false;
    }
  } else {
    if (capacityLabel) {
      capacityLabel.innerHTML = 'Capacity (Persons) <span class="req">*</span>';
    }
    capacitySelect.disabled = false;
    const currentVal = capacitySelect.value;
    capacitySelect.innerHTML = `
      <option value="" disabled ${!currentVal || currentVal.includes("Kg") ? "selected" : ""}>-- Select Capacity --</option>
      <option value="4">4 Persons</option>
      <option value="5">5 Persons</option>
      <option value="6">6 Persons</option>
      <option value="8">8 Persons</option>
      <option value="10">10 Persons</option>
      <option value="13">13 Persons (Stretcher)</option>
      <option value="15">15 Persons</option>
    `;
    if (currentVal && !currentVal.includes("Kg")) {
      capacitySelect.value = currentVal;
    }

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
  const capacitySelect = card.querySelector(".lift-capacity");
  const capVal = capacitySelect ? capacitySelect.value : "";

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
    if (!floorsInput.value) {
      floorsInput.value = `G+${stops - 1}`;
    }
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
  const formulaStr = isCenter ? `(2 × ${doorW}) + 200 = ${minRequired} mm` : `(1.5 × ${doorW}) + 200 = ${minRequired} mm`;

  if (doorW > 0 && shaftW > 0 && shaftW < minRequired) {
    alertBox.style.display = "block";
    alertBox.innerHTML = `⚠️ <strong>Shaft Width Warning:</strong> ${shaftW} mm is less than required minimum <strong>${minRequired} mm</strong> for ${doorType} with ${doorW} mm door. [Rule: ${formulaStr}]`;
  } else {
    alertBox.style.display = "none";
    alertBox.innerHTML = "";
  }
}

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
          <option value="" disabled selected>-- Select Lift Type --</option>
          <option value="PASSENGER">Passenger</option>
          <option value="HOME LIFT">Home</option>
          <option value="STRETCHER">Stretcher</option>
          <option value="GOODS">Goods</option>
        </select>
      </div>

      <div class="form-group">
        <label>No. of Units <span class="req">*</span></label>
        <input type="number" class="form-control lift-qty" value="" placeholder="1" min="1" max="50" inputmode="numeric" required oninput="updateTechnicalSummary()">
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

    <div class="grid-4">
      <div class="form-group grp-capacity">
        <label class="capacity-label">Capacity (Persons) <span class="req">*</span></label>
        <select class="form-control lift-capacity" required onchange="handleCapacityChange(this)">
          <option value="" disabled selected>-- Select Capacity --</option>
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
        <input type="number" class="form-control lift-stops" value="" placeholder="6" min="2" max="60" inputmode="numeric" required oninput="handleStopsChange(this)">
      </div>

      <div class="form-group">
        <label>Serving Floors <span class="req">*</span></label>
        <input type="text" class="form-control lift-floors" value="" placeholder="G+5 or B+G+4" required>
      </div>

      <div class="form-group">
        <label>Travel Distance (Mtrs) <span class="req">*</span></label>
        <input type="text" class="form-control lift-travel" value="" placeholder="15.0 Mtrs." required>
      </div>
    </div>

    <input type="hidden" class="lift-load" value="408 Kg">
    <input type="hidden" class="lift-speed" value="1.0 Mtr/sec">
    <input type="hidden" class="lift-pit" value="1600 MM">
    <input type="hidden" class="lift-headroom" value="4800 MM">

    <div class="grid-4">
      <div class="form-group">
        <label>Shaft Width (W in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-w" value="" placeholder="2050" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>

      <div class="form-group">
        <label>Shaft Depth (D in MM) <span class="req">*</span></label>
        <input type="number" class="form-control lift-shaft-d" value="" placeholder="2050" inputmode="numeric" required>
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
        <input type="number" class="form-control lift-door-w" value="" placeholder="900" inputmode="numeric" required oninput="validateShaftDimensions(this)">
      </div>
    </div>

    <div class="dim-alert"></div>

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
        <label>Vision Type <span class="req">*</span></label>
        <select class="form-control lift-vision" required>
          <option value="" disabled selected>-- Select Vision Type --</option>
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
          <option value="" disabled selected>-- Select Car Ceiling --</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated Finish">MS Powder Coated Finish</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Car Panels <span class="req">*</span></label>
        <select class="form-control lift-panels" required>
          <option value="" disabled selected>-- Select Car Panels --</option>
          <option value="SS Hairline Finish">SS Hairline Finish</option>
          <option value="MS Powder Coated">MS Powder Coated</option>
          <option value="SS Mirror Finish">SS Mirror Finish</option>
          <option value="SS Hairline Finish - Back Side Middle Panel SS Mirror Finish">SS Hairline Finish - Back Side Middle Panel SS Mirror Finish</option>
        </select>
      </div>

      <div class="form-group">
        <label>Car Flooring <span class="req">*</span></label>
        <select class="form-control lift-flooring" required>
          <option value="" disabled selected>-- Select Car Flooring --</option>
          <option value="PVC Flooring">PVC Flooring</option>
          <option value="PVC Flooring - Wooden Type">PVC Flooring - Wooden Type</option>
          <option value="Granite Flooring - By Customer">Granite Flooring - By Customer</option>
        </select>
      </div>
    </div>

    <input type="hidden" class="lift-cardim" value="">
    <div class="grid-2">
      <div class="form-group" style="display: flex; flex-direction: column; justify-content: flex-end;">
        <label class="checkbox-feature-label" title="Tick to include Overload Sensor & Indicator in Optional Feature 1">
          <input type="checkbox" class="lift-feature1-check" onchange="handleFeature1Check(this)">
          <span>Overload Sensor &amp; Indicator</span>
        </label>
        <input type="hidden" class="lift-feature1" value="">
      </div>

      <div class="form-group">
        <label>Optional Feature 2</label>
        <input type="text" class="form-control lift-feature2" placeholder="Voice Announcement System">
      </div>
    </div>
  `;

  if (isKalyanSelected()) {
    updateFlooringOptions(card);
  }
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

async function handleFormSubmit(e) {
  e.preventDefault();

  const phoneInput = document.getElementById("contactPhone");
  const phoneVal = phoneInput.value.trim();

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

  for (let idx = 0; idx < cards.length; idx++) {
    const card = cards[idx];
    const liftNum = idx + 1;
    const typeVal = card.querySelector(".lift-type").value;
    const qtyVal = card.querySelector(".lift-qty").value;
    const mrVal = card.querySelector(".lift-mr").value;

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

    const ceilingSelect = card.querySelector(".lift-ceiling");
    if (ceilingSelect && !ceilingSelect.value) {
      alert(`Please select the Car Ceiling for Elevator #${liftNum}.`);
      ceilingSelect.focus();
      return;
    }

    const visionSelect = card.querySelector(".lift-vision");
    if (!visionSelect || !visionSelect.value) {
      alert(`Please select the Vision Type for Elevator #${liftNum}.`);
      if (visionSelect) visionSelect.focus();
      return;
    }
  }

  if (!APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL.includes("YOUR_APPS_SCRIPT")) {
    alert("Please configure your APPS_SCRIPT_WEB_APP_URL in script.js before submitting!");
    return;
  }

  const selectedSalesPerson = document.getElementById("salesPersonSelect").value;
  const stateVal = document.getElementById("state").value;

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
    const isHome = typeVal === "HOME LIFT";
    const mrVal = card.querySelector(".lift-mr").value || "MRL";
    const tractionVal = card.querySelector(".lift-traction").value || "Gearless";
    const capVal = card.querySelector(".lift-capacity").value;

    let computedSpeed = "1.0 Mtr/sec";
    if (isHome) {
      computedSpeed = "0.3 Mtr/sec";
    } else if (isGoods) {
      computedSpeed = "0.5 Mtr/sec";
    } else if (mrVal === "MR" && tractionVal === "Geared") {
      computedSpeed = "0.63 Mtr/sec";
    } else {
      computedSpeed = "1.0 Mtr/sec";
    }

    const computedPit = isHome ? "1000 MM" : "1600 MM";

    let computedHeadroom = "4800 MM";
    if (mrVal === "MR" && tractionVal === "Geared") {
      computedHeadroom = "4200 MM";
    } else if (mrVal === "MR" && tractionVal === "Gearless") {
      computedHeadroom = "4500 MM";
    } else {
      computedHeadroom = "4800 MM";
    }

    const computedLoad = isGoods 
      ? (capVal ? (capVal.includes("Kg") ? capVal : `${capVal} Kg`) : "1500 Kg")
      : `${(parseInt(capVal, 10) || 6) * 68} Kg`;

    const liftObj = {
      liftType: typeVal,
      numElevators: parseInt(card.querySelector(".lift-qty").value) || 1,
      mrConfig: mrVal,
      tractionUnit: tractionVal,
      capacity: isGoods ? "-" : (capVal || "6"),
      ratedLoad: computedLoad,
      speed: computedSpeed,
      numStops: parseInt(card.querySelector(".lift-stops").value) || 2,
      servingFloors: card.querySelector(".lift-floors").value.trim() || "G+1",
      travel: card.querySelector(".lift-travel").value.trim() || "3.0 Mtrs.",
      pitDepth: computedPit,
      headRoom: computedHeadroom,
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
      optionalFeature1: (() => {
        const chk = card.querySelector(".lift-feature1-check");
        if (chk && chk.checked) return "Overload Sensor & Indicator";
        const hid = card.querySelector(".lift-feature1");
        return (hid && hid.value) ? hid.value.trim() : "";
      })(),
      optionalFeature2: card.querySelector(".lift-feature2").value.trim(),
      unitPrice: 0
    };

    payload.lifts.push(liftObj);
  });

  if (hasDimensionError) {
    const proceed = confirm(`Shaft dimension warnings detected:${errorMsg}\n\nDo you still wish to submit?`);
    if (!proceed) return;
  }

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

function getStateFromPinCode(pin) {
  if (!pin) return null;
  const s = String(pin).trim();
  if (s.length < 2) return null;

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
  if (p2 === 18 || p2 === 19) {
    if (p3 === 194) return "Ladakh";
    return "Jammu and Kashmir";
  }
  if (p2 >= 20 && p2 <= 28) return "Uttar Pradesh";
  if (p2 >= 30 && p2 <= 34) return "Rajasthan";
  if (p2 >= 36 && p2 <= 39) {
    if (p3 === 396 && (s.startsWith("3961") || s.startsWith("3962"))) return "Dadra and Nagar Haveli and Daman and Diu";
    return "Gujarat";
  }
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
  const stateSelect = document.getElementById("state");
  if (!stateSelect) return;

  const target = stateName.trim().toLowerCase();
  for (let i = 0; i < stateSelect.options.length; i++) {
    const opt = stateSelect.options[i];
    if (opt.value && opt.value.trim().toLowerCase() === target) {
      stateSelect.selectedIndex = i;
      return;
    }
  }

  for (let i = 0; i < stateSelect.options.length; i++) {
    const opt = stateSelect.options[i];
    if (opt.value && (opt.value.toLowerCase().includes(target) || target.includes(opt.value.toLowerCase()))) {
      stateSelect.selectedIndex = i;
      return;
    }
  }
}

async function fetchStateFromPinApi(pin) {
  if (!pin || pin.length !== 6) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === "Success" && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
      const apiState = data[0].PostOffice[0].State;
      if (apiState) return apiState;
    }
  } catch (e) {
    // Fallback
  }
  return null;
}
