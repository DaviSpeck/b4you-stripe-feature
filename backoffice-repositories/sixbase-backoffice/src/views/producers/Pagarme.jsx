import { useState, useEffect, useCallback } from 'react';
import { Table, Button } from 'reactstrap';
import { api } from '@src/services/api';
import { FormatBRL } from '@src/utility/Utils';
import moment from 'moment';
import { toast } from 'react-toastify';
import { configNotify } from '@src/configs/toastConfig';

const ViewPagarme = ({ user }) => {
  const [balance, setBalance] = useState({
    key_2_cpf: {
      available_amount: '0',
      waiting_funds_amount: '0',
      transferred_amount: '0',
    },
    key_2_cnpj: {
      available_amount: '0',
      waiting_funds_amount: '0',
      transferred_amount: '0',
    },
    key_3_cpf: {
      available_amount: '0',
      waiting_funds_amount: '0',
      transferred_amount: '0',
    },
    key_3_cnpj: {
      available_amount: '0',
      waiting_funds_amount: '0',
      transferred_amount: '0',
    },
    totals: {
      available: 0,
      waiting_funds: 0,
      transferred: 0,
      total: 0,
    },
    updated_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user?.uuid) return;

    try {
      setLoading(true);
      const response = await api.get(`users/${user.uuid}/pagarme-balance`);
      if (response.data?.success && response.data?.data) {
        setBalance(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar saldo Pagarme:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uuid]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSyncBalance = async () => {
    if (!user?.uuid) return;

    try {
      setSyncing(true);
      await api.get(`users/${user.uuid}/recipient-balances`);
      toast.success('Sincronização iniciada com sucesso', configNotify);

      // Aguardar um pouco antes de atualizar os dados
      setTimeout(async () => {
        await fetchBalance();
        toast.success('Saldos atualizados com sucesso', configNotify);
      }, 2000);
    } catch (error) {
      console.error('Erro ao sincronizar saldo:', error);
      const errorMessage =
        error?.response?.data?.message || 'Erro ao sincronizar saldos';
      toast.error(errorMessage, configNotify);
    } finally {
      setSyncing(false);
    }
  };

  const renderBalanceInfo = (balanceData) => {
    if (!balanceData || loading) return null;

    const available = parseInt(balanceData.available_amount || '0', 10) / 100;
    const waiting = parseInt(balanceData.waiting_funds_amount || '0', 10) / 100;

    return (
      <div
        style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            backgroundColor: '#d4edda',
            border: '2px solid #28a745',
            borderRadius: '6px',
            padding: '8px 12px',
            fontWeight: 'bold',
            width: '140px',
            minWidth: '140px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '11px', color: '#155724', marginBottom: '4px' }}
          >
            Disponível
          </div>
          <div style={{ fontSize: '16px', color: '#28a745' }}>
            {FormatBRL(available)}
          </div>
        </div>
        <div
          style={{
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '6px',
            padding: '8px 12px',
            fontWeight: 'bold',
            width: '140px',
            minWidth: '140px',
            textAlign: 'center',
          }}
        >
          <div
            style={{ fontSize: '11px', color: '#856404', marginBottom: '4px' }}
          >
            Pendente
          </div>
          <div style={{ fontSize: '16px', color: '#ffc107' }}>
            {FormatBRL(waiting)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          marginBottom: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          color="primary"
          onClick={handleSyncBalance}
          disabled={syncing || loading}
          style={{ minWidth: '180px' }}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar saldo agora'}
        </Button>
        {balance.updated_at && (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#6c757d',
            }}
          >
            <strong>Última atualização:</strong>{' '}
            {moment(balance.updated_at).format('DD/MM/YYYY HH:mm:ss')}
          </div>
        )}
      </div>
      <Table hover>
        <thead>
          <tr>
            <div className="title-table">Conta 1 (Desativada)</div>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Pagarme ID (cpf)</th>
            <td>
              {user.pagarme_cpf_id ? (
                <a
                  href={`https://dash.pagar.me/merch_OGJzjDpfWUbb1o9P/acc_O38J8yzc2MhQyBam/${user.pagarme_cpf_id}/recipient-details`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'underline',
                    color: '#007bff',
                    cursor: 'pointer',
                  }}
                >
                  {user.pagarme_cpf_id}
                </a>
              ) : (
                '-'
              )}
            </td>
          </tr>

          <tr>
            <th scope="row">Pagarme ID (cnpj)</th>
            <td>
              {user.pagarme_cnpj_id ? (
                <a
                  href={`https://dash.pagar.me/merch_OGJzjDpfWUbb1o9P/acc_O38J8yzc2MhQyBam/${user.pagarme_cnpj_id}/recipient-details`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'underline',
                    color: '#007bff',
                    cursor: 'pointer',
                  }}
                >
                  {user.pagarme_cnpj_id}
                </a>
              ) : (
                '-'
              )}
            </td>
          </tr>

          <tr>
            <div className="title-table">Conta 2 (Geral)</div>
          </tr>
          <tr>
            <th scope="row">Pagarme ID (cpf)</th>
            <td>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  {user.pagarme_recipient_id ? (
                    <a
                      href={`https://dash.pagar.me/merch_NoGEqG0SMXh0DkOy/acc_OKkRG0RFVLH28EZj/${user.pagarme_recipient_id}/recipient-details`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'underline',
                        color: '#007bff',
                        cursor: 'pointer',
                      }}
                    >
                      {user.pagarme_recipient_id}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                {renderBalanceInfo(balance.key_2_cpf)}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row">Pagarme STATUS (cpf)</th>
            <td>{user?.verified_pagarme?.label || 'N/A'}</td>
          </tr>
          <tr>
            <th scope="row">Pagarme ID (cnpj)</th>
            <td>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  {user.pagarme_recipient_id_cnpj ? (
                    <a
                      href={`https://dash.pagar.me/merch_NoGEqG0SMXh0DkOy/acc_OKkRG0RFVLH28EZj/${user.pagarme_recipient_id_cnpj}/recipient-details`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'underline',
                        color: '#007bff',
                        cursor: 'pointer',
                      }}
                    >
                      {user.pagarme_recipient_id_cnpj}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                {renderBalanceInfo(balance.key_2_cnpj)}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row">Pagarme STATUS (cnpj)</th>
            <td>{user?.verified_company_pagarme?.label || 'N/A'}</td>
          </tr>

          <tr>
            <div className="title-table">Conta 3 (Prod. Digitais)</div>
          </tr>

          <tr>
            <th scope="row">Pagarme ID (cpf)</th>
            <td>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  {user.pagarme_recipient_id_3 ? (
                    <a
                      href={`https://dash.pagar.me/merch_PQVDXBLi9tN0WAaG/acc_YjnXPQsAWczyOr7w/${user.pagarme_recipient_id_3}/recipient-details`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'underline',
                        color: '#007bff',
                        cursor: 'pointer',
                      }}
                    >
                      {user.pagarme_recipient_id_3}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                {renderBalanceInfo(balance.key_3_cpf)}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row">Pagarme STATUS (cpf)</th>
            <td>{user?.verified_pagarme_3?.label || 'N/A'}</td>
          </tr>

          <tr>
            <th scope="row">Pagarme ID (cnpj)</th>
            <td>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  {user.pagarme_recipient_id_cnpj_3 ? (
                    <a
                      href={`https://dash.pagar.me/merch_PQVDXBLi9tN0WAaG/acc_YjnXPQsAWczyOr7w/${user.pagarme_recipient_id_cnpj_3}/recipient-details`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'underline',
                        color: '#007bff',
                        cursor: 'pointer',
                      }}
                    >
                      {user.pagarme_recipient_id_cnpj_3}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                {renderBalanceInfo(balance.key_3_cnpj)}
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row">Pagarme STATUS (cnpj)</th>
            <td>{user?.verified_company_pagarme_3?.label || 'N/A'}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
export default ViewPagarme;
