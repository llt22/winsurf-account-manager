'use client';

import { useState, useCallback, useRef } from 'react';
import { Plus, Download, Upload, RefreshCw, Search } from 'lucide-react';
import AccountTable from '@/components/AccountTable';
import AccountModal from '@/components/AccountModal';
import Toast from '@/components/Toast';
import { Storage, Account } from '@/lib/storage';
import { AccountApi } from '@/lib/accountApi';

function getAccountsByType(accounts: Account[]) {
  const grouped: Record<string, Account[]> = {
    Pro: [],
    Enterprise: [],
    Teams: [],
    Trial: [],
    Free: [],
    Other: [],
  };

  accounts.forEach((account) => {
    const type = (account.type || '').toLowerCase().trim();
    if (!type || type === '-') {
      grouped.Other.push(account);
    } else if (type.includes('pro')) {
      grouped.Pro.push(account);
    } else if (type.includes('enterprise')) {
      grouped.Enterprise.push(account);
    } else if (type.includes('team')) {
      grouped.Teams.push(account);
    } else if (type.includes('trial')) {
      grouped.Trial.push(account);
    } else if (type.includes('free')) {
      grouped.Free.push(account);
    } else {
      grouped.Other.push(account);
    }
  });

  return grouped;
}

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>(() => Storage.getAccounts().accounts || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAccounts = getAccountsByType(filteredAccounts);

  const handleAddAccount = async (accountData: Partial<Account>) => {
    const result = Storage.addAccount(accountData);
    if (result.success) {
      setAccounts(Storage.getAccounts().accounts || []);
      setModalOpen(false);
      showToast('账号添加成功');
    } else {
      showToast(result.error || '添加失败', 'error');
    }
  };

  const handleUpdateAccount = async (accountData: Partial<Account>) => {
    const result = Storage.updateAccount(accountData);
    if (result.success) {
      setAccounts(Storage.getAccounts().accounts || []);
      setModalOpen(false);
      showToast('账号更新成功');
    } else {
      showToast(result.error || '更新失败', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('确定要删除这个账号吗？')) return;
    const result = Storage.deleteAccount(id);
    if (result.success) {
      setAccounts(Storage.getAccounts().accounts || []);
      showToast('账号已删除');
    } else {
      showToast(result.error || '删除失败', 'error');
    }
  };

  const handleRefreshAccount = async (account: Account) => {
    if (!account.refreshToken && !account.password) {
      showToast('该账号缺少 refreshToken 和密码，无法刷新', 'error');
      return;
    }

    showToast('正在刷新账号信息...', 'info');

    try {
      let result;
      if (!account.refreshToken) {
        result = await AccountApi.loginAndGetToken(account.email, account.password);
      } else {
        result = await AccountApi.queryAccount(account);
      }

      if (result.success) {
        const r = result as any;
        const updatedData: Partial<Account> = {
          id: account.id,
          type: r.planName || account.type || '-',
          credits: r.totalCredits || 0,
          usedCredits: r.usedCredits || 0,
          usage: r.usagePercentage || 0,
          expiresAt: r.expiresAt || undefined,
        };

        // 处理 queryAccount 返回的 newTokenData
        if (r.newTokenData) {
          updatedData.idToken = r.newTokenData.idToken;
          updatedData.idTokenExpiresAt = r.newTokenData.idTokenExpiresAt;
          updatedData.refreshToken = r.newTokenData.refreshToken;
        }
        // 处理 loginAndGetToken 直接返回的字段
        if (r.refreshToken) updatedData.refreshToken = r.refreshToken;
        if (r.idToken) updatedData.idToken = r.idToken;
        if (r.idTokenExpiresAt) updatedData.idTokenExpiresAt = r.idTokenExpiresAt;
        if (r.apiKey) updatedData.apiKey = r.apiKey;
        if (r.name) updatedData.name = r.name;

        Storage.updateAccount(updatedData);
        setAccounts(Storage.getAccounts().accounts || []);
        showToast(`刷新成功！类型: ${updatedData.type}, 积分: ${updatedData.credits}`);
      } else {
        showToast(`刷新失败: ${result.error}`, 'error');
      }
    } catch (error) {
      showToast(`刷新失败: ${(error as Error).message}`, 'error');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label}已复制到剪贴板`);
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const handleAction = (action: string, account: Account) => {
    switch (action) {
      case 'copyEmail':
        copyToClipboard(account.email, '邮箱');
        break;
      case 'copyPassword':
        copyToClipboard(account.password, '密码');
        break;
      case 'copyApiKey':
        if (account.apiKey) copyToClipboard(account.apiKey, 'API Key');
        else showToast('该账号没有 API Key', 'error');
        break;
      case 'copyRefreshToken':
        if (account.refreshToken) copyToClipboard(account.refreshToken, 'Refresh Token');
        else showToast('该账号没有 Refresh Token', 'error');
        break;
      case 'copyToken':
        if (account.idToken) copyToClipboard(account.idToken, 'Token');
        else showToast('该账号没有 Token', 'error');
        break;
      case 'viewDetails':
        setEditingAccount(account);
        setModalMode('view');
        setModalOpen(true);
        break;
      case 'edit':
        setEditingAccount(account);
        setModalMode('edit');
        setModalOpen(true);
        break;
      case 'refreshToken':
      case 'refreshCredits':
      case 'refreshPoints':
        handleRefreshAccount(account);
        break;
      case 'delete':
        handleDeleteAccount(account.id);
        break;
    }
  };

  const handleExport = () => {
    const result = Storage.exportAccounts(accounts);
    if (result.success) {
      showToast('导出成功');
    } else {
      showToast(result.error || '导出失败', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await Storage.importAccounts(file);
    if (result.success) {
      setAccounts(Storage.getAccounts().accounts || []);
      showToast(`导入成功！导入 ${result.importedCount} 个，跳过 ${result.skippedCount} 个`);
    } else {
      showToast(result.error || '导入失败', 'error');
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Windsurf 账号管理</h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="搜索邮箱或备注..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setModalMode('add');
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} />
                  添加
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  导入
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} />
                  导出
                </button>
                <button
                  onClick={() => {
                    accounts.forEach((acc) => handleRefreshAccount(acc));
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={16} />
                  刷新全部
                </button>
              </div>
            </div>
          </div>
          <AccountTable groupedAccounts={groupedAccounts} onAction={handleAction} />
        </div>
      </div>

      {modalOpen && (
        <AccountModal
          mode={modalMode}
          account={editingAccount}
          onClose={() => setModalOpen(false)}
          onSave={modalMode === 'add' ? handleAddAccount : handleUpdateAccount}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
