import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Missing required parameter: domain' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get site data and verify ownership
    const { data: siteData, error: siteError } = await adminClient
      .from('sites')
      .select('id, domain')
      .eq('domain', domain)
      .eq('user_id', user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get date range from last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Generate all CSV files
    const csvFiles = await generateAllCsvs(adminClient, siteData.id, siteData.domain, startDate, endDate);

    // Create ZIP file
    const zipBuffer = await createZipFile(csvFiles);

    const filename = `${domain.replace('.', '_')}_analytics_export_${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}.zip`;

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

// Generate all CSV files
async function generateAllCsvs(adminClient: any, siteId: string, domain: string, startDate: string, endDate: string) {
  const files = [];
  
  const dateRange = `${startDate.replace(/-/g, '')}_${endDate.replace(/-/g, '')}`;
  const domainPrefix = domain.replace('.', '_');

  // Generate all CSV files
  files.push({
    name: `${domainPrefix}_visitors_${dateRange}.csv`,
    content: await generateVisitorsCsv(adminClient, siteId, startDate, endDate)
  });

  files.push({
    name: `${domainPrefix}_locations_${dateRange}.csv`,
    content: await generateLocationsCsv(adminClient, siteId, startDate, endDate)
  });

  files.push({
    name: `${domainPrefix}_browsers_${dateRange}.csv`,
    content: await generateBrowsersCsv(adminClient, siteId, startDate, endDate)
  });

  files.push({
    name: `${domainPrefix}_sources_${dateRange}.csv`,
    content: await generateSourcesCsv(adminClient, siteId, startDate, endDate)
  });

  files.push({
    name: `${domainPrefix}_pages_${dateRange}.csv`,
    content: await generatePagesCsv(adminClient, siteId, domain, startDate, endDate)
  });

  files.push({
    name: `${domainPrefix}_all_data_${dateRange}.csv`,
    content: await generateAllDataCsv(adminClient, siteId, startDate, endDate)
  });

  return files;
}

// Create ZIP file from CSV files
async function createZipFile(files: { name: string; content: string }[]) {
  const zip = new JSZip();
  
  // Add each CSV file to the ZIP
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  // Generate the ZIP buffer
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return zipBuffer;
}

// Generate visitors CSV (aggregated by date)
async function generateVisitorsCsv(adminClient: any, siteId: string, startDate: string, endDate: string) {
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('created_at, page_views, last_seen')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  // Group by date
  const dailyStats: { [date: string]: { visitors: number; pageviews: number; bounces: number; visits: number; visit_duration: number } } = {};

  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    
    if (!dailyStats[date]) {
      dailyStats[date] = { visitors: 0, pageviews: 0, bounces: 0, visits: 0, visit_duration: 0 };
    }
    
    dailyStats[date].visitors += 1;
    dailyStats[date].visits += 1;
    dailyStats[date].pageviews += session.page_views || 1;
    
    // Calculate duration in seconds
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const duration = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    dailyStats[date].visit_duration += duration;
    
    // Count as bounce if only 1 page view
    if ((session.page_views || 1) === 1) {
      dailyStats[date].bounces += 1;
    }
  });

  // Generate CSV
  let csv = '"date","visitors","pageviews","bounces","visits","visit_duration"\n';
  
  Object.entries(dailyStats).forEach(([date, stats]) => {
    csv += `"${date}",${stats.visitors},${stats.pageviews},${stats.bounces},${stats.visits},${stats.visit_duration}\n`;
  });

  return csv;
}

// Generate locations CSV
async function generateLocationsCsv(adminClient: any, siteId: string, startDate: string, endDate: string) {
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('created_at, country, region, city, page_views, last_seen')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  const locationStats: { [key: string]: any } = {};

  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    const country = session.country || 'Unknown';
    const region = session.region || '';
    const city = session.city || '';
    
    const key = `${date}_${country}_${region}_${city}`;
    
    if (!locationStats[key]) {
      locationStats[key] = {
        date,
        country,
        region,
        city: city || 0, // Use 0 for empty cities like in Plausible
        visitors: 0,
        visits: 0,
        visit_duration: 0,
        bounces: 0,
        pageviews: 0
      };
    }
    
    locationStats[key].visitors += 1;
    locationStats[key].visits += 1;
    locationStats[key].pageviews += session.page_views || 1;
    
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const duration = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    locationStats[key].visit_duration += duration;
    
    if ((session.page_views || 1) === 1) {
      locationStats[key].bounces += 1;
    }
  });

  let csv = '"date","country","region","city","visitors","visits","visit_duration","bounces","pageviews"\n';
  
  Object.values(locationStats).forEach((stats: any) => {
    csv += `"${stats.date}","${stats.country}","${stats.region}",${stats.city},${stats.visitors},${stats.visits},${stats.visit_duration},${stats.bounces},${stats.pageviews}\n`;
  });

  return csv;
}

// Generate browsers CSV
async function generateBrowsersCsv(adminClient: any, siteId: string, startDate: string, endDate: string) {
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('created_at, browser, page_views, last_seen')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  const browserStats: { [key: string]: any } = {};

  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    const browser = session.browser || 'Unknown';
    const browserVersion = '0.0'; // We don't have version data
    
    const key = `${date}_${browser}_${browserVersion}`;
    
    if (!browserStats[key]) {
      browserStats[key] = {
        date,
        browser,
        browser_version: browserVersion,
        visitors: 0,
        visits: 0,
        visit_duration: 0,
        bounces: 0,
        pageviews: 0
      };
    }
    
    browserStats[key].visitors += 1;
    browserStats[key].visits += 1;
    browserStats[key].pageviews += session.page_views || 1;
    
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const duration = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    browserStats[key].visit_duration += duration;
    
    if ((session.page_views || 1) === 1) {
      browserStats[key].bounces += 1;
    }
  });

  let csv = '"date","browser","browser_version","visitors","visits","visit_duration","bounces","pageviews"\n';
  
  Object.values(browserStats).forEach((stats: any) => {
    csv += `"${stats.date}","${stats.browser}","${stats.browser_version}",${stats.visitors},${stats.visits},${stats.visit_duration},${stats.bounces},${stats.pageviews}\n`;
  });

  return csv;
}

