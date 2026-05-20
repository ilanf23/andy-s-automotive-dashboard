import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/reports")({
  component: () => (
    <PagePlaceholder title="Reports" description="Shop performance and financial reports." />
  ),
});
