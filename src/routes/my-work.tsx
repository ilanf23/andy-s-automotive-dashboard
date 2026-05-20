import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/PagePlaceholder";

export const Route = createFileRoute("/my-work")({
  component: () => (
    <PagePlaceholder title="My Work" description="Tasks assigned to you." />
  ),
});
