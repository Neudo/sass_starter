"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavigationProps {
  currentPage:
    | "home"
    | "pricing"
    | "login"
    | "signup"
    | "forgot-password"
    | "demo"
    | "dashboard";
  onNavigate: (
    page:
      | "home"
      | "pricing"
      | "login"
      | "signup"
      | "forgot-password"
      | "demo"
      | "dashboard"
  ) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Navigation({
  currentPage,
  onNavigate,
  isLoggedIn,
  onLogout,
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Dana Analytics Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Logo size="md" showText={true} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate("home")}
              className={`transition-colors duration-200 ${
                currentPage === "home"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("demo")}
              className={`transition-colors duration-200 ${
                currentPage === "demo"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Demo
            </button>
            {isLoggedIn && (
              <button
                onClick={() => onNavigate("dashboard")}
                className={`transition-colors duration-200 ${
                  currentPage === "dashboard"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Dashboard
              </button>
            )}
            <button
              onClick={() => onNavigate("pricing")}
              className={`transition-colors duration-200 ${
                currentPage === "pricing"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Pricing
            </button>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Support
            </a>
          </div>

          {/* CTA Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

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
                  <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
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
                    onClick={onLogout}
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
                  variant="ghost"
                  onClick={() => onNavigate("login")}
                  className={`hover:bg-primary/10 hover:text-primary transition-colors duration-200 ${
                    currentPage === "login" ? "text-primary bg-primary/10" : ""
                  }`}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => onNavigate("signup")}
                  className={`bg-secondary hover:bg-ring text-secondary-foreground transition-colors duration-200 ${
                    currentPage === "signup" ? "bg-ring" : ""
                  }`}
                >
                  Free Trial
                </Button>
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <button
                onClick={() => {
                  onNavigate("home");
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base transition-colors w-full text-left ${
                  currentPage === "home"
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate("demo");
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base transition-colors w-full text-left ${
                  currentPage === "demo"
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                Demo
              </button>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    setIsMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base transition-colors w-full text-left ${
                    currentPage === "dashboard"
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate("pricing");
                  setIsMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base transition-colors w-full text-left ${
                  currentPage === "pricing"
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                Pricing
              </button>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md text-base text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                Support
              </a>

              <div className="pt-4 pb-3 border-t border-border">
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
                        onNavigate("dashboard");
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
                        onLogout();
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
                        onNavigate("login");
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full bg-secondary hover:bg-ring text-secondary-foreground"
                      onClick={() => {
                        onNavigate("signup");
                        setIsMenuOpen(false);
                      }}
                    >
                      Free Trial
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
