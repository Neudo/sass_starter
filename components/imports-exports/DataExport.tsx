"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  AlertCircle,
} from "lucide-react";

interface DataExportProps {
  domain: string;
}

export function DataExport({ domain }: DataExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/export/csv?domain=${encodeURIComponent(domain)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export data");
      }

      // Get the ZIP data and trigger download
      const zipData = await response.arrayBuffer();
      const blob = new Blob([zipData], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Generate filename with current date
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      link.download = `${domain.replace(
        ".",
        "_"
      )}_analytics_export_${thirtyDaysAgo.replace(/-/g, "")}_${today.replace(
        /-/g,
        ""
      )}.zip`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to export data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Export your analytics data in CSV format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Export Analytics Data
            </h3>
            <p className="text-gray-600 mb-6">
              Download all your analytics data from the last 30 days in CSV
              format. The ZIP file will contain visitors, locations, browsers,
              sources, pages, and complete data exports.
            </p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isLoading}
            size="lg"
            className="min-w-48"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Generating Export..." : "Download"}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}