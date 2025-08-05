import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Shield, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  RefreshCw
} from 'lucide-react';

export interface EffectivenessMetrics {
  overall_score: number;
  credibility_score: number;
  urgency_score: number;
  personalization_score: number;
  technical_score: number;
  social_engineering_score: number;
  recommendations: string[];
  warnings: string[];
  strengths: string[];
}

interface TemplateEffectivenessScorerProps {
  templateContent: {
    subject: string;
    html_content: string;
    text_content?: string;
    category?: string;
  };
  onScoreUpdate?: (metrics: EffectivenessMetrics) => void;
}

const TemplateEffectivenessScorer: React.FC<TemplateEffectivenessScorerProps> = ({
  templateContent,
  onScoreUpdate
}) => {
  const [metrics, setMetrics] = useState<EffectivenessMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTemplate = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = performTemplateAnalysis(templateContent);
      setMetrics(analysis);
      onScoreUpdate?.(analysis);
      setIsAnalyzing(false);
    }, 1500);
  };

  useEffect(() => {
    if (templateContent.subject || templateContent.html_content) {
      analyzeTemplate();
    }
  }, [templateContent]);

  const performTemplateAnalysis = (content: typeof templateContent): EffectivenessMetrics => {
    const { subject, html_content, category } = content;
    
    // Credibility Analysis
    const credibilityFactors = [
      { pattern: /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, weight: 15, name: 'Professional email format' },
      { pattern: /\b(official|legitimate|authorized|verified)\b/i, weight: 10, name: 'Authority keywords' },
      { pattern: /<img.*src.*>/i, weight: 8, name: 'Professional imagery' },
      { pattern: /\b(company|organization|department)\b/i, weight: 5, name: 'Organizational context' },
    ];

    // Urgency Analysis
    const urgencyFactors = [
      { pattern: /\b(urgent|immediate|asap|now|today)\b/i, weight: 20, name: 'Urgency keywords' },
      { pattern: /\b(expire|deadline|limited time|act fast)\b/i, weight: 15, name: 'Time pressure' },
      { pattern: /\b(suspend|terminate|close|block)\b/i, weight: 18, name: 'Consequence threats' },
      { pattern: /\b(verify|confirm|update|action required)\b/i, weight: 12, name: 'Action demands' },
    ];

    // Personalization Analysis
    const personalizationFactors = [
      { pattern: /\{\{[^}]+\}\}/g, weight: 25, name: 'Dynamic variables' },
      { pattern: /\b(first_name|last_name|email|company)\b/i, weight: 20, name: 'Personal data usage' },
      { pattern: /dear \{\{[^}]+\}\}/i, weight: 15, name: 'Personalized greeting' },
    ];

    // Technical Analysis
    const technicalFactors = [
      { pattern: /<[^>]+>/g, weight: 10, name: 'HTML formatting' },
      { pattern: /style\s*=/i, weight: 8, name: 'Inline styling' },
      { pattern: /href\s*=\s*["'].*["']/i, weight: 15, name: 'Link implementation' },
      { pattern: /\{\{phishing_link\}\}/i, weight: 20, name: 'Phishing link integration' },
    ];

    // Social Engineering Analysis
    const socialFactors = [
      { pattern: /\b(security|alert|warning|breach)\b/i, weight: 15, name: 'Security concerns' },
      { pattern: /\b(free|winner|congratulations|selected)\b/i, weight: 12, name: 'Reward appeals' },
      { pattern: /\b(friend|colleague|team|department)\b/i, weight: 10, name: 'Social connections' },
      { pattern: /\b(help|assist|support|problem)\b/i, weight: 8, name: 'Help appeals' },
    ];

    const calculateScore = (factors: any[], text: string) => {
      let score = 0;
      let maxScore = 0;
      
      factors.forEach(factor => {
        maxScore += factor.weight;
        if (factor.pattern.test && factor.pattern.test(text)) {
          score += factor.weight;
        } else if (text.match && text.match(factor.pattern)) {
          const matches = text.match(factor.pattern);
          score += Math.min(matches.length * factor.weight, factor.weight);
        }
      });
      
      return Math.min(Math.round((score / maxScore) * 100), 100);
    };

    const fullContent = `${subject} ${html_content}`;
    
    const credibility_score = calculateScore(credibilityFactors, fullContent);
    const urgency_score = calculateScore(urgencyFactors, fullContent);
    const personalization_score = calculateScore(personalizationFactors, fullContent);
    const technical_score = calculateScore(technicalFactors, html_content);
    const social_engineering_score = calculateScore(socialFactors, fullContent);

    // Calculate overall score
    const overall_score = Math.round(
      (credibility_score * 0.25) +
      (urgency_score * 0.20) +
      (personalization_score * 0.25) +
      (technical_score * 0.15) +
      (social_engineering_score * 0.15)
    );

    // Generate recommendations
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];

    if (personalization_score < 60) {
      recommendations.push("Add more personalization variables like {{first_name}} or {{company_name}}");
    } else {
      strengths.push("Good use of personalization variables");
    }

    if (urgency_score > 80) {
      warnings.push("Very high urgency might trigger spam filters");
    } else if (urgency_score < 40) {
      recommendations.push("Consider adding subtle urgency to increase response rates");
    } else {
      strengths.push("Well-balanced urgency level");
    }

    if (credibility_score < 50) {
      recommendations.push("Improve credibility with professional formatting and authoritative language");
    } else {
      strengths.push("High credibility score enhances trustworthiness");
    }

    if (technical_score < 60) {
      recommendations.push("Enhance HTML formatting and ensure proper link implementation");
    }

    if (!html_content.includes('{{phishing_link}}')) {
      warnings.push("No phishing link variable detected - ensure tracking is properly implemented");
    }

    if (subject.length > 70) {
      warnings.push("Subject line is too long and may be truncated in email clients");
    }

    if (overall_score > 85) {
      strengths.push("Excellent overall template effectiveness");
    }

    return {
      overall_score,
      credibility_score,
      urgency_score,
      personalization_score,
      technical_score,
      social_engineering_score,
      recommendations,
      warnings,
      strengths
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary" />
                <div>
                  <h3 className="text-lg font-medium">Analyzing Template...</h3>
                  <p className="text-muted-foreground">
                    Evaluating effectiveness factors and generating recommendations
                  </p>
                </div>
              </>
            ) : (
              <>
                <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Template Analysis</h3>
                  <p className="text-muted-foreground">
                    Add content to your template to see effectiveness analysis
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Template Effectiveness Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your template's effectiveness factors
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={analyzeTemplate} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Re-analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-3xl font-bold mb-2">
            <span className={getScoreColor(metrics.overall_score)}>
              {metrics.overall_score}%
            </span>
          </div>
          <Badge variant={getScoreVariant(metrics.overall_score)} className="mb-2">
            {metrics.overall_score >= 80 ? 'Excellent' : 
             metrics.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
          </Badge>
          <p className="text-sm text-muted-foreground">Overall Effectiveness Score</p>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Detailed Analysis
          </h4>
          
          {[
            { label: 'Credibility', score: metrics.credibility_score, icon: CheckCircle },
            { label: 'Urgency Level', score: metrics.urgency_score, icon: AlertTriangle },
            { label: 'Personalization', score: metrics.personalization_score, icon: Users },
            { label: 'Technical Quality', score: metrics.technical_score, icon: MessageSquare },
            { label: 'Social Engineering', score: metrics.social_engineering_score, icon: Shield },
          ].map(({ label, score, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          ))}
        </div>

        <Separator />

        {/* Strengths */}
        {metrics.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {metrics.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {metrics.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {metrics.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {metrics.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateEffectivenessScorer;