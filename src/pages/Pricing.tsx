
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const Pricing = () => {
  const tiers = [
    {
      name: 'Basic',
      price: '$99',
      period: 'per month',
      description: 'Essential phishing simulation for small teams',
      features: [
        'Up to 100 employees',
        '10 campaigns per month',
        '20 phishing templates',
        'Basic reporting',
        'Email support'
      ],
      buttonText: 'Get Started',
      highlighted: false
    },
    {
      name: 'Professional',
      price: '$299',
      period: 'per month',
      description: 'Advanced security testing for growing organizations',
      features: [
        'Up to 500 employees',
        'Unlimited campaigns',
        '50+ phishing templates',
        'Advanced analytics',
        'Priority support',
        'Custom landing pages',
        'Training integration'
      ],
      buttonText: 'Get Started',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'Comprehensive solutions for large enterprises',
      features: [
        'Unlimited employees',
        'Advanced targeting options',
        'Custom templates',
        'Executive reporting',
        'Dedicated account manager',
        'API access',
        'SSO integration',
        'Custom training modules'
      ],
      buttonText: 'Contact Sales',
      highlighted: false
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
                  Simple, Transparent Pricing
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Choose the plan that's right for your organization's security needs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3">
              {tiers.map((tier, index) => (
                <Card 
                  key={index} 
                  className={`flex flex-col justify-between ${tier.highlighted ? 'border-primary shadow-lg' : ''}`}
                >
                  <CardHeader>
                    <CardTitle>{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400"> {tier.period}</span>
                    </div>
                    <CardDescription className="mt-2">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={tier.highlighted ? "default" : "outline"}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need a custom solution? <a href="/contact" className="text-primary underline">Contact our sales team</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
