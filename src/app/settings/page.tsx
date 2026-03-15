
"use client";

import { useTractorData, TractorModel } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Trash2, Smartphone, Bell, ShieldCheck, UserCircle, FileSpreadsheet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { exportToCsv } from "@/app/lib/export";

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
      defaultRepaymentRate: parseFloat(repaymentRate) || 2500,
      isOnboarded: true
    });
    toast({ title: "Profile Updated", description: "Your details have been saved." });
  };

  const requestNotifications = async () => {
    const status = await LocalNotifications.requestPermissions();
    if (status.display === 'granted') {
      toast({ title: "Notifications Enabled", description: "You will receive service alerts." });
    }
  };

  const handleFullExport = async () => {
    if (operations.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Date", "Implement", "Current Engine Hours", "Acres", 
      "Farmer Rate (KSh)", "Revenue Collected (KSh)", "Rental Fee (KSh)",
      "Fuel Cost (KSh)", "Labor Cost (KSh)", "Repair Cost (KSh)", "Net Profit (KSh)"
    ];
    
    const rows = operations.map(op => [
      op.date, op.implement, op.engineHours, (op.acres || 0).toFixed(2),
      op.farmerRate, op.totalRevenueCollected, op.totalRentalFee,
      op.fuelCost, op.laborCost, op.repairCost, op.netProfit
    ]);

    const meta = [
      ["Owner Name", profile.name],
      ["Phone", profile.phone],
      ["Tractor Model", profile.tractorModel],
      ["Export Type", "Full Backup (All Data)"],
      ["Export Date", new Date().toLocaleString()]
    ];

    await exportToCsv(`tractor_full_backup_${new Date().toISOString().split('T')[0]}.csv`, headers, rows, meta);
    toast({ title: "Export Complete" });
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
            <CardDescription>Required to enable logging features.</CardDescription>
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
                  <Label htmlFor="reRate">Default Rate</Label>
                  <Input id="reRate" type="number" value={repaymentRate} onChange={(e) => setRepaymentRate(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full">Update Profile</Button>
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
            <CardDescription className="text-gray-400">Export all operations to CSV. For filtered exports, use the buttons on the Operations or Loans pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full text-white border-white/20 h-12" onClick={handleFullExport}>
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              Download Full History
            </Button>
            <p className="text-[10px] text-center text-gray-500 italic">
              Downloads go to your phone's "Documents" folder.
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
