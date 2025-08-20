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
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DangerZonePage() {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;

    console.log("🔴 CLIENT: Starting account deletion process...");
    setIsDeleting(true);

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
      alert(error instanceof Error ? error.message : "Failed to delete account");
      setIsDeleting(false);
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

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <p className="font-medium">This action will:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Delete all your websites and analytics data</li>
              <li>Cancel any active subscriptions</li>
              <li>Remove all your personal information</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
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
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "DELETE" || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
