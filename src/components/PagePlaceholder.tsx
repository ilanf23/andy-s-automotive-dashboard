type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PagePlaceholder({ title, description, children }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-lg border border-border bg-background p-6">
        {children ?? (
          <p className="text-sm text-muted-foreground">
            This screen is ready for you to build out.
          </p>
        )}
      </div>
    </div>
  );
}
