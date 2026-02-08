import { useEffect, useState, FC } from 'react';
import { Button, Col, Input, Row, Table } from 'reactstrap';
import { api } from '../../services/api';
import { CBannerProps, BannerImage, UploadData } from '../../interfaces/market.interface';

const HomeBanner: FC<CBannerProps> = ({
  apiEndpoint = 'market/images/banner',
  bannerTypeOptions = [
    { id: 1, name: 'Desktop' },
    { id: 2, name: 'Mobile' },
  ],
}) => {
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [viewImages, setViewImages] = useState<BannerImage[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  const handleChangeType = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ): void => {
    setTypes((prev) => {
      const updated = [...prev];
      updated[index] = e.target.value;
      return updated;
    });
  };

  const handleChangeLink = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    setLinks((prev) => {
      const updated = [...prev];
      updated[index] = e.target.value;
      return updated;
    });
  };

  const handleBrowse = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      if (uploadFiles[index]) {
        setUploadFiles((prev) => {
          const updated = [...prev];
          updated[index] = selectedFiles[0];
          return updated;
        });
      } else {
        setUploadFiles((prev) => [...prev, selectedFiles[0]]);
      }
    }
  };

  const sendImages = async (): Promise<void> => {
    if (uploadFiles.length > 0) {
      const uploadLinks: UploadData[] = [];
      for await (const file of uploadFiles) {
        const response = await api.get<UploadData>(
          `market/banners/${file.name}`,
        );
        uploadLinks.push(response.data);
      }
      for await (const [index, data] of uploadLinks.entries()) {
        try {
          await fetch(data.url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            body: uploadFiles[index],
          });
          await api.post(`market/banners`, {
            key: data.key,
            url: links[index] || '',
            id_type: types[index] || '1',
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
    fetchData();
  };

  const fetchData = (): void => {
    api
      .get<BannerImage[]>(apiEndpoint)
      .then((r) => setViewImages(r.data))
      .catch((err) => console.log(err));
  };

  const handleDelete = (item: BannerImage): void => {
    api
      .delete(`market/banners/${item.uuid}`)
      .then(() =>
        setViewImages((prev) =>
          prev.filter((element) => element.uuid !== item.uuid),
        ),
      )
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section id="pageHomeLogs">
      <div>
        <h3 className="mb-1">Visualizar imagens</h3>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Upload</th>
              <th>Tipo</th>
              <th>Link</th>
              <th className="text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {viewImages.map((item, index) => (
              <tr key={item.uuid}>
                <th scope="row">{index + 1}</th>
                <th>
                  <img src={item.file} alt="" style={{ maxWidth: 420 }} />
                </th>
                <th>{item.type.name}</th>
                <th>{item.url}</th>
                <th className="text-center">
                  <Button
                    color="danger"
                    onClick={() => handleDelete(item)}
                    className="p-1"
                  >
                    <i className="bx bx-trash-alt" style={{ fontSize: 21 }}></i>
                  </Button>
                </th>
              </tr>
            ))}
          </tbody>
        </Table>
        <h3 className="mt-2 mb-1">Enviar novas imagens</h3>
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
            {Array.apply(null, { length: uploadFiles.length + 1 } as any).map(
              (item: any, index: number) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={(e) => handleBrowse(e, index)}
                      multiple={false}
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
                    <select
                      name="type"
                      onChange={(e) => handleChangeType(e, index)}
                    >
                      {bannerTypeOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Input
                      type="text"
                      name="url"
                      placeholder="Url da oferta"
                      onChange={(e) => handleChangeLink(e, index)}
                    />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </Table>

        <Row>
          <Col className="d-flex justify-content-end">
            <Button onClick={sendImages} color="primary">
              Salvar Imagens
            </Button>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeBanner;
