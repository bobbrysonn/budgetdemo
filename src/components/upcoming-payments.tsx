"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type PaymentStatus } from "@/server/actions";
import { addDays, isBefore, format } from "date-fns";
import { useMemo } from "react";

export default function UpcomingPayments({ projectId }: { projectId: number }) {
  const { data: budgetItems, isLoading, isError } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
  });

  // Transform budget items into upcoming payments
  const upcomingPayments = useMemo(() => {
    if (!budgetItems) return [];

    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    return budgetItems
      .filter(item => {
        // Only include items that aren't fully paid and have a due date
        if (!item.dueDate) return false;
        
        const paymentStatus = item.status || "Pending";
        const isPaid = paymentStatus === "Paid";
        const isPartiallyPaid = paymentStatus === "PartiallyPaid";
        const isPending = paymentStatus === "Pending" || paymentStatus === "Planned";
        const isOverdue = paymentStatus === "Overdue";

        // Include if:
        // - Not fully paid AND
        // - Due date is within next 30 days OR overdue
        return (
          (!isPaid || isPartiallyPaid) && 
          (isBefore(new Date(item.dueDate), thirtyDaysFromNow) || isOverdue)
        );
      })
      .map(item => ({
        id: item.id,
        description: item.name,
        amount: item.actualCost || item.estimatedCost || 0,
        dueDate: item.dueDate,
        status: (item.status || "Pending") as PaymentStatus,
        contact: item.contact?.name || item.contactId || null,
      }));
  }, [budgetItems]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Loading payment data...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Error loading payment data</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex h-full items-center justify-center text-red-500">
            Failed to load payment data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!upcomingPayments || upcomingPayments.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>No upcoming payments in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No unpaid items due soon
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort payments by due date (soonest first, overdue first)
  const sortedPayments = [...upcomingPayments].sort((a, b) => {
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    const now = new Date();
    
    // Overdue items come first
    if (aDate < now && bDate >= now) return -1;
    if (aDate >= now && bDate < now) return 1;
    
    // Then sort by due date
    return aDate.getTime() - bDate.getTime();
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
        <CardDescription>
          {sortedPayments.some(p => new Date(p.dueDate) < new Date())
            ? "Includes overdue payments"
            : "Payments due in the next 30 days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({ payment }: { 
  payment: {
    id: number;
    description: string;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
    contact: string | null;
  };
}) {
  const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== "Paid";
  const status = isOverdue ? "Overdue" : payment.status;
  const amountDue = payment.amount - 
    (payment.status === "PartiallyPaid" ? /* subtract paid amount */ 0 : 0);

  return (
    <div className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{payment.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span>
            Due: {format(new Date(payment.dueDate), "MMM d, yyyy")}
            {isOverdue && " • Overdue"}
          </span>
        </div>
        {payment.contact && (
          <p className="text-xs text-muted-foreground">{payment.contact}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-medium">
          ${amountDue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <Badge
          variant={
            isOverdue
              ? "destructive"
              : payment.status === "Paid"
                ? "default"
                : payment.status === "PartiallyPaid"
                  ? "secondary"
                  : "outline"
          }
        >
          {status}
        </Badge>
      </div>
    </div>
  );
}