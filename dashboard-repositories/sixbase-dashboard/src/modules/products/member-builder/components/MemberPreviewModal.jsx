import React, { useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import BlockPreview from './BlockPreview';

const DEFAULT_THEME = {
  colorMembership: '#563d7c',
  colorMembershipSecondary: '#563d7c',
  colorMembershipText: '#ffffff',
  colorMembershipHover: '#354052',
  applyMembershipTheme: 'default',
  moduleCoverFormat: 'vertical',
};

const buildTheme = (theme) => ({
  ...DEFAULT_THEME,
  ...(theme || {}),
});

const MemberPreviewModal = ({
  show,
  onHide,
  blocks = [],
  product,
  productModules = [],
  theme,
  storageKey,
  recommendedProductsEnabled = false,
}) => {
  const cachedData = useMemo(() => {
    if (!storageKey) return null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Unable to read preview cache', error);
      return null;
    }
  }, [storageKey, blocks, theme]);

  const previewBlocks =
    blocks && blocks.length > 0 ? blocks : cachedData?.blocks || [];
  const previewTheme = buildTheme(theme || cachedData?.theme);

  const sortedBlocks = useMemo(() => {
    return [...previewBlocks].sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0));
  }, [previewBlocks]);

  const palette =
    previewTheme.applyMembershipTheme === 'apply'
      ? {
          primary: previewTheme.colorMembership,
          secondary: previewTheme.colorMembershipSecondary,
          text: previewTheme.colorMembershipText,
          hover: previewTheme.colorMembershipHover,
        }
      : {
          primary: '#0f1b35',
          secondary: '#212738',
          text: '#ffffff',
          hover: '#5bebd4',
        };

  const moduleCoverFormat =
    previewTheme.moduleCoverFormat || DEFAULT_THEME.moduleCoverFormat;

  const previewStyleVars = {
    '--preview-bg': palette.primary,
    '--preview-card': palette.secondary,
    '--preview-text': palette.text,
    '--preview-accent': palette.hover,
    '--preview-header-bg': '#0f1b35',
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size='xl'
      dialogClassName='member-preview-modal'
      contentClassName='member-preview-modal__content'
    >
      <Modal.Header closeButton className='member-preview-modal__header navy'>
        <div>
          <div className='fw-bold'>Pré-visualização da área de membros</div>
          <small className='text-muted'>
            Renderização baseada nas alterações atuais — não é necessário
            salvar.
          </small>
        </div>
      </Modal.Header>
      <Modal.Body className='p-0'>
        <div className='member-preview-layout' style={previewStyleVars}>
          <section className='member-preview-body'>
            {sortedBlocks.length === 0 ? (
              <div className='text-center text-muted py-5'>
                Nenhum bloco disponível para pré-visualizar.
              </div>
            ) : (
              sortedBlocks.map((block, index) => {
                const noCardBlocks = [
                  'cta',
                  'faq',
                  'social',
                  'producer',
                  'modules',
                  'description',
                ];
                const wrapperClass = noCardBlocks.includes(block.type)
                  ? 'member-preview-block no-card'
                  : 'member-preview-block';
                
                // Encontra o índice do bloco de módulos
                const modulesIndex = sortedBlocks.findIndex(
                  (b) => b.type === 'modules'
                );
                
                return (
                  <React.Fragment key={block.id}>
                    <div className={wrapperClass}>
                      <BlockPreview
                        block={block}
                        moduleCoverFormat={moduleCoverFormat}
                        product={product}
                        productModules={productModules}
                        themePalette={palette}
                      />
                    </div>
                    {/* Bloco de produtos recomendados após módulos */}
                    {block.type === 'modules' &&
                      modulesIndex === index &&
                      recommendedProductsEnabled && (
                        <div className='member-preview-block no-card'>
                          <div
                            style={{
                              padding: '2rem',
                              textAlign: 'center',
                              backgroundColor: 'var(--preview-card, #212738)',
                              color: 'var(--preview-text, #ffffff)',
                              borderRadius: '8px',
                              border: '2px dashed rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <i className='bx bx-lock' style={{ fontSize: '1.25rem' }} />
                              <strong>Produtos Recomendados</strong>
                            </div>
                            <small style={{ opacity: 0.7 }}>
                              Bloco fixo - aparece automaticamente após os módulos
                            </small>
                          </div>
                        </div>
                      )}
                  </React.Fragment>
                );
              })
            )}
          </section>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MemberPreviewModal;
