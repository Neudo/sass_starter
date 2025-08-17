"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { updateProfile, updatePassword, signOutOtherSessions } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionMessage, setSessionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setProfileMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setProfileMessage({ type: "success", text: result.success });
      // Refresh user data
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result.error) {
      setPasswordMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setPasswordMessage({ type: "success", text: result.success });
      // Clear form
      e.currentTarget.reset();
    }
    setPasswordLoading(false);
  };

  const handleSignOutOthers = async () => {
    setSessionLoading(true);
    setSessionMessage(null);

    const result = await signOutOtherSessions();

    if (result.error) {
      setSessionMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setSessionMessage({ type: "success", text: result.success });
    }
    setSessionLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and email preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Enter your name"
                defaultValue={user?.user_metadata?.display_name || user?.user_metadata?.full_name || ""}
              />
            </div>

            {profileMessage && (
              <Alert className={profileMessage.type === "error" ? "border-destructive" : "border-green-500"}>
                {profileMessage.type === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={profileMessage.type === "error" ? "text-destructive" : "text-green-600"}>
                  {profileMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
              />
            </div>

            {passwordMessage && (
              <Alert className={passwordMessage.type === "error" ? "border-destructive" : "border-green-500"}>
                {passwordMessage.type === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={passwordMessage.type === "error" ? "text-destructive" : "text-green-600"}>
                  {passwordMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions and sign out from other devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">
                  Active now · This device
                </p>
              </div>
              <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                Active
              </div>
            </div>

            {sessionMessage && (
              <Alert className={sessionMessage.type === "error" ? "border-destructive" : "border-green-500"}>
                {sessionMessage.type === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={sessionMessage.type === "error" ? "text-destructive" : "text-green-600"}>
                  {sessionMessage.text}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOutOthers}
              disabled={sessionLoading}
            >
              {sessionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                "Sign Out All Other Sessions"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}