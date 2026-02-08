import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../../../providers/contextProduct';
import api from '../../../../providers/api';
import { notify } from '../../../functions';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import UploadImage from '../../../../jsx/components/UploadImage';
import RemoveUploadImage from '../../../../jsx/components/RemoveUploadImage';

const PersonalizationSettings = ({
  onThemeChange = () => {},
  onBannerChange = () => {},
}) => {
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();

  const [colorMembership, setColorMembership] = useState(
    product?.hex_color_membership_primary || '#563d7c'
  );
  const [colorMembershipSecondary, setColorMembershipSecondary] = useState(
    product?.hex_color_membership_secondary || '#563d7c'
  );
  const [applyMembershipTheme, setApplyMembershipTheme] = useState(
    product?.apply_membership_colors ? 'apply' : 'default'
  );
  const isApplyingCustomTheme = applyMembershipTheme === 'apply';
  const [colorMembershipText, setColorMembershipText] = useState(
    product?.hex_color_membership_text || '#ffffff'
  );
  const [colorMembershipHover, setColorMembershipHover] = useState(
    product?.hex_color_membership_hover || '#354052'
  );
  const [moduleCoverFormat, setModuleCoverFormat] = useState(
    product?.module_cover_format || 'vertical' // 'vertical' (290x512) or 'horizontal' (300x225 landscape)
  );
  const [saving, setSaving] = useState(false);
  const [savingCoverFormat, setSavingCoverFormat] = useState(false);
  const lastUuidRef = useRef(null);
  const isInitializedRef = useRef(false);
  const onThemeChangeRef = useRef(onThemeChange);

  // Mantém a referência do callback atualizada
  useEffect(() => {
    onThemeChangeRef.current = onThemeChange;
  }, [onThemeChange]);

  // Sincroniza estados apenas quando o produto é carregado inicialmente ou quando uuidProduct muda
  useEffect(() => {
    if (!product || !uuidProduct) return;

    // Só atualiza se o uuidProduct mudou (produto diferente) ou se ainda não inicializamos
    const uuidChanged = lastUuidRef.current !== uuidProduct;

    if (uuidChanged || !isInitializedRef.current) {
      lastUuidRef.current = uuidProduct;
      isInitializedRef.current = true;

      setColorMembership(product?.hex_color_membership_primary || '#563d7c');
      setColorMembershipSecondary(
        product?.hex_color_membership_secondary || '#563d7c'
      );
      setApplyMembershipTheme(
        product?.apply_membership_colors ? 'apply' : 'default'
      );
      setColorMembershipText(product?.hex_color_membership_text || '#ffffff');
      setColorMembershipHover(product?.hex_color_membership_hover || '#354052');
      setModuleCoverFormat(product?.module_cover_format || 'vertical');
    }
  }, [uuidProduct]); // Só depende de uuidProduct para evitar resets durante edição

  // Notifica mudanças de tema sem causar loop infinito
  useEffect(() => {
    onThemeChangeRef.current({
      colorMembership,
      colorMembershipSecondary,
      colorMembershipText,
      colorMembershipHover,
      applyMembershipTheme,
      moduleCoverFormat,
    });
  }, [
    colorMembership,
    colorMembershipSecondary,
    colorMembershipText,
    colorMembershipHover,
    applyMembershipTheme,
    moduleCoverFormat,
    // Removido onThemeChange das dependências para evitar loop
  ]);

  const handleSaveColor = () => {
    setSaving(true);
    api
      .put(`products/${uuidProduct}/membership-color`, {
        hex_color: colorMembership,
        hex_color_secondary: colorMembershipSecondary,
        hex_color_text: colorMembershipText,
        hex_color_hover: colorMembershipHover,
        apply_membership_colors: applyMembershipTheme === 'apply',
      })
      .then(() => {
        setProduct((prev) => ({
          ...prev,
          hex_color_membership_primary: colorMembership,
          hex_color_membership_secondary: colorMembershipSecondary,
          hex_color_membership_text: colorMembershipText,
          hex_color_membership_hover: colorMembershipHover,
          apply_membership_colors: applyMembershipTheme === 'apply',
        }));

        notify({
          message: 'Cores da área de membros salvas com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao salvar as cores da área de membros',
          type: 'error',
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleSaveCoverFormat = () => {
    setSavingCoverFormat(true);
    api
      .put(`/products/${uuidProduct}/general`, {
        module_cover_format: moduleCoverFormat,
      })
      .then((response) => {
        setProduct((prev) => ({
          ...prev,
          module_cover_format: moduleCoverFormat,
        }));
        notify({
          message: 'Formato da capa dos módulos salvo com sucesso',
          type: 'success',
        });
      })
      .catch((err) => {
        console.error('Erro ao salvar formato:', err);
        notify({
          message:
            err.response?.data?.message || 'Falha ao salvar o formato da capa',
          type: 'error',
        });
      })
      .finally(() => {
        setSavingCoverFormat(false);
      });
  };

  const setImg_link = (link, name) => {
    setProduct((prev) => ({ ...prev, [name]: link }));
    // Notificar mudança de banner para habilitar botão salvar
    if (name === 'banner' || name === 'banner_mobile') {
      onBannerChange(name, link);
    }
  };

  return (
    <div className='personalization-settings'>
      <h6 className='mb-2'>Personalização</h6>
      <small className='text-muted d-block mb-3'>
        As cores afetam todos os botões e ícones da área de membros.
      </small>

      {/* Cores */}
      <Card className='mb-2'>
        <Card.Body className='p-2'>
          <h6 className='mb-2' style={{ fontSize: '14px' }}>
            Cores
          </h6>

          <Form.Group className='mb-3'>
            <Form.Label style={{ fontSize: '12px' }}>Aplicar cores</Form.Label>
            <Form.Text
              className='text-muted d-block mb-1'
              style={{ fontSize: '10px', lineHeight: '1.3' }}
            >
              Define se as cores personalizadas serão aplicadas na área de
              membros ou se será usado o tema padrão do sistema
            </Form.Text>
            <Form.Control
              as='select'
              size='sm'
              value={applyMembershipTheme}
              onChange={(event) => setApplyMembershipTheme(event.target.value)}
            >
              <option value='default'>Manter padrão do sistema</option>
              <option value='apply'>Aplicar cores personalizadas</option>
            </Form.Control>
          </Form.Group>

          {isApplyingCustomTheme && (
            <>
              <div className='mb-2'>
                <label htmlFor='colorPrimary' style={{ fontSize: '12px' }}>
                  Primária
                </label>
                <div
                  className='d-flex align-items-center c-picker'
                  style={{ position: 'relative' }}
                >
                  <Form.Control
                    type='color'
                    id='colorPrimary'
                    title='Escolha sua cor'
                    value={colorMembership}
                    onChange={(e) => setColorMembership(e.currentTarget.value)}
                    style={{ height: 35, width: '100%', paddingRight: '35px' }}
                  />
                  <i
                    className='bx bxs-eyedropper'
                    style={{
                      fontSize: '18px',
                      color: '#6c757d',
                      position: 'absolute',
                      right: '10px',
                      pointerEvents: 'none',
                    }}
                  ></i>
                </div>
              </div>
              <div className='mb-2'>
                <label htmlFor='colorSecondary' style={{ fontSize: '12px' }}>
                  Secundária
                </label>
                <div
                  className='d-flex align-items-center c-picker'
                  style={{ position: 'relative' }}
                >
                  <Form.Control
                    type='color'
                    id='colorSecondary'
                    title='Escolha sua cor'
                    value={colorMembershipSecondary}
                    onChange={(e) =>
                      setColorMembershipSecondary(e.currentTarget.value)
                    }
                    style={{ height: 35, width: '100%', paddingRight: '35px' }}
                  />
                  <i
                    className='bx bxs-eyedropper'
                    style={{
                      fontSize: '18px',
                      color: '#6c757d',
                      position: 'absolute',
                      right: '10px',
                      pointerEvents: 'none',
                    }}
                  ></i>
                </div>
              </div>
              <div className='mb-2'>
                <label htmlFor='colorText' style={{ fontSize: '12px' }}>
                  Texto
                </label>
                <div
                  className='d-flex align-items-center c-picker'
                  style={{ position: 'relative' }}
                >
                  <Form.Control
                    type='color'
                    id='colorText'
                    title='Escolha a cor do texto'
                    value={colorMembershipText}
                    onChange={(e) =>
                      setColorMembershipText(e.currentTarget.value)
                    }
                    style={{ height: 35, width: '100%', paddingRight: '35px' }}
                  />
                  <i
                    className='bx bxs-eyedropper'
                    style={{
                      fontSize: '18px',
                      color: '#6c757d',
                      position: 'absolute',
                      right: '10px',
                      pointerEvents: 'none',
                    }}
                  ></i>
                </div>
              </div>
              <div className='mb-2'>
                <label htmlFor='colorHover' style={{ fontSize: '12px' }}>
                  Hover
                </label>
                <Form.Text
                  className='text-muted d-block mb-1'
                  style={{ fontSize: '10px', lineHeight: '1.3' }}
                >
                  Cor exibida quando o usuário passa o mouse sobre botões e
                  elementos interativos
                </Form.Text>
                <div
                  className='d-flex align-items-center c-picker'
                  style={{ position: 'relative' }}
                >
                  <Form.Control
                    type='color'
                    id='colorHover'
                    title='Escolha a cor do hover'
                    value={colorMembershipHover}
                    onChange={(e) =>
                      setColorMembershipHover(e.currentTarget.value)
                    }
                    style={{ height: 35, width: '100%', paddingRight: '35px' }}
                  />
                  <i
                    className='bx bxs-eyedropper'
                    style={{
                      fontSize: '18px',
                      color: '#6c757d',
                      position: 'absolute',
                      right: '10px',
                      pointerEvents: 'none',
                    }}
                  ></i>
                </div>
              </div>
            </>
          )}
          <ButtonDS
            size='sm'
            onClick={handleSaveColor}
            disabled={saving}
            className='w-100 mt-2'
          >
            {saving ? 'Salvando...' : 'Salvar cores'}
          </ButtonDS>
        </Card.Body>
      </Card>

      {/* Formato da Capa dos Módulos */}
      <Card className='mb-2'>
        <Card.Body className='p-2'>
          <h6 className='mb-2' style={{ fontSize: '14px' }}>
            Formato da Capa dos Módulos
          </h6>
          <Form.Group className='mb-2'>
            <Form.Label style={{ fontSize: '12px' }}>Formato</Form.Label>
            <Form.Control
              as='select'
              size='sm'
              value={moduleCoverFormat}
              onChange={(event) => setModuleCoverFormat(event.target.value)}
            >
              <option value='vertical'>Vertical (290 x 512 px)</option>
              <option value='horizontal'>
                Horizontal (300 x 225 px - formato paisagem)
              </option>
            </Form.Control>
            <Form.Text className='text-muted' style={{ fontSize: '11px' }}>
              {moduleCoverFormat === 'vertical'
                ? 'Formato padrão vertical'
                : 'Formato horizontal para cards'}
            </Form.Text>
          </Form.Group>
          <ButtonDS
            size='sm'
            onClick={handleSaveCoverFormat}
            disabled={savingCoverFormat}
            className='w-100'
          >
            {savingCoverFormat ? 'Salvando...' : 'Salvar formato'}
          </ButtonDS>
        </Card.Body>
      </Card>

      {/* Banner Desktop */}
      <Card className='mb-2'>
        <Card.Body className='p-2'>
          <h6 className='mb-2' style={{ fontSize: '14px' }}>
            Banner Desktop
          </h6>
          <small
            className='text-muted d-block mb-2'
            style={{ fontSize: '11px' }}
          >
            1300 x 500 px
          </small>
          <Form.Text
            className='text-muted d-block mb-2'
            style={{ fontSize: '10px', lineHeight: '1.3' }}
          >
            Exibido no banner principal da página inicial da área de membros
            (desktop e tablet)
          </Form.Text>
          <UploadImage
            route={`/products/images/${uuidProduct}/banner`}
            multiple={false}
            field={'banner'}
            update={'banner'}
            setImg_link={(link) => setImg_link(link, 'banner')}
          />
          {product?.banner && (
            <div className='form-group mt-2'>
              <img
                className='img-fluid'
                src={product.banner}
                alt='Banner desktop'
                style={{
                  maxWidth: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              />
              <RemoveUploadImage
                route={`/products/images/${uuidProduct}/banner`}
                field={'banner'}
                setImg_link={(link) => setImg_link(link, 'banner')}
                img_link={product.banner}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Banner Mobile */}
      <Card className='mb-2'>
        <Card.Body className='p-2'>
          <h6 className='mb-2' style={{ fontSize: '14px' }}>
            Banner Mobile
          </h6>
          <small
            className='text-muted d-block mb-2'
            style={{ fontSize: '11px' }}
          >
            400 x 500 px
          </small>
          <Form.Text
            className='text-muted d-block mb-2'
            style={{ fontSize: '10px', lineHeight: '1.3' }}
          >
            Exibido no banner principal da página inicial da área de membros
            (dispositivos móveis)
          </Form.Text>
          <UploadImage
            route={`/products/images/${uuidProduct}/banner-mobile`}
            multiple={false}
            field={'banner_mobile'}
            update={'banner_mobile'}
            setImg_link={(link) => setImg_link(link, 'banner_mobile')}
          />
          {product?.banner_mobile && (
            <div className='form-group mt-2'>
              <img
                className='img-fluid'
                src={product.banner_mobile}
                alt='Banner mobile'
                style={{
                  maxWidth: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              />
              <RemoveUploadImage
                route={`/products/images/${uuidProduct}/banner-mobile`}
                field={'banner_mobile'}
                setImg_link={(link) => setImg_link(link, 'banner_mobile')}
                img_link={product.banner_mobile}
              />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Capa Customizada */}
      <Card>
        <Card.Body className='p-2'>
          <h6 className='mb-2' style={{ fontSize: '14px' }}>
            Capa Customizada
          </h6>
          <small
            className='text-muted d-block mb-2'
            style={{ fontSize: '11px' }}
          >
            290 x 512 px
          </small>
          <Form.Text
            className='text-muted d-block mb-2'
            style={{ fontSize: '10px', lineHeight: '1.3' }}
          >
            Exibida no bloco de descrição do curso (lado esquerdo do card de
            informações) e na página inicial da área de membros em cursos
          </Form.Text>
          <UploadImage
            route={`/products/images/${uuidProduct}/cover-custom`}
            multiple={false}
            field={'cover_custom'}
            update={'cover_custom'}
            setImg_link={(link) => setImg_link(link, 'cover_custom')}
            verifyLength={{ width: 290, height: 512 }}
          />
          {product?.cover_custom && (
            <div className='form-group mt-2'>
              <img
                className='img-fluid'
                src={product.cover_custom}
                alt='Capa customizada'
                style={{
                  maxWidth: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '4px',
                }}
              />
              <RemoveUploadImage
                route={`/products/images/${uuidProduct}/cover-custom`}
                field={'cover_custom'}
                setImg_link={(link) => setImg_link(link, 'cover_custom')}
                img_link={product.cover_custom}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonalizationSettings;
