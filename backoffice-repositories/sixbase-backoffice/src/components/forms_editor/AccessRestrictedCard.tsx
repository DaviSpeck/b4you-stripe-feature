import { Card, CardBody } from 'reactstrap';

export const AccessRestrictedCard = () => (
  <Card>
    <CardBody>
      <div className="text-center">
        <h5>Acesso restrito</h5>
        <p>Você não tem permissão para acessar o Editor de Formulários.</p>
      </div>
    </CardBody>
  </Card>
);

export default AccessRestrictedCard;

