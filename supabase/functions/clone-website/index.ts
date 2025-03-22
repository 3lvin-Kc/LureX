
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { url, name, category } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Attempting to clone website: ${url}`)

    // Try to fetch the target website with enhanced browser-like headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${response.statusText}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get the HTML content
    const htmlContent = await response.text()
    
    // Parse the HTML to extract resources
    let cssContent = ''
    let jsContent = ''

    try {
      const document = new DOMParser().parseFromString(htmlContent, "text/html");
      
      // Extract all external CSS
      const externalStyles = document?.querySelectorAll("link[rel='stylesheet']");
      if (externalStyles && externalStyles.length > 0) {
        for (let i = 0; i < externalStyles.length; i++) {
          const href = externalStyles[i].getAttribute("href");
          if (href) {
            try {
              // Convert relative URLs to absolute
              const cssUrl = new URL(href, url).href;
              const cssResponse = await fetch(cssUrl);
              if (cssResponse.ok) {
                cssContent += await cssResponse.text() + "\n";
              }
            } catch (error) {
              console.error("Error fetching external CSS:", error);
            }
          }
        }
      }

      // Extract all inline styles
      const styleElements = document?.querySelectorAll("style");
      if (styleElements && styleElements.length > 0) {
        for (let i = 0; i < styleElements.length; i++) {
          cssContent += styleElements[i].textContent + "\n";
        }
      }

      // Extract all external JavaScript
      const externalScripts = document?.querySelectorAll("script[src]");
      if (externalScripts && externalScripts.length > 0) {
        for (let i = 0; i < externalScripts.length; i++) {
          const src = externalScripts[i].getAttribute("src");
          if (src) {
            try {
              // Convert relative URLs to absolute
              const jsUrl = new URL(src, url).href;
              const jsResponse = await fetch(jsUrl);
              if (jsResponse.ok) {
                jsContent += await jsResponse.text() + "\n";
              }
            } catch (error) {
              console.error("Error fetching external JS:", error);
            }
          }
        }
      }

      // Extract all inline scripts
      const scriptElements = document?.querySelectorAll("script:not([src])");
      if (scriptElements && scriptElements.length > 0) {
        for (let i = 0; i < scriptElements.length; i++) {
          jsContent += scriptElements[i].textContent + "\n";
        }
      }
    } catch (error) {
      console.error("Error parsing HTML:", error);
      // Continue with basic regex extraction as fallback
    }

    // Fallback: Basic regex to find inline styles if DOM parsing failed
    if (!cssContent) {
      const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatches) {
        cssContent = styleMatches.map(match => {
          const content = match.replace(/<style[^>]*>|<\/style>/gi, '');
          return content;
        }).join('\n');
      }
    }

    // Fallback: Basic regex to find inline scripts if DOM parsing failed
    if (!jsContent) {
      const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        jsContent = scriptMatches.map(match => {
          const content = match.replace(/<script[^>]*>|<\/script>/gi, '');
          if (!content.includes('</') && !content.includes('function(') && content.trim().length > 0) {
            return content;
          }
          return '';
        }).join('\n');
      }
    }

    // Process the HTML to handle relative URLs
    let processedHtml = htmlContent;
    
    try {
      const baseUrl = new URL(url).origin;
      // Convert relative URLs in href and src attributes to absolute
      processedHtml = processedHtml.replace(/\s(href|src)="(?!http|https|\/\/|#|javascript|data:)([^"]+)"/gi, (match, attr, path) => {
        try {
          const absoluteUrl = new URL(path, baseUrl).href;
          return ` ${attr}="${absoluteUrl}"`;
        } catch (e) {
          return match; // Keep original if conversion fails
        }
      });
    } catch (error) {
      console.error("Error processing HTML URLs:", error);
    }

    // Save to database
    const pageName = name || new URL(url).hostname;
    const { data, error } = await supabaseClient
      .from('phishing_pages')
      .insert([
        {
          name: pageName,
          category: category || 'Cloned',
          source_url: url,
          html_content: processedHtml,
          css_content: cssContent,
          js_content: jsContent,
          is_custom: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving page:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
