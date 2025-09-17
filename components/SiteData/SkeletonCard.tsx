import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  title: string;
  description?: string;
  itemCount?: number;
}

export function SkeletonCard({
  title,
  description,
  itemCount = 5,
}: SkeletonCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-3 min-h-[280px]">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-[30px] w-[90%]" />
              <Skeleton className="h-[30px] w-[30px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
