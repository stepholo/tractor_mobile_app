
"use client";

import { useTractorData, TractorModel, ServiceType, SERVICE_CYCLE } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Smartphone, Bell, ShieldCheck, UserCircle, FileSpreadsheet, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { exportToCsv } from "@/app/lib/export";

export default function SettingsPage() {
  const { operations, loans, profile, service, updateProfile, isLoaded } = useTractorData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState<TractorModel>("OTHER");
  const [repaymentRate, setRepaymentRate] = useState("2500");
  
  // Service-related states for profile update
  const [lastServiceType, setLastServiceType] = useState<ServiceType>("Annual");
  const [lastServiceHours, setLastServiceHours] = useState("");

  useEffect(() => {
    if (isLoaded && profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setModel(profile.tractorModel || "OTHER");
      setRepaymentRate(profile.defaultRepaymentRate?.toString() || "2500");
    }
    if (isLoaded && service) {
      setLastServiceType(service.lastServiceType || "Annual");
      setLastServiceHours(service.lastServiceHours?.toString() || "0");
    }
  }, [isLoaded, profile, service]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lIdx = SERVICE_CYCLE.indexOf(lastServiceType);
    
    updateProfile({ 
      name, 
      phone, 
      tractorModel: model, 
      defaultRepaymentRate: parseFloat(repaymentRate) || 2500,
      isOnboarded: true
    }, {
      lastServiceHours: parseFloat(lastServiceHours) || 0,
      lastServiceType: lastServiceType,
      lastServiceIndex: lIdx === -1 ? 3 : lIdx
    });
    
    toast({ title: "Profile Updated", description: "Your details and service history have been saved." });
  };

  const requestNotifications = async () => {
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') {
      toast({ title: "Notifications Enabled", description: "You will receive service alerts." });
    }
  };

  const handleFullExport = async () => {
    if (operations.length === 0 && loans.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Category", 
      "Date", 
      "Description", 
      "Acres/Units", 
      "Rate (KSh)", 
      "Total Revenue (KSh)", 
      "Total Expenses (KSh)", 
      "Net Profit (KSh)", 
      "Reference (Hrs/M-Pesa)"
    ];
    
    const opRows = operations.map(op => [
      "Operation Log", 
      op.date, 
      op.implement || "Field Work", 
      (op.acres || 0).toFixed(2),
      op.farmerRate, 
      op.totalRevenueCollected, 
      op.totalExpenses, 
      op.netProfit, 
      op.engineHours
    ]);

    const loanRows = loans.map(l => [
      "Loan Payment", 
      l.date, 
      "Tractor Loan Repayment", 
      "1", 
      l.amount, 
      "0", 
      "0", 
      `-${l.amount}`, 
      l.mpesaCode
    ]);

    const combinedRows = [...opRows, ...loanRows].sort((a, b) => 
      new Date(b[1] as string).getTime() - new Date(a[1] as string).getTime()
    );

    const meta = [
      ["Owner Name", profile.name],
      ["Phone", profile.phone],
      ["Tractor Model", profile.tractorModel],
      ["Export Type", "Full Master Backup (Ops + Loans)"],
      ["Export Date", new Date().toLocaleString()]
    ];

    await exportToCsv(
      `tractor_pro_master_backup_${new Date().toISOString().split('T')[0]}.csv`, 
      headers, 
      combinedRows, 
      meta
    );
    
    toast({ title: "Master Export Complete" });
  };

  const resetAllData = () => {
    if (confirm("DANGER: This will delete everything permanently. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!isLoaded) return <div className="p-8 text-center font-headline">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Account & Device</h1>
        <p className="text-muted-foreground">Manage profile, permissions, and data safety.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Owner Profile
            </CardTitle>
            <CardDescription>Update your tractor and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tractor Model</Label>
                  <Select value={model} onValueChange={(v) => setModel(v as TractorModel)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW HOLLAND">New Holland</SelectItem>
                      <SelectItem value="ZETOR">Zetor</SelectItem>
                      <SelectItem value="CASE IH">Case IH</SelectItem>
                      <SelectItem value="JOHN DEERE">John Deere</SelectItem>
                      <SelectItem value="OTHER">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reRate">Default Rate (KSh/Ac)</Label>
                  <Input id="reRate" type="number" value={repaymentRate} onChange={(e) => setRepaymentRate(e.target.value)} />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Service History
                </h3>
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
                      value={lastServiceHours} 
                      onChange={(e) => setLastServiceHours(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">Update Profile & History</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Device Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-bold">Service Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified when service is due.</p>
                </div>
              </div>
              <Button size="sm" onClick={requestNotifications}>Enable</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <div className="text-sm">
                <p className="font-bold">Device Storage</p>
                <p className="text-xs text-muted-foreground">Encryption and export access enabled.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden bg-black text-white">
          <div className="bg-primary h-2 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Download className="w-5 h-5" />
              Master Data Export
            </CardTitle>
            <CardDescription className="text-gray-400">Export all operations AND loan payments to a single CSV file for full backup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full text-white border-white/20 h-12" onClick={handleFullExport}>
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Download Full History
            </Button>
            <p className="text-[10px] text-center text-gray-500 italic">
              Contains unified logs of all field work and financial payments.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Clear Local Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="w-full" onClick={resetAllData}>
              Factory Reset App
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
