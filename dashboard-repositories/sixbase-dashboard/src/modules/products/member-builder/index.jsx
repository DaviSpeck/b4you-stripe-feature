import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Spinner,
  Modal,
} from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import { useParams, useHistory as useRouterHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../providers/api';
import BlockLibrary from './components/BlockLibrary';
import CanvasDnd from './components/CanvasDnd';
import BlockSettings from './components/BlockSettings';
import PersonalizationSettings from './components/PersonalizationSettings';
import {
  BLOCK_TYPES,
  createDefaultBlock,
  normalizeBlock,
  createDefaultLayout,
  isRequiredBlock,
  getBlockDefinition,
} from './types/blockTypes';
import { useHistory } from './hooks/useHistory';
import MemberPreviewModal from './components/MemberPreviewModal';
import { useProduct } from '../../../providers/contextProduct';
import './styles.scss';

const DEFAULT_THEME = {
  colorMembership: '#563d7c',
  colorMembershipSecondary: '#563d7c',
  colorMembershipText: '#ffffff',
  colorMembershipHover: '#354052',
  applyMembershipTheme: 'default',
  moduleCoverFormat: 'vertical',
};

const MemberBuilder = () => {
  const { uuidProduct } = useParams();
  const history = useRouterHistory();
  const { product } = useProduct();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasBannerChanges, setHasBannerChanges] = useState(false);
  const [unsavedReasons, setUnsavedReasons] = useState([]);
  const [copiedBlock, setCopiedBlock] = useState(null);
  const [showModalPreview, setShowModalPreview] = useState(false);
  const [productModules, setProductModules] = useState([]);
  const [previewTheme, setPreviewTheme] = useState(DEFAULT_THEME);
  const [recommendedProductsEnabled, setRecommendedProductsEnabled] = useState(false);

  const {
    state: blocks,
    setState: setBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory([]);

  // Registra mensagens legíveis sobre o que foi alterado (por ex.: bloco movido, conteúdo editado)
  const markUnsaved = (message) => {
    setHasUnsavedChanges(true);
    setUnsavedReasons((prev) => {
      if (!message || prev.includes(message)) return prev;
      return [...prev, message];
    });
  };

  const clearUnsaved = () => {
    setHasUnsavedChanges(false);
    setHasBannerChanges(false);
    setUnsavedReasons([]);
  };

  useEffect(() => {
    loadLayout();
    loadProductModules();
    loadRecommendedProducts();
  }, [uuidProduct]);

  const loadRecommendedProducts = async () => {
    try {
      const response = await api
        .get(`/products/${uuidProduct}/recommended-products`)
        .catch(() => ({ data: { enabled: false } }));
      setRecommendedProductsEnabled(response.data?.enabled || false);
    } catch (error) {
      console.error('Error loading recommended products:', error);
      setRecommendedProductsEnabled(false);
    }
  };

  useEffect(() => {
    if (!product) return;
    setPreviewTheme({
      colorMembership:
        product?.hex_color_membership_primary || DEFAULT_THEME.colorMembership,
      colorMembershipSecondary:
        product?.hex_color_membership_secondary ||
        DEFAULT_THEME.colorMembershipSecondary,
      colorMembershipText:
        product?.hex_color_membership_text || DEFAULT_THEME.colorMembershipText,
      colorMembershipHover:
        product?.hex_color_membership_hover ||
        DEFAULT_THEME.colorMembershipHover,
      applyMembershipTheme: product?.apply_membership_colors
        ? 'apply'
        : 'default',
      moduleCoverFormat:
        product?.module_cover_format || DEFAULT_THEME.moduleCoverFormat,
    });
  }, [
    product?.hex_color_membership_primary,
    product?.hex_color_membership_secondary,
    product?.hex_color_membership_text,
    product?.hex_color_membership_hover,
    product?.apply_membership_colors,
    product?.module_cover_format,
    uuidProduct,
    product,
  ]);

  useEffect(() => {
    if (!uuidProduct) return;
    const payload = {
      updatedAt: Date.now(),
      blocks,
      theme: previewTheme,
    };
    try {
      sessionStorage.setItem(
        `member-builder-preview:${uuidProduct}`,
        JSON.stringify(payload)
      );
    } catch (error) {
      console.warn('Unable to persist preview data in sessionStorage', error);
    }
  }, [blocks, previewTheme, uuidProduct]);

  const loadProductModules = async () => {
    try {
      const response = await api
        .get(`/products/modules/${uuidProduct}`)
        .catch(() => ({ data: [] }));
      setProductModules(response.data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setProductModules([]);
    }
  };

  const loadLayout = async () => {
    try {
      setLoading(true);
      const response = await api
        .get(`/products/${uuidProduct}/membership-page-layout`)
        .catch(() => ({ data: null }));

      const layoutData = response.data;
      if (!layoutData || !layoutData.layout || layoutData.layout.length === 0) {
        const defaultBlocks = createDefaultLayout();
        setLayout({
          version: '1.0',
          layout: defaultBlocks,
        });
        setBlocks(defaultBlocks);
        clearUnsaved();
      } else {
        setLayout(layoutData);

        const rawBlocks = layoutData.layout || [];

        const uniqueBlocksBefore = {
          social: rawBlocks.find((b) => b.type === BLOCK_TYPES.SOCIAL),
          faq: rawBlocks.find((b) => b.type === BLOCK_TYPES.FAQ),
          cta: rawBlocks.find((b) => b.type === BLOCK_TYPES.CTA),
        };

        const loadedBlocks = rawBlocks.map((block) => {
          const normalized =
            !block.config || Object.keys(block.config).length === 0
              ? normalizeBlock(block)
              : block;
          const definition = getBlockDefinition(block.type);
          return {
            ...block,
            ...normalized,
            id: block.id || normalized.id,
            type: block.type || normalized.type,
            order:
              typeof block.order === 'number' ? block.order : normalized.order,
            required:
              block.required !== undefined
                ? block.required
                : isRequiredBlock(block.type),
            config: {
              ...(definition?.defaultConfig || {}),
              ...(block.config || {}),
              ...(normalized.config || {}),
            },
          };
        });

        // CRÍTICO: Ordenar blocos pelo order antes de usar
        // O backend agora retorna com order correto via layout_data, mas sempre ordenamos para garantir
        const sortedLoadedBlocks = [...loadedBlocks].sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 999;
          const orderB = typeof b.order === 'number' ? b.order : 999;
          return orderA - orderB;
        });

        // Preservar o order original do backend (não sobrescrever com índice)
        // O backend já retorna com order correto via layout_data
        const finalLoadedBlocks = sortedLoadedBlocks.map((block) => ({
          ...block,
          // Manter order original, mas garantir que existe
          order: typeof block.order === 'number' ? block.order : 999,
        }));

        const uniqueBlocksAfter = {
          social: finalLoadedBlocks.find((b) => b.type === BLOCK_TYPES.SOCIAL),
          faq: finalLoadedBlocks.find((b) => b.type === BLOCK_TYPES.FAQ),
          cta: finalLoadedBlocks.find((b) => b.type === BLOCK_TYPES.CTA),
        };

        if (
          (uniqueBlocksBefore.social && !uniqueBlocksAfter.social) ||
          (uniqueBlocksBefore.faq && !uniqueBlocksAfter.faq) ||
          (uniqueBlocksBefore.cta && !uniqueBlocksAfter.cta)
        ) {
          const recoveredBlocks = rawBlocks.map((block) => {
            const definition = getBlockDefinition(block.type);
            return {
              ...block,
              config: {
                ...(definition?.defaultConfig || {}),
                ...(block.config || {}),
              },
            };
          });
          // Ordenar também os blocos recuperados
          const sortedRecovered = [...recoveredBlocks].sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 999;
            const orderB = typeof b.order === 'number' ? b.order : 999;
            return orderA - orderB;
          });
          setBlocks(sortedRecovered);
          toast.warning(
            'Aviso: Alguns blocos podem ter sido perdidos ao carregar. Verifique o layout.'
          );
          return;
        }

        if (finalLoadedBlocks.length !== rawBlocks.length) {
          toast.warning(
            'Aviso: Alguns blocos podem ter sido perdidos ao carregar. Verifique o layout.'
          );
        }

        setBlocks(finalLoadedBlocks);
      }
    } catch (error) {
      console.error('Error loading layout:', error);
      const defaultBlocks = createDefaultLayout();
      setLayout({
        version: '1.0',
        layout: defaultBlocks,
      });
      setBlocks(defaultBlocks);
      clearUnsaved();
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (blockType) => {
    if (isRequiredBlock(blockType)) {
      const existingBlock = blocks.find((b) => b.type === blockType);
      if (existingBlock) {
        toast.warning('Este bloco já existe e não pode ser duplicado');
        return;
      }
    }

    if (
      [BLOCK_TYPES.CTA, BLOCK_TYPES.FAQ, BLOCK_TYPES.SOCIAL].includes(blockType)
    ) {
      const existingOfType = blocks.find((b) => b.type === blockType);
      if (existingOfType) {
        toast.warning(
          'Você já adicionou este tipo de bloco. Edite o existente em vez de criar outro.'
        );
        return;
      }
    }

    let newBlockId = null;
    setBlocks((currentBlocks) => {
      const newBlock = createDefaultBlock(blockType, currentBlocks.length);
      if (newBlock) {
        newBlockId = newBlock.id;
        return [...currentBlocks, newBlock];
      }
      return currentBlocks;
    });
    if (newBlockId) {
      setSelectedBlockId(newBlockId);
      const definition = getBlockDefinition(blockType);
      const label = definition?.name || blockType;
      markUnsaved(`Bloco "${label}" adicionado ao layout.`);
    }
  };

  const handleSelectBlock = (blockId) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block && (block.required || isRequiredBlock(block.type))) {
      setSelectedBlockId(null);
      return;
    }
    setSelectedBlockId(blockId);
  };

  const handleUpdateBlock = (updatedBlock) => {
    const currentBlock = blocks.find((b) => b.id === updatedBlock.id);

    if (
      currentBlock &&
      (currentBlock.required || isRequiredBlock(currentBlock.type))
    ) {
      toast.warning('Este bloco é obrigatório e não pode ser modificado');
      return;
    }

    setBlocks((currentBlocks) => {
      const block = currentBlocks.find((b) => b.id === updatedBlock.id);

      if (!block) {
        console.warn('Bloco não encontrado para atualização:', updatedBlock.id);
        return currentBlocks;
      }

      const uniqueBlocksBefore = {
        social: currentBlocks.find((b) => b.type === BLOCK_TYPES.SOCIAL),
        faq: currentBlocks.find((b) => b.type === BLOCK_TYPES.FAQ),
        cta: currentBlocks.find((b) => b.type === BLOCK_TYPES.CTA),
      };

      const updatedBlocks = currentBlocks.map((b) => {
        if (b.id === updatedBlock.id) {
          const { config: updatedConfig, ...updatedBlockWithoutConfig } =
            updatedBlock;

          const mergedBlock = {
            ...b,
            ...updatedBlockWithoutConfig,
            id: b.id,
            type: b.type,
            order:
              typeof updatedBlock.order === 'number'
                ? updatedBlock.order
                : b.order,
            required: b.required,
            config: {
              ...(b.config || {}),
              ...(updatedConfig || {}),
            },
          };

          return mergedBlock;
        }
        return b;
      });

      if (updatedBlocks.length !== currentBlocks.length) {
        toast.error('Erro: Alguns blocos foram perdidos. Alteração cancelada.');
        return currentBlocks;
      }

      const uniqueBlocksAfter = {
        social: updatedBlocks.find((b) => b.type === BLOCK_TYPES.SOCIAL),
        faq: updatedBlocks.find((b) => b.type === BLOCK_TYPES.FAQ),
        cta: updatedBlocks.find((b) => b.type === BLOCK_TYPES.CTA),
      };

      const lostBlocks = [];
      if (uniqueBlocksBefore.social && !uniqueBlocksAfter.social) {
        lostBlocks.push('SOCIAL');
      }
      if (uniqueBlocksBefore.faq && !uniqueBlocksAfter.faq) {
        lostBlocks.push('FAQ');
      }
      if (uniqueBlocksBefore.cta && !uniqueBlocksAfter.cta) {
        lostBlocks.push('CTA');
      }

      if (lostBlocks.length > 0) {
        toast.error(
          `Erro: Blocos ${lostBlocks.join(
            ', '
          )} foram perdidos. Alteração cancelada.`
        );
        return currentBlocks;
      }

      const idsBefore = new Set(currentBlocks.map((b) => b.id));
      const idsAfter = new Set(updatedBlocks.map((b) => b.id));
      const missingIds = [...idsBefore].filter((id) => !idsAfter.has(id));
      const newIds = [...idsAfter].filter((id) => !idsBefore.has(id));

      if (missingIds.length > 0 || newIds.length > 0) {
        return currentBlocks;
      }

      return updatedBlocks;
    });

    const definition = getBlockDefinition(currentBlock.type);
    const label =
      currentBlock?.config?.title || definition?.name || currentBlock.type;
    markUnsaved(`Conteúdo do bloco "${label}" foi atualizado.`);
  };

  const handleReorderBlocks = (reorderedBlocks) => {
    // Usa o estado atual para descobrir o que mudou de posição
    setBlocks((currentBlocks) => {
      const indexById = new Map(
        currentBlocks.map((block, index) => [block.id, index])
      );

      let movedMessage = null;

      // Garantir que cada bloco tem order correto baseado na nova posição
      const blocksWithUpdatedOrder = reorderedBlocks.map((block, newIndex) => {
        const oldIndex = indexById.get(block.id);
        if (
          typeof oldIndex === 'number' &&
          oldIndex !== newIndex &&
          !movedMessage
        ) {
          const definition = getBlockDefinition(block.type);
          const label = block?.config?.title || definition?.name || block.type;
          movedMessage = `Bloco "${label}" foi movido da posição ${
            oldIndex + 1
          } para ${newIndex + 1}.`;
        }
        // Atualizar order baseado na nova posição
        return {
          ...block,
          order: newIndex,
        };
      });

      markUnsaved(movedMessage || 'Ordem dos blocos foi alterada.');

      return blocksWithUpdatedOrder;
    });
  };

  const handleRemoveBlock = (blockId) => {
    const blockToRemove = blocks.find((b) => b.id === blockId);

    if (
      blockToRemove &&
      (blockToRemove.required || isRequiredBlock(blockToRemove.type))
    ) {
      toast.warning('Este bloco é obrigatório e não pode ser removido');
      return;
    }

    if (
      window.confirm(
        'Tem certeza que deseja remover este bloco? Esta ação não pode ser desfeita.'
      )
    ) {
      setBlocks((currentBlocks) => {
        const newBlocks = currentBlocks.filter((b) => b.id !== blockId);
        // Update order
        newBlocks.forEach((block, index) => {
          block.order = index;
        });
        return newBlocks;
      });
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
      const definition = blockToRemove
        ? getBlockDefinition(blockToRemove.type)
        : null;
      const label =
        blockToRemove?.config?.title ||
        definition?.name ||
        blockToRemove?.type ||
        'Bloco';
      markUnsaved(`Bloco "${label}" foi removido do layout.`);
    }
  };

  const handleDuplicateBlock = (blockId) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);

    // Prevent duplicating required blocks or single-instance blocks
    if (
      blockToDuplicate &&
      (blockToDuplicate.required ||
        isRequiredBlock(blockToDuplicate.type) ||
        [BLOCK_TYPES.CTA, BLOCK_TYPES.FAQ, BLOCK_TYPES.SOCIAL].includes(
          blockToDuplicate.type
        ))
    ) {
      toast.warning('Este bloco não pode ser duplicado');
      return;
    }

    let blockDuplicated = false;
    let duplicatedLabel = null;
    setBlocks((currentBlocks) => {
      const block = currentBlocks.find((b) => b.id === blockId);
      if (block) {
        blockDuplicated = true;
        const definition = getBlockDefinition(block.type);
        duplicatedLabel =
          block?.config?.title || definition?.name || block.type;
        const newBlock = {
          ...block,
          id: `${block.type}-${Date.now()}`,
          order: currentBlocks.length,
          required: false, // Duplicated blocks are not required
        };
        return [...currentBlocks, newBlock];
      }
      return currentBlocks;
    });
    if (blockDuplicated) {
      const label = duplicatedLabel || 'Bloco';
      markUnsaved(`Bloco "${label}" foi duplicado.`);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Get the latest state from useHistory
      const currentBlocks = blocks;

      const faqBlock = currentBlocks.find((b) => b.type === BLOCK_TYPES.FAQ);
      const ctaBlock = currentBlocks.find((b) => b.type === BLOCK_TYPES.CTA);
      const socialBlock = currentBlocks.find(
        (b) => b.type === BLOCK_TYPES.SOCIAL
      );

      const requiredBlocks = [
        BLOCK_TYPES.DESCRIPTION,
        BLOCK_TYPES.MODULES,
        BLOCK_TYPES.PRODUCER,
      ];
      const missingRequired = requiredBlocks.filter(
        (type) => !currentBlocks.some((b) => b.type === type)
      );

      if (missingRequired.length > 0) {
        toast.error(
          `Erro: Blocos obrigatórios faltando: ${missingRequired.join(
            ', '
          )}. Não é possível salvar.`
        );
        setSaving(false);
        return;
      }

      // Ordenar blocos pelo order antes de sanitizar
      const sortedBlocks = [...currentBlocks].sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999;
        const orderB = typeof b.order === 'number' ? b.order : 999;
        return orderA - orderB;
      });

      // Preservar o order original (já está correto após reordenação)
      // Apenas garantir que todos os blocos têm order válido
      const blocksWithOrder = sortedBlocks.map((block, index) => ({
        ...block,
        // Manter order original se válido, senão usar índice como fallback
        order: typeof block.order === 'number' ? block.order : index,
      }));

      const sanitizedBlocks = blocksWithOrder.map((block) => {
        const definition = getBlockDefinition(block.type);
        return {
          ...block,
          order: block.order, // Garantir que order está presente
          config: {
            ...(definition?.defaultConfig || {}),
            ...(block.config || {}),
          },
        };
      });

      if (sanitizedBlocks.length !== currentBlocks.length) {
        toast.error(
          'Erro: Blocos foram perdidos durante o processo de salvamento.'
        );
        setSaving(false);
        return;
      }

      const uniqueBlocksAfterSanitize = {
        social: sanitizedBlocks.find((b) => b.type === BLOCK_TYPES.SOCIAL),
        faq: sanitizedBlocks.find((b) => b.type === BLOCK_TYPES.FAQ),
        cta: sanitizedBlocks.find((b) => b.type === BLOCK_TYPES.CTA),
      };

      if (
        (socialBlock && !uniqueBlocksAfterSanitize.social) ||
        (faqBlock && !uniqueBlocksAfterSanitize.faq) ||
        (ctaBlock && !uniqueBlocksAfterSanitize.cta)
      ) {
        toast.error(
          'Erro: Blocos únicos foram perdidos durante o processo de salvamento.'
        );
        setSaving(false);
        return;
      }

      const layoutData = {
        version: '1.0',
        layout: sanitizedBlocks,
      };

      await api.put(`/products/${uuidProduct}/membership-page-layout`, {
        layout: layoutData,
      });

      setLayout(layoutData);
      clearUnsaved();
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar o layout');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja resetar para o layout padrão? Todas as alterações serão perdidas.'
      )
    ) {
      try {
        setSaving(true);
        // Use default layout structure
        const defaultBlocks = createDefaultLayout();
        setBlocks(defaultBlocks);
        setSelectedBlockId(null);

        // Save the default layout to backend
        const layoutData = {
          version: '1.0',
          layout: defaultBlocks,
        };

        await api.put(`/products/${uuidProduct}/membership-page-layout`, {
          layout: layoutData,
        });

        setLayout(layoutData);
        clearUnsaved();
        toast.success('Layout resetado para o padrão');
      } catch (error) {
        console.error('Error resetting layout:', error);
        toast.error('Erro ao resetar o layout');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleResetSectionsOrder = () => {
    const currentBlocks = [...blocks];
    const requiredBlocks = [];
    const customBlocks = [];

    const requiredOrder = [
      BLOCK_TYPES.DESCRIPTION,
      BLOCK_TYPES.MODULES,
      BLOCK_TYPES.PRODUCER,
    ];

    currentBlocks.forEach((block) => {
      if (requiredOrder.includes(block.type)) {
        requiredBlocks.push(block);
      } else {
        customBlocks.push(block);
      }
    });

    const orderedRequiredBlocks = requiredOrder
      .map((type) => requiredBlocks.find((b) => b.type === type))
      .filter(Boolean);

    const reorderedBlocks = [...orderedRequiredBlocks, ...customBlocks];

    const finalBlocks = reorderedBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    const hasChanges = finalBlocks.some(
      (block, index) => block.id !== currentBlocks[index]?.id
    );

    if (!hasChanges) {
      toast.info('As seções já estavam na ordem padrão.');
      return;
    }

    setBlocks(finalBlocks);
    markUnsaved(
      'Seções reorganizadas para a ordem padrão (Descrição, Módulos e Produtor no topo).'
    );
    toast.success(
      'Seções reorganizadas para a ordem padrão. Blocos fixos mantidos no topo.'
    );
  };

  const handleUndo = () => {
    const previousBlocks = undo();
    markUnsaved('Alterações desfeitas (undo).');
  };

  const handleRedo = () => {
    const nextBlocks = redo();
    markUnsaved('Alterações refeitas (redo).');
  };

  const handleCopyBlock = (blockId) => {
    const blockToCopy = blocks.find((b) => b.id === blockId);
    if (blockToCopy) {
      setCopiedBlock(blockToCopy);
      toast.success('Bloco copiado!');
    }
  };

  const handlePasteBlock = () => {
    if (copiedBlock) {
      setBlocks((currentBlocks) => {
        const newBlock = {
          ...copiedBlock,
          id: `${copiedBlock.type}-${Date.now()}`,
          order: currentBlocks.length,
        };
        return [...currentBlocks, newBlock];
      });
      const definition = getBlockDefinition(copiedBlock.type);
      const label =
        copiedBlock?.config?.title || definition?.name || copiedBlock.type;
      markUnsaved(`Bloco "${label}" foi colado no layout.`);
      toast.success('Bloco colado!');
    }
  };

  const handleClose = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        `Você tem alterações não salvas${
          unsavedReasons.length ? `:\n- ${unsavedReasons.join('\n- ')}\n` : ''
        }Deseja realmente sair?`
      )
    ) {
      return;
    }
    history.push(`/produtos/editar/${uuidProduct}/conteudo-custom`);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const moduleCoverFormat =
    previewTheme?.moduleCoverFormat ||
    product?.module_cover_format ||
    DEFAULT_THEME.moduleCoverFormat;

  if (loading) {
    return (
      <Container fluid className='py-5 text-center'>
        <Spinner animation='border' variant='primary' />
        <p className='mt-3 text-muted'>Carregando builder...</p>
      </Container>
    );
  }

  return (
    <Modal
      show={true}
      onHide={handleClose}
      className='member-builder-modal'
      backdrop={true}
      keyboard={true}
      centered={false}
    >
      <Modal.Header
        className='builder-header border-bottom py-3 flex-column align-items-start'
        closeButton={false}
      >
        <Modal.Title className='w-100'>
          <h4 className='mb-0'>
            <i className='bx bx-layout me-2' />
            Builder da Página de Membros
          </h4>
        </Modal.Title>
        <div className='builder-header-actions w-100 mt-3'>
          <div className='builder-toolbar d-flex align-items-center justify-content-between gap-2 w-100 flex-wrap flex-md-nowrap'>
            <div className='toolbar-actions d-flex align-items-center justify-content-start gap-2 flex-grow-1 flex-wrap flex-md-nowrap'>
              <div className='btn-group mr-2'>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title='Desfazer'
                >
                  <i className='bx bx-undo' />
                </Button>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title='Refazer'
                >
                  <i className='bx bx-redo' />
                </Button>
              </div>

              <div className='btn-group mr-2'>
                <Button
                  variant='outline-secondary'
                  size='sm'
                  onClick={handleResetSectionsOrder}
                  title='Reorganizar seções para ordem padrão (blocos fixos no topo)'
                >
                  <i className='bx bx-sort me-1' />
                  Reorganizar Seções
                </Button>
              </div>

              <div className='btn-group mr-2'>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={() => setShowModalPreview(true)}
                >
                  <i className='bx bx-show-alt me-1' />
                  Pré-visualizar curso
                </Button>
              </div>

              <div className='btn-group mr-2'>
                <Button
                  variant='primary'
                  size='sm'
                  onClick={handleSave}
                  disabled={saving || (!hasUnsavedChanges && !hasBannerChanges)}
                >
                  {saving ? (
                    <>
                      <Spinner
                        as='span'
                        animation='border'
                        size='sm'
                        className='me-1'
                      />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className='bx bx-save me-1' />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className='btn-group'>
              <Button
                variant='outline-secondary'
                size='sm'
                onClick={handleClose}
              >
                <i className='bx bx-x' />
              </Button>
            </div>
          </div>
        </div>
      </Modal.Header>

      {hasUnsavedChanges && (
        <Alert variant='warning' className='mb-0 py-2 mx-3 mt-2'>
          <i className='bx bx-info-circle me-1' />
          Você tem alterações não salvas
          {unsavedReasons.length > 0 && (
            <small className='d-block text-muted mt-1'>
              Alterações: {unsavedReasons.join(' • ')}
            </small>
          )}
        </Alert>
      )}

      {showModalPreview && (
        <MemberPreviewModal
          show={showModalPreview}
          onHide={() => setShowModalPreview(false)}
          blocks={blocks}
          product={product}
          productModules={productModules}
          theme={previewTheme}
          storageKey={`member-builder-preview:${uuidProduct}`}
          recommendedProductsEnabled={recommendedProductsEnabled}
        />
      )}

      <Modal.Body
        className='p-0 builder-content'
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Container fluid className='h-100 d-flex flex-column'>
          {/* Desktop / large screens */}
          <Row
            className='g-0 flex-grow-1 d-none d-lg-flex'
            style={{ minHeight: 0 }}
          >
            {/* Left: Block Library and Personalization */}
            <Col lg={3} className='border-end member-builder-left-panel'>
              <div className='p-3' style={{ paddingTop: '1.5rem' }}>
                <p className='text-muted small mb-2'>
                  Esses blocos controlam apenas a composição visual da página de
                  membros (não alteram o conteúdo dos módulos).
                </p>
                <BlockLibrary onAddBlock={handleAddBlock} blocks={blocks} />
              </div>
              <div className='p-3 border-top'>
                <PersonalizationSettings
                  onThemeChange={(theme) =>
                    setPreviewTheme((current) => ({ ...current, ...theme }))
                  }
                  onBannerChange={(fieldName, value) => {
                    setHasBannerChanges(true);
                    const bannerLabel =
                      fieldName === 'banner_mobile'
                        ? 'Banner mobile'
                        : 'Banner desktop';
                    markUnsaved(`${bannerLabel} atualizado.`);
                  }}
                />
              </div>
            </Col>

            {/* Center: Canvas */}
            <Col
              lg={selectedBlockId ? 6 : 9}
              className='d-flex flex-column'
              style={{ overflowY: 'auto' }}
            >
              <div className='p-3 flex-grow-1'>
                <CanvasDnd
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={handleSelectBlock}
                  onReorderBlocks={handleReorderBlocks}
                  onRemoveBlock={handleRemoveBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onCopyBlock={handleCopyBlock}
                  moduleCoverFormat={moduleCoverFormat}
                  product={product}
                  productModules={productModules}
                  recommendedProductsEnabled={recommendedProductsEnabled}
                />
              </div>
            </Col>

            {/* Right: Block Settings */}
            {selectedBlockId && (
              <Col
                lg={3}
                className='border-start d-flex flex-column'
                style={{ overflowY: 'auto' }}
              >
                <div className='p-3'>
                  <BlockSettings
                    block={selectedBlock}
                    onUpdateBlock={handleUpdateBlock}
                    onClose={() => setSelectedBlockId(null)}
                  />
                </div>
              </Col>
            )}
          </Row>

          {/* Mobile layout */}
          <div className='d-block d-lg-none flex-grow-1 member-builder-mobile'>
            {/* Blocos disponíveis (library) no topo */}
            <div className='p-3'>
              <p className='text-muted small mb-2'>
                Esses blocos controlam a aparência da página de membros.
                Conteúdo e módulos seguem configurados no produto.
              </p>
              <BlockLibrary onAddBlock={handleAddBlock} blocks={blocks} />
            </div>

            {/* Canvas com blocos como accordions */}
            <div className='p-3 pt-0'>
              <CanvasDnd
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={handleSelectBlock}
                onReorderBlocks={handleReorderBlocks}
                onRemoveBlock={handleRemoveBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onCopyBlock={handleCopyBlock}
                moduleCoverFormat={moduleCoverFormat}
                product={product}
                productModules={productModules}
                renderSettings={(block) => (
                  <BlockSettings
                    block={block}
                    onUpdateBlock={handleUpdateBlock}
                    onClose={() => setSelectedBlockId(null)}
                  />
                )}
              />
            </div>

            {/* Personalização permanece em baixo dentro de um accordion */}
            <div className='px-3 pb-3 pt-0'>
              <Accordion
                defaultActiveKey='0'
                className='member-builder-mobile-accordion'
              >
                <Card>
                  <Accordion.Toggle as={Card.Header} eventKey='0'>
                    Opções de edição
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey='0'>
                    <Card.Body>
                      <div className='mb-0'>
                        <PersonalizationSettings
                          onThemeChange={(theme) =>
                            setPreviewTheme((current) => ({
                              ...current,
                              ...theme,
                            }))
                          }
                          onBannerChange={(fieldName, value) => {
                            setHasBannerChanges(true);
                            const bannerLabel =
                              fieldName === 'banner_mobile'
                                ? 'Banner mobile'
                                : 'Banner desktop';
                            markUnsaved(`${bannerLabel} atualizado.`);
                          }}
                        />
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </div>
          </div>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default MemberBuilder;
