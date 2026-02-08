import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useProduct } from '../../providers/contextProduct';
import {
  Badge,
  Button,
  Card,
  Pagination,
  Spinner,
  Table,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import ReactSwitch from 'react-switch';
import { notify } from '../functions';
import api from '../../providers/api';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import { BiTrash, BiCheckCircle, BiUndo, BiXCircle } from 'react-icons/bi';

const MemberComments = () => {
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();

  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [autoApproveComments, setAutoApproveComments] = useState(true);
  const [updatingCommentsSettings, setUpdatingCommentsSettings] =
    useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState([]);
  const [commentsStatusFilter, setCommentsStatusFilter] = useState('pending');
  const [commentsPage, setCommentsPage] = useState(1);
  const commentsPageSize = 10;
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [processingComments, setProcessingComments] = useState([]);

  const loadComments = useCallback(async () => {
    if (!commentsEnabled) {
      setCommentsData([]);
      setCommentsTotal(0);
      return;
    }

    setCommentsLoading(true);
    try {
      const { data } = await api.get(
        `/products/${uuidProduct}/membership-comments`,
        {
          params: {
            status: commentsStatusFilter,
            page: commentsPage,
            size: commentsPageSize,
          },
        }
      );

      setCommentsData(data?.comments || []);
      setCommentsTotal(data?.count || 0);
    } catch (error) {
      console.error('Error loading comments:', error);
      notify({ message: 'Erro ao carregar comentários', type: 'error' });
    } finally {
      setCommentsLoading(false);
    }
  }, [
    commentsEnabled,
    commentsPage,
    commentsPageSize,
    commentsStatusFilter,
    uuidProduct,
  ]);

  const updateCommentsSettings = async (nextEnabled, nextAutoApprove) => {
    setUpdatingCommentsSettings(true);

    try {
      const { data } = await api.put(
        `/products/${uuidProduct}/membership-comments/settings`,
        {
          enabled: nextEnabled,
          auto_approve: nextAutoApprove,
        }
      );

      setCommentsEnabled(data.enabled);
      setAutoApproveComments(data.auto_approve);
      setProduct((prevProduct) =>
        prevProduct
          ? {
            ...prevProduct,
            membership_comments_enabled: data.enabled,
            membership_comments_auto_approve: data.auto_approve,
          }
          : prevProduct
      );

      notify({
        message: 'Configurações de comentários atualizadas com sucesso',
        type: 'success',
      });

      if (!data.enabled) {
        setCommentsData([]);
        setCommentsTotal(0);
      } else {
        setCommentsPage(1);
      }
    } catch (error) {
      console.error('Error updating comment settings:', error);
      notify({
        message:
          error.response?.data?.message ||
          'Erro ao atualizar configurações de comentários',
        type: 'error',
      });
      throw error;
    } finally {
      setUpdatingCommentsSettings(false);
    }
  };

  const handleToggleCommentsEnabled = () => {
    const previousEnabled = commentsEnabled;
    const previousAutoApprove = autoApproveComments;
    const nextEnabled = !commentsEnabled;

    setCommentsEnabled(nextEnabled);
    updateCommentsSettings(nextEnabled, autoApproveComments).catch(() => {
      setCommentsEnabled(previousEnabled);
      setAutoApproveComments(previousAutoApprove);
    });
  };

  const handleToggleAutoApprove = () => {
    const previousAutoApprove = autoApproveComments;
    const nextAutoApprove = !autoApproveComments;

    setAutoApproveComments(nextAutoApprove);
    updateCommentsSettings(commentsEnabled, nextAutoApprove).catch(() => {
      setAutoApproveComments(previousAutoApprove);
    });
  };

  const handleChangeStatusFilter = (status) => {
    setCommentsStatusFilter(status);
    setCommentsPage(1);
  };

  const handleChangeCommentsPage = (pageNumber) => {
    setCommentsPage(pageNumber);
  };

  const handleUpdateCommentStatus = async (commentUuid, status) => {
    setProcessingComments((prev) => [...prev, commentUuid]);
    try {
      await api.patch(
        `/products/${uuidProduct}/membership-comments/${commentUuid}/status`,
        { status }
      );
      notify({ message: 'Comentário atualizado com sucesso', type: 'success' });
      loadComments();
    } catch (error) {
      console.error('Error updating comment status:', error);
      notify({
        message:
          error.response?.data?.message ||
          'Erro ao atualizar o status do comentário',
        type: 'error',
      });
    } finally {
      setProcessingComments((prev) =>
        prev.filter((uuid) => uuid !== commentUuid)
      );
    }
  };

  const handleDeleteComment = async (commentUuid) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este comentário? Essa ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setProcessingComments((prev) => [...prev, commentUuid]);
    try {
      await api.delete(
        `/products/${uuidProduct}/membership-comments/${commentUuid}`
      );
      notify({ message: 'Comentário excluído com sucesso', type: 'success' });
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      notify({
        message:
          error.response?.data?.message || 'Erro ao excluir o comentário',
        type: 'error',
      });
    } finally {
      setProcessingComments((prev) =>
        prev.filter((uuid) => uuid !== commentUuid)
      );
    }
  };

  const isProcessingComment = (commentUuid) =>
    processingComments.includes(commentUuid);

  const statusMeta = {
    pending: { label: 'Pendente', variant: 'warning' },
    approved: { label: 'Aprovado', variant: 'success' },
    rejected: { label: 'Rejeitado', variant: 'danger' },
  };

  const statusFilters = [
    { key: 'pending', label: 'Pendentes' },
    { key: 'approved', label: 'Aprovados' },
    { key: 'rejected', label: 'Rejeitados' },
    { key: 'all', label: 'Todos' },
  ];

  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString('pt-BR');
    } catch (error) {
      return value;
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(commentsTotal / commentsPageSize) || 1
  );

  useEffect(() => {
    if (product) {
      setCommentsEnabled(!!product.membership_comments_enabled);
      setAutoApproveComments(
        product.membership_comments_auto_approve !== false
      );
    }
  }, [product]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return (
    <Card>
      <Card.Body>
        <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3'>
          <div>
            <h4>Comentários das aulas</h4>
            <p className='text-muted mb-0'>
              Configure e modere os comentários feitos pelos alunos dentro da
              área de membros.
            </p>
          </div>

          <div className='d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-3'>
            <div className='d-flex align-items-center gap-2 mr-2'>
              <ReactSwitch
                onChange={handleToggleCommentsEnabled}
                checked={commentsEnabled}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                handleDiameter={24}
                height={30}
                width={56}
                className='react-switch'
                disabled={updatingCommentsSettings}
              />
              <span className='fw-semibold ml-2'>Aceitar comentários</span>
              {updatingCommentsSettings && (
                <Spinner animation='border' size='sm' />
              )}
            </div>

            <div className='d-flex align-items-center gap-2 ml-2'>
              <ReactSwitch
                onChange={handleToggleAutoApprove}
                checked={autoApproveComments}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                handleDiameter={24}
                height={30}
                width={56}
                className='react-switch'
                disabled={!commentsEnabled || updatingCommentsSettings}
              />
              <span className='fw-semibold ml-2'>Aprovação automática</span>
            </div>
          </div>
        </div>

        {!commentsEnabled && (
          <div className='mt-3'>
            <AlertDS
              variant='info'
              text='Os comentários estão desativados para este curso. Ative a opção acima para permitir que os alunos comentem nas aulas.'
            />
          </div>
        )}

        {commentsEnabled && (
          <div className='mt-4'>
            <div className='d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center mb-3'>
              <div className='d-flex flex-row flex-nowrap gap-2 overflow-auto'>
                {statusFilters.map((filter) => {
                  const isActive = commentsStatusFilter === filter.key;
                  return (
                    <Button
                      key={filter.key}
                      size='sm'
                      onClick={() => handleChangeStatusFilter(filter.key)}
                      className='px-3 py-2'
                      style={{
                        minWidth: 110,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isActive ? '#0f1b35' : '#d0d5dd',
                        backgroundColor: isActive ? '#0f1b35' : '#ffffff',
                        color: isActive ? '#ffffff' : '#475467',
                        boxShadow: 'none',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    >
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
              <span className='text-muted'>
                {commentsTotal} comentário
                {commentsTotal === 1 ? '' : 's'}
              </span>
            </div>

            {commentsLoading ? (
              <div className='py-4 text-center'>
                <Spinner animation='border' />
              </div>
            ) : commentsData.length === 0 ? (
              <div className='py-4 text-center text-muted'>
                Nenhum comentário encontrado para este filtro.
              </div>
            ) : (
              <>
                <Table responsive hover className='align-middle'>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Comentário</th>
                      <th>Aula</th>
                      <th>Status</th>
                      <th>Enviado em</th>
                      <th className='text-end'>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commentsData.map((comment) => {
                      const meta =
                        statusMeta[comment.status] || statusMeta.pending;
                      return (
                        <tr key={comment.uuid}>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='fw-semibold'>
                                {comment.student?.name || 'Aluno'}
                              </span>
                              <small className='text-muted'>
                                {comment.student?.email || '-'}
                              </small>
                            </div>
                          </td>
                          <td style={{ maxWidth: 360 }}>
                            <div className='text-break'>{comment.content}</div>
                          </td>
                          <td>
                            <div className='d-flex flex-column'>
                              <span className='fw-semibold'>
                                {comment.lesson?.title || '-'}
                              </span>
                              {comment.lesson?.module?.title && (
                                <small className='text-muted'>
                                  {comment.lesson.module.title}
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge bg={meta.variant}>{meta.label}</Badge>
                          </td>
                          <td>
                            <div className='d-flex flex-column'>
                              <span>{formatDateTime(comment.created_at)}</span>
                              {comment.approved_at && (
                                <small className='text-muted'>
                                  Aprovado em{' '}
                                  {formatDateTime(comment.approved_at)}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className='text-end'>
                            <div className='d-flex justify-content-end align-items-center gap-1'>

                              {/* PENDENTE */}
                              {comment.status === 'pending' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='success'
                                    disabled={isProcessingComment(comment.uuid)}
                                    onClick={() =>
                                      handleUpdateCommentStatus(comment.uuid, 'approved')
                                    }
                                  >
                                    Aprovar
                                  </Button>

                                  <OverlayTrigger overlay={<Tooltip>Rejeitar</Tooltip>}>
                                    <Button
                                      size='sm'
                                      variant='link'
                                      className='text-danger'
                                      disabled={isProcessingComment(comment.uuid)}
                                      onClick={() =>
                                        handleUpdateCommentStatus(comment.uuid, 'rejected')
                                      }
                                    >
                                      <BiXCircle size={18} />
                                    </Button>
                                  </OverlayTrigger>
                                </>
                              )}

                              {/* APROVADO */}
                              {comment.status === 'approved' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='danger'
                                    disabled={isProcessingComment(comment.uuid)}
                                    onClick={() =>
                                      handleUpdateCommentStatus(comment.uuid, 'rejected')
                                    }
                                  >
                                    Rejeitar
                                  </Button>

                                  <OverlayTrigger overlay={<Tooltip>Marcar como pendente</Tooltip>}>
                                    <Button
                                      size='sm'
                                      variant='link'
                                      className='text-muted'
                                      disabled={isProcessingComment(comment.uuid)}
                                      onClick={() =>
                                        handleUpdateCommentStatus(comment.uuid, 'pending')
                                      }
                                    >
                                      <BiUndo size={18} />
                                    </Button>
                                  </OverlayTrigger>
                                </>
                              )}

                              {/* REJEITADO (PADRÃO CLEAN) */}
                              {comment.status === 'rejected' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='success'
                                    disabled={isProcessingComment(comment.uuid)}
                                    onClick={() =>
                                      handleUpdateCommentStatus(comment.uuid, 'approved')
                                    }
                                  >
                                    Aprovar
                                  </Button>

                                  <OverlayTrigger overlay={<Tooltip>Marcar como pendente</Tooltip>}>
                                    <Button
                                      size='sm'
                                      variant='link'
                                      className='text-muted'
                                      disabled={isProcessingComment(comment.uuid)}
                                      onClick={() =>
                                        handleUpdateCommentStatus(comment.uuid, 'pending')
                                      }
                                    >
                                      <BiUndo size={18} />
                                    </Button>
                                  </OverlayTrigger>
                                </>
                              )}

                              {/* EXCLUIR (SEMPRE ISOLADO) */}
                              <OverlayTrigger overlay={<Tooltip>Excluir permanentemente</Tooltip>}>
                                <Button
                                  size='sm'
                                  variant='link'
                                  className='text-danger opacity-75 ms-2'
                                  disabled={isProcessingComment(comment.uuid)}
                                  onClick={() => handleDeleteComment(comment.uuid)}
                                >
                                  <BiTrash size={18} />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {totalPages > 1 && (
                  <div className='d-flex justify-content-end'>
                    <Pagination className='mb-0'>
                      <Pagination.First
                        disabled={commentsPage === 1}
                        onClick={() => handleChangeCommentsPage(1)}
                      />
                      <Pagination.Prev
                        disabled={commentsPage === 1}
                        onClick={() =>
                          handleChangeCommentsPage(commentsPage - 1)
                        }
                      />
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === commentsPage}
                            onClick={() => handleChangeCommentsPage(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        );
                      })}
                      <Pagination.Next
                        disabled={commentsPage === totalPages}
                        onClick={() =>
                          handleChangeCommentsPage(commentsPage + 1)
                        }
                      />
                      <Pagination.Last
                        disabled={commentsPage === totalPages}
                        onClick={() => handleChangeCommentsPage(totalPages)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MemberComments;