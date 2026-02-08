import { Col, Form, Row } from 'react-bootstrap';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import MyVideo from './MyVideo';

const MyVideos = ({
  uuidProduct,
  lessons,
  removeVideoFromArray,
  setData,
  filter,
  setFilter,
  filteredVideos,
  filterByInput,
  setTabContent,
}) => {
  return (
    <div id='myvideos-datatable'>
      <div className='myvideos-nav'>
        <div
          className={`myvideos-nav-item ${filter === 'all' && 'active'}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </div>
        <div
          className={`myvideos-nav-item ${filter === 'with' && 'active'}`}
          onClick={() => setFilter('with')}
        >
          Com aula
        </div>
        <div
          className={`myvideos-nav-item ${filter === 'without' && 'active'}`}
          onClick={() => setFilter('without')}
        >
          Sem aula
        </div>
      </div>
      <div className='new-data-table'>
        <Row className='first-row'>
          <Col>
            <div className='data-filter'>
              <div className='form-group'>
                <i className='bx bx-search' />
                <Form.Control
                  style={{ marginBottom: '0px' }}
                  onChange={(e) => filterByInput(e.target.value)}
                  placeholder={'Buscar vídeo...'}
                />
              </div>
            </div>
          </Col>
          <Col className='d-flex justify-content-end align-items-center'>
            <ButtonDS
              variant='primary'
              onClick={() => setTabContent('videosupload')}
              outline
              iconRight={'bx-upload'}
            >
              Fazer upload de vídeo
            </ButtonDS>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className='head head-my-videos' style={{ marginTop: '16px' }}>
              <div className='item'>
                <i className='bx bx-video-plus' />
                <span>Vídeo</span>
              </div>
              <div className='item'>
                <i className='bx bx-tag' />
                <span>Aula</span>
              </div>
            </div>
          </Col>
        </Row>

        {filteredVideos.length > 0 ? (
          filteredVideos
            .filter(({ uploading }) => uploading === false)
            .map((item) => (
              <MyVideo
                key={`video_${item.uuid}`}
                uuidProduct={uuidProduct}
                lessons={lessons}
                removeVideoFromArray={removeVideoFromArray}
                video={item}
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
    </div>
  );
};

export default MyVideos;
