"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { togglePublicDashboard } from "../actions";
import { toast } from "sonner";

interface PublicDashboardSettingsProps {
  siteId: string;
  domain: string;
  publicEnabled: boolean;
}

export function PublicDashboardSettings({
  siteId,
  domain,
  publicEnabled: initialPublicEnabled,
}: PublicDashboardSettingsProps) {
  const [publicEnabled, setPublicEnabled] = useState(initialPublicEnabled);
  const [loading, setLoading] = useState(false);

  const publicUrl = `https://www.hectoranalytics.com/${domain}`;

  const handleTogglePublic = async () => {
    setLoading(true);

    const result = await togglePublicDashboard(siteId, !publicEnabled);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      setPublicEnabled(!publicEnabled);
      toast.success(result.success);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Dashboard</CardTitle>
          <CardDescription>
            Share your analytics publicly with a custom URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-toggle" className="text-base">
                Enable public dashboard
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone with the link to view your analytics data
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={publicEnabled}
              onCheckedChange={handleTogglePublic}
              disabled={loading}
            />
          </div>

          {publicEnabled && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Public URL</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 p-3 bg-background border rounded-md font-mono text-sm">
                    {publicUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(publicUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Anyone with this link can view your analytics data. The
                  dashboard will show the same information as your private
                  dashboard, but visitors won&apos;t be able to modify settings
                  or access other sites.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Updating settings...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control what data is visible in your public dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show visitor locations</Label>
              <p className="text-sm text-muted-foreground">
                Display country and city information
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show referrer information</Label>
              <p className="text-sm text-muted-foreground">
                Display where visitors came from
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show top pages</Label>
              <p className="text-sm text-muted-foreground">
                Display most visited pages
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button variant="outline">Save Privacy Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
