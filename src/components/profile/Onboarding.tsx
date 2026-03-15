
"use client";

import { useState, useEffect } from "react";
import { useTractorData, TractorModel, ServiceType, SERVICE_CYCLE } from "@/app/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tractor, Clock, Wrench } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Onboarding() {
  const { profile, updateProfile, isLoaded } = useTractorData();
  const [isOpen, setIsOpen] = useState(false);
  
  // Profile state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState<TractorModel>("NEW HOLLAND");
  const [repaymentRate, setRepaymentRate] = useState("2500");

  // Service state
  const [currentHours, setCurrentHours] = useState("");
  const [lastServiceHours, setLastServiceHours] = useState("");
  const [lastServiceType, setLastServiceType] = useState<ServiceType>("Annual");

  useEffect(() => {
    if (isLoaded && !profile.name) {
      setIsOpen(true);
    }
  }, [isLoaded, profile.name]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && model) {
      const cHours = parseFloat(currentHours) || 0;
      const lHours = parseFloat(lastServiceHours) || 0;
      const lIdx = SERVICE_CYCLE.indexOf(lastServiceType);

      updateProfile({ 
        name, 
        phone, 
        tractorModel: model, 
        defaultRepaymentRate: parseFloat(repaymentRate) || 2500 
      }, {
        currentEngineHours: cHours,
        lastServiceHours: lHours,
        lastServiceType: lastServiceType,
        lastServiceIndex: lIdx === -1 ? 3 : lIdx
      });
      
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Tractor className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Welcome to Tractor Pro</DialogTitle>
          <DialogDescription className="text-center">
            Set up your profile to manage farm operations and track service cycles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Tractor className="w-4 h-4" />
              Tractor & Owner Info
            </h3>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="e.g., 0712345678" 
                type="tel" 
                required 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tractor Model</Label>
                <Select value={model} onValueChange={(v) => setModel(v as TractorModel)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW HOLLAND">New Holland</SelectItem>
                    <SelectItem value="CASE IH">Case IH</SelectItem>
                    <SelectItem value="JOHN DEERE">John Deere</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repaymentRate">Repayment Rate (KSh/Ac)</Label>
                <Input 
                  id="repaymentRate" 
                  type="number" 
                  required 
                  value={repaymentRate} 
                  onChange={(e) => setRepaymentRate(e.target.value)}
                  placeholder="2500"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Service & Hours History
            </h3>
            <div className="space-y-2">
              <Label htmlFor="currentHours">Current Total Engine Hours</Label>
              <Input 
                id="currentHours" 
                type="number" 
                step="0.1" 
                placeholder="0.0" 
                required 
                value={currentHours} 
                onChange={(e) => setCurrentHours(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last Service Done</Label>
                <Select value={lastServiceType} onValueChange={(v) => setLastServiceType(v as ServiceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minor">Minor Service</SelectItem>
                    <SelectItem value="Major">Major Service</SelectItem>
                    <SelectItem value="Annual">Annual Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastServiceHours">Hours @ Last Service</Label>
                <Input 
                  id="lastServiceHours" 
                  type="number" 
                  step="0.1" 
                  placeholder="0.0" 
                  required 
                  value={lastServiceHours} 
                  onChange={(e) => setLastServiceHours(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              * This data initializes your maintenance alerts and kit suggestions.
            </p>
          </div>

          <Button type="submit" className="w-full py-6 text-lg">
            Complete Setup
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
