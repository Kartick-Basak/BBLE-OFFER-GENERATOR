
/**
 * BLT Brilliant Lifts & Escalators - Proposal Generator Frontend Engine
 * Interactive Edition (v3)
 * Features:
 * 1. State dropdown with default = Odisha for Bikash & Bijaya, Assam for Chayan, West Bengal for others.
 * 2. Site PIN Code placed after Site Address.
 * 3. All technical specification blocks start completely EMPTY until user selects/inputs.
 * 4. Removed Glass / Frameless option from Door Finish.
 * 5. Removed Marble Stone Flooring option from Car Flooring.
 * 6. Continuous dynamic lift index numbering (1, 2, 3...) without skipping on add/remove/re-add.
 */

// Replace this with your Google Apps Script Web App Deployment URL
const APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxhzFCEKqeoNM82wCQJvcDNjxgOypCXSeZqVX1AipCQ15DJx_Q_rgxvPE6VtOMaFRDX/exec";

// Comprehensive list of sales team members from Copy of BLT Proposal Generator & Database (Sales Team tab)
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

  if (currentVal && team.some(r => r.name === currentVal)) {
    select.value = currentVal;
  }

  select.removeEventListener("change", handleSalesPersonChange);
  select.addEventListener("change", handleSalesPersonChange);
  handleSalesPersonChange();
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
}

function setupFormCheckpointsAndValidation() {
  const chkSameCustomer = document.getElementById("chkSameCustomer");
  const customerName = document.getElementById("customerName");
  const contactPerson = document.getElementById("contactPerson");

  if (chkSameCustomer && customerName && contactPerson) {
    chkSameCustomer.addEventListener("change", () => {
      if (chkSameCustomer.checked) {
        contactPerson.value = customerName.value;
        contactPerson.readOnly = true;
        contactPerson.classList.add("field-locked");
      } else {
        contactPerson.readOnly = false;
        contactPerson.classList.remove("field-locked");
      }
    });

    customerName.addEventListener("input", () => {
      if (chkSameCustomer.checked) {
        contactPerson.value = customerName.value;
      }
    });
  }

  const chkSameAddress = document.getElementById("chkSameAddress");
  const address1 = document.getElementById("address1");
  const address2 = document.getElementById("address2");
  const siteAddress = document.getElementById("siteAddress");

  if (chkSameAddress && address1 && siteAddress) {
    const syncSiteAddress = () => {
      if (chkSameAddress.checked) {
        const fullAddr = [address1.value.trim(), address2 ? address2.value.trim() : ""].filter(Boolean).join(", ");
        siteAddress.value = fullAddr;
        siteAddress.readOnly = true;
        siteAddress.classList.add("field-locked");
      }
    };

    chkSameAddress.addEventListener("change", () => {
      if (chkSameAddress.checked) {
        syncSiteAddress();
      } else {
        siteAddress.readOnly = false;
        siteAddress.classList.remove("field-locked");
      }
    });

    address1.addEventListener("input", syncSiteAddress);
    if (address2) address2.addEventListener("input", syncSiteAddress);
  }

  const pinCode = document.getElementById("pinCode");
  const stateSelect = document.getElementById("state");
  if (pinCode && stateSelect) {
    pinCode.addEventListener("input", () => {
      autoDetectStateFromPin(pinCode.value, stateSelect);
    });
  }

  const sitePinCode = document.getElementById("sitePinCode");
  const chkSamePin = document.getElementById("chkSamePin");
  if (chkSamePin && pinCode && sitePinCode) {
    chkSamePin.addEventListener("change", () => {
      if (chkSamePin.checked) {
        sitePinCode.value = pinCode.value;
        sitePinCode.readOnly = true;
        sitePinCode.classList.add("field-locked");
      } else {
        sitePinCode.readOnly = false;
        sitePinCode.classList.remove("field-locked");
      }
    });

    pinCode.addEventListener("input", () => {
      if (chkSamePin.checked) {
        sitePinCode.value = pinCode.value;
      }
    });
  }

  const contactPhone = document.getElementById("contactPhone");
  if (contactPhone) {
    contactPhone.addEventListener("input", () => {
      contactPhone.value = contactPhone.value.replace(/\D/g, "").slice(0, 10);
    });
  }
}

