import { useState } from 'react';
import { Eye, EyeOff, MoreVertical } from 'lucide-react';
import ActionMenu from './ActionMenu';

const GROUP_ORDER = ['Pro', 'Enterprise', 'Teams', 'Trial', 'Free', 'Other'];

const GROUP_COLORS = {
  Pro: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-l-blue-500' },
  Enterprise: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-l-purple-500' },
  Teams: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-l-orange-500' },
  Trial: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-green-500' },
  Free: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-l-gray-400' },
  Other: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-l-gray-300' },
};

function getTokenStatus(account) {
  if (!account.apiKey) {
    return { text: '未获取', color: 'text-gray-400' };
  }
  if (!account.refreshToken) {
    return { text: '不完整', color: 'text-yellow-500' };
  }
  return { text: '正常', color: 'text-green-500' };
}

function AccountRow({ account, index, onAction }) {
  const [showPassword, setShowPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const tokenStatus = getTokenStatus(account);
  const usage = account.usage !== undefined ? `${account.usage}%` : '-';
  const expiryDate = account.expiresAt
    ? new Date(account.expiresAt).toLocaleDateString('zh-CN')
    : '-';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-gray-500 text-sm">{index}</td>
      <td className="px-4 py-3 text-gray-800">{account.email}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-600">
            {showPassword ? account.password : '••••••'}
          </span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-gray-700">{account.type || '-'}</span>
      </td>
      <td className="px-4 py-3 text-gray-700 text-center">
        {account.credits !== undefined ? account.credits : '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-center">
        {account.usedCredits !== undefined ? account.usedCredits : '-'}
      </td>
      <td className="px-4 py-3 text-gray-700 text-center">
        {account.credits !== undefined && account.usedCredits !== undefined
          ? account.credits - account.usedCredits
          : '-'}
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`${
            account.usage > 80
              ? 'text-red-500'
              : account.usage > 50
              ? 'text-yellow-500'
              : 'text-green-500'
          }`}
        >
          {usage}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600 text-sm">{expiryDate}</td>
      <td className="px-4 py-3">
        <span className={tokenStatus.color}>Token {tokenStatus.text}</span>
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm max-w-32 truncate">
        {account.note || '-'}
      </td>
      <td className="px-4 py-3 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <ActionMenu
            account={account}
            onClose={() => setMenuOpen(false)}
            onAction={onAction}
          />
        )}
      </td>
    </tr>
  );
}

function AccountGroup({ type, accounts, startIndex, onAction }) {
  if (accounts.length === 0) return null;

  const colors = GROUP_COLORS[type] || GROUP_COLORS.Other;

  return (
    <>
      <tr>
        <td
          colSpan={12}
          className={`px-4 py-2 ${colors.bg} ${colors.text} border-l-3 ${colors.border}`}
        >
          <span className="font-medium">{type}</span>
          <span className="ml-2 text-sm opacity-70">({accounts.length})</span>
        </td>
      </tr>
      {accounts.map((account, idx) => (
        <AccountRow
          key={account.id}
          account={account}
          index={startIndex + idx + 1}
          onAction={onAction}
        />
      ))}
    </>
  );
}

export default function AccountTable({ groupedAccounts, onAction }) {
  // 预计算每个分组的起始索引
  const startIndices = {};
  let idx = 0;
  GROUP_ORDER.forEach((type) => {
    startIndices[type] = idx;
    idx += (groupedAccounts[type] || []).length;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              邮箱
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              密码
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              类型
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              积分
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              已用
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              剩余
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              使用率
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              到期时间
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TOKEN
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              备注
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {GROUP_ORDER.map((type) => (
            <AccountGroup
              key={type}
              type={type}
              accounts={groupedAccounts[type] || []}
              startIndex={startIndices[type]}
              onAction={onAction}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
