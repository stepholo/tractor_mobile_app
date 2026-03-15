
"use client";

import { useTractorData } from "@/app/lib/store";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Tractor, 
  BadgeDollarSign, 
  BarChart3, 
  History,
  TrendingUp,
  LandPlot,
  HandCoins,
  User,
  AlertCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  const { operations, service, profile, isLoaded } = useTractorData();

  if (!isLoaded) return <div className="flex items-center justify-center h-screen font-headline">Loading Dashboard...</div>;

  const totalAcres = operations.reduce((acc, op) => acc + (op.acres || 0), 0);
  const totalRevenue = operations.reduce((acc, op) => acc + (op.totalRevenueCollected || 0), 0);
  const totalRentalFees = operations.reduce((acc, op) => acc + (op.totalRentalFee || 0), 0);
  const totalExpenses = operations.reduce((acc, op) => acc + (op.totalExpenses || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgProfitPerAcre = totalAcres > 0 ? netProfit / totalAcres : 0;

  const implementDataMap = operations.reduce((acc: any, op) => {
    const name = op.implement || 'Unknown';
    if (!acc[name]) acc[name] = { name, acres: 0, profit: 0 };
    acc[name].acres += (op.acres || 0);
    acc[name].profit += (op.netProfit || 0);
    return acc;
  }, {});
  const implementData = Object.values(implementDataMap);
  const recentOps = operations.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">
              {profile.name || "Tractor Owner"}
            </span>
          </div>
          <h1 className="text-3xl font-bold font-headline">
            {profile.tractorModel || "My Tractor"} Overview
          </h1>
          <p className="text-muted-foreground">Operational performance in Kenya Shillings.</p>
        </div>

        {!profile.isOnboarded && (
          <Card className="bg-destructive/10 border-destructive/20 p-4 max-w-sm">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Profile Incomplete</p>
                <p className="text-xs text-muted-foreground">Please complete your profile in settings to enable all features.</p>
                <Button asChild size="sm" variant="destructive" className="w-full">
                  <Link href="/settings">Complete Profile</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenue Collected" 
          value={`KSh ${totalRevenue.toLocaleString()}`} 
          icon={<HandCoins className="w-5 h-5" />} 
          description="Actual cash received"
        />
        <StatCard 
          title="Net Profit" 
          value={`KSh ${netProfit.toLocaleString()}`} 
          icon={<BadgeDollarSign className="w-5 h-5" />} 
          description="Revenue - All Expenses"
        />
        <StatCard 
          title="Rental Value" 
          value={`KSh ${totalRentalFees.toLocaleString()}`} 
          icon={<TrendingUp className="w-5 h-5" />} 
          description="Standard equipment fee"
        />
        <StatCard 
          title="Total Acres" 
          value={totalAcres.toFixed(2)} 
          icon={<LandPlot className="w-5 h-5" />} 
          description="Area covered to date"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Profit by Implement (KSh)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {implementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={implementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`KSh ${value.toLocaleString()}`, 'Profit']}
                  />
                  <Bar dataKey="profit" fill="#FF7F00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOps.length > 0 ? (
                recentOps.map((op) => (
                  <div key={op.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex flex-col">
                      <span className="font-semibold">{op.implement || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">{op.date ? format(new Date(op.date), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-primary">KSh {(op.totalRevenueCollected || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{(op.acres || 0).toFixed(2)} Acres</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">No records found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-black text-white p-6 col-span-1 md:col-span-1 flex flex-col justify-between">
           <div>
             <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Efficiency Check</h3>
             <p className="text-lg font-headline">
               {avgProfitPerAcre < 1000 ? "Operating with tight margins." : "Operating at healthy margins."}
             </p>
           </div>
           <div className="mt-4 flex items-center gap-2">
             <Tractor className="text-primary w-5 h-5" />
             <span className="text-sm font-medium">Avg KSh {avgProfitPerAcre.toLocaleString(undefined, { maximumFractionDigits: 0 })}/Ac Net</span>
           </div>
        </Card>
        
        <Card className="border-none shadow-md p-6 col-span-1 md:col-span-2 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-muted-foreground text-sm font-medium">Engine Usage</h3>
            <p className="text-2xl font-bold font-headline">
              {service.currentEngineHours?.toFixed(1) || "0.0"} Total Hours
            </p>
            <p className="text-xs text-muted-foreground">Tracked via daily work logs</p>
          </div>
          <div className="relative w-16 h-16">
             <svg className="w-full h-full" viewBox="0 0 36 36">
               <path
                 className="text-secondary stroke-current"
                 strokeWidth="3"
                 fill="none"
                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               />
               <path
                 className="text-primary stroke-current"
                 strokeWidth="3"
                 strokeDasharray={`${(((service.currentEngineHours || 0) % 250) / 250) * 100}, 100`}
                 strokeLinecap="round"
                 fill="none"
                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
               {Math.round((((service.currentEngineHours || 0) % 250) / 250) * 100)}%
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
