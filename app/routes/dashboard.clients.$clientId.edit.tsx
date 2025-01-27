import { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import * as zod from "zod";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  isRouteErrorResponse,
  redirect,
  Form as RemixForm,
  useActionData,
  useLoaderData,
  useRouteError,
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
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";
import { Client } from "~/lib/clients/data/types/Client";
import { ErrorBox } from "~/lib/shared/components/utils/ErrorBox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const meta: MetaFunction = (args) => {
  return [{ title: "Edit client" }];
};

type LoaderData = {
  client: Client;
};

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const client = await clientDatasource.getById(params.clientId!);

    if (!client) {
      throw Response.json(
        {
          error: "Client not found",
        },
        { status: 404, statusText: "Not Found" }
      );
    }

    return Response.json({ client } satisfies LoaderData);
  } catch (error) {
    throw Response.json(
      {
        error: String(error),
      },
      { status: 500, statusText: "Internal Server Error" }
    );
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const clientId = params.clientId!;

  // Using POST since is looks like PUT doesn't work
  if (request.method === "POST") {
    const data = await getValidatedFormData<FormValue>(
      request,
      zodResolver(schema)
    );

    if (data.errors) {
      return Response.json({ errors: data.errors }, { status: 400 });
    }

    try {
      await clientDatasource.update(clientId, {
        name: data.data.name,
        companyId: data.data.companyId,
      });

      return Response.json({ success: true });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    try {
      await clientDatasource.deleteById(clientId);
      return redirect("/dashboard/clients/list");
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }

  return null;
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

export default function EditClient() {
  const { client } = useLoaderData<typeof loader>() as LoaderData;

  const form = useRemixForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: client.id,
      name: client.name,
      companyId: client.companyId,
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
    if (actionData?.success) {
      toast({
        title: "Saved successfully!",
        description: "Your changes have been saved successfully.",
      });
    }
  }, [actionData, toast]);

  return (
    <>
      <h1 className="mb-6">Client: {client.id}</h1>

      <AlertDialog>
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

            <div className="pt-4 flex justify-end items-center gap-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertDialogTrigger
                      disabled={isSubmitting || client.id === "stable-client"}
                    >
                      <Button
                        type="button"
                        variant={"destructive"}
                        disabled={isSubmitting || client.id === "stable-client"}
                        title={
                          client.id === "stable-client"
                            ? "Cannot delete the stable client"
                            : undefined
                        }
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    {client.id === "stable-client" ? (
                      <TooltipContent>
                        <p>The stable client cannot be deleted.</p>
                      </TooltipContent>
                    ) : undefined}
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </RemixForm>
        </Form>

        <AlertDialogContent>
          <RemixForm method="DELETE">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <strong>{client.id}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </RemixForm>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <ErrorBox
      title={
        isRouteErrorResponse(error)
          ? `${error.status}: ${error.statusText}`
          : "Unknown Error"
      }
    >
      {isRouteErrorResponse(error) ? error.data.error : String(error)}
    </ErrorBox>
  );
}
