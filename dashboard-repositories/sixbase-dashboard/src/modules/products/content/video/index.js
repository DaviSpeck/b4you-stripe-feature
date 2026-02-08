import '@asseinfo/react-kanban/dist/styles.css';
import { Col, Nav, Row, Tab } from 'react-bootstrap';

import '../../styles.scss';
import './style.scss';
import { useEffect, useState } from 'react';
import CourseContent from './CourseContent';
import MyVideos from './MyVideos';
import VideosUpload from './VideosUpload';
import { useParams } from 'react-router-dom';
import api from '../../../../providers/api';

export default function ContentVideo() {
  const { uuidProduct } = useParams();
  const [data, setData] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [tabContent, setTabContent] = useState('courseContent');

  const fetchData = () => {
    setRequesting(true);

    api
      .get(`/products/gallery/${uuidProduct}/lessons`)
      .then((r) => {
        setLessons(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));

    setRequesting(true);
    api
      .get(`/products/gallery/${uuidProduct}`)
      .then((r) => {
        setFilteredVideos(
          r.data.map((item) => ({
            ...item,
            upload: false,
            uploading: false,
          }))
        );
        setData(
          r.data.map((item) => ({
            ...item,
            upload: false,
            uploading: false,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const removeVideoFromArray = (video_uuid) => {
    setFilteredVideos(
      filteredVideos.filter((item) => item.uuid !== video_uuid)
    );
  };

  useEffect(() => {
    if (filter === 'all') {
      setFilteredVideos([...data]);
    }
    if (filter === 'with') {
      setFilteredVideos(data.filter((item) => item.lesson_uuid !== null));
    }
    if (filter === 'without') {
      setFilteredVideos(data.filter((item) => item.lesson_uuid === null));
    }
  }, [filter]);

  const filterByInput = (text) => {
    setFilteredVideos(() =>
      data.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  return (
    <Tab.Container activeKey={tabContent} defaultActiveKey='courseContent'>
      <section id='video'>
        <Row>
          <Col sm={12}>
            <Nav className='courseContent-tabs' variant='pills'>
              <Nav.Item>
                <Nav.Link
                  eventKey='courseContent'
                  onClick={() => setTabContent('courseContent')}
                >
                  <i className='bx bx-grid-alt'></i>
                  <span>Grade de curso</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey='myvideos'
                  onClick={() => {
                    fetchData();
                    setTabContent('myvideos');
                  }}
                >
                  <i className='bx bx-upload'></i>
                  <span>Meus vídeos</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey='videosupload'
                  onClick={() => setTabContent('videosupload')}
                >
                  <i className='la la-user'></i>
                  <span>Upload de vídeos</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        <Tab.Content>
          <Tab.Pane eventKey='courseContent'>
            <CourseContent fetchDataAll={fetchData} />
          </Tab.Pane>
          <Tab.Pane eventKey='myvideos'>
            <MyVideos
              requesting={requesting}
              setRequesting={setRequesting}
              uuidProduct={uuidProduct}
              lessons={lessons}
              removeVideoFromArray={removeVideoFromArray}
              setData={setFilteredVideos}
              filter={filter}
              setFilter={setFilter}
              filteredVideos={filteredVideos}
              filterSearch={filterSearch}
              setFilterSearch={setFilterSearch}
              filterByInput={filterByInput}
              setTabContent={setTabContent}
            />
          </Tab.Pane>
          <Tab.Pane eventKey='videosupload'>
            <VideosUpload
              requesting={requesting}
              setRequesting={setRequesting}
              uuidProduct={uuidProduct}
              fetchData={fetchData}
              lessons={lessons}
              setData={setFilteredVideos}
              data={filteredVideos}
            />
          </Tab.Pane>
        </Tab.Content>
      </section>
    </Tab.Container>
  );
}
