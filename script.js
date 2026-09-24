/**
 * BLT Brilliant Lifts — Frontend Interaction & API Connector
 */

// =========================================================================
// 1. BACKEND API URL
// Replace with your Google Apps Script Web App URL (deployed as 'Anyone')
// =========================================================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx3ACLdCnExvTRszjypfwujTvQtb75ll7MmaJ1yaCRUlTKMZ3NmuuqBRm1i3ZW7n50g/exec";

// =========================================================================
// 2. SALESPERSON EMAIL DIRECTORY
// =========================================================================
const salesEmails = {
  "SANJEEV KUMAR SINGH": "sanjeevks499@gmail.com",
  "ARNAB DUTTA": "arnabdutta707@gmail.com",
  "SOURAV BASAK": "souravbasak121@gmail.com",
  "KALYAN CHATTERJEE": "subhapal145@gmail.com",
  "BIJAYA KUMAR PRADHAN": "bijayakumarpradhan899@gmail.com",
  "BIKASH NAYAK": "nayakbikash100@gmail.com",
  "KANCHAN DASGUPTA": "kanchan.sys@gmail.com"
};

document.getElementById('salesPersonName').addEventListener('change', function() {
  const emailInput = document.getElementById('repEmail');
  emailInput.value = salesEmails[this.value] || '';
});

// =========================================================================
// 3. DYNAMIC SPEED DROPDOWN ROUTING
// Rule: Gearless >= 1.0 m/s | Geared = 0.63 m/s
// =========================================================================
function updateSpeedDropdown() {
  const machine = document.getElementById('machineConfig').value;
  const isMRL = machine.includes('MRL');
  const tractionDiv = document.getElementById('tractionDiv');
  
  tractionDiv.style.display = isMRL ? 'none' : 'block';
  const traction = isMRL ? 'Gearless' : document.getElementById('tractionType').value;
  const isGearless = isMRL || traction.includes('Gearless');

  const speedSelect = document.getElementById('speedSelect');
  speedSelect.innerHTML = '';

  if (isGearless) {
    speedSelect.add(new Option('1.0 Mtr/sec', '1.0 Mtr/sec'));
    speedSelect.add(new Option('1.25 Mtr/sec', '1.25 Mtr/sec'));
    speedSelect.add(new Option('1.5 Mtr/sec', '1.5 Mtr/sec'));
    speedSelect.add(new Option('1.75 Mtr/sec', '1.75 Mtr/sec'));
  } else {
    speedSelect.add(new Option('0.63 Mtr/sec', '0.63 Mtr/sec'));
    speedSelect.add(new Option('0.5 Mtr/sec', '0.5 Mtr/sec'));
    speedSelect.add(new Option('0.3 Mtr/sec', '0.3 Mtr/sec'));
  }
}

document.getElementById('machineConfig').addEventListener('change', updateSpeedDropdown);
document.getElementById('tractionType').addEventListener('change', updateSpeedDropdown);

// =========================================================================
// 4. REAL-TIME SHAFT WIDTH FORMULA VALIDATION
// Centre: W >= (2 x Door) + 200 mm | Telescopic: W >= (1.5 x Door) + 200 mm
// =========================================================================
function validateShaftDimensions() {
  const doorType = document.getElementById('doorType').value;
  const doorWidth = parseFloat(document.getElementById('doorWidth').value) || 0;
  const shaftWidthInput = document.getElementById('shaftWidth');
  const shaftWidth = parseFloat(shaftWidthInput.value) || 0;
  const feedback = document.getElementById('shaftFeedback');
  const submitBtn = document.getElementById('submitBtn');

  const isCenter = doorType.includes('Center');
  const minRequired = isCenter ? (2 * doorWidth + 200) : (1.5 * doorWidth + 200);
  const formulaStr = isCenter ? `(2 × ${doorWidth}) + 200` : `(1.5 × ${doorWidth}) + 200`;

  if (shaftWidth > 0 && shaftWidth < minRequired) {
    shaftWidthInput.classList.add('is-invalid');
    feedback.innerHTML = `⚠️ Shaft Width is too small! Minimum required is <b>${minRequired} mm</b> [Formula: ${formulaStr}].`;
    feedback.style.display = 'block';
    submitBtn.disabled = true;
  } else {
    shaftWidthInput.classList.remove('is-invalid');
    feedback.style.display = 'none';
    submitBtn.disabled = false;
  }
}

document.getElementById('doorType').addEventListener('change', validateShaftDimensions);
document.getElementById('doorWidth').addEventListener('change', validateShaftDimensions);
document.getElementById('shaftWidth').addEventListener('input', validateShaftDimensions);

// =========================================================================
// 5. TRAVEL DISTANCE & SERVING FLOORS LOGIC
// =========================================================================
document.getElementById('travelSelect').addEventListener('change', function() {
  document.getElementById('customTravelDiv').style.display = (this.value === 'Other - Please specify') ? 'block' : 'none';
});

document.getElementById('stopsInput').addEventListener('input', function() {
  const stops = parseInt(this.value) || 0;
  if (stops > 1) {
    document.getElementById('floorsInput').value = `G+${stops - 1}`;
  }
});

// Initialize on page load
updateSpeedDropdown();

// =========================================================================
// 6. FORM SUBMISSION (CONNECTS TO GOOGLE APPS SCRIPT VIA FETCH)
// =========================================================================
document.getElementById('bltProposalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const resultBox = document.getElementById('resultBox');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '⏳ Assembling Proposal Document...';
  resultBox.style.display = 'block';
  resultBox.className = 'alert alert-info text-center';
  resultBox.innerHTML = '<b>Sending data to BLT server and generating proposal...</b><br><small>This takes about 5 to 10 seconds.</small>';

  // Collect form data into JSON
  const formData = {};
  const formElements = this.elements;
  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].name) {
      formData[formElements[i].name] = formElements[i].value;
    }
  }

  // POST request using text/plain to bypass CORS preflight
  fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🚀 Submit & Generate Another Proposal';
    
    if (data.success && data.docUrl) {
      resultBox.className = 'alert alert-success text-center shadow-sm';
      resultBox.innerHTML = `
        <h5 class="fw-bold text-success mb-2">🎉 Proposal Generated Successfully!</h5>
        <p class="mb-3">Saved to the salesperson folder and logged in the database.</p>
        <a href="${data.docUrl}" target="_blank" class="btn btn-success fw-bold px-4 py-2">
          Open Proposal Google Doc ↗
        </a>
      `;
    } else {
      resultBox.className = 'alert alert-danger text-center shadow-sm';
      resultBox.innerHTML = `⚠️ <b>Generation Issue:</b> ${data.error || 'Please check spreadsheet status.'}`;
    }
  })
  .catch(err => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🚀 Submit & Generate Proposal Document';
    resultBox.className = 'alert alert-danger text-center shadow-sm';
    resultBox.innerHTML = `❌ <b>Connection Error:</b> ${err.message}`;
  });
});
