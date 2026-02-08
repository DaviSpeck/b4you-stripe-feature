import { useState, useEffect } from 'react';
import {
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Input,
} from 'reactstrap';
import OverviewProducts from './components/OverviewProducts';
import ProducersAnalysis from './components/ProducersAnalysis';
import ProducersReactivation from './components/ProducersReactivation';

const Commercial = () => {
    const [active, setActive] = useState('1');
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 576 : false
    );

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 576);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const toggle = (tab) => {
        if (active !== tab) setActive(tab);
    };

    return (
        <>
            {isMobile ? (
                <div className="mb-2">
                    <Input
                        type="select"
                        value={active}
                        onChange={e => toggle(e.target.value)}
                    >
                        <option value="1">Overview de Produtos</option>
                        <option value="2">Análise de Produtores</option>
                        <option value="3">Reativação de Produtores</option>
                    </Input>
                </div>
            ) : (
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            href="#"
                            active={active === '1'}
                            onClick={() => toggle('1')}
                        >
                            Overview de Produtos
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            href="#"
                            active={active === '2'}
                            onClick={() => toggle('2')}
                        >
                            Análise de Produtores
                        </NavLink>
                    </NavItem>
                     <NavItem>
                        <NavLink
                            href="#"
                            active={active === '3'}
                            onClick={() => toggle('3')}
                        >
                            Reativação de Produtores
                        </NavLink>
                    </NavItem>
                </Nav>
            )}

            <TabContent activeTab={active} className="mt-2">
                <TabPane tabId="1">
                    <OverviewProducts />
                </TabPane>
                <TabPane tabId="2">
                    <ProducersAnalysis />
                </TabPane>
                <TabPane tabId="3">
                    <ProducersReactivation />
                </TabPane>
            </TabContent>
        </>
    );
};

export default Commercial;