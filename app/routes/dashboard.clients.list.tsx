import {
  Form,
  Link,
  MetaFunction,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ActionFunction, LoaderFunction } from "@remix-run/node";

import { clientDatasource } from "~/lib/clients/data";
import { ErrorBox } from "~/lib/shared/components/utils/ErrorBox";
import { Client } from "~/lib/clients/data/types/Client";
import { Button } from "~/components/ui/button";
import { Pen, Plus, Trash } from "lucide-react";
import { releaseDatasource } from "~/lib/releases/data";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import { Release } from "~/lib/releases/data/types/Release";
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Clients" }];
};

type LoaderData = {
  clients: Client[];
  releases: Release[];
};

export const loader: LoaderFunction = async (args) => {
  const clients = await clientDatasource.getAll();
  const releases = await releaseDatasource.getAll();

  return Response.json({
    clients,
    releases,
  } satisfies LoaderData);
};

export const action: ActionFunction = async ({ request }) => {
  if (request.method === "PUT") {
    const data = await request.formData();

    try {
      const clients = await clientDatasource.getAll();
      const promises = clients.map(async (client) => {
        const updatedRelease = data.get(`${client.id}:assignedRelease`);
        if (!updatedRelease) return;
        if (updatedRelease.toString() === client.assignedReleaseId) return;

        return clientDatasource.update(client.id, {
          assignedReleaseId: updatedRelease.toString(),
        });
      });

      await Promise.all(promises);

      return Response.json({ success: true });
    } catch (error) {
      return Response.json({ error: String(error) }, { status: 500 });
    }
  } else {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
};

export default function ClientList() {
  const { clients, releases } = useLoaderData<typeof loader>() as LoaderData;

  const { toast } = useToast();

  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (actionData?.error) {
      toast({
        title: "Oops! Something went wrong",
        description: actionData.error,
        variant: "destructive",
      });
    }

    if (actionData?.success) {
      toast({
        title: "Saved successfully!",
        description: "Your changes have been successfully saved!",
      });
    }
  }, [actionData]);

  const navigation = useNavigation();

  return (
    <>
      <h1 className="mb-6">Clients</h1>

      <Form method="PUT">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Assigned Release</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Button variant={"link"}>{client.id}</Button>
                </TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={client.assignedReleaseId}
                    name={client.id + ":assignedRelease"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a release" />
                    </SelectTrigger>

                    <SelectContent>
                      {releases.map((release) => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={navigation.state === "submitting"}>
            {" "}
            {navigation.state === "submitting" ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>

      <div className="pt-4">
        <Link to="/dashboard/clients/add">
          <Button variant={"ghost"}>
            <Plus /> Add new client
          </Button>
        </Link>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <ErrorBox title="Oops! Something went wrong">
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </ErrorBox>
  );
}
