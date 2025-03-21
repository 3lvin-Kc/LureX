
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

const About = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former security consultant with 15+ years of experience helping Fortune 500 companies strengthen their security posture.',
      image: '/placeholder.svg'
    },
    {
      name: 'David Chen',
      role: 'CTO & Co-Founder',
      bio: 'Cybersecurity expert with background in ethical hacking and penetration testing for major financial institutions.',
      image: '/placeholder.svg'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      bio: 'Product leader with experience building security tools at leading tech companies. Passionate about user-centered design.',
      image: '/placeholder.svg'
    },
    {
      name: 'Emily Williams',
      role: 'Director of Customer Success',
      bio: 'Dedicated to helping organizations implement effective security awareness programs with measurable results.',
      image: '/placeholder.svg'
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
                  About Phishing Guardian
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Our mission is to strengthen the human layer of security through effective phishing simulations
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Story</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Founded in 2018, Phishing Guardian was born out of frustration with existing security 
                  awareness tools that were either too complex or ineffective at changing behavior.
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Our founders, who spent years in the trenches of cybersecurity, realized that despite 
                  increasing investments in security technology, organizations remained vulnerable because 
                  of the human element.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Today, we serve over 1,000 organizations worldwide, from small businesses to Fortune 500 
                  companies, helping them build a culture of security through effective phishing simulations 
                  and training.
                </p>
              </div>
              <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <img src="/placeholder.svg" alt="About Phishing Guardian" className="max-w-full max-h-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter mb-12 text-center">Our Leadership Team</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.role}</p>
                    <p className="text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Our Values</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400">
                The principles that guide our work and culture
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Security First</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We practice what we preach, implementing the highest security standards in everything we do.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Customer Impact</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We measure our success by the tangible improvement in our customers' security posture.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Continuous Innovation</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We constantly evolve our platform to stay ahead of emerging threats and attack techniques.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
