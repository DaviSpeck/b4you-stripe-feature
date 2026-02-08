import { useState, FC } from 'react';
import { FormatBRL } from '../../utility/Utils';
import '../../assets/scss/pages/costs.scss';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  TabContent,
  TabPane,
  Table,
} from 'reactstrap';
import StatisticsCards from './components/StatisticsCard';
import { DollarSign, Loader } from 'react-feather';
import { api } from '../../services/api';
import { CostsProps, CostItem } from '../../interfaces/reports.interface';

const Costs: FC<CostsProps> = ({ costs, fetchCosts }) => {
  const [active, setActive] = useState<string>('visa');
  const [show, setShow] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<CostItem | null>(null);
  const [percentage, setPercentage] = useState<string | null>(null);

  const toggleModal = (): void => setShow(!show);

  const handleChange = (item: CostItem): void => {
    toggleModal();
    setActiveItem(item);
  };

  const changeTariff = (): void => {
    if (!activeItem || !percentage) return;

    api
      .put('reports/card', {
        percentage: parseFloat(percentage),
        installments: activeItem.installment,
      })
      .then(() => {
        fetchCosts();
        toggleModal();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div id="costs">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Custos</h2>
          </CardTitle>
        </CardHeader>
        <CardBody className="d-flex p-0 flex-wrap">
          <div className="wrap-info flex-column">
            <div className="p-2 pt-0">
              <div className="icon-section-wrap d-flex gap-2 align-items-center">
                <div className="icon-section">
                  <div className={`avatar avatar-stats p-50 m-0`}>
                    <div className="avatar-content">
                      <DollarSign />
                    </div>
                  </div>
                </div>
                <h2>Cartões</h2>
              </div>
            </div>
            <TabContent activeTab={active} className="p-2 pt-0">
              {Object.keys(costs.sales.card).map((key) => {
                const items = costs.sales.card[key];
                return (
                  <TabPane key={key} tabId={key}>
                    <Table className={'w-50'}>
                      <thead>
                        <tr>
                          <th>Parcela</th>
                          <th>Tarifa</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => {
                          return (
                            <tr key={index}>
                              <th scope="row" className={'w-50'}>
                                {item.installment}
                              </th>
                              <th>{item.variable + '%'}</th>
                              <div
                                className="icon"
                                onClick={() => handleChange(item)}
                              >
                                <i className="bx bxs-pencil"></i>
                              </div>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TabPane>
                );
              })}
            </TabContent>
          </div>
          <div className="wrap-info align-items-start">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={!costs ? <Loader /> : FormatBRL(costs.sales.billet.fixed)}
              statTitle={'Boleto'}
            />
          </div>
          <div className="wrap-info align-items-start">
            <StatisticsCards
              iconBg={'light'}
              icon={<DollarSign />}
              stat={!costs ? <Loader /> : FormatBRL(costs.sales.pix.fixed)}
              statTitle={'Pix'}
            />
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={show} toggle={toggleModal} centered size={'sm'}>
        <ModalHeader toggle={toggleModal}>Editar tarifa</ModalHeader>
        <ModalBody>
          <Label>Parcela atual</Label>
          <Input
            type="text"
            disabled
            value={`${activeItem?.installment} ${
              activeItem?.installment === 1 ? 'vez' : 'vezes'
            }`}
          />
          <Label className="mt-1">Tarifa atual</Label>
          <Input type="text" disabled value={`${activeItem?.variable}%`} />
          <Label className="mt-1">Alterar tarifa</Label>
          <Input
            type="number"
            defaultValue={activeItem?.variable}
            placeholder={activeItem?.variable?.toString()}
            onChange={(e) => setPercentage(e.target.value)}
          />
          <Row className="mt-2 mb-2">
            <Col className="d-flex justify-content-end">
              <Button color="primary" onClick={changeTariff}>
                Salvar
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Costs;
