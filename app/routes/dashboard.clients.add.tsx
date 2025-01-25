import { ActionFunction, MetaFunction } from "@remix-run/node";
import * as zod from "zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  redirect,
  Form as RemixForm,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { Form, FormDescription, FormMessage } from "~/components/ui/form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { clientDatasource } from "~/lib/clients/data";
import { ClientUniqueIdentifierError } from "~/lib/clients/data/client.datasource";
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Add new client" }];
};

export const action: ActionFunction = async ({ request }) => {
  const data = await getValidatedFormData<FormValue>(
    request,
    zodResolver(schema)
  );

  if (data.errors) {
    return Response.json({ errors: data.errors }, { status: 400 });
  }

  try {
    await clientDatasource.create({
      ...data.data,
      assignedReleaseId: "stable-release",
    });

    return redirect("/dashboard/clients/list");
  } catch (error) {
    if (error instanceof ClientUniqueIdentifierError) {
      return Response.json(
        { error: "Identifier already in use" },
        { status: 400 }
      );
    }

    return Response.json({ error: String(error) }, { status: 500 });
  }
};

type FormValue = {
  id: string;
  name: string;
  companyId: string;
};

const schema = zod.object({
  id: zod
    .string()
    .min(3, { message: "The identifier must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Identifier can only contain lowercase letters, numbers, and hyphens",
    }),
  name: zod.string().nonempty("The name is required"),
  companyId: zod.string().nonempty("The company id is required"),
});

export default function AddClient() {
  const form = useRemixForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      name: "",
      companyId: "",
    },
    mode: "onSubmit",
  });
  const { handleSubmit, formState, control } = form;
  const { isSubmitting, isDirty } = formState;

  const { toast } = useToast();

  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error) {
      toast({
        variant: "destructive",
        title: "Oops! Something went wrong",
        description: actionData.error,
      });
    }
  }, [actionData]);

  return (
    <>
      <h1 className="mb-6">Add new client</h1>
      <Form {...form}>
        <RemixForm onSubmit={handleSubmit} method="POST">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <FormField
              control={control}
              name="id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Identifier</FormLabel>
                  <FormControl>
                    <Input placeholder="joe-studio" {...field} />
                  </FormControl>

                  <FormDescription>
                    Should be a short unique identifier for this client
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Joe's Studio" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="companyId"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Company Id</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="b6e2069f-f468-45e6-bc1e-be..."
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    This should be the client's company id in the production
                    database
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add client"}
            </Button>
          </div>
        </RemixForm>
      </Form>
    </>
  );
}