function autoDetectStateFromPin(pin, stateSelect) {
  const p = pin.trim().replace(/\D/g, "");
  if (p.length < 2) return;
  const d2 = parseInt(p.substring(0, 2), 10);

  let detected = "";
  if (d2 >= 11 && d2 <= 11) detected = "Delhi";
  else if (d2 >= 12 && d2 <= 13) detected = "Haryana";
  else if (d2 >= 14 && d2 <= 16) detected = "Punjab";
  else if (d2 === 17) detected = "Himachal Pradesh";
  else if (d2 >= 18 && d2 <= 19) detected = "Jammu and Kashmir";
  else if (d2 >= 20 && d2 <= 28) detected = "Uttar Pradesh";
  else if (d2 >= 30 && d2 <= 34) detected = "Rajasthan";
  else if (d2 >= 36 && d2 <= 39) detected = "Gujarat";
  else if (d2 >= 40 && d2 <= 44) detected = "Maharashtra";
  else if (d2 >= 45 && d2 <= 49) detected = "Madhya Pradesh";
  else if (d2 >= 50 && d2 <= 53) detected = "Telangana";
  else if (d2 >= 56 && d2 <= 59) detected = "Karnataka";
  else if (d2 >= 60 && d2 <= 64) detected = "Tamil Nadu";
  else if (d2 >= 67 && d2 <= 69) detected = "Kerala";
  else if (d2 >= 70 && d2 <= 74) detected = "West Bengal";
  else if (d2 >= 75 && d2 <= 77) detected = "Odisha";
  else if (d2 === 78) detected = "Assam";
  else if (d2 === 79) detected = "Tripura";
  else if (d2 >= 80 && d2 <= 85) detected = "Bihar";

  if (detected && stateSelect) {
    for (let i = 0; i < stateSelect.options.length; i++) {
      if (stateSelect.options[i].value.toLowerCase() === detected.toLowerCase()) {
        stateSelect.selectedIndex = i;
        break;
      }
    }
  }
}

