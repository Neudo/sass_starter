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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";

interface CsvImportProps {
  siteId: string;
}

export function CsvImport({ siteId }: CsvImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: number;
    total: number;
  } | null>(null);

  const handleCsvImport = async () => {
    if (!csvFile) {
      setError("Please select a CSV file");
      return;
    }

    setIsImporting(true);
    setError("");
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);
      formData.append("siteId", siteId);

      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import CSV");
      }

      const result = await response.json();
      setImportResult(result);
      setCsvFile(null);

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      setError(
        error instanceof Error ? error.message : "Failed to import CSV data"
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Import CSV Data
        </CardTitle>
        <CardDescription>
          Import analytics data from a previously exported CSV file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="csvFile">Select CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                disabled={isImporting}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Import the &quot;all_data&quot; CSV file from your exports
              </p>
            </div>

            <Button
              onClick={handleCsvImport}
              disabled={!csvFile || isImporting}
              className="w-full md:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Importing..." : "Import CSV"}
            </Button>
          </div>

          {importResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Import completed! {importResult.imported} sessions imported
                {importResult.errors > 0 &&
                  `, ${importResult.errors} errors encountered`}{" "}
                out of {importResult.total} total rows.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}