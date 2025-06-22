
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateTemplateRequest {
  category: string;
  prompt?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, prompt }: GenerateTemplateRequest = await req.json();

    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Category is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const defaultPrompt = `Generate a professional phishing email template for cybersecurity awareness training. Category: ${category}. 

Please respond with a JSON object containing:
- name: A descriptive name for the template
- subject: An engaging email subject line  
- html_content: Professional HTML email content with inline CSS styling
- description: Brief description of the template's purpose

The content should be realistic but clearly for educational/training purposes. Focus on ${category.toLowerCase()} scenarios. Make the HTML content professional and email-client compatible.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt || defaultPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          error: `Gemini API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API Response received successfully');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: 'No content generated from Gemini API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JSON from the response
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonMatch = [codeBlockMatch[1]];
      }
    }
    
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract JSON from Gemini response',
          rawResponse: generatedText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let templateData;
    try {
      templateData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse JSON from Gemini response',
          rawJson: jsonMatch[0]
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate the response structure
    if (!templateData.name || !templateData.subject || !templateData.html_content) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid template data structure from Gemini API',
          receivedData: templateData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        template: {
          name: templateData.name,
          subject: templateData.subject,
          html_content: templateData.html_content,
          description: templateData.description || "AI generated phishing awareness template"
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Template generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error during template generation'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
