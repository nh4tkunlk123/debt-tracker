import React, { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { NumberPad } from './NumberPad';
import { useDebtContext } from '../store/DebtContext';
import { useLanguage } from '../store/LanguageContext';
import { triggerHaptic } from '../utils/haptics';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPersonId?: string | null;
  defaultType?: 'borrow' | 'payback';
}

export const AddTransactionSheet: React.FC<AddTransactionSheetProps> = ({ isOpen, onClose, defaultPersonId, defaultType = 'borrow' }) => {
  const { people, addTransaction } = useDebtContext();
  const { t } = useLanguage();
  
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [txType, setTxType] = useState<'borrow' | 'payback'>('borrow');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (defaultPersonId && people.find(p => p.id === defaultPersonId)) {
        setSelectedPersonId(defaultPersonId);
      } else if (people.length > 0) {
        setSelectedPersonId(people[0].id);
      }
      setTxType(defaultType);
      setTxAmount('');
      setTxNote('');
    }
  }, [isOpen, defaultPersonId, people, defaultType]);

  const handleKeyPress = (key: string) => {
    triggerHaptic('light');
    if (txAmount === '0' && key !== '0' && key !== '000') {
      setTxAmount(key);
    } else if (txAmount !== '0' || key === '0') {
      if (txAmount.length < 12) {
        setTxAmount(prev => prev + key);
      }
    }
  };

  const handleDeleteKey = () => {
    triggerHaptic('light');
    setTxAmount(prev => prev.slice(0, -1));
  };

  const handleQuickAdd = (amount: number) => {
    triggerHaptic('medium');
    const current = parseInt(txAmount || '0', 10);
    setTxAmount((current + amount).toString());
  };

  const handleSaveTransaction = () => {
    const amountNum = parseInt(txAmount || '0', 10);
    if (amountNum <= 0 || !selectedPersonId) {
      triggerHaptic('error');
      return;
    }
    
    triggerHaptic('success');
    const finalAmount = txType === 'borrow' ? amountNum : -amountNum;
    addTransaction(selectedPersonId, finalAmount, txNote);
    
    setTxAmount('');
    setTxNote('');
    setTxType('borrow');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('newTransaction')}>
      <div className="flex-col">
        {/* Person Selector */}
        <select 
          value={selectedPersonId} 
          onChange={(e) => setSelectedPersonId(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', 
            border: 'none', marginBottom: '12px', fontSize: '16px',
            WebkitAppearance: 'none', fontWeight: '600'
          }}
        >
          <option value="" disabled>{t('selectPerson')}</option>
          {people.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="amount-type-toggle">
          <div 
            className={`toggle-btn borrow ${txType === 'borrow' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setTxType('borrow'); }}
          >
            {t('borrowedPlus')}
          </div>
          <div 
            className={`toggle-btn payback ${txType === 'payback' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setTxType('payback'); }}
          >
            {t('paidBackMinus')}
          </div>
        </div>

        <div className="amount-display" style={{ color: txType === 'borrow' ? 'var(--success-color)' : 'var(--danger-color)' }}>
          {txAmount ? parseInt(txAmount, 10).toLocaleString() : '0'}
        </div>

        <input
          type="text"
          placeholder={t('noteTx')}
          value={txNote}
          onChange={(e) => setTxNote(e.target.value)}
          style={{ padding: '12px 16px', fontSize: '16px', borderRadius: 'var(--radius-sm)' }}
        />

        <NumberPad 
          onKeyPress={handleKeyPress}
          onDelete={handleDeleteKey}
          onQuickAdd={handleQuickAdd}
        />

        <button 
          className="btn-primary" 
          onClick={handleSaveTransaction}
          disabled={!txAmount || txAmount === '0' || !selectedPersonId}
          style={{ 
            opacity: (!txAmount || txAmount === '0' || !selectedPersonId) ? 0.5 : 1,
            marginTop: '12px',
            padding: '14px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {t('save')}
        </button>
      </div>
    </BottomSheet>
  );
};
