import { FC, ReactNode } from 'react';
import { Info } from 'react-feather';

interface InfoTooltipProps {
  content: string;
  children?: ReactNode;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

const InfoTooltip: FC<InfoTooltipProps> = ({
  content,
  children,
  className = '',
  size = 14,
  style = {},
}) => {
  return (
    <span
      title={content}
      style={{ lineHeight: 0, cursor: 'help', ...style }}
      className={className}
    >
      {children || <Info size={size} className="text-muted" />}
    </span>
  );
};

export default InfoTooltip;
