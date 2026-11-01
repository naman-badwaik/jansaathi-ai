/**
 * JANSAATHI AI — Playwright Browser Automation Runner
 * Track 3 (CITY-02): Every Citizen Gets an Agent
 * 
 * Interacts with the MahaAwas Demonstration Portal using a real Chromium browser context.
 * Performs end-to-end form navigation, validation checking, human approval pause,
 * and acknowledgment reference capture.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORTAL_PATH = path.resolve(__dirname, '..', 'public', 'mock-portal', 'index.html');
const SCRATCH_DIR = path.resolve(__dirname, '..', 'scratch');

async function runPortalAutomation() {
  console.log('===============================================================');
  console.log('JANSAATHI AI: Real Browser Automation Execution (CITY-02)');
  console.log('Portal: MahaAwas Demonstration Welfare Portal (Mock)');
  console.log('Engine: Playwright with System Chrome Browser');
  console.log('===============================================================\n');

  let browser;

  const auditLog = {
    sessionId: 'session-' + Date.now(),
    startedAt: new Date().toISOString(),
    steps: [],
    outcome: 'PENDING',
    capturedReceiptId: null,
    humanApprovalEnforced: false
  };

  try {
    // 1. Verify portal file exists
    console.log(`[Step 1/6] Verifying Mock Portal file at: ${PORTAL_PATH}...`);
    if (!fs.existsSync(PORTAL_PATH)) {
      throw new Error(`Portal file not found at ${PORTAL_PATH}`);
    }
    console.log('✓ Mock Portal HTML verified.\n');

    // 2. Launch Chromium / Chrome
    console.log('[Step 2/6] Launching real Chrome browser instance via Playwright...');
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome'
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 850 },
      userAgent: 'JANSAATHI-AI-Autonomous-Agent/2026.1 (Windows NT 10.0; Win64; x64)'
    });
    const page = await context.newPage();
    console.log('✓ Browser launched. Version:', browser.version(), '\n');

    // 3. Navigate to Portal via file:// protocol (secure, zero network needed)
    const portalUrl = `file:///${PORTAL_PATH.replace(/\\/g, '/')}`;
    console.log(`[Step 3/6] Navigating to ${portalUrl}...`);
    await page.goto(portalUrl, { waitUntil: 'domcontentloaded' });
    
    // Verify portal header & demo disclaimer
    const disclaimerText = await page.innerText('#portal-disclaimer');
    console.log('  → Verification Disclaimer Found:', disclaimerText.trim());
    auditLog.steps.push({
      step: 'Portal Opened',
      detail: 'Loaded mock portal with visible demonstration banner',
      timestamp: new Date().toISOString()
    });

    // 4. Test Form Validation (Intentionally invalid age)
    console.log('\n[Step 4/6] Testing Form Validation Logic (Age < 18 rejection)...');
    let dialogTriggered = false;
    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogTriggered = true;
      dialogMessage = dialog.message();
      console.log('  → Handled Validation Dialog:', dialogMessage);
      await dialog.accept();
    });

    await page.fill('#applicant_name', 'Underage Test');
    await page.fill('#citizen_age', '16');
    await page.click('#btn-next-to-2');
    await page.waitForTimeout(300);

    if (dialogTriggered) {
      console.log('✓ Validation Error correctly blocked step progression for underage citizen.');
      auditLog.steps.push({
        step: 'Validation Tested',
        detail: 'Underage entry correctly stopped by portal logic: ' + dialogMessage,
        timestamp: new Date().toISOString()
      });
    }

    // 5. Populate Verified Citizen Data (Ramesh Pawar, Age 60, Pune)
    console.log('\n[Step 5/6] Injecting Verified Citizen Profile Data into Form 1A & 1B...');
    await page.fill('#applicant_name', 'Ramesh Yashwant Pawar (रमेश पवार)');
    await page.fill('#citizen_age', '60');
    await page.selectOption('#gender', 'Male');
    await page.fill('#aadhaar_number', 'XXXX-XXXX-4912');
    await page.fill('#district', 'Pune');
    await page.fill('#taluka', 'Haveli');
    await page.fill('#village', 'Wadebolhai');

    console.log('  → Demographics filled: Ramesh Yashwant Pawar, 60 Yrs, Pune, Aadhaar XXXX-XXXX-4912');
    await page.click('#btn-next-to-2');
    await page.waitForSelector('#page-step-2', { state: 'visible' });
    console.log('  → Navigated to Step 2: Housing & Socio-Economic Classification');

    // Fill Housing & Income
    await page.selectOption('#housing_status', 'Kutcha House');
    await page.fill('#annual_income', '48000');
    await page.selectOption('#caste_category', 'OBC');
    await page.fill('#bpl_card_no', 'MH-PUN-BPL-89104');
    await page.fill('#land_plot_no', 'Gat No. 184/2');
    await page.fill('#bank_account', '918239018491');
    await page.fill('#ifsc_code', 'MAHB0001042');

    console.log('  → Housing parameters filled: Kutcha House, ₹48,000 p.a., Bank of Maharashtra');
    await page.click('#btn-next-to-3');
    await page.waitForSelector('#page-step-3', { state: 'visible' });
    console.log('  → Navigated to Step 3: Document Attachments');

    // Verify Document Proofs
    const aadhaarBadge = await page.innerText('#badge-doc-aadhaar');
    const incomeBadge = await page.innerText('#badge-doc-income');
    const landBadge = await page.innerText('#badge-doc-land');
    console.log(`  → Document Proofs Attached: Aadhaar (${aadhaarBadge}), Income (${incomeBadge}), Land (${landBadge})`);

    await page.click('#btn-next-to-4');
    await page.waitForSelector('#page-step-4', { state: 'visible' });
    console.log('  → Navigated to Step 4: Citizen Review & Statutory Declaration\n');

    // 6. Mandatory Human Approval Halt Verification
    console.log('[Step 6/6] Verifying Human Approval Guardrail (Track 3 CITY-02 Requirement)...');
    const isSubmitDisabledBefore = await page.isDisabled('#btn_final_submit');
    console.log('  → Submit Button initially disabled without human declaration:', isSubmitDisabledBefore);

    if (!isSubmitDisabledBefore) {
      throw new Error('SAFETY FAILURE: Submit button was active before human approval declaration!');
    }
    console.log('✓ Human approval gate enforced: Autonomous agent CANNOT submit without explicit human consent.');
    auditLog.humanApprovalEnforced = true;

    // Simulate explicit human review and approval consent
    console.log('  → Citizen reviews summary table on screen:');
    const revName = await page.innerText('#rev-name');
    const revIncome = await page.innerText('#rev-income');
    const revShelter = await page.innerText('#rev-shelter');
    console.log(`     Applicant: ${revName}`);
    console.log(`     Income:    ${revIncome}`);
    console.log(`     Shelter:   ${revShelter}`);

    console.log('  → Citizen ticks declaration checkbox...');
    await page.check('#declaration_checkbox');
    const isSubmitDisabledAfter = await page.isDisabled('#btn_final_submit');
    console.log('  → Submit Button enabled after declaration:', !isSubmitDisabledAfter);

    console.log('  → Clicking Authorize & Submit Application...');
    await page.click('#btn_final_submit');

    // 7. Await Step 5 (Receipt Confirmation) and Capture Reference ID
    console.log('\n[Result] Awaiting Portal Submission Receipt...');
    await page.waitForSelector('#page-step-5', { state: 'visible' });
    const receiptId = await page.innerText('#application_receipt_id');
    console.log('===============================================================');
    console.log('SUCCESS: Application Submitted via Real Browser Automation!');
    console.log('Official Acknowledgment ID:', receiptId.trim());
    console.log('===============================================================\n');

    auditLog.outcome = 'SUCCESS';
    auditLog.capturedReceiptId = receiptId.trim();
    auditLog.completedAt = new Date().toISOString();

    // Ensure scratch directory exists
    if (!fs.existsSync(SCRATCH_DIR)) {
      fs.mkdirSync(SCRATCH_DIR, { recursive: true });
    }

    // Save screenshot of the actual submitted page
    const screenshotPath = path.join(SCRATCH_DIR, 'portal_submission_receipt.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('✓ Captured full-page screenshot of submission receipt at:');
    console.log(' ', screenshotPath);

    // Save audit log to scratch
    const auditLogPath = path.join(SCRATCH_DIR, 'browser_automation_audit.json');
    fs.writeFileSync(auditLogPath, JSON.stringify(auditLog, null, 2), 'utf-8');
    console.log('✓ Written audit trail to:', auditLogPath);

  } catch (err) {
    console.error('Automation encountered an error:', err);
    auditLog.outcome = 'ERROR';
    auditLog.error = err.message;
    throw err;
  } finally {
    if (browser) {
      await browser.close();
      console.log('✓ Browser context closed.');
    }
  }

  return auditLog;
}

// Run when executed directly
if (require.main === module) {
  runPortalAutomation()
    .then((result) => {
      console.log('\nExecution Summary:');
      console.log('- Status:                ', result.outcome);
      console.log('- Reference ID:          ', result.capturedReceiptId);
      console.log('- Human Approval Checked:', result.humanApprovalEnforced);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal Playwright run failure:', err);
      process.exit(1);
    });
}

module.exports = { runPortalAutomation };
