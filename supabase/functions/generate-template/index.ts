
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Enum types matching client-side enums
enum TemplateType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  VOICE_SCRIPT = 'voice_script'
}

enum IndustryType {
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  TECHNOLOGY = 'technology',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  GOVERNMENT = 'government',
  EDUCATION = 'education',
  GENERIC = 'generic'
}

enum SophisticationLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  TARGETED = 'targeted'
}

interface TemplateGenerationOptions {
  type: TemplateType;
  industry: IndustryType;
  sophisticationLevel: SophisticationLevel;
  includeLogos?: boolean;
  includeUrgency?: boolean;
  includeSocialEngineering?: boolean;
  targetDemographic?: string;
  brandImpersonation?: string;
  contextualEvent?: string;
  targetedPosition?: string;
  language?: string;
  customPrompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    
    const { options } = await req.json() as { options: TemplateGenerationOptions };
    
    if (!options || !options.type || !options.industry || !options.sophisticationLevel) {
      throw new Error("Missing required template generation options");
    }
    
    // Create prompt based on options
    const prompt = createPromptForTemplate(options);
    
    // Call OpenAI API
    const templateContent = await generateWithAI(prompt, options);
    
    // Create response
    const template = {
      id: crypto.randomUUID(),
      type: options.type,
      subject: templateContent.subject,
      htmlContent: templateContent.htmlContent,
      textContent: templateContent.textContent,
      metadata: {
        industry: options.industry,
        sophisticationLevel: options.sophisticationLevel,
        generationOptions: options,
        aiModel: "gpt-4o",
        generatedAt: new Date().toISOString(),
        indicators: await analyzePhishingIndicators(templateContent.textContent)
      }
    };
    
    // Return the generated template
    return new Response(
      JSON.stringify(template),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-template function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Create an appropriate prompt based on options
function createPromptForTemplate(options: TemplateGenerationOptions): string {
  const {
    type,
    industry,
    sophisticationLevel,
    includeLogos,
    includeUrgency,
    includeSocialEngineering,
    targetDemographic,
    brandImpersonation,
    contextualEvent,
    targetedPosition,
    language,
    customPrompt
  } = options;
  
  let basePrompt = `Create a realistic ${sophisticationLevel} level phishing ${type} template for the ${industry} industry`;
  
  if (brandImpersonation) {
    basePrompt += ` impersonating ${brandImpersonation}`;
  }
  
  if (targetedPosition) {
    basePrompt += ` targeting ${targetedPosition}`;
  }
  
  if (contextualEvent) {
    basePrompt += ` in the context of ${contextualEvent}`;
  }
  
  // Add specific features based on options
  const features = [];
  if (includeUrgency) features.push("create a sense of urgency");
  if (includeSocialEngineering) features.push("use social engineering techniques");
  
  if (features.length > 0) {
    basePrompt += `. Please ${features.join(" and ")}.`;
  }
  
  // Add template specific instructions
  if (type === TemplateType.EMAIL) {
    basePrompt += `\n\nProvide the result in JSON format with the following keys:
    - subject: The email subject line
    - htmlContent: The HTML version of the email with phishing elements
    - textContent: The plain text version of the email`;
    
    if (includeLogos) {
      basePrompt += `\n\nInclude placeholders for logos and branding elements in the HTML.`;
    }
  } else if (type === TemplateType.SMS) {
    basePrompt += `\n\nProvide a concise SMS message with a suspicious shortened URL and compelling call to action. Return as plain text.`;
  } else if (type === TemplateType.SOCIAL_MEDIA) {
    basePrompt += `\n\nCreate a social media post or direct message with a compelling hook and suspicious link. Include hashtags if appropriate.`;
  } else if (type === TemplateType.VOICE_SCRIPT) {
    basePrompt += `\n\nWrite a script for a voice phishing (vishing) call, including opening, social engineering elements, and closing. Include notes on tone and delivery.`;
  }
  
  // Add specific language requirements
  if (language && language !== "en") {
    basePrompt += `\n\nPlease write this in ${language} language.`;
  }
  
  // Add any custom instructions
  if (customPrompt) {
    basePrompt += `\n\nAdditional instructions: ${customPrompt}`;
  }
  
  return basePrompt;
}

// Generate content using OpenAI
async function generateWithAI(
  prompt: string,
  options: TemplateGenerationOptions
): Promise<{
  subject?: string;
  htmlContent?: string;
  textContent: string;
}> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in cybersecurity and social engineering, helping create realistic phishing templates for security awareness training and testing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }
    
    const content = data.choices[0].message.content;
    
    // Parse the content based on template type
    if (options.type === TemplateType.EMAIL) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return {
            subject: jsonContent.subject,
            htmlContent: jsonContent.htmlContent,
            textContent: jsonContent.textContent
          };
        }
      } catch (e) {
        console.error("Error parsing JSON from AI response:", e);
      }
      
      // Fallback if JSON parsing fails
      return {
        subject: "Important Notification",
        htmlContent: `<div>${content}</div>`,
        textContent: content
      };
    } else {
      // For non-email templates, just return the text
      return {
        textContent: content
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate template with AI");
  }
}

// Analyze phishing indicators in the generated content
async function analyzePhishingIndicators(content: string): Promise<string[]> {
  const indicators = [];
  
  // Check for urgency language
  if (/urgent|immediate|quickly|limited time|expires|deadline|today only/i.test(content)) {
    indicators.push("Urgency tactics");
  }
  
  // Check for threatening language
  if (/account.*?(suspend|terminate|close|lock)|security breach|unauthorized|fraud|suspicious/i.test(content)) {
    indicators.push("Fear and threats");
  }
  
  // Check for too-good-to-be-true offers
  if (/free|bonus|exclusive offer|congratulations|you('ve| have) won|prize|reward/i.test(content)) {
    indicators.push("Unrealistic offers");
  }
  
  // Check for suspicious links
  if (/click|link|log\s?in|sign\s?in|verify|confirm|update/i.test(content)) {
    indicators.push("Suspicious call to action");
  }
  
  // Check for personal information requests
  if (/password|username|login|ssn|social security|credit card|payment|bank/i.test(content)) {
    indicators.push("Personal information request");
  }
  
  // Check for spoofing/impersonation language
  if (/official|support team|customer service|helpdesk|tech support|IT department/i.test(content)) {
    indicators.push("Authority impersonation");
  }
  
  return indicators;
}
