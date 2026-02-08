import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const PageTitle = ({ path, title }) => {
  const history = useHistory();

  const goToPage = (item) => {
    if (item.url) {
      history.push(item.url);
    }
  };

  return (
    <div className='page-titles'>
      <h2>{title}</h2>
      <Breadcrumb>
        {path?.length > 0 &&
          path.map((item, index) => {
            return (
              <li
                className='breadcrumb-item'
                onClick={() => goToPage(item)}
                key={index}
              >
                <span
                  style={
                    item.url ? { cursor: 'pointer' } : { cursor: 'default' }
                  }
                >
                  {item.text}
                </span>
              </li>
            );
          })}
      </Breadcrumb>
    </div>
  );
};

export default PageTitle;
