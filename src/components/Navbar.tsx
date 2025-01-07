import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// import MobileNav from "./MobileNav"
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="dark:bg-dark-background/70 dark:border-dark-border fixed start-0 top-0 z-20 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {/* <MobileNav /> */}
          <Link to="/" className="flex items-center ">
            <img src="/images/logo.png" width={60} height={6} />
            <span className="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
              study<span className="text-primary">wise</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {/* <div className="hidden justify-center gap-11 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              className="hover:border-b-2 hover:border-green-600 hover:text-primary"
              href={href}
            >
              {label}
            </Link>
          ))}
        </div> */}

        {/* Action Buttons */}
        <div className="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
          <div className="flex gap-4">
            <div className="hidden md:block lg:block">
              <ModeToggle />
            </div>
            <Link to="/auth/signup">
              <Button
                variant="default"
                className={cn(
                  "hidden h-9 transform rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 dark:bg-primary md:flex lg:flex"
                )}
              >
                Get Started
                <ArrowRight
                  className="ml-1.5 h-5 w-5 transform transition-transform group-hover:translate-x-1 group-hover:scale-110"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
