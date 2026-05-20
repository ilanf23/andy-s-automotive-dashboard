import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/estimates/$id")({
  component: EstimateDetail,
});

function EstimateDetail() {
  const { id } = Route.useParams();
  return <PagePlaceholder title={`Estimate #${id}`} description="Customer-facing estimate." />;
}
