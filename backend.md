
# Backend Architecture & Frontend Integration

This document explains how our phishing simulation platform connects frontend components with backend functionality to create a cohesive security awareness training system.

## System Overview

Our platform uses a modern architecture with:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase for database, authentication, and storage
- **Edge Functions**: Serverless functions for specialized operations
- **API Integrations**: SendGrid for email delivery, OpenAI for template generation

## Core Components & Integration Points

### Authentication & User Management

**How it works:** 
- Users sign up/log in through the frontend authentication page
- Supabase authentication handles credential verification and session management
- User profiles with role-based permissions control access to different features
- Session tokens are used for all API calls requiring authorization

**Technical flow:**
1. User enters credentials on login screen
2. Frontend sends auth request to Supabase auth API
3. Backend validates credentials and generates session token
4. Frontend stores token and includes it in authenticated requests
5. Backend validates token with each request before allowing access to protected resources

### Campaign Management

**How it works:**
- Users create phishing campaigns through the frontend campaign builder
- Templates, target lists, and sending schedules are configured in the UI
- When launched, campaigns are processed by edge functions to create and queue emails
- Tracking metrics are collected in real-time and displayed in the dashboard

**Technical flow:**
1. User configures campaign parameters in the UI
2. Frontend sends campaign data to Supabase database
3. `queue-campaign` edge function processes campaign, creating tracking IDs and queue entries
4. `process-queue` edge function sends emails according to schedule
5. Tracking links in emails point to `track-open` and `track-click` functions
6. Real-time metrics flow back to the frontend via database queries

### Email Templates

**How it works:**
- Users create/edit templates through the template editor
- AI-assisted template generation is available via the OpenAI integration
- Templates are stored in the database with versioning support
- Templates are merged with target data when campaigns are launched

**Technical flow:**
1. User creates template in the template editor or requests AI generation
2. For AI generation, frontend calls `generate-template` edge function
3. Templates are stored in the `email_templates` table with HTML/text versions
4. When a campaign is launched, templates are retrieved and processed by edge functions
5. Dynamic content and tracking links are injected into templates before sending

### Target Lists

**How it works:**
- Users manage target lists through the target management interface
- Lists can be created manually, uploaded via CSV, or synchronized from external sources
- Target data is securely stored with appropriate access controls
- When campaigns are launched, targets are matched with templates

**Technical flow:**
1. User uploads or creates target list
2. Frontend processes data and sends to Supabase database
3. Targets are stored in the `targets` table, associated with specific lists
4. When a campaign is launched, targets are queried and processed for email sending
5. Each target gets unique tracking identifiers for campaign analytics

### Email Sending & Delivery

**How it works:**
- Campaigns are queued for sending based on configured schedule
- Edge functions process the queue and send emails via SendGrid
- Email delivery is tracked and status is updated in the database
- Failed deliveries are handled with appropriate retry logic

**Technical flow:**
1. `process-queue` edge function polls for queued emails
2. For each email, the function:
   - Retrieves template and target data
   - Injects tracking pixels and modifies links for click tracking
   - Sends email through SendGrid API
   - Updates delivery status in the database
3. Delivery confirmations from SendGrid trigger status updates
4. Failed deliveries are logged and may be retried based on configuration

### Tracking & Analytics

**How it works:**
- Each email contains invisible tracking pixels and modified links
- When recipients open emails or click links, tracking functions record the activity
- Dashboard displays real-time metrics and analytics
- Reports can be generated with detailed campaign performance data

**Technical flow:**
1. When an email is opened:
   - Browser loads tracking pixel from `track-open` edge function
   - Function records open event and timing in database
   - Function returns a 1x1 transparent GIF
2. When a link is clicked:
   - User clicks link that points to `track-click` edge function
   - Function records click event and timing in database
   - Function redirects user to the actual destination URL
3. Frontend queries tracking data for dashboard visualization
4. `generate-report` function creates detailed reports for download

### Multi-Vector Phishing

**How it works:**
- Beyond email, the platform supports SMS, social media, and other phishing vectors
- Each vector uses specialized templates and delivery mechanisms
- Unified tracking across vectors provides comprehensive security insights
- Results are consolidated in a single reporting interface

**Technical flow:**
1. User configures multi-vector campaign in the UI
2. Frontend sends configuration to backend
3. `MultiVectorPhishingService` processes different vector types
4. Vector-specific edge functions handle delivery for each channel
5. Unified tracking IDs correlate activity across vectors
6. Consolidated analytics show effectiveness across different attack methods

