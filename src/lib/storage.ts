/**
 * Web 版存储适配器
 * 使用 localStorage 存储账号数据
 */

const ACCOUNTS_KEY = 'windsurf_accounts';

export interface Account {
  id: string;
  email: string;
  password: string;
  apiKey?: string;
  refreshToken?: string;
  idToken?: string;
  idTokenExpiresAt?: number;
  type?: string;
  credits?: number;
  usedCredits?: number;
  usage?: number;
  expiresAt?: string;
  note?: string;
  name?: string;
  apiServerUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Storage = {
  getAccounts(): { success: boolean; accounts: Account[]; error?: string } {
    try {
      const data = localStorage.getItem(ACCOUNTS_KEY);
      if (data) {
        const accounts = JSON.parse(data);
        return { success: true, accounts: Array.isArray(accounts) ? accounts : [] };
      }
      return { success: true, accounts: [] };
    } catch (error) {
      console.error('获取账号失败:', error);
      return { success: false, error: (error as Error).message, accounts: [] };
    }
  },

  saveAccounts(accounts: Account[]): { success: boolean; error?: string } {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return { success: true };
    } catch (error) {
      console.error('保存账号失败:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  addAccount(account: Partial<Account>): { success: boolean; account?: Account; error?: string } {
    try {
      const result = this.getAccounts();
      const accounts = result.accounts || [];

      const normalizedEmail = (account.email || '').toLowerCase().trim();
      const exists = accounts.find(
        (acc) => acc.email && acc.email.toLowerCase().trim() === normalizedEmail
      );
      if (exists) {
        return { success: false, error: `账号 ${account.email} 已存在` };
      }

      const newAccount: Account = {
        id: Date.now().toString(),
        email: account.email || '',
        password: account.password || '',
        apiKey: account.apiKey || '',
        refreshToken: account.refreshToken || '',
        type: account.type || '',
        credits: account.credits,
        usedCredits: account.usedCredits,
        usage: account.usage,
        expiresAt: account.expiresAt || '',
        note: account.note || '',
        name: account.name || '',
        apiServerUrl: account.apiServerUrl || '',
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      this.saveAccounts(accounts);
      return { success: true, account: newAccount };
    } catch (error) {
      console.error('添加账号失败:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  updateAccount(accountUpdate: Partial<Account>): { success: boolean; account?: Account; error?: string } {
    try {
      const result = this.getAccounts();
      const accounts = result.accounts || [];

      const index = accounts.findIndex((acc) => acc.id === accountUpdate.id);
      if (index === -1) {
        return { success: false, error: '账号不存在' };
      }

      accounts[index] = {
        ...accounts[index],
        ...accountUpdate,
        updatedAt: new Date().toISOString(),
      };

      this.saveAccounts(accounts);
      return { success: true, account: accounts[index] };
    } catch (error) {
      console.error('更新账号失败:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  deleteAccount(id: string): { success: boolean; error?: string } {
    try {
      const result = this.getAccounts();
      const accounts = result.accounts || [];
      const filtered = accounts.filter((acc) => acc.id !== id);
      this.saveAccounts(filtered);
      return { success: true };
    } catch (error) {
      console.error('删除账号失败:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  exportAccounts(accounts: Account[], filename?: string): { success: boolean; error?: string } {
    try {
      const exportData = {
        exportTime: new Date().toISOString(),
        totalCount: accounts.length,
        accounts: accounts,
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `windsurf-accounts-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('导出失败:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  importAccounts(file: File): Promise<{ success: boolean; importedCount?: number; skippedCount?: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let data = JSON.parse(e.target?.result as string);

          if (data.accounts && Array.isArray(data.accounts)) {
            data = data.accounts;
          }

          if (!Array.isArray(data)) {
            resolve({ success: false, error: '无效的数据格式' });
            return;
          }

          const result = this.getAccounts();
          const existingAccounts = result.accounts || [];
          const existingEmails = new Set(
            existingAccounts.map((acc) => (acc.email || '').toLowerCase().trim())
          );

          let importedCount = 0;
          let skippedCount = 0;

          data.forEach((item: Partial<Account>) => {
            const email = (item.email || '').toLowerCase().trim();
            if (!email) return;

            if (existingEmails.has(email)) {
              skippedCount++;
              return;
            }

            existingAccounts.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
              email: item.email || '',
              password: item.password || '',
              apiKey: item.apiKey || '',
              refreshToken: item.refreshToken || '',
              type: item.type || '',
              credits: item.credits,
              usedCredits: item.usedCredits,
              usage: item.usage,
              expiresAt: item.expiresAt || '',
              note: item.note || '',
              createdAt: item.createdAt || new Date().toISOString(),
            });
            existingEmails.add(email);
            importedCount++;
          });

          this.saveAccounts(existingAccounts);
          resolve({ success: true, importedCount, skippedCount });
        } catch (err) {
          resolve({ success: false, error: (err as Error).message });
        }
      };
      reader.onerror = () => resolve({ success: false, error: '读取文件失败' });
      reader.readAsText(file);
    });
  },
};

export default Storage;
