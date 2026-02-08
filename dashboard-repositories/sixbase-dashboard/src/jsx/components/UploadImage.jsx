import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { notify } from '../../modules/functions';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';

const UploadImage = ({
  route,
  multiple,
  field,
  update,
  setImg_link = () => {},
  setMarketImg = () => {},
  isOffer = false,
  disabled = false,
  verifyLength = {},
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);

  const { product, setProduct } = useProduct();

  const fileElement = useRef(null);

  const validateImageSizes = (files) => {
    const promises = [];

    Array.from(files).forEach((uploadFile) => {
      promises.push(
        new Promise((resolve, reject) => {
          // Pula validação se for .gif
          if (uploadFile.type === 'image/gif') {
            resolve(true);
            return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(uploadFile);

          reader.onload = function (e) {
            const image = new Image();
            image.src = e.target.result;
            image.onload = function () {
              const height = this.height;
              const width = this.width;

              if (
                width === verifyLength.width &&
                height === verifyLength.height
              ) {
                resolve(true);
              } else {
                resolve(false);
              }
            };
          };

          reader.onerror = function (error) {
            reject(error);
          };
        })
      );
    });

    return Promise.all(promises);
  };

  const handleBrowse = async (e) => {
    if (disabled) {
      e.preventDefault();
      e.target.value = '';
      return;
    }

    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (verifyLength?.width && verifyLength?.height) {
      try {
        const results = await validateImageSizes(selectedFiles);
        if (results.includes(false)) {
          notify({
            message: `Dimensões esperadas: ${verifyLength.width}px x ${verifyLength.height}px`,
            type: 'error',
          });
          return;
        }
      } catch (error) {
        console.error('Erro ao validar as imagens:', error);
      }
    }

    setUploadFiles(selectedFiles);
  };

  useEffect(() => {
    if (uploadFiles.length > 0) {
      Array.from(uploadFiles).map((uploadFile) => {
        if (uploadFile) {
          const formData = new FormData();
          formData.append(field, uploadFile);
          // formData.append('is_bonus', true);

          setIsUploading(true);

          let options = {
            onUploadProgress: (e) => {
              const { loaded, total } = e;
              let percent = Math.floor((loaded * 100) / total);
              setUploadProgress(percent);
            },
            headers: {
              files_data: JSON.stringify([
                {
                  type: uploadFile.type,
                  size: uploadFile.size,
                },
              ]),
            },
          };
          if (isOffer) {
            api
              .put(route, formData, options)
              .then((response) => {
                setIsUploading(false);
                setUploadProgress(null);
                setImg_link(response.data);
                setMarketImg(response.data);
              })
              .catch((err) => {
                console.error(err.response);
                setIsUploading(false);
                if (err.response)
                  notify({ message: err.response.data.message, type: 'error' });
              });
          } else {
            api
              .put(route, formData, options)
              .then((response) => {
                setIsUploading(false);
                setUploadProgress(null);
                setMarketImg(response.data);
                setImg_link(response.data.url);
                if (update) {
                  setProduct((prev) => ({
                    ...prev,
                    [update]: response.data.url,
                  }));
                }
              })
              .catch((err) => {
                console.log(err);
                console.error(err.response);
                setIsUploading(false);
                if (err.response)
                  notify({ message: err.response.data.message, type: 'error' });
              });
          }
        }
      });
    }
  }, [uploadFiles]);

  return (
    <>
      {!isUploading ? (
        <input
          type='file'
          ref={fileElement}
          multiple={multiple}
          onChange={handleBrowse}
          className='form-control'
          disabled={disabled || isUploading}
        />
      ) : (
        <>
          <div className='uploading'>
            <div>
              <i
                className='bx bx-loader-alt bx-spin'
                style={{ fontSize: 20 }}
              />
              <span style={{ fontSize: 14 }}>
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
    </>
  );
};

export default UploadImage;
