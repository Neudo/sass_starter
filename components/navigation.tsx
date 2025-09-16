"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navigation() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = false;

  // Navigation items definition
  const navItems = [
    { name: "Features", path: "/features", id: "features" },
    { name: "Pricing", path: "/pricing", id: "pricing" },
    { name: "FAQ", path: "/faq", id: "faq" },
    { name: "Contact", path: "/contact", id: "contact" },
  ];

  // Resources dropdown items
  const resourcesItems = [
    { name: "Use Cases", path: "/use-cases", id: "use-cases" },
    { name: "Blog", path: "/blog", id: "blog" },
    { name: "Documentation", path: "/docs", id: "docs", target: "_blank" },
  ];
  return (
    <>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-colors py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Hector Analytics Logo */}
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Logo size="md" showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden-el md:flex items-center space-x-8 text-xl">
              {/* Resources Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-xl text-muted-foreground p-2 hover:text-primary transition-colors duration-200 h-auto font-normal"
                  >
                    Resources
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {resourcesItems.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        href={item.path}
                        className="cursor-pointer w-full px-6 py-4 md:text-xl"
                        target={item.target}
                      >
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {navItems.map((item) => {
                if (item) {
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  );
                }
              })}
            </div>

            {/* CTA Buttons + Theme Toggle */}
            <div className="hidden-el md:flex items-center space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">John Doe</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="mr-2 h-4 w-4">⚙️</span>
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span className="mr-2 h-4 w-4">💳</span>
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      // onClick={onLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    size="xl"
                    variant="ghost"
                    onClick={() => router.push("/auth/login")}
                    className={`hover:bg-primary/10 hover:text-primary transition-colors duration-200 `}
                  >
                    Sign In
                  </Button>
                  <Button
                    size="xl"
                    className={`bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200`}
                    onClick={() => router.push("/auth/sign-up")}
                  >
                    Start For Free
                  </Button>
                  <ThemeToggle />
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="min-[961px]:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-primary/10"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border mt-4">
                {navItems.map((item) => {
                  if (item) {
                    return (
                      <Link
                        key={item.id}
                        href={item.path}
                        className="block px-3 py-2 rounded-md text-base text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        {item.name}
                      </Link>
                    );
                  }
                })}

                {/* Resources section for mobile */}
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-foreground mb-2">
                    Resources
                  </div>
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      target={item.target}
                      className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 ml-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="pt-4 pb-3 md:border-t md:border-border">
                  {isLoggedIn ? (
                    <div className="flex flex-col space-y-2 px-3">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                            JD
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            John Doe
                          </div>
                          <div className="text-xs text-muted-foreground">
                            john@company.com
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          router.push("/dashboard");
                          setIsMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => {
                          // onLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center px-3 space-y-2 flex-col">
                      <Button
                        variant="ghost"
                        className="w-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          router.push("/auth/login");
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>

                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          router.push("/auth/sign-up");
                          setIsMenuOpen(false);
                        }}
                      >
                        Start now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
