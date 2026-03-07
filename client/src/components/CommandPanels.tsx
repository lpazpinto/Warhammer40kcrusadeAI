import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const sealByTone = {
  operational: "/assets/ui-theme/seals/seal-active-operational.webp",
  warning: "/assets/ui-theme/seals/seal-warning-caution.webp",
  critical: "/assets/ui-theme/seals/seal-critical-emergency.webp",
  victory: "/assets/ui-theme/seals/seal-victory-commendation.webp",
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
  return (
    <div className={cn("status-seal", className)}>
      <img
        src={sealByTone[tone]}
        alt=""
        aria-hidden="true"
        className="status-seal__image"
      />
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  intel?: ReactNode;
}) {
  return (
    <section className="command-hero">
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
