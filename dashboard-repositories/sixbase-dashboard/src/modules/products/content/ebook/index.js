/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../providers/api';
import { notify } from '../../../functions';
import axios from 'axios';
import Switch from 'react-switch';

const ContentEbook = () => {
  const { uuidProduct } = useParams();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [filesDescription, setFilesDescription] = useState(null);

  const [activeEbook, setActiveEbook] = useState(null);

  const [show, setShow] = useState(false);

  const fileElement = useRef(null);

  const { register, handleSubmit, formState } = useForm({ mode: 'onChange' }); // initialize the hook

  const { isValid } = formState;

  useEffect(() => {
    if (removing === false) {
      fetchData();
    }
  }, [removing]);

  const fetchData = () => {
    api
      .get(`products/ebooks/${uuidProduct}`)
      .then((response) => {
        setFiles(response.data.ebooks);
        setFilesDescription(response.data.files_description);
      })
      .catch(() => {});
  };

  const handleDownload = (item) => {
    api
      .get(`/products/ebooks/${uuidProduct}/download/${item.uuid}`, {
        responseType: 'blob',
      })
      .then((blob) => {
        let filename = item.name;

        // Create blob link to download
        const url = window.URL.createObjectURL(blob.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
      })
      .catch(() => {});
  };

  const handleRemove = (item) => {
    setRemoving(item.uuid);

    api
      .delete(`/products/ebooks/${uuidProduct}/${item.uuid}`)
      .then(() => {
        setRemoving(false);
      })
      .catch(() => {
        setIsUploading(false);
      });
  };

  const handleBrowse = (e) => {
    const [file] = e.target.files;
    uploadFile(file);
  };

  const uploadFile = async (file) => {
    const { name, size } = file;
    setIsUploading(true);
    const {
      data: { url, key },
    } = await api.get(`/files?filename=${name}`);
    let options = {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      onUploadProgress: (e) => {
        const { loaded, total } = e;
        let percent = Math.floor((loaded * 100) / total);

        setUploadProgress(percent);
      },
    };
    await axios.put(url, file, options);
    api
      .put(`/products/ebooks/${uuidProduct}`, {
        key,
        filename: name,
        file_size: size,
      })
      .then(() => {
        setUploadProgress(null);
        fetchData();
      })
      .finally(() => setIsUploading(false));
  };

  const onSubmit = (data) => {
    setRequesting(true);

    let fields = data;

    api
      .put(`/products/ebooks/${uuidProduct}/files-description`, fields)
      .then(() => {
        notify({
          message: 'Instruções atualizadas',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Erro ao atualizar',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleFunc = () => {
    setActiveEbook((prev) => ({
      ...prev,
      allow_piracy_watermark: !prev.allow_piracy_watermark,
    }));
    api
      .put(`/products/ebooks/${uuidProduct}/update/${activeEbook.uuid}`, {
        allow_piracy_watermark: !activeEbook.allow_piracy_watermark,
      })
      .then(() => {
        notify({
          message: 'Configuração atualizada',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Erro ao atualizar',
          type: 'error',
        });
      });
  };

  return (
    <>
      <section id='ebook'>
        <Row>
          <Col>
            <h4 className='mb-3'>Arquivos</h4>

            <Card>
              <Card.Body style={{ overflow: 'auto' }}>
                {!isUploading ? (
                  <input
                    type='file'
                    ref={fileElement}
                    multiple={false}
                    onChange={handleBrowse}
                    className='form-control'
                  />
                ) : (
                  <>
                    <div className='uploading'>
                      <div>
                        <i className='fa fa-spinner  fa-spin' />
                        <span>
                          {uploadProgress < 100
                            ? 'Subindo arquivo, aguarde...'
                            : 'Processando...'}
                        </span>
                      </div>
                      {uploadProgress && (
                        <span
                          className={
                            uploadProgress < 100
                              ? 'upload-progress'
                              : 'upload-progress done'
                          }
                        >
                          {uploadProgress}%
                        </span>
                      )}
                    </div>
                  </>
                )}
                <Modal
                  show={show}
                  className='modal-filter'
                  onHide={() => setShow(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Marca D'água</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className='d-flex align-items-center'>
                      <Switch
                        onChange={handleFunc}
                        checked={!activeEbook?.allow_piracy_watermark}
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
                      <div className='ml-2'>Remover marca d'água</div>
                    </div>
                    <div className='mt-4'>
                      <small>
                        A marca d'água é uma ferramenta de proteção contra a
                        pirataria, a marca adiciona dados pessoais do comprador
                        ao final de cada ebook.
                      </small>
                    </div>
                  </Modal.Body>
                </Modal>

                <Table className='mb-0' striped>
                  <thead>
                    <tr>
                      <th>Arquivo</th>
                      <th width='80' className='text-center'>
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td style={{ overflowX: 'hidden' }}>
                            <span
                              className='file-name text-wrap'
                              onClick={() => {
                                handleDownload(item);
                              }}
                            >
                              {item.name.length > 30
                                ? item.name.substring(0, 30)
                                : item.name}
                            </span>
                          </td>
                          <td className='text-center d-flex'>
                            <ButtonDS
                              variant='primary'
                              outline
                              size='icon'
                              className={'mr-2'}
                              onClick={() => {
                                setActiveEbook(item);
                                setShow(true);
                              }}
                            >
                              <i className='bx bx-cog'></i>
                            </ButtonDS>
                            {!removing ? (
                              <ButtonDS
                                variant='danger'
                                size='icon'
                                onClick={() => {
                                  handleRemove(item);
                                }}
                              >
                                <i className='bx bx-trash-alt'></i>
                              </ButtonDS>
                            ) : (
                              <>
                                {removing === item.uuid && (
                                  <i className='bx bx-loader-alt bx-spin' />
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {files.length === 0 && (
                      <tr>
                        <td colSpan='100' className='text-center'>
                          Nenhum arquivo encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <h4 className='mb-3'>Instruções para os alunos</h4>
            <Card>
              <Card.Body>
                {true && (
                  <>
                    <Form.Control
                      ref={register}
                      name='files_description'
                      as='textarea'
                      placeholder='Registre informações pertinentes sobre seus arquivos aqui...'
                      rows='10'
                      defaultValue={filesDescription}
                    />
                    <ButtonDS
                      onClick={handleSubmit(onSubmit)}
                      disabled={!isValid || requesting}
                      size='sm'
                    >
                      {!requesting ? 'Salvar' : 'salvando...'}
                    </ButtonDS>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default ContentEbook;
