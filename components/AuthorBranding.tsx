"use client";

export function AuthorBranding() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        Built by <strong className="text-foreground">Tanner</strong>
      </span>
      <a
        href="https://twitter.com/PickleLeagues"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium"
      >
        @PickleLeagues
      </a>
    </div>
  );
}
