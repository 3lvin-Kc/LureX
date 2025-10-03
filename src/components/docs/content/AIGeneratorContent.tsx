import React from "react";
import { Bot, Sparkles, MessageSquare, Target, Mail, Shield, Lightbulb, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export const AIGeneratorContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">AI Template Generator</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Leverage advanced AI technology to generate professional phishing awareness templates instantly.
          Create realistic, targeted scenarios using Google's Gemini AI for maximum training effectiveness.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            How AI Template Generation Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">1. Choose Category</h4>
              <p className="text-sm text-muted-foreground">
                Select from predefined categories like Banking, Corporate, or create custom scenarios
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">2. Add Custom Prompt</h4>
              <p className="text-sm text-muted-foreground">
                Provide specific details, context, or requirements for your template
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">3. AI Generation</h4>
              <p className="text-sm text-muted-foreground">
                Google's Gemini AI creates professional, realistic phishing templates
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template Categories & Sample Prompts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Banking & Finance
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "Bank account security alert"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "Create a banking template about suspicious login attempts from a foreign country, requesting immediate verification"
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  Corporate Communications
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "IT security update"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "HR policy change notification requiring immediate acknowledgment and document review"
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Technology & Cloud Services
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "Cloud storage limit exceeded"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "Microsoft 365 license renewal notice with urgent payment requirements"
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  Government & Official
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "Tax document verification"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "Government agency requesting immediate documentation for compliance audit"
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  E-commerce & Retail
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "Order confirmation"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "Package delivery exception requiring payment of customs fees"
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Custom Scenarios
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Basic Prompt:</strong> "Remote work authorization"
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <strong>Advanced Prompt:</strong> "CEO requesting urgent wire transfer for business acquisition"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Writing Effective Prompts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Be specific about the scenario and target audience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Include technical details for authenticity</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Specify urgency level and call-to-action</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Mention company/role context when relevant</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-lg">Example Prompt Structure</h3>
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-mono text-xs">
                  "Create a [category] phishing template about [specific scenario] targeting [audience]. Include [technical details] and create [urgency level] requiring [action]. Make it look like it's from [sender] and focus on [key element]."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Safety & Content Guidelines
          </h2>

          <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200 rounded-lg">
            <h3 className="font-medium mb-2 text-amber-800 dark:text-amber-200">AI Safety Measures</h3>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
              <li>• Templates are designed exclusively for cybersecurity awareness training</li>
              <li>• All content includes educational disclaimers and training indicators</li>
              <li>• Harmful, illegal, or malicious content is automatically blocked</li>
              <li>• Generated templates focus on realistic scenarios for learning purposes only</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generated Template Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Professional Design</h3>
              <p className="text-sm text-muted-foreground">HTML emails with proper styling, responsive design, and professional appearance</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Realistic Content</h3>
              <p className="text-sm text-muted-foreground">Authentic scenarios based on real-world phishing techniques and social engineering</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Training Focused</h3>
              <p className="text-sm text-muted-foreground">Educational content that teaches security awareness without promoting harm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
