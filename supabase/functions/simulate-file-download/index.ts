import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FileInteractionData {
  campaign_id: string;
  target_email: string;
  file_name: string;
  file_type: string;
  interaction_type: 'download_attempt' | 'file_open_attempt';
  user_agent: string;
  ip_address: string;
  timestamp: string;
  device_fingerprint?: string;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url);
    const campaignId = url.searchParams.get('c');
    const targetEmail = url.searchParams.get('e');
    const fileName = url.searchParams.get('f');
    const fileType = url.searchParams.get('t');
    const interactionType = url.searchParams.get('action') || 'download_attempt';

    if (!campaignId || !targetEmail || !fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client IP and user agent
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create device fingerprint from user agent and other headers
    const deviceFingerprint = await createDeviceFingerprint(req);

    // Get geolocation data from IP (you can integrate with a service like ipapi.co)
    const geolocation = await getGeolocation(clientIP);

    // Prepare interaction data
    const interactionData: FileInteractionData = {
      campaign_id: campaignId,
      target_email: targetEmail,
      file_name: fileName,
      file_type: fileType,
      interaction_type: interactionType as 'download_attempt' | 'file_open_attempt',
      user_agent: userAgent,
      ip_address: clientIP,
      timestamp: new Date().toISOString(),
      device_fingerprint: deviceFingerprint,
      geolocation: geolocation
    };

    // Store the interaction in campaign_metrics table
    const { error: metricsError } = await supabaseClient
      .from('campaign_metrics')
      .upsert({
        campaign_id: campaignId,
        target_email: targetEmail,
        file_downloaded_at: interactionType === 'download_attempt' ? new Date().toISOString() : null,
        file_opened_at: interactionType === 'file_open_attempt' ? new Date().toISOString() : null,
        user_agent: userAgent,
        ip_address: clientIP,
        additional_data: {
          file_name: fileName,
          file_type: fileType,
          device_fingerprint: deviceFingerprint,
          geolocation: geolocation,
          interaction_timestamp: new Date().toISOString()
        }
      }, {
        onConflict: 'campaign_id,target_email'
      });

    if (metricsError) {
      console.error('Error storing metrics:', metricsError);
    }

    // Store detailed file interaction log
    const { error: logError } = await supabaseClient
      .from('file_interactions')
      .insert({
        campaign_id: campaignId,
        target_email: targetEmail,
        file_name: fileName,
        file_type: fileType,
        interaction_type: interactionType,
        user_agent: userAgent,
        ip_address: clientIP,
        device_fingerprint: deviceFingerprint,
        geolocation: geolocation,
        created_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error storing file interaction log:', logError);
    }

    // Generate a fake file response based on file type
    const fakeFileResponse = generateFakeFileResponse(fileType, fileName);

    return new Response(fakeFileResponse.content, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': fakeFileResponse.mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fakeFileResponse.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error in simulate-file-download:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

async function createDeviceFingerprint(req: Request): Promise<string> {
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  
  // Create a simple fingerprint from available headers
  const fingerprint = btoa(`${userAgent}|${acceptLanguage}|${acceptEncoding}`);
  return fingerprint.substring(0, 32); // Truncate for storage
}

async function getGeolocation(ip: string): Promise<any> {
  try {
    if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1') {
      return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
    }

    // You can integrate with a real geolocation service here
    // For now, return mock data
    return {
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    return { country: 'Unknown', region: 'Unknown', city: 'Unknown' };
  }
}

function generateFakeFileResponse(fileType: string, fileName: string) {
  const responses = {
    pdf: {
      mimeType: 'application/pdf',
      content: '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF',
      size: 200
    },
    docx: {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00', // ZIP header for DOCX
      size: 1024
    },
    xlsx: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00', // ZIP header for XLSX
      size: 2048
    },
    zip: {
      mimeType: 'application/zip',
      content: 'PK\x03\x04\x14\x00\x00\x00\x00\x00', // ZIP header
      size: 512
    },
    exe: {
      mimeType: 'application/octet-stream',
      content: 'MZ\x90\x00', // PE header
      size: 4096
    },
    jpg: {
      mimeType: 'image/jpeg',
      content: '\xFF\xD8\xFF\xE0\x00\x10JFIF', // JPEG header
      size: 1536
    }
  };

  return responses[fileType as keyof typeof responses] || {
    mimeType: 'application/octet-stream',
    content: 'Fake file content',
    size: 100
  };
}
