"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type BudgetItem, type PaymentStatus } from "@/server/actions";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function RecentTransactions({
  projectId,
}: {
  projectId: number;
}) {
  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recentTransactions", projectId],
    queryFn: async () => {
      const items = await getBudgetItems(projectId);
      return items
        .filter((item) => item.status === "Paid") // Only show paid transactions
        .sort(
          (a, b) =>
            new Date(b.paymentDate || b.dueDate).getTime() -
            new Date(a.paymentDate || a.dueDate).getTime()
        ) // Sort by most recent
        .slice(0, 5); // Get top 5 most recent
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading transaction history...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Error loading transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-red-500">
          Failed to load transaction data
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>No recent transactions found</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No paid transactions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your most recent budget transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Invoice</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="text-right w-[120px]">Amount</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ transaction }: { transaction: BudgetItem }) {
  const formattedDate = transaction.paymentDate
    ? format(new Date(transaction.paymentDate), "MMM d, yyyy")
    : "Not recorded";

  const formattedCategory = transaction.category
    ? transaction.category
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    : "Uncategorized";

  return (
    <TableRow>
      <TableCell className="font-medium">
        INV-{transaction.id.toString().padStart(3, "0")}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {transaction.name}
      </TableCell>
      <TableCell>{formattedCategory}</TableCell>
      <TableCell>
        {transaction.contact?.name || transaction.contactId || "N/A"}
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="text-right">
        $
        {(transaction.actualCost || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell>
        <StatusBadge status={transaction.status || "Paid"} />
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const statusConfig = {
    Paid: {
      label: "Paid",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    Pending: {
      label: "Pending",
      variant: "outline" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    Overdue: {
      label: "Overdue",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    PartiallyPaid: {
      label: "Partial",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    Planned: {
      label: "Planned",
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  };

  const config = statusConfig[status] || statusConfig.Paid;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
