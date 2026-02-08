import React, { FC } from 'react';
import classnames from 'classnames';
import { TrendingUp, User, Box, DollarSign } from 'react-feather';
import Avatar, { AvatarProps } from '../../@core/components/avatar';
import { FormatBRL } from '../../utility/Utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardText,
  Row,
  Col,
} from 'reactstrap';
import { StatsCardProps, StatData } from '../../interfaces/sales.interface';

const StatsCard: FC<StatsCardProps> = ({ cols, metrics }) => {
  const data: StatData[] = [
    {
      title: metrics?.sales_count || 0,
      subtitle: 'Sales',
      color: 'light-primary',
      icon: <TrendingUp size={24} />,
    },
    {
      title: metrics?.students_count || 0,
      subtitle: 'Customers',
      color: 'light-warning',
      icon: <User size={24} />,
    },
    {
      title: metrics?.products_count || 0,
      subtitle: 'Products',
      color: 'light-primary',
      icon: <Box size={24} />,
    },
    {
      title: FormatBRL(metrics ? metrics.gross_amount : 0),
      subtitle: 'Revenue',
      color: 'light-success',
      icon: <DollarSign size={24} />,
    },
  ];

  const renderData = (): React.ReactNode => {
    return data.map((item, index) => {
      const colMargin = Object.keys(cols);
      const margin = index === 2 ? 'sm' : colMargin[0];
      return (
        <Col
          key={index}
          {...cols}
          className={classnames({
            [`mb-2 mb-${margin}-0`]: index !== data.length - 1,
          })}
        >
          <div className="d-flex align-items-center">
            <Avatar color={item.color as AvatarProps['color']} icon={item.icon} className="me-2" />
            <div className="my-auto">
              <h4 className="fw-bolder mb-0">{item.title}</h4>
              <CardText className="font-small-3 mb-0">{item.subtitle}</CardText>
            </div>
          </div>
        </Col>
      );
    });
  };

  return (
    <Card className="card-statistics">
      <CardHeader>
        <CardTitle tag="h4">Statistics</CardTitle>
        <CardText className="card-text font-small-2 me-25 mb-0">
          {/* Updated 1 month ago */}
        </CardText>
      </CardHeader>
      <CardBody className="statistics-body">
        <Row>{renderData()}</Row>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
