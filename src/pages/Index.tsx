
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Users, BarChart3, Mail, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Templates",
      description: "Create realistic phishing emails with AI-powered content generation"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Target Management",
      description: "Organize and manage your test recipients with advanced targeting"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Phishing Pages",
      description: "Build convincing fake login pages or clone existing websites"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics & Reports",
      description: "Track campaign performance with detailed analytics and reporting"
    }
  ];

  const benefits = [
    "Reduce successful phishing attacks by up to 90%",
    "Improve security awareness across your organization",
    "Generate compliance reports for regulatory requirements",
    "Identify vulnerable users and departments",
    "Track improvement over time with detailed analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">PhishGuard</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => navigate("/features")}>
                Features
              </Button>
              <Button variant="ghost" onClick={() => navigate("/help")}>
                Help
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-white/50">
            🚀 Advanced Phishing Simulation Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Strengthen Your Organization's
            <span className="text-blue-600 block">Security Posture</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Train your employees to recognize and respond to phishing attacks with realistic simulations, 
            comprehensive reporting, and AI-powered content generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="text-lg px-8">
              View Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Effective Phishing Simulations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools necessary to create, deploy, and analyze phishing simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Measurable Security Improvements
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Organizations using PhishGuard see significant improvements in their security posture 
                and employee awareness within the first month of deployment.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">90%</div>
                <div className="text-gray-600 mb-6">Reduction in successful phishing attacks</div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">15K+</div>
                    <div className="text-sm text-gray-600">Employees Trained</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Organizations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Strengthen Your Security?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of organizations that trust PhishGuard to improve their security awareness and reduce phishing risks.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")} className="text-lg px-8">
            Start Your Free Trial Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
