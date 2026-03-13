
"use client";

import { useState, useEffect } from 'react';

export type ServiceType = 'Minor' | 'Major' | 'Annual';
export type TractorModel = 'NEW HOLLAND' | 'CASE IH' | 'JOHN DEERE' | 'OTHER';

export const SERVICE_CYCLE: ServiceType[] = ['Minor', 'Major', 'Minor', 'Annual'];

export interface UserProfile {
  name: string;
  phone: string;
  tractorModel: TractorModel;
  defaultRepaymentRate: number;
}

export interface Operation {
  id: string;
  date: string;
  engineHours: number;
  fuelCost: number;
  laborCost: number;
  repairCost: number;
  implement: string;
  acres: number;
  costPerAcre: number;
  revenue: number;
  amountPaid: number;
  totalExpenses: number;
  netProfit: number;
  profitPerAcre: number;
  fuelCostPerAcre: number;
}

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  mpesaCode: string;
}

export interface ServiceState {
  lastServiceHours: number;
  lastServiceType: ServiceType;
  lastServiceIndex: number; // Index in SERVICE_CYCLE (0-3)
  currentEngineHours: number;
  tractorModel: TractorModel;
}

const DEFAULT_SERVICE_STATE: ServiceState = {
  lastServiceHours: 0,
  lastServiceType: 'Annual',
  lastServiceIndex: 3,
  currentEngineHours: 0,
  tractorModel: 'OTHER',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  phone: '',
  tractorModel: 'OTHER',
  defaultRepaymentRate: 2500, // Common default in Kenya
};

export const IMPLEMENT_RATES: Record<string, number | 'default'> = {
  'Ploughing': 'default',
  'Disc Plough': 'default',
  'Rotavator': 'default',
  'Harrowing': 650,
  'Furrowing': 650,
  'Planting': 650,
  'Spraying': 380,
  'Spreading': 500,
  'Ridging': 800,
  'Ripping': 800,
  'Chisel': 800,
  'Other': 0
};

export const SERVICE_KITS: Record<Exclude<TractorModel, 'OTHER'>, Record<ServiceType, string[]>> = {
  'NEW HOLLAND': {
    'Minor': ['Air Filter (Outer)', 'Engine Oil Filter', '2 Fuel Filters', '10L Engine Oil 15W40'],
    'Major': ['Air Filter (Inner & Outer)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40'],
    'Annual': ['Air Filter (Inner & Outer)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40', 'Hydraulic Oil 40L 10W30', 'Front Gear Oil 85W90 10L', 'Rear Gear Oil 85W140 20L']
  },
  'CASE IH': {
    'Minor': ['Air Filter (Outer)', 'Engine Oil Filter', '2 Fuel Filters', '10L Engine Oil 15W40'],
    'Major': ['Air Filter (Inner & Outer)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40'],
    'Annual': ['Air Filter (Full Set)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40', 'Hydraulic Oil 40L 10W30', 'Front reduction Gear Oil 85W90 10L', 'Rear reduction Gear Oil 85W140 20L']
  },
  'JOHN DEERE': {
    'Minor': ['Primary Air Filter', 'Secondary Air Filter', 'Primary Fuel Filter', 'Secondary Fuel Filter', 'Engine Oil Filter', '10L Engine oil 15W40'],
    'Major': ['Primary Air Filter', 'Secondary Air Filter', 'Primary Fuel Filter', 'Secondary Fuel Filter', 'Engine Oil Filter', 'Hydraulic Filter', '10L Engine oil 15W40'],
    'Annual': ['Primary Air Filter', 'Secondary Air Filter', 'Primary Fuel Filter', 'Secondary Fuel Filter', 'Engine Oil Filter', 'Hydraulic Filter', '10L Engine oil 15W40', 'Hydraulic Oil 40l 10W30', 'Front reduction Gear Oil & Front Axle Gear Oil 85W90 85W90 10L']
  }
};

const STORAGE_KEY_OPERATIONS = 'tractor_operations_v2';
const STORAGE_KEY_SERVICE = 'tractor_service_v2';
const STORAGE_KEY_PROFILE = 'tractor_profile_v2';
const STORAGE_KEY_LOANS = 'tractor_loans_v2';

