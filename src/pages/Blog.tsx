
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { format } from 'date-fns';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'The Evolution of Phishing Attacks in 2023',
      excerpt: 'Learn about the latest phishing techniques and how attackers are adapting to security awareness training.',
      author: 'Sarah Johnson',
      date: '2023-11-15',
      category: 'Threat Intelligence',
      image: '/placeholder.svg',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How to Create Effective Phishing Simulations',
      excerpt: 'Best practices for designing phishing campaigns that educate without frustrating employees.',
      author: 'David Chen',
      date: '2023-10-28',
      category: 'Best Practices',
      image: '/placeholder.svg',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'The Psychology Behind Successful Phishing Attacks',
      excerpt: 'Understanding the psychological triggers that make employees click on malicious links.',
      author: 'Emily Williams',
      date: '2023-10-15',
      category: 'Security Awareness',
      image: '/placeholder.svg',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'GDPR Compliance for Phishing Simulations',
      excerpt: 'Navigating data protection regulations when conducting security awareness training.',
      author: 'Michael Rodriguez',
      date: '2023-09-22',
      category: 'Compliance',
      image: '/placeholder.svg',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'From Clicks to Culture: Building a Security-First Organization',
      excerpt: 'How to use phishing simulation results to drive lasting behavioral change.',
      author: 'Sarah Johnson',
      date: '2023-09-10',
      category: 'Security Culture',
      image: '/placeholder.svg',
      readTime: '10 min read'
    },
    {
      id: 6,
      title: 'The Rise of AI-Powered Phishing Attacks',
      excerpt: 'How attackers are leveraging artificial intelligence to create more convincing phishing campaigns.',
      author: 'David Chen',
      date: '2023-08-05',
      category: 'Threat Intelligence',
      image: '/placeholder.svg',
      readTime: '9 min read'
    }
  ];

  const categories = ['All', 'Threat Intelligence', 'Best Practices', 'Security Awareness', 'Compliance', 'Security Culture'];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  The Security Blog
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Insights, best practices, and news about phishing, security awareness, and social engineering
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-9">
                <Tabs defaultValue="All">
                  <div className="flex justify-between items-center mb-8">
                    <TabsList>
                      {categories.map((category) => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                  
                  {categories.map((category) => (
                    <TabsContent key={category} value={category}>
                      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                        {blogPosts
                          .filter(post => category === 'All' || post.category === category)
                          .map((post) => (
                            <Card key={post.id} className="overflow-hidden">
                              <div className="relative aspect-video">
                                <img 
                                  src={post.image} 
                                  alt={post.title}
                                  className="object-cover w-full h-full" 
                                />
                              </div>
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {post.category}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {post.readTime}
                                  </span>
                                </div>
                                <CardTitle className="text-lg">{post.title}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <CardDescription>
                                  {post.excerpt}
                                </CardDescription>
                              </CardContent>
                              <CardFooter className="p-4 flex justify-between items-center">
                                <div className="text-sm">
                                  <span className="font-semibold">{post.author}</span> • {format(new Date(post.date), 'MMM d, yyyy')}
                                </div>
                                <Button variant="ghost" size="sm">Read More</Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="mt-12 flex justify-center">
                  <Button variant="outline">Load More Articles</Button>
                </div>
              </div>
              
              <div className="md:col-span-3 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscribe to Our Newsletter</CardTitle>
                    <CardDescription>
                      Get the latest security insights delivered to your inbox
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" />
                      </div>
                      <Button className="w-full">Subscribe</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {['Phishing', 'Security', 'Awareness', 'Training', 'Compliance', 'GDPR', 'Social Engineering', 'Ransomware', 'Best Practices'].map((tag) => (
                        <Button key={tag} variant="outline" size="sm" className="text-xs">
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Most Popular</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {blogPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <h3 className="font-medium hover:text-primary cursor-pointer mb-1">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(post.date), 'MMM d, yyyy')} • {post.readTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
