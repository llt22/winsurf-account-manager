import { useState } from 'react';
import { X } from 'lucide-react';

function getInitialFormData(account) {
  if (account) {
    return {
      email: account.email || '',
      password: account.password || '',
      apiKey: account.apiKey || '',
      note: account.note || '',
    };
  }
  return {
    email: '',
    password: '',
    apiKey: '',
    note: '',
  };
}

export default function AccountModal({ account, onClose, onSave, mode = 'add' }) {
  const [formData, setFormData] = useState(() => getInitialFormData(account));
  const isViewMode = mode === 'view';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isViewMode ? '账号详情' : account ? '编辑账号' : '添加账号'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 {!isViewMode && '*'}
            </label>
            <input
              type="email"
              required={!isViewMode}
              readOnly={isViewMode}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${
                isViewMode
                  ? 'bg-gray-50 cursor-default'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="example@email.com"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码 {!isViewMode && '*'}
            </label>
            <input
              type="text"
              required={!isViewMode}
              readOnly={isViewMode}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${
                isViewMode
                  ? 'bg-gray-50 cursor-default'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="密码"
            />
          </div>

          {/* API Key（可选） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <input
              type="text"
              readOnly={isViewMode}
              value={formData.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${
                isViewMode
                  ? 'bg-gray-50 cursor-default'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="API Key"
            />
          </div>

          {/* 查看模式下显示更多只读信息 */}
          {isViewMode && account && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {account.type || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">积分</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {account.credits !== undefined ? account.credits : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">已用</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {account.usedCredits !== undefined ? account.usedCredits : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">使用率</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                    {account.usage !== undefined ? `${account.usage}%` : '-'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">到期时间</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                  {account.expiresAt
                    ? new Date(account.expiresAt).toLocaleDateString('zh-CN')
                    : '-'}
                </div>
              </div>
              {account.refreshToken && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-xs font-mono break-all max-h-20 overflow-y-auto">
                    {account.refreshToken}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注 <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <input
              type="text"
              readOnly={isViewMode}
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg outline-none ${
                isViewMode
                  ? 'bg-gray-50 cursor-default'
                  : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="备注信息"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isViewMode ? '关闭' : '取消'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                {account ? '保存' : '添加'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
