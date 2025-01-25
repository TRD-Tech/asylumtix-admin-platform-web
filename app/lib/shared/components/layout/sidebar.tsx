import {
  SignedIn,
  useAuth,
  UserButton,
  UserProfile,
  useSession,
} from "@clerk/remix";
import { Link, useLocation } from "@remix-run/react";
import { Home, List, ListOrdered, Map, Replace, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuButton,
} from "~/components/ui/sidebar";

export function AppSidebar() {
  const { pathname } = useLocation();

  const session = useSession();

  return (
    <SignedIn>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>

            <SidebarGroupContent>
              <Link to="/dashboard">
                <SidebarMenuButton isActive={pathname === "/dashboard"}>
                  <Home /> Home
                </SidebarMenuButton>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Releases</SidebarGroupLabel>

            <SidebarGroupContent>
              <Link to="/dashboard/releases/list">
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/releases/list"}
                >
                  <ListOrdered /> List
                </SidebarMenuButton>
              </Link>

              <Link to="/dashboard/releases/distribution">
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/releases/distribution"}
                >
                  <Replace /> Distribution
                </SidebarMenuButton>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Clients</SidebarGroupLabel>

            <SidebarGroupContent>
              <Link to="/dashboard/clients/list">
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/clients/list"}
                >
                  <Users /> List
                </SidebarMenuButton>
              </Link>

              <Link to="/dashboard/clients/venues">
                <SidebarMenuButton
                  isActive={pathname === "/dashboard/clients/venues"}
                >
                  <Map /> Venues
                </SidebarMenuButton>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-x-2">
            <UserButton></UserButton>
            <small className="cursor-default">
              {session.session?.user.fullName}
            </small>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SignedIn>
  );
}
