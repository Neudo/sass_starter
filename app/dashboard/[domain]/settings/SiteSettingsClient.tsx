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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { togglePublicDashboard } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SiteSettingsClientProps {
  siteId: string;
  domain: string;
  publicEnabled: boolean;
}

export function SiteSettingsClient({
  siteId,
  domain,
  publicEnabled: initialPublicEnabled,
}: SiteSettingsClientProps) {
  const router = useRouter();
  const [publicEnabled, setPublicEnabled] = useState(initialPublicEnabled);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const publicUrl = `https://www.hectoranalytics.com/${domain}`;

  const handleTogglePublic = async () => {
    setLoading(true);
    setMessage(null);

    const result = await togglePublicDashboard(siteId, !publicEnabled);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setPublicEnabled(!publicEnabled);
      setMessage({ type: "success", text: result.success });
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
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/${domain}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

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

          {message && (
            <Alert
              className={
                message.type === "error"
                  ? "border-destructive"
                  : "border-green-500"
              }
            >
              {message.type === "error" ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription
                className={
                  message.type === "error"
                    ? "text-destructive"
                    : "text-green-600"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

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
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Basic information about your tracked website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Domain</Label>
            <p className="text-sm text-muted-foreground mt-1">{domain}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Site ID</Label>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {siteId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
