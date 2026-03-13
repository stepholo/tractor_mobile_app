
"use client";

import { useState, useEffect } from "react";
import { useTractorData, Operation, IMPLEMENT_RATES } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Search, Info } from "lucide-react";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function OperationsPage() {
  const { operations, addOperation, deleteOperation, editOperation, profile, isLoaded } = useTractorData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOp, setEditingOp] = useState<Operation | null>(null);
  const [viewingOp, setViewingOp] = useState<Operation | null>(null);
  
  const [selectedImplement, setSelectedImplement] = useState<string>("");
  const [implementRate, setImplementRate] = useState<number>(0);
  const [farmerRate, setFarmerRate] = useState<number>(0);
  const [acres, setAcres] = useState<number>(0);

  useEffect(() => {
    if (editingOp) {
      setSelectedImplement(editingOp.implement);
      setImplementRate(editingOp.implementRate || 0);
      setFarmerRate(editingOp.farmerRate || 0);
      setAcres(editingOp.acres || 0);
    } else {
      setSelectedImplement("");
      setImplementRate(0);
      setFarmerRate(0);
      setAcres(0);
    }
  }, [editingOp]);

  if (!isLoaded) return <div className="p-8 font-headline text-center">Loading operations...</div>;

  const filteredOps = operations.filter(op => 
    (op.implement?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (op.date || "").includes(searchQuery)
  );

  const handleImplementChange = (val: string) => {
    setSelectedImplement(val);
    const mappedRate = IMPLEMENT_RATES[val];
    let autoPickedRate = 0;
    if (mappedRate === 'default') {
      autoPickedRate = profile.defaultRepaymentRate;
    } else if (typeof mappedRate === 'number') {
      autoPickedRate = mappedRate;
    }
    setImplementRate(autoPickedRate);
    // When implement changes, suggest the farmer rate too, but keep it editable
    if (!editingOp) {
      setFarmerRate(autoPickedRate);
    }
  };

  const handleOpenNew = () => {
    setEditingOp(null);
    setSelectedImplement("");
    setImplementRate(0);
    setFarmerRate(0);
    setAcres(0);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (op: Operation) => {
    setEditingOp(op);
    setIsDialogOpen(true);
  };

  const handleOpenView = (op: Operation) => {
    setViewingOp(op);
    setIsViewOpen(true);
  };

  const calculatedFee = (farmerRate || 0) * (acres || 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      date: formData.get("date") as string,
      engineHours: parseFloat(formData.get("engineHours") as string) || 0,
      fuelCost: parseFloat(formData.get("fuelCost") as string) || 0,
      laborCost: parseFloat(formData.get("laborCost") as string) || 0,
      repairCost: parseFloat(formData.get("repairCost") as string) || 0,
      implement: selectedImplement || "Other",
      acres: acres,
      farmerRate: farmerRate,
      implementRate: implementRate,
    };

    if (editingOp) {
      editOperation(editingOp.id, data);
      setEditingOp(null);
      setIsDialogOpen(false);
      toast({ title: "Record updated" });
    } else {
      addOperation(data);
      setIsDialogOpen(false);
      toast({ title: "Record saved" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Operations Log</h1>
          <p className="text-muted-foreground">Manage and record daily farm activity.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingOp(null);
        }}>
          <Button onClick={handleOpenNew} size="lg" className="rounded-full shadow-lg h-14 w-full md:w-auto px-8">
            <Plus className="w-5 h-5 mr-2" />
            New Log Entry
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">
                {editingOp ? "Edit Log Entry" : "Log Daily Operation"}
              </DialogTitle>
              <DialogDescription>Fill in the details for today's farm work.</DialogDescription>
            </DialogHeader>
            <form key={editingOp?.id || 'new'} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" name="date" required defaultValue={editingOp?.date || new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Implement Used</Label>
                <Select value={selectedImplement} onValueChange={handleImplementChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select implement" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(IMPLEMENT_RATES).map(impl => (
                      <SelectItem key={impl} value={impl}>{impl}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Implement Rate (Reference - KSh/Acre)</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center font-medium italic">
                  KSh {(implementRate || 0).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineHours">Current Engine Hours</Label>
                <Input type="number" step="0.1" id="engineHours" name="engineHours" placeholder="0.0" required defaultValue={editingOp?.engineHours || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acres">Acres Completed</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  id="acres" 
                  name="acres" 
                  placeholder="0.00" 
                  required 
                  value={acres || ""} 
                  onChange={(e) => setAcres(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Farmer Rate (Job Price) (KSh/Acre)</Label>
                <Input 
                  type="number" 
                  value={farmerRate || ""} 
                  onChange={(e) => setFarmerRate(parseFloat(e.target.value) || 0)} 
                  placeholder="0" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Total Rental Fee (Autocalculated)</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-primary/10 flex items-center font-bold text-primary">
                  KSh {calculatedFee.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelCost">Fuel Cost (KSh)</Label>
                <Input type="number" step="1" id="fuelCost" name="fuelCost" placeholder="0" required defaultValue={editingOp?.fuelCost || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborCost">Operator & Booking Payments (KSh)</Label>
                <Input type="number" step="1" id="laborCost" name="laborCost" placeholder="0" required defaultValue={editingOp?.laborCost || ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="repairCost">Daily Mechanical Costs (KSh)</Label>
                <Input type="number" step="1" id="repairCost" name="repairCost" placeholder="0" defaultValue={editingOp?.repairCost || "0"} />
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" className="w-full py-6 text-lg">
                  {editingOp ? "Update Record" : "Save Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Operational Record Details</DialogTitle>
          </DialogHeader>
          {viewingOp && (
            <div className="space-y-3 py-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground font-medium">Date</span>
                <span className="font-bold">{viewingOp.date ? format(new Date(viewingOp.date), 'MMMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground font-medium">Implement</span>
                <span className="font-bold">{viewingOp.implement}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground font-medium">Acres Covered</span>
                <span className="font-bold">{(viewingOp.acres || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground font-medium">Farmer Rate</span>
                <span className="font-bold">KSh {(viewingOp.farmerRate || 0).toLocaleString()}/Acre</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b text-primary">
                <span className="font-medium">Total Rental Fee</span>
                <span className="font-bold">KSh {(viewingOp.revenue || 0).toLocaleString()}</span>
              </div>
              
              <div className="pt-4 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Expenses BreakDown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fuel</span>
                    <span className="font-medium">KSh {(viewingOp.fuelCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Labor (Operator/Agent)</span>
                    <span className="font-medium">KSh {(viewingOp.laborCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Repairs</span>
                    <span className="font-medium">KSh {(viewingOp.repairCost || 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold pt-1">
                    <span>Net Daily Profit</span>
                    <span className="text-green-600">KSh {(viewingOp.netProfit || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by implement or date..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Implement</TableHead>
                <TableHead className="text-right">Acres</TableHead>
                <TableHead className="text-right">Total Rental Fee</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOps.length > 0 ? (
                filteredOps.map((op) => (
                  <TableRow key={op.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenView(op)}>
                    <TableCell className="font-medium">{op.date ? format(new Date(op.date), 'MM/dd/yy') : 'N/A'}</TableCell>
                    <TableCell>{op.implement || 'N/A'}</TableCell>
                    <TableCell className="text-right">{(op.acres || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">KSh {(op.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(op)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => { if(confirm("Delete?")) deleteOperation(op.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                    No operations logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
