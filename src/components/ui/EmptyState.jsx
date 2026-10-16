import Icon from './Icon';
import Button from './Button';

export default function EmptyState({ icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
        <Icon name={icon} size={30} />
      </span>
      <p className="max-w-xs text-body-md text-on-surface-variant">{text}</p>
      {action && (
        <Button variant="tonal" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
