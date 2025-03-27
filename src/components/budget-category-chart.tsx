"use client";

import { useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type BudgetItem } from "@/server/actions";
import { Loader2, AlertCircle } from "lucide-react";

type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
};

type CategorySummary = {
  category: string;
  estimated: number;
  actual: number;
};

// Function to generate distinct colors for the pie chart
const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    const hue = (i * 360) / numColors;
    colors.push(`hsl(${hue}, 70%, 60%)`); // Adjust saturation and lightness as needed
  }
  return colors;
};

export function BudgetCategoryChart({
  projectId,
  chartColors,
}: {
  projectId: number;
  chartColors?: string[]; // Optional prop for custom colors
}) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  const { data: budgetItems, isLoading, isError, error } = useQuery({
    queryKey: ["budgetItems", projectId],
    queryFn: async () => await getBudgetItems(projectId),
  });

  // Aggregate budget data by category
  const budgetData = useMemo(() => {
    if (!budgetItems) return {};
    return budgetItems.reduce((acc: Record<string, CategorySummary>, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          estimated: 0,
          actual: 0,
        };
      }
      acc[category].estimated += item.estimatedCost;
      acc[category].actual += item.actualCost;
      return acc;
    }, {});
  }, [budgetItems]);

  const categories = useMemo(() => Object.values(budgetData || {}), [budgetData]);
  const categoryLabels = useMemo(() => categories.map((c) => c.category), [categories]);
  const estimatedData = useMemo(() => categories.map((c) => c.estimated), [categories]);
  const actualData = useMemo(() => categories.map((c) => c.actual), [categories]);

  useEffect(() => {
    const renderCharts = async () => {
      const Chart = (await import("chart.js/auto")).default;

      // Destroy existing charts
      [barChartRef.current, pieChartRef.current].forEach((canvas) => {
        if (canvas) {
          const chart = Chart.getChart(canvas);
          chart?.destroy();
        }
      });

      // Bar Chart
      if (barChartRef.current) {
        new Chart(barChartRef.current, {
          type: "bar",
          data: {
            labels: categoryLabels,
            datasets: [
              createDataset("Estimated", estimatedData, "rgb(59, 130, 246)"),
              createDataset("Actual", actualData, "rgb(16, 185, 129)"),
            ],
          },
          options: barChartOptions,
        });
      }

      // Pie Chart
      if (pieChartRef.current) {
        const pieColors = chartColors || generateColors(categories.length); // Use custom colors or generate
        new Chart(pieChartRef.current, {
          type: "pie",
          data: {
            labels: categoryLabels,
            datasets: [
              {
                data: estimatedData,
                backgroundColor: pieColors.map((color) => `${color}80`), // Add transparency
                borderWidth: 1,
              },
            ],
          },
          options: pieChartOptions,
        });
      }
    };

    if (categories.length > 0) {
      renderCharts();
    }
  }, [categories, chartColors]); // Added chartColors to the dependency array

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Visualization</CardTitle>
          <CardDescription>Loading budget data...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Visualization</CardTitle>
          <CardDescription>Error loading budget data.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[400px] flex-col items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p>An error occurred while fetching budget data. Please try again later.</p>
          {error instanceof Error && (
            <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Analysis</CardTitle>
        <CardDescription>
          {categories.length > 0
            ? "Breakdown of budget allocation and spending"
            : "No budget data available.  Consider adding budget items."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Spending Comparison</TabsTrigger>
            <TabsTrigger value="pie">Budget Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="pt-4">
            <div className="h-[400px] w-full">
              <canvas ref={barChartRef} aria-label="Bar chart of budget spending" role="img" />
            </div>
          </TabsContent>

          <TabsContent value="pie" className="pt-4">
            <div className="h-[400px] w-full">
              <canvas ref={pieChartRef} aria-label="Pie chart of budget allocation" role="img" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Chart configuration helpers
const createDataset = (label: string, data: number[], color: string): ChartDataset => ({
  label,
  data,
  backgroundColor: `${color}40`,
  borderColor: color,
  borderWidth: 1,
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Amount (USD)",
      },
      ticks: {
        callback: (value: number) => `$${value.toLocaleString()}`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || "";
          const value = context.parsed.y;
          return `${label}: $${value.toLocaleString()}`;
        },
      },
    },
    legend: {
      position: "bottom" as const
    }
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        boxWidth: 20,
        padding: 15,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.raw as number;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: $${value.toLocaleString()} (${percentage}%)`;
        },
      },
    },
  },
};