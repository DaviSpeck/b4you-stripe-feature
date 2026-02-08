import { Loader } from 'react-feather';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
  showText?: boolean;
}

export default function LoadingSpinner({
  size = 24,
  className = '',
  text = 'Carregando...',
  showText = false,
}: LoadingSpinnerProps) {
  return (
    <div className={`d-flex flex-column align-items-center ${className}`}>
      <Loader size={size} style={{ animation: 'spin 1s linear infinite' }} />
      {showText && <span className="mt-2 text-muted">{text}</span>}
    </div>
  );
}
