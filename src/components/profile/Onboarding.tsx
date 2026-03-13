
"use client";

import { useState, useEffect } from "react";
import { useTractorData, TractorModel } from "@/app/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tractor } from "lucide-react";

export function Onboarding() {
  const { profile, updateProfile, isLoaded } = useTractorData();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState<TractorModel>("NEW HOLLAND");
  const [repaymentRate, setRepaymentRate] = useState("2500");

  useEffect(() => {
    if (isLoaded && !profile.name) {
      setIsOpen(true);
    }
  }, [isLoaded, profile.name]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && model) {
      updateProfile({ 
        name, 
        phone, 
        tractorModel: model, 
        defaultRepaymentRate: parseFloat(repaymentRate) || 2500 
      });
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Tractor className="text-primary w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Welcome to Tractor Pro</DialogTitle>
          <DialogDescription className="text-center">
            Set up your profile to manage farm operations and loan repayments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
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
          <div className="space-y-2">
            <Label>Tractor Model</Label>
            <Select value={model} onValueChange={(v) => setModel(v as TractorModel)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW HOLLAND">New Holland</SelectItem>
                <SelectItem value="CASE IH">Case IH</SelectItem>
                <SelectItem value="JOHN DEERE">John Deere</SelectItem>
                <SelectItem value="OTHER">Other / Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="repaymentRate">Default Repayment Rate (KSh/Acre)</Label>
            <Input 
              id="repaymentRate" 
              type="number" 
              required 
              value={repaymentRate} 
              onChange={(e) => setRepaymentRate(e.target.value)}
              placeholder="2500"
            />
            <p className="text-[10px] text-muted-foreground">Used for Ploughing and Rotavation tasks.</p>
          </div>
          <Button type="submit" className="w-full py-6 text-lg">
            Complete Setup
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
