# LureX - Advanced Phishing Simulation Platform

## Overview
LureX is a sophisticated phishing simulation platform designed to help organizations test and improve their security awareness programs through realistic phishing exercises. The platform combines modern web technologies with AI-powered features to create an effective learning environment for security teams and employees.

## ICP (Ideal Customer Profile)

### Primary Target Market
- Enterprise organizations with 100+ employees
- Security teams responsible for employee security awareness training
- IT departments focused on reducing phishing-related security incidents
- Compliance officers needing to demonstrate security training effectiveness

### Key Characteristics
- Organizations with existing security awareness programs looking to enhance their training
- Companies that have experienced phishing incidents in the past
- Enterprises with compliance requirements (e.g., GDPR, HIPAA)
- Security-conscious organizations in industries frequently targeted by phishing (finance, healthcare, government)

## Problem Statement

### Key Pain Points Addressed
1. **Ineffective Traditional Training**
   - Current security awareness programs often rely on static posters and generic training materials
   - Traditional methods fail to simulate real-world phishing attacks
   - Employees struggle to recognize sophisticated phishing attempts

2. **Limited Real-World Testing**
   - Organizations lack tools to conduct realistic phishing simulations
   - Existing solutions are often too basic or too complex
   - Difficulty in creating convincing phishing scenarios

3. **Insufficient Analytics and Reporting**
   - Lack of detailed metrics to measure training effectiveness
   - Difficulty in tracking employee improvement over time
   - Inability to generate compliance reports

4. **Resource Constraints**
   - Security teams need efficient tools to run simulations without extensive manual effort
   - Limited time and budget for creating custom phishing scenarios
   - Need for scalable solutions that can handle large organizations

## Core Features

1. **AI-Powered Email Templates**
   - Generate realistic phishing emails using AI
   - Customizable templates for various attack scenarios
   - Regular updates with new phishing techniques

2. **Advanced Target Management**

## 🔍 Core Features & Implementation

### 📩 Email Campaign System

#### Email Template Management
- Rich text editor for template creation
- AI-powered template generation
- Variable substitution (e.g., {{first_name}}, {{company}})
- Template categories (e.g., credential phishing, malware, CEO fraud)
- Preview functionality before sending

#### Campaign Configuration
- Multi-step campaign creation wizard
- Template selection and customization
- Target group selection
- Scheduling options (immediate or future date)
- Custom tracking domain configuration
- Email throttling controls

#### Email Delivery
- Asynchronous email sending via Resend API
- Custom SMTP support for enterprise deployments
- Bounce and complaint handling
- Rate limiting to prevent blacklisting
- Automatic retry mechanism for failed deliveries

### 🎯 Campaign Management

#### Creation Flow
1. Basic campaign setup (name, description)
2. Template selection and customization
3. Target audience selection
4. Delivery scheduling
5. Review and launch

#### Target Management
- CSV/Excel import for target lists
- Group management and organization
- Duplicate detection
- Opt-out handling
- Department/team segmentation

#### Analytics & Reporting
- Real-time campaign metrics
- Detailed engagement statistics
- User response tracking
- Comparative analysis across campaigns
- Exportable reports (PDF, CSV)

### 🛡️ Security Simulation Engine

#### Phishing Page Hosting
- Dynamic page generation with unique tokens
- SSL/TLS encryption for all pages
- Session management

#### Tracking Mechanisms
- Unique tracking tokens per recipient
- First-party cookies for session persistence
- Encrypted URL parameters
- Server-side event logging
- Behavioral analytics (time on page, mouse movements)

#### Form Handling
- Credential capture (simulated, never stored)
- Multi-step form simulation
- File upload simulation
- Client-side validation
- Real-time feedback to security team

## 🏗 System Architecture

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Application routes
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── lib/           # Third-party library integrations
└── assets/        # Static assets
```

### Backend Services
```
supabase/
├── functions/                 # Edge Functions
│   ├── send-campaign-emails/  # Email delivery
│   ├── track-email-open/      # Open tracking
│   ├── track-email-click/     # Click tracking
│   ├── track-form-submission/ # Form submission handling
│   └── verify-domain/         # Domain verification
├── migrations/                # Database migrations
└── seed/                      # Seed data
```

### Database Schema (Key Tables)
- `campaigns` - Campaign configurations
- `templates` - Email templates
- `target_lists` - Target user groups
- `targets` - Individual recipients
- `campaign_metrics` - Engagement tracking
- `custom_domains` - Verified sending domains
- `phishing_pages` - Landing page configurations

## 🚀 Deployment

### Prerequisites
- Node.js 16+
- Supabase account
- Resend API key
- OpenAI API key for AI features (optional)

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email
RESEND_API_KEY=your-resend-key

# AI
OPENAI_API_KEY=your-openai-key
```

### Deployment Steps
1. Set up Supabase project and database
2. Configure environment variables
3. Run database migrations
4. Deploy edge functions
5. Build and deploy frontend

## 🔒 Security Considerations

- All sensitive data is encrypted at rest
- No real credentials are stored
- Rate limiting on all endpoints
- CSRF protection
- Content Security Policy (CSP) headers
- Regular security audits
- Secure cookie handling

## 📚 Documentation

For detailed documentation, please refer to:
- [User Guide](docs/USER_GUIDE.md)
- [API Reference](docs/API.md)
- [Developer Setup](docs/DEVELOPER_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 📄 License
----------------------------------------

## Security Note
This platform is designed for authorized security testing and training purposes only. Unauthorized use may violate laws and regulations. Always ensure proper authorization before conducting any security testing.
