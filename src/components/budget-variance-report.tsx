"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowDownIcon, ArrowUpIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type BudgetItem } from "@/server/actions";
import { useMemo } from "react";

interface VarianceItem {
  category: string;
  estimated: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: "over" | "under";
}

export function BudgetVarianceReport({ projectId }: { projectId: number }) {
  const { data: budgetItems, isLoading } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
  });

  // Calculate variance data from budget items
  const varianceData = useMemo(() => {
    if (!budgetItems) return [];

    const categoryMap = new Map<string, { estimated: number; actual: number }>();

    // Aggregate by category
    budgetItems.forEach((item) => {
      const category = item.category || "Uncategorized";
      const current = categoryMap.get(category) || { estimated: 0, actual: 0 };
      
      categoryMap.set(category, {
        estimated: current.estimated + (item.estimatedCost || 0),
        actual: current.actual + (item.actualCost || 0),
      });
    });

    // Calculate variance metrics
    return Array.from(categoryMap.entries()).map(([category, { estimated, actual }]) => {
      const variance = actual - estimated;
      const variancePercent = estimated !== 0 ? (variance / estimated) * 100 : 0;
      const status = variance >= 0 ? "over" : "under";

      return {
        category,
        estimated,
        actual,
        variance,
        variancePercent,
        status,
      };
    }).sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent)); // Sort by highest variance first
  }, [budgetItems]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Variance Analysis</CardTitle>
          <CardDescription>Loading budget data...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Variance Analysis</CardTitle>
        <CardDescription>
          {varianceData.length > 0 
            ? "Comparing estimated vs. actual costs with variance" 
            : "No budget data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Estimated</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-right">Variance %</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {varianceData.length > 0 ? (
              varianceData.map((item) => (
                <VarianceRow key={item.category} item={item} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No budget items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function VarianceRow({ item }: { item: VarianceItem }) {
  const progressValue = item.status === "over" 
    ? 100 + item.variancePercent 
    : 100 - Math.abs(item.variancePercent);

  return (
    <TableRow>
      <TableCell className="font-medium">{formatCategoryName(item.category)}</TableCell>
      <TableCell className="text-right">
        ${item.estimated.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right">
        ${item.actual.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className={`text-right ${
        item.variance > 0 ? "text-red-500" : item.variance < 0 ? "text-green-500" : ""
      }`}>
        {item.variance > 0 ? "+" : ""}$
        {Math.abs(item.variance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className={`text-right ${
        item.variancePercent > 0 ? "text-red-500" : item.variancePercent < 0 ? "text-green-500" : ""
      }`}>
        <div className="flex items-center justify-end">
          {item.variancePercent > 0 ? (
            <ArrowUpIcon className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDownIcon className="mr-1 h-4 w-4" />
          )}
          {Math.abs(item.variancePercent).toFixed(1)}%
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Progress
            value={Math.min(progressValue, 120)}
            max={120}
            className={`h-2 w-20 ${
              item.status === "over" ? "bg-red-100" : "bg-green-100"
            }`}
          />
          <span className={`text-xs ${
            item.status === "over" ? "text-red-500" : "text-green-500"
          }`}>
            {item.status === "over" ? "Over" : "Under"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function formatCategoryName(category: string): string {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}