export function useTractorData() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loans, setLoans] = useState<LoanPayment[]>([]);
  const [service, setService] = useState<ServiceState>(DEFAULT_SERVICE_STATE);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedOps = localStorage.getItem(STORAGE_KEY_OPERATIONS);
    const storedService = localStorage.getItem(STORAGE_KEY_SERVICE);
    const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const storedLoans = localStorage.getItem(STORAGE_KEY_LOANS);

    if (storedOps) {
      try {
        setOperations(JSON.parse(storedOps));
      } catch (e) {
        console.error("Failed to parse operations data", e);
      }
    }
    
    if (storedLoans) {
      try {
        setLoans(JSON.parse(storedLoans));
      } catch (e) {
        console.error("Failed to parse loans data", e);
      }
    }

    if (storedService) {
      try {
        const parsed = JSON.parse(storedService);
        setService({ ...DEFAULT_SERVICE_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to parse service data", e);
      }
    }

    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      } catch (e) {
        console.error("Failed to parse profile data", e);
      }
    }

    setIsLoaded(true);
  }, []);

  const saveOperations = (newOps: Operation[]) => {
    setOperations(newOps);
    localStorage.setItem(STORAGE_KEY_OPERATIONS, JSON.stringify(newOps));
    
    if (newOps.length > 0) {
      const maxHours = Math.max(...newOps.map(o => o.engineHours || 0));
      if (maxHours > (service?.currentEngineHours || 0)) {
        updateService({ ...service, currentEngineHours: maxHours });
      }
    }
  };

  const saveLoans = (newLoans: LoanPayment[]) => {
    setLoans(newLoans);
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(newLoans));
  };

  const updateService = (newService: ServiceState) => {
    setService(newService);
    localStorage.setItem(STORAGE_KEY_SERVICE, JSON.stringify(newService));
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(newProfile));
    updateService({ ...service, tractorModel: newProfile.tractorModel });
  };

  const addOperation = (op: Omit<Operation, 'id' | 'revenue' | 'totalExpenses' | 'netProfit' | 'profitPerAcre' | 'fuelCostPerAcre'>) => {
    const revenue = (op.costPerAcre || 0) * (op.acres || 0);
    const totalExpenses = (op.fuelCost || 0) + (op.laborCost || 0) + (op.repairCost || 0);
    const netProfit = revenue - totalExpenses;
    const profitPerAcre = op.acres > 0 ? netProfit / op.acres : 0;
    const fuelCostPerAcre = op.acres > 0 ? (op.fuelCost || 0) / op.acres : 0;

    const fullOp: Operation = {
      ...op,
      id: crypto.randomUUID(),
      revenue,
      totalExpenses,
      netProfit,
      profitPerAcre,
      fuelCostPerAcre,
    };

    const newOps = [fullOp, ...operations];
    saveOperations(newOps);
  };

  const addLoanPayment = (payment: Omit<LoanPayment, 'id'>) => {
    const fullPayment: LoanPayment = {
      ...payment,
      id: crypto.randomUUID(),
    };
    const newLoans = [fullPayment, ...loans];
    saveLoans(newLoans);
  };

  const deleteOperation = (id: string) => {
    const newOps = operations.filter(o => o.id !== id);
    saveOperations(newOps);
  };

  const deleteLoanPayment = (id: string) => {
    const newLoans = loans.filter(l => l.id !== id);
    saveLoans(newLoans);
  };

  const editOperation = (id: string, updated: Partial<Operation>) => {
    const newOps = operations.map(o => {
      if (o.id === id) {
        const merged = { ...o, ...updated };
        const revenue = (merged.costPerAcre || 0) * (merged.acres || 0);
        const totalExpenses = (merged.fuelCost || 0) + (merged.laborCost || 0) + (merged.repairCost || 0);
        const netProfit = revenue - totalExpenses;
        const profitPerAcre = merged.acres > 0 ? netProfit / merged.acres : 0;
        const fuelCostPerAcre = merged.acres > 0 ? (merged.fuelCost || 0) / merged.acres : 0;
        return {
          ...merged,
          revenue,
          totalExpenses,
          netProfit,
          profitPerAcre,
          fuelCostPerAcre
        };
      }
      return o;
    });
    saveOperations(newOps);
  };

  const editLoanPayment = (id: string, updated: Partial<LoanPayment>) => {
    const newLoans = loans.map(l => {
      if (l.id === id) {
        return { ...l, ...updated };
      }
      return l;
    });
    saveLoans(newLoans);
  };

  return {
    operations,
    loans,
    service,
    profile,
    isLoaded,
    addOperation,
    addLoanPayment,
    deleteOperation,
    deleteLoanPayment,
    editOperation,
    editLoanPayment,
    updateService,
    updateProfile,
  };
}
