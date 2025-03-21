
import React from 'react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Privacy Policy
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
              <h2>Introduction</h2>
              <p>
                Phishing Guardian ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our phishing 
                simulation platform and related services (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that 
                you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
              </p>

              <h2>Information We Collect</h2>
              <p>We collect information in several different ways:</p>
              
              <h3>Information You Provide to Us</h3>
              <p>
                When you register for an account, sign up for newsletters, or contact us, we collect information 
                that you voluntarily provide to us, such as:
              </p>
              <ul>
                <li>Account information (name, email address, password)</li>
                <li>Company information (name, address, industry)</li>
                <li>Billing information (credit card details, billing address)</li>
                <li>Any other information you choose to provide</li>
              </ul>
              
              <h3>Information About Your Employees</h3>
              <p>
                When you use our phishing simulation platform, you may upload information about your employees 
                or other individuals who will receive simulated phishing emails:
              </p>
              <ul>
                <li>Names</li>
                <li>Email addresses</li>
                <li>Department or job roles</li>
                <li>Location</li>
              </ul>
              <p>
                You represent and warrant that you have all necessary rights and consents to provide this 
                information to us for use in connection with the Services.
              </p>
              
              <h3>Information Collected Automatically</h3>
              <p>
                When you use our Services, we may automatically collect certain information, including:
              </p>
              <ul>
                <li>Device information (browser type, operating system, IP address)</li>
                <li>Usage information (pages visited, time spent on the platform)</li>
                <li>Phishing simulation data (email open rates, click-through rates)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative notifications, such as updates or security alerts</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Analyze usage patterns and trends to improve user experience</li>
                <li>Generate insights and analytics about phishing vulnerability</li>
                <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2>Sharing of Information</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li>With vendors or service providers who perform services on our behalf</li>
                <li>As required by law or to comply with legal process</li>
                <li>To protect the rights, property, or safety of our company, our users, or others</li>
                <li>In connection with a business transaction, such as a merger or acquisition</li>
                <li>With your consent or at your direction</li>
              </ul>
              <p>
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>

              <h2>Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide the Services you have requested, 
                or for other essential purposes such as complying with our legal obligations, resolving disputes, 
                and enforcing our policies.
              </p>

              <h2>Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul>
                <li>Access, update, or delete your information</li>
                <li>Object to our processing of your information</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, please contact us at privacy@phishingguardian.com.
              </p>

              <h2>Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the information we 
                collect and maintain. However, no security system is impenetrable, and we cannot guarantee 
                the absolute security of our systems.
              </p>

              <h2>International Data Transfers</h2>
              <p>
                Your information may be transferred to, stored, and processed in countries other than the one 
                in which you reside. By using our Services, you consent to the transfer of your information to 
                countries which may have different data protection rules than your country.
              </p>

              <h2>Changes to this Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                privacy@phishingguardian.com<br />
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

export default PrivacyPolicy;
