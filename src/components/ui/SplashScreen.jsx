import { useT } from '../../i18n';

/**
 * The one full-screen loading state. Its markup/styles match the splash inside
 * index.html, so the page goes: static splash -> (React mounts) -> same splash
 * -> app. It never flashes a different spinner in between.
 */
export default function SplashScreen() {
  const t = useT();
  return (
    <div className="splash" role="status" aria-live="polite">
      <div className="splash-spinner" />
      <div className="splash-name">Expenser</div>
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}
