import React from "react";
import {
  Badge,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

export default function ViewStudentProducts({ show, toggle, data }) {
  return (
    <Modal id="modalViewStudentProducts" isOpen={show} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>
        Produtos de {data && data.full_name}
      </ModalHeader>
      <ModalBody>
        {show &&
          data &&
          data.products.map((product) => (
            <Card>
              <CardBody>
                <div className="view-ss-container">
                  <div className="view-ss-item">
                    <span>Produto</span>
                    <span>{product.name}</span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Acesso</span>
                    <Badge color={product.has_access ? "success" : "danger"}>
                      {product.has_access ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
      </ModalBody>
    </Modal>
  );
}
