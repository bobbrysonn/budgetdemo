"use client";

import { BudgetItemForm } from "@/components/budget-item-form";
import { Button } from "@/components/ui/button";
import { getBudgetId } from "@/server/actions";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBudgetItemPage() {
  const projectId = 1;
  const { data: budgetId } = useQuery({
    queryKey: ["lineitems", projectId],
    queryFn: async () => await getBudgetId(projectId),
    initialData: 0,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budget">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add Budget Item</h1>
      </div>
      <BudgetItemForm budgetId={budgetId} />
    </div>
  );
}
