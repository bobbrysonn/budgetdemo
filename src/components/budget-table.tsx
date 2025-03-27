"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBudgetItems } from "@/server/actions";
import { type BudgetItem } from "@/server/actions";
import { format } from "date-fns";

type BudgetItemStatus = "paid" | "pending" | "overdue" | "planned";

export default function BudgetTable({ projectId }: { projectId: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: budgetItems = [], isLoading } = useQuery({
    queryKey: ["budgetItems", projectId, page],
    queryFn: async () => await getBudgetItems(projectId),
  });

  const filteredItems = budgetItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contact?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search budget items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // Reset to first page on new search
            }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right w-[150px]">
                  Estimated
                </TableHead>
                <TableHead className="text-right w-[150px]">Actual</TableHead>
                <TableHead className="text-right w-[150px]">Variance</TableHead>
                <TableHead className="w-[120px]">Due Date</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="text-right w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <BudgetTableRow key={item.id} item={item} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    No budget items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * itemsPerPage + 1}-
          {Math.min(page * itemsPerPage, filteredItems.length)} of{" "}
          {filteredItems.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function BudgetTableRow({ item }: { item: BudgetItem }) {
  const variance = (item.estimatedCost || 0) - (item.actualCost || 0);
  const status = (item.status?.toLowerCase() || "pending") as BudgetItemStatus;

  return (
    <TableRow>
      <TableCell className="font-medium">
        BUD-{item.id.toString().padStart(3, "0")}
      </TableCell>
      <TableCell className="max-w-[200px] truncate">{item.name}</TableCell>
      <TableCell>{formatCategoryName(item.category)}</TableCell>
      <TableCell>{item.contact?.name || "N/A"}</TableCell>
      <TableCell className="text-right">
        $
        {(item.estimatedCost || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right">
        $
        {(item.actualCost || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell
        className={`text-right ${
          variance < 0 ? "text-green-500" : variance > 0 ? "text-red-500" : ""
        }`}
      >
        {variance < 0 ? "-" : variance > 0 ? "+" : ""}$
        {Math.abs(variance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell>
        {item.dueDate ? format(new Date(item.dueDate), "MMM d, yyyy") : "N/A"}
      </TableCell>
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>
      <TableCell className="text-right">
        <ActionsDropdown itemId={item.id} />
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: BudgetItemStatus }) {
  const statusConfig = {
    paid: {
      label: "Paid",
      variant: "success" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    pending: {
      label: "Pending",
      variant: "outline" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    overdue: {
      label: "Overdue",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    planned: {
      label: "Planned",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

function ActionsDropdown({ itemId }: { itemId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Item</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Item</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatCategoryName(category: string): string {
  return category
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
