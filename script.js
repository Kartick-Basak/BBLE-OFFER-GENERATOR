// Paste your newly copied Web App URL (ending in /exec):
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrRH0s1ioalQ-sL03kz35st3b4F3Fnu07eec_hcwGEctIZPrXind7_1QvAmDxCiFwv/exec";

document.getElementById('bltProposalForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  const resultBox = document.getElementById('resultBox');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '⏳ Assembling Proposal Document...';
  resultBox.style.display = 'block';
  resultBox.className = 'alert alert-info text-center';
  resultBox.innerHTML = '<b>Sending data to BLT server and generating proposal...</b><br><small>This takes about 5 to 10 seconds.</small>';

  // Collect form data
  const formData = {};
  const formElements = this.elements;
  for (let i = 0; i < formElements.length; i++) {
    if (formElements[i].name) {
      formData[formElements[i].name] = formElements[i].value;
    }
  }

  // POST request configured for Google Apps Script redirects
  fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(formData),
    redirect: "follow"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🚀 Submit & Generate Another Proposal';
    
    if (data.success && data.docUrl) {
      resultBox.className = 'alert alert-success text-center shadow-sm';
      resultBox.innerHTML = `
        <h5 class="fw-bold text-success mb-2">🎉 Proposal Generated Successfully!</h5>
        <p class="mb-3">Saved to your Drive folder and logged in the database.</p>
        <a href="${data.docUrl}" target="_blank" class="btn btn-success fw-bold px-4 py-2">
          Open Proposal Google Doc ↗
        </a>
      `;
    } else {
      resultBox.className = 'alert alert-danger text-center shadow-sm';
      resultBox.innerHTML = `⚠️ <b>Generation Issue:</b> ${data.error || 'Please check the spreadsheet status column.'}`;
    }
  })
  .catch(err => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '🚀 Submit & Generate Proposal Document';
    resultBox.className = 'alert alert-danger text-center shadow-sm';
    resultBox.innerHTML = `❌ <b>Connection Error:</b> ${err.message}<br><small>Ensure the Google Apps Script Web App is deployed with 'Who has access: Anyone'.</small>`;
  });
});
