
import React from 'react';
import { CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GDPRCompliance = () => {
  const complianceItems = [
    {
      title: 'Data Processing Agreement',
      description: 'Our comprehensive DPA outlines our responsibilities as a data processor and your rights as a data controller.',
      icon: CheckCircle
    },
    {
      title: 'Privacy by Design',
      description: 'Security and privacy considerations are built into every aspect of our platform from the ground up.',
      icon: CheckCircle
    },
    {
      title: 'Data Subject Rights',
      description: 'Our platform includes tools to help you fulfill data subject requests for access, deletion, and portability.',
      icon: CheckCircle
    },
    {
      title: 'Data Security',
      description: 'We implement robust security measures to protect personal data from unauthorized access or disclosure.',
      icon: CheckCircle
    },
    {
      title: 'Breach Notification',
      description: 'We have established procedures to notify you promptly in the unlikely event of a data breach.',
      icon: CheckCircle
    },
    {
      title: 'Data Minimization',
      description: 'Our platform is designed to collect only the minimum data necessary for phishing simulations.',
      icon: CheckCircle
    }
  ];

  const faqItems = [
    {
      question: 'Is running phishing simulations compliant with GDPR?',
      answer: 'Yes, phishing simulations can be GDPR-compliant when run with proper legal basis, transparency, and data protection measures in place. Our platform is designed to help you conduct simulations in a compliant manner, but you should always consult with your legal team regarding your specific implementation.'
    },
    {
      question: 'What legal basis can be used for phishing simulations under GDPR?',
      answer: 'Organizations typically rely on "legitimate interests" as the legal basis for processing personal data in phishing simulations. This is appropriate when the simulation is necessary to protect your systems and data, and the impact on individuals is minimal and proportionate.'
    },
    {
      question: 'Do I need to inform employees about phishing simulations?',
      answer: 'While you don\'t necessarily need to inform employees about specific simulation timing, transparency is important. We recommend notifying employees that security awareness training, including simulations, is part of your security program. This can be included in privacy notices, security policies, or employment contracts.'
    },
    {
      question: 'What personal data does the Phishing Guardian platform process?',
      answer: 'Our platform typically processes employees\' names, email addresses, departments, and simulation interaction data (whether they opened emails, clicked links, etc.). We follow data minimization principles and only process what\'s necessary for effective simulations.'
    },
    {
      question: 'Where is the data stored and how is it secured?',
      answer: 'All data is stored in EU-based data centers or other regions with adequate data protection measures. We employ encryption, access controls, regular security testing, and other safeguards to protect personal data.'
    },
    {
      question: 'How long does Phishing Guardian retain simulation data?',
      answer: 'We retain simulation data for the duration of your contract with us, plus a short period afterward for legal and business purposes. You can request deletion of data at any time through our platform.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  GDPR Compliance
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  How we help you conduct phishing simulations in compliance with data protection regulations
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Commitment to GDPR</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  At Phishing Guardian, we recognize the importance of data protection and privacy. 
                  Our platform is designed to help your organization run phishing simulations while 
                  respecting the privacy rights of your employees and complying with the General 
                  Data Protection Regulation (GDPR).
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  We've built GDPR compliance into our platform from the ground up, ensuring that your 
                  security awareness program can operate effectively while maintaining the highest 
                  standards of data protection.
                </p>
              </div>
              <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <img src="/placeholder.svg" alt="GDPR Compliance" className="max-w-full max-h-full" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-8 text-center">How We Support Your GDPR Compliance</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {complianceItems.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <item.icon className="h-6 w-6 text-primary mr-2" />
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-8 text-center">GDPR FAQ</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-16">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="px-6">{item.question}</AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">Need More Information?</h2>
              <p className="text-center mb-6">
                We're here to help you understand how our platform addresses GDPR requirements for phishing simulations.
              </p>
              <div className="flex justify-center">
                <a href="/contact" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Contact Our GDPR Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GDPRCompliance;
