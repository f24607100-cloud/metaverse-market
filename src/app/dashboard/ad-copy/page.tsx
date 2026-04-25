import { AdCopyForm } from "@/components/dashboard/ad-copy-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdCopyPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
        <h1 className="text-3xl font-semibold font-headline">AI Ad Copy Generator</h1>
        <p className="text-muted-foreground">
            Create compelling ad copy for your products in seconds.
        </p>
        <div className="mt-4">
            <AdCopyForm />
        </div>
    </div>
  );
}
