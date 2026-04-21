import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDebtContext } from '../store/DebtContext';
import { useLanguage } from '../store/LanguageContext';
import { BottomSheet } from '../components/BottomSheet';
import { AddTransactionSheet } from '../components/AddTransactionSheet';
import { TransactionItem } from '../components/TransactionItem';
import { ChevronLeft, Plus, Settings, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const DetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { people, transactions, getPersonBalance, deleteTransaction, deletePerson } = useDebtContext();
  const { t } = useLanguage();
  
  const person = people.find(p => p.id === id);
  const personTransactions = transactions.filter(t => t.personId === id).sort((a, b) => b.date - a.date);
  const balance = id ? getPersonBalance(id) : 0;
  
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [addTxDefaultType, setAddTxDefaultType] = useState<'borrow' | 'payback'>('borrow');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!person) {
    return <div className="p-4">{t('personNotFound')}</div>;
  }

  const handleDeletePerson = () => {
    triggerHaptic('medium');
    if (window.confirm(t('deletePersonConfirm'))) {
      deletePerson(person.id);
      triggerHaptic('success');
      navigate('/');
    }
  };

  let balanceColor = 'var(--text-primary)';
  if (balance > 0) balanceColor = 'var(--danger-color)';
  else if (balance < 0) balanceColor = 'var(--success-color)';

  return (
    <div className="flex-col animate-scale-in" style={{ height: '100%' }}>
      <header className="app-header flex items-center justify-between" style={{ paddingBottom: '20px' }}>
        <button 
          onClick={() => { triggerHaptic('light'); navigate('/'); }} 
          className="flex items-center text-secondary"
        >
          <ChevronLeft size={28} color="var(--accent-color)" />
          <span style={{ color: 'var(--accent-color)', fontSize: '17px' }}>{t('back')}</span>
        </button>
        <h3 style={{ fontSize: '18px' }}>{person.name}</h3>
        <button onClick={() => { triggerHaptic('light'); setIsSettingsOpen(true); }}>
          <Settings size={24} color="var(--accent-color)" />
        </button>
      </header>

      <div className="scroll-container">
        {/* Balance Card */}
        <div className="flex-col items-center justify-center py-4 mb-4">
          <span className="text-secondary" style={{ marginBottom: '8px' }}>
            {t('balance')}
          </span>
          <div 
            style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: balanceColor,
              lineHeight: 1
            }}
          >
            {balance > 0 ? '+' : ''}{balance.toLocaleString()}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: '20px' }}>{t('history')}</h3>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {personTransactions.length === 0 ? (
            <div className="p-4 text-center text-secondary text-sm">
              {t('noTransactionsYet')}
            </div>
          ) : (
            personTransactions.map((tx, index) => (
              <div key={tx.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-scale-in">
                <TransactionItem 
                  transaction={tx} 
                  onDelete={() => { triggerHaptic('medium'); deleteTransaction(tx.id); }} 
                />
              </div>
            ))
          )}
        </div>
      </div>

      <button className="fab" onClick={() => { triggerHaptic('medium'); setAddTxDefaultType('borrow'); setIsAddTxOpen(true); }}>
        <Plus size={28} />
      </button>

      <AddTransactionSheet 
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        defaultPersonId={person.id}
        defaultType={addTxDefaultType}
      />

      {/* Settings Bottom Sheet */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={t('personOptions')}
      >
        <div className="flex-col gap-4 mt-4">
          <button 
            className="btn-primary flex justify-center items-center gap-2" 
            style={{ backgroundColor: 'rgba(255, 69, 58, 0.1)', color: 'var(--danger-color)' }}
            onClick={handleDeletePerson}
          >
            <Trash2 size={20} />
            {t('deletePerson')}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
