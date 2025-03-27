import BudgetOverview from "@/components/budget-overview";
import BudgetSummaryCards from "@/components/budget-summary-cards";
import RecentTransactions from "@/components/recent-transactions";
import UpcomingPayments from "@/components/upcoming-payments";

export default function BudgetDashboardPage() {
  const projectId = 1;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Budget Dashboard</h1>
      <BudgetSummaryCards projectId={projectId}/>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BudgetOverview projectId={projectId} />
        <UpcomingPayments projectId={projectId} />
      </div>
      <RecentTransactions projectId={projectId} />
    </div>
  );
}
