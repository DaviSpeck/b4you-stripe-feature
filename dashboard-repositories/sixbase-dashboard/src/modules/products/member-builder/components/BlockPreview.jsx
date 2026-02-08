import React from 'react';
import { getBlockDefinition } from '../types/blockTypes';

const BlockPreview = ({
  block,
  moduleCoverFormat = 'vertical',
  product = null,
  productModules = [],
  themePalette = null,
}) => {
  const definition = getBlockDefinition(block.type);

  if (!definition) {
    return (
      <div
        className='text-center py-3'
        style={{ color: themePalette?.text || '#6b7280' }}
      >
        <i
          className='bx bx-error-circle fs-4 mb-2 d-block'
          style={{ color: themePalette?.text || '#6b7280' }}
        />
        <small style={{ color: themePalette?.text || '#6b7280' }}>
          Tipo de bloco desconhecido: {block.type}
        </small>
      </div>
    );
  }

  // Ensure config has default values merged in
  const normalizedConfig = {
    ...definition.defaultConfig,
    ...(block.config || {}),
  };

  const renderPreview = () => {
    switch (block.type) {
      case 'modules':
        return (
          <div className='preview-modules'>
            {/* Title */}
            <h2
              className='mb-4 fw-bold'
              style={{
                fontSize: '1.875rem',
                color: themePalette?.text || '#111827',
              }}
            >
              {normalizedConfig.title || 'Módulos'}
            </h2>

            {/* Modules Grid - matches flex flex-wrap gap-6 sm:gap-8 */}
            <div
              className='d-flex flex-wrap'
              style={{
                gap: normalizedConfig.layout === 'grid' ? '1.5rem' : '0.5rem',
              }}
            >
              {(productModules.length > 0
                ? productModules.slice(0, 4)
                : [1, 2, 3, 4]
              ).map((module, index) => {
                const i = index + 1;
                const isHorizontal = moduleCoverFormat === 'horizontal';
                const cardWidth = isHorizontal ? '300px' : '290px';
                const cardHeight = isHorizontal ? '225px' : '512px';

                // Get module cover image
                const moduleCover =
                  typeof module === 'object'
                    ? module.cover_custom || module.cover
                    : null;
                const moduleTitle =
                  typeof module === 'object' ? module.title : `Módulo ${i}`;

                return (
                  <div
                    key={
                      typeof module === 'object' ? module.uuid || module.id : i
                    }
                    className='bg-white border rounded overflow-hidden'
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      borderColor: 'rgba(255,255,255,0.1)',
                      transition: 'border-color 0.3s',
                    }}
                  >
                    {/* Module Image - Full height, no info section */}
                    {moduleCover ? (
                      <img
                        src={moduleCover}
                        alt={moduleTitle}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          const target = e.target;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="h-100 d-flex align-items-center justify-content-center text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="bx bx-image" style="font-size: 2rem;"></i></div>';
                          }
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          backgroundImage:
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                        }}
                      >
                        <div className='h-100 d-flex align-items-center justify-content-center text-white'>
                          <i
                            className='bx bx-image'
                            style={{ fontSize: '2rem' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'text':
        return (
          <div
            className='preview-text p-3 rounded'
            style={{
              textAlign: normalizedConfig.textAlign || 'left',
              backgroundColor:
                normalizedConfig.backgroundColor === 'transparent'
                  ? themePalette?.secondary || '#f8f9fa'
                  : normalizedConfig.backgroundColor,
              color: themePalette?.text || '#111827',
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: normalizedConfig.content || '<p>Texto do bloco...</p>',
              }}
            />
          </div>
        );

      case 'description':
        return (
          <div
            className='preview-description border rounded overflow-hidden'
            style={{
              transition: 'border-color 0.3s',
              backgroundColor: themePalette?.secondary || '#ffffff',
              color: themePalette?.text || '#111827',
            }}
          >
            <div className='d-flex flex-column flex-md-row'>
              {/* Course Image - Hidden on mobile, 290px x 512px on desktop */}
              <div
                className='d-none d-md-block'
                style={{
                  width: '290px',
                  height: '512px',
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {(() => {
                  // Same logic as DescriptionBlock: cover_custom || thumbnail || cover
                  const courseImage =
                    product?.cover_custom ||
                    product?.thumbnail ||
                    product?.cover;

                  if (courseImage) {
                    return (
                      <img
                        src={courseImage}
                        alt={product?.name || 'Curso'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          const target = e.target;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="h-100 d-flex align-items-center justify-content-center text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><i class="bx bx-image" style="font-size: 3rem;"></i></div>';
                          }
                        }}
                      />
                    );
                  }
                  return (
                    <div
                      className='h-100 d-flex align-items-center justify-content-center text-white'
                      style={{
                        background:
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <i className='bx bx-image' style={{ fontSize: '3rem' }} />
                    </div>
                  );
                })()}
              </div>

              {/* Course Info - matches md:w-[calc(100%-290px)] md:h-[512px] */}
              <div
                className='flex-grow-1 p-4 d-flex flex-column justify-content-between'
                style={{ minHeight: '200px' }}
              >
                <div>
                  {/* Top row: Duration and Category */}
                  <div
                    className='d-flex justify-content-between align-items-center mb-3'
                    style={{ fontSize: '0.75rem' }}
                  >
                    <div
                      className='d-flex align-items-center gap-1'
                      style={{ color: themePalette?.text || '#6b7280' }}
                    >
                      <i
                        className='bx bx-time-five'
                        style={{
                          fontSize: '14px',
                          color: themePalette?.text || '#6b7280',
                        }}
                      />
                      <span style={{ color: themePalette?.text || '#6b7280' }}>
                        02:30:45
                      </span>
                    </div>
                    <div style={{ color: themePalette?.text || '#6b7280' }}>
                      Curso: Categoria
                    </div>
                  </div>

                  {/* Course Title */}
                  <h1
                    className='mb-3 fw-bold'
                    style={{
                      fontSize: '1.5rem',
                      color: themePalette?.text || '#111827',
                    }}
                  >
                    {normalizedConfig.title || 'Nome do Curso'}
                  </h1>

                  {/* Description */}
                  <p
                    className='mb-3'
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      color: themePalette?.text || '#6b7280',
                    }}
                  >
                    {normalizedConfig.useProductDescription
                      ? 'Descrição do produto será exibida aqui automaticamente com todas as informações do curso.'
                      : normalizedConfig.content ||
                        'Descrição do curso aparecerá aqui...'}
                  </p>

                  {/* Bottom row: Lessons count */}
                  {normalizedConfig.showStats && (
                    <div
                      className='d-flex align-items-center gap-2'
                      style={{
                        fontSize: '0.875rem',
                        color: themePalette?.text || '#6b7280',
                      }}
                    >
                      <i
                        className='bx bx-film'
                        style={{
                          fontSize: '16px',
                          color: themePalette?.text || '#6b7280',
                        }}
                      />
                      <span style={{ color: themePalette?.text || '#6b7280' }}>
                        10 aulas
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div
                  className='mt-4 pt-4 border-top'
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <button
                    className='btn'
                    style={{
                      backgroundColor: themePalette?.primary || '#5bebd4',
                      color: themePalette?.text || '#ffffff',
                      fontWeight: '600',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (themePalette?.hover) {
                        e.currentTarget.style.backgroundColor =
                          themePalette.hover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (themePalette?.primary) {
                        e.currentTarget.style.backgroundColor =
                          themePalette.primary;
                      }
                    }}
                  >
                    <i className='bx bx-play me-2' />
                    Iniciar Curso
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'producer':
        return (
          <div className='preview-producer' style={{ marginBottom: '2rem' }}>
            {/* Title - matches space-y-4 (1rem = 16px) */}
            <h2
              className='mb-4 fw-bold'
              style={{
                fontSize: '1.5rem',
                color: themePalette?.text || '#111827',
              }}
            >
              {normalizedConfig.title || 'Suporte'}
            </h2>

            {/* Producer Card - matches bg-gray-50 border rounded-lg p-6 */}
            <div
              className='rounded'
              style={{
                backgroundColor: themePalette?.secondary || '#f9fafb',
                padding: '1.5rem', // p-6 = 1.5rem
                borderRadius: '0.5rem',
              }}
            >
              <div
                className={`d-flex ${
                  normalizedConfig.layout === 'vertical'
                    ? 'flex-column align-items-start'
                    : 'align-items-center'
                }`}
                style={{ gap: '1rem' }}
              >
                {normalizedConfig.showAvatar && (
                  <div
                    className='bg-secondary rounded-circle flex-shrink-0'
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundImage:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  />
                )}
                <div className='flex-grow-1'>
                  <div
                    className='fw-bold mb-2'
                    style={{
                      fontSize: '1rem',
                      marginBottom: '0.5rem',
                      color: themePalette?.text || '#111827',
                    }}
                  >
                    Nome do Produtor
                  </div>
                  {normalizedConfig.showBiography && (
                    <p
                      style={{
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem',
                        lineHeight: '1.5',
                        color: themePalette?.text || '#6b7280',
                      }}
                    >
                      Biografia do produtor aparecerá aqui. Informações de
                      contato e suporte serão exibidas automaticamente.
                    </p>
                  )}
                  {normalizedConfig.showSocialLinks && (
                    <div
                      className='d-flex gap-2'
                      style={{ marginTop: '0.5rem' }}
                    >
                      {['facebook', 'instagram', 'twitter'].map((social) => (
                        <i
                          key={social}
                          className={`bx bxl-${social}`}
                          style={{
                            fontSize: '1.25rem',
                            color: themePalette?.text || '#6b7280',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div
            className='preview-video p-3 bg-dark rounded text-center'
            style={{ backgroundColor: themePalette?.secondary || '#1f2937' }}
          >
            <i
              className='bx bx-play-circle fs-1'
              style={{ color: themePalette?.text || '#ffffff' }}
            />
            <p
              className='mt-2 mb-0'
              style={{ color: themePalette?.text || '#ffffff' }}
            >
              <small style={{ color: themePalette?.text || '#ffffff' }}>
                Vídeo: {normalizedConfig.videoUrl || 'URL não definida'}
              </small>
            </p>
          </div>
        );

      case 'image':
        return (
          <div
            className='preview-image p-3 bg-light rounded text-center'
            style={{ backgroundColor: themePalette?.secondary || '#f3f4f6' }}
          >
            {normalizedConfig.imageUrl ? (
              <img
                src={normalizedConfig.imageUrl}
                alt={normalizedConfig.alt}
                className='img-fluid rounded'
                style={{ maxHeight: '150px' }}
              />
            ) : (
              <div>
                <i
                  className='bx bx-image fs-1'
                  style={{ color: themePalette?.text || '#6b7280' }}
                />
                <p
                  className='mt-2 mb-0'
                  style={{ color: themePalette?.text || '#6b7280' }}
                >
                  <small style={{ color: themePalette?.text || '#6b7280' }}>
                    Nenhuma imagem selecionada
                  </small>
                </p>
              </div>
            )}
          </div>
        );

      case 'cta':
        return (
          <div
            className='preview-cta p-4 rounded text-center'
            style={{
              backgroundColor:
                normalizedConfig.backgroundColor === 'transparent'
                  ? 'transparent'
                  : normalizedConfig.backgroundColor,
              color: themePalette?.text || '#111827',
            }}
          >
            <h5 style={{ color: themePalette?.text || '#111827' }}>
              {normalizedConfig.title || 'Call to Action'}
            </h5>
            {normalizedConfig.description && (
              <p style={{ color: themePalette?.text || '#6b7280' }}>
                {normalizedConfig.description}
              </p>
            )}
            <button
              className='btn btn-primary btn-sm mt-2'
              style={{
                backgroundColor: themePalette?.secondary || '#354052',
                borderColor: themePalette?.secondary || '#354052',
                color: themePalette?.text || '#ffffff',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (themePalette?.hover) {
                  e.currentTarget.style.backgroundColor = themePalette.hover;
                  e.currentTarget.style.borderColor = themePalette.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (themePalette?.secondary) {
                  e.currentTarget.style.backgroundColor =
                    themePalette.secondary;
                  e.currentTarget.style.borderColor = themePalette.secondary;
                }
              }}
            >
              {normalizedConfig.buttonText || 'Clique aqui'}
            </button>
          </div>
        );

      case 'faq':
        return (
          <div
            className='preview-faq p-3 rounded'
            style={{
              background: 'transparent',
              color: themePalette?.text || '#111827',
            }}
          >
            <h5 style={{ color: themePalette?.text || '#111827' }}>
              {normalizedConfig.title || 'Perguntas Frequentes'}
            </h5>
            <div className='mt-2'>
              {normalizedConfig.items?.length > 0 ? (
                normalizedConfig.items.map((item, i) => (
                  <div
                    key={i}
                    className='p-2 rounded mb-2'
                    style={{ background: 'rgba(0,0,0,0.08)' }}
                  >
                    <small
                      className='fw-bold'
                      style={{ color: themePalette?.text || '#111827' }}
                    >
                      {item.question}
                    </small>
                  </div>
                ))
              ) : (
                <small style={{ color: themePalette?.text || '#6b7280' }}>
                  Nenhuma pergunta adicionada
                </small>
              )}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div
            className='preview-testimonials p-3 bg-light rounded'
            style={{ backgroundColor: themePalette?.secondary || '#f3f4f6' }}
          >
            <h5 style={{ color: themePalette?.text || '#111827' }}>
              {normalizedConfig.title || 'Depoimentos'}
            </h5>
            <div className='d-flex gap-2 mt-2'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='p-2 rounded flex-fill'
                  style={{
                    backgroundColor: themePalette?.secondary || '#ffffff',
                  }}
                >
                  <small style={{ color: themePalette?.text || '#111827' }}>
                    &quot;Depoimento {i}&quot;
                  </small>
                </div>
              ))}
            </div>
          </div>
        );

      case 'stats':
        return (
          <div
            className='preview-stats p-3 bg-light rounded'
            style={{ backgroundColor: themePalette?.secondary || '#f3f4f6' }}
          >
            <div className='d-flex gap-3 justify-content-center'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='text-center'>
                  <div
                    className='fs-4 fw-bold'
                    style={{ color: themePalette?.text || '#111827' }}
                  >
                    100+
                  </div>
                  <small style={{ color: themePalette?.text || '#6b7280' }}>
                    Métrica {i}
                  </small>
                </div>
              ))}
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div
            className='preview-spacer bg-light rounded d-flex align-items-center justify-content-center'
            style={{
              height: `${normalizedConfig.customHeight || 60}px`,
              backgroundColor: themePalette?.secondary || '#f3f4f6',
            }}
          >
            <small style={{ color: themePalette?.text || '#6b7280' }}>
              Espaço: {normalizedConfig.customHeight || 60}px
            </small>
          </div>
        );

      case 'social':
        return (
          <div
            className='preview-social p-3 rounded text-center'
            style={{
              background: 'transparent',
              color: themePalette?.text || '#111827',
            }}
          >
            <h6 style={{ color: themePalette?.text || '#111827' }}>
              {normalizedConfig.title || 'Redes Sociais'}
            </h6>
            <div className='d-flex gap-2 justify-content-center mt-2'>
              {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                <div
                  key={social}
                  className='rounded-circle d-flex align-items-center justify-content-center'
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <i
                    className={`bx bxl-${social}`}
                    style={{ color: themePalette?.text || '#ffffff' }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div
            className='text-center py-3'
            style={{ color: themePalette?.text || '#6b7280' }}
          >
            <i
              className={`${definition.icon} fs-4 mb-2 d-block`}
              style={{ color: themePalette?.text || '#6b7280' }}
            />
            <small style={{ color: themePalette?.text || '#6b7280' }}>
              {definition.name}
            </small>
          </div>
        );
    }
  };

  return <div className='block-preview'>{renderPreview()}</div>;
};

export default BlockPreview;
