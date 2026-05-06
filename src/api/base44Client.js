const APP_ID = "69f8d12d4456b5b1754eebea";
const API_KEY = "3a90352f758e47d286a320329c27023e";
const BASE_URL = "https://nexus-core-ai-754eebea.base44.app";

const headers = {
  'X-App-Id': APP_ID,
  'api_key': API_KEY,
  'Content-Type': 'application/json'
};

function createEntityClient(entityName) {
  return {
    async list(orderBy = '-created_date', limit = 50) {
      const res = await fetch(`${BASE_URL}/api/entities/${entityName}?order=${orderBy}&limit=${limit}`, { headers });
      return res.json();
    },
    async create(data) {
      const res = await fetch(`${BASE_URL}/api/entities/${entityName}`, {
        method: 'POST', headers, body: JSON.stringify(data)
      });
      return res.json();
    },
    async filter(filters, orderBy = '-created_date', limit = 50) {
      const params = new URLSearchParams({ ...filters, order: orderBy, limit });
      const res = await fetch(`${BASE_URL}/api/entities/${entityName}?${params}`, { headers });
      return res.json();
    },
    subscribe(callback) {
      const interval = setInterval(async () => {
        try {
          const data = await this.list('-created_date', 50);
          callback(data);
        } catch (e) {}
      }, 3000);
      return () => clearInterval(interval);
    }
  };
}

export const base44 = {
  entities: {
    Task: createEntityClient('tasks'),
    AuditLog: createEntityClient('audit_logs'),
    GeneratedAPI: createEntityClient('generated_apis'),
    AIAgent: createEntityClient('ai_agents'),
    Conversation: createEntityClient('conversations'),
  },
  integrations: {
    Core: {
      async InvokeLLM({ prompt, response_json_schema }) {
        const res = await fetch(`${BASE_URL}/api/integrations/llm`, {
          method: 'POST', headers, body: JSON.stringify({ prompt, response_json_schema })
        });
        return res.json();
      },
      async GenerateImage({ prompt }) {
        const res = await fetch(`${BASE_URL}/api/integrations/image`, {
          method: 'POST', headers, body: JSON.stringify({ prompt })
        });
        return res.json();
      },
      async GenerateVideo({ prompt, duration, aspect_ratio }) {
        const res = await fetch(`${BASE_URL}/api/integrations/video`, {
          method: 'POST', headers, body: JSON.stringify({ prompt, duration, aspect_ratio })
        });
        return res.json();
      }
    }
  },
  auth: {
    async me() {
      const token = localStorage.getItem('base44_access_token');
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { ...headers, 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    logout(redirectUrl) {
      localStorage.removeItem('base44_access_token');
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin(redirectUrl) {
      window.location.href = `${BASE_URL}/login?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  }
};