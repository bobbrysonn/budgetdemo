"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { createBudgetItem } from "@/server/actions";
import { useRouter } from "next/navigation";

const BudgetCategoryEnum = z.enum(
  [
    "TalentFees",
    "EquipmentRental",
    "LocationFees",
    "PostProduction",
    "PropsAndCostumes",
    "TravelAccommodation",
    "Insurance",
    "Marketing",
    "CrewSalaries",
    "Miscellaneous",
  ],
  { required_error: "Please select a category." }
);

const PaymentStatusEnum = z.enum(
  ["Planned", "Pending", "PartiallyPaid", "Paid", "Overdue"],
  { required_error: "Please select a status." }
);

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
  category: BudgetCategoryEnum,
  estimatedCost: z.coerce
    .number({ invalid_type_error: "Estimated cost must be a number." })
    .min(0, { message: "Estimated cost must be non-negative." }),
  actualCost: z.coerce
    .number({ invalid_type_error: "Actual cost must be a number." })
    .min(0, { message: "Actual cost must be non-negative." })
    .optional()
    .nullable(),
  status: PaymentStatusEnum,
  dueDate: z
    .string({
      required_error: "Due date is required.",
    })
    .min(1, { message: "Due date is required." }),
  paymentDate: z.date().optional().nullable(),
  contactId: z.coerce
    .number({ invalid_type_error: "Invalid contact selection." })
    .int()
    .optional()
    .nullable(),
});

type BudgetItemFormValues = z.infer<typeof formSchema>;

function formatEnumString(str: string) {
  if (!str) return "";

  return str.replace(/([A-Z])/g, " $1").trim();
}

export function BudgetItemForm() {
  const router = useRouter()
  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      estimatedCost: 0,
      actualCost: 0,
      status: "Planned",
      paymentDate: undefined,
      contactId: undefined,
    },
  });

  const budgetItemMutation = useMutation({ 
    mutationFn: createBudgetItem,
    onSuccess: () => {
      toast("Successfully created budget item")
      router.push("/dashboard/budget")
    }
  });

  function onSubmit(values: BudgetItemFormValues) {
    const dataToSend = {
      ...values,
      dueDate: new Date(values.dueDate).toISOString(),
      estimatedCost: Number(values.estimatedCost),
      paymentDate:
        values.paymentDate === undefined
          ? null
          : values.paymentDate?.toISOString(),
      contactId: values.contactId === undefined ? null : values.contactId,
      actualCost:
        values.actualCost === null || values.actualCost === undefined
          ? null
          : Number(values.actualCost),
    };

    budgetItemMutation.mutate({ projectId: 1, budgetId: 3, budgetItem: dataToSend })

    toast("Creating budget item");
  }

  const contacts = [
    { id: 1, name: "John Smith" },
    { id: 2, name: "Creative Writers Guild" },
    { id: 3, name: "TechRentals Inc." },
    { id: 4, name: "Tom Johnson" },
    { id: 5, name: "Food For Film" },
  ];

  const budgetCategoryOptions = BudgetCategoryEnum.options;
  const paymentStatusOptions = PaymentStatusEnum.options;

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Item Details</TabsTrigger>
        <TabsTrigger value="payment">Payment Info</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <TabsContent value="details">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {budgetCategoryOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {formatEnumString(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Cost *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value ? String(value) : null)
                          }
                          defaultValue={
                            field.value ? String(field.value) : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a contact (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            {contacts.map((contact) => (
                              <SelectItem
                                key={contact.id}
                                value={String(contact.id)}
                              >
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Add any additional description or notes (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment">
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Leave empty or 0 if not yet incurred.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value} // Default is 'Planned'
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Map over the enum options */}
                            {paymentStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {/* Format for user-friendliness */}
                                {formatEnumString(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Choose option
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Date the payment is due
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Date the payment was actually made (optional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end px-6 pb-6 md:px-0 md:pb-0">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Budget Item"}
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  );
}
