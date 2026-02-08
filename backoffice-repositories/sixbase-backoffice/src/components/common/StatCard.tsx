import { FC, useState, useEffect } from 'react';
import { Spinner } from 'reactstrap';
import { useSkin } from '../../utility/hooks/useSkin';
import InfoTooltip from './InfoTooltip';
import { FormatBRL } from '../../utility/Utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: any;
  isMonetary?: boolean;
  tooltip?: string;
  loading?: boolean;
  animate?: boolean;
  iconColor?: string;
  iconBackgroundColor?: string;
  valueColor?: string;
  onClick?: () => void;
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon: IconComponent,
  isMonetary = false,
  tooltip,
  loading = false,
  animate = true,
  iconColor,
  iconBackgroundColor,
  valueColor,
  onClick,
}) => {
  const { skin } = useSkin();
  const isDark = skin === 'dark';
  const [animatedValue, setAnimatedValue] = useState(0);

  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (!animate || loading) {
      setAnimatedValue(numericValue);
      return;
    }

    const duration = 1000;
    const fps = 60;
    const frames = (duration / 1000) * fps;
    const increment = numericValue / frames;
    let currentFrame = 0;

    const interval = setInterval(() => {
      currentFrame++;
      const currentValue = Math.min(increment * currentFrame, numericValue);
      setAnimatedValue(currentValue);

      if (currentFrame >= frames) {
        clearInterval(interval);
        setAnimatedValue(numericValue);
      }
    }, duration / frames);

    return () => clearInterval(interval);
  }, [numericValue, animate, loading]);

  const displayValue = loading
    ? null
    : isMonetary
    ? FormatBRL(animate ? animatedValue : numericValue)
    : typeof value === 'string'
    ? value
    : (animate ? Math.floor(animatedValue) : numericValue).toLocaleString();

  const defaultIconColor = isDark ? '#ffffff' : '#3b82f6';
  const defaultIconBg = isDark
    ? 'rgba(255,255,255,0.15)'
    : 'rgba(59, 130, 246, 0.1)';

  return (
    <div
      className="d-flex align-items-center w-100"
      style={{
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {IconComponent && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: iconBackgroundColor || defaultIconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconComponent
            size={18}
            color={iconColor || defaultIconColor}
          />
        </div>
      )}
      <div className="flex-fill">
        <div
          style={{
            color: isDark ? '#cbd5e1' : '#64748b',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {title}
          {tooltip && <InfoTooltip content={tooltip} size={12} />}
        </div>
        <div
          style={{
            color: valueColor || (isDark ? '#ffffff' : '#1e293b'),
            fontWeight: 700,
            fontSize: 20,
            transition: 'opacity 0.3s ease-in-out',
            opacity: animatedValue > 0 || !animate ? 1 : 0.7,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <Spinner
              size="sm"
              color={isDark ? 'light' : 'primary'}
            />
          ) : (
            displayValue
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