function addLiftCard() {
  const container = document.getElementById("liftsContainer");
  const card = document.createElement("div");
  card.className = "lift-card";

  card.innerHTML = `
    <div class="lift-card-header"><div class="lift-badge">Elevator Specification</div><button type="button" class="btn-remove-lift" onclick="removeLiftCard(this)">✕ Remove Elevator</button></div><div class="grid-4"><div class="form-group"><label>Lift Type <span class="req">*</span></label><select class="form-control lift-type" required onchange="handleLiftTypeChange(this)"><option value="" disabled selected>-- Select Lift Type --</option><option value="PASSENGER">Passenger</option><option value="HOME LIFT">Home</option><option value="STRETCHER">Stretcher</option><option value="GOODS">Goods</option></select></div><div class="form-group"><label>No. of Units <span class="req">*</span></label><input type="number" class="form-control lift-qty" value="" placeholder="1" min="1" max="50" inputmode="numeric" required oninput="updateTechnicalSummary()"></div><div class="form-group"><label>Machine Room Config <span class="req">*</span></label><select class="form-control lift-mr" required onchange="handleMachineAndTractionChange(this)"><option value="" disabled selected>-- Select MR / MRL --</option><option value="MRL">MRL (Machine Room Less)</option><option value="MR">MR (Machine Room)</option></select></div><div class="form-group"><label>Traction Unit <span class="req">*</span></label><select class="form-control lift-traction" required onchange="handleMachineAndTractionChange(this)"><option value="" disabled selected>-- Select Traction --</option><option value="Gearless">Gearless</option><option value="Geared">Geared</option></select></div></div><div class="grid-4"><div class="form-group grp-capacity"><label>Capacity (Persons) <span class="req">*</span></label><select class="form-control lift-capacity" required onchange="handleCapacityChange(this)"><option value="" disabled selected>-- Select Capacity --</option><option value="4">4 Persons</option><option value="5">5 Persons</option><option value="6">6 Persons</option><option value="8">8 Persons</option><option value="10">10 Persons</option><option value="13">13 Persons (Stretcher)</option><option value="15">15 Persons</option></select></div><div class="form-group"><label>No. of Stops <span class="req">*</span></label><input type="number" class="form-control lift-stops" value="" placeholder="6" min="2" max="60" inputmode="numeric" required oninput="handleStopsChange(this)"></div><div class="form-group"><label>Serving Floors <span class="req">*</span></label><input type="text" class="form-control lift-floors" value="" placeholder="G+5 or B+G+4" required></div><div class="form-group"><label>Travel Distance (Mtrs) <span class="req">*</span></label><input type="text" class="form-control lift-travel" value="" placeholder="15.0 Mtrs." required></div></div><input type="hidden" class="lift-load" value="408 Kg"><input type="hidden" class="lift-speed" value="1.0 Mtr/sec"><input type="hidden" class="lift-pit" value="1600 MM"><input type="hidden" class="lift-headroom" value="4800 MM"><div class="grid-4"><div class="form-group"><label>Shaft Width (W in MM) <span class="req">*</span></label><input type="number" class="form-control lift-shaft-w" value="" placeholder="2050" inputmode="numeric" required oninput="validateShaftDimensions(this)"></div><div class="form-group"><label>Shaft Depth (D in MM) <span class="req">*</span></label><input type="number" class="form-control lift-shaft-d" value="" placeholder="2050" inputmode="numeric" required></div><div class="form-group"><label>Door Opening Type <span class="req">*</span></label><select class="form-control lift-door-type" required onchange="validateShaftDimensions(this)"><option value="" disabled selected>-- Select Door Opening --</option><option value="Automatic Center Opening Door">Center Opening Door</option><option value="Automatic Telescopic Opening Door">Telescopic Opening Door</option></select></div><div class="form-group"><label>Clear Door Width (MM) <span class="req">*</span></label><input type="number" class="form-control lift-door-w" value="" placeholder="900" inputmode="numeric" required oninput="validateShaftDimensions(this)"></div></div><div class="dim-alert"></div><div class="grid-2"><div class="form-group"><label>Door Finish <span class="req">*</span></label><select class="form-control lift-door-finish" required><option value="" disabled selected>-- Select Door Finish --</option><option value="SS Hairline Finish">SS Hairline Finish</option><option value="MS Powder Coated">MS Powder Coated</option><option value="SS Mirror Finish">SS Mirror Finish</option></select></div><div class="form-group"><label>Vision Type <span class="req">*</span></label><select class="form-control lift-vision" required><option value="" disabled selected>-- Select Vision Type --</option><option value="No Vision">No Vision</option><option value="Small Vision">Small Vision</option><option value="Half Glass">Half Glass</option><option value="Full Glass">Full Glass</option></select></div></div><div class="grid-2"><div class="form-group"><label>Car Flooring <span class="req">*</span></label><select class="form-control lift-flooring" required><option value="" disabled selected>-- Select Car Flooring --</option><option value="PVC Flooring">PVC Flooring</option><option value="PVC Flooring - Wooden Type">PVC Flooring - Wooden Type</option><option value="Granite Flooring - By Customer">Granite Flooring - By Customer</option></select></div><div class="form-group"><label>Car Panels <span class="req">*</span></label><select class="form-control lift-panels" required><option value="" disabled selected>-- Select Car Panels --</option><option value="SS Hairline Finish">SS Hairline Finish</option><option value="MS Powder Coated">MS Powder Coated</option><option value="SS Mirror Finish">SS Mirror Finish</option><option value="SS Hairline Finish - Back Side Middle Panel SS Mirror Finish">SS Hairline Finish - Back Side Middle Panel SS Mirror Finish</option></select></div></div><div class="grid-2"><div class="form-group"><label>Car Ceiling <span class="req">*</span></label><select class="form-control lift-ceiling" required><option value="" disabled selected>-- Select Car Ceiling --</option><option value="SS Hairline Finish">SS Hairline Finish</option><option value="MS Powder Coated Finish">MS Powder Coated Finish</option><option value="SS Mirror Finish">SS Mirror Finish</option></select></div></div><!-- Optional Features --><input type="hidden" class="lift-cardim" value=""><div class="grid-2"><div class="form-group" style="display: flex; flex-direction: column; justify-content: flex-end;"><label class="checkbox-feature-label" title="Tick to include Overload Sensor &amp; Indicator in Optional Feature 1"><input type="checkbox" class="lift-feature1-check" onchange="handleFeature1Check(this)"><span>Overload Sensor &amp; Indicator</span></label><input type="hidden" class="lift-feature1" value=""></div><div class="form-group"><label>Optional Feature 2</label><input type="text" class="form-control lift-feature2" placeholder="Voice Announcement System"></div></div>
  `;

  container.appendChild(card);
  renumberAllLifts();
}

function removeLiftCard(btn) {
  const card = btn.closest(".lift-card");
  if (card) {
    card.remove();
    renumberAllLifts();
  }
}

function handleFeature1Check(checkbox) {
  const card = checkbox.closest(".lift-card");
  if (!card) return;
  const hiddenInput = card.querySelector(".lift-feature1");
  if (hiddenInput) {
    hiddenInput.value = checkbox.checked ? "Overload Sensor & Indicator" : "";
  }
}

function renumberAllLifts() {
  const cards = document.querySelectorAll(".lift-card");
  cards.forEach((card, index) => {
    const liftNum = index + 1;
    card.id = `liftCard_${liftNum}`;
    card.setAttribute("data-lift-index", liftNum);

    const badge = card.querySelector(".lift-badge");
    if (badge) badge.innerText = `Elevator #${liftNum} Specification`;

    const removeBtn = card.querySelector(".btn-remove-lift");
    if (removeBtn) {
      removeBtn.style.display = cards.length > 1 ? "block" : "none";
    }
  });

  updateTechnicalSummary();
}

function handleLiftTypeChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const type = card.querySelector(".lift-type").value;
  const capacitySelect = card.querySelector(".lift-capacity");
  const mrSelect = card.querySelector(".lift-mr");
  const tractionSelect = card.querySelector(".lift-traction");

  if (type === "HOME LIFT") {
    mrSelect.value = "MRL";
    mrSelect.disabled = true;
    tractionSelect.value = "Gearless";
    tractionSelect.disabled = true;
    capacitySelect.disabled = false;
  } else if (type === "GOODS") {
    capacitySelect.disabled = true;
    capacitySelect.value = "";
    mrSelect.disabled = false;
    if (mrSelect.value === "MRL") {
      tractionSelect.value = "Gearless";
      tractionSelect.disabled = true;
    } else {
      tractionSelect.disabled = false;
    }
  } else {
    capacitySelect.disabled = false;
    mrSelect.disabled = false;
    if (mrSelect.value === "MRL") {
      tractionSelect.value = "Gearless";
      tractionSelect.disabled = true;
    } else {
      tractionSelect.disabled = false;
    }
  }

  updateHiddenLiftFields(card);
  updateTechnicalSummary();
  updateFlooringOptions(card);
}

function isKalyanSelected() {
  const select = document.getElementById("salesPersonSelect");
  const selectedName = (select && select.value ? select.value : "").toUpperCase();
  return selectedName.includes("KALYAN");
}

function updateFlooringOptions(card) {
  if (!card) return;
  const type = card.querySelector(".lift-type").value;
  const flooringSelect = card.querySelector(".lift-flooring");
  if (!flooringSelect) return;

  const currentVal = flooringSelect.value;
  flooringSelect.innerHTML = "";

  if (type === "GOODS") {
    flooringSelect.innerHTML = `
      <option value="MS Chequered Plate" selected>MS Chequered Plate</option>
    `;
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
  const pax = parseInt(capacitySelect ? capacitySelect.value : "") || 6;

  const loadInput = card.querySelector(".lift-load");
  if (loadInput) {
    loadInput.value = (type === "GOODS") ? "1500 Kg" : `${pax * 68} Kg`;
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

function handleCapacityChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const pax = parseInt(card.querySelector(".lift-capacity").value);
  const loadInput = card.querySelector(".lift-load");
  if (pax && loadInput) {
    loadInput.value = `${pax * 68} Kg`;
  }
  updateTechnicalSummary();
}

function handleStopsChange(element) {
  const card = element.closest(".lift-card");
  if (!card) return;

  const stops = parseInt(element.value);
  const travelInput = card.querySelector(".lift-travel");
  const floorsInput = card.querySelector(".lift-floors");

  if (stops >= 2) {
    const travelCalc = (stops - 1) * 3;
    if (travelInput) {
      travelInput.value = `${travelCalc.toFixed(1)} Mtrs.`;
    }
    if (floorsInput && !floorsInput.value) {
      floorsInput.value = `G+${stops - 1}`;
    }
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
      visionSelect.focus();
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
    const mrVal = card.querySelector(".lift-mr").value || (isHome ? "MRL" : "MRL");
    const tractionVal = card.querySelector(".lift-traction").value || (mrVal === "MRL" ? "Gearless" : "Gearless");
    const paxVal = card.querySelector(".lift-capacity").value;
    const pax = parseInt(paxVal) || 6;

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

    const computedLoad = isGoods ? "1500 Kg" : `${pax * 68} Kg`;

    const liftObj = {
      liftType: typeVal,
      numElevators: parseInt(card.querySelector(".lift-qty").value) || 1,
      mrConfig: mrVal,
      tractionUnit: tractionVal,
      capacity: isGoods ? "-" : (paxVal || "6"),
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
      unitPrice: 0 // Non-priced edition
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
  if (overlay && content) {
    content.innerHTML = `
      <div class="modal-spinner"></div><div class="modal-status-title">Generating Proposal...</div><div class="modal-status-text">Your multi-elevator proposal is being processed, calculated, and generated in Google Drive.</div>
    `;
    overlay.style.display = "flex";
  }
}

function showSuccessModal(msg) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  if (overlay && content) {
    content.innerHTML = `
      <div style="font-size: 40px; margin-bottom: 12px;">✅</div><div class="modal-status-title">Proposal Generated!</div><div class="modal-status-text">${msg}</div><button type="button" class="btn-primary" style="margin-top: 18px;" onclick="closeModal()">OK</button>
    `;
  }
}

function showErrorModal(msg) {
  const overlay = document.getElementById("modalOverlay");
  const content = document.getElementById("modalBody");
  if (overlay && content) {
    content.innerHTML = `
      <div style="font-size: 40px; margin-bottom: 12px;">❌</div><div class="modal-status-title">Generation Issue</div><div class="modal-status-text">${msg}</div><button type="button" class="btn-primary" style="margin-top: 18px;" onclick="closeModal()">Close</button>
    `;
  }
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (overlay) overlay.style.display = "none";
}

