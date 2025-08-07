"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WaitlistModal } from "./waitlist-modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  const isProd = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  console.log(isProd);

  // Navigation items definition
  const navItems = [
    { name: "FAQ", path: "/faq", id: "faq" },
    { name: "Contact", path: "/contact", id: "contact" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navItemsDev = [
    { name: "Pricing", path: "/pricing", id: "pricing" },
    { name: "FAQ", path: "/faq", id: "faq" },
    { name: "Blog", path: "/blog", id: "blog" },
    { name: "Contact", path: "/contact", id: "contact" },
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
            <button
              onClick={() => router.push("/")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Logo size="md" showText={true} />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-xl">
              {navItems.map((item) => {
                // External links (like docs, support)
                if (item) {
                  return (
                    <a
                      key={item.id}
                      href={item.path}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  );
                }
              })}
            </div>

            {/* CTA Buttons + Theme Toggle */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-primary/10"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                          alt="User"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
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
                  {isProd ? (
                    <Button
                      size="xl"
                      variant="ghost"
                      onClick={() => router.push("/auth/login")}
                      className={`hover:bg-primary/10 hover:text-primary transition-colors duration-200 `}
                    >
                      Sign In
                    </Button>
                  ) : null}
                  <WaitlistModal
                    triggerComponent={
                      <Button
                        size="xl"
                        className={`bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200`}
                      >
                        Start Free Trial
                      </Button>
                    }
                  />
                  <ThemeToggle />
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
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
                  // External links (like docs, support)
                  if (item) {
                    return (
                      <a
                        key={item.id}
                        href={item.path}
                        className="block px-3 py-2 rounded-md text-base text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        {item.name}
                      </a>
                    );
                  }
                })}

                <div className="pt-4 pb-3 md:border-t md:border-border">
                  {isLoggedIn ? (
                    <div className="flex flex-col space-y-2 px-3">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                            alt="User"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
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
                      {!isProd ? (
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
                      ) : null}

                      {!isProd ? (
                        <Button
                          className="w-full bg-secondary hover:bg-ring text-secondary-foreground"
                          onClick={() => {
                            router.push("/auth/sign-up");
                            setIsMenuOpen(false);
                          }}
                        >
                          Start free trial
                        </Button>
                      ) : (
                        <WaitlistModal
                          triggerComponent={
                            <Button className="w-full bg-secondary hover:bg-ring text-secondary-foreground">
                              Start free trial
                            </Button>
                          }
                        />
                      )}
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
