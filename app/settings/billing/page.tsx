import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the free plan
              </CardDescription>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Pageviews</p>
              <p className="text-2xl font-bold">2,450 / 10,000</p>
              <Progress value={24.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Websites</p>
              <p className="text-2xl font-bold">1 / 3</p>
              <Progress value={33} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Data Retention</p>
              <p className="text-2xl font-bold">90 days</p>
              <div className="h-2 bg-primary rounded" />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button className="w-full md:w-auto">Upgrade to Pro</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Free</h3>
                <p className="text-2xl font-bold mt-2">
                  $0
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">10,000 pageviews/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Up to 3 websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">90 days data retention</span>
                </li>
              </ul>
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            </div>

            <div className="border-2 border-primary rounded-lg p-6 space-y-4 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <div>
                <h3 className="font-semibold text-lg">Pro</h3>
                <p className="text-2xl font-bold mt-2">
                  $9
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">100,000 pageviews/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Unlimited websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">1 year data retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Custom events tracking</span>
                </li>
              </ul>
              <Button className="w-full">Upgrade to Pro</Button>
            </div>

            <div className="border rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Business</h3>
                <p className="text-2xl font-bold mt-2">
                  $49
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">1M+ pageviews/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Unlimited websites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Unlimited data retention</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">API access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No billing history available</p>
            <p className="text-sm mt-1">
              Invoices will appear here once you upgrade
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
