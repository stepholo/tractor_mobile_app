
"use client";

import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export type ServiceType = 'Minor' | 'Major' | 'Annual';
export type TractorModel = 'NEW HOLLAND' | 'CASE IH' | 'JOHN DEERE' | 'ZETOR' | 'OTHER';

export const SERVICE_CYCLE: ServiceType[] = ['Minor', 'Major', 'Minor', 'Annual'];
export const ALERT_THRESHOLD = 50;

export function getServiceInterval(model: TractorModel) {
  switch (model) {
    case 'NEW HOLLAND':
    case 'CASE IH':
    case 'ZETOR':
      return 300;
    case 'JOHN DEERE':
      return 250;
    default:
      return 250;
  }
}

export interface UserProfile {
  name: string;
  phone: string;
  tractorModel: TractorModel;
  defaultRepaymentRate: number;
  isOnboarded: boolean;
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
  farmerRate: number;
  implementRate: number;
  totalRentalFee: number;
  totalRevenueCollected: number;
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
  lastServiceIndex: number;
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
  defaultRepaymentRate: 2500,
  isOnboarded: false,
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

const NEW_HOLLAND_ZETOR_KITS = {
  'Minor': ['Air Filter (Outer)', 'Engine Oil Filter', '2 Fuel Filters', '10L Engine Oil 15W40'],
  'Major': ['Air Filter (Inner & Outer)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40'],
  'Annual': ['Air Filter (Inner & Outer)', 'Engine Oil Filter', '2 Fuel Filters', 'Hydraulic Filter', '10L Engine Oil 15W40', 'Hydraulic Oil 40L 10W30', 'Front Gear Oil 85W90 10L', 'Rear Gear Oil 85W140 20L']
};

export const SERVICE_KITS: Record<Exclude<TractorModel, 'OTHER'>, Record<ServiceType, string[]>> = {
  'NEW HOLLAND': NEW_HOLLAND_ZETOR_KITS,
  'ZETOR': NEW_HOLLAND_ZETOR_KITS,
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

    if (storedOps) try { setOperations(JSON.parse(storedOps)); } catch (e) {}
    if (storedLoans) try { setLoans(JSON.parse(storedLoans)); } catch (e) {}
    if (storedService) try { setService({ ...DEFAULT_SERVICE_STATE, ...JSON.parse(storedService) }); } catch (e) {}
    if (storedProfile) try { setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(storedProfile) }); } catch (e) {}

    setIsLoaded(true);
  }, []);

  const checkServiceAlert = useCallback(
    async (
      currentHours: number,
      lastService: number,
      model: TractorModel = service.tractorModel
    ) => {
      const interval = getServiceInterval(model);
      const diff = currentHours - lastService;
      const remaining = interval - diff;

      if (remaining <= ALERT_THRESHOLD && remaining > 0) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Tractor Service Due Soon",
              body: `Your tractor is approaching its ${interval}hr service mark. Only ${remaining.toFixed(1)} hours remaining.`,
              id: 1,
              schedule: { at: new Date(Date.now() + 1000) },
              sound: 'default',
              attachments: [],
              actionTypeId: "",
              extra: null
            }
          ]
        });
      }
    },
    [service.tractorModel]
  );

  const updateService = (newService: ServiceState) => {
    setService(newService);
    localStorage.setItem(STORAGE_KEY_SERVICE, JSON.stringify(newService));
    checkServiceAlert(
      newService.currentEngineHours,
      newService.lastServiceHours,
      newService.tractorModel
    );
  };

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

  const updateProfile = (newProfile: UserProfile, initialService?: Partial<ServiceState>) => {
    const profileToSave = { ...newProfile, isOnboarded: true };
    setProfile(profileToSave);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profileToSave));

    const serviceUpdate = {
      ...service,
      tractorModel: newProfile.tractorModel,
      ...initialService
    };
    updateService(serviceUpdate);
  };

  const addOperation = (op: Omit<Operation, 'id' | 'totalRentalFee' | 'totalRevenueCollected' | 'totalExpenses' | 'netProfit' | 'profitPerAcre' | 'fuelCostPerAcre'>) => {
    const totalRentalFee = (op.implementRate || 0) * (op.acres || 0);
    const totalRevenueCollected = (op.farmerRate || 0) * (op.acres || 0);
    const totalExpenses = (op.fuelCost || 0) + (op.laborCost || 0) + (op.repairCost || 0) + totalRentalFee;
    const netProfit = totalRevenueCollected - totalExpenses;

    const fullOp: Operation = {
      ...op,
      id: crypto.randomUUID(),
      totalRentalFee,
      totalRevenueCollected,
      totalExpenses,
      netProfit,
      profitPerAcre: op.acres > 0 ? netProfit / op.acres : 0,
      fuelCostPerAcre: op.acres > 0 ? (op.fuelCost || 0) / op.acres : 0,
    };

    saveOperations([fullOp, ...operations]);
  };

  const addLoanPayment = (payment: Omit<LoanPayment, 'id'>) => {
    saveLoans([{ ...payment, id: crypto.randomUUID() }, ...loans]);
  };

  const deleteOperation = (id: string) => saveOperations(operations.filter(o => o.id !== id));
  const deleteLoanPayment = (id: string) => saveLoans(loans.filter(l => l.id !== id));

  const editOperation = (id: string, updated: Partial<Operation>) => {
    const newOps = operations.map(o => {
      if (o.id === id) {
        const m = { ...o, ...updated };
        const rental = (m.implementRate || 0) * (m.acres || 0);
        const revenue = (m.farmerRate || 0) * (m.acres || 0);
        const exp = (m.fuelCost || 0) + (m.laborCost || 0) + (m.repairCost || 0) + rental;
        const net = revenue - exp;
        return {
          ...m,
          totalRentalFee: rental,
          totalRevenueCollected: revenue,
          totalExpenses: exp,
          netProfit: net,
          profitPerAcre: m.acres > 0 ? net / m.acres : 0,
          fuelCostPerAcre: m.acres > 0 ? (m.fuelCost || 0) / m.acres : 0
        };
      }
      return o;
    });
    saveOperations(newOps);
  };

  const editLoanPayment = (id: string, updated: Partial<LoanPayment>) => {
    saveLoans(loans.map(l => l.id === id ? { ...l, ...updated } : l));
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
