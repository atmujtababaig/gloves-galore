/**
 * Gloves Galore, website forms → your Gmail  (free, runs inside your own Google account)
 *
 * What it does for every form on the website:
 *   • emails you the message (with the client's tech pack attached), Reply goes to the client
 *   • adds a row to the "Gloves Galore, website leads" Google Sheet (created on first message)
 *
 * Setup (one time): script.google.com → New project → paste this file →
 *   Deploy → New deployment → type "Web app" → Execute as: Me, Who has access: Anyone →
 *   Deploy → allow the permissions → copy the Web app URL into forms.js on the website.
 * After editing this file: Deploy → Manage deployments → edit (pencil) → Version: New version.
 */

const NOTIFY_EMAIL = '';                     // empty = the Google account that deployed this script
const SHEET_NAME = 'Gloves Galore, website leads';
const MAX_FILE_BYTES = 20 * 1024 * 1024;     // Gmail limit is 25 MB per email
const MIN_FILL_MS = 2500;                     // real people take longer than this to fill a form

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // spam traps: hidden checkbox ticked, or form "filled" faster than a human can type
    if (data.botcheck || Number(data._elapsed || 0) < MIN_FILL_MS) return json_({success: true});

    const file = data.file;
    const subject = String(data.subject || 'New website message').slice(0, 200);
    ['file', 'subject', 'botcheck', '_elapsed'].forEach((k) => delete data[k]);

    const attachments = [];
    let fileLine = '';
    if (file && file.data) {
      const bytes = Utilities.base64Decode(file.data);
      if (bytes.length > MAX_FILE_BYTES) throw new Error('file too large');
      attachments.push(Utilities.newBlob(bytes, file.type || 'application/octet-stream', String(file.name || 'upload')));
      fileLine = `${file.name} (${Math.round(bytes.length / 1024)} KB, attached)`;
    }

    logLead_(subject, data, fileLine);

    const rows = Object.keys(data)
      .filter((k) => String(data[k]).trim() !== '')
      .map((k) => `<tr><td style="padding:6px 16px 6px 0;color:#777;vertical-align:top;text-transform:capitalize">${esc_(k.replace(/_/g, ' '))}</td>` +
        `<td style="padding:6px 0">${esc_(data[k]).replace(/\n/g, '<br>')}</td></tr>`)
      .join('');
    const html =
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">` +
      `<h2 style="margin:0 0 12px">${esc_(subject)}</h2>` +
      `<table style="border-collapse:collapse">${rows}</table>` +
      (fileLine ? `<p style="margin-top:16px"><b>File:</b> ${esc_(fileLine)}</p>` : '') +
      `<p style="margin-top:20px;color:#999;font-size:12px">Sent from the Gloves Galore website. Press Reply to answer the client.</p></div>`;

    const mail = {
      to: NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(),
      subject: subject,
      htmlBody: html,
      name: 'Gloves Galore website',
      attachments: attachments,
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email || ''))) mail.replyTo = data.email;
    MailApp.sendEmail(mail);

    return json_({success: true});
  } catch (err) {
    console.error(err);
    return json_({success: false, message: String(err.message || err)});
  }
}

// Visiting the web-app URL in a browser shows this, so you can check it is live
function doGet() {
  return json_({ok: true, service: 'Gloves Galore website forms'});
}

function logLead_(subject, data, fileLine) {
  const props = PropertiesService.getScriptProperties();
  let sheet;
  const id = props.getProperty('SHEET_ID');
  if (id) sheet = SpreadsheetApp.openById(id).getSheets()[0];
  if (!sheet) {
    const ss = SpreadsheetApp.create(SHEET_NAME);
    props.setProperty('SHEET_ID', ss.getId());
    sheet = ss.getSheets()[0];
    sheet.appendRow(['Date', 'Form', 'Name', 'Email', 'Phone', 'Company', 'Inquiry type', 'Quantity', 'Subject', 'Message', 'File']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date(), subject, data.name || '', data.email || '', data.phone || '', data.company || '',
    (data.inquiry_type || '').replace(/_/g, ' '), data.quantity || '', data.topic || data.subject_line || '',
    data.message || '', fileLine,
  ]);
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
