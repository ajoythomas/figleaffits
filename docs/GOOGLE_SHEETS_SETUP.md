# Google Sheets Waitlist Setup

## 1. Create the script
1. Open your Google Sheet.
2. Go to `Extensions -> Apps Script`.
3. Replace the default script with code from:
   `docs/google-sheets-apps-script.js`
4. Save.

## 2. Deploy as web app
1. Click `Deploy -> New deployment`.
2. Type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone` (or `Anyone with the link`).
5. Deploy and copy the Web app URL.

## 3. Configure Next.js
In your local env file (`.env`), set:

`GOOGLE_SHEETS_WEBHOOK_URL=<YOUR_WEB_APP_URL>`

Example:

`GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec`

Then restart your Next.js server.

## 4. Verify
1. Submit an email from your landing page.
2. Confirm a row appears in the `Waitlist` sheet.
3. Re-submit same email; it should add another row each time.

## Notes
- Your Next.js backend posts JSON with `email`, `source`, `submittedAt`.
- Script stores `Email`, `Source`, `SubmittedAt`, and `ReceivedAt`.
