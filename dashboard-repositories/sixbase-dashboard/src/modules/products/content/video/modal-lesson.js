import { useEffect, useState, useRef } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import {
  EditorState,
  convertToRaw,
  ContentState,
  convertFromHTML,
  RichUtils
} from 'draft-js';
import { useForm } from 'react-hook-form';
import Switch from 'react-switch';
import api from '../../../../providers/api';
import Attachments from './attachments';
import Video from './video';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../../../jsx/layouts/ConfirmAction';
import ReactPlayer from 'react-player';
import {
  processEditorHtml,
  prepareHtmlForEditor,
} from '../../../../utils/htmlProcessor';

const ModalLesson = ({
  show,
  setShow,
  uuidProduct,
  activeModule,
  activeLesson,
  setActiveLesson,
  notify,
}) => {
  const { register, setValue, handleSubmit, errors, formState, reset } =
    useForm({ mode: 'onChange' });
  const { isValid } = formState;
  const [checkActive, setCheckActive] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [successReturn, setSuccessReturn] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const videoRef = useRef();

  useEffect(() => {
    setValue('active', checkActive);
  }, [checkActive]);

  useEffect(() => {
    if (show) {
      if (activeLesson) {
        reset({ ...activeLesson, embed_url: activeLesson.vimeo.embed_url });
        setCheckActive(activeLesson.active);

        if (activeLesson.description) {
          const preparedHtml = prepareHtmlForEditor(activeLesson.description);
          setEditorState(
            EditorState.createWithContent(
              ContentState.createFromBlockArray(convertFromHTML(preparedHtml))
            )
          );
        } else {
          setEditorState(EditorState.createEmpty());
        }
      } else {
        reset();
        setEditorState(EditorState.createEmpty());
      }
    }
  }, [show]);

  const onSubmit = (data) => {
    if (Object.keys(data).length > 0) {
      data.release = parseInt(data.release);

      const rawContentState = convertToRaw(editorState.getCurrentContent());
      const rawHtml = draftToHtml(rawContentState);
      data.description = processEditorHtml(rawHtml);

      if (selectedVideo) {
        data.gallery_video = selectedVideo.uuid;
      }

      if (embedUrl !== '') {
        const duration = videoRef.current.getDuration();
        data.embed_url = embedUrl;
        data.duration = duration;
      }

      setRequesting('put');

      if (activeLesson) {
        api
          .put(
            '/products/lessons/' + uuidProduct + '/' + activeLesson.uuid,
            data
          )
          .then(() => {
            notify({ message: 'Salvo com sucesso', type: 'success' });
            closeModal();
          })
          .catch(() => {
            notify({ message: 'Erro ao salvar', type: 'error' });
          })
          .finally(() => setRequesting(null));
      } else {
        api
          .post('/products/lessons/' + uuidProduct + '/' + activeModule, data)
          .then((response) => {
            notify({ message: 'Aula criada com sucesso', type: 'success' });

            setActiveLesson(response.data);
            setRequesting(false);
          })
          .catch(() => {
            notify({ message: 'Erro ao salvar', type: 'error' });
          })
          .finally(() => setRequesting(null));
      }
    }
  };

  const handleDelete = () => {
    setRequesting('delete');
    api
      .delete('/products/lessons/' + uuidProduct + '/' + activeLesson.uuid)
      .then(() => {
        notify({ message: 'Aula removida com sucesso', type: 'success' });
        closeModal();
      })
      .catch(() => {
        notify({ message: 'Falha ao remover a aula', type: 'error' });
      });
  };

  const closeModal = () => {
    setShow(false);
  };

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (e) => {
    setEditorState(e);
  };

  return (
    <div>
      <ConfirmAction
        title={'Excluir aula'}
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={handleDelete}
        buttonText='Excluir'
        description={
          'Ao apertar o botão abaixo a aula será excluída permanentemente'
        }
        centered
        simpleConfirm
      />
      <Modal
        show={true}
        centered
        onHide={() => {
          setShow(false);
        }}
        size='lg'
        id='modal-lesson'
      >
        <Modal.Header closeButton>
          <Modal.Title>{activeLesson ? 'Editando ' : 'Nova '} Aula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <label htmlFor=''>Título</label>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      ref={register({ required: true })}
                      name='title'
                      type='text'
                      isInvalid={errors.title}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className='d-flex align-items-center'>
                  <Form.Group className='d-flex align-items-center'>
                    <input type='hidden' name='active' ref={register()} />
                    <Switch
                      onChange={() => {
                        setCheckActive(!checkActive);
                      }}
                      checked={checkActive}
                      checkedIcon={false}
                      uncheckedIcon={false}
                      onColor='#0f1b35'
                      onHandleColor='#fff'
                      boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                      activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                      handleDiameter={24}
                      height={30}
                      width={56}
                      className='react-switch'
                    />
                    <span className='ml-2'>
                      {checkActive ? (
                        <span>Alunos podem ver esta aula</span>
                      ) : (
                        <span className='text-danger'>
                          Alunos <b>NÃO</b> podem ver esta aula
                        </span>
                      )}
                    </span>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <label htmlFor=''>Liberar</label>
                    <Form.Control
                      ref={register()}
                      name='release'
                      as='select'
                      className='select-input'
                    >
                      <option value='0'>Imediatamente</option>
                      {[
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                      ].map((item, index) => {
                        return (
                          <option value={item} key={index}>
                            Após {item} {item > 1 ? 'dias' : 'dia'} da compra
                          </option>
                        );
                      })}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            {activeLesson && (
              <>
                <Col md={12}>
                  <Form.Group>
                    <label
                      htmlFor=''
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <i
                        className='bx bx-video '
                        style={{ fontSize: 24, marginRight: '8px' }}
                      ></i>
                      Vídeo Aula
                    </label>
                    <Video
                      successReturn={successReturn}
                      setSuccessReturn={setSuccessReturn}
                      activeLesson={activeLesson}
                      uuidProduct={uuidProduct}
                      setRequesting={setRequesting}
                      message={true}
                      setSelectedVideo={setSelectedVideo}
                      selectedVideo={selectedVideo}
                      embedUrl={embedUrl}
                      setEmbedUrl={setEmbedUrl}
                      videoRef={videoRef}
                      requesting={requesting}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group style={{ height: 'calc(100% - 50px)' }}>
                    <label
                      htmlFor=''
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <i
                        className='bx bx-text'
                        style={{ fontSize: 24, marginRight: '8px' }}
                      ></i>
                      Conteúdo Escrito
                    </label>
                    <Editor
                      localization={{ locale: 'pt' }}
                      editorState={editorState}
                      onEditorStateChange={onEditorStateChange}
                      handleReturn={() => {
                        const nextState = RichUtils.insertSoftNewline(editorState);
                        setEditorState(nextState);
                        return 'handled';
                      }}
                      editorStyle={{
                        border: '1px solid #ddd',
                        minHeight: 150,
                        padding: '0 20px',
                      }}
                      toolbarClassName='toolbarClassName'
                      wrapperClassName='wrapperClassName'
                      editorClassName='editorClassName'
                      toolbar={{
                        options: [
                          'inline',
                          'blockType',
                          // 'fontSize',
                          // 'fontFamily',
                          'list',
                          // 'textAlign',
                          // 'colorPicker',
                          'link',
                          'emoji',
                          'image',
                          'history',
                        ],
                        inline: {
                          options: [
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough',
                            'monospace',
                          ],
                        },
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Attachments
                    uuidProduct={uuidProduct}
                    activeLesson={activeLesson}
                    setActiveLesson={setActiveLesson}
                  />
                </Col>
              </>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {activeLesson ? (
            <ButtonDS
              size={'sm'}
              onClick={() => setModalCancelShow(true)}
              variant='danger'
              disabled={requesting}
              iconLeft='bx bx-trash-alt'
            >
              {requesting === 'delete' ? 'Excluindo...' : 'Excluir'}
            </ButtonDS>
          ) : (
            <div></div>
          )}
          <div className='d-flex'>
            <ButtonDS
              size={'sm'}
              onClick={handleSubmit(onSubmit)}
              disabled={
                !isValid ||
                requesting === 'put' ||
                (embedUrl && !ReactPlayer.canPlay(embedUrl))
              }
              iconRight={'bx-check-circle'}
            >
              <span>{requesting === 'put' ? 'Salvando...' : 'Salvar'}</span>
            </ButtonDS>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ModalLesson;
