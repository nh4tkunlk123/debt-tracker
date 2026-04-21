import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Person {
  id: string;
  name: string;
  note: string;
  avatar?: string;
}

export interface Transaction {
  id: string;
  personId: string;
  amount: number; // Positive means they borrow from me (they owe me), Negative means they pay me back
  note: string;
  date: number;
}

interface DebtContextType {
  people: Person[];
  transactions: Transaction[];
  addPerson: (name: string, note: string, avatar?: string) => string;
  deletePerson: (id: string) => void;
  addTransaction: (personId: string, amount: number, note: string) => void;
  deleteTransaction: (id: string) => void;
  getPersonBalance: (personId: string) => number;
  getTotalLent: () => number;
  lastUsedPersonId: string | null;
}

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export const useDebtContext = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebtContext must be used within a DebtProvider');
  }
  return context;
};

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('debt-people-v2');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('debt-records-v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [lastUsedPersonId, setLastUsedPersonId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('debt-people-v2', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('debt-records-v3', JSON.stringify(transactions));
  }, [transactions]);

  const addPerson = (name: string, note: string, avatar?: string) => {
    const id = uuidv4();
    const newPerson: Person = { id, name, note, avatar };
    setPeople((prev) => [...prev, newPerson]);
    return id;
  };

  const deletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    setTransactions((prev) => prev.filter((t) => t.personId !== id));
  };

  const addTransaction = (personId: string, amount: number, note: string) => {
    const newTx: Transaction = {
      id: uuidv4(),
      personId,
      amount,
      note,
      date: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setLastUsedPersonId(personId);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getPersonBalance = (personId: string) => {
    return transactions
      .filter((t) => t.personId === personId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalLent = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <DebtContext.Provider
      value={{
        people,
        transactions,
        addPerson,
        deletePerson,
        addTransaction,
        deleteTransaction,
        getPersonBalance,
        getTotalLent,
        lastUsedPersonId,
      }}
    >
      {children}
    </DebtContext.Provider>
  );
};
