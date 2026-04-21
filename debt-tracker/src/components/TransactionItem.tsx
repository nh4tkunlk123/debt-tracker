import React from 'react';
import type { Transaction } from '../store/DebtContext';
import { useLanguage } from '../store/LanguageContext';
import { Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const { t } = useLanguage();
  const isBorrow = transaction.amount > 0;
  const amountColor = isBorrow ? 'var(--danger-color)' : 'var(--success-color)';
  
  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return t('today');
    if (date.toDateString() === yesterday.toDateString()) return t('yesterday');
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex-col">
        <span className="font-semibold">{transaction.note || (isBorrow ? t('choVay') : t('daTra'))}</span>
        <span className="text-sm text-secondary">{formatDate(transaction.date)}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold" style={{ color: amountColor }}>
          {isBorrow ? '+' : ''}{transaction.amount.toLocaleString()}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ padding: '8px', backgroundColor: 'rgba(255, 69, 58, 0.1)', borderRadius: '8px' }}
        >
          <Trash2 size={18} color="var(--danger-color)" />
        </button>
      </div>
    </div>
  );
};
