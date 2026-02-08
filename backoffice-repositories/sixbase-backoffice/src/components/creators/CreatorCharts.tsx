import { FC, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { ChevronDown } from 'react-feather';
import ConversionChart from './ConversionChart';
import { CreatorChartData } from '../../interfaces/creators.interface';

interface CreatorChartsProps {
  data: CreatorChartData[];
}

const CreatorCharts: FC<CreatorChartsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<string>('1');
  const [showCharts, setShowCharts] = useState<boolean>(false);

  const toggle = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Card className="mt-3 mb-3" style={{ willChange: 'auto' }}>
      <CardHeader className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <CardTitle className="mb-0">Análise de Creators</CardTitle>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-flex align-items-center"
          onClick={() => setShowCharts((v) => !v)}
          style={{ gap: 6 }}
        >
          {showCharts ? 'Ocultar' : 'Exibir'}
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: showCharts ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </CardHeader>

      <div
        style={{
          overflow: 'hidden',
          willChange: 'max-height, opacity',
          transition:
            'max-height 480ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease-out',
          maxHeight: showCharts ? 9999 : 0,
          opacity: showCharts ? 1 : 0,
        }}
      >
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {activeTab === '1'
                ? 'Relação entre faturamento, número de vendas e taxa de conversão'
                : 'Taxa de conversão por clique dos top creators'}
            </div>
            <div className="d-flex justify-content-end">
              <Nav tabs className="mb-0">
                <NavItem>
                  <NavLink
                    className={activeTab === '1' ? 'active' : ''}
                    onClick={() => toggle('1')}
                    style={{ cursor: 'pointer' }}
                  >
                    Tendência de Conversão
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <ConversionChart data={data} />
            </TabPane>
          </TabContent>
        </CardBody>
      </div>
    </Card>
  );
};

export default CreatorCharts;
