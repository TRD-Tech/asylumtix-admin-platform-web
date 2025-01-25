import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Outlet, redirect } from "@remix-run/react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Home" }];
};

export const loader: LoaderFunction = async (args) => {
  const auth = await getAuth(args);

  if (!auth.userId) return redirect("/login");
  return null;
};

export default function Dashboard() {
  return (
    <div className="app-container py-4 h-full w-full">
      <Outlet />
    </div>
  );
}
