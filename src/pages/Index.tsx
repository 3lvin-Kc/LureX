import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, BarChart3, Mail, Target, CheckCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
      icon: <Target className="h-6 w-6" />,
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-card/50">
            🛡️ Enterprise-Grade Security Awareness Training
          </Badge>
          <h1
            className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight tracking-tight drop-shadow-md transition-transform duration-300 hover:scale-[1.02]"
            style={{
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            LureX
            <span className="text-primary block drop-shadow-sm transition-transform duration-300 hover:-translate-y-1">
              Train Smarter. Defend Stronger.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Real-world phishing simulations that transform your team into your strongest line of defense. Purpose-built for growing businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/features")} className="text-lg px-8">
              View Features
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
