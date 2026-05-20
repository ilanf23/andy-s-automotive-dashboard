import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/vehicles/$id")({
  component: VehicleDetail,
});

function VehicleDetail() {
  const { id } = Route.useParams();
  return <PagePlaceholder title={`Vehicle #${id}`} />;
}
