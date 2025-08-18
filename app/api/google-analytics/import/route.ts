import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ImportRequest {
  siteId: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  includeGoals?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ImportRequest = await request.json();
    const { siteId, propertyId, propertyName, startDate, endDate } = body;

    // Validate input
    if (!siteId || !propertyId || !propertyName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from('sites')
      .select('id, domain')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json(
        { error: 'Site not found or access denied' },
        { status: 404 }
      );
    }

    // Check if Google Analytics is connected
    const { data: tokenData, error: tokenError } = await adminClient
      .from('google_auth_tokens')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google Analytics not connected' },
        { status: 400 }
      );
    }

    // Check for existing running import for this site
    const { data: existingImport } = await adminClient
      .from('ga_import_jobs')
      .select('id, status')
      .eq('site_id', siteId)
      .in('status', ['pending', 'running'])
      .single();

    if (existingImport) {
      return NextResponse.json(
        { error: 'An import is already in progress for this site' },
        { status: 409 }
      );
    }

    // Create import job
    const { data: importJob, error: importError } = await adminClient
      .from('ga_import_jobs')
      .insert({
        site_id: siteId,
        user_id: user.id,
        ga_property_id: propertyId,
        ga_property_name: propertyName,
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
      })
      .select()
      .single();

    if (importError || !importJob) {
      console.error('Error creating import job:', importError);
      return NextResponse.json(
        { error: 'Failed to create import job' },
        { status: 500 }
      );
    }

    // Start the import process asynchronously
    // In a real app, you'd use a queue system like Bull or Inngest
    processImport(importJob.id, tokenData.access_token, tokenData.refresh_token).catch(error => {
      console.error('Error in import process:', error);
      // Update job status to failed
      adminClient
        .from('ga_import_jobs')
        .update({ 
          status: 'failed', 
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', importJob.id)
        .then(() => console.log('Updated job status to failed'));
    });

    return NextResponse.json({ 
      importJobId: importJob.id,
      message: 'Import started successfully' 
    });

  } catch (error) {
    console.error('Error starting GA import:', error);
    return NextResponse.json(
      { error: 'Failed to start import' },
      { status: 500 }
    );
  }
}

// Async function to process the import
async function processImport(importJobId: string, accessToken: string, refreshToken: string) {
  const adminClient = createAdminClient();
  
  try {
    // Update job status to running
    await adminClient
      .from('ga_import_jobs')
      .update({ status: 'running', progress: 0 })
      .eq('id', importJobId);

    // Get import job details
    const { data: job } = await adminClient
      .from('ga_import_jobs')
      .select('*')
      .eq('id', importJobId)
      .single();

    if (!job) throw new Error('Import job not found');

    // Import the data (this will be implemented in the next step)
    await importGA4Data(job, accessToken, refreshToken);

    // Update job status to completed
    await adminClient
      .from('ga_import_jobs')
      .update({ 
        status: 'completed', 
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', importJobId);

  } catch (error) {
    console.error('Error in processImport:', error);
    
    // Update job status to failed
    await adminClient
      .from('ga_import_jobs')
      .update({ 
        status: 'failed', 
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      })
      .eq('id', importJobId);
  }
}

// Import GA4 data using our mapper
async function importGA4Data(job: ImportJob, accessToken: string, refreshToken: string) {
  const { importGA4DataToHector } = await import('@/lib/ga-import-mapper');
  await importGA4DataToHector(job, accessToken, refreshToken);
}

interface ImportJob {
  id: string;
  site_id: string;
  user_id: string;
  ga_property_id: string;
  ga_property_name: string;
  start_date: string;
  end_date: string;
}