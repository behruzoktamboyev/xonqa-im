import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hisgsqlcxyhvzysyxque.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpc2dzcWxjeHlodnp5c3l4cXVlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODMyNjg0NSwiZXhwIjoyMTAzOTAyODQ1fQ.bG8jrsIy_ZIHUMqH1EB8us3St9HprXvXRVfYnAnMAzE";

const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch current total visit count
export async function GET() {
  try {
    const { count, error } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('feedback_type', 'site_visit');

    if (error) {
      console.error('Error fetching view count:', error);
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    return NextResponse.json({ count: count || 0 }, { status: 200 });
  } catch (err) {
    console.error('Error in GET /api/views:', err);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

// POST: Increment visit count
export async function POST() {
  try {
    // Record visit entry
    await supabase.from('feedback').insert({
      full_name: 'Visitor',
      contact_info: 'visit',
      feedback_type: 'site_visit',
      message: 'visit',
    });

    // Fetch updated count
    const { count } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('feedback_type', 'site_visit');

    return NextResponse.json({ count: count || 0 }, { status: 200 });
  } catch (err) {
    console.error('Error in POST /api/views:', err);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
