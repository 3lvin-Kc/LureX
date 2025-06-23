
# PhishGuard Platform Complete Technical Walkthrough

## Overview
This document provides a comprehensive technical explanation of how the PhishGuard phishing simulation platform works, from campaign creation to data collection and reporting.

---

## 1. Campaign Creation & Launch Flow

### When "Run Campaign" is Selected

1. **Campaign Status Update**
   - Campaign status changes from `draft` to `in_progress` in the `campaigns` table
   - Triggers the real email sending process via Supabase Edge Function

2. **Database Records Created**
   ```sql
   -- Campaign entry
   INSERT INTO campaigns (name, status, template_id, target_list_id, phishing_page_id)
   
   -- Initial metrics entries for tracking
   INSERT INTO campaign_metrics (campaign_id, target_email, sent_at)
   ```

---

## 2. Email Link Generation & Sending

### 🔗 Link Creation Process

**Location**: `supabase/functions/send-campaign-emails/index.ts`

1. **Unique Tracking ID Generation**
   ```typescript
   const trackingId = crypto.randomUUID(); // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   ```

2. **Link Construction**
   ```typescript
   // Base tracking URL structure
   const trackingDomain = Deno.env.get('SUPABASE_URL');
   const trackingLink = `${trackingDomain}/functions/v1/track-email-click?id=${trackingId}&url=${encodedTargetUrl}`;
   ```

3. **Email Content Modification**
   ```typescript
   // Replace original links with tracking links
   const trackedHtmlContent = template.html_content.replace(
     /<a\s+href="([^"]+)"/g, 
     `<a href="${trackingDomain}/functions/v1/track-email-click?id=${trackingId}&url=$1"`
   );
   
   // Add invisible tracking pixel for opens
   const trackingPixel = `<img src="${trackingDomain}/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" />`;
   ```

### 📨 Email Delivery System

**Service**: Resend.com API

1. **Email Sending Process**
   ```typescript
   const emailResponse = await resend.emails.send({
     from: 'PhishGuard <noreply@phishguard.com>',
     to: [target.email],
     subject: template.subject,
     html: trackedHtmlContent,
     headers: {
       'X-Campaign-ID': campaignId,
       'X-Target-ID': target.id,
       'X-Tracking-ID': trackingId,
     },
   });
   ```

2. **Tracking Implementation**
   - **Email Opens**: 1x1 invisible pixel (`track-email-open` function)
   - **Email Clicks**: Link redirection (`track-email-click` function)
   - **Bounces/Complaints**: Resend webhook (`resend-webhook` function)

---

## 3. User Click Flow & Redirection

### 📥 When User Clicks Link

**Flow Path**: Email Link → Tracking Function → Phishing Page

1. **First Stop: Click Tracking**
   ```typescript
   // supabase/functions/track-email-click/index.ts
   const trackingId = url.searchParams.get('id');
   const targetUrl = url.searchParams.get('url');
   
   // Log click event
   await supabase
     .from('campaign_metrics')
     .update({
       clicked_at: new Date().toISOString(),
       user_agent: req.headers.get('user-agent'),
       ip_address: req.headers.get('x-forwarded-for')
     })
     .eq('additional_data->tracking_id', trackingId);
   ```

2. **Redirect to Phishing Page**
   ```typescript
   // Instant redirect to target destination
   return new Response(null, {
     status: 302,
     headers: { 'Location': decodeURIComponent(targetUrl) }
   });
   ```

### 🎯 Target Identification & Matching

1. **Database Lookup**
   ```sql
   SELECT c.*, t.email, t.first_name, t.last_name
   FROM campaign_metrics cm
   JOIN campaigns c ON cm.campaign_id = c.id
   JOIN targets t ON t.email = cm.target_email
   WHERE cm.additional_data->>'tracking_id' = $1
   ```

2. **Personalization Data**
   - Target's name, email, company
   - Campaign-specific branding
   - Dynamic content insertion

---

## 4. Phishing Page Display & Data Capture

### 🖥️ Page Rendering

1. **Content Retrieval**
   ```sql
   SELECT html_content, css_content, js_content 
   FROM phishing_pages 
   WHERE id = $1
   ```

2. **Dynamic Injection**
   ```javascript
   // Inject tracking scripts
   const trackingScript = `
     <script>
       // Capture form submissions
       document.addEventListener('submit', function(e) {
         fetch('/functions/v1/track-form-submission', {
           method: 'POST',
           body: JSON.stringify({
             trackingId: '${trackingId}',
             formData: new FormData(e.target)
           })
         });
       });
     </script>
   `;
   ```

### 📊 Real-time Data Capture

**Data Points Collected**:
- **Timestamp**: Exact click time
- **IP Address**: Geographic tracking
- **User Agent**: Browser/device fingerprinting
- **Form Data**: Submitted credentials (safely logged, never stored long-term)
- **Session Duration**: Time spent on page
- **Behavioral Metrics**: Mouse movements, keyboard patterns

---

## 5. Activity Tracking & Storage

### 🗄️ Database Schema

**Primary Table**: `campaign_metrics`
```sql
CREATE TABLE campaign_metrics (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  target_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  data_submitted_at TIMESTAMP WITH TIME ZONE,
  reported_at TIMESTAMP WITH TIME ZONE,
  user_agent TEXT,
  ip_address TEXT,
  additional_data JSONB -- Flexible data storage
);
```

**Additional Data Structure**:
```json
{
  "tracking_id": "uuid",
  "email_id": "resend_message_id",
  "geolocation": {"country": "US", "city": "New York"},
  "device_info": {"type": "desktop", "os": "Windows"},
  "form_data": {"username": "john@company.com", "password": "[REDACTED]"},
  "session_data": {"duration": 45, "pages_visited": 3}
}
```

