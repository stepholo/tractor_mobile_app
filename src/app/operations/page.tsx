
"use client";

import { useState } from "react";
import { useTractorData, Operation } from "@/app/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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

export default function OperationsPage() {
  const { operations, addOperation, deleteOperation, editOperation, isLoaded } = useTractorData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOp, setEditingOp] = useState<Operation | null>(null);

  if (!isLoaded) return <div className="p-8 font-headline">Loading operations...</div>;

  const filteredOps = operations.filter(op => 
    op.implement.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.date.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      date: formData.get("date") as string,
      engineHours: parseFloat(formData.get("engineHours") as string),
      fuelCost: parseFloat(formData.get("fuelCost") as string),
      laborCost: parseFloat(formData.get("laborCost") as string),
      repairCost: parseFloat(formData.get("repairCost") as string),
      implement: formData.get("implement") as string,
      acres: parseFloat(formData.get("acres") as string),
      revenue: parseFloat(formData.get("revenue") as string),
    };

    if (editingOp) {
      editOperation(editingOp.id, data);
      setEditingOp(null);
      toast({ title: "Record updated", description: "Operation successfully updated." });
    } else {
      addOperation(data);
      setIsAddOpen(false);
      toast({ title: "Record saved", description: "Daily operation has been logged." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Operations Log</h1>
          <p className="text-muted-foreground">Manage and record daily activity.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-full md:w-auto px-8">
              <Plus className="w-5 h-5 mr-2" />
              New Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">Log Daily Operation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implement">Implement Used</Label>
                <Input id="implement" name="implement" placeholder="e.g., Plow, Seeder" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineHours">Engine Hours</Label>
                <Input type="number" step="0.1" id="engineHours" name="engineHours" placeholder="0.0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acres">Acres Completed</Label>
                <Input type="number" step="0.1" id="acres" name="acres" placeholder="0.0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input type="number" step="0.01" id="revenue" name="revenue" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelCost">Fuel Cost ($)</Label>
                <Input type="number" step="0.01" id="fuelCost" name="fuelCost" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost ($)</Label>
                <Input type="number" step="0.01" id="laborCost" name="laborCost" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repairCost">Repair Cost ($)</Label>
                <Input type="number" step="0.01" id="repairCost" name="repairCost" placeholder="0.00" defaultValue="0.00" />
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" className="w-full py-6 text-lg">Save Record</Button>
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
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Implement</TableHead>
                <TableHead className="text-right">Acres</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
                <TableHead className="text-right">Cost/Acre</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOps.length > 0 ? (
                filteredOps.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium">{format(new Date(op.date), 'MM/dd/yy')}</TableCell>
                    <TableCell>{op.implement}</TableCell>
                    <TableCell className="text-right">{op.acres}</TableCell>
                    <TableCell className="text-right font-bold text-primary">${op.netProfit.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${op.costPerAcre.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingOp(op);
                            // Normally we'd open a form with pre-filled values
                            toast({ title: "Edit mode", description: "Editing is ready (demo)" });
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                             if(confirm("Delete this record?")) {
                               deleteOperation(op.id);
                               toast({ title: "Record deleted", variant: "destructive" });
                             }
                          }}
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
                    No operations found matching your criteria.
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
