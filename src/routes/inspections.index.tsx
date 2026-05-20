import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/inspections/")({
  component: () => (
    <PagePlaceholder title="Inspections" description="Digital vehicle inspections." />
  ),
});
