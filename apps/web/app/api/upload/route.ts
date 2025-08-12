// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata')
      ? JSON.parse(formData.get('metadata') as string)
      : {};

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = `documents/${file.name}`;

    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_ID!)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
        metadata: metadata,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_ID!)
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
