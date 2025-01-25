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
import { Badge } from "~/components/ui/badge";
import { releaseDatasource } from "~/lib/releases/data";
import { ErrorBox } from "~/lib/shared/components/utils/ErrorBox";
import { ReleaseStatus } from "~/lib/releases/data/types/ReleaseStatus";
import { Release } from "~/lib/releases/data/types/Release";
import { Button } from "~/components/ui/button";
import { Pen, Plus, Trash } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { useEffect, useMemo } from "react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Releases" }];
};

type LoaderData = {
  releases: Release[];
};

export const loader: LoaderFunction = async (args) => {
  const releases = await releaseDatasource.getAll();

  return Response.json({
    releases,
  } satisfies LoaderData);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    const releases = await releaseDatasource.getAll();

    const promises = releases.map(async (release) => {
      const updatedStatus = formData.get(`${release.id}:status`);

      if (!updatedStatus) return;
      if (updatedStatus.toString() === release.status) return;

      return releaseDatasource.update(release.id, {
        status: updatedStatus.toString() as ReleaseStatus,
      });
    });

    await Promise.all(promises);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
};

export default function ReleaseList() {
  const { releases } = useLoaderData<typeof loader>() as LoaderData;

  const { toast } = useToast();

  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Saved successfully!",
        description: "Your changes have been saved successfully.",
      });
    }
    if (actionData?.error) {
      toast({
        title: "Oops! Something went wrong",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  const navigation = useNavigation();
  const isSubmitting = useMemo(() => {
    return navigation.state === "submitting";
  }, [navigation]);

  return (
    <>
      <h1 className="mb-6">Releases</h1>

      <Form method="PUT">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.map((release) => (
              <TableRow key={release.id}>
                <TableCell>
                  <Link to={`/dashboard/releases/${release.id}/edit`}>
                    <Button variant={"link"} className="underline">
                      {release.id}
                    </Button>
                  </Link>
                </TableCell>
                <TableCell>{release.name}</TableCell>
                <TableCell>{release.version}</TableCell>
                <TableCell>
                  <a
                    href={release.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {release.url}
                  </a>
                </TableCell>
                <TableCell>
                  <Select
                    name={`${release.id}:status`}
                    defaultValue={release.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ReleaseStatus.healthy}>
                        <Badge variant={"secondary"}>healthy</Badge>
                      </SelectItem>
                      <SelectItem value={ReleaseStatus.broken}>
                        <Badge variant={"destructive"}>broken</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="pt-4 flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>

      <div className="pt-4">
        <Link to="/dashboard/releases/add">
          <Button variant={"ghost"}>
            <Plus /> Add new release
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
