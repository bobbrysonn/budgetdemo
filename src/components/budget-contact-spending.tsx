"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type BudgetItem } from "@/server/actions";
import { format } from "date-fns";

interface ContactSpending {
  id: string;
  name: string;
  role: string;
  totalBudgeted: number;
  totalSpent: number;
  remainingBudget: number;
  lastPayment: string | null;
  status: "active" | "completed" | "pending";
}

export function BudgetContactSpending({ projectId }: { projectId: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: budgetItems, isLoading } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
  });

  // Aggregate spending by contact
  const contactSpendingData = useMemo<ContactSpending[]>(() => {
    if (!budgetItems) return [];

    const contactMap = new Map<string, {
      name: string;
      role: string;
      totalBudgeted: number;
      totalSpent: number;
      lastPayment: Date | null;
    }>();

    budgetItems.forEach((item) => {
      const contactName = item.contact?.name || "Unknown Contact";
      const contactRole = item.category || "Uncategorized";
      const contactKey = `${contactName}-${contactRole}`;
      
      const current = contactMap.get(contactKey) || {
        name: contactName,
        role: contactRole,
        totalBudgeted: 0,
        totalSpent: 0,
        lastPayment: null,
      };

      contactMap.set(contactKey, {
        name: contactName,
        role: contactRole,
        totalBudgeted: current.totalBudgeted + (item.estimatedCost || 0),
        totalSpent: current.totalSpent + (item.actualCost || 0),
        lastPayment: item.paymentDate 
          ? new Date(item.paymentDate)
          : current.lastPayment,
      });
    });

    return Array.from(contactMap.values()).map((contact, index) => ({
      id: `CON-${(index + 1).toString().padStart(3, '0')}`,
      name: contact.name,
      role: contact.role,
      totalBudgeted: contact.totalBudgeted,
      totalSpent: contact.totalSpent,
      remainingBudget: contact.totalBudgeted - contact.totalSpent,
      lastPayment: contact.lastPayment?.toISOString() || null,
      status: contact.totalSpent === 0 
        ? "pending" 
        : contact.totalSpent >= contact.totalBudgeted 
          ? "completed" 
          : "active",
    }));
  }, [budgetItems]);

  const filteredContacts = useMemo(() => {
    return contactSpendingData.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase()),
    ).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by highest spent first
  }, [contactSpendingData, searchQuery]);

  const handleExport = () => {
    // Implement CSV export logic here
    toast.success("Export started successfully");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Spending Report</CardTitle>
          <CardDescription>Loading contact data...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Contact Spending Report</CardTitle>
          <CardDescription>
            {contactSpendingData.length > 0
              ? "Track spending by contact or vendor"
              : "No contact spending data available"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts or roles..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Contact</TableHead>
              <TableHead className="min-w-[120px]">Role</TableHead>
              <TableHead className="text-right">Budgeted</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="min-w-[100px]">Last Payment</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <ContactRow key={contact.id} contact={contact} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No matching contacts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ContactRow({ contact }: { contact: ContactSpending }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{contact.name}</TableCell>
      <TableCell>{formatRoleName(contact.role)}</TableCell>
      <TableCell className="text-right">
        ${contact.totalBudgeted.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right">
        ${contact.totalSpent.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell
        className={`text-right ${
          contact.remainingBudget < 0
            ? "text-red-500"
            : contact.remainingBudget > 0
            ? "text-green-500"
            : ""
        }`}
      >
        ${Math.abs(contact.remainingBudget).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        {contact.remainingBudget < 0 ? " (over)" : ""}
      </TableCell>
      <TableCell>
        {contact.lastPayment
          ? format(new Date(contact.lastPayment), "MMM d, yyyy")
          : "N/A"}
      </TableCell>
      <TableCell>
        <StatusBadge status={contact.status} />
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: "active" | "completed" | "pending" }) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-800",
    },
    completed: {
      label: "Completed",
      className: "bg-blue-100 text-blue-800",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800",
    },
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status].className}`}
    >
      {statusConfig[status].label}
    </span>
  );
}

function formatRoleName(role: string): string {
  return role
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}