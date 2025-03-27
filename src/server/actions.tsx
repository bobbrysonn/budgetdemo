export type BudgetItem = {
  id: number;
  name: string;
  description: string;
  category: "EquipmentRental" | any;
  estimatedCost: number;
  actualCost: number;
  status: "Pending" | any;
  dueDate: string;
  paymentDate: string | null;
  contactId: number | null;
  contact: null;
  budgetId: number;
};

export type Project = {
  id: number;
  description: string;
  deadline: string;
  startDate: string;
  endDate: string;
  status: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export enum PaymentStatus {
  Planned,
  Pending,
  PartiallyPaid,
  Paid,
  Overdue,
}

export async function getProjects(): Promise<[Project]> {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL_DEV}/projects`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  const projects = await resp.json();

  return projects;
}

export async function getBudgetItems(projectId: number): Promise<[BudgetItem]> {
  let resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_DEV}/projects/${projectId}/budgets`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  let budgetId = (await resp.json())[0].id;

  resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_DEV}/projects/${projectId}/budgets/${budgetId}/items`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  const budgetItems = await resp.json();

  return budgetItems;
}

export async function getBudgetId(projectId: number): Promise<number> {
  let resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_DEV}/projects/${projectId}/budgets`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  let budgetId = (await resp.json())[0].id;

  return budgetId;
}

export async function createBudgetItem({
  projectId,
  budgetId,
  budgetItem,
}: {
  projectId: number;
  budgetId: number;
  budgetItem: BudgetItem;
}): Promise<BudgetItem> {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_DEV}/projects/${projectId}/budgets/${budgetId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(budgetItem),
    }
  );

  const createdBudgetItem = await resp.json();

  return createdBudgetItem;
}
