import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, templateId, targetListId } = await req.json();

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    const { data: targets } = await supabase
      .from('targets')
      .select('*')
      .eq('list_id', targetListId);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const target of targets || []) {
      try {
        const trackingId = generateTrackingId(campaignId, target.email);
        
        let htmlContent = template.html_content || '';
        let textContent = template.text_content || '';
        let attachments: any[] = [];

        // Handle file-based campaigns
        if (campaign.simulation_type === 'file') {
          // Generate file download link
          const fileResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-file-link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              campaign_id: campaignId,
              target_email: target.email,
              file_name: campaign.file_name,
              file_type: campaign.file_type
            })
          });

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            
            // Create fake file attachment
            attachments.push({
              filename: campaign.file_name,
              content: generateFakeFileContent(campaign.file_type),
              contentType: getContentType(campaign.file_type),
              // Add tracking URL as a hidden link in the content
              trackingUrl: fileData.downloadUrl
            });

            // Replace file placeholders in email content
            const fileReplacements = {
              '{{file_name}}': campaign.file_name || 'attachment',
              '{{file_download_link}}': fileData.downloadUrl,
            };

            for (const [placeholder, value] of Object.entries(fileReplacements)) {
              htmlContent = htmlContent.split(placeholder).join(value);
              textContent = textContent.split(placeholder).join(value);
            }
          }
        } else {
          // Handle link-based campaigns (existing logic)
          const phishingLink = `${Deno.env.get('SUPABASE_URL')}/functions/v1/serve-phishing-page?t=${trackingId}`;
          
          const replacements = {
            '{{phishing_link}}': phishingLink,
          };

          for (const [placeholder, value] of Object.entries(replacements)) {
            htmlContent = htmlContent.split(placeholder).join(value);
            textContent = textContent.split(placeholder).join(value);
          }

          // Fallback: If {{phishing_link}} was never in the template, append it.
          if (!template.html_content?.includes('{{phishing_link}}')) {
            htmlContent += `<p><a href="${phishingLink}">Click here to view the link</a></p>`;
          }

          if (!template.text_content?.includes('{{phishing_link}}')) {
            textContent += `\n\nVisit this link: ${phishingLink}`;
          }
        }

        // Common replacements for both file and link campaigns
        const commonReplacements = {
          '{{first_name}}': target.first_name || '',
          '{{last_name}}': target.last_name || '',
          '{{email}}': target.email || '',
          '{{department}}': target.department || '',
          '{{position}}': target.position || '',
        };

        for (const [placeholder, value] of Object.entries(commonReplacements)) {
          htmlContent = htmlContent.split(placeholder).join(value);
          textContent = textContent.split(placeholder).join(value);
        }

        const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?t=${trackingId}" width="1" height="1" style="display:none;" />`;
        htmlContent += trackingPixel;

        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('Resend API key not set in Supabase secrets.');
        }

        const resend = new Resend(resendApiKey);

        const fromEmail = campaign.domain_id
          ? `security@${campaign.domain_id}`
          : 'WhyPhish Security <support@resend.dev>';

        const emailPayload: any = {
          from: fromEmail,
          to: [target.email],
          subject: template.subject,
          html: htmlContent,
          text: textContent,
          headers: {
            'X-Campaign-ID': campaignId,
            'X-Target-Email': target.email,
            'X-Tracking-ID': trackingId,
          },
        };

        // Add attachments for file-based campaigns
        if (campaign.simulation_type === 'file' && attachments.length > 0) {
          emailPayload.attachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType,
          }));
        }

        const emailResponse = await resend.emails.send(emailPayload);

        if (emailResponse.data) {
          await supabase.from('campaign_metrics').upsert({
            campaign_id: campaignId,
            target_email: target.email,
            sent_at: new Date().toISOString(),
            additional_data: {
              tracking_id: trackingId,
              template_id: templateId,
              resend_email_id: emailResponse.data?.id,
              email_status: 'sent',
            },
          }, {
            onConflict: 'campaign_id,target_email',
          });

          emailsSent++;
        } else {
          emailsFailed++;
          console.error(`Failed to send email to ${target.email}:`, emailResponse.error);
        }

        // Debug output
        console.log('HTML content:', htmlContent);
        console.log('Text content:', textContent);

      } catch (error) {
        emailsFailed++;
        console.error(`Error sending email to ${target.email}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      total_targets: targets?.length || 0,
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Campaign sending error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function generateTrackingId(campaignId: string, targetEmail: string): string {
  const timestamp = Date.now().toString();
  const data = `${campaignId}|${targetEmail}|${timestamp}`;
  return btoa(data);
}

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
  };
  
  return contentTypes[fileType] || 'application/octet-stream';
}

function generateFakeFileContent(fileType: string): string {
  // Generate minimal fake file content based on type
  const fakeContents: Record<string, string> = {
    pdf: '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF',
    docx: 'PK\x03\x04\x14\x00\x00\x00\x08\x00',
    xlsx: 'PK\x03\x04\x14\x00\x00\x00\x08\x00',
    zip: 'PK\x03\x04\x14\x00\x00\x00\x00\x00',
    exe: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00',
    jpg: '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00',
    png: '\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xDE',
    txt: 'This is a simulated file attachment for phishing simulation purposes.'
  };
  
  return fakeContents[fileType] || 'Simulated file content';
}