### 📈 Real-time Dashboard Updates

1. **Webhook Processing**
   ```typescript
   // supabase/functions/resend-webhook/index.ts
   switch (type) {
     case 'email.sent':
       await handleEmailSent(data);
       break;
     case 'email.delivered':
       await handleEmailDelivered(data);
       break;
     case 'email.opened':
       await handleEmailOpened(data);
       break;
   }
   ```

2. **Frontend Real-time Updates**
   ```typescript
   // React component listening to changes
   useEffect(() => {
     const channel = supabase
       .channel('campaign-updates')
       .on('postgres_changes', {
         event: '*',
         schema: 'public',
         table: 'campaign_metrics'
       }, (payload) => {
         updateDashboardMetrics(payload);
       })
       .subscribe();
   }, []);
   ```

---

## 6. Security & Anti-Detection Measures

### 🔐 Link Obfuscation

1. **URL Shortening** (Currently Mock)
   ```typescript
   // Future implementation
   const shortUrl = await createShortUrl(trackingLink);
   // Converts: https://project.supabase.co/functions/v1/track-email-click?id=123&url=...
   // To: https://secure-link.co/s/abc123
   ```

2. **Domain Masking**
   - Custom domain setup for tracking links
   - SSL certificate enforcement
   - Legitimate-looking subdomains

### 🛡️ HTTPS & Security

1. **Enforced HTTPS**
   ```typescript
   // All tracking functions enforce HTTPS
   if (req.url.protocol !== 'https:') {
     return Response.redirect(`https://${req.url.host}${req.url.pathname}`);
   }
   ```

2. **Bot Detection** (Planned)
   ```typescript
   // Browser fingerprinting
   const browserFingerprint = {
     userAgent: req.headers.get('user-agent'),
     acceptLanguage: req.headers.get('accept-language'),
     acceptEncoding: req.headers.get('accept-encoding'),
     screenResolution: req.headers.get('sec-ch-viewport-width')
   };
   ```

---

## 7. Mock Data vs Real Data Transition Strategy

### 🔄 Current Mock Data Locations

**Frontend Mock Data**:
- `src/pages/PhishingPages.tsx` - Mock phishing pages
- `src/pages/Templates.tsx` - Mock email templates  
- `src/pages/Campaigns.tsx` - Mock campaigns
- `src/pages/TargetLists.tsx` - Mock target lists
- `src/pages/Reports.tsx` - Mock analytics data
- `src/hooks/useCampaigns.ts` - Mock campaign operations

**Backend Mock Services**:
- `src/utils/automatedCampaignService.ts` - Mock campaign automation
- `src/utils/phishingTrackingService.ts` - Mock tracking service
- `src/utils/processCampaignLinks.ts` - Mock link processing

### 🚀 Real Data Integration Strategy

1. **Database Integration Phase**
   ```typescript
   // Replace mock data with Supabase queries
   const { data: campaigns } = await supabase
     .from('campaigns')
     .select('*, email_templates(*), target_lists(*)')
     .order('created_at', { ascending: false });
   ```

2. **API Service Activation**
   ```typescript
   // Replace mock functions with real API calls
   const startCampaign = async (campaignId: string) => {
     const { data } = await supabase.functions.invoke('send-campaign-emails', {
       body: { campaignId, templateId, targetListId }
     });
   };
   ```

3. **Real-time Data Streaming**
   ```typescript
   // Enable live data subscriptions
   const subscription = supabase
     .channel(`campaign_${campaignId}`)
     .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_metrics' })
     .subscribe();
   ```

### 📊 Migration Checklist

**Phase 1: Core Functionality**
- ✅ Database schema created
- ✅ Edge functions deployed
- ✅ Email integration (Resend) active
- 🔄 Replace mock campaign data
- 🔄 Replace mock template data

**Phase 2: Advanced Features**
- 🔄 Real-time tracking implementation
- 🔄 Geographic IP resolution
- 🔄 Advanced analytics
- 🔄 Custom domain setup

**Phase 3: Production Hardening**
- 🔄 Bot detection algorithms
- 🔄 Rate limiting implementation
- 🔄 Advanced security measures
- 🔄 Compliance reporting

---

## 8. Complete Technical Flow Summary

```
1. USER CLICKS "RUN CAMPAIGN"
   ↓
2. CAMPAIGN STATUS → "in_progress"
   ↓
3. EDGE FUNCTION: send-campaign-emails
   ├── Generate unique tracking IDs
   ├── Modify email content with tracking
   ├── Send via Resend API
   └── Create campaign_metrics records
   ↓
4. TARGET RECEIVES EMAIL
   ├── Tracking pixel logs "opened_at"
   └── Links contain tracking parameters
   ↓
5. TARGET CLICKS LINK
   ├── EDGE FUNCTION: track-email-click
   ├── Log click data (IP, agent, timestamp)
   ├── Update campaign_metrics
   └── Redirect to phishing page
   ↓
6. PHISHING PAGE LOADS
   ├── Serve HTML/CSS/JS content
   ├── Inject additional tracking scripts
   └── Monitor user interactions
   ↓
7. USER SUBMITS FORM (Optional)
   ├── EDGE FUNCTION: track-form-submission
   ├── Log submission data
   └── Show training content
   ↓
8. REAL-TIME DASHBOARD UPDATE
   ├── PostgreSQL triggers
   ├── Supabase realtime subscriptions
   └── React state updates
```

**Data Flow**: Email → Click → Page → Form → Database → Dashboard → Reports

This system provides complete visibility into phishing simulation effectiveness while maintaining security and compliance standards.
