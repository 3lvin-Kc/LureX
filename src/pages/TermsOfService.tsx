
import React from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Terms of Service
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Last updated: July 1, 2023
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="prose dark:prose-invert max-w-none">
              <h2>1. Agreement to Terms</h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                Phishing Guardian ("we," "us," or "our") governing your access to and use of the Phishing 
                Guardian platform and related services (collectively, the "Services").
              </p>
              <p>
                By accessing or using the Services, you agree to be bound by these Terms. If you do not agree 
                to these Terms, do not access or use the Services.
              </p>

              <h2>2. Description of Services</h2>
              <p>
                Phishing Guardian provides a platform for organizations to conduct simulated phishing campaigns 
                to test and improve their security awareness. Our Services may include:
              </p>
              <ul>
                <li>Creation and delivery of simulated phishing emails</li>
                <li>Development of phishing landing pages</li>
                <li>Tracking and reporting on user interactions</li>
                <li>Analytics and insights to identify security vulnerabilities</li>
              </ul>

              <h2>3. Account Registration</h2>
              <p>
                To use certain features of the Services, you must register for an account. When you register, 
                you agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as necessary</li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                We reserve the right to disable your account if we determine that you have violated these Terms.
              </p>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to use the Services to:</p>
              <ul>
                <li>Violate any applicable law or regulation</li>
                <li>Infringe the rights of any third party</li>
                <li>Harass, intimidate, or threaten any person</li>
                <li>Send unsolicited communications (spam)</li>
                <li>Distribute malware or other harmful code</li>
                <li>Interfere with or disrupt the Services or servers connected to the Services</li>
                <li>Attempt to gain unauthorized access to any portion of the Services</li>
              </ul>
              <p>
                You may only use our phishing simulation platform for legitimate security testing of your 
                own organization or organizations that have explicitly authorized you to do so.
              </p>

              <h2>5. User Content</h2>
              <p>
                Our Services allow you to upload, create, and share content ("User Content"). You retain 
                ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free 
                license to use, reproduce, modify, adapt, publish, and display such User Content in connection 
                with providing and improving the Services.
              </p>
              <p>
                You represent and warrant that:
              </p>
              <ul>
                <li>You own or have the necessary rights to your User Content</li>
                <li>Your User Content does not violate the rights of any third party</li>
                <li>You have obtained all necessary consents to share any personal information included in your User Content</li>
              </ul>

              <h2>6. Fees and Payment</h2>
              <p>
                Certain aspects of the Services may require payment of fees. All fees are specified on our 
                pricing page or in a separate written agreement with you.
              </p>
              <p>
                Payment terms:
              </p>
              <ul>
                <li>Fees are non-refundable unless otherwise specified</li>
                <li>You authorize us to charge your payment method for all fees incurred</li>
                <li>If your payment is not received by the due date, we may suspend your access to the Services</li>
                <li>All fees are exclusive of taxes, which you are responsible for paying</li>
              </ul>

              <h2>7. Intellectual Property</h2>
              <p>
                The Services, including all content, features, and functionality, are owned by Phishing Guardian 
                and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                These Terms do not grant you any right, title, or interest in or to the Services or our intellectual 
                property. You may not copy, modify, distribute, sell, or lease any part of the Services without our 
                explicit permission.
              </p>

              <h2>8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, 
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that the Services will be uninterrupted, error-free, or secure, or that any 
                defects will be corrected.
              </p>

              <h2>9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PHISHING GUARDIAN BE LIABLE FOR ANY 
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, 
                LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO 
                OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
              </p>
              <p>
                Our total liability for any claim arising out of or relating to these Terms or the Services shall 
                not exceed the amount paid by you to Phishing Guardian during the 12 months preceding the claim.
              </p>

              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Phishing Guardian and its officers, directors, 
                employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, 
                liabilities, costs, and expenses arising from or relating to your use of the Services or violation of 
                these Terms.
              </p>

              <h2>11. Term and Termination</h2>
              <p>
                These Terms will remain in effect until terminated by either you or Phishing Guardian.
              </p>
              <p>
                You may terminate these Terms at any time by canceling your account and ceasing all use of the Services.
              </p>
              <p>
                We may terminate or suspend your access to the Services immediately, without prior notice or liability, 
                for any reason, including if you breach these Terms.
              </p>

              <h2>12. Changes to Terms</h2>
              <p>
                We may revise these Terms from time to time. The most current version will always be posted on our 
                website. If a revision is material, we will provide notice prior to the new terms taking effect.
              </p>
              <p>
                By continuing to access or use our Services after revisions become effective, you agree to be bound 
                by the revised Terms.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, 
                without regard to its conflict of law provisions.
              </p>

              <h2>14. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                legal@phishingguardian.com<br />
                Phishing Guardian<br />
                123 Security Avenue, Suite 500<br />
                San Francisco, CA 94103<br />
                United States
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
