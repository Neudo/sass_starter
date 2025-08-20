"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, Download, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface DangerClientProps {
  siteId: string;
  domain: string;
}

export function DangerClient({ siteId, domain }: DangerClientProps) {
  const router = useRouter();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [accountDeleteConfirmation, setAccountDeleteConfirmation] =
    useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");

  const handleResetData = async () => {
    if (resetConfirmation !== "RESET") return;

    setIsResetting(true);
    setError("");

    try {
      console.log("here");

      const response = await fetch(`/api/sites/${siteId}/reset`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset analytics data");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
      setError(error instanceof Error ? error.message : "Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteSite = async () => {
    if (deleteConfirmation !== "DELETE") return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete site");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting site:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete site"
      );
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (accountDeleteConfirmation !== "DELETE ACCOUNT") return;

    console.log("🔴 CLIENT: Starting account deletion process...");
    setIsDeletingAccount(true);
    setError("");

    try {
      console.log("🔴 CLIENT: Sending DELETE request to /api/account/delete");
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("🔴 CLIENT: Received response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        console.log("🔴 CLIENT: Response not OK, parsing error...");
        const errorData = await response.json();
        console.error("🔴 CLIENT: Error data received:", errorData);
        throw new Error(errorData.error || "Failed to delete account");
      }

      console.log("🔴 CLIENT: Parsing success response...");
      const successData = await response.json();
      console.log("🔴 CLIENT: Success data:", successData);

      console.log("🔴 CLIENT: Redirecting to home page...");
      // Redirect to home page after account deletion
      window.location.href = "/";
    } catch (error) {
      console.error("🔴 CLIENT: Error during account deletion:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setIsDeletingAccount(false);
    }
  };

  const handleTransferSite = async () => {
    if (!transferEmail) return;

    setIsTransferring(true);
    setError("");

    try {
      const response = await fetch(`/api/sites/${siteId}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newOwnerEmail: transferEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send transfer request");
      }

      setTransferEmail("");
      alert("Transfer request sent successfully!");
    } catch (error) {
      console.error("Error transferring site:", error);
      setError(
        error instanceof Error ? error.message : "Failed to transfer site"
      );
    } finally {
      setIsTransferring(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(
        `/api/export/csv?domain=${encodeURIComponent(domain)}`
      );

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${domain.replace(".", "_")}_backup.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data");
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          <strong>Warning:</strong> Actions on this page are irreversible.
          Please proceed with caution.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-destructive bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reset Analytics Data</CardTitle>
          <CardDescription>
            Clear all analytics data while keeping the site configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Delete all pageviews and visitor data</li>
              <li>Remove all goals and conversion data</li>
              <li>Clear all funnel data</li>
              <li>Reset all statistics to zero</li>
              <li>Keep site settings and configuration</li>
            </ul>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              This action cannot be undone. Consider exporting your data first.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
              Export Data First
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Reset Analytics Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Analytics Data</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all analytics data for this
                    site. Site settings will be preserved.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirmation">
                      Type <span className="font-mono font-bold">RESET</span> to
                      confirm
                    </Label>
                    <Input
                      id="reset-confirmation"
                      value={resetConfirmation}
                      onChange={(e) => setResetConfirmation(e.target.value)}
                      placeholder="Type RESET to confirm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleResetData}
                    disabled={resetConfirmation !== "RESET" || isResetting}
                  >
                    {isResetting ? "Resetting..." : "Reset All Data"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Site Ownership</CardTitle>
          <CardDescription>
            Transfer this site to another Hector Analytics account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-email">New Owner Email</Label>
            <Input
              id="transfer-email"
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleTransferSite}
            disabled={!transferEmail || isTransferring}
          >
            {isTransferring ? "Sending..." : "Send Transfer Request"}
          </Button>

          <div className="text-sm text-muted-foreground">
            The new owner will receive an email invitation to accept the
            transfer. You will lose access to this site once the transfer is
            completed.
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Site</CardTitle>
          <CardDescription>
            Permanently delete this site and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Delete all analytics data permanently</li>
              <li>Remove all goals and funnels</li>
              <li>Disable tracking for this domain</li>
              <li>Delete all site settings and configuration</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <Alert className="border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>This is permanent!</strong> All data will be lost and
              cannot be recovered.
            </AlertDescription>
          </Alert>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Site Permanently
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  site and remove all analytics data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Type <span className="font-mono font-bold">DELETE</span> to
                    confirm
                  </Label>
                  <Input
                    id="confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSite}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Site Permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Delete Account Section */}
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-destructive/80">
            Permanently delete your entire Hector Analytics account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-destructive">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-destructive/80 ml-2">
              <li>Delete your account permanently</li>
              <li>Remove all your sites and analytics data</li>
              <li>Cancel any active subscriptions</li>
              <li>Delete all goals, funnels, and configurations</li>
              <li>Remove your profile and settings</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>WARNING:</strong> This will delete your entire account and
              all associated data. Make sure to export any important data before
              proceeding.
            </AlertDescription>
          </Alert>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <UserX className="h-4 w-4" />
                Delete Account Permanently
              </Button>
            </DialogTrigger>
            <DialogContent className="border-destructive">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Your Account?
                </DialogTitle>
                <DialogDescription>
                  This is irreversible. Your account, all sites, analytics data,
                  and subscriptions will be permanently deleted. This cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Alert className="border-destructive bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive text-sm">
                    All your data will be permanently lost. Please export any
                    important analytics data before proceeding.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="account-confirmation">
                    Type{" "}
                    <span className="font-mono font-bold">DELETE ACCOUNT</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="account-confirmation"
                    value={accountDeleteConfirmation}
                    onChange={(e) =>
                      setAccountDeleteConfirmation(e.target.value)
                    }
                    placeholder="Type DELETE ACCOUNT to confirm"
                    className="border-destructive focus:border-destructive"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={
                    accountDeleteConfirmation !== "DELETE ACCOUNT" ||
                    isDeletingAccount
                  }
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeletingAccount
                    ? "Deleting Account..."
                    : "Delete Account Forever"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
