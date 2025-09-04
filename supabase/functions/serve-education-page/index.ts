import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Education token required', { status: 400 });
    }

    // Verify session exists
    const { data: session, error } = await supabase
      .from('phishing_education_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error || !session) {
      return new Response('Invalid education session', { status: 404 });
    }

    const educationPageHTML = buildEducationPage(token, session);

    return new Response(educationPageHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Education page serving error:', error);
    return new Response('Education page not available', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        ...corsHeaders
      }
    });
  }
});

function buildEducationPage(token: string, session: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Awareness Training - You've Been Phished!</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .alert-banner {
          background: #ff4757;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        
        .content-card {
          background: white;
          border-radius: 0 0 8px 8px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .revelation {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .revelation h1 {
          color: #ff4757;
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .revelation p {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .success-badge {
          display: inline-block;
          background: #2ed573;
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        
        .learning-section {
          margin: 30px 0;
        }
        
        .learning-section h2 {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
          border-left: 4px solid #667eea;
          padding-left: 15px;
        }
        
        .red-flags {
          background: #fff5f5;
          border-left: 4px solid #ff4757;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .red-flags h3 {
          color: #ff4757;
          margin-bottom: 15px;
        }
        
        .red-flags ul {
          list-style: none;
        }
        
        .red-flags li {
          margin: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        
        .red-flags li:before {
          content: "⚠️";
          position: absolute;
          left: 0;
        }
        
        .tips {
          background: #f0fff4;
          border-left: 4px solid #2ed573;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .tips h3 {
          color: #2ed573;
          margin-bottom: 15px;
        }
        
        .tips ul li {
          margin: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        
        .tips li:before {
          content: "✅";
          position: absolute;
          left: 0;
        }
        
        .interactive-quiz {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
          border: 1px solid #e9ecef;
        }
        
        .quiz-question {
          margin: 20px 0;
        }
        
        .quiz-options {
          margin: 15px 0;
        }
        
        .quiz-option {
          display: block;
          margin: 10px 0;
          padding: 10px 15px;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .quiz-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }
        
        .quiz-option.selected {
          border-color: #667eea;
          background: #f8f9ff;
        }
        
        .quiz-option.correct {
          border-color: #2ed573;
          background: #f0fff4;
        }
        
        .quiz-option.incorrect {
          border-color: #ff4757;
          background: #fff5f5;
        }
        
        .btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
          margin: 10px 5px;
        }
        
        .btn:hover {
          background: #5a6fd8;
        }
        
        .btn.success {
          background: #2ed573;
        }
        
        .btn.success:hover {
          background: #26d467;
        }
        
        .achievement {
          text-align: center;
          padding: 20px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .achievement h3 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .score-display {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          margin: 20px 0;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(45deg, #2ed573, #26d467);
          width: 0%;
          transition: width 1s ease;
        }
        
        .hidden {
          display: none;
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert-banner">
          🚨 PHISHING DETECTED 🚨
        </div>
        
        <div class="content-card">
          <div class="revelation">
            <h1>You've Been Phished!</h1>
            <p>Don't worry - this was a <strong>simulated</strong> phishing attack designed to help you learn.</p>
            <div class="success-badge">
              ✅ No real harm done - Let's learn together!
            </div>
          </div>
          
          <div id="learning-content">
            <div class="learning-section">
              <h2>🎯 What Just Happened?</h2>
              <p>You clicked on a simulated phishing email and entered information on a fake website. In a real attack, this could have compromised your security. Let's learn how to spot these threats!</p>
            </div>
            
            <div class="red-flags">
              <h3>🚩 Red Flags You May Have Missed</h3>
              <ul>
                <li>Generic greeting (no personal name)</li>
                <li>Urgent or threatening language</li>
                <li>Suspicious sender domain</li>
                <li>Request for sensitive information</li>
                <li>Poor grammar or formatting</li>
              </ul>
            </div>
            
            <div class="tips">
              <h3>🛡️ How to Stay Safe</h3>
              <ul>
                <li>Always verify sender identity before clicking links</li>
                <li>Check for HTTPS and legitimate domain names</li>
                <li>Be suspicious of urgent requests</li>
                <li>When in doubt, contact the organization directly</li>
                <li>Use two-factor authentication when possible</li>
              </ul>
            </div>
            
            <div class="interactive-quiz">
              <h2>🧠 Test Your Knowledge</h2>
              <div class="quiz-question">
                <h3>What's the first thing you should check in a suspicious email?</h3>
                <div class="quiz-options">
                  <label class="quiz-option" data-answer="0">
                    <input type="radio" name="q1" value="0" style="margin-right: 10px;">
                    The sender's email address and domain
                  </label>
                  <label class="quiz-option" data-answer="1">
                    <input type="radio" name="q1" value="1" style="margin-right: 10px;">
                    The subject line only
                  </label>
                  <label class="quiz-option" data-answer="2">
                    <input type="radio" name="q1" value="2" style="margin-right: 10px;">
                    The attachments first
                  </label>
                  <label class="quiz-option" data-answer="3">
                    <input type="radio" name="q1" value="3" style="margin-right: 10px;">
                    Click the links to verify
                  </label>
                </div>
                <button class="btn" onclick="checkAnswer(0)">Check Answer</button>
                <div id="feedback" class="hidden"></div>
              </div>
            </div>
            
            <div id="completion-section" class="hidden">
              <div class="achievement">
                <h3>🏆 Congratulations!</h3>
                <p>You've completed the security awareness training</p>
                <div class="score-display" id="final-score">100%</div>
                <div class="progress-bar">
                  <div class="progress-fill" id="progress"></div>
                </div>
              </div>
              
              <div class="learning-section">
                <h2>🎓 What's Next?</h2>
                <p>Great job completing the training! Remember these key takeaways:</p>
                <ul>
                  <li>Always be skeptical of unexpected emails</li>
                  <li>Verify before you trust</li>
                  <li>Report suspicious emails to your IT team</li>
                  <li>Keep learning about new security threats</li>
                </ul>
                <button class="btn success" onclick="completeTraining()">Complete Training</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        const sessionToken = '${token}';
        let currentScore = 0;
        let questionsAnswered = 0;
        
        function checkAnswer(correctAnswer) {
          const selectedOption = document.querySelector('input[name="q1"]:checked');
          const feedback = document.getElementById('feedback');
          const options = document.querySelectorAll('.quiz-option');
          
          if (!selectedOption) {
            alert('Please select an answer first!');
            return;
          }
          
          const userAnswer = parseInt(selectedOption.value);
          questionsAnswered++;
          
          options.forEach((option, index) => {
            const radio = option.querySelector('input');
            radio.disabled = true;
            
            if (index === correctAnswer) {
              option.classList.add('correct');
            } else if (index === userAnswer && userAnswer !== correctAnswer) {
              option.classList.add('incorrect');
            }
          });
          
          if (userAnswer === correctAnswer) {
            currentScore += 100;
            feedback.innerHTML = '<p style="color: #2ed573; margin-top: 15px;"><strong>✅ Correct!</strong> Always verify the sender before taking any action.</p>';
          } else {
            feedback.innerHTML = '<p style="color: #ff4757; margin-top: 15px;"><strong>❌ Incorrect.</strong> The correct answer is to check the sender\'s email address and domain first.</p>';
          }
          
          feedback.classList.remove('hidden');
          feedback.classList.add('fade-in');
          
          // Show completion section after answering
          setTimeout(() => {
            document.getElementById('completion-section').classList.remove('hidden');
            document.getElementById('completion-section').classList.add('fade-in');
            updateProgress();
          }, 2000);
        }
        
        function updateProgress() {
          const progress = document.getElementById('progress');
          const scoreDisplay = document.getElementById('final-score');
          
          setTimeout(() => {
            progress.style.width = '100%';
            scoreDisplay.textContent = currentScore + '%';
          }, 500);
        }
        
        async function completeTraining() {
          try {
            // Track completion
            await fetch('${Deno.env.get('SUPABASE_URL')}/functions/v1/track-education-completion', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionToken: sessionToken,
                score: currentScore,
                timeSpent: Date.now() - startTime,
                completed: true
              })
            });
            
            // Show completion message
            alert('🎉 Training completed successfully! You are now better prepared to identify phishing attempts.');
            
            // Could redirect to a success page or close
            document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h2>✅ Training Complete!</h2><p>Thank you for completing the security awareness training. Stay vigilant!</p></div>';
            
          } catch (error) {
            console.error('Error completing training:', error);
            alert('Training completed! (Note: Unable to save progress)');
          }
        }
        
        // Track session start time
        const startTime = Date.now();
        
        // Update progress bar on page load
        setTimeout(() => {
          document.getElementById('progress').style.width = '25%';
        }, 1000);
      </script>
    </body>
    </html>
  `;
}