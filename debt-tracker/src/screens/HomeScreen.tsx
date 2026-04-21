import React, { useState } from 'react';
import { useDebtContext } from '../store/DebtContext';
import { useLanguage } from '../store/LanguageContext';
import { PersonCard } from '../components/PersonCard';
import { BottomSheet } from '../components/BottomSheet';
import { AddTransactionSheet } from '../components/AddTransactionSheet';
import { Plus, Users, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '../utils/haptics';

export const HomeScreen: React.FC = () => {
  const { people, getPersonBalance, getTotalLent, addPerson, addTransaction, lastUsedPersonId } = useDebtContext();
  const { t, lang, setLang } = useLanguage();
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonNote, setNewPersonNote] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [initialAmountType, setInitialAmountType] = useState<'borrow' | 'payback'>('borrow');
  const [activeTab, setActiveTab] = useState<'they_owe_me' | 'i_owe_them'>('they_owe_me');
  const navigate = useNavigate();

  const netBalance = getTotalLent();

  const handleAddPerson = () => {
    if (!newPersonName.trim()) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('success');
    const personId = addPerson(newPersonName.trim(), newPersonNote.trim());
    
    const amountNum = parseInt(initialAmount || '0', 10);
    if (amountNum > 0) {
      const finalAmount = initialAmountType === 'borrow' ? amountNum : -amountNum;
      addTransaction(personId, finalAmount, t('initialBalance'));
    }

    setNewPersonName('');
    setNewPersonNote('');
    setInitialAmount('');
    setInitialAmountType('borrow');
    setIsAddPersonOpen(false);
  };

  const toggleLang = () => {
    triggerHaptic('light');
    setLang(lang === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className="flex-col animate-scale-in" style={{ height: '100%' }}>
      <header className="app-header">
        <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
          <h1>{t('appTitle')}</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}
            >
              <Globe size={18} />
              {lang.toUpperCase()}
            </button>
            <button 
              onClick={() => { triggerHaptic('light'); setIsAddPersonOpen(true); }}
              style={{ color: 'var(--accent-color)' }}
            >
              <Users size={24} />
            </button>
          </div>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--accent-color)', marginBottom: '0' }}>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('balance')}
          </span>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '4px' }}>
            {netBalance > 0 ? '+' : ''}{netBalance.toLocaleString()}
          </div>
        </div>
      </header>

      <div className="scroll-container" style={{ paddingTop: '20px' }}>
        
        <div className="tabs-container">
          <div 
            className={`tab-btn ${activeTab === 'they_owe_me' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setActiveTab('they_owe_me'); }}
          >
            {t('theyOweYou')}
          </div>
          <div 
            className={`tab-btn ${activeTab === 'i_owe_them' ? 'active' : ''}`}
            onClick={() => { triggerHaptic('light'); setActiveTab('i_owe_them'); }}
          >
            {t('youOweThem')}
          </div>
        </div>

        {people.length === 0 ? (
          <div className="flex-col items-center justify-center" style={{ height: '60%', color: 'var(--text-secondary)' }}>
            <Users size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>{t('noFriendsAdded')}</h3>
            <p className="text-sm" style={{ marginTop: '8px', textAlign: 'center' }}>
              {t('addPersonToStart')}
            </p>
          </div>
        ) : (
          <div className="list-container">
            {people.filter(p => {
              const bal = getPersonBalance(p.id);
              if (activeTab === 'they_owe_me') return bal >= 0;
              return bal < 0;
            }).map((person, index) => (
              <div key={person.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-scale-in">
                <PersonCard
                  person={person}
                  balance={getPersonBalance(person.id)}
                  onClick={() => { triggerHaptic('light'); navigate(`/person/${person.id}`); }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {people.length > 0 && (
        <button 
          className="fab" 
          onClick={() => { triggerHaptic('medium'); setIsQuickAddOpen(true); }}
          style={{ width: 'auto', padding: '0 24px', borderRadius: 'var(--radius-full)' }}
        >
          <Zap size={24} style={{ marginRight: '8px' }} />
          {t('quickAdd')}
        </button>
      )}

      {people.length === 0 && (
        <button className="fab" onClick={() => { triggerHaptic('light'); setIsAddPersonOpen(true); }}>
          <Plus size={28} />
        </button>
      )}

      <BottomSheet
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        title={t('addPerson')}
      >
        <div className="flex-col gap-4">
          <input
            type="text"
            placeholder={t('name')}
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
          />
          <input
            type="text"
            placeholder={t('noteOptional')}
            value={newPersonNote}
            onChange={(e) => setNewPersonNote(e.target.value)}
          />

          <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-secondary)' }}>{t('initialAmount')}</h4>
            
            <div className="amount-type-toggle" style={{ marginBottom: '12px' }}>
              <div 
                className={`toggle-btn borrow ${initialAmountType === 'borrow' ? 'active' : ''}`}
                onClick={() => { triggerHaptic('light'); setInitialAmountType('borrow'); }}
              >
                {t('theyOweMe')}
              </div>
              <div 
                className={`toggle-btn payback ${initialAmountType === 'payback' ? 'active' : ''}`}
                onClick={() => { triggerHaptic('light'); setInitialAmountType('payback'); }}
              >
                {t('iOweThem')}
              </div>
            </div>

            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}
            />

            <div className="numpad-quick" style={{ marginTop: '12px', justifyContent: 'center' }}>
              {[50000, 100000, 200000].map(amt => (
                <button 
                  key={amt} 
                  className="numpad-quick-btn"
                  onClick={() => {
                    triggerHaptic('light');
                    setInitialAmount(prev => (parseInt(prev || '0', 10) + amt).toString());
                  }}
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-primary mt-4" 
            onClick={handleAddPerson}
            disabled={!newPersonName.trim()}
            style={{ opacity: !newPersonName.trim() ? 0.5 : 1 }}
          >
            {t('save')}
          </button>
        </div>
      </BottomSheet>

      <AddTransactionSheet 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        defaultPersonId={lastUsedPersonId}
      />
    </div>
  );
};
