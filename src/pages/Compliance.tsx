
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const Compliance = () => {
  const complianceFrameworks = [
    {
      name: 'GDPR',
      description: 'General Data Protection Regulation compliance for European operations',
      features: [
        'Data processing agreements',
        'Right to be forgotten support',
        'Data export capabilities',
        'Breach notification processes',
        'Privacy by design principles'
      ],
      icon: Shield
    },
    {
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act compliance for healthcare',
      features: [
        'PHI protection mechanisms',
        'Audit logging and reporting',
        'Business associate agreements',
        'Access controls and authentication',
        'Encryption of sensitive data'
      ],
      icon: CheckCircle
    },
    {
      name: 'SOC 2',
      description: 'System and Organization Controls attestation for service organizations',
      features: [
        'Security controls documentation',
        'Availability safeguards',
        'Processing integrity verification',
        'Confidentiality measures',
        'Annual compliance audits'
      ],
      icon: AlertCircle
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Compliance & Security
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Our phishing simulation platform meets rigorous compliance standards to protect your data
                </p>
              </div>
            </div>
            
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Security Commitment</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Security is at the core of everything we do. Our phishing simulation platform is designed with 
                security best practices in mind, ensuring your sensitive data is always protected. We maintain 
                a robust security program that includes regular penetration testing, vulnerability scanning, 
                and security code reviews.
              </p>
              
              <div className="grid gap-8 md:grid-cols-3 mb-16">
                {complianceFrameworks.map((framework, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <framework.icon className="h-10 w-10 text-primary mb-2" />
                      <CardTitle>{framework.name}</CardTitle>
                      <CardDescription>{framework.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {framework.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <h2 className="text-2xl font-bold mb-6">Certifications</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <img src="/placeholder.svg" alt="ISO 27001" className="h-16 w-16 mb-4" />
                  <h3 className="font-semibold">ISO 27001</h3>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <img src="/placeholder.svg" alt="SOC 2 Type II" className="h-16 w-16 mb-4" />
                  <h3 className="font-semibold">SOC 2 Type II</h3>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <img src="/placeholder.svg" alt="GDPR Compliant" className="h-16 w-16 mb-4" />
                  <h3 className="font-semibold">GDPR Compliant</h3>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center">
                  <img src="/placeholder.svg" alt="HIPAA Compliant" className="h-16 w-16 mb-4" />
                  <h3 className="font-semibold">HIPAA Compliant</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Compliance;
