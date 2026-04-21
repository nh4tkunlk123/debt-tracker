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
  const { people, addTransaction, getPersonBalance } = useDebtContext();
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

  const currentBalance = selectedPersonId ? getPersonBalance(selectedPersonId) : 0;

  let labelPlus = t('lend');
  let labelMinus = t('borrow');
  let colorPlus = 'action-blue';
  let colorMinus = 'action-red';

  if (currentBalance > 0) {
    labelPlus = t('lendMore');
    labelMinus = t('theyRepay');
    colorPlus = 'action-blue';
    colorMinus = 'action-green';
  } else if (currentBalance < 0) {
    labelPlus = t('iRepay');
    labelMinus = t('borrowMore');
    colorPlus = 'action-green';
    colorMinus = 'action-red';
  }

  const activeColor = txType === 'borrow' ? colorPlus : colorMinus;
  let displayColor = 'var(--text-primary)';
  if (activeColor === 'action-blue') displayColor = 'var(--accent-color)';
  if (activeColor === 'action-green') displayColor = 'var(--success-color)';
  if (activeColor === 'action-red') displayColor = 'var(--danger-color)';

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
            className={`toggle-btn ${colorPlus} ${txType === 'borrow' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setTxType('borrow'); }}
          >
            {labelPlus}
          </div>
          <div 
            className={`toggle-btn ${colorMinus} ${txType === 'payback' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setTxType('payback'); }}
          >
            {labelMinus}
          </div>
        </div>

        <div className="amount-display" style={{ color: displayColor }}>
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
