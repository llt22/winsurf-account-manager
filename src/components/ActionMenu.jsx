import {
  RefreshCw,
  Key,
  Eye,
  Zap,
  Download,
  CreditCard,
  Mail,
  Lock,
  Code,
  Copy,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const menuItems = [
  { id: 'refreshToken', label: '刷新 Token', icon: RefreshCw, color: 'text-blue-500' },
  { id: 'editPassword', label: '修改本地密码', icon: Key, color: 'text-gray-600' },
  { id: 'viewDetails', label: '查看详情', icon: Eye, color: 'text-gray-600' },
  { id: 'refreshPoints', label: '刷新积分', icon: Zap, color: 'text-gray-600' },
  { id: 'exportAccount', label: '导出账号', icon: Download, color: 'text-gray-600' },
  { id: 'getCardLink', label: '获取绑卡链接', icon: CreditCard, color: 'text-green-500' },
  { divider: true },
  { id: 'copyEmail', label: '复制邮箱', icon: Mail, color: 'text-gray-600' },
  { id: 'copyPassword', label: '复制密码', icon: Lock, color: 'text-gray-600' },
  { id: 'copyApiKey', label: '复制 API Key', icon: Code, color: 'text-gray-600' },
  { id: 'copyToken', label: '复制 Token', icon: Copy, color: 'text-gray-600' },
  { divider: true },
  { id: 'delete', label: '删除账号', icon: Trash2, color: 'text-red-500' },
];

export default function ActionMenu({ account, onClose, onAction }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const parent = menuRef.current.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        const menuHeight = 400;
        const viewportHeight = window.innerHeight;
        
        let top = rect.bottom + 4;
        if (top + menuHeight > viewportHeight) {
          top = Math.max(10, viewportHeight - menuHeight - 10);
        }
        
        setPosition({
          top,
          right: window.innerWidth - rect.right,
        });
      }
    }
  }, []);

  const handleClick = (actionId) => {
    onAction(actionId, account);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto"
      style={{ top: position.top, right: position.right }}
    >
      {menuItems.map((item, index) =>
        item.divider ? (
          <div key={index} className="border-t border-gray-100 my-1" />
        ) : (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-50 ${item.color}`}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
