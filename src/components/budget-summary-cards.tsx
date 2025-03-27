"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getBudgetItems } from "@/server/actions";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Loader2 } from "lucide-react";
import { type BudgetItem } from "@/server/actions";
import { useMemo } from "react";

export default function BudgetSummaryCards({
  projectId,
}: {
  projectId: number;
}) {
  const {
    data: budgetItems,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
    initialData: Array<BudgetItem>(),
  });

  const totals = useMemo(() => {
    // Validate and convert to numbers
    const totalBudget = budgetItems.reduce(
      (total, item) => total + (Number(item.estimatedCost) || 0),
      0
    );
    const spentToDate = budgetItems.reduce(
      (total, item) => total + (Number(item.actualCost) || 0),
      0
    );

    // Calculate percentages
    const spentPercentage =
      totalBudget > 0 ? Math.min(100, (spentToDate / totalBudget) * 100) : 0;
    const remainingPercentage = 100 - spentPercentage;

    // Calculate variance
    const variance = totalBudget - spentToDate;
    const variancePercentage =
      totalBudget > 0 ? (Math.abs(variance) / totalBudget) * 100 : 0;

    return {
      totalBudget,
      spentToDate,
      remaining: variance,
      spentPercentage,
      remainingPercentage,
      isOverBudget: variance < 0,
      varianceAmount: Math.abs(variance),
      variancePercentage,
    };
  }, [budgetItems]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center text-red-500">
        Failed to load budget data
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Budget Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.totalBudget.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Approved on June 15, 2024
          </p>
        </CardContent>
      </Card>

      {/* Spent to Date Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spent to Date</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.spentToDate.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Progress value={totals.spentPercentage} className="h-2" />
            <span className="text-xs text-muted-foreground">
              {Math.round(totals.spentPercentage)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Budget Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${totals.remaining.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <Progress value={totals.remainingPercentage} className="h-2" />
            <span className="text-xs text-muted-foreground">
              {Math.round(totals.remainingPercentage)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Variance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">
              {totals.isOverBudget ? "-" : ""}$
              {totals.varianceAmount.toLocaleString()}
            </div>
            {totals.isOverBudget ? (
              <ArrowDownIcon className="ml-2 h-4 w-4 text-red-500" />
            ) : (
              <ArrowUpIcon className="ml-2 h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {totals.isOverBudget ? "Over" : "Under"} budget by{" "}
            {Math.round(totals.variancePercentage)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
