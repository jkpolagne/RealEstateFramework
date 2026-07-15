interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="admin-page-header">
      <h1>{title}</h1>
      <p className="text-muted">This module is coming soon.</p>
    </div>
  );
}
