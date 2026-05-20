import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/repair-orders/")({
  component: () => (
    <PagePlaceholder
      title="Repair Orders"
      description="Track open, in-progress and completed repair orders."
    />
  ),
});
