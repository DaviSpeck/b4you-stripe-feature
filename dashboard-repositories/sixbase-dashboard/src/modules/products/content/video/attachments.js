import { useState } from 'react';
import { Col, ProgressBar, Row, Table } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import api from '../../../../providers/api';
import imageCloud from '../../../../images/feather-cloud.svg';
import Loader from '../../../../utils/loader';
import { notify } from '../../../functions';
import axios from 'axios';

const Attachments = ({ uuidProduct, activeLesson, setActiveLesson }) => {
  const [uploadProgress, setUploadProgress] = useState(null);
  const [deletingID, setDeletingID] = useState([]);
  const maxFileSize = 52428800; // 50mb

  const handleDrop = async (files, rejectedFiles) => {
    const options = {
      onUploadProgress: (e) => {
        const { loaded, total } = e;
        let percent = Math.floor((loaded * 100) / total);
        setUploadProgress(percent);
      },
    };

    const newAttachments = [...activeLesson.attachments];

    for await (const file of files) {
      const {
        data: { url, key },
      } = await api.get(`/files?filename=${file.name}`);
      await axios.put(url, file, options);

      const response = await api.put(
        '/products/lessons/' +
          uuidProduct +
          '/' +
          activeLesson.uuid +
          '/attachment',
        {
          key,
          filename: file.name,
          file_size: file.size,
        }
      );
      newAttachments.push(response.data);
    }
    setActiveLesson((prev) => {
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
    setUploadProgress(null);

    rejectedFiles &&
      rejectedFiles.map((item) => {
        return notify({
          message:
            item.file.size > maxFileSize
              ? `Arquivo ultrapassa o limite de 50 MB - ${item.file.name} `
              : `Erro ao enviar o arquivo ${item.file.name}`,
          type: 'error',
        });
      });
  };

  const removeAttachment = (item) => {
    setDeletingID((prevDeleting) => [...prevDeleting, item.uuid]);
    api
      .delete(
        `products/lessons/${uuidProduct}/${activeLesson.uuid}/${item.uuid}`
      )
      .then((response) => {
        let newAttachments = response.data.attachments;
        setActiveLesson((prev) => ({ ...prev, attachments: newAttachments }));
        setDeletingID((prevDeleting) =>
          prevDeleting.filter((uuid) => uuid !== item.uuid)
        );
      })
      .catch(() => {});
  };
  const downloadAttachment = (item) => {
    api
      .get(`products/lessons/${uuidProduct}/attachment/download/${item.uuid}`, {
        responseType: 'blob',
      })
      .then((blob) => {
        let filename = item.original_name;

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

  const formatFileName = (name) => {
    let newName = '';
    if (name.length > 60) {
      let explode = name.split('.');
      let ext = explode[explode.length - 1];

      newName = name.substr(0, 60) + '...' + ext;
    } else {
      newName = name;
    }

    return newName;
  };

  return (
    <div className='attachments doc'>
      <div className='mb-4'>
        <label htmlFor='' style={{ display: 'flex', alignItems: 'center' }}>
          <i className='bx bx-paperclip' style={{ fontSize: 24 }}></i>{' '}
          <div className='ml-2'>Anexos</div>
        </label>

        <Row>
          <Col md={12}>
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) =>
                handleDrop(acceptedFiles, rejectedFiles)
              }
              accept='image/jpeg,image/png,image/gif,image/x-adobe-dng,application/pdf,.doc,.docx,.xls,.xlsx,.dng'
              maxSize={maxFileSize}
              multiple={true}
              className='drop-zone-sb'
            >
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragReject,
              }) => {
                return (
                  <div
                    {...getRootProps()}
                    isDragActive={isDragActive}
                    isDragReject={isDragReject}
                  >
                    <div className='form-group'>
                      <div className='c-img'>
                        <div
                          className={
                            isDragActive
                              ? 'dragActive input-image'
                              : 'input-image'
                          }
                        >
                          {isDragActive && (
                            <div className='dragActiveMessage'>
                              <i className='bx bx-upload'></i>
                              <div>Solte seu arquivo aqui</div>
                            </div>
                          )}
                          {uploadProgress && (
                            <div className='dragActiveMessage'>
                              <Loader />
                            </div>
                          )}
                          <div className='left'>
                            <img src={imageCloud} />
                          </div>
                          <div className='right'>
                            <h4>Anexar arquivo</h4>
                            <p>
                              PDF, JPG, PNG, DNG, DOC, DOCX, XLS ou XLSX,
                              tamanho do arquivo não superior a 50 MB
                            </p>
                            <div
                              className={
                                'input-default btn btn-outline-primary'
                              }
                            >
                              Selecionar arquivo
                            </div>
                            <input {...getInputProps()} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </Dropzone>

            {uploadProgress && (
              <ProgressBar
                now={uploadProgress}
                label={`${uploadProgress.toFixed(2)}%`}
                style={{ height: 16, marginBottom: '16px' }}
              />
            )}
          </Col>

          {activeLesson.attachments.length > 0 && (
            <Col md={12}>
              <Table>
                {activeLesson.attachments.map((item, index) => {
                  return (
                    <div key={index} className='file mb-3'>
                      <div className='left'>
                        <i className='bx bx-paperclip'></i>
                        <div
                          className='filename '
                          onClick={() => {
                            downloadAttachment(item);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {formatFileName(item.original_name)}
                        </div>
                      </div>

                      <i
                        onClick={(e) => {
                          e.preventDefault();
                          removeAttachment(item, index);
                        }}
                        className={
                          deletingID.includes(item.uuid)
                            ? 'bx bx-loader-alt bx-spin'
                            : 'bx bx-trash'
                        }
                      ></i>
                    </div>
                  );
                })}
                {activeLesson.attachments.length === 0 && (
                  <>
                    <tr>
                      <td className='text-center' colSpan='100'>
                        {/* <small>Nenhum anexo enviado.</small> */}
                      </td>
                    </tr>
                  </>
                )}
              </Table>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default Attachments;
