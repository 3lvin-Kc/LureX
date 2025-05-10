
/**
 * Utility for automatically tracking form submissions in phishing templates
 * Adds standardized tracking capabilities to phishing templates
 */

export interface FormTrackingOptions {
  trackingId: string;
  pageId: string;
  redirectUrl?: string;
  submitEndpoint?: string;
  excludeFields?: string[];
}

/**
 * Add form submission tracking to a phishing page
 * 
 * @param html The HTML content of the page
 * @param options Tracking options
 * @returns Modified HTML with tracking code
 */
export const addFormTracking = (html: string, options: FormTrackingOptions): string => {
  const {
    trackingId,
    pageId,
    redirectUrl = "/training",
    submitEndpoint = "https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-submission",
    excludeFields = ["password", "passwd", "pass", "secret", "credential", "token"]
  } = options;
  
  // Create the tracking script
  const trackingScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var forms = document.querySelectorAll('form');
      forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          var formData = {};
          var formElements = e.target.elements;
          for (var i = 0; i < formElements.length; i++) {
            if (formElements[i].name && formElements[i].value) {
              // Skip excluded fields (passwords, etc.)
              var fieldName = formElements[i].name.toLowerCase();
              if (${JSON.stringify(excludeFields)}.some(function(exclude) { return fieldName.includes(exclude); })) {
                continue;
              }
              formData[formElements[i].name] = formElements[i].value;
            }
          }
          
          fetch('${submitEndpoint}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              trackingId: '${trackingId}',
              pageId: '${pageId}',
              formData: formData
            })
          })
          .then(function() {
            window.location.href = '${redirectUrl}?tid=${trackingId}';
          })
          .catch(function() {
            window.location.href = '${redirectUrl}?tid=${trackingId}';
          });
        });
      });
    });
  </script>
  `;
  
  // Add tracking pixel for page view tracking
  const trackingPixel = `<img src="https://sfsloprgxcwjjzjiwkmc.supabase.co/functions/v1/track-open?tid=${trackingId}" width="1" height="1" alt="" style="position:absolute;visibility:hidden" />`;
  
  // Add disclaimer for legal compliance
  const disclaimer = `
    <div style="position:fixed;bottom:0;left:0;right:0;background-color:#f8f9fa;padding:10px;text-align:center;font-size:12px;border-top:1px solid #dee2e6;color:#6c757d;z-index:9999;">
      This is a security awareness training exercise. No actual data is being collected.
    </div>
  `;
  
  // Insert the script into the HTML
  let modifiedHtml = html;
  
  // Add tracking script to head
  if (modifiedHtml.includes('</head>')) {
    modifiedHtml = modifiedHtml.replace('</head>', `${trackingScript}</head>`);
  } else if (modifiedHtml.includes('<body>')) {
    modifiedHtml = modifiedHtml.replace('<body>', `<head>${trackingScript}</head><body>`);
  } else {
    modifiedHtml = `<head>${trackingScript}</head>${modifiedHtml}`;
  }
  
  // Add tracking pixel to body
  if (modifiedHtml.includes('</body>')) {
    modifiedHtml = modifiedHtml.replace('</body>', `${trackingPixel}${disclaimer}</body>`);
  } else {
    modifiedHtml = `${modifiedHtml}${trackingPixel}${disclaimer}`;
  }
  
  return modifiedHtml;
};

/**
 * Generate a complete phishing page with tracking capabilities
 * 
 * @param html The HTML content
 * @param css The CSS content (optional)
 * @param js The JavaScript content (optional)
 * @param options Tracking options
 * @returns Complete HTML document with tracking
 */
export const generatePhishingPage = (
  html: string,
  options: FormTrackingOptions,
  css?: string,
  js?: string
): string => {
  // Start with base HTML
  let pageHtml = html;

  // Add CSS if provided
  if (css) {
    if (pageHtml.includes('</head>')) {
      pageHtml = pageHtml.replace('</head>', `<style>${css}</style></head>`);
    } else if (pageHtml.includes('<body>')) {
      pageHtml = pageHtml.replace('<body>', `<head><style>${css}</style></head><body>`);
    } else {
      pageHtml = `<head><style>${css}</style></head>${pageHtml}`;
    }
  }
  
  // Add JS if provided (after form tracking is added)
  if (js) {
    if (pageHtml.includes('</body>')) {
      pageHtml = pageHtml.replace('</body>', `<script>${js}</script></body>`);
    } else {
      pageHtml = `${pageHtml}<script>${js}</script>`;
    }
  }
  
  // Add form tracking
  const trackedHtml = addFormTracking(pageHtml, options);
  
  return trackedHtml;
};

export default {
  addFormTracking,
  generatePhishingPage
};
