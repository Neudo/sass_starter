import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Trash2, Edit } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Goals</CardTitle>
            <CardDescription>
              Track important actions on your website like signups, purchases,
              and downloads
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example goals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Newsletter Signup</div>
                  <div className="text-sm text-muted-foreground">
                    Pageview • /newsletter-success
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">24 conversions</Badge>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Contact Form</div>
                  <div className="text-sm text-muted-foreground">
                    Custom Event • contact_form_submit
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">12 conversions</Badge>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">File Download</div>
                  <div className="text-sm text-muted-foreground">
                    Outbound Link • downloads/whitepaper.pdf
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">8 conversions</Badge>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal Types</CardTitle>
          <CardDescription>
            Choose the type of goal that best fits your tracking needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Pageview Goals</div>
              <p className="text-sm text-muted-foreground mb-3">
                Track when visitors reach a specific page (thank you pages,
                success pages)
              </p>
              <div className="text-xs text-muted-foreground">
                Example: /thank-you, /success, /download-complete
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Custom Events</div>
              <p className="text-sm text-muted-foreground mb-3">
                Track specific user interactions using custom JavaScript events
              </p>
              <div className="text-xs text-muted-foreground">
                Example: button_click, form_submit, video_play
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Outbound Links</div>
              <p className="text-sm text-muted-foreground mb-3">
                Track clicks on external links and file downloads
              </p>
              <div className="text-xs text-muted-foreground">
                Example: social media links, PDF downloads
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal Limits</CardTitle>
          <CardDescription>
            Your current plan allows for limited goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current Plan: Hobby</div>
              <div className="text-sm text-muted-foreground">
                1 goal out of 1 used
              </div>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
