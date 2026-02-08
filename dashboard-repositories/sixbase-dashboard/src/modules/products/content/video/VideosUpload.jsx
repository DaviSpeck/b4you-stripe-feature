import Dropzone from 'react-dropzone';
import imageCloud from '../../../../images/feather-cloud.svg';
import AlertDS from '../../../../jsx/components/design-system/AlertDS';
import VideoUpload from './VideoUpload';

const VideosUpload = ({ fetchData, uuidProduct, lessons, setData, data }) => {
  const handleDrop = (acceptedFiles) => {
    setData((prevData) => [
      ...acceptedFiles.map((item) => {
        item.upload = true;
        item.uploading = true;
        return item;
      }),
      ...prevData,
    ]);
  };

  const removeVideoFromArray = (uuid) => {
    setData((prevData) => prevData.filter((item) => item.uuid !== uuid));
  };

  return (
    <>
      <div id='videos-upload' className='doc'>
        <Dropzone
          onDrop={(acceptedFiles, rejectedFiles) =>
            handleDrop(acceptedFiles, rejectedFiles)
          }
          multiple={true}
          className='drop-zone-sb'
        >
          {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
            return (
              <div
                {...getRootProps()}
                isDragActive={isDragActive}
                isDragReject={isDragReject}
              >
                <div className='label'>
                  <i className='bx bx-video'></i>
                  <label htmlFor=''>Faça o upload de múltiplos arquivos</label>
                </div>

                <div className='form-group'>
                  <div className='c-img'>
                    <div
                      className={
                        isDragActive
                          ? 'dragActive input-image mt-2'
                          : 'input-image mt-2'
                      }
                    >
                      {isDragActive && (
                        <div className='dragActiveMessage'>
                          <i className='bx bx-upload'></i>
                          <div>Solte seu arquivo aqui</div>
                        </div>
                      )}
                      <div className='left'>
                        <img src={imageCloud} />
                      </div>
                      <div className='right'>
                        <h4>Anexar arquivo</h4>
                        <p>
                          MP4 ou WEPB, tamanho do arquivo não superior a 100 MB
                        </p>
                        <div
                          className={'input-default btn btn-outline-primary'}
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

        {data.filter((item) => item.upload === true).length > 0 && (
          <div className='mb-3'>
            <AlertDS
              variant='warning'
              text={'Não feche a janela até terminar todos os uploads'}
            />
          </div>
        )}
      </div>
      {data.filter((item) => item.upload === true).length > 0 && (
        <div className='new-data-table container-video-upload '>
          <div className='head'>
            <div className='item'>
              <i className='bx bx-video-plus' />
              <span>Vídeo</span>
            </div>
            <div className='item'>
              <i className='bx bx-upload' />
              <span>Progresso</span>
            </div>
            <div className='item'>
              <i className='bx bx-tag' />
              <span>Aula</span>
            </div>
          </div>
          {data.filter((item) => item.upload === true).length > 0 ? (
            data
              .filter((item) => item.upload === true)
              .map((item, index) => (
                <VideoUpload
                  key={index}
                  file={item}
                  uuidProduct={uuidProduct}
                  lessons={lessons}
                  removeVideoFromArray={removeVideoFromArray}
                  fetchData={fetchData}
                  setData={setData}
                />
              ))
          ) : (
            <div className='no-data-component'>
              <div className='mr-3 not-found'>
                <i className='bx bx-search' />
                <div>
                  <div className='strong'>Nenhum registro </div>
                  <span>para mostrar...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VideosUpload;
