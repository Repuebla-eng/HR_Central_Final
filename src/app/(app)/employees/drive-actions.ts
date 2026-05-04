'use server';

import { getDriveClient } from '@/lib/google-drive';
import { Readable } from 'stream';

const REPOSITORY_FOLDER_ID = '1J9jPwr0fZaNOHmYEa_Bq6d7roOi1IxsQ';

export async function uploadFileToDrive(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const drive = await getDriveClient();

    // Convert File to Buffer then to Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 1. Create the file in the specific folder
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [REPOSITORY_FOLDER_ID],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, webViewLink, name',
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('Failed to get file ID from Google Drive');
    }

    // 2. Set permissions so anyone with the link can view it 
    // (This ensures it can be opened from the app without auth issues)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // 3. Get the direct link
    // Note: webViewLink is usually the best for Drive
    return { 
      success: true, 
      id: fileId, 
      url: response.data.webViewLink,
      name: response.data.name
    };
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return { success: false, error: error.message || 'Error uploading to Google Drive' };
  }
}
