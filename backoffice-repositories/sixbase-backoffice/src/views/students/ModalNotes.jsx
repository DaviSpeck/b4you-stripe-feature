import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardSubtitle,
  CardTitle,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { api } from '../../services/api';
import { configNotify } from '../../configs/toastConfig';
import { toast } from 'react-toastify';
import { Trash } from 'react-feather';

const ModalNotes = ({ show, setShow, studentUuid }) => {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDataNotes = () => {
    setLoading(true);
    api.get(`students/${studentUuid}/notes`).then((r) => setNotes(r.data));
    setLoading(false);
  };

  const newNote = (note) => {
    api
      .post(`students/${studentUuid}/notes`, { note })
      .then((r) => {
        fetchDataNotes();
        toast.success(`Nota criada com sucesso`, configNotify);
      })
      .catch((e) => {
        toast.error('Falha ao criar nota', configNotify);
      });
  };

  const deleteNote = (note) => {
    api
      .delete(`students/${studentUuid}/notes/${note.id}`)
      .then((r) => {
        toast.success(`Nota removida com sucesso`, configNotify);
        fetchDataNotes();
      })
      .catch((e) => {
        toast.error('Falha ao remover nota', configNotify);
      });
  };

  useEffect(() => {
    fetchDataNotes();
  }, []);

  return (
    <>
      {!loading && notes && (
        <Modal
          isOpen={show}
          toggle={() => {
            setShow(false);
          }}
          centered
          size="lg"
        >
          <ModalHeader toggle={() => setShow(!show)}>Notas</ModalHeader>
          <ModalBody>
            <div>
              <Input type="textarea" name="text" id="exampleText" rows="7" />
              <div className="d-flex w-100 justify-content-end">
                <Button
                  color="primary"
                  className="mt-2"
                  onClick={(e) => {
                    e.preventDefault();
                    newNote(
                      e.currentTarget.parentElement.parentElement.children[0]
                        .value,
                    );
                  }}
                >
                  Criar nota
                </Button>
              </div>
            </div>
            <div className="mt-3">
              {notes.map((item) => (
                <Card
                  key={item.id}
                  className="p-2"
                  style={{ background: `#171c28`, color: `#eee` }}
                >
                  <CardBody>
                    <CardTitle>Nota</CardTitle>
                    <CardSubtitle>
                      {item.user_backoffice.full_name} - {item.created_at}
                    </CardSubtitle>
                    <p className="mt-2" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {String(item.note)
                        .replace(/\r\n/g, '\n') 
                        .replace(/\r/g, '\n')    
                        .replace(/\\n/g, '\n')  
                        .replace(/\u00B6+/g, '\n')}
                    </p>
                    <div className="d-flex w-100 justify-content-end">
                      <Badge
                        color="danger"
                        className="view-details"
                        style={{ cursor: 'pointer' }}
                        onClick={() => deleteNote(item)}
                      >
                        <Trash size={26} />
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              outline
              onClick={() => {
                setShow(false);
              }}
            >
              Fechar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export default ModalNotes;
