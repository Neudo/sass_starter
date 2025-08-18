import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Basic information about your tracked website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              type="text"
              disabled
              className="bg-muted"
              placeholder="example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              type="text"
              placeholder="My Awesome Website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your website..."
              rows={3}
            />
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Code</CardTitle>
          <CardDescription>
            Add this tracking code to your website to start collecting data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>HTML Tracking Code</Label>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              {`<script defer data-domain="example.com" src="https://www.hectoranalytics.com/js/script.js"></script>`}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Copy Code</Button>
            <Button variant="outline">Download</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long your analytics data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Plan: 3 years retention</Label>
            <p className="text-sm text-muted-foreground">
              Your analytics data will be automatically deleted after 3 years
            </p>
          </div>
          
          <Button variant="outline">Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}