import { SignedIn, SignedOut } from "@clerk/remix";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useIsMobile } from "~/hooks/use-mobile";

export default function Navbar() {
  const isMobile = useIsMobile();

  return (
    <header className="w-full h-20 border-b">
      <div className="app-container flex items-center h-full justify-between">
        <div className="flex items-center justify-start gap-x-2">
          {isMobile && (
            <SignedIn>
              <SidebarTrigger />
            </SignedIn>
          )}
          <small className="font-bold">AsylumTix Administration</small>
        </div>

        <nav>
          <SignedOut>
            <Link to={"/login"}>
              <Button variant={"link"}>Login</Button>
            </Link>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
