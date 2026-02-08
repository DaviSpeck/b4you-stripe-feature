import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import api from '../../providers/api';
import './style.scss';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import { useUser } from '../../providers/contextUser';
import SendDocuments from './send-documents';
import AlreadySent from './already-sent';

const PageIdentity = () => {
  const [documents, setDocuments] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get('/users/verify-id')
      .then((response) => setDocuments(response.data))
      .catch(() => {});
  };

  const isCompany = !!(user?.is_company && user?.cnpj);
  const recipientId = isCompany
    ? user?.pagarme_recipient_id_cnpj
    : user?.pagarme_recipient_id;

  return (
    <>
      <section id='page-identity'>
        <Card>
          <Card.Header>
            <h3>Verificação De Identidade</h3>
          </Card.Header>
          <Card.Body>
            {user && !isCompany && user.verified_pagarme !== 3 && (
              <div id='loader'>
                <SendDocuments fetchData={fetchData} />
              </div>
            )}

            {user &&
              recipientId &&
              !isCompany &&
              user.verified_pagarme === 3 && (
                <div id='loader'>
                  <AlreadySent success={true} />
                </div>
              )}

            {user &&
              recipientId &&
              isCompany &&
              user.verified_company_pagarme === 3 && (
                <div id='loader'>
                  <AlreadySent success={true} />
                </div>
              )}
          </Card.Body>
        </Card>
      </section>
    </>
  );
};

export default PageIdentity;
