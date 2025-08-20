"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Copy, ArrowRight, ArrowLeft } from "lucide-react";

interface InstallationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function InstallationStep({ onNext, onPrevious }: InstallationStepProps) {
  const [copied, setCopied] = useState(false);

  const scriptCode = `<script defer src="https://www.hectoranalytics.com/script.js"></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Installation Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Copy the script below</li>
          <li>
            Paste it into the{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              &lt;head&gt;
            </code>{" "}
            section of your HTML
          </li>
          <li>Save and deploy your changes</li>
        </ol>
      </div>

      <div className="space-y-2">
        <Label>Tracking Script</Label>
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto h-[80px] flex justify-start items-end">
            <code>{scriptCode}</code>
          </pre>
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={handleCopyScript}
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Verify Installation
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}