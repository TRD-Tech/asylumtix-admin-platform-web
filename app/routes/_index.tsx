import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction } from "@remix-run/node";
import { Link, Outlet, redirect } from "@remix-run/react";
import { AppSidebar } from "~/lib/shared/components/layout/sidebar";

export const loader: LoaderFunction = async (args) => {
  const auth = await getAuth(args);

  if (!auth.userId) return redirect("/login");
  return redirect("/dashboard");
};

export default function Index() {
  return <h1>You should never see this</h1>;
}
