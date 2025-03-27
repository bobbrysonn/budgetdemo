"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetItem, getBudgetItems } from "@/server/actions";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function BudgetOverview({ projectId }: { projectId: number }) {
  const {
    data: budgetItems,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
    initialData: new Array<BudgetItem>()
  });

  // Transform raw budget items into categorized summary
  const budgetCategories = useMemo(() => {
    const categories = new Map<
      string,
      {
        estimated: number;
        actual: number;
        count: number;
      }
    >();

    // Aggregate data by category
    budgetItems?.forEach((item) => {
      const category = item.category || "Miscellaneous";
      const current = categories.get(category) || {
        estimated: 0,
        actual: 0,
        count: 0,
      };

      categories.set(category, {
        estimated: current.estimated + (item.estimatedCost || 0),
        actual: current.actual + (item.actualCost || 0),
        count: current.count + 1,
      });
    });

    // Convert to array with calculated values
    return Array.from(categories.entries())
      .map(([name, data]) => {
        const progress =
          data.estimated > 0
            ? Math.round((data.actual / data.estimated) * 100)
            : 0;

        return {
          name,
          estimated: data.estimated,
          actual: data.actual,
          progress,
          status: progress > 100 ? "over" : progress < 100 ? "under" : "exact",
          count: data.count,
        };
      })
      .sort((a, b) => b.estimated - a.estimated); // Sort by highest budget first
  }, [budgetItems]);

  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Loading budget data...</CardDescription>
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
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Error loading budget data</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex h-full items-center justify-center text-red-500">
            Failed to load budget data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>
          Estimated vs. actual costs by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetCategories.length > 0 ? (
            budgetCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {formatCategoryName(category.name)} ({category.count})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${category.estimated.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">/</span>
                      <span
                        className={`text-xs ${
                          category.status === "over"
                            ? "text-red-500"
                            : category.status === "under"
                            ? "text-green-500"
                            : "text-blue-500"
                        }`}
                      >
                        ${category.actual.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      category.status === "over"
                        ? "text-red-500"
                        : category.status === "under"
                        ? "text-green-500"
                        : "text-blue-500"
                    }`}
                  >
                    {category.progress}%
                  </span>
                </div>
                <Progress
                  value={Math.min(category.progress, 120)}
                  max={120}
                  className={`h-2 ${
                    category.status === "over"
                      ? "bg-red-100"
                      : category.status === "under"
                      ? "bg-green-100"
                      : "bg-blue-100"
                  }`}
                />
              </div>
            ))
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No budget items found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format enum values for display
function formatCategoryName(category: string): string {
  return category
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("And", "&");
}
