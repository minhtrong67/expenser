import { useT } from '../../i18n';
import Icon from './Icon';

export const AUTHOR = 'minhtrong67';

/** Highlighted credit: the author and the AI that helped build the app. Shown ONLY at the end of Settings. */
export default function AuthorCredit({ className = '' }) {
  const t = useT();

  return (
    <section
      className={`relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-container via-secondary-container to-tertiary-container p-6 text-on-primary-container ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-tertiary/10" />
      <p className="relative text-label-md uppercase tracking-widest opacity-80">{t('credit.title')}</p>
      <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex flex-1 items-center gap-3 rounded-3xl bg-surface/70 p-4 backdrop-blur">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-elev-1">
            <Icon name="code" size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-label-md text-on-surface-variant">{t('credit.author')}</p>
            <p className="wrap-any text-title-lg font-bold text-primary">{AUTHOR}</p>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 rounded-3xl bg-surface/70 p-4 backdrop-blur">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tertiary text-on-tertiary shadow-elev-1">
            <Icon name="auto_awesome" size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-label-md text-on-surface-variant">{t('credit.ai')}</p>
            <p className="wrap-any text-title-lg font-bold text-tertiary">
              Claude <span className="text-label-md font-medium text-on-surface-variant">· Anthropic</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
