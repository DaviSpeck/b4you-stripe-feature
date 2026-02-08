import { FC } from 'react';
import classnames from 'classnames';
import Chart from 'react-apexcharts';
import { Card, CardBody } from 'reactstrap';
import { StatisticsCardsProps } from '../../../interfaces/reports.interface';


const StatisticsCards: FC<StatisticsCardsProps> = ({
  className,
  hideChart = true,
  iconRight = true,
  iconBg,
  icon,
  stat,
  statTitle,
  options,
  series,
  type,
  height,
  gap = '1',
}) => {
  return (
    <Card style={{ background: 'transparent' }}>
      <CardBody
        className={classnames(`stats-card-body  d-flex gap-${gap} pt-0`, {
          [className || '']: className,
          'flex-column align-items-start': !iconRight && !hideChart,
          'flex-row align-items-center': iconRight,
          'justify-content-center flex-column text-center':
            hideChart && !iconRight,
          'pb-0': !hideChart,
        })}
      >
        <div className="icon-section">
          <div
            className={`avatar avatar-stats p-50 m-0 ${
              iconBg ? `bg-light-${iconBg}` : 'bg-light-primary'
            }`}
          >
            <div className="avatar-content">{icon}</div>
          </div>
        </div>
        <div className="title-section">
          <h2 className="fw-bold mb-25">{stat}</h2>
          <p className="mb-0">{statTitle}</p>
        </div>
      </CardBody>
      {!hideChart && (
        <Chart
          options={options}
          series={series}
          type={type as any}
          height={height ? height : 100}
        />
      )}
    </Card>
  );
};

export default StatisticsCards;
