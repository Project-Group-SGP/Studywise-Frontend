import { Link } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import Logo from "@/lib/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useAuth } from "./providers/auth";
import { UserAvatar } from "./UserAvatar";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Navbar = () => {
  const { user, logout } = useAuth(); // Get logout from useAuth

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from the context
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="dark:bg-dark-background/70 dark:border-dark-border fixed start-0 top-0 z-20 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <Logo className="h-11 w-11 pt-2" />
            <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-white">
              study<span className="text-primary">wise</span>
            </span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 md:order-2 md:space-x-4 rtl:space-x-reverse mr-2">
          <div className="hidden md:block lg:block">
            <ModeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              {user ? (
                <UserAvatar
                  user={{
                    name: user.name || "User",
                    avatar: user.picture || undefined,
                    userId: user.email || "default",
                  }}
                  size={36}
                />
              ) : (
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>My Groups</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
