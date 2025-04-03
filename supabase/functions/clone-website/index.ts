
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 300000; // 5 minutes in milliseconds
const ipRequests: Record<string, { count: number, timestamp: number }> = {};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!ipRequests[ip] || (now - ipRequests[ip].timestamp) > RATE_WINDOW) {
    ipRequests[ip] = { count: 1, timestamp: now };
    return true;
  }
  
  if (ipRequests[ip].count >= RATE_LIMIT) {
    return false;
  }
  
  ipRequests[ip].count++;
  return true;
}

// Clean up old rate limit entries periodically (every minute)
setInterval(() => {
  const now = Date.now();
  Object.keys(ipRequests).forEach(ip => {
    if (now - ipRequests[ip].timestamp > RATE_WINDOW) {
      delete ipRequests[ip];
    }
  });
}, 60000);

interface CloneWebsiteRequest {
  url: string;
  name: string;
  category: string;
  advancedCloning?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    
    // Check rate limiting
    if (!checkRateLimit(clientIp)) {
      console.error(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again later." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { url, name, category, advancedCloning } = await req.json() as CloneWebsiteRequest;
    
    if (!url || !name || !category) {
      throw new Error("Missing required fields");
    }
    
    console.log(`Cloning website: ${url} (Advanced: ${advancedCloning ? 'Yes' : 'No'})`);
    
    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (e) {
      throw new Error("Invalid URL provided");
    }
    
    // Step 1: Fetch the main HTML page
    console.log("Fetching main HTML content...");
    const htmlResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    
    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch website: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }
    
    const htmlContent = await htmlResponse.text();
    
    // Step 2: Parse the HTML to extract CSS and JS resources
    console.log("Parsing HTML and extracting resources...");
    const { cssContent, jsContent, modifiedHtml } = await processHtml(
      htmlContent, 
      targetUrl, 
      advancedCloning
    );
    
    // Step 3: Detect company name
    const companyName = extractCompanyName(htmlContent, targetUrl);
    
    // Step 4: Create a record in the phishing_pages table
    console.log("Saving phishing page to database...");
    const { data, error } = await supabase
      .from("phishing_pages")
      .insert({
        name: name,
        category: category,
        html_content: modifiedHtml,
        css_content: cssContent,
        js_content: jsContent,
        source_url: url,
        is_custom: false
      })
      .select("id")
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Website cloned successfully! Page ID: ${data.id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        pageId: data.id,
        message: "Website cloned successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in clone-website function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function processHtml(
  htmlContent: string,
  baseUrl: URL,
  advancedCloning: boolean = false
): Promise<{ cssContent: string, jsContent: string, modifiedHtml: string }> {
  let cssContent = "";
  let jsContent = "";
  let modifiedHtml = htmlContent;
  
  try {
    // Extract CSS links
    const cssLinks = htmlContent.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g) || [];
    const cssFiles: string[] = [];
    
    // Create regex pattern for the base URL domain
    const domainPattern = new RegExp(`^(?:https?:)?//${baseUrl.hostname}`);
    
    // Process each CSS link
    for (const cssLink of cssLinks) {
      const hrefMatch = cssLink.match(/href=["']([^"']+)["']/);
      if (hrefMatch && hrefMatch[1]) {
        let cssUrl = hrefMatch[1];
        
        // Handle relative URLs
        if (!cssUrl.startsWith('http') && !cssUrl.startsWith('//')) {
          if (cssUrl.startsWith('/')) {
            cssUrl = `${baseUrl.origin}${cssUrl}`;
          } else {
            const pathParts = baseUrl.pathname.split('/');
            pathParts.pop();
            const basePath = pathParts.join('/');
            cssUrl = `${baseUrl.origin}${basePath}/${cssUrl}`;
          }
        } else if (cssUrl.startsWith('//')) {
          cssUrl = `https:${cssUrl}`;
        }
        
        // Only fetch CSS files from the same domain or CDNs if advanced cloning is enabled
        if (domainPattern.test(cssUrl) || (advancedCloning && !cssUrl.includes('data:'))) {
          cssFiles.push(cssUrl);
        }
      }
    }
    
    // Fetch and combine CSS content
    const cssContents: string[] = [];
    for (const cssFile of cssFiles) {
      try {
        const response = await fetch(cssFile);
        if (response.ok) {
          const css = await response.text();
          cssContents.push(`/* From: ${cssFile} */\n${css}`);
        }
      } catch (e) {
        console.warn(`Failed to fetch CSS file: ${cssFile}`, e);
      }
    }
    
    cssContent = cssContents.join('\n\n');
    
    // Extract inline CSS
    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let styleMatch;
    while ((styleMatch = styleTagRegex.exec(htmlContent)) !== null) {
      cssContent += `\n\n/* Inline CSS */\n${styleMatch[1]}`;
    }
    
    // Extract essential JavaScript if advanced cloning is enabled
    if (advancedCloning) {
      // Extract script tags with src attribute
      const scriptTags = htmlContent.match(/<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g) || [];
      const jsFiles: string[] = [];
      
      for (const scriptTag of scriptTags) {
        const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
          let jsUrl = srcMatch[1];
          
          // Handle relative URLs
          if (!jsUrl.startsWith('http') && !jsUrl.startsWith('//')) {
            if (jsUrl.startsWith('/')) {
              jsUrl = `${baseUrl.origin}${jsUrl}`;
            } else {
              const pathParts = baseUrl.pathname.split('/');
              pathParts.pop();
              const basePath = pathParts.join('/');
              jsUrl = `${baseUrl.origin}${basePath}/${jsUrl}`;
            }
          } else if (jsUrl.startsWith('//')) {
            jsUrl = `https:${jsUrl}`;
          }
          
          // Only fetch JavaScript files from the same domain
          if (domainPattern.test(jsUrl)) {
            jsFiles.push(jsUrl);
          }
        }
      }
      
      // Fetch and combine JavaScript content (only essential ones)
      const jsContents: string[] = [];
      for (const jsFile of jsFiles.slice(0, 3)) { // Limit to the first 3 to avoid excessive code
        try {
          const response = await fetch(jsFile);
          if (response.ok) {
            const js = await response.text();
            jsContents.push(`// From: ${jsFile}\n${js}`);
          }
        } catch (e) {
          console.warn(`Failed to fetch JavaScript file: ${jsFile}`, e);
        }
      }
      
      // Extract inline JavaScript
      const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
      let inlineScriptMatch;
      while ((inlineScriptMatch = inlineScriptRegex.exec(htmlContent)) !== null) {
        // Skip if it has a src attribute
        const hasSrc = /<script[^>]*src=/.test(inlineScriptMatch[0]);
        if (!hasSrc) {
          jsContents.push(`// Inline JavaScript\n${inlineScriptMatch[1]}`);
        }
      }
      
      jsContent = jsContents.join('\n\n');
    }
    
    // Modify HTML content to use our version of CSS and JS
    modifiedHtml = htmlContent
      // Replace all CSS links with a single link to our CSS
      .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/g, '')
      // Add our CSS before the closing head tag
      .replace('</head>', '<style id="phishing-simulation-styles">\n' + cssContent + '\n</style>\n</head>')
      // Replace form actions to capture submissions
      .replace(/<form([^>]*)action=["']([^"']*)["']([^>]*)>/g, (match, before, action, after) => {
        return `<form${before}action="#" data-original-action="${action}"${after} onsubmit="return handleFormSubmit(this, event);">`;
      });
    
