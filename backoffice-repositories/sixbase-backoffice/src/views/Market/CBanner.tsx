import DragDropTable from 'components/DragDropTable';
import SortableBannerRow from 'components/SortableBannerRow';
import TypeSelector from 'components/TypeSelector';
import moment from 'moment';
import { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Row,
  Table,
} from 'reactstrap';
import {
  BannerImage,
  CBannerProps,
  UploadData,
} from '../../interfaces/market.interface';
import { api } from '../../services/api';

const configNotify = {
  position: 'top-right' as const,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

interface DragDropBannerProps extends CBannerProps {
  onOrderChange?: (banners: BannerImage[]) => void;
}

const CBanner: FC<DragDropBannerProps> = ({
  apiEndpoint = 'market/images/banner',
  bannerTypeOptions = [
    { id: 1, name: 'Desktop' },
    { id: 2, name: 'Mobile' },
  ],
  onOrderChange,
}) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [viewImages, setViewImages] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<number>(1); // 1 = Desktop, 2 = Mobile
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (): void => {
    api
      .get<BannerImage[]>(apiEndpoint)
      .then((response) => {
        setViewImages(response.data);
      })
      .catch((err) => {
        console.error('Erro ao carregar banners:', err);
        // Se o erro for relacionado ao campo 'order', tenta carregar dados mockados
        if (
          err.response?.status === 500 &&
          err.response?.data?.message?.includes('order')
        ) {
          setViewImages([]);
        }
      });
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
      (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
        index: number,
      ): void => {
        setter((prev) => {
          const updated = [...prev];
          updated[index] = e.target.value;
          return updated;
        });
      };

  const handleBrowse = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFiles((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
    }
  };

  const sendImages = async (): Promise<void> => {
    if (uploadFiles.length === 0) {
      toast.warn('Nenhuma imagem selecionada.', configNotify);
      return;
    }

    try {
      const uploadLinks = await Promise.all(
        uploadFiles.map((file) =>
          api.get<UploadData>(`market/banners/${file.name}`)
        )
      );

      const currentBanners = getBannersByType(
        Number(types[0] || bannerTypeOptions[0].id)
      );
      const nextOrder = currentBanners.length;

      await Promise.all(
        uploadLinks.map(async (data, index) => {
          const file = uploadFiles[index];

          await fetch(data.data.url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: file,
          });

          await api.post(`market/banners`, {
            key: data.data.key,
            url: links[index] || '',
            id_type: types[index] || bannerTypeOptions[0].id.toString(),
            order: nextOrder + index,
          });
        })
      );

      toast.success('Imagens enviadas com sucesso!', configNotify);
      fetchData();
    } catch (error) {
      console.error('[sendImages] Erro ao enviar imagens:', error);
      toast.error('Erro ao enviar imagens.', configNotify);
    }
  };

  const handleDelete = async (item: BannerImage): Promise<void> => {
    try {
      if (!item.uuid) {
        toast.error('UUID do banner não encontrado.', configNotify);
        return;
      }
      await api.delete(`market/banners/${item.uuid}`);
      setViewImages((prev) => prev.filter((img) => img.uuid !== item.uuid));
      toast.success('Imagem removida com sucesso!', configNotify);
    } catch (error) {
      toast.error('Erro ao excluir a imagem.', configNotify);
      console.error('Erro ao deletar banner:', error);
    }
  };

  const handleReorder = (reorderedBanners: BannerImage[]): void => {
    // Atualiza a ordem dos banners
    const updatedImages = viewImages.map((img) => {
      const reorderedBanner = reorderedBanners.find(
        (banner) => banner.uuid === img.uuid,
      );
      if (reorderedBanner) {
        const newOrder = reorderedBanners.indexOf(reorderedBanner);
        return { ...img, order: newOrder };
      }
      return img;
    });

    setViewImages(updatedImages);
    setIsDirty(true);

    // Chama callback se fornecido
    if (onOrderChange) {
      onOrderChange(updatedImages);
    }
  };

  const saveOrder = async (): Promise<void> => {
    try {
      if (!isDirty) return;
      setIsSaving(true);
      const banners = getBannersByType();

      if (banners.length === 0) {
        toast.warn('Nenhum banner encontrado para reordenar.', configNotify);
        return;
      }

      const bannersToUpdate = banners
        .filter((img) => img.uuid) // Filtrar apenas banners com UUID válido
        .map((img, index) => ({
          uuid: img.uuid,
          order: index,
        }));

      if (bannersToUpdate.length === 0) {
        toast.warn(
          'Nenhum banner válido encontrado para reordenar.',
          configNotify,
        );
        return;
      }

      const response = await api.put('market/banners/order', {
        banners: bannersToUpdate,
      });

      if (response.data?.message) {
        toast.info(response.data.message, configNotify);
      } else {
        toast.success(
          'Ordem dos banners atualizada com sucesso!',
          configNotify,
        );
        // Recarrega os dados para garantir sincronização
        fetchData();
        setIsDirty(false);
      }
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, configNotify);
      } else {
        toast.error('Erro ao salvar ordem dos banners.', configNotify);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getBannersByType = (typeId?: number): BannerImage[] => {
    const targetType = typeId || selectedType;
    const filteredBanners = viewImages
      .filter((img) => img.type && img.type.id === targetType && img.uuid)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return filteredBanners;
  };

  const renderBannerTable = (): React.ReactNode => {
    const banners = getBannersByType();
    const selectedTypeName =
      bannerTypeOptions.find((opt) => opt.id === selectedType)?.name ||
      'Desktop';

    return (
      <Card className="mb-3">
        <CardHeader>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 me-3">
                {selectedTypeName} ({banners.length} banners)
              </h5>
              <TypeSelector
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                bannerTypeOptions={bannerTypeOptions}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              {!isEditMode ? (
                <Button
                  color="primary"
                  onClick={() => setIsEditMode(true)}
                  size="sm"
                >
                  <i className="bx bx-edit me-1"></i>
                  Editar Ordem
                </Button>
              ) : (
                <>
                  <Button
                    color="secondary"
                    onClick={() => {
                      setIsEditMode(false);
                      setIsDirty(false);
                    }}
                    size="sm"
                  >
                    <i className="bx bx-x me-1"></i>
                    Parar de Editar
                  </Button>
                  <Button
                    color="success"
                    onClick={saveOrder}
                    disabled={!isDirty || isSaving}
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-check me-1"></i>
                        Salvar Ordem
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isEditMode ? (
            <DragDropTable
              items={banners}
              onReorder={handleReorder}
              getItemId={(banner) => banner.uuid}
              renderItem={(banner, index) => (
                <SortableBannerRow
                  key={banner.uuid}
                  banner={banner}
                  index={index}
                  onDelete={handleDelete}
                />
              )}
              renderDragOverlay={(banner) => (
                <div
                  className="p-1 d-flex align-items-center"
                  style={{
                    background: '#161d31',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    borderRadius: 4,
                  }}
                >
                  <img
                    src={banner.file}
                    alt=""
                    style={{
                      width: 120,
                      height: 60,
                      objectFit: 'cover',
                      marginRight: 8,
                    }}
                  />
                </div>
              )}
            >
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Ordem</th>
                  <th>Imagem</th>
                  <th>Link</th>
                  <th className="text-center">Ação</th>
                </tr>
              </thead>
              {banners.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Nenhum banner {selectedTypeName.toLowerCase()} encontrado
                  </td>
                </tr>
              )}
            </DragDropTable>
          ) : (
            <div className="row">
              {banners.length === 0 ? (
                <div className="col-12 text-center text-muted py-4">
                  <i
                    className="bx bx-image-alt"
                    style={{ fontSize: 48, opacity: 0.3 }}
                  ></i>
                  <p className="mt-2 mb-0">
                    Nenhum banner {selectedTypeName.toLowerCase()} encontrado
                  </p>
                </div>
              ) : (
                banners.map((banner, index) => (
                  <div key={banner.uuid} className="col-md-4 col-lg-3 mb-3">
                    <div className="card h-100">
                      <div className="position-relative">
                        <img
                          src={banner.file}
                          className="card-img-top"
                          alt=""
                          style={{
                            height: 150,
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                          onClick={() => window.open(banner.url, '_blank')}
                        />
                        <div className="position-absolute top-0 start-0 m-2">
                          <span
                            className="badge"
                            style={{
                              backgroundColor: '#343d55',
                              color: 'white',
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="card-body p-2">
                        <p className="card-text small text-muted mb-0">
                          {banner.url ? (
                            <a
                              href={banner.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              <i className="bx bx-link-external me-1"></i>
                              Ver link
                            </a>
                          ) : (
                            <span>Sem link</span>
                          )}
                        </p>

                        <p className="card-text small text-muted mb-1">
                          Data de adição: {moment(banner?.created_at).format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-2">Gerenciar Banners</h2>
      </div>

      <div className="mb-2">
        {viewImages.length === 0 && (
          <div className="alert alert-info">
            <strong>Informação:</strong> Nenhum banner encontrado. Adicione
            novos banners usando o formulário abaixo.
          </div>
        )}
      </div>

      {/* Tabela de Banners */}
      {renderBannerTable()}

      <Card>
        <CardHeader>
          <h5>Enviar Novos Banners</h5>
        </CardHeader>
        <CardBody>
          <p>Tamanho recomendado: 1410 px x 400 px</p>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>Upload</th>
                <th>Tipo</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {[...uploadFiles, {}].map((_, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBrowse(e, index)}
                      style={{
                        background: '#eee',
                        padding: '10px 12px',
                        borderRadius: 4,
                        color: '#1f1f1f',
                        maxWidth: 250,
                      }}
                    />
                  </td>
                  <td>
                    <TypeSelector
                      selectedType={Number(
                        types[index] || bannerTypeOptions[0].id,
                      )}
                      onTypeChange={(type) => {
                        const updatedTypes = [...types];
                        updatedTypes[index] = type.toString();
                        setTypes(updatedTypes);
                      }}
                      bannerTypeOptions={bannerTypeOptions}
                      showLabel={false}
                      width={120}
                    />
                  </td>
                  <td>
                    <Input
                      type="text"
                      placeholder="Url da oferta"
                      onChange={(e) => handleChange(setLinks)(e, index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Row>
            <Col className="d-flex justify-content-end">
              <Button onClick={sendImages} color="primary">
                Salvar Imagens
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </section>
  );
};

export default CBanner;