import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo extends Coordinates {
  city?: string;
  country?: string;
  address?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  ngoId: string;
  ngoName: string;
  amount: number;
  currency: string;
  paymentMethod: 'razorpay' | 'direct';
  donationType: string;
  transactionId?: string;
  receiptUrl?: string;
  location?: LocationInfo;
  timestamp: number;
  createdAt: Date;
}

export interface ItemDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  ngoId: string;
  ngoName: string;
  itemType: string;
  description: string;
  quantity: string;
  quantityType: 'items' | 'kg' | 'liters';
  pickupOrDrop: 'pickup' | 'drop';
  donorAddress: string;
  donorPincode: string;
  preferredDate?: string;
  preferredTime?: string;
  status: 'pending' | 'confirmed' | 'received' | 'distributed';
  location?: LocationInfo;
  timestamp: number;
  createdAt: Date;
}

export interface FundAllocation {
  id: string;
  ngoAdminId: string;
  ngoAdminName: string;
  amount: number;
  currency: string;
  reason: string;
  timestamp: number;
  createdAt: Date;
}

interface DonationContextType {
  donations: Donation[];
  itemDonations: ItemDonation[];
  allocations: FundAllocation[];
  makeDonation: (ngoId: string, ngoName: string, amount: number, currency: string, paymentMethod: 'razorpay' | 'direct', donationType: string, transactionId?: string, location?: LocationInfo) => Promise<void>;
  makeItemDonation: (ngoId: string, ngoName: string, itemData: Omit<ItemDonation, 'id' | 'timestamp' | 'createdAt'>) => Promise<void>;
  updateItemDonationStatus: (itemDonationId: string, status: ItemDonation['status']) => void;
  allocateFunds: (amount: number, currency: string, reason: string) => Promise<void>;
  donorTotalDonations: (donorId: string) => number;
  donorDonationHistory: (donorId: string) => Donation[];
  ngoTotalDonations: (ngoId: string) => number;
  ngoTotalFunds: () => number;
  getDonationsByNGO: (ngoId: string) => Donation[];
  getItemDonationsByNGO: (ngoId: string) => ItemDonation[];
  loading: boolean;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

// Mock data keys
const DONATIONS_KEY = 'fundhub_donations';
const ITEM_DONATIONS_KEY = 'fundhub_item_donations';
const ALLOCATIONS_KEY = 'fundhub_allocations';

function getDonations(): Donation[] {
  const stored = localStorage.getItem(DONATIONS_KEY);
  if (!stored) return [];
  try {
    const data = JSON.parse(stored);
    return data.map((d: any) => ({
      ...d,
      createdAt: new Date(d.createdAt),
    }));
  } catch {
    return [];
  }
}

function getItemDonations(): ItemDonation[] {
  const stored = localStorage.getItem(ITEM_DONATIONS_KEY);
  if (!stored) return [];
  try {
    const data = JSON.parse(stored);
    return data.map((d: any) => ({
      ...d,
      createdAt: new Date(d.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveDonations(donations: Donation[]) {
  localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
}

function saveItemDonations(itemDonations: ItemDonation[]) {
  localStorage.setItem(ITEM_DONATIONS_KEY, JSON.stringify(itemDonations));
}

function getAllocations(): FundAllocation[] {
  const stored = localStorage.getItem(ALLOCATIONS_KEY);
  if (!stored) return [];
  try {
    const data = JSON.parse(stored);
    return data.map((a: any) => ({
      ...a,
      createdAt: new Date(a.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveAllocations(allocations: FundAllocation[]) {
  localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(allocations));
}

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  // Load mock data on mount
  useEffect(() => {
    const loadedDonations = getDonations();
    const loadedAllocations = getAllocations();
    
    setDonations(loadedDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setAllocations(loadedAllocations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    setLoading(false);
  }, []);

  const makeDonation = async (ngoId: string, ngoName: string, amount: number, currency: string, paymentMethod: 'razorpay' | 'direct', donationType: string, transactionId?: string, location?: LocationInfo) => {
    if (!user || !userData) throw new Error('User not authenticated');

    const newDonation: Donation = {
      id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      donorId: user.uid,
      donorName: userData.displayName,
      donorEmail: userData.email,
      ngoId,
      ngoName,
      amount,
      currency,
      paymentMethod,
      donationType,
      transactionId,
      receiptUrl: `/receipt/${Date.now()}`,
      location,
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    const updatedDonations = [newDonation, ...donations];
    saveDonations(updatedDonations);
    setDonations(updatedDonations);
  };

  const allocateFunds = async (amount: number, currency: string, reason: string) => {
    if (!user || !userData) throw new Error('User not authenticated');

    const newAllocation: FundAllocation = {
      id: `allocation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ngoAdminId: user.uid,
      ngoAdminName: userData.displayName,
      amount,
      currency,
      reason,
      timestamp: Date.now(),
      createdAt: new Date(),
    };

    const updatedAllocations = [newAllocation, ...allocations];
    saveAllocations(updatedAllocations);
    setAllocations(updatedAllocations);
  };

  const donorTotalDonations = (donorId: string): number => {
    return donations
      .filter((d) => d.donorId === donorId)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const donorDonationHistory = (donorId: string): Donation[] => {
    return donations.filter((d) => d.donorId === donorId);
  };

  const ngoTotalDonations = (ngoId: string): number => {
    return donations
      .filter((d) => d.ngoId === ngoId)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getDonationsByNGO = (ngoId: string): Donation[] => {
    return donations.filter((d) => d.ngoId === ngoId);
  };

  const ngoTotalFunds = (): number => {
    return allocations.reduce((sum, a) => sum + a.amount, 0);
  };

  const value: DonationContextType = {
    donations,
    allocations,
    makeDonation,
    allocateFunds,
    donorTotalDonations,
    donorDonationHistory,
    ngoTotalDonations,
    getDonationsByNGO,
    ngoTotalFunds,
    loading,
  };

  return (
    <DonationContext.Provider value={value}>{children}</DonationContext.Provider>
  );
}

export function useDonation() {
  const context = useContext(DonationContext);
  if (context === undefined) {
    throw new Error('useDonation must be used within a DonationProvider');
  }
  return context;
}
