import React, { useEffect, useRef, useState } from 'react';
import { Pagination, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CalendarInline from './CalendarInline';
import ExportExcel from './ExportExcel';

const DataTable = ({
  title,
  object,
  children,
  perPage,
  unit,
  skeleton,
  calendar,
  size,
  exportExcel,
  className,
}) => {
  const sort = perPage ? perPage : 10;
  let jobPaggination = Array(Math.ceil(object.data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  const activePag = useRef(0);
  const jobData = useRef(
    object.data.slice(activePag.current * sort, (activePag.current + 1) * sort)
  );
  const [demo, setdemo] = useState();
  const handleClick = (i) => {
    activePag.current = i;

    jobData.current = object.data.slice(
      activePag.current * sort,
      (activePag.current + 1) * sort
    );
    setdemo(
      object.data.slice(
        activePag.current * sort,
        (activePag.current + 1) * sort
      )
    );
  };
  useEffect(() => {
    handleClick(0);
  }, [object]);

  return (
    <div className='card data-table'>
      {title && title.length > 0 && (
        <>
          <div className='card-header'>
            <h4 className='card-title'>{title}</h4>
            <div className='comands'>
              {calendar && (
                <CalendarInline dates={calendar} maxDate={new Date()} />
              )}
              {exportExcel && <ExportExcel exportUrl={exportExcel} />}
            </div>
          </div>
        </>
      )}
      <div className='card-body'>
        {children}
        <Table responsive className={className} size={size}>
          <thead>
            <tr role='row'>
              {object.columns.map((d, i) => (
                <th key={i}>{d}</th>
              ))}
            </tr>
          </thead>
          {skeleton === false ? (
            <tbody>
              {jobData.current.map((d, i) => (
                <tr key={i}>
                  {d.map((da, i) => (
                    <td key={i}>{da ? da : '-'}</td>
                  ))}
                </tr>
              ))}
              {jobData.current.length === 0 && (
                <tr>
                  <td colSpan='100'>
                    <div className='d-block text-center'>
                      Sem {unit} encontradas.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          ) : (
            <tbody>
              <tr>
                {object.columns.map((item, index) => {
                  return <td key={index}>Carregando...</td>;
                })}
              </tr>
            </tbody>
          )}
          {/* <tfoot>
                <tr role='row'>
                  {object.columns.map((d, i) => (
                    <th key={i}>{d}</th>
                  ))}
                </tr>
              </tfoot> */}
        </Table>
        {jobData.current.length > 0 && (
          <div className='d-flex justify-content-between align-items-center mt-3'>
            <div className='dataTables_info'>
              <b>
                {object.data.length} {unit ? unit : 'registros'}
              </b>{' '}
              - Mostrando de {activePag.current * sort + 1} até{' '}
              {object.data.length < (activePag.current + 1) * sort
                ? object.data.length
                : (activePag.current + 1) * sort}
            </div>
            {jobPaggination.length > 1 && (
              <div className='dataTables_paginate paging_simple_numbers'>
                <Pagination
                  className='pagination-primary pagination-circle'
                  size='lg'
                >
                  <li
                    className='page-item page-indicator '
                    onClick={() =>
                      activePag.current > 1 &&
                      handleClick(activePag.current - 1)
                    }
                  >
                    <Link className='page-link' to='#'>
                      <i className='la la-angle-left' />
                    </Link>
                  </li>
                  {jobPaggination.map((number, i) => (
                    <Pagination.Item
                      className={activePag.current === i ? 'active' : ''}
                      onClick={() => handleClick(i)}
                      key={i}
                    >
                      {number}
                    </Pagination.Item>
                  ))}
                  <li
                    className='page-item page-indicator'
                    onClick={() =>
                      activePag.current + 1 < jobPaggination.length &&
                      handleClick(activePag.current + 1)
                    }
                  >
                    <Link className='page-link' to='#'>
                      <i className='la la-angle-right' />
                    </Link>
                  </li>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
