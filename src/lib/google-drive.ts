import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export async function getDriveClient() {
  const saPath = path.resolve(process.cwd(), 'service-account.json');
  let credentials;

  if (process.env.SERVICE_ACCOUNT_KEY) {
    credentials = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  } else if (fs.existsSync(saPath)) {
    credentials = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  } else {
    throw new Error('Service account credentials not found for Google Drive integration.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}
