"use client";

import { useState } from "react";
import { useTractorData, LoanPayment } from "@/app/lib/store";
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
import { Plus, Trash2, Search, Wallet } from "lucide-react";
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

export default function LoansPage() {
  const { loans, addLoanPayment, deleteLoanPayment, isLoaded } = useTractorData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isLoaded) return <div className="p-8 font-headline text-center">Loading loans...</div>;

  const filteredLoans = loans.filter(l => 
    (l.mpesaCode?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (l.date || "").includes(searchQuery)
  );

  const totalLoanPaid = loans.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      date: formData.get("date") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      mpesaCode: (formData.get("mpesaCode") as string || "").toUpperCase(),
    };

    addLoanPayment(data);
    setIsDialogOpen(false);
    toast({ title: "Payment Recorded" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Tractor Payments</h1>
          <p className="text-muted-foreground">Track payments for your tractor loan.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-full md:w-auto px-8">
              <Plus className="w-5 h-5 mr-2" />
              New Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline">Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date of Payment</Label>
                <Input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid (KSh)</Label>
                <Input type="number" step="1" id="amount" name="amount" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesaCode">M-Pesa Code</Label>
                <Input id="mpesaCode" name="mpesaCode" placeholder="ABC123XYZ" required className="uppercase" />
              </div>
              <Button type="submit" className="w-full py-6 text-lg">Save Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-black text-white p-6 border-none shadow-lg flex items-center justify-between">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Total Amount paid</p>
          <h2 className="text-4xl font-bold font-headline">KSh {totalLoanPaid.toLocaleString()}</h2>
        </div>
        <div className="p-4 bg-primary/20 rounded-full">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by M-Pesa code or date..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Date of payment</TableHead>
                <TableHead className="text-right">Amount (KSh)</TableHead>
                <TableHead>M-Pesa Code</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.date ? format(new Date(l.date), 'MM/dd/yy') : 'N/A'}</TableCell>
                    <TableCell className="text-right font-bold text-primary">KSh {(l.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm uppercase">{l.mpesaCode}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => { if(confirm("Delete this payment?")) deleteLoanPayment(l.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                    No payments recorded yet.
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
