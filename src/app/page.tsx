
"use client";

import { useTractorData } from "@/app/lib/store";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Tractor, 
  Droplets, 
  BadgeDollarSign, 
  BarChart3, 
  History,
  TrendingUp,
  LandPlot
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

export default function Dashboard() {
  const { operations, service, isLoaded } = useTractorData();

  if (!isLoaded) return <div className="flex items-center justify-center h-screen font-headline">Loading Dashboard...</div>;

  const totalAcres = operations.reduce((acc, op) => acc + (op.acres || 0), 0);
  const totalRevenue = operations.reduce((acc, op) => acc + (op.revenue || 0), 0);
  const totalExpenses = operations.reduce((acc, op) => acc + (op.totalExpenses || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const avgProfitPerAcre = totalAcres > 0 ? netProfit / totalAcres : 0;
  const avgFuelPerAcre = totalAcres > 0 ? operations.reduce((acc, op) => acc + (op.fuelCost || 0), 0) / totalAcres : 0;

  // Implement Summary
  const implementDataMap = operations.reduce((acc: any, op) => {
    const name = op.implement || 'Unknown';
    if (!acc[name]) acc[name] = { name, acres: 0, profit: 0 };
    acc[name].acres += (op.acres || 0);
    acc[name].profit += (op.netProfit || 0);
    return acc;
  }, {});
  const implementData = Object.values(implementDataMap);

  // Recent Ops
  const recentOps = operations.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Operational Overview</h1>
        <p className="text-muted-foreground">Key metrics for your tractor operations in Kenya Shillings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Acres" 
          value={totalAcres.toFixed(2)} 
          icon={<LandPlot className="w-5 h-5" />} 
          description="Completed to date"
        />
        <StatCard 
          title="Net Profit" 
          value={`KSh ${netProfit.toLocaleString()}`} 
          icon={<BadgeDollarSign className="w-5 h-5" />} 
          description="Revenue - Expenses"
        />
        <StatCard 
          title="Avg Profit/Acre" 
          value={`KSh ${avgProfitPerAcre.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={<TrendingUp className="w-5 h-5" />} 
          description="Net efficiency"
        />
        <StatCard 
          title="Engine Hours" 
          value={(service.currentEngineHours || 0).toFixed(1)} 
          icon={<Tractor className="w-5 h-5" />} 
          description="Current reading"
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
                      <span className="font-bold text-primary">KSh {(op.revenue || 0).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{(op.acres || 0).toFixed(2)} Acres</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">No recent records found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-black text-white p-6 col-span-1 md:col-span-1 flex flex-col justify-between">
           <div>
             <h3 className="text-primary font-bold uppercase tracking-widest text-xs mb-2">Fuel Efficiency</h3>
             <p className="text-lg font-headline">
               {avgFuelPerAcre > 1500 ? "Fuel costs are higher than average." : "Efficiency is within optimal range."}
             </p>
           </div>
           <div className="mt-4 flex items-center gap-2">
             <Droplets className="text-primary w-5 h-5" />
             <span className="text-sm font-medium">KSh {avgFuelPerAcre.toLocaleString(undefined, { maximumFractionDigits: 0 })}/Acre Fuel</span>
           </div>
        </Card>
        
        <Card className="border-none shadow-md p-6 col-span-1 md:col-span-2 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-muted-foreground text-sm font-medium">Service Progress</h3>
            <p className="text-2xl font-bold font-headline">
              Next Service in {(250 - ((service.currentEngineHours || 0) % 250)).toFixed(1)} hrs
            </p>
            <p className="text-xs text-muted-foreground">Scheduled alert every 250 hours (Next at { (Math.floor((service.currentEngineHours || 0) / 250) + 1) * 250 } hrs)</p>
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
