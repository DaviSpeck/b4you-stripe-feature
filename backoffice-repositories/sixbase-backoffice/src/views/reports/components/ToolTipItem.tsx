import { useState, FC } from 'react';
import { Tooltip } from 'reactstrap';
import '../reports.scss';
import { TooltipItemProps } from '../../../interfaces/reports.interface';

const TooltipItem: FC<TooltipItemProps> = ({ item, id, children }) => {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const toggle = (): void => setTooltipOpen(!tooltipOpen);

  return (
    <>
      <div id={`Tooltip-${id}`} className="tooltip-custom">
        {children}
      </div>
      <Tooltip
        placement={item.placement as any}
        isOpen={tooltipOpen}
        target={`Tooltip-${id}`}
        toggle={toggle}
      >
        {typeof item.text === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: item.text }} />
        ) : (
          item.text
        )}
      </Tooltip>
    </>
  );
};

export default TooltipItem;
