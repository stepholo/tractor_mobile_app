
"use client";

import { useState, useEffect } from 'react';

export type ServiceType = 'Minor' | 'Major' | 'Annual';

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
  mpesaCode: string;
  // Computed fields
  totalExpenses: number;
  netProfit: number;
  profitPerAcre: number;
  fuelCostPerAcre: number;
}

export interface ServiceState {
  lastServiceHours: number;
  lastServiceType: ServiceType;
  currentEngineHours: number;
}

const STORAGE_KEY_OPERATIONS = 'tractor_operations_v1';
const STORAGE_KEY_SERVICE = 'tractor_service_v1';

export function useTractorData() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [service, setService] = useState<ServiceState>({
    lastServiceHours: 0,
    lastServiceType: 'Minor',
    currentEngineHours: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedOps = localStorage.getItem(STORAGE_KEY_OPERATIONS);
    const storedService = localStorage.getItem(STORAGE_KEY_SERVICE);

    if (storedOps) {
      setOperations(JSON.parse(storedOps));
    }
    if (storedService) {
      setService(JSON.parse(storedService));
    }
    setIsLoaded(true);
  }, []);

  const saveOperations = (newOps: Operation[]) => {
    setOperations(newOps);
    localStorage.setItem(STORAGE_KEY_OPERATIONS, JSON.stringify(newOps));
    
    // Auto-update engine hours from the latest log
    if (newOps.length > 0) {
      const maxHours = Math.max(...newOps.map(o => o.engineHours));
      if (maxHours > service.currentEngineHours) {
        updateService({ ...service, currentEngineHours: maxHours });
      }
    }
  };

  const updateService = (newService: ServiceState) => {
    setService(newService);
    localStorage.setItem(STORAGE_KEY_SERVICE, JSON.stringify(newService));
  };

  const addOperation = (op: Omit<Operation, 'id' | 'revenue' | 'totalExpenses' | 'netProfit' | 'profitPerAcre' | 'fuelCostPerAcre'>) => {
    const revenue = op.costPerAcre * op.acres;
    const totalExpenses = op.fuelCost + op.laborCost + op.repairCost;
    const netProfit = revenue - totalExpenses;
    const profitPerAcre = op.acres > 0 ? netProfit / op.acres : 0;
    const fuelCostPerAcre = op.acres > 0 ? op.fuelCost / op.acres : 0;

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

  const deleteOperation = (id: string) => {
    const newOps = operations.filter(o => o.id !== id);
    saveOperations(newOps);
  };

  const editOperation = (id: string, updated: Partial<Operation>) => {
    const newOps = operations.map(o => {
      if (o.id === id) {
        const merged = { ...o, ...updated };
        const revenue = merged.costPerAcre * merged.acres;
        const totalExpenses = merged.fuelCost + merged.laborCost + merged.repairCost;
        const netProfit = revenue - totalExpenses;
        const profitPerAcre = merged.acres > 0 ? netProfit / merged.acres : 0;
        const fuelCostPerAcre = merged.acres > 0 ? merged.fuelCost / merged.acres : 0;
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

  return {
    operations,
    service,
    isLoaded,
    addOperation,
    deleteOperation,
    editOperation,
    updateService,
  };
}
