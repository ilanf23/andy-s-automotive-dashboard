import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/jobs")({
  component: () => (
    <PagePlaceholder title="Jobs" description="Technician job board and assignments." />
  ),
});
