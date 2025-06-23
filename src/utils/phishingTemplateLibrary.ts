
export interface PhishingTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  previewImage?: string;
}

export const phishingTemplates: PhishingTemplate[] = [
  {
    id: "1",
    name: "Bank Login Page",
    category: "Banking",
    description: "Generic bank login form that looks authentic",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd;">
        <h2>Secure Login</h2>
        <form>
          <div style="margin-bottom: 15px;">
            <label>Username:</label>
            <input type="text" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc;">
          </div>
          <div style="margin-bottom: 15px;">
            <label>Password:</label>
            <input type="password" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc;">
          </div>
          <button type="submit" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none;">Login</button>
        </form>
      </div>
    `,
    cssContent: "body { background-color: #f5f5f5; }"
  },
  {
    id: "2",
    name: "Office 365 Login",
    category: "Corporate", 
    description: "Microsoft Office 365 login page replica",
    htmlContent: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 440px; margin: 100px auto; padding: 44px; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMTA4IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMjQiIGZpbGw9IiNmZjYwMDAiLz48L3N2Zz4=" alt="Microsoft" style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Sign in</h1>
        <p style="margin-bottom: 24px; color: #323130;">to continue to Office</p>
        <form>
          <input type="email" placeholder="Email, phone, or Skype" style="width: 100%; padding: 8px 12px; margin-bottom: 16px; border: 1px solid #605e5c; font-size: 15px;">
          <button type="submit" style="background: #0078d4; color: white; border: none; padding: 8px 12px; width: 100%; font-size: 15px;">Next</button>
        </form>
      </div>
    `
  }
];
