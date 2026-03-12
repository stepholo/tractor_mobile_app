
"use client";

import { useTractorData, SERVICE_CYCLE, SERVICE_KITS, TractorModel } from "@/app/lib/store";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wrench, AlertTriangle, CheckCircle2, RotateCcw, Clock, Settings2, PackageCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useState } from "react";

const SERVICE_INTERVAL = 250;
const ALERT_THRESHOLD = 50;

export default function ServicePage() {
  const { service, updateService, isLoaded } = useTractorData();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (!isLoaded) return <div className="p-8 text-center font-headline">Loading service data...</div>;

  // Defensive values for calculation to prevent errors with legacy data
  const currentHours = service?.currentEngineHours || 0;
  const lastHours = service?.lastServiceHours || 0;
  const lastIndex = typeof service?.lastServiceIndex === 'number' ? service.lastServiceIndex : 3;
  const tractorModel = service?.tractorModel || 'OTHER';

  const hoursSinceLast = currentHours - lastHours;
  const progressPercent = Math.min((hoursSinceLast / SERVICE_INTERVAL) * 100, 100);
  
  const isServiceDue = hoursSinceLast >= SERVICE_INTERVAL;
  const isServiceWarning = hoursSinceLast >= (SERVICE_INTERVAL - ALERT_THRESHOLD);

  // Cycle: Minor -> Major -> Minor -> Annual
  const nextIdx = (lastIndex + 1) % 4;
  const nextType = SERVICE_CYCLE[nextIdx] || 'Minor';

  const handleRecordService = () => {
    updateService({
      ...service,
      lastServiceHours: currentHours,
      lastServiceType: nextType,
      lastServiceIndex: nextIdx,
    });
    toast({ 
      title: "Service Recorded", 
      description: `${nextType} service logged at ${currentHours} hours.` 
    });
  };

  const handleManualHoursUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newHours = parseFloat(formData.get("currentHours") as string);
    if (!isNaN(newHours)) {
      updateService({ ...service, currentEngineHours: newHours });
      toast({ title: "Hours Updated", description: `Current engine hours set to ${newHours}.` });
    }
  };

  const handleModelUpdate = (model: TractorModel) => {
    updateService({ ...service, tractorModel: model });
    toast({ title: "Tractor Configured", description: `Model set to ${model}` });
  };

  // Safely check if tractorModel is one of the keys in SERVICE_KITS
  const kits = (tractorModel !== 'OTHER' && SERVICE_KITS[tractorModel as Exclude<TractorModel, 'OTHER'>]) 
    ? SERVICE_KITS[tractorModel as Exclude<TractorModel, 'OTHER'>][nextType] 
    : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Service Management</h1>
          <p className="text-muted-foreground">Automated logging for {tractorModel} maintenance.</p>
        </div>
        
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Configure Tractor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tractor Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Tractor Model</Label>
                <Select value={tractorModel} onValueChange={(val) => handleModelUpdate(val as TractorModel)}>
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
              <p className="text-xs text-muted-foreground italic">
                The model determines the specific kits and lubricants suggested for each service type.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <div className="bg-primary h-1 w-full" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Service Status
            </CardTitle>
            <CardDescription>Track progression through the 4-step service cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Last Completed</p>
                <p className="text-xl font-headline font-bold">{(service?.lastServiceType || 'None')} @ {lastHours} hrs</p>
              </div>
              <div className="hidden md:block h-10 w-px bg-border" />
              <div className="text-left md:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Next Required</p>
                <p className="text-xl font-headline font-bold text-primary">{nextType} Service</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Maintenance Progress (250hr interval)</span>
                <span className={isServiceDue ? "text-destructive font-bold" : ""}>
                  {hoursSinceLast.toFixed(1)} / {SERVICE_INTERVAL}.0 hrs
                </span>
              </div>
              <Progress value={progressPercent} className="h-4" />
            </div>

            {isServiceDue ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <h4 className="font-bold text-lg text-destructive">MAINTENANCE OVERDUE!</h4>
                  <p className="text-sm opacity-90">Machine has exceeded the {SERVICE_INTERVAL}-hour limit. Perform {nextType} service immediately.</p>
                </div>
              </div>
            ) : isServiceWarning ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <h4 className="font-bold text-lg text-orange-600">Service Alert (Early Warning)</h4>
                  <p className="text-sm opacity-90">Approaching the {SERVICE_INTERVAL}-hour mark. Prepare for {nextType} service in {(SERVICE_INTERVAL - hoursSinceLast).toFixed(1)} hours.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-bold text-lg text-green-600">Operations Normal</h4>
                  <p className="text-sm opacity-90">Maintenance required in {(SERVICE_INTERVAL - hoursSinceLast).toFixed(1)} engine hours.</p>
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full py-8 text-xl shadow-lg font-headline" 
              onClick={handleRecordService}
              variant={isServiceWarning || isServiceDue ? "default" : "outline"}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Record {nextType} Service Now
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden bg-black text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <PackageCheck className="w-5 h-5" />
                Kits & Lubricants
              </CardTitle>
              <CardDescription className="text-gray-400">Requirements for next {nextType} service.</CardDescription>
            </CardHeader>
            <CardContent>
              {kits ? (
                <ul className="space-y-2">
                  {kits.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-gray-500">Configure tractor model to view specific parts list.</p>
              )}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Model Applied</p>
                <p className="text-sm font-medium">{tractorModel}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Quick Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualHoursUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentHours">Current Engine Hours</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      step="0.1" 
                      id="currentHours" 
                      name="currentHours" 
                      defaultValue={currentHours} 
                    />
                    <Button type="submit" variant="secondary">Set</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
