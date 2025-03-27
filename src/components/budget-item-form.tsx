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
import { Paperclip } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  estimatedCost: z.coerce.number().min(0, {
    message: "Estimated cost must be a positive number.",
  }),
  actualCost: z.coerce
    .number()
    .min(0, {
      message: "Actual cost must be a positive number.",
    })
    .optional(),
  dueDate: z.string({
    required_error: "Please select a due date.",
  }),
  status: z.string({
    required_error: "Please select a status.",
  }),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

export function BudgetItemForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      estimatedCost: 0,
      actualCost: 0,
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast("Your budget item has been created successfully.");
    console.log(values);
  }

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details">Item Details</TabsTrigger>
        <TabsTrigger value="payment">Payment Info</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter description" {...field} />
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
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pre-production">
                              Pre-Production
                            </SelectItem>
                            <SelectItem value="production">
                              Production
                            </SelectItem>
                            <SelectItem value="post-production">
                              Post-Production
                            </SelectItem>
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
                        <FormLabel>Estimated Cost</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="actualCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actual Cost</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave at 0 if not yet incurred
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a contact" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="john-smith">
                              John Smith
                            </SelectItem>
                            <SelectItem value="creative-writers">
                              Creative Writers Guild
                            </SelectItem>
                            <SelectItem value="tech-rentals">
                              TechRentals Inc.
                            </SelectItem>
                            <SelectItem value="tom-johnson">
                              Tom Johnson
                            </SelectItem>
                            <SelectItem value="food-for-film">
                              Food For Film
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes here"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Create Budget Item</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="payment">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Create Budget Item</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="attachments">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-10">
              <Paperclip className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">Drag & drop files here</h3>
              <p className="text-sm text-muted-foreground">
                Attach invoices, contracts, or other relevant documents
              </p>
              <Button variant="outline">Browse Files</Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit">Create Budget Item</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
