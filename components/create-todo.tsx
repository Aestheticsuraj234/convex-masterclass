"use client";

import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodIssue } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { createTodoSchema } from "@/lib/zod";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

type TodoFormData = z.infer<typeof createTodoSchema>;

export default function CreateTodo() {
	const createTodo = useMutation(api.todos.createTodo);

	const form = useForm<TodoFormData>({
		resolver: zodResolver(createTodoSchema),
		defaultValues: {
			title: "",
			completed: false
		},
	});

	useEffect(() => {
		const shouldFocusInput = !form.formState.isSubmitting;
		if (shouldFocusInput) {
			form.setFocus("title");
		}
	}, [form.formState.isSubmitting, form]);

	const getInputClassName = () => {
		const baseClasses =
			"px-4 py-7 focus:outline-none focus:ring-0 active:outline-none active:ring-0 focus-visible:ring-0 focus-visible:outline-none border";
		const errorClasses =
			"border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20 focus:border-red-500";
		const defaultClasses =
			"shadow-md shadow-primary/20 border-primary/50 bg-primary text-primary-foreground placeholder:text-primary-foreground/50";

		return cn(
			baseClasses,
			form.formState.errors.title ? errorClasses : defaultClasses
		);
	};

	const handleTodoCreation = async (data: TodoFormData) => {
		try {
			await createTodo({ title: data.title, completed: false });
			toast.success("Todo created successfully!");
			form.reset();
		} catch (error) {
			handleTodoCreationError(error);
			toast.error("Failed to create todo");
		}
	};

	const handleTodoCreationError = (error: unknown) => {
		if (error instanceof ConvexError && error.data.ZodError) {
			const zodError = error.data.ZodError as ZodIssue[];
			const titleError = zodError.find((err) => err.path.includes("title"));
			if (titleError) {
				form.setError("title", { message: titleError.message });
			}
		} else {
			form.setError("title", { message: "Failed to create todo" });
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleTodoCreation)} className="w-full">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									{...field}
									ref={field.ref}
									type="text"
									placeholder="What are you planning to do?"
									disabled={form.formState.isSubmitting}
									className={getInputClassName()}
								/>
							</FormControl>
							<FormMessage className="text-red-500 font-bold" />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
