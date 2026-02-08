import React from 'react';
import { Badge } from 'react-bootstrap';

const Status = ({ title, color }) => {
  return <Badge variant={color}>{title}</Badge>;
};

export default Status;
