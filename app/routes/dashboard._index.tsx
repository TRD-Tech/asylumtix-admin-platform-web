import { LoaderFunction } from "@remix-run/node";
import { Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { clientDatasource } from "~/lib/clients/data";
import { releaseDatasource } from "~/lib/releases/data";

export const meta: MetaFunction = (args) => {
  return [{ title: "Home" }];
};

type LoaderData = {
  releaseCount: number;
  clientCount: number;
};

export const loader: LoaderFunction = async (args) => {
  const releases = await releaseDatasource.getAll();
  const clients = await clientDatasource.getAll();

  return Response.json({
    releaseCount: releases.length,
    clientCount: clients.length,
  } satisfies LoaderData);
};

export default function DashboardHome() {
  const { releaseCount, clientCount } = useLoaderData<
    typeof loader
  >() as LoaderData;

  return (
    <>
      <h1 className="mb-6">Home</h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Releases</CardTitle>
            <CardDescription>{releaseCount} releases available</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create, view or edit releases.</p>
          </CardContent>

          <CardFooter>
            <Link to="/dashboard/releases/list">
              <Button>View all releases</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>{clientCount} clients available</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View or edit clients, and assign releases.</p>
          </CardContent>

          <CardFooter>
            <Link to="/dashboard/clients/list">
              <Button>View all clients</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
