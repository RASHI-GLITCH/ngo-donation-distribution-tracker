import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NGO {
  id: string;
  name: string;
  description: string;
  mission: string;
  image: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  totalFundsReceived: number;
  totalFundsAllocated: number;
  category: string;
  website?: string;
  contact?: string;
}

export interface LocationInfo {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  address?: string;
}

export interface Expense {
  id: string;
  ngoId: string;
  amount: number;
  category: string;
  description: string;
  date: number;
  createdAt: Date;
  uploadedBy: string;
  receipt?: string;
  location?: LocationInfo;
}

interface NGOContextType {
  ngos: NGO[];
  expenses: Expense[];
  getNGOById: (id: string) => NGO | undefined;
  getNGOsByAdmin: (adminId: string) => NGO[];
  addExpense: (ngoId: string, amount: number, category: string, description: string, uploadedBy: string, location?: LocationInfo) => void;
  getNGOExpenses: (ngoId: string) => Expense[];
  updateNGOFunds: (ngoId: string, receivedAmount: number, allocatedAmount: number) => void;
  loading: boolean;
}

const NGOContext = createContext<NGOContextType | undefined>(undefined);

const NGOS_KEY = 'fundhub_ngos';
const EXPENSES_KEY = 'fundhub_expenses';

// Mock NGO data
const DEFAULT_NGOS: NGO[] = [
  {
    id: 'ngo_001',
    name: 'Education for All',
    description: 'Providing quality education to underprivileged children',
    mission: 'Empower children through education',
    image: '🎓',
    adminId: 'admin_001',
    adminEmail: 'admin@educationforall.org',
    adminName: 'Sarah Johnson',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Education',
    website: 'https://educationforall.org',
    contact: '+1-555-0101',
  },
  {
    id: 'ngo_002',
    name: 'Clean Water Initiative',
    description: 'Building wells and water purification systems in rural areas',
    mission: 'Ensure access to clean drinking water',
    image: '💧',
    adminId: 'admin_002',
    adminEmail: 'admin@cleanwater.org',
    adminName: 'Michael Chen',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Water & Sanitation',
    website: 'https://cleanwater.org',
    contact: '+1-555-0102',
  },
  {
    id: 'ngo_003',
    name: 'Healthcare Outreach',
    description: 'Providing medical services and health awareness in underserved communities',
    mission: 'Better health for all communities',
    image: '⚕️',
    adminId: 'admin_003',
    adminEmail: 'admin@healthcareoutreach.org',
    adminName: 'Dr. Priya Patel',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Healthcare',
    website: 'https://healthcareoutreach.org',
    contact: '+1-555-0103',
  },
  {
    id: 'ngo_004',
    name: 'Wildlife Conservation',
    description: 'Protecting endangered species and their habitats',
    mission: 'Preserve biodiversity for future generations',
    image: '🦁',
    adminId: 'admin_004',
    adminEmail: 'admin@wildlifeconservation.org',
    adminName: 'James Wilson',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Environment',
    website: 'https://wildlifeconservation.org',
    contact: '+1-555-0104',
  },
  {
    id: 'ngo_005',
    name: 'Women Empowerment',
    description: 'Skill development and economic empowerment for women',
    mission: 'Empower women for economic independence',
    image: '👩',
    adminId: 'admin_005',
    adminEmail: 'admin@womenempowerment.org',
    adminName: 'Maria Rodriguez',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Social Development',
    website: 'https://womenempowerment.org',
    contact: '+1-555-0105',
  },
  {
    id: 'ngo_006',
    name: 'Food Security Program',
    description: 'Fighting hunger and malnutrition in vulnerable populations',
    mission: 'Ensure no one goes hungry',
    image: '🍲',
    adminId: 'admin_006',
    adminEmail: 'admin@foodsecurity.org',
    adminName: 'Robert Thompson',
    totalFundsReceived: 0,
    totalFundsAllocated: 0,
    category: 'Food & Nutrition',
    website: 'https://foodsecurity.org',
    contact: '+1-555-0106',
  },
];

function getNGOs(): NGO[] {
  const stored = localStorage.getItem(NGOS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NGOS;
    }
  }
  return DEFAULT_NGOS;
}

function saveNGOs(ngos: NGO[]) {
  localStorage.setItem(NGOS_KEY, JSON.stringify(ngos));
}

function getExpenses(): Expense[] {
  const stored = localStorage.getItem(EXPENSES_KEY);
  if (!stored) return [];
  try {
    const data = JSON.parse(stored);
    return data.map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function NGOProvider({ children }: { children: React.ReactNode }) {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize NGOs
  useEffect(() => {
    const loadedNgos = getNGOs();

    // Ensure DEFAULT_NGOS are always in localStorage if empty
    if (!localStorage.getItem(NGOS_KEY)) {
      saveNGOs(DEFAULT_NGOS);
    }

    const loadedExpenses = getExpenses();

    setNgos(loadedNgos.length > 0 ? loadedNgos : DEFAULT_NGOS);
    setExpenses(loadedExpenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setLoading(false);
  }, []);

  const getNGOById = (id: string) => {
    return ngos.find((ngo) => ngo.id === id);
  };

  const getNGOsByAdmin = (adminId: string) => {
    return ngos.filter((ngo) => ngo.adminId === adminId);
  };

  const addExpense = (ngoId: string, amount: number, category: string, description: string, uploadedBy: string, location?: LocationInfo) => {
    const newExpense: Expense = {
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ngoId,
      amount,
      category,
      description,
      date: Date.now(),
      createdAt: new Date(),
      uploadedBy,
      location,
    };

    const updatedExpenses = [newExpense, ...expenses];
    saveExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
  };

  const getNGOExpenses = (ngoId: string) => {
    return expenses.filter((e) => e.ngoId === ngoId);
  };

  const updateNGOFunds = (ngoId: string, receivedAmount: number, allocatedAmount: number) => {
    const updatedNgos = ngos.map((ngo) => {
      if (ngo.id === ngoId) {
        return {
          ...ngo,
          totalFundsReceived: ngo.totalFundsReceived + receivedAmount,
          totalFundsAllocated: ngo.totalFundsAllocated + allocatedAmount,
        };
      }
      return ngo;
    });
    saveNGOs(updatedNgos);
    setNgos(updatedNgos);
  };

  const value: NGOContextType = {
    ngos,
    expenses,
    getNGOById,
    getNGOsByAdmin,
    addExpense,
    getNGOExpenses,
    updateNGOFunds,
    loading,
  };

  return <NGOContext.Provider value={value}>{children}</NGOContext.Provider>;
}

export function useNGO() {
  const context = useContext(NGOContext);
  if (context === undefined) {
    throw new Error('useNGO must be used within an NGOProvider');
  }
  return context;
}
