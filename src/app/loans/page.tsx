
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
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Plus, Trash2, Search, Wallet, Edit2, Download } from "lucide-react";
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
import { exportToCsv } from "@/app/lib/export";

export default function LoansPage() {
  const { loans, addLoanPayment, deleteLoanPayment, editLoanPayment, profile, isLoaded } = useTractorData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLoan, setEditingLoan] = useState<LoanPayment | null>(null);
  const [viewingLoan, setViewingLoan] = useState<LoanPayment | null>(null);

  if (!isLoaded) return <div className="p-8 font-headline text-center">Loading loans...</div>;

  const filteredLoans = loans.filter(l => 
    (l.mpesaCode?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (l.date || "").includes(searchQuery)
  );

  const totalLoanPaid = loans.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleExport = async () => {
    if (filteredLoans.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = ["Date of payment", "Amount (KSh)", "M-Pesa Code"];
    const rows = filteredLoans.map(l => [l.date, l.amount, l.mpesaCode]);
    const meta = [
      ["Owner Name", profile.name],
      ["Phone", profile.phone],
      ["Tractor Model", profile.tractorModel],
      ["Export Type", searchQuery ? "Filtered Loan Payments" : "All Loan Payments"],
      ["Export Date", new Date().toLocaleString()]
    ];

    await exportToCsv(`loans_${new Date().toISOString().split('T')[0]}.csv`, headers, rows, meta);
    toast({ title: "Export Complete" });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      date: formData.get("date") as string,
      amount: parseFloat(formData.get("amount") as string) || 0,
      mpesaCode: (formData.get("mpesaCode") as string || "").toUpperCase(),
    };

    if (editingLoan) {
      editLoanPayment(editingLoan.id, data);
      toast({ title: "Payment Updated" });
    } else {
      addLoanPayment(data);
      toast({ title: "Payment Recorded" });
    }
    
    setIsDialogOpen(false);
    setEditingLoan(null);
  };

  const handleEdit = (loan: LoanPayment) => {
    setEditingLoan(loan);
    setIsDialogOpen(true);
  };

  const handleView = (loan: LoanPayment) => {
    setViewingLoan(loan);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Tractor Payments</h1>
          <p className="text-muted-foreground">Track payments for your tractor loan.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingLoan(null);
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg h-14 w-full md:w-auto px-8" onClick={() => setEditingLoan(null)}>
                <Plus className="w-5 h-5 mr-2" />
                New Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline">
                  {editingLoan ? "Edit Payment" : "Record Payment"}
                </DialogTitle>
                <DialogDescription>Enter payment details as they appear on your M-Pesa receipt.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of payment</Label>
                  <Input type="date" id="date" name="date" required defaultValue={editingLoan?.date || new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Paid (KSh)</Label>
                  <Input type="number" step="1" id="amount" name="amount" placeholder="0" required defaultValue={editingLoan?.amount || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesaCode">M-Pesa Code</Label>
                  <Input id="mpesaCode" name="mpesaCode" placeholder="ABC123XYZ" required className="uppercase" defaultValue={editingLoan?.mpesaCode || ""} />
                </div>
                <Button type="submit" className="w-full py-6 text-lg">
                  {editingLoan ? "Update Payment" : "Save Payment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">Payment Receipt Details</DialogTitle>
          </DialogHeader>
          {viewingLoan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <span className="text-muted-foreground font-medium">Date of payment</span>
                <span className="text-right font-bold">{viewingLoan.date ? format(new Date(viewingLoan.date), 'MMMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <span className="text-muted-foreground font-medium">Amount Paid</span>
                <span className="text-right font-bold text-primary">KSh {viewingLoan.amount?.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <span className="text-muted-foreground font-medium">M-Pesa Code</span>
                <span className="text-right font-mono font-bold uppercase">{viewingLoan.mpesaCode}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-black text-white p-6 border-none shadow-lg flex items-center justify-between">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Total Amount paid</p>
          <h2 className="text-4xl font-bold font-headline">KSh {totalLoanPaid.toLocaleString()}</h2>
        </div>
        <div className="p-4 bg-primary/20 rounded-full">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-lg shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by M-Pesa code or date..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleExport} className="h-10 rounded-md px-6 shrink-0 w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export {searchQuery ? "Filtered" : "All"} CSV
        </Button>
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
                  <TableRow key={l.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleView(l)}>
                    <TableCell>{l.date ? format(new Date(l.date), 'MM/dd/yy') : 'N/A'}</TableCell>
                    <TableCell className="text-right font-bold text-primary">KSh {(l.amount || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm uppercase">{l.mpesaCode}</TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(l)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => { if(confirm("Delete this payment?")) deleteLoanPayment(l.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
