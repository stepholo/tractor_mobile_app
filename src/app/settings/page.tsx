
"use client";

import { useTractorData, TractorModel } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Database, ShieldCheck, UserCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { operations, profile, updateProfile, isLoaded } = useTractorData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState<TractorModel>("OTHER");
  const [repaymentRate, setRepaymentRate] = useState("2500");

  useEffect(() => {
    if (isLoaded && profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setModel(profile.tractorModel || "OTHER");
      setRepaymentRate(profile.defaultRepaymentRate?.toString() || "2500");
    }
  }, [isLoaded, profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
      name, 
      phone, 
      tractorModel: model, 
      defaultRepaymentRate: parseFloat(repaymentRate) || 2500 
    });
    toast({ title: "Profile Updated" });
  };

  const exportToExcel = () => {
    if (operations.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Date", "Implement", "Current Engine Hours", "Acres", 
      "Farmer Rate (KSh)", "Total Revenue (KSh)", "Amount Paid (KSh)", 
      "Fuel Cost (KSh)", "Labor Cost (KSh)", "Repair Cost (KSh)", "Net Profit (KSh)"
    ];
    
    const rows = operations.map(op => [
      op.date, op.implement, op.engineHours, op.acres.toFixed(2),
      op.costPerAcre, op.revenue, op.amountPaid || 0,
      op.fuelCost, op.laborCost, op.repairCost, op.netProfit
    ]);

    const metaInfo = [
      ["Owner Name", profile.name],
      ["Phone", profile.phone],
      ["Tractor Model", profile.tractorModel],
      ["Default Repayment Rate", profile.defaultRepaymentRate],
      ["Export Date", new Date().toLocaleString()],
      []
    ];

    const csvContent = [
      ...metaInfo.map(e => e.join(",")),
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tractor_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Downloaded" });
  };

  const resetAllData = () => {
    if (confirm("DANGER: This will delete everything permanently. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!isLoaded) return <div className="p-8 text-center font-headline">Loading Settings...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Settings & Data</h1>
        <p className="text-muted-foreground">Manage your profile and repayment defaults.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Owner Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tractor Model</Label>
                <Select value={model} onValueChange={(v) => setModel(v as TractorModel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW HOLLAND">New Holland</SelectItem>
                    <SelectItem value="CASE IH">Case IH</SelectItem>
                    <SelectItem value="JOHN DEERE">John Deere</SelectItem>
                    <SelectItem value="OTHER">Other / Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reRate">Default Repayment Rate (KSh/Acre)</Label>
                <Input id="reRate" type="number" value={repaymentRate} onChange={(e) => setRepaymentRate(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Save Profile Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <div className="bg-primary h-2 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              History includes {operations.length} operations.
            </p>
            <Button size="lg" className="w-full" onClick={exportToExcel}>
              Download CSV (.csv)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Storage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-500" />
              <div className="text-sm">
                <p className="font-bold">Privacy Enabled</p>
                <p className="text-muted-foreground">All data is encrypted locally.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={resetAllData}>
              Factory Reset Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
