import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/schedule")({
  component: () => (
    <PagePlaceholder title="Schedule" description="Appointments and bay scheduling." />
  ),
});
