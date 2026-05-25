import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/layout/AppShell";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ModalProvider } from "@/components/ui/ModalProvider";
import { AuthProvider } from "@/lib/auth-context";

// Public routes use the marketing layout (header + footer).
// Everything else uses the OS shell (sidebar + topbar + AI copilot bar).
const PUBLIC_ROUTES = new Set(["/", "/services", "/about", "/contact", "/login"]);

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname);
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Andy's OS — Andy's Automotive" },
      { name: "description", content: "Shop management for Andy's Automotive." },
      { property: "og:title", content: "Andy's OS — Andy's Automotive" },
      { name: "twitter:title", content: "Andy's OS — Andy's Automotive" },
      { property: "og:description", content: "Shop management for Andy's Automotive." },
      { name: "twitter:description", content: "Shop management for Andy's Automotive." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/86a46a91-48b9-4f25-8dd9-6d15d6a6bb38" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/86a46a91-48b9-4f25-8dd9-6d15d6a6bb38" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const useMarketing = isPublicRoute(pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          {useMarketing ? <PublicLayout /> : <AppShell />}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "border border-border bg-background text-foreground shadow-lg rounded-lg",
                title: "text-sm font-semibold",
                description: "text-xs text-muted-foreground",
                actionButton:
                  "bg-foreground text-background rounded-md px-2 py-1 text-xs font-semibold",
                cancelButton:
                  "bg-surface text-foreground rounded-md px-2 py-1 text-xs",
                success: "border-brand-green/40",
                error: "border-destructive/40",
              },
            }}
          />
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
