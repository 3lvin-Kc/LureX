import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaign_id, target_email, file_name, file_type } = await req.json()

    console.log(`🔗 Generating file link for campaign ${campaign_id}, target: ${target_email}, file: ${file_name}.${file_type}`)

    if (!campaign_id || !target_email || !file_name || !file_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the base URL for the file download endpoint
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://your-project.supabase.co'

    // Create tracking parameters
    const trackingParams = new URLSearchParams({
      c: campaign_id,
      e: target_email,
      f: file_name,
      t: file_type,
      action: 'download_attempt'
    })

    // Generate the file download URL that points to our simulate-file-download function
    const fileDownloadUrl = `${baseUrl}/functions/v1/simulate-file-download?${trackingParams.toString()}`

    // Generate file metadata for email attachment
    const fileMetadata = {
      filename: file_name,
      contentType: getContentType(file_type),
      size: getEstimatedFileSize(file_type),
      downloadUrl: fileDownloadUrl,
      trackingUrl: fileDownloadUrl.replace('action=download_attempt', 'action=file_open_attempt')
    }

    console.log(`✅ File link generated successfully for ${target_email}: ${fileDownloadUrl}`)

    return new Response(
      JSON.stringify({
        success: true,
        fileMetadata,
        downloadUrl: fileDownloadUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error generating file link:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function getContentType(fileType: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    exe: 'application/octet-stream',
    jpg: 'image/jpeg',
    png: 'image/png',
    txt: 'text/plain'
  }
  
  return contentTypes[fileType] || 'application/octet-stream'
}

function getEstimatedFileSize(fileType: string): number {
  const fileSizes: Record<string, number> = {
    pdf: 245760,      // ~240KB
    docx: 51200,      // ~50KB
    xlsx: 102400,     // ~100KB
    zip: 20480,       // ~20KB
    exe: 2097152,     // ~2MB
    jpg: 524288,      // ~512KB
    png: 1048576,     // ~1MB
    txt: 4096         // ~4KB
  }
  
  return fileSizes[fileType] || 102400 // Default to ~100KB
}
