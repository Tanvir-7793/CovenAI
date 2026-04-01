import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { base64Pdf, filename } = await req.json();

    if (!base64Pdf) {
      return NextResponse.json({ error: 'No PDF provided' }, { status: 400 });
    }

    // Ensure clean Base64 format for Cloudinary by removing embedded filename parameters
    // that html2pdf.js / jsPDF sometimes injects (e.g. data:application/pdf;filename=generated.pdf;base64,...)
    let uploadStr = base64Pdf;
    if (uploadStr.startsWith('data:')) {
      const parts = uploadStr.split('base64,');
      if (parts.length === 2) {
        uploadStr = `data:application/pdf;base64,${parts[1]}`;
      }
    } else {
      uploadStr = `data:application/pdf;base64,${base64Pdf}`;
    }

    const uploadResponse = await cloudinary.uploader.upload(uploadStr, {
      resource_type: 'auto',
      folder: 'covenai_documents',
      public_id: filename || `document_${Date.now()}`,
    });

    return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });

  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF', details: error?.message || 'Unknown error' }, 
      { status: 500 }
    );
  }
}
