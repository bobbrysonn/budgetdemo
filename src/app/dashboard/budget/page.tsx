import BudgetTable from "@/components/budget-table";
import BudgetFilters from "@/components/budget-filters";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
        <Button>
          <Link className="flex items-center" href="/dashboard/budget/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Budget Item
          </Link>
        </Button>
      </div>
      <BudgetFilters />
      <BudgetTable projectId={1} />
    </div>
  );
}
