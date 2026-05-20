import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/ar")({
  component: () => (
    <PagePlaceholder title="Accounts Receivable" description="Outstanding customer balances." />
  ),
});
