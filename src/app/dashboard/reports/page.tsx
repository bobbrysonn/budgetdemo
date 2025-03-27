import { BudgetCategoryChart } from "@/components/budget-category-chart";
import { BudgetContactSpending } from "@/components/budget-contact-spending";
import { BudgetVarianceReport } from "@/components/budget-variance-report";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Budget Reports</h1>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Category Overview</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="contacts">Contact Spending</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <BudgetCategoryChart
            projectId={1}
            chartColors={["red", "green", "blue"]}
          />
        </TabsContent>
        <TabsContent value="variance" className="pt-4">
          <BudgetVarianceReport projectId={1} />
        </TabsContent>
        <TabsContent value="contacts" className="pt-4">
          <BudgetContactSpending projectId={1} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
