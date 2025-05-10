
/**
 * Phishing Template Library
 * Provides a collection of high-quality phishing templates for popular platforms
 */

export interface PhishingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  platform: string;
  tags: string[];
  thumbnailUrl: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
}

// Collection of phishing templates for popular platforms
export const phishingTemplates: PhishingTemplate[] = [
  {
    id: "google-login",
    name: "Google Account Login",
    description: "Simulates the Google account login page",
    category: "Cloud",
    platform: "Google",
    tags: ["Google", "Gmail", "GSuite", "Workspace"],
    thumbnailUrl: "/assets/templates/placeholder-template.svg",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in - Google Accounts</title>
</head>
<body>
  <div class="google-login-container">
    <div class="login-panel">
      <div class="logo">
        <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google" />
      </div>
      <h1 class="title">Sign in</h1>
      <p class="subtitle">Use your Google Account</p>
      
      <form id="login-form">
        <div class="form-group">
          <input type="email" name="email" id="email" placeholder="Email or phone" required autocomplete="off" />
        </div>
        <div class="form-group">
          <input type="password" name="password" id="password" placeholder="Password" required />
        </div>
        
        <div class="options">
          <div class="checkbox">
            <input type="checkbox" id="show-password" />
            <label for="show-password">Show password</label>
          </div>
        </div>
        
        <div class="actions">
          <a href="#" class="create">Create account</a>
          <button type="submit" class="next-button">Next</button>
        </div>
      </form>
    </div>
    <div class="footer">
      <select name="language" id="language">
        <option value="en">English (United States)</option>
      </select>
      <div class="links">
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    cssContent: `body {
  font-family: 'Roboto', Arial, sans-serif;
  background-color: #fff;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.google-login-container {
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
}

.login-panel {
  background-color: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 48px 40px 36px;
  text-align: center;
}

.logo img {
  height: 24px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 400;
  margin: 0 0 8px;
  color: #202124;
}

.subtitle {
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 32px;
  color: #202124;
}

.form-group {
  margin-bottom: 24px;
  text-align: left;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  height: 54px;
  padding: 13px 15px;
  box-sizing: border-box;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 16px;
  color: #202124;
  outline: none;
}

input:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox {
  display: flex;
  align-items: center;
  color: #5f6368;
  font-size: 14px;
}

.checkbox input {
  margin-right: 8px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
}

.create {
  color: #1a73e8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.next-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  font-size: 12px;
  color: #5f6368;
}

.links a {
  color: #5f6368;
  text-decoration: none;
  margin-left: 24px;
}

@media (max-width: 600px) {
  .login-panel {
    border: none;
    padding: 24px;
  }
}`,
    jsContent: `document.addEventListener('DOMContentLoaded', function() {
  const showPassword = document.getElementById('show-password');
  const password = document.getElementById('password');
  
  if (showPassword && password) {
    showPassword.addEventListener('change', function() {
      password.type = showPassword.checked ? 'text' : 'password';
    });
  }
});`
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365 Login",
    description: "Simulates the Microsoft 365 login page",
    category: "Cloud",
    platform: "Microsoft",
    tags: ["Microsoft", "Office 365", "Azure", "Outlook"],
    thumbnailUrl: "/assets/templates/placeholder-template.svg",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to your account</title>
</head>
<body>
  <div class="ms-login-container">
    <div class="login-panel">
      <div class="logo">
        <img src="https://aadcdn.msftauth.net/shared/1.0/content/images/microsoft_logo_ee5c8d9fb6248c938fd0dc19370e90bd.svg" alt="Microsoft" />
      </div>
      <h1 class="title">Sign in</h1>
      
      <form id="login-form">
        <div class="form-group">
          <input type="email" name="email" id="email" placeholder="Email, phone, or Skype" required autocomplete="off" />
        </div>
        
        <div class="form-group password-group hidden">
          <input type="password" name="password" id="password" placeholder="Password" required />
        </div>
        
        <div class="options">
          <div class="checkbox">
            <input type="checkbox" id="keep-signed-in" />
            <label for="keep-signed-in">Keep me signed in</label>
          </div>
          <a href="#" class="forgot">Forgot my password</a>
        </div>
        
        <div class="actions">
          <div class="alt-options">
            <a href="#">Sign in with a security key</a>
            <a href="#">Sign in options</a>
          </div>
          <button type="button" id="next-button" class="next-button">Next</button>
          <button type="submit" id="signin-button" class="next-button hidden">Sign in</button>
        </div>
      </form>
    </div>
    
    <div class="footer">
      <div class="links">
        <a href="#">Terms of use</a>
        <a href="#">Privacy & cookies</a>
        <a href="#">...</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    cssContent: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ms-login-container {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.login-panel {
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 44px;
  min-width: 320px;
}

.logo img {
  height: 24px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0;
  color: #000;
}

.form-group {
  margin-bottom: 16px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  height: 36px;
  padding: 6px 10px;
  box-sizing: border-box;
  border: 1px solid #666;
  border-radius: 0;
  font-size: 15px;
  color: #000;
  outline: none;
}

input:focus {
  border-color: #0067b8;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  font-size: 13px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 8px;
}

.forgot {
  color: #0067b8;
  text-decoration: none;
}

.actions {
  margin-top: 16px;
}

.alt-options {
  font-size: 13px;
  margin-bottom: 24px;
}

.alt-options a {
  display: block;
  color: #0067b8;
  text-decoration: none;
  margin-bottom: 12px;
}

.next-button {
  background-color: #0067b8;
  color: white;
  border: none;
  padding: 4px 12px;
  min-width: 108px;
  height: 32px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  float: right;
}

.footer {
  margin-top: 30px;
  font-size: 12px;
}

.links {
  display: flex;
}

.links a {
  color: #666;
  text-decoration: none;
  margin-right: 24px;
}

.hidden {
  display: none;
}

@media (max-width: 600px) {
  .login-panel {
    box-shadow: none;
    padding: 24px;
  }
}`,
    jsContent: `document.addEventListener('DOMContentLoaded', function() {
  const nextButton = document.getElementById('next-button');
  const signinButton = document.getElementById('signin-button');
  const passwordGroup = document.querySelector('.password-group');
  const emailInput = document.getElementById('email');
  
  if (nextButton && passwordGroup && signinButton) {
    nextButton.addEventListener('click', function() {
      // Show password field after Next is clicked
      passwordGroup.classList.remove('hidden');
      nextButton.classList.add('hidden');
      signinButton.classList.remove('hidden');
    });
  }
});`
  },
  {
    id: "facebook-login",
    name: "Facebook Login",
    description: "Simulates the Facebook login page",
    category: "Social",
    platform: "Facebook",
    tags: ["Facebook", "Social Media"],
    thumbnailUrl: "/assets/templates/placeholder-template.svg",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facebook - Log In or Sign Up</title>
</head>
<body>
  <div class="fb-container">
    <div class="fb-content">
      <div class="fb-left">
        <div class="fb-logo">
          <img src="https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg" alt="Facebook" />
        </div>
        <h2 class="fb-tagline">Connect with friends and the world around you on Facebook.</h2>
      </div>
      <div class="fb-right">
        <div class="fb-login-card">
          <form id="login-form">
            <div class="form-group">
              <input type="text" name="email" placeholder="Email or phone number" required />
            </div>
            <div class="form-group">
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <div class="form-group">
              <button type="submit" class="login-button">Log In</button>
            </div>
            <div class="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>
            <div class="divider"></div>
            <div class="create-account">
              <button type="button" class="create-button">Create New Account</button>
            </div>
          </form>
        </div>
        <div class="create-page">
          <p><a href="#">Create a Page</a> for a celebrity, brand or business.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    cssContent: `body {
  font-family: Helvetica, Arial, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
  height: 100vh;
}

.fb-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.fb-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 980px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
}

.fb-left {
  flex: 1;
  max-width: 500px;
  margin-right: 32px;
}

.fb-logo img {
  height: 106px;
  margin: -28px;
}

.fb-tagline {
  font-size: 24px;
  line-height: 28px;
  font-weight: normal;
  color: #1c1e21;
  margin: 0;
  padding: 0 0 20px;
}

.fb-right {
  flex: 1;
  max-width: 396px;
}

.fb-login-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 28px;
}

.form-group {
  margin-bottom: 12px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px 16px;
  font-size: 17px;
  border-radius: 6px;
  border: 1px solid #dddfe2;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 14px 16px;
  font-size: 20px;
  font-weight: bold;
  background-color: #1877f2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.forgot-password {
  text-align: center;
  margin: 16px 0;
}

.forgot-password a {
  color: #1877f2;
  text-decoration: none;
  font-size: 14px;
}

.divider {
  border-bottom: 1px solid #dadde1;
  margin: 20px 0;
}

.create-button {
  background-color: #42b72a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 17px;
  font-weight: bold;
  padding: 14px 16px;
  margin: 0 auto;
  display: block;
  cursor: pointer;
}

.create-page {
  text-align: center;
  font-size: 14px;
  margin-top: 28px;
}

.create-page a {
  font-weight: bold;
  text-decoration: none;
  color: #1c1e21;
}

@media (max-width: 900px) {
  .fb-content {
    flex-direction: column;
    text-align: center;
  }
  
  .fb-left {
    margin-right: 0;
    margin-bottom: 40px;
  }
  
  .fb-tagline {
    font-size: 20px;
  }
}`,
    jsContent: ``
  },
  {
    id: "linkedin-login",
    name: "LinkedIn Login",
    description: "Simulates the LinkedIn login page",
    category: "Social",
    platform: "LinkedIn",
    tags: ["LinkedIn", "Professional", "Social Media"],
    thumbnailUrl: "/assets/templates/placeholder-template.svg",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn: Log In or Sign Up</title>
</head>
<body>
  <header class="global-nav">
    <div class="nav-main">
      <div class="nav-logo">
        <img src="https://www.logo.wine/a/logo/LinkedIn/LinkedIn-Logo.wine.svg" alt="LinkedIn" />
      </div>
      <div class="nav-buttons">
        <a href="#" class="nav-button">Join now</a>
        <a href="#" class="nav-button sign-in">Sign in</a>
      </div>
    </div>
  </header>

  <main class="main-content">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to your professional community</h1>
        
        <div class="sign-in-form">
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email or phone</label>
              <input type="text" id="email" name="email" required />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required />
            </div>
            <div class="forgot-password">
              <a href="#">Forgot password?</a>
            </div>
            <div class="form-group">
              <button type="submit" class="sign-in-button">Sign in</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`,
    cssContent: `body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Fira Sans', Ubuntu, Oxygen, 'Oxygen Sans', Cantarell, 'Droid Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Lucida Grande', Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.9);
}

.global-nav {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1128px;
  margin: 0 auto;
}

.nav-logo img {
  height: 40px;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

.nav-button {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 24px;
  transition: background-color 0.15s;
}

.nav-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.nav-button.sign-in {
  border: 1px solid #0a66c2;
  color: #0a66c2;
}

.main-content {
  max-width: 1128px;
  margin: 0 auto;
  padding: 40px 32px;
}

.hero {
  display: flex;
  align-items: center;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 56px;
  color: #8f5849;
  font-weight: 200;
  line-height: 1.2;
  margin-bottom: 40px;
}

.sign-in-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  padding: 0 0 4px 12px;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 14px 12px;
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.forgot-password {
  margin: 16px 0;
}

.forgot-password a {
  color: #0a66c2;
  font-weight: 600;
  text-decoration: none;
  font-size: 16px;
}

.sign-in-button {
  width: 100%;
  padding: 16px;
  background-color: #0a66c2;
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 992px) {
  .hero-content {
    width: 100%;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .sign-in-form {
    max-width: 100%;
  }
}`,
    jsContent: ``
  },
  {
    id: "dropbox-login",
    name: "Dropbox Login",
    description: "Simulates the Dropbox login page",
    category: "Cloud",
    platform: "Dropbox",
    tags: ["Dropbox", "Cloud Storage", "File Sharing"],
    thumbnailUrl: "/assets/templates/placeholder-template.svg",
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in - Dropbox</title>
</head>
<body>
  <div class="login-container">
    <header class="login-header">
      <div class="logo">
        <img src="https://cfl.dropboxstatic.com/static/images/logo_catalog/dropbox_logo_2017/glyph_2017_m1.svg" alt="Dropbox" />
      </div>
    </header>

    <div class="login-box">
      <h1>Sign in</h1>
      <div class="login-form">
        <form id="login-form">
          <div class="form-group">
            <input type="email" name="email" placeholder="Email" autocomplete="off" required />
          </div>
          <div class="form-group">
            <input type="password" name="password" placeholder="Password" required />
          </div>
          <div class="form-options">
            <div class="checkbox">
              <input type="checkbox" id="remember" name="remember" />
              <label for="remember">Remember me</label>
            </div>
          </div>
          <div class="form-group">
            <button type="submit" class="sign-in-button">Sign in</button>
          </div>
          <div class="forgot-password">
            <a href="#">Forgot your password?</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</body>
</html>`,
    cssContent: `body {
  font-family: "AtlasGrotesk", "Helvetica Neue", Helvetica, Arial, sans-serif;
  background-color: #fff;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 460px;
  width: 100%;
  padding: 0 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo img {
  width: 52px;
  height: 48px;
}

.login-box {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 24px;
  text-align: center;
}

.login-form {
  padding: 0 40px 32px;
}

.form-group {
  margin-bottom: 16px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #c1c7cd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

input:focus {
  border-color: #0061fe;
  outline: none;
}

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 8px;
}

.checkbox label {
  font-size: 14px;
  color: #1e1919;
}

.sign-in-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #0061fe;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.forgot-password {
  margin: 16px 0 0;
  text-align: center;
}

.forgot-password a {
  color: #0061fe;
  font-size: 14px;
  text-decoration: none;
}

@media (max-width: 480px) {
  .login-container {
    padding: 0 16px;
  }

  .login-form {
    padding-left: 20px;
    padding-right: 20px;
  }
}`,
    jsContent: ``
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): PhishingTemplate | undefined => {
  return phishingTemplates.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): PhishingTemplate[] => {
  return phishingTemplates.filter(template => template.category === category);
};

// Helper function to search templates
export const searchTemplates = (query: string): PhishingTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return phishingTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.platform.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Get all unique categories
export const getUniqueCategories = (): string[] => {
  const categories = new Set<string>();
  phishingTemplates.forEach(template => categories.add(template.category));
  return Array.from(categories).sort();
};

// Get all unique platforms
export const getUniquePlatforms = (): string[] => {
  const platforms = new Set<string>();
  phishingTemplates.forEach(template => platforms.add(template.platform));
  return Array.from(platforms).sort();
};
