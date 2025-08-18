"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  LogOut,
} from "lucide-react";

interface Property {
  id: string;
  displayName: string;
  name: string;
}

interface ImportJob {
  id: string;
  siteId: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  totalSessions: number;
  importedSessions: number;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

interface ImportsExportsClientProps {
  siteId: string;
  domain: string;
  isGoogleConnected: boolean;
}

export function ImportsExportsClient({
  siteId,
  domain,
  isGoogleConnected,
}: ImportsExportsClientProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeGoals, setIncludeGoals] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch GA properties when component mounts
  useEffect(() => {
    if (isGoogleConnected) {
      fetchProperties();
      fetchImportJobs();
    }
  }, [isGoogleConnected]);

  // Poll for import job updates
  useEffect(() => {
    if (
      importJobs.some(
        (job) => job.status === "pending" || job.status === "running"
      )
    ) {
      const interval = setInterval(fetchImportJobs, 2000);
      return () => clearInterval(interval);
    }
  }, [importJobs]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/google-analytics/properties");
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to fetch Google Analytics properties");
    }
  };

  const fetchImportJobs = async () => {
    try {
      const response = await fetch(
        `/api/google-analytics/import/status?siteId=${siteId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch import jobs");
      }
      const data = await response.json();
      setImportJobs(data.importJobs || []);
    } catch (error) {
      console.error("Error fetching import jobs:", error);
    }
  };

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/auth/google?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error("Failed to get auth URL");
      }
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error connecting to Google:", error);
      setError("Failed to connect to Google Analytics");
      setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Google Analytics account?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google/disconnect", {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }
      
      // Reload the page to update the connection status
      window.location.reload();
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      setError("Failed to disconnect Google Analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartImport = async () => {
    if (!selectedProperty || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    const selectedProp = properties.find((p) => p.id === selectedProperty);
    if (!selectedProp) {
      setError("Selected property not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/google-analytics/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId,
          propertyId: selectedProperty,
          propertyName: selectedProp.displayName,
          startDate,
          endDate,
          includeGoals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start import");
      }

      const data = await response.json();
      console.log("Import started:", data);

      // Refresh import jobs
      fetchImportJobs();

      // Reset form
      setSelectedProperty("");
      setStartDate("");
      setEndDate("");
      setIncludeGoals(false);
    } catch (error) {
      console.error("Error starting import:", error);
      setError(
        error instanceof Error ? error.message : "Failed to start import"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "running":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Running
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Google Analytics Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Google Analytics Import
          </CardTitle>
          <CardDescription>
            Import your historical data from Google Analytics 4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isGoogleConnected ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ExternalLink className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Connect Google Analytics
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your Google Analytics account to import your
                  historical data
                </p>
              </div>
              <Button
                onClick={handleGoogleConnect}
                disabled={isConnecting}
                size="lg"
              >
                {isConnecting ? "Connecting..." : "Connect Google Analytics"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected status with disconnect button */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Google Analytics Connected</p>
                    <p className="text-sm text-green-700">Your account is connected and ready to import data</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoogleDisconnect}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="property">Google Analytics Property</Label>
                    <Select
                      value={selectedProperty}
                      onValueChange={setSelectedProperty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeGoals"
                      checked={includeGoals}
                      onCheckedChange={(checked) => setIncludeGoals(checked === true)}
                    />
                    <Label htmlFor="includeGoals">
                      Include Goals & Conversions
                    </Label>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleStartImport}
                    disabled={
                      isLoading || !selectedProperty || !startDate || !endDate
                    }
                    className="w-full"
                  >
                    {isLoading ? "Starting Import..." : "Start Import"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      {isGoogleConnected && importJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>
              Track the progress and status of your data imports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {importJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium">{job.propertyName}</div>
                      <div className="text-sm text-gray-500">
                        {job.startDate} to {job.endDate}
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  {(job.status === "running" || job.status === "pending") && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Started: {formatDate(job.createdAt)}</span>
                    {job.completedAt && (
                      <span>Completed: {formatDate(job.completedAt)}</span>
                    )}
                  </div>

                  {job.status === "completed" && (
                    <div className="mt-2 text-sm text-green-600">
                      Imported {job.importedSessions} of {job.totalSessions}{" "}
                      sessions
                    </div>
                  )}

                  {job.status === "failed" && job.errorMessage && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {job.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Export your analytics data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Export Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Data export functionality will be available in a future update
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
