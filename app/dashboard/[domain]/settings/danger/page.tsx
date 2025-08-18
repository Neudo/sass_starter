"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trash2, Download } from "lucide-react";
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

  const handleDeleteSite = async () => {
    if (deleteConfirmation !== "DELETE") return;
    
    setIsDeleting(true);
    // Implement site deletion logic here
    console.log("Deleting site...");
    setTimeout(() => {
      setIsDeleting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          <strong>Warning:</strong> Actions on this page are irreversible. Please proceed with caution.
        </AlertDescription>
      </Alert>

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
            <Button variant="outline" className="gap-2">
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
                    This will permanently delete all analytics data for this site.
                    Site settings will be preserved.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirmation">
                      Type <span className="font-mono font-bold">RESET</span> to confirm
                    </Label>
                    <Input
                      id="reset-confirmation"
                      placeholder="Type RESET to confirm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="destructive">
                    Reset All Data
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
              placeholder="email@example.com"
            />
          </div>
          
          <Button variant="outline">
            Send Transfer Request
          </Button>

          <div className="text-sm text-muted-foreground">
            The new owner will receive an email invitation to accept the transfer.
            You will lose access to this site once the transfer is completed.
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
              <strong>This is permanent!</strong> All data will be lost and cannot be recovered.
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
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
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
    </div>
  );
}