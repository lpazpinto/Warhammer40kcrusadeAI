import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Base paths without extension — `.webp` and `.png` are appended per-element
// inside the <picture> fallback pattern (webp preferred, png fallback).
const sealByTone = {
  operational: "/assets/ui-theme/seals/seal-active-operational",
  warning: "/assets/ui-theme/seals/seal-warning-caution",
  critical: "/assets/ui-theme/seals/seal-critical-emergency",
  victory: "/assets/ui-theme/seals/seal-victory-commendation",
} as const;

type SealTone = keyof typeof sealByTone;

export function StatusSeal({
  tone,
  label,
  className,
}: {
  tone: SealTone;
  label: string;
  className?: string;
}) {
  const base = sealByTone[tone];
  return (
    <div className={cn("status-seal", className)}>
      <picture>
        <source srcSet={`${base}.webp`} type="image/webp" />
        <img
          src={`${base}.png`}
          alt=""
          aria-hidden="true"
          className="status-seal__image"
        />
      </picture>
      <span className="status-seal__label">{label}</span>
    </div>
  );
}

export function CommandHero({
  eyebrow,
  title,
  description,
  actions,
  intel,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  intel?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("command-hero", className)}>
      <div className="command-hero__header-frame">
        <p className="command-title text-xs text-muted-foreground">{eyebrow}</p>
        <h1 className="command-hero__title">{title}</h1>
        <p className="command-hero__description">{description}</p>
      </div>
      {actions ? <div className="command-hero__actions">{actions}</div> : null}
      {intel ? <div className="command-hero__intel">{intel}</div> : null}
    </section>
  );
}

export function DossierPanel({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("dossier-panel", className)}>
      <header className="dossier-panel__header">
        <div className="dossier-panel__title-wrap">
          {icon ? <div className="dossier-panel__icon">{icon}</div> : null}
          <div>
            <h2 className="dossier-panel__title">{title}</h2>
            {subtitle ? (
              <p className="dossier-panel__subtitle">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div>{actions}</div> : null}
      </header>
      <div className="dossier-divider" aria-hidden="true" />
      <div className="dossier-panel__content">{children}</div>
    </section>
  );
}