    // If advanced cloning, add form handling functionality
    if (advancedCloning) {
      // Add custom form handling script
      const formHandlingScript = `
      <script>
      function handleFormSubmit(form, event) {
        event.preventDefault();
        
        var formData = new FormData(form);
        var formObject = {};
        
        formData.forEach(function(value, key) {
          formObject[key] = value;
        });
        
        // Add additional info
        formObject['_phishingSimulation'] = true;
        formObject['_originalAction'] = form.getAttribute('data-original-action');
        formObject['_timestamp'] = new Date().toISOString();
        formObject['_targetUrl'] = window.location.href;
        
        // Log captured credentials
        console.log('Form submission captured:', formObject);
        
        // Show a realistic loading message
        var loadingDiv = document.createElement('div');
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = '0';
        loadingDiv.style.left = '0';
        loadingDiv.style.width = '100%';
        loadingDiv.style.height = '100%';
        loadingDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingDiv.style.display = 'flex';
        loadingDiv.style.justifyContent = 'center';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.zIndex = '9999';
        loadingDiv.innerHTML = '<div style="text-align: center;"><div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite; margin: 0 auto;"></div><p style="margin-top: 20px;">Processing your request...</p></div>';
        
        // Add the animation style
        var style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        
        document.body.appendChild(loadingDiv);
        
        // Simulate processing delay then redirect to phishing training page
        setTimeout(function() {
          window.location.href = '/phishing-training-complete';
        }, 3000);
        
        return false;
      }
      </script>
      `;
      
      // Add script before closing body tag
      modifiedHtml = modifiedHtml.replace('</body>', formHandlingScript + '</body>');
    }
    
    return { cssContent, jsContent, modifiedHtml };
  } catch (error) {
    console.error("Error processing HTML:", error);
    throw error;
  }
}

function extractCompanyName(html: string, url: URL): string {
  // Try to extract from title tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const title = titleMatch[1].trim();
    
    // Remove common suffixes from title
    const cleanTitle = title
      .replace(/\s*[|]\s*.+$/, '')
      .replace(/\s*[-]\s*.+$/, '')
      .replace(/\s*[:]\s*.+$/, '')
      .trim();
    
    if (cleanTitle.length > 0 && cleanTitle.length < 50) {
      return cleanTitle;
    }
  }
  
  // Try to extract from meta tags
  const metaTagMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (metaTagMatch && metaTagMatch[1]) {
    return metaTagMatch[1].trim();
  }
  
  // Fall back to domain name without TLD
  const domain = url.hostname.replace(/^www\./, '');
  const domainParts = domain.split('.');
  if (domainParts.length >= 2) {
    return domainParts[domainParts.length - 2].charAt(0).toUpperCase() + domainParts[domainParts.length - 2].slice(1);
  }
  
  return domain;
}
