import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/vehicles/")({
  component: () => (
    <PagePlaceholder title="Vehicles" description="Vehicles serviced by the shop." />
  ),
});
