import { SignIn } from "@clerk/remix";
import { MetaFunction } from "@remix-run/react";

export const meta: MetaFunction = (args) => {
  return [{ title: "Login" }];
};

export default function Login() {
  return (
    <div className="app-container py-4 flex justify-center">
      <SignIn />
    </div>
  );
}
