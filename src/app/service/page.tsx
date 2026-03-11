
"use client";

import { useTractorData, ServiceType } from "@/app/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wrench, AlertTriangle, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function ServicePage() {
  const { service, updateService, isLoaded } = useTractorData();

  if (!isLoaded) return <div className="p-8">Loading service data...</div>;

  const hoursSinceLast = service.currentEngineHours - service.lastServiceHours;
  const progressPercent = Math.min((hoursSinceLast / 50) * 100, 100);
  const isServiceDue = hoursSinceLast >= 50;

  const nextServiceTypes: ServiceType[] = ['Minor', 'Major', 'Annual'];
  const currentIdx = nextServiceTypes.indexOf(service.lastServiceType);
  const nextType = nextServiceTypes[(currentIdx + 1) % 3];

  const handleRecordService = () => {
    updateService({
      ...service,
      lastServiceHours: service.currentEngineHours,
      lastServiceType: nextType,
    });
    toast({ title: "Service Recorded", description: `${nextType} service logged at ${service.currentEngineHours} hours.` });
  };

  const handleManualHoursUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newHours = parseFloat(formData.get("currentHours") as string);
    updateService({ ...service, currentEngineHours: newHours });
    toast({ title: "Hours Updated", description: `Current engine hours set to ${newHours}.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Service Management</h1>
          <p className="text-muted-foreground">Keep your machinery in peak condition.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Last Service</p>
                <p className="text-2xl font-headline font-bold">{service.lastServiceType} @ {service.lastServiceHours} hrs</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Next Recommended</p>
                <p className="text-2xl font-headline font-bold text-primary">{nextType} Service</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Progress to next service</span>
                <span>{hoursSinceLast.toFixed(1)} / 50.0 hrs</span>
              </div>
              <Progress value={progressPercent} className="h-4 bg-secondary" />
            </div>

            {isServiceDue ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-bold text-lg">Maintenance Due!</h4>
                  <p className="text-sm opacity-90">Tractor has exceeded the 50-hour service interval. Perform a <strong>{nextType}</strong> service immediately.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-bold text-lg">System Optimal</h4>
                  <p className="text-sm opacity-90">Next maintenance is required in {(50 - hoursSinceLast).toFixed(1)} hours.</p>
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full py-8 text-xl shadow-lg" 
              onClick={handleRecordService}
              variant={isServiceDue ? "default" : "outline"}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Record {nextType} Service Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Machine Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleManualHoursUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentHours">Update Engine Hours</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    step="0.1" 
                    id="currentHours" 
                    name="currentHours" 
                    defaultValue={service.currentEngineHours} 
                  />
                  <Button type="submit" variant="secondary">Update</Button>
                </div>
              </div>
            </form>

            <div className="pt-4 border-t space-y-4">
              <h4 className="text-sm font-bold uppercase text-muted-foreground">Maintenance History</h4>
              <div className="space-y-2">
                 <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span>Minor Service</span>
                    <span className="text-muted-foreground">250.5 hrs</span>
                 </div>
                 <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span>Major Service</span>
                    <span className="text-muted-foreground">200.0 hrs</span>
                 </div>
                 <p className="text-xs text-center text-muted-foreground italic mt-2 underline cursor-pointer">View Full History</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
