import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/customers/")({
  component: () => (
    <PagePlaceholder title="Customers" description="All customers in one place." />
  ),
});
