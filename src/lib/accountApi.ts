/**
 * 账号 API 模块
 * 调用 Next.js API Route 进行登录、刷新等操作
 */

export interface LoginResult {
  success: boolean;
  error?: string;
  idToken?: string;
  refreshToken?: string;
  email?: string;
  expiresIn?: number;
}

export interface ApiKeyResult {
  success: boolean;
  error?: string;
  apiKey?: string;
  name?: string;
  apiServerUrl?: string;
}

export interface PlanStatusResult {
  success: boolean;
  error?: string;
  planName?: string;
  totalCredits?: number;
  usedCredits?: number;
  usagePercentage?: number;
  expiresAt?: string;
}

export const AccountApi = {
  /**
   * 使用邮箱密码登录
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }

      return {
        success: true,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        email: data.email,
        expiresIn: parseInt(data.expiresIn || '3600'),
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 获取 API Key
   */
  async getApiKey(idToken: string): Promise<ApiKeyResult> {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_id_token: idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }

      return {
        success: true,
        apiKey: data.api_key,
        name: data.name,
        apiServerUrl: data.api_server_url,
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<LoginResult> {
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }

      return {
        success: true,
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresIn: parseInt(data.expires_in || '3600'),
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 获取账号使用情况
   */
  async getPlanStatus(authToken: string): Promise<PlanStatusResult> {
    try {
      const response = await fetch('/api/plan-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_token: authToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }

      const planStatus = data.planStatus || data;
      const expiresAt = planStatus.planEnd || planStatus.expiresAt || null;

      const promptCredits = Math.round((planStatus.availablePromptCredits || 0) / 100);
      const flexCredits = Math.round((planStatus.availableFlexCredits || 0) / 100);
      const totalCredits = promptCredits + flexCredits;

      const usedPromptCredits = Math.round((planStatus.usedPromptCredits || 0) / 100);
      const usedFlexCredits = Math.round((planStatus.usedFlexCredits || 0) / 100);
      const usedCredits = usedPromptCredits + usedFlexCredits;

      return {
        success: true,
        planName: planStatus.planInfo?.planName || 'Free',
        totalCredits,
        usedCredits,
        usagePercentage: totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0,
        expiresAt,
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 完整登录流程：登录 + 获取 API Key
   */
  async loginAndGetToken(email: string, password: string) {
    const loginResult = await this.login(email, password);
    if (!loginResult.success || !loginResult.idToken) {
      return { success: false, error: loginResult.error || '登录失败' };
    }

    const apiKeyResult = await this.getApiKey(loginResult.idToken);
    if (!apiKeyResult.success) {
      return { success: false, error: apiKeyResult.error || '获取 API Key 失败' };
    }

    return {
      success: true,
      email,
      name: apiKeyResult.name,
      apiKey: apiKeyResult.apiKey,
      apiServerUrl: apiKeyResult.apiServerUrl,
      refreshToken: loginResult.refreshToken,
      idToken: loginResult.idToken,
      idTokenExpiresAt: Date.now() + (loginResult.expiresIn || 3600) * 1000,
    };
  },

  /**
   * 查询账号信息（刷新积分）
   */
  async queryAccount(account: { refreshToken?: string; idToken?: string; idTokenExpiresAt?: number; email?: string; password?: string }) {
    if (!account.refreshToken) {
      return { success: false, error: '账号缺少 refreshToken' };
    }

    let accessToken = account.idToken;
    let newTokenData = null;

    const now = Date.now();
    const tokenExpired = !account.idToken || !account.idTokenExpiresAt || now >= account.idTokenExpiresAt;

    if (tokenExpired) {
      const refreshResult = await this.refreshToken(account.refreshToken);
      if (!refreshResult.success || !refreshResult.idToken) {
        return { success: false, error: refreshResult.error || '刷新 Token 失败' };
      }
      accessToken = refreshResult.idToken;
      newTokenData = {
        idToken: refreshResult.idToken,
        idTokenExpiresAt: now + (refreshResult.expiresIn || 3600) * 1000,
        refreshToken: refreshResult.refreshToken,
      };
    }

    const planResult = await this.getPlanStatus(accessToken!);
    if (!planResult.success) {
      return { success: false, error: planResult.error };
    }

    return {
      ...planResult,
      newTokenData,
    };
  },
};

export default AccountApi;
