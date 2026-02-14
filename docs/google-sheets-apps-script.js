/**
 * Google Apps Script Web App endpoint for Fig Leaves Fits waitlist.
 *
 * Expected POST JSON body:
 * {
 *   "email": "person@example.com",
 *   "source": "figleaffits",
 *   "submittedAt": "2026-02-14T18:00:00.000Z"
 * }
 */

const SHEET_NAME = "Waitlist";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_(400, { ok: false, error: "Missing request body." });
    }

    const payload = JSON.parse(e.postData.contents);

    const email = String(payload.email || "").trim().toLowerCase();
    const source = String(payload.source || "figleaffits").trim();
    const submittedAt = String(payload.submittedAt || new Date().toISOString()).trim();

    if (!isValidEmail_(email)) {
      return jsonResponse_(400, { ok: false, error: "Invalid email." });
    }

    const sheet = getOrCreateSheet_(SHEET_NAME);

    // Add headers once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Email", "Source", "SubmittedAt", "ReceivedAt"]);
    }

    sheet.appendRow([email, source, submittedAt, new Date().toISOString()]);

    return jsonResponse_(200, { ok: true });
  } catch (error) {
    return jsonResponse_(500, {
      ok: false,
      error: "Server error",
      details: String(error),
    });
  }
}

function getOrCreateSheet_(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  return sheet;
}

function isValidEmail_(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function jsonResponse_(status, body) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