### Automated Campaigns

**How it works:**
- Campaigns can be scheduled for future execution
- Recurring campaigns can be configured for ongoing training
- Automated monitoring tracks campaign progress
- Campaigns transition through status stages (draft, scheduled, active, completed)

**Technical flow:**
1. User schedules campaign in the UI
2. Campaign is stored with schedule parameters
3. `AutomatedCampaignService` monitors scheduled campaigns
4. At the scheduled time, service triggers campaign execution
5. Campaign progresses through status stages automatically
6. Completion triggers notification and final reporting

### Reporting & Compliance

**How it works:**
- Reports can be generated for individual campaigns or across multiple campaigns
- Compliance frameworks (GDPR, HIPAA, etc.) guide report formats
- Reports can be exported in various formats (PDF, Excel, CSV)
- Executive summaries provide high-level insights

**Technical flow:**
1. User requests report generation in the UI
2. Frontend calls `generate-report` edge function with parameters
3. Function queries relevant data and formats according to template
4. Report is generated and stored or returned directly to user
5. For scheduled reports, automated generation occurs on defined intervals

### Security & Privacy

**How it works:**
- All sensitive data is encrypted in transit and at rest
- Row-level security ensures users only see authorized data
- Audit logs track all system activities for compliance
- Privacy controls ensure GDPR and other regulatory compliance

**Technical flow:**
1. All API communications use HTTPS encryption
2. Database tables use row-level security policies
3. Sensitive operations are logged via `security-log` function
4. `immutable-log` function creates tamper-proof audit records
5. Privacy-focused data handling ensures compliance with regulations

## Real-World Operation

In practice, the system functions as follows when fully deployed:

1. **Setup Phase**
   - Security team creates user accounts with appropriate permissions
   - Templates are created or generated for various phishing scenarios
   - Target lists are established based on training requirements

2. **Campaign Creation**
   - Security team creates campaign with selected templates and targets
   - Campaign parameters (timing, tracking options, etc.) are configured
   - Campaign is scheduled or launched immediately

3. **Execution Phase**
   - Edge functions process the campaign queue
   - Emails are sent to targets according to schedule
   - Other vectors (SMS, social, etc.) are deployed if configured
   - Tracking begins collecting interaction data

4. **Monitoring Phase**
   - Dashboard displays real-time campaign metrics
   - Security team monitors progress and effectiveness
   - Automated alerts flag anomalies or significant events

5. **Analysis Phase**
   - After campaign completion, comprehensive reports are generated
   - Results are analyzed to identify security awareness gaps
   - Security team plans follow-up training based on results

6. **Training Integration**
   - Users who interact with phishing simulations receive training
   - Training effectiveness is measured in subsequent campaigns
   - Security awareness improves over multiple campaign cycles

## API Endpoints & Edge Functions

For developers, these are the key backend services exposed:

| Function | Purpose | Frontend Integration Point |
|----------|---------|----------------------------|
| `queue-campaign` | Prepare campaign for sending | Campaign launch button |
| `process-queue` | Send queued emails | Scheduled task, no direct UI |
| `track-open` | Record email opens | Tracking pixel in emails |
| `track-click` | Record link clicks | Modified links in emails |
| `generate-template` | AI-powered template creation | Template editor |
| `generate-report` | Create campaign reports | Reporting interface |
| `analyze-phishing` | Evaluate phishing indicators | Template analysis view |
| `clone-website` | Create phishing pages | Phishing page builder |

## Database Schema

Key tables and their relationships:

- `campaigns`: Core campaign configuration and status
- `email_templates`: Reusable email templates
- `targets`: Individual recipients for campaigns
- `target_lists`: Grouped targets for campaign use
- `email_queue`: Emails pending delivery
- `email_tracking`: Open/click tracking data
- `providers`: Email sending configurations
- `reports`: Generated reports and metrics

## Extending the System

The architecture supports extension through:

1. **New Vector Types**
   - Implement vector-specific delivery in `MultiVectorPhishingService`
   - Create associated templates and tracking mechanisms
   - Integrate with existing reporting framework

2. **Additional Integrations**
   - Create new edge functions for third-party services
   - Configure appropriate API credentials
   - Implement frontend components to leverage new capabilities

3. **Enhanced Analytics**
   - Expand tracking capabilities with new metrics
   - Create specialized reporting functions
   - Develop advanced visualization components

By maintaining this clear separation between frontend and backend components while ensuring cohesive integration points, the system remains flexible, maintainable, and scalable.
