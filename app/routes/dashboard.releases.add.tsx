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
import { releaseDatasource } from "~/lib/releases/data";
import { ReleaseStatus } from "~/lib/releases/data/types/ReleaseStatus";
import { ReleaseUniqueIdentifierError } from "~/lib/releases/data/release.datasource";
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Add new release" }];
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
    await releaseDatasource.create({
      ...data.data,
      status: ReleaseStatus.healthy,
    });

    return redirect("/dashboard/releases/list");
  } catch (error) {
    if (error instanceof ReleaseUniqueIdentifierError) {
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

export default function AddRelease() {
  const form = useRemixForm<FormValue>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: "",
      name: "",
      version: "",
      url: "",
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
      <h1 className="mb-6">Add new release</h1>
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

          <div className="pt-4">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Adding..." : "Add release"}
            </Button>
          </div>
        </RemixForm>
      </Form>
    </>
  );
}
