import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = adminClient
      .from('ga_import_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by site if provided
    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data: importJobs, error } = await query;

    if (error) {
      console.error('Error fetching import jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch import jobs' },
        { status: 500 }
      );
    }

    // Format the data for frontend consumption
    const formattedJobs = importJobs.map(job => ({
      id: job.id,
      siteId: job.site_id,
      propertyId: job.ga_property_id,
      propertyName: job.ga_property_name,
      startDate: job.start_date,
      endDate: job.end_date,
      status: job.status,
      progress: job.progress || 0,
      totalSessions: job.total_sessions || 0,
      importedSessions: job.imported_sessions || 0,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      completedAt: job.completed_at,
    }));

    return NextResponse.json({ importJobs: formattedJobs });

  } catch (error) {
    console.error('Error in import status endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import status' },
      { status: 500 }
    );
  }
}