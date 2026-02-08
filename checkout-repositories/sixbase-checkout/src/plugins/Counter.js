import { useState } from 'react';
import { useEffect } from 'react';
import { Col } from 'react-bootstrap';

const Counter = ({ counterObj, sidebarPicture }) => {
  const initialSeconds = counterObj.seconds;
  const [counter, setCounter] = useState(initialSeconds);

  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  const convertTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().slice(14, 19);
  };

  const progressWidth = () => {
    let calculate = (counter * 100) / initialSeconds;
    return 100 - calculate;
  };

  return (
    <div id='plugin-counter'>
      <div className='progress' style={{ width: `${progressWidth()}%` }}></div>
      <div className='all-text container'>
        <Col lg={sidebarPicture ? 9 : 12} className='col'>
          <div className='c-text'>
            <span>
              {counter > 0
                ? `${counterObj.label || 'Essa é a sua única chance!'}`
                : `${counterObj.label_end || 'O tempo acabou.'}`}
            </span>
          </div>
          <div className='timer ml-5'>{convertTime(counter)}</div>
          <i className='las la-stopwatch' />
        </Col>
      </div>
    </div>
  );
};

export default Counter;
