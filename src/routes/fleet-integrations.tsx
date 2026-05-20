import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/fleet-integrations")({
  component: () => (
    <PagePlaceholder
      title="Fleet Integrations"
      description="Connect to fleet management providers."
    />
  ),
});
