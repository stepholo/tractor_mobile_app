
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
  DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Search, Filter } from "lucide-react";
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

export default function OperationsPage() {
  const { operations, addOperation, deleteOperation, editOperation, profile, isLoaded } = useTractorData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOp, setEditingOp] = useState<Operation | null>(null);
  
  // Local form state for auto-calculation
  const [selectedImplement, setSelectedImplement] = useState<string>("");
  const [rate, setRate] = useState<number>(0);

  useEffect(() => {
    if (editingOp) {
      setSelectedImplement(editingOp.implement);
      setRate(editingOp.costPerAcre);
    } else {
      setSelectedImplement("");
      setRate(0);
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
    if (mappedRate === 'default') {
      setRate(profile.defaultRepaymentRate);
    } else if (typeof mappedRate === 'number') {
      setRate(mappedRate);
    }
  };

  const handleOpenNew = () => {
    setEditingOp(null);
    setSelectedImplement("");
    setRate(0);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (op: Operation) => {
    setEditingOp(op);
    setIsDialogOpen(true);
  };

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
      acres: parseFloat(formData.get("acres") as string) || 0,
      costPerAcre: rate,
      amountPaid: parseFloat(formData.get("amountPaid") as string) || 0,
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
                <Label htmlFor="engineHours">Current Engine Hours</Label>
                <Input type="number" step="0.1" id="engineHours" name="engineHours" placeholder="0.0" required defaultValue={editingOp?.engineHours || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acres">Acres Completed</Label>
                <Input type="number" step="0.01" id="acres" name="acres" placeholder="0.00" required defaultValue={editingOp?.acres || ""} />
              </div>
              <div className="space-y-2">
                <Label>Farmer Rate (Job Price) (KSh/Acre)</Label>
                <Input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)} 
                  placeholder="0" 
                  required 
                />
                <p className="text-[10px] text-muted-foreground italic">Auto-calculated based on implement.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Total Amount Paid (KSh)</Label>
                <Input type="number" step="1" id="amountPaid" name="amountPaid" placeholder="0" required defaultValue={editingOp?.amountPaid || ""} />
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
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOps.length > 0 ? (
                filteredOps.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">{op.date ? format(new Date(op.date), 'MM/dd/yy') : 'N/A'}</TableCell>
                    <TableCell>{op.implement || 'N/A'}</TableCell>
                    <TableCell className="text-right">{(op.acres || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">KSh {(op.costPerAcre || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold text-primary">KSh {(op.revenue || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
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
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
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