// Generate sources CSV
async function generateSourcesCsv(adminClient: any, siteId: string, startDate: string, endDate: string) {
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('created_at, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, page_views, last_seen')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  const sourceStats: { [key: string]: any } = {};

  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    const source = session.utm_source || '';
    const referrer = session.referrer || '';
    const utm_source = session.utm_source || '';
    const utm_medium = session.utm_medium || '';
    const utm_campaign = session.utm_campaign || '';
    const utm_content = session.utm_content || '';
    const utm_term = session.utm_term || '';
    
    const key = `${date}_${source}_${referrer}_${utm_source}_${utm_medium}_${utm_campaign}_${utm_content}_${utm_term}`;
    
    if (!sourceStats[key]) {
      sourceStats[key] = {
        date,
        source,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        pageviews: 0,
        visitors: 0,
        visits: 0,
        visit_duration: 0,
        bounces: 0
      };
    }
    
    sourceStats[key].visitors += 1;
    sourceStats[key].visits += 1;
    sourceStats[key].pageviews += session.page_views || 1;
    
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const duration = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    sourceStats[key].visit_duration += duration;
    
    if ((session.page_views || 1) === 1) {
      sourceStats[key].bounces += 1;
    }
  });

  let csv = '"date","source","referrer","utm_source","utm_medium","utm_campaign","utm_content","utm_term","pageviews","visitors","visits","visit_duration","bounces"\n';
  
  Object.values(sourceStats).forEach((stats: any) => {
    csv += `"${stats.date}","${stats.source}","${stats.referrer}","${stats.utm_source}","${stats.utm_medium}","${stats.utm_campaign}","${stats.utm_content}","${stats.utm_term}",${stats.pageviews},${stats.visitors},${stats.visits},${stats.visit_duration},${stats.bounces}\n`;
  });

  return csv;
}

// Generate pages CSV (this will be limited since we don't store individual page data in sessions)
async function generatePagesCsv(adminClient: any, siteId: string, domain: string, startDate: string, endDate: string) {
  // Since we don't have detailed page data, we'll create a simplified version
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('created_at, entry_page, exit_page, page_views, last_seen')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  const pageStats: { [key: string]: any } = {};

  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    const hostname = domain;
    const page = session.entry_page || '/';
    
    const key = `${date}_${hostname}_${page}`;
    
    if (!pageStats[key]) {
      pageStats[key] = {
        date,
        hostname,
        page,
        visits: 0,
        visitors: 0,
        pageviews: 0,
        total_scroll_depth: 0,
        total_scroll_depth_visits: 0,
        total_time_on_page: 0,
        total_time_on_page_visits: 0
      };
    }
    
    pageStats[key].visitors += 1;
    pageStats[key].visits += 1;
    pageStats[key].pageviews += session.page_views || 1;
    
    // We don't have scroll depth data, so we'll use placeholder values
    pageStats[key].total_scroll_depth += 50; // Placeholder
    pageStats[key].total_scroll_depth_visits += 1;
    
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const timeOnPage = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    pageStats[key].total_time_on_page += timeOnPage;
    pageStats[key].total_time_on_page_visits += 1;
  });

  let csv = '"date","hostname","page","visits","visitors","pageviews","total_scroll_depth","total_scroll_depth_visits","total_time_on_page","total_time_on_page_visits"\n';
  
  Object.values(pageStats).forEach((stats: any) => {
    csv += `"${stats.date}","${stats.hostname}","${stats.page}",${stats.visits},${stats.visitors},${stats.pageviews},${stats.total_scroll_depth},${stats.total_scroll_depth_visits},${stats.total_time_on_page},${stats.total_time_on_page_visits}\n`;
  });

  return csv;
}

// Generate all data CSV (comprehensive export)
async function generateAllDataCsv(adminClient: any, siteId: string, startDate: string, endDate: string) {
  const { data: sessions } = await adminClient
    .from('sessions')
    .select('*')
    .eq('site_id', siteId)
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')
    .order('created_at');

  let csv = '"date","session_id","country","region","city","browser","os","screen_size","referrer","referrer_domain","entry_page","exit_page","page_views","visitors","visits","visit_duration","utm_source","utm_medium","utm_campaign","utm_term","utm_content","channel"\n';
  
  sessions?.forEach((session: any) => {
    const date = session.created_at.split('T')[0];
    const created = new Date(session.created_at);
    const lastSeen = new Date(session.last_seen);
    const duration = Math.floor((lastSeen.getTime() - created.getTime()) / 1000);
    
    csv += `"${date}","${session.id}","${session.country || ''}","${session.region || ''}","${session.city || ''}","${session.browser || ''}","${session.os || ''}","${session.screen_size || ''}","${session.referrer || ''}","${session.referrer_domain || ''}","${session.entry_page || '/'}","${session.exit_page || '/'}",${session.page_views || 1},1,1,${duration},"${session.utm_source || ''}","${session.utm_medium || ''}","${session.utm_campaign || ''}","${session.utm_term || ''}","${session.utm_content || ''}","${session.channel || ''}"\n`;
  });

  return csv;
}