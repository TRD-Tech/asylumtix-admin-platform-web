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
import { releaseDatasource } from "~/lib/releases/data";
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";
import { Release } from "~/lib/releases/data/types/Release";
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
  return [{ title: "Edit release" }];
};

type LoaderData = {
  release: Release;
};

export const loader: LoaderFunction = async ({ params }) => {
  try {
    const release = await releaseDatasource.getById(params.releaseId!);

    if (!release) {
      throw Response.json(
        {
          error: "Release not found",
        },
        { status: 404, statusText: "Not Found" }
      );
    }

    return Response.json({ release } satisfies LoaderData);
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
  const releaseId = params.releaseId!;

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
      await releaseDatasource.update(releaseId, {
        name: data.data.name,
        version: data.data.version,
        url: data.data.url,
      });

      return Response.json({ success: true });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    try {
      await releaseDatasource.deleteById(releaseId);
      return redirect("/dashboard/releases/list");
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  }

  return null;
};

type FormValue = {
  id: string;
  name: string;
  version: string;
  url: string;
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
  version: zod.string().nonempty("The version is required"),
  url: zod.string().url("Invalid URL"),
});

export default function EditRelease() {
  const { release } = useLoaderData<typeof loader>() as LoaderData;

  const form = useRemixForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: release.id,
      name: release.name,
      version: release.version,
      url: release.url,
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
      <h1 className="mb-6">Release: {release.id}</h1>

      <AlertDialog>
        <Form {...form}>
          <RemixForm onSubmit={handleSubmit} method="POST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <FormField
                disabled
                control={control}
                name="id"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <Input placeholder="alpha-release" {...field} />
                    </FormControl>

                    <FormDescription>
                      Should be a short unique identifier of this release
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="url"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://alpha.asylumtix.com"
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      Should be the url where this release's web app is hosted
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
                      <Input placeholder="Alpha release" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="version"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>

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
                      disabled={isSubmitting || release.id === "stable-release"}
                    >
                      <Button
                        type="button"
                        variant={"destructive"}
                        disabled={
                          isSubmitting || release.id === "stable-release"
                        }
                        title={
                          release.id === "stable-release"
                            ? "Cannot delete the stable release"
                            : undefined
                        }
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    {release.id === "stable-release" ? (
                      <TooltipContent>
                        <p>The stable release cannot be deleted.</p>
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
                <strong>{release.id}</strong>.
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
