
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Phishing indicators to check for
const PHISHING_INDICATORS = [
  {
    name: "Urgency tactics",
    patterns: [
      /urgent/i, /immediate/i, /quickly/i, /limited time/i, 
      /expires/i, /deadline/i, /today only/i, /act now/i
    ],
    severity: "medium"
  },
  {
    name: "Fear and threats",
    patterns: [
      /account.*?(suspend|terminate|close|lock)/i, 
      /security breach/i, /unauthorized/i, /fraud/i, 
      /suspicious/i, /warning/i, /alert/i
    ],
    severity: "high"
  },
  {
    name: "Unrealistic offers",
    patterns: [
      /free/i, /bonus/i, /exclusive offer/i, /congratulations/i,
      /you('ve| have) won/i, /prize/i, /reward/i, /discount/i
    ],
    severity: "medium"
  },
  {
    name: "Suspicious call to action",
    patterns: [
      /click/i, /link/i, /log\s?in/i, /sign\s?in/i, 
      /verify/i, /confirm/i, /update/i, /download/i
    ],
    severity: "medium"
  },
  {
    name: "Personal information request",
    patterns: [
      /password/i, /username/i, /login/i, /ssn/i, 
      /social security/i, /credit card/i, /payment/i, /bank/i
    ],
    severity: "high"
  },
  {
    name: "Authority impersonation",
    patterns: [
      /official/i, /support team/i, /customer service/i, 
      /helpdesk/i, /tech support/i, /IT department/i
    ],
    severity: "high"
  },
  {
    name: "Suspicious sender",
    patterns: [
      /noreply@/i, /do-not-reply@/i, /notification@/i, /alert@/i, /security@/i
    ],
    severity: "low"
  },
  {
    name: "Suspicious URL",
    patterns: [
      /bit\.ly/i, /tinyurl/i, /goo\.gl/i, /ow\.ly/i, /is\.gd/i, /t\.co/i,
      /shorturl/i, /click\.me/i, /secure-site/i, /account-verify/i
    ],
    severity: "high"
  },
  {
    name: "Grammatical errors",
    patterns: [
      /kindly/i, /please\s+(?:to|do|\w+ing)/i, /your\s+account\s+(?:have|has been)/i,
      /we\s+(?:has|have)\s+noticed/i, /we\s+are\s+(?:notify|notifying)/i
    ],
    severity: "medium"
  },
  {
    name: "Attachment lures",
    patterns: [
      /attach(?:ment|ed)/i, /document/i, /pdf/i, /invoice/i, 
      /receipt/i, /statement/i, /report/i
    ],
    severity: "medium"
  }
];

// Phishing technique classifications
enum PhishingTechnique {
  SPOOFING = "spoofing",
  PRETEXTING = "pretexting",
  BAITING = "baiting",
  QUID_PRO_QUO = "quid_pro_quo",
  TAILGATING = "tailgating",
  PHARMING = "pharming",
  VISHING = "vishing",
  SMISHING = "smishing",
  WATER_HOLING = "water_holing",
  BUSINESS_EMAIL_COMPROMISE = "business_email_compromise"
}

// Phishing target classifications
enum PhishingTarget {
  CREDENTIALS = "credentials",
  FINANCIAL_INFO = "financial_info",
  PERSONAL_INFO = "personal_info",
  CORPORATE_DATA = "corporate_data",
  MALWARE_INSTALLATION = "malware_installation",
  WIRE_TRANSFER = "wire_transfer"
}

interface AnalysisResult {
  indicators: string[];
  techniques: PhishingTechnique[];
  targets: PhishingTarget[];
  suspiciousUrls: string[];
  overallRisk: "low" | "medium" | "high" | "critical";
  readabilityScore: number;
  emotionalTriggers: string[];
  analysisTimestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { content } = await req.json();
    
    if (!content || typeof content !== "string") {
      throw new Error("Missing or invalid content for analysis");
    }
    
    // Perform the phishing analysis
    const result = analyzePhishingContent(content);
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-phishing function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Analyze content for phishing indicators
function analyzePhishingContent(content: string): AnalysisResult {
  const detectedIndicators: string[] = [];
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;
  let lowSeverityCount = 0;
  
  // Check for each indicator
  for (const indicator of PHISHING_INDICATORS) {
    for (const pattern of indicator.patterns) {
      if (pattern.test(content)) {
        detectedIndicators.push(indicator.name);
        
        if (indicator.severity === "high") highSeverityCount++;
        else if (indicator.severity === "medium") mediumSeverityCount++;
        else lowSeverityCount++;
        
        break; // Only count each indicator once
      }
    }
  }
  
  // Extract and check URLs in the content
  const urlRegex = /(https?:\/\/[^\s]+)|(\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b)/gi;
  const urlMatches = content.match(urlRegex) || [];
  const suspiciousUrls: string[] = [];
  
  for (const url of urlMatches) {
    // Check for suspicious URL characteristics
    if (
      /bit\.ly|tinyurl|goo\.gl|t\.co|is\.gd|ow\.ly|tiny\.cc/i.test(url) || // URL shorteners
      /\.(tk|ml|ga|cf|gq|pw)(\b|\/|$)/i.test(url) || // Free domains often used in phishing
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(url) || // IP addresses instead of domains
      /secure|login|account|verify|update|confirm|support/i.test(url) // Suspicious keywords in URL
    ) {
      suspiciousUrls.push(url);
      highSeverityCount++;
    }
  }
  
  // Identify phishing techniques
  const techniques: PhishingTechnique[] = [];
  if (content.match(/official|support|team|customer service|helpdesk/i)) {
    techniques.push(PhishingTechnique.SPOOFING);
  }
  if (content.match(/account|security|verify|confirm|update/i)) {
    techniques.push(PhishingTechnique.PRETEXTING);
  }
  if (content.match(/free|download|prize|reward|gift|bonus/i)) {
    techniques.push(PhishingTechnique.BAITING);
  }
  if (content.match(/help|assist|support|exchange/i)) {
    techniques.push(PhishingTechnique.QUID_PRO_QUO);
  }
  if (content.match(/sms|text|message/i)) {
    techniques.push(PhishingTechnique.SMISHING);
  }
  if (content.match(/call|phone|voice|speak/i)) {
    techniques.push(PhishingTechnique.VISHING);
  }
  if (content.match(/ceo|executive|urgent request|wire|transfer/i)) {
    techniques.push(PhishingTechnique.BUSINESS_EMAIL_COMPROMISE);
  }
  
  // Identify likely targets
  const targets: PhishingTarget[] = [];
  if (content.match(/username|password|login|sign in|account/i)) {
    targets.push(PhishingTarget.CREDENTIALS);
  }
  if (content.match(/credit card|payment|bank|financial|fund|money/i)) {
    targets.push(PhishingTarget.FINANCIAL_INFO);
  }
  if (content.match(/ssn|social security|address|phone|date of birth/i)) {
    targets.push(PhishingTarget.PERSONAL_INFO);
  }
  if (content.match(/document|file|data|corporate|company|business/i)) {
    targets.push(PhishingTarget.CORPORATE_DATA);
  }
  if (content.match(/download|install|update|attachment|open/i)) {
    targets.push(PhishingTarget.MALWARE_INSTALLATION);
  }
  if (content.match(/transfer|wire|payment|invoice|urgent/i)) {
    targets.push(PhishingTarget.WIRE_TRANSFER);
  }
  
  // Calculate overall risk level
  let overallRisk: "low" | "medium" | "high" | "critical";
  if (highSeverityCount >= 3 || (highSeverityCount >= 2 && mediumSeverityCount >= 2)) {
    overallRisk = "critical";
  } else if (highSeverityCount >= 1 || mediumSeverityCount >= 3) {
    overallRisk = "high";
  } else if (mediumSeverityCount >= 1 || lowSeverityCount >= 3) {
    overallRisk = "medium";
  } else {
    overallRisk = "low";
  }
  
  // Calculate basic readability score (approximation of Flesch-Kincaid)
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(sentence => sentence.length > 0);
  const averageWordsPerSentence = words.length / Math.max(1, sentences.length);
  const syllables = countSyllables(content);
  const averageSyllablesPerWord = syllables / Math.max(1, words.length);
  
  // Simplified Flesch-Kincaid Grade Level formula
  const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)));
  
  // Identify emotional triggers
  const emotionalTriggers: string[] = [];
  if (/urgent|immediate|quickly|limited time|expires|deadline/i.test(content)) {
    emotionalTriggers.push("Urgency");
  }
  if (/fear|afraid|warning|risk|danger|threat|secure/i.test(content)) {
    emotionalTriggers.push("Fear");
  }
  if (/excite|happy|congratulation|celebrate|win|exclusive/i.test(content)) {
    emotionalTriggers.push("Excitement");
  }
  if (/help|support|assist|aid|service/i.test(content)) {
    emotionalTriggers.push("Helpfulness");
  }
  if (/curiosity|discover|reveal|secret|learn|find out/i.test(content)) {
    emotionalTriggers.push("Curiosity");
  }
  if (/trust|reliable|official|authorized|verified|legitimate/i.test(content)) {
    emotionalTriggers.push("Trust");
  }
  if (/sorry|apology|apologize|regret|unfortunate/i.test(content)) {
    emotionalTriggers.push("Guilt");
  }
  
  return {
    indicators: [...new Set(detectedIndicators)], // Remove duplicates
    techniques: [...new Set(techniques)],
    targets: [...new Set(targets)],
    suspiciousUrls,
    overallRisk,
    readabilityScore: Math.round(readabilityScore),
    emotionalTriggers: [...new Set(emotionalTriggers)],
    analysisTimestamp: new Date().toISOString()
  };
}

// Simple syllable counter for English text
function countSyllables(text: string): number {
  // Remove non-alphabetic characters and convert to lowercase
  const words = text.toLowerCase().replace(/[^a-z ]/g, "").split(" ");
  let count = 0;
  
  for (const word of words) {
    if (word.length <= 3) {
      count += 1;
      continue;
    }
    
    // Count vowel groups as syllables
    count += word.replace(/[^aeiouy]+/g, " ").trim().split(" ").length;
    
    // Adjust for common patterns
    if (word.endsWith("e")) count -= 1; // Silent e
    if (word.endsWith("le") && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) count += 1; // Handle words ending in "le"
    if (word.endsWith("es") || word.endsWith("ed")) count -= 1; // Handle common endings
    
    // Ensure at least one syllable per word
    count = Math.max(1, count);
  }
  
  return count;
}
