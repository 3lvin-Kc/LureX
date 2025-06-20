
// Mock Supabase client for frontend-only implementation
// This provides the same interface as the real Supabase client but with mock data

interface MockSupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

interface MockSupabaseQuery<T> {
  select: (columns?: string) => MockSupabaseQuery<T>;
  insert: (data: any) => MockSupabaseQuery<T>;
  update: (data: any) => MockSupabaseQuery<T>;
  delete: () => MockSupabaseQuery<T>;
  eq: (column: string, value: any) => MockSupabaseQuery<T>;
  not: (column: string, operator: string, value: any) => MockSupabaseQuery<T>;
  order: (column: string, options?: { ascending?: boolean }) => MockSupabaseQuery<T>;
  single: () => Promise<MockSupabaseResponse<T>>;
  then: (callback: (result: MockSupabaseResponse<T[]>) => any) => Promise<any>;
}

// Mock data for different tables
const mockTemplates = [
  {
    id: "1",
    name: "Password Reset Notification",
    subject: "Password Reset Required",
    category: "Security",
    html_content: "<p>Your password needs to be reset. Click here to continue.</p>",
    text_content: "Your password needs to be reset.",
    description: "Standard password reset phishing template",
    version: 1,
    created_at: "2024-01-01T00:00:00Z"
  }
];

const mockPhishingPages = [
  {
    id: "1",
    name: "Login Page Clone",
    category: "Banking",
    html_content: "<form><input type='email' placeholder='Email'><input type='password' placeholder='Password'><button>Login</button></form>",
    css_content: "body { font-family: Arial; }",
    js_content: "console.log('Mock phishing page');",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const mockTargetLists = [
  {
    id: "1",
    name: "All Employees",
    description: "Complete employee list",
    created_at: "2024-01-01T00:00:00Z"
  }
];

const mockProviders = [
  {
    id: "1",
    name: "SMTP Provider",
    type: "smtp",
    created_at: "2024-01-01T00:00:00Z"
  }
];

class MockSupabaseClient {
  from(table: string): MockSupabaseQuery<any> {
    return new MockSupabaseQueryImpl(table);
  }

  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => ({
        data: { path },
        error: null
      })
    })
  };

  functions = {
    invoke: async (functionName: string, options?: any) => ({
      data: null,
      error: null
    })
  };
}

class MockSupabaseQueryImpl<T> implements MockSupabaseQuery<T> {
  private table: string;
  private conditions: any[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string): MockSupabaseQuery<T> {
    return this;
  }

  insert(data: any): MockSupabaseQuery<T> {
    return this;
  }

  update(data: any): MockSupabaseQuery<T> {
    return this;
  }

  delete(): MockSupabaseQuery<T> {
    return this;
  }

  eq(column: string, value: any): MockSupabaseQuery<T> {
    this.conditions.push({ column, operator: 'eq', value });
    return this;
  }

  not(column: string, operator: string, value: any): MockSupabaseQuery<T> {
    this.conditions.push({ column, operator: 'not', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): MockSupabaseQuery<T> {
    return this;
  }

  async single(): Promise<MockSupabaseResponse<T>> {
    const data = this.getMockData();
    return {
      data: Array.isArray(data) ? data[0] : data,
      error: null
    };
  }

  async then(callback: (result: MockSupabaseResponse<T[]>) => any): Promise<any> {
    const data = this.getMockData();
    const result = {
      data: Array.isArray(data) ? data : [data],
      error: null
    };
    return callback(result);
  }

  private getMockData(): any {
    switch (this.table) {
      case 'email_templates':
        return mockTemplates;
      case 'phishing_pages':
        return mockPhishingPages;
      case 'target_lists':
        return mockTargetLists;
      case 'email_providers':
        return mockProviders;
      default:
        return [];
    }
  }
}

export const supabase = new MockSupabaseClient();
