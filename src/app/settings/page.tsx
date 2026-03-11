
"use client";

import { useTractorData } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Download, Trash2, Database, ShieldCheck, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { operations, isLoaded } = useTractorData();

  const exportToExcel = () => {
    if (operations.length === 0) {
      toast({ title: "No data", description: "Log some operations before exporting.", variant: "destructive" });
      return;
    }

    // Creating a CSV blob as a light spreadsheet export
    const headers = ["Date", "Implement", "Engine Hours", "Acres", "Revenue", "Fuel Cost", "Labor Cost", "Repair Cost", "Net Profit", "Cost/Acre"];
    const rows = operations.map(op => [
      op.date,
      op.implement,
      op.engineHours,
      op.acres,
      op.revenue,
      op.fuelCost,
      op.laborCost,
      op.repairCost,
      op.netProfit,
      op.costPerAcre
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tractor_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Complete", description: "Your operation data has been downloaded." });
  };

  const resetAllData = () => {
    if (confirm("DANGER: This will delete all records permanently. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Settings & Data</h1>
        <p className="text-muted-foreground">Manage your local database and exports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md overflow-hidden">
          <div className="bg-primary h-2 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Excel Data Export
            </CardTitle>
            <CardDescription>Download your operational history as a spreadsheet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total records available: <strong>{operations.length}</strong>
            </p>
            <Button size="lg" className="w-full" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Download Spreadsheet (.csv)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <div className="bg-black h-2 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Offline Storage
            </CardTitle>
            <CardDescription>Your data is stored locally on this device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <ShieldCheck className="w-8 h-8 text-green-500" />
              <div className="text-sm">
                <p className="font-bold">Secure Local Storage</p>
                <p className="text-muted-foreground">No data is sent to external servers.</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Backup to Cloud (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-destructive/20 shadow-md col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions related to your ledger records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Resetting will clear all daily operations and service history. This cannot be undone.
              </p>
              <Button variant="destructive" onClick={resetAllData}>
                Reset All Ledger Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8 opacity-40">
        <p className="text-xs uppercase tracking-widest font-bold">Tractor Ledger Pro v1.0.0</p>
        <p className="text-[10px] mt-1">Designed for professional agricultural management.</p>
      </div>
    </div>
  );
}
