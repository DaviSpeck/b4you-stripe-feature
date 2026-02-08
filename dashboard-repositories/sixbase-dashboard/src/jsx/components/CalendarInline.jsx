import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Calendar } from 'react-calendar';
import ButtonDS from './design-system/ButtonDS';
import ModalGeneric from './ModalGeneric';
import './style.scss';
const momentFormat = 'DD/MM/YYYY';

const CalendarInline = ({
  value,
  defaultActiveOption,
  onChange,
  maxDate,
  minDate = moment().set('year', 2022).startOf('year'),
  show,
  setShow,
  calendarSize = 13,
  newLabel = null,
  btnSize = 'sm',
  btnClassName = '',
  fullWidth = false,
}) => {
  const [activeOption, setActiveOption] = useState(null);
  const options = [
    {
      label: 'Ontem',
      startDate: moment()
        .subtract(1, 'day')
        .startOf('day')
        .format(momentFormat),
      endDate: moment().subtract(1, 'day').endOf('day').format(momentFormat),
    },
    {
      label: 'Hoje',
      startDate: moment().startOf('day').format(momentFormat),
      endDate: moment().endOf('day').format(momentFormat),
    },
    {
      label: 'Este mês',
      startDate: moment().startOf('month').startOf('day').format(momentFormat),
      endDate: moment().format(momentFormat),
    },
    {
      label: 'Últimos 7 dias',
      startDate: moment().subtract(6, 'days').format(momentFormat),
      endDate: moment().format(momentFormat),
    },
    {
      label: 'Últimos 14 dias',
      startDate: moment().subtract(13, 'days').format(momentFormat),
      endDate: moment().format(momentFormat),
    },
    {
      label: 'Últimos 30 dias',
      startDate: moment().subtract(29, 'days').format(momentFormat),
      endDate: moment().format(momentFormat),
    },
    {
      label: 'Todo o período',
      startDate: minDate.format(momentFormat),
      endDate: moment().format(momentFormat),
    },
  ];

  useEffect(() => {
    if (defaultActiveOption) {
      setActiveOption(defaultActiveOption);
    }
  }, [defaultActiveOption]);

  const label =
    activeOption !== null ? (
      options[activeOption].label
    ) : (
      <>
        {moment(value[0]).format('DD/MM/YYYY')}
        <i className='bx bx-chevron-right' />
        {moment(value[1]).format('DD/MM/YYYY')}
      </>
    );

  return (
    <div className={`my-calendar ${fullWidth ? 'w-100' : ''}`}>
      <div
        className='calendar-inline d-flex align-items-center'
        onClick={() => {
          setShow(!show);
        }}
      >
        <ButtonDS
          variant={'light'}
          size={btnSize}
          iconLeft={'bx-calendar-alt'}
          outline
          children={newLabel !== null || label}
          className={btnClassName}
          fullWidth={fullWidth}
        ></ButtonDS>
      </div>

      <ModalGeneric
        title='Filtrar Período'
        show={show}
        setShow={setShow}
        id='modal-calendar'
        centered
        size={'lg'}
      >
        <Row>
          <Col md={3}>
            <div className='options'>
              {options.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={activeOption === index ? 'active' : undefined}
                    onClick={() => {
                      setActiveOption(index);
                      let startDateString = options[index].startDate;
                      let startNewData = startDateString.replace(
                        /(\d+[/])(\d+[/])/,
                        '$2$1'
                      );

                      let endDateString = options[index].endDate;
                      let endNewData = endDateString.replace(
                        /(\d+[/])(\d+[/])/,
                        '$2$1'
                      );

                      onChange([new Date(startNewData), new Date(endNewData)]);
                    }}
                  >
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </Col>
          <Col>
            <div className='container-react-calendar'>
              <Calendar
                selectRange={true}
                onChange={(data) => {
                  if (activeOption) setActiveOption(null);
                  onChange(data);
                }}
                value={value}
                maxDate={maxDate}
                minDate={minDate.toDate()}
                className='my-calendar'
              />
            </div>
          </Col>
        </Row>
      </ModalGeneric>
    </div>
  );
};

export default CalendarInline;
