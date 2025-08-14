"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface DetailsModalProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  itemCount: number;
}

export function DetailsModal({
  title,
  description,
  children,
}: DetailsModalProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="w-full mt-3"
      >
        Details
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-4">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
