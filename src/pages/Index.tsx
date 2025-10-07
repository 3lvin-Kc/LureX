import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, BarChart3, Mail, Target, CheckCircle, Shield, Lock, TrendingUp, Zap, FileText, Clock, Globe, ChevronRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import GlassPanel from "@/components/ui/GlassPanel";
import AnimatedCard from "@/components/ui/AnimatedCard";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">LureX</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate("/features")}>
                Features
              </Button>
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </Button>
                      <ProfileDropdown />
                    </div>
                  ) : (
                    <Button onClick={() => navigate("/auth")}>
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-card/50">
            🛡️ Trusted by 500+ Growing Businesses
          </Badge>
          <h1
            className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight tracking-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Stop Phishing Attacks
            <span className="text-primary block mt-2">Before They Cost You</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Turn your employees into your strongest defense. Real-world phishing simulations that train, test, and protect your business in minutes—not months.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="text-lg px-8">
              See How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground mb-16">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Setup in 5 Minutes</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-6xl mx-auto">
            <GlassPanel className="p-3 rounded-2xl shadow-2xl">
              <img 
                src="/lovable-uploads/593ea609-4f84-4649-804c-d9f554b77a57.png" 
                alt="LureX Dashboard - Phishing Simulation Platform" 
                className="w-full h-auto rounded-xl"
              />
            </GlassPanel>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">90%</div>
              <div className="text-muted-foreground">Reduction in Successful Attacks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5 Min</div>
              <div className="text-muted-foreground">Average Setup Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Businesses Protected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Real-Time Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">The Challenge</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                One Click Can Cost Your Business <span className="text-destructive">Everything</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                93% of data breaches start with phishing. Your team receives dozens of suspicious emails daily, but traditional training falls short.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong className="text-foreground">$4.9M</strong> average cost of a data breach
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong className="text-foreground">76 days</strong> average time to identify a breach
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 mr-3"></div>
                  <div>
                    <strong className="text-foreground">Compliance penalties</strong> that can shut down operations
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Card className="p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="h-5 w-5 text-destructive mr-2" />
                      <strong>Urgent: Invoice Payment Required</strong>
                    </div>
                    <p className="text-sm text-muted-foreground">Your account will be suspended...</p>
                  </div>
                  <div className="text-center py-4">
                    <ArrowRight className="h-8 w-8 text-destructive mx-auto animate-pulse" />
                  </div>
                  <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-lg">
                    <p className="text-sm font-semibold text-destructive mb-2">⚠️ Credentials Stolen</p>
                    <p className="text-xs text-muted-foreground">Company data compromised. Financial loss imminent.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">The Solution</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Team Into a <span className="text-primary">Human Firewall</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LureX delivers realistic phishing simulations that teach your team to spot threats before they click—with zero IT headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <AnimatedCard>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Launch in Minutes</CardTitle>
                <CardDescription>
                  Pre-built templates mean your first campaign goes live in 5 minutes. No technical setup required.
                </CardDescription>
              </CardHeader>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-World Scenarios</CardTitle>
                <CardDescription>
                  Simulate actual phishing attacks your team faces daily—from fake invoices to CEO fraud.
                </CardDescription>
              </CardHeader>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Insights</CardTitle>
                <CardDescription>
                  Know who clicked, who reported, and who needs more training—all in real-time dashboards.
                </CardDescription>
              </CardHeader>
            </AnimatedCard>
          </div>

          {/* Screenshot showcase */}
          <GlassPanel className="p-6 rounded-2xl max-w-5xl mx-auto">
            <img 
              src="/lovable-uploads/f5d91462-4a22-42de-9ee6-1406b1391d82.png" 
              alt="Real-time analytics dashboard" 
              className="w-full h-auto rounded-lg"
            />
            <p className="text-center text-sm text-muted-foreground mt-4">
              Track every interaction in real-time with comprehensive analytics
            </p>
          </GlassPanel>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Security Training That Actually Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three steps to a more secure organization
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <Card className="pt-8 h-full">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Choose Your Campaign</CardTitle>
                  <CardDescription>
                    Select from 300+ pre-built templates or create custom scenarios that match your industry's real threats.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <Card className="pt-8 h-full">
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Send to Your Team</CardTitle>
                  <CardDescription>
                    Schedule simulated phishing emails to your employees. They won't know it's a test until they interact.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <Card className="pt-8 h-full">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>Track & Improve</CardTitle>
                  <CardDescription>
                    Get instant feedback on who's vulnerable. Provide targeted training to those who need it most.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Platform Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Stay Secure
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Mail, title: "Email Simulations", desc: "Realistic phishing emails that test your team's awareness" },
              { icon: Target, title: "Landing Pages", desc: "Custom phishing pages that capture credentials safely" },
              { icon: FileText, title: "File-Based Attacks", desc: "Simulate malicious attachments and downloads" },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards showing every interaction" },
              { icon: Users, title: "Team Management", desc: "Organize by department, role, or custom groups" },
              { icon: Lock, title: "Compliance Reports", desc: "Generate audit-ready reports for regulators" },
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">Why LureX?</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Built for SMBs. Trusted by Enterprises.
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                You don't need a cybersecurity degree or a massive budget. LureX gives you enterprise-level protection with SMB simplicity.
              </p>
              <div className="space-y-6">
                {[
                  { title: "No IT Team Needed", desc: "Intuitive interface anyone can use" },
                  { title: "Affordable Pricing", desc: "Pay only for active users, not your entire company" },
                  { title: "Quick Results", desc: "See measurable improvement in 30 days" },
                  { title: "Compliance Ready", desc: "Meet GDPR, HIPAA, and industry standards" },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-foreground block">{benefit.title}</strong>
                      <span className="text-muted-foreground">{benefit.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <GlassPanel className="p-6 rounded-2xl">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 text-center">
                  <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Your Security Partner</h3>
                  <p className="text-muted-foreground mb-6">
                    Join hundreds of businesses protecting their teams with LureX
                  </p>
                  <Button size="lg" onClick={() => navigate("/dashboard")} className="w-full">
                    Start Your Free Trial
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Growing Businesses Worldwide
            </h2>
            <p className="text-muted-foreground">See how companies like yours stay secure</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { company: "TechStart Inc", industry: "SaaS", quote: "Reduced phishing clicks by 85% in just 3 months" },
              { company: "MedCare Solutions", industry: "Healthcare", quote: "HIPAA compliance made simple and measurable" },
              { company: "RetailHub", industry: "E-commerce", quote: "Our team is now our strongest security asset" },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                <div>
                  <strong className="text-foreground">{testimonial.company}</strong>
                  <p className="text-sm text-muted-foreground">{testimonial.industry}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Stop Phishing Attacks?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Start your free trial today. No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-10">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="text-lg px-10">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            ✓ 14-day free trial  ✓ No credit card  ✓ Full access to all features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">LureX</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade security awareness training for growing businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/features")} className="hover:text-primary">Features</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="hover:text-primary">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-primary">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 LureX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
