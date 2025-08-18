import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Edit, Trash2, ArrowDown } from "lucide-react";

export default function FunnelsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle>Funnels</CardTitle>
            <CardDescription>
              Track user journeys through multi-step processes like checkouts or signups
            </CardDescription>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Funnel
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example funnel */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">E-commerce Checkout</div>
                  <div className="text-sm text-muted-foreground">
                    Track the complete purchase journey
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">62% conversion rate</Badge>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Product Page</div>
                    <div className="text-sm text-muted-foreground">/product/*</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">1,245 visitors</div>
                  <div className="text-sm text-muted-foreground">100%</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted-foreground text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Add to Cart</div>
                    <div className="text-sm text-muted-foreground">/cart</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">892 visitors</div>
                  <div className="text-sm text-muted-foreground">71.7%</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted-foreground text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Checkout</div>
                    <div className="text-sm text-muted-foreground">/checkout</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">634 visitors</div>
                  <div className="text-sm text-muted-foreground">50.9%</div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Purchase Complete</div>
                    <div className="text-sm text-muted-foreground">/success</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">478 visitors</div>
                  <div className="text-sm text-green-600">38.4%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Another example funnel */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">Newsletter Signup</div>
                  <div className="text-sm text-muted-foreground">
                    Track newsletter conversion process
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">24% conversion rate</Badge>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              3 steps • Landing page → Form page → Thank you page
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funnel Analytics</CardTitle>
          <CardDescription>
            Understand where visitors drop off in your conversion process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Step 1 → Step 2 drop-off</span>
              <span className="text-sm font-medium">28.3%</span>
            </div>
            <Progress value={28.3} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Step 2 → Step 3 drop-off</span>
              <span className="text-sm font-medium">20.8%</span>
            </div>
            <Progress value={20.8} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Step 3 → Step 4 drop-off</span>
              <span className="text-sm font-medium">12.5%</span>
            </div>
            <Progress value={12.5} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Availability</CardTitle>
          <CardDescription>
            Funnels are available in Professional and Enterprise plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current Plan: Hobby</div>
              <div className="text-sm text-muted-foreground">
                Funnels not available in your current plan
              </div>
            </div>
            <Button>Upgrade to Professional</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}