
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { url, name, category } = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Attempting to clone website: ${url}`)

    // Try to fetch the target website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch website: ${response.statusText}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get the HTML content
    const htmlContent = await response.text()

    // Extract CSS and JS (simplified approach)
    // For a production app, you'd want to parse the HTML and extract all stylesheets and scripts
    let cssContent = ''
    let jsContent = ''

    // Basic regex to find inline styles
    const styleMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)
    if (styleMatches) {
      cssContent = styleMatches.map(match => {
        const content = match.replace(/<style[^>]*>|<\/style>/gi, '')
        return content
      }).join('\n')
    }

    // Basic regex to find inline scripts
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
    if (scriptMatches) {
      jsContent = scriptMatches.map(match => {
        const content = match.replace(/<script[^>]*>|<\/script>/gi, '')
        if (!content.includes('</') && !content.includes('function(') && content.trim().length > 0) {
          return content
        }
        return ''
      }).join('\n')
    }

    // Save to database
    const pageName = name || new URL(url).hostname
    const { data, error } = await supabaseClient
      .from('phishing_pages')
      .insert([
        {
          name: pageName,
          category: category || 'Cloned',
          source_url: url,
          html_content: htmlContent,
          css_content: cssContent,
          js_content: jsContent,
          is_custom: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error saving page:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
