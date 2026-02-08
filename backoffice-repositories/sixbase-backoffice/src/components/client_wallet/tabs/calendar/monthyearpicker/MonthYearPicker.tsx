import { FC, useMemo } from 'react';
import moment from 'moment';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Input,
  Label,
} from 'reactstrap';
import { MonthYearPickerProps } from './interfaces/month-year-picker';

export const MONTH_NAMES_PT_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];


const MonthYearPicker: FC<MonthYearPickerProps> = ({
  isOpen,
  currentDate,
  onToggle,
  onSelectMonth,
  onSelectYear,
}) => {
  const yearsAround = useMemo(() => {
    const currentYear = moment().year();
    return Array.from({ length: 8 }, (_, i) => currentYear - 4 + i);
  }, []);

  return (
    <Modal isOpen={isOpen} toggle={onToggle} centered>
      <ModalHeader toggle={onToggle}>Selecionar mês e ano</ModalHeader>
      <ModalBody>
        <Row>
          <Col md="6">
            <Label>Mês</Label>
            <Input
              type="select"
              value={currentDate.month()}
              onChange={(e) => onSelectMonth(Number(e.target.value))}
            >
              {MONTH_NAMES_PT_BR.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </Input>
          </Col>
          <Col md="6">
            <Label>Ano</Label>
            <Input
              type="select"
              value={currentDate.year()}
              onChange={(e) => onSelectYear(Number(e.target.value))}
            >
              {yearsAround.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Input>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default MonthYearPicker;
