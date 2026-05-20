import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/inventory")({
  component: () => (
    <PagePlaceholder title="Inventory" description="Parts and supplies on hand." />
  ),
});
