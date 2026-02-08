import moment from 'moment';
import 'moment/locale/pt-br';
import { useEffect, useState } from 'react';
import api from '../../providers/api';
import Avatar from './avatar';

moment.locale('pt-br');

const Answer = ({ activeQuestion, setActiveQuestion, setShow }) => {
  const [requesting, setRequesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/questions/${activeQuestion.uuid}`)
      .then((response) => {
        setAnswers(response.data.answers);
        setLoading(false);
      })
      .catch(() => {});

    return () => {
      setActiveQuestion(null);
    };
  }, []);

  const handleReply = () => {
    let fields = {
      message,
    };
    setRequesting(true);

    api
      .post(`/questions/${activeQuestion.uuid}`, fields)
      .then((response) => {
        setAnswers(response.data.answers);
        setMessage('');
        setRemoving(false);
        setRequesting(false);
      })
      .catch(() => {});
  };

  const handleRemove = (index, uuidAnswer = null) => {
    setRemoving(index);

    let url = '';
    if (uuidAnswer === null) {
      url = `/questions/${activeQuestion.uuid}`;
    } else {
      url = `/questions/${activeQuestion.uuid}/${uuidAnswer}`;
    }

    api.delete(url).then((response) => {
      if (uuidAnswer === null) {
        setShow(false);
      } else {
        setAnswers(response.data.answers);
      }

      setRemoving(false);
    });
  };

  return (
    <>
      <div id='modal-question'>
        {activeQuestion && (
          <div className='question-item pt-0'>
            <div className='d-flex'>
              <Avatar
                picture={activeQuestion.student.profile_picture}
                fullName={activeQuestion.student.full_name}
                staff={true}
              />
              <div className='content p-0'>
                <div className='title'>
                  <h4>{activeQuestion.title}</h4>
                  {removing === false ? (
                    <i
                      className='fa fa-trash remove'
                      onClick={() => {
                        handleRemove(-1, null);
                      }}
                    />
                  ) : (
                    removing === -1 && (
                      <i className='bx bx-loader-alt bx-spin remove-loading' />
                    )
                  )}
                </div>

                <div className='message'>{activeQuestion.message}</div>
                <div className='details'>
                  <span className='author'>
                    <i className='bx bx-user' />{' '}
                    {activeQuestion.student.full_name}
                  </span>
                  <span className='created-at'>
                    <i className='bx bx-time' />
                    <span>{moment(activeQuestion.created_at).fromNow()}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {answers.map((item, index) => {
          return (
            <div className='question-item' key={index}>
              <div className='d-flex'>
                <Avatar
                  picture='https://arquivos-mango5.s3.sa-east-1.amazonaws.com/1632763597-h-KgZ85LR9riEVnGM59bk-pp%20%281%29.jfif'
                  fullName='Fernando Kristensen'
                  staff={!item.user.is_student}
                />
                <div className='content'>
                  <div className='title'>
                    {removing === false ? (
                      <i
                        className='fa fa-trash remove'
                        onClick={() => {
                          handleRemove(index, item.uuid);
                        }}
                      />
                    ) : (
                      removing === index && (
                        <i className='bx bx-loader-alt bx-spin remove-loading' />
                      )
                    )}
                  </div>

                  <div className='message'>{item.message}</div>
                  <div className='details'>
                    <span className='author'>
                      <i className='bx bx-user' /> {item.user.full_name}
                    </span>
                    <span className='created-at'>
                      <i className='bx bx-time' />
                      <span>{moment(item.created_at).fromNow()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {loading ? (
          <div
            className='d-flex justify-content-center m-4 p-4'
            style={{ fontSize: 30 }}
          >
            <i className='bx bx-loader-alt bx-spin' />
          </div>
        ) : (
          <>
            <textarea
              className='form-control'
              name=''
              id=''
              rows='6'
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />

            <button
              className='reply btn'
              onClick={handleReply}
              disabled={message.length === 0}
            >
              {!requesting ? (
                'Responder'
              ) : (
                <i className='bx bx-loader-alt bx-spin remove-loading' />
              )}
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Answer;
