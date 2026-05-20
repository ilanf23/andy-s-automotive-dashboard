import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/inspections/$id")({
  component: InspectionDetail,
});

function InspectionDetail() {
  const { id } = Route.useParams();
  return <PagePlaceholder title={`Inspection #${id}`} />;
}
