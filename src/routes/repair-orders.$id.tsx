import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/repair-orders/$id")({
  component: RepairOrderDetail,
});

function RepairOrderDetail() {
  const { id } = Route.useParams();
  return (
    <PagePlaceholder
      title={`Repair Order #${id}`}
      description="Detailed view of this repair order."
    />
  );
}
