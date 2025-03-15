import { LoaderFunction } from "@remix-run/node";
import { clientDatasource } from "~/lib/clients/data";
import { releaseDatasource } from "~/lib/releases/data";

type ApiResponse = {
  correctRelease: null | {
    id: string;
    name: string;
    url: string;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  // Enable CORS to allow access from any website
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Content-Type": "application/json",

    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, sentry-trace"
  };

  const companyId = params["companyId"];
  if (!companyId)
    return Response.json({ error: "companyId required" }, { headers });

  const client = await clientDatasource.getByCompanyId(companyId);
  if (!client?.assignedReleaseId)
    return Response.json({ correctRelease: null } satisfies ApiResponse, {
      headers,
    });

  const release = await releaseDatasource.getById(client.assignedReleaseId);
  if (!release)
    return Response.json({ correctRelease: null } satisfies ApiResponse, {
      headers,
    });

  return Response.json(
    {
      correctRelease: {
        name: release.name,
        id: release.id,
        url: release.url,
      },
    } satisfies ApiResponse,
    { headers }
  );
};
