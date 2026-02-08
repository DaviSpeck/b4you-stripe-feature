import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';
import DataTable from 'react-data-table-component';
import { useSkin } from '../utility/hooks/useSkin';
import {
  Card, CardBody, FormGroup, Input, Label, Badge, Col, Row,
  Modal, ModalHeader, ModalBody, ModalFooter, Button
} from 'reactstrap';
import { api } from '../services/api';
import { Settings, Calendar } from 'react-feather';
import { toast } from 'react-toastify';
import { UserBankAccount, UserBankAccountResponse } from '../interfaces/userBankAccount.interface';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';

const configNotify = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined
};

const onlyDigits = (v?: string | null) => (v || '').replace(/\D/g, '');

const maskCPF = (v?: string | null) => {
  const s = onlyDigits(v);
  if (s.length !== 11) return v || '';
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const maskCNPJ = (v?: string | null) => {
  const s = onlyDigits(v);
  if (s.length !== 14) return v || '';
  return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

const accountTypeLabel = (t?: string | null) => {
  if (!t) return '-';
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const fullName = (r: UserBankAccount) =>
  [r.first_name, r.last_name].filter(Boolean).join(' ');

const emailValue = (r: UserBankAccount) => r.email ?? '-';

const tipoPessoa = (r: UserBankAccount) => (r.is_company ? 'PJ' : 'PF');

const getStatus = (
  r?: Pick<UserBankAccount, 'pending_approval' | 'approved' | 'rejected'>
): 'pending' | 'approved' | 'rejected' => {
  if (!r) return 'pending';
  if (r.pending_approval) return 'pending';
  if (typeof r.rejected === 'boolean') {
    return r.rejected ? 'rejected' : (r.approved ? 'approved' : 'rejected');
  }
  return r.approved ? 'approved' : 'rejected';
};

const reviewedInfo = (r: any) => {
  const who =
    r?.reviewed_by_name ||
    r?.approved_by_name ||
    r?.rejected_by_name ||
    r?.moderator_name;
  const when = r?.reviewed_at || r?.updated_at;
  const whenStr = when ? new Date(when).toLocaleString() : null;
  if (!who && !whenStr) return null;
  return ` por ${who ?? '—'}${whenStr ? ` em ${whenStr}` : ''}`;
};

const ChangeBankAccount: FC = () => {
  const { skin } = useSkin();

  const [rows, setRows] = useState<UserBankAccount[]>([]);
  const [count, setCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [inputFilter, setInputFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<UserBankAccount | null>(null);

  const [filter, setFilter] = useState<{ calendar: Date[] }>({
    calendar: [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()]
  });

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const openModal = useCallback((row: UserBankAccount) => {
    setSelected(row);
    setIsOpen(true);
  }, []);

  const onApprove = useCallback(async () => {
    if (!selected) return;
    try {
      await api.put(`/users/user_bank_accounts/${selected.id}/approve`);
      toast.success('Conta bancária aprovada com sucesso!', configNotify);
      setIsOpen(false);
      fetchData(0); 
    } catch (e) {
      console.error(e);
      toast.error('Erro ao aprovar a conta bancária.', configNotify);
    }
  }, [selected]);

  const onReject = useCallback(async () => {
    if (!selected) return;
    try {
      await api.put(`/users/user_bank_accounts/${selected.id}/reject`);
      toast.info('Conta bancária reprovada.', configNotify);
      setIsOpen(false);
      fetchData(0);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao reprovar a conta bancária.', configNotify);
    }
  }, [selected]);

  const fetchData = async (page: number, newPerPage: number | null = null): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('size', (newPerPage ? newPerPage : recordsPerPage).toString());
      if (inputFilter) query.append('input', inputFilter);
      if (statusFilter) query.append('status', statusFilter);
      if (Array.isArray(filter.calendar) && filter.calendar.length === 2 && filter.calendar[0] && filter.calendar[1]) {
        query.append('start_date', filter.calendar[0].toISOString());
        query.append('end_date', filter.calendar[1].toISOString());
      }

      const { data } = await api.get<UserBankAccountResponse>(`/users/user_bank_accounts/all?${query.toString()}`);
      setRows(data.info.rows || []);
      setCount(data.info.count || 0);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar solicitações.', configNotify);
    }
    setLoading(false);
  };

  const handleRecordsPerPageChange = async (newPerPage: number, page: number): Promise<void> => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number): void => {
    fetchData(page - 1);
  };

  const debounceRef = useRef<number | undefined>(undefined);
  const onFilterChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setInputFilter(target.value);
    }, 500);
  };

  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputFilter, statusFilter]);

  useEffect(() => {
    if (filter.calendar.length === 2) {
      fetchData(0);
    }
  }, [filter.calendar]);

  const columns = useMemo(
    () => [
      {
        name: 'Nome',
        selector: (r: UserBankAccount) => fullName(r),
        sortable: true,
        cell: (r: UserBankAccount) => fullName(r),
      },
      {
        name: 'Email',
        selector: (r: UserBankAccount) => emailValue(r),
        cell: (r: UserBankAccount) => emailValue(r),
      },
      {
        name: 'Tipo',
        selector: (r: UserBankAccount) => tipoPessoa(r),
        width: '90px',
        cell: (r: UserBankAccount) => tipoPessoa(r),
      },
      {
        name: 'Detalhes',
        center: true,
        width: '110px',
        cell: (r: UserBankAccount) => (
          <Badge color="primary" className="view-details" role="button" onClick={() => openModal(r)}>
            <Settings size={18} />
          </Badge>
        ),
      },
    ],
    [openModal]
  );

  return (
    <section id="pageChangeBankAccount">
      <h2 className="mb-2">Solicitação de alterações bancárias</h2>

      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <FormGroup className="filters">
                <Row>
                  <Col md={5}>
                    <Label>Busca</Label>
                    <Input
                      placeholder="Nome ou e-mail"
                      onChange={onFilterChange}
                    />
                  </Col>
                  <Col md={4}>
                    <Label>Status</Label>
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Reprovado</option>
                    </Input>
                  </Col>
                  <Col md={3} className="mt-1">
                    <Label className="form-label" htmlFor="range-picker">Período</Label>
                    <div className="d-flex align-items-center">
                      <Calendar size={15} className="me-1" />
                      <Flatpickr
                        id="range-picker"
                        value={filter.calendar}
                        className="form-control border-0 shadow-none bg-transparent"
                        onChange={(dates: Date[]) =>
                          setFilter((prev) => ({ ...prev, calendar: dates }))
                        }
                        options={{
                          mode: 'range',
                          dateFormat: 'd/m/Y',
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </FormGroup>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Card>
        <CardBody>
          <DataTable
            columns={columns as any}
            data={rows}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={count}
            onChangeRowsPerPage={handleRecordsPerPageChange}
            onChangePage={handleRecordsPageChange}
            noDataComponent={'Nenhuma solicitação encontrada'}
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false
            }}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
        <ModalHeader toggle={toggle}>Detalhes da solicitação</ModalHeader>
        <ModalBody>
          {!selected ? (
            <div>Carregando…</div>
          ) : (
            <>
              <div className="mb-2">
                <p className="mb-0"><strong>Solicitante:</strong> {fullName(selected)} ({tipoPessoa(selected)})</p>
                <p className="mb-0">
                  <strong>{selected.is_company ? 'CNPJ' : 'CPF'}:</strong>{' '}
                  {selected.is_company ? maskCNPJ(selected.cnpj) : maskCPF(selected.document_number)}
                </p>
                <small className="text-muted">Criado em: {new Date(selected.created_at).toLocaleString()}</small>
              </div>

              <hr />

              <Row>
                <Col md={6}>
                  <h6 className="mb-2">Dados atuais</h6>
                  <ul className="mb-3">
                    <li><b>Banco:</b> {selected.is_company ? (selected.company_bank_code_old ?? selected.bank_code_old) : selected.bank_code_old || '-'}</li>
                    <li><b>Agência:</b> {selected.is_company ? (selected.company_agency_old ?? selected.agency_old) : selected.agency_old || '-'}</li>
                    <li><b>Conta:</b> {selected.is_company ? (selected.company_account_number_old ?? selected.account_number_old) : selected.account_number_old}</li>
                    <li><b>Tipo:</b> {accountTypeLabel(selected.is_company ? (selected.company_account_type_old ?? selected.account_type_old) : selected.account_type_old)}</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6 className="mb-2">Novo cadastro solicitado</h6>
                  <ul className="mb-3">
                    <li><b>Banco:</b> {selected.is_company ? (selected.company_bank_code ?? selected.bank_code) : selected.bank_code || '-'}</li>
                    <li><b>Agência:</b> {selected.is_company ? (selected.company_agency ?? selected.agency) : selected.agency || '-'}</li>
                    <li><b>Conta:</b> {selected.is_company ? (selected.company_account_number ?? selected.account_number) : selected.account_number}</li>
                    <li><b>Tipo:</b> {accountTypeLabel(selected.is_company ? (selected.company_account_type ?? selected.account_type) : selected.account_type)}</li>
                  </ul>
                </Col>
              </Row>

              {/* STATUS */}
              {(() => {
                const status = getStatus(selected);
                if (status === 'pending') {
                  return <Badge color="warning">Pendente aprovação</Badge>;
                }
                if (status === 'approved') {
                  return (
                    <Badge color="success">
                      Aprovado{reviewedInfo(selected)}
                    </Badge>
                  );
                }
                return (
                  <Badge color="danger">
                    Reprovado{reviewedInfo(selected)}
                  </Badge>
                );
              })()}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {getStatus(selected || undefined) === 'pending' ? (
            <>
              <Button color="success" onClick={onApprove}>Aprovar</Button>
              <Button color="danger" outline onClick={onReject}>Reprovar</Button>
            </>
          ) : (
            <Button color="secondary" onClick={toggle}>Fechar</Button>
          )}
        </ModalFooter>
      </Modal>
    </section>
  );
};

export default ChangeBankAccount;
