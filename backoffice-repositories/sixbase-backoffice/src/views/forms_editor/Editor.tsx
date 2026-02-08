import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { Edit, FileText } from 'react-feather';
import FormLogsTab from '../../components/forms_editor/FormLogsTab';
import CreateVersionModal from '../../components/forms_editor/CreateVersionModal';
import VersionWarningModal from '../../components/forms_editor/VersionWarningModal';
import { useFormEditor } from '../../hooks/useFormEditor';
import AccessRestrictedCard from '../../components/forms_editor/AccessRestrictedCard';
import FormSelectorBar from '../../components/forms_editor/FormSelectorBar';
import FormStatusHeader from '../../components/forms_editor/FormStatusHeader';
import FormMetadataSection from '../../components/forms_editor/FormMetadataSection';
import FormActionsBar from '../../components/forms_editor/FormActionsBar';
import QuestionsTableSection from '../../components/forms_editor/QuestionsTableSection';
import PreviewPanel from '../../components/forms_editor/PreviewPanel';

const Editor: React.FC = () => {
  const {
    isAdmin,
    isDark,
    isMobile,
    containerGradient,
    sortedForms,
    selectedFormId,
    questions,
    preview,
    previewStep,
    activeTab,
    publishConfirmOpen,
    publishLoading,
    publishAction,
    showVersionModal,
    showWarningModal,
    currentForm,
    formTypeLabelMap,
    setActiveTab,
    setPreviewStep,
    handleSelectForm,
    handleCreateForm,
    handleTitleChange,
    handleFormTypeChange,
    handleSaveWithVersionCheck,
    handleSaveMetadata,
    handleDeleteForm,
    handleToggleActive,
    handleReorderQuestions,
    handleMoveQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleUpdateQuestion,
    handleSaveQuestion,
    handleAddQuestion,
    handleTogglePreview,
    handleConfirmVersion,
    handleCancelVersion,
    handleConfirmWithoutVersion,
    handleCloseWarningModal,
    handleOpenPublishModal,
    handleClosePublishModal,
    handleConfirmPublish,
    setPublishAction,
    setShowVersionModal,
    setPendingSaveAction,
  } = useFormEditor();

  if (!isAdmin) {
    return <AccessRestrictedCard />;
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(0.95);
            }
          }
          .table thead th {
            vertical-align: middle !important;
          }
          .table tbody td {
            vertical-align: middle !important;
          }
          .steps-scroll-container::-webkit-scrollbar {
            height: 6px;
          }
          .steps-scroll-container::-webkit-scrollbar-track {
            background: ${isDark ? '#2f3a4f' : '#f1f5f9'};
            border-radius: 3px;
          }
          .steps-scroll-container::-webkit-scrollbar-thumb {
            background: ${isDark ? '#4a5568' : '#cbd5e1'};
            border-radius: 3px;
          }
          .steps-scroll-container::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? '#5a6578' : '#94a3b8'};
          }
        `}
      </style>
      <div
        style={{
          background: containerGradient,
          borderRadius: 12,
          padding: isMobile ? 16 : 24,
          border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.35)'
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Row>
          <Col md="12" sm="12">
            <Card
              className="mb-2"
              style={{ border: 0, background: 'transparent' }}
            >
              <CardBody style={{ padding: 0 }}>
                <FormSelectorBar
                  forms={sortedForms}
                  selectedFormId={selectedFormId}
                  onSelect={handleSelectForm}
                  onCreate={handleCreateForm}
                  formTypeLabelMap={formTypeLabelMap}
                />
              </CardBody>
            </Card>
          </Col>

          <Col md="12" sm="12">
            <Card style={{ border: 0, background: 'transparent' }}>
              <Nav
                tabs
                style={{
                  width: '100%',
                  display: 'flex',
                  marginBottom: 25,
                  padding: 5,
                  background: containerGradient,
                  borderRadius: '12px 12px 0 0',
                  border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
                  borderBottom: 'none',
                }}
              >
                <NavItem style={{ flex: 1 }}>
                  <NavLink
                    active={activeTab === '1'}
                    onClick={() => setActiveTab('1')}
                    style={{
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center',
                      marginBottom: '-1px',
                      background:
                        activeTab === '1' ? containerGradient : 'transparent',
                      color:
                        activeTab === '1'
                          ? isDark
                            ? '#fff'
                            : '#333'
                          : isDark
                          ? '#aaa'
                          : '#666',
                      borderBottom:
                        activeTab === '1'
                          ? `2px solid ${isDark ? '#4dd0bb' : '#35b9a4'}`
                          : '2px solid transparent',
                      fontWeight: activeTab === '1' ? 600 : 400,
                    }}
                  >
                    <Edit size={16} className="me-1" />
                    Editor
                  </NavLink>
                </NavItem>
                <NavItem style={{ flex: 1 }}>
                  <NavLink
                    active={activeTab === '2'}
                    onClick={() => setActiveTab('2')}
                    style={{
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'center',
                      marginBottom: '-1px',
                      background:
                        activeTab === '2' ? containerGradient : 'transparent',
                      color:
                        activeTab === '2'
                          ? isDark
                            ? '#fff'
                            : '#333'
                          : isDark
                          ? '#aaa'
                          : '#667',
                      borderBottom:
                        activeTab === '2'
                          ? `2px solid ${isDark ? '#4dd0bb' : '#35b9a4'}`
                          : '2px solid transparent',
                      fontWeight: activeTab === '2' ? 600 : 400,
                    }}
                  >
                    <FileText size={16} className="me-1" />
                    Logs
                  </NavLink>
                </NavItem>
              </Nav>

              <FormStatusHeader
                form={currentForm}
                isMobile={isMobile}
                isDark={isDark}
              />

              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <CardHeader
                    style={{ borderTop: 'none', paddingTop: '1.5rem' }}
                  >
                    <FormMetadataSection
                      form={currentForm}
                      formTypeLabelMap={formTypeLabelMap}
                      onTitleChange={handleTitleChange}
                      onFormTypeChange={handleFormTypeChange}
                      onSaveMetadata={handleSaveMetadata}
                      onSaveWithVersionCheck={handleSaveWithVersionCheck}
                      onDeleteForm={handleDeleteForm}
                    />
                  </CardHeader>
                  <CardBody>
                    <FormActionsBar
                      preview={preview}
                      onTogglePreview={handleTogglePreview}
                      onAddQuestion={handleAddQuestion}
                      onOpenPublishModal={handleOpenPublishModal}
                      isActive={Boolean(currentForm?.is_active)}
                      onToggleActive={handleToggleActive}
                    />

                    {!preview ? (
                      <QuestionsTableSection
                        questions={questions}
                        onReorder={handleReorderQuestions}
                        onUpdate={handleUpdateQuestion}
                        onSave={handleSaveQuestion}
                        onMove={handleMoveQuestion}
                        onDuplicate={handleDuplicateQuestion}
                        onRemove={handleRemoveQuestion}
                      />
                    ) : (
                      <PreviewPanel
                        questions={questions}
                        previewStep={previewStep}
                        setPreviewStep={setPreviewStep}
                        isMobile={isMobile}
                      />
                    )}
                  </CardBody>
                </TabPane>
                <TabPane tabId="2">
                  <CardBody
                    style={{
                      background: containerGradient,
                      padding: 0,
                      border: 'none',
                      borderTop: 'none',
                    }}
                  >
                    {selectedFormId && <FormLogsTab formId={selectedFormId} />}
                  </CardBody>
                </TabPane>
              </TabContent>
            </Card>
          </Col>

          <CreateVersionModal
            isOpen={showVersionModal}
            toggle={() => {
              setShowVersionModal(false);
              setPendingSaveAction(null);
            }}
            onConfirm={handleConfirmVersion}
            onCancel={handleCancelVersion}
            formTitle={currentForm?.title}
          />

          <VersionWarningModal
            isOpen={showWarningModal}
            toggle={handleCloseWarningModal}
            onConfirm={handleConfirmWithoutVersion}
            formTitle={currentForm?.title}
          />

          <Modal
            isOpen={publishConfirmOpen}
            toggle={handleClosePublishModal}
            centered
            size={isMobile ? undefined : 'lg'}
          >
            <ModalHeader
              toggle={handleClosePublishModal}
              style={{
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: 600,
                padding: isMobile ? '1rem' : '1.5rem',
              }}
            >
              Publicar versão
            </ModalHeader>
            <ModalBody style={{ padding: isMobile ? '1rem' : '2rem' }}>
              <div className="mb-4">
                <p
                  style={{
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    marginBottom: isMobile ? '1rem' : '1.5rem',
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}
                >
                  Escolha como deseja publicar o formulário:
                </p>
                <div className="d-flex flex-column" style={{ gap: '16px' }}>
                  <Button
                    className="w-100"
                    color={
                      publishAction === 'current'
                        ? 'success'
                        : 'outline-primary'
                    }
                    onClick={() => setPublishAction('current')}
                    disabled={publishLoading}
                    style={{
                      padding: isMobile ? '16px' : '24px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minHeight: isMobile ? '100px' : '120px',
                    }}
                  >
                    <strong
                      style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '1rem' : '1.15rem',
                        display: 'block',
                      }}
                    >
                      Salvar versão atual
                    </strong>
                    <small
                      style={{
                        fontSize: isMobile ? '0.85rem' : '0.9rem',
                        lineHeight: 1.6,
                        display: 'block',
                      }}
                    >
                      Atualiza a versão atual com as mudanças recentes, sem
                      criar uma nova versão histórica.
                    </small>
                  </Button>
                  <Button
                    className="w-100"
                    color={
                      publishAction === 'new' ? 'success' : 'outline-primary'
                    }
                    onClick={() => setPublishAction('new')}
                    disabled={publishLoading}
                    style={{
                      padding: isMobile ? '16px' : '24px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minHeight: isMobile ? '100px' : '120px',
                    }}
                  >
                    <strong
                      style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '1rem' : '1.15rem',
                        display: 'block',
                      }}
                    >
                      Criar nova versão
                    </strong>
                    <small
                      style={{
                        fontSize: isMobile ? '0.85rem' : '0.9rem',
                        lineHeight: 1.6,
                        display: 'block',
                      }}
                    >
                      Gera uma nova versão ativa preservando a anterior no
                      histórico. Ideal para mudanças maiores.
                    </small>
                  </Button>
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              style={{
                padding: isMobile ? '1rem' : '1.5rem',
                borderTop: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.5rem' : 0,
              }}
            >
              <Button
                color="light"
                onClick={handleClosePublishModal}
                disabled={publishLoading}
                style={{
                  minWidth: isMobile ? '100%' : '120px',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                Cancelar
              </Button>
              <Button
                color="success"
                onClick={handleConfirmPublish}
                disabled={publishLoading || !publishAction}
                style={{
                  minWidth: isMobile ? '100%' : '180px',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                {publishLoading
                  ? 'Publicando...'
                  : publishAction === 'new'
                  ? 'Criar nova versão'
                  : 'Atualizar versão atual'}
              </Button>
            </ModalFooter>
          </Modal>
        </Row>
      </div>
    </>
  );
};

export default Editor;
