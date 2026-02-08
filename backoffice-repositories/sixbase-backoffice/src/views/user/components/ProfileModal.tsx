import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import { User, Save, X } from 'react-feather';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

interface ProfileModalProps {
  isOpen: boolean;
  onToggle: () => void;
  onProfileUpdated?: () => void;
}

interface ProfileData {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onToggle,
  onProfileUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const data = response.data.data;
      setProfileData(data);
      setFormData({
        full_name: data.full_name,
        email: data.email,
      });
      setErrors({});
    } catch (error) {
      toast.error('Erro ao carregar dados do perfil');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    } else {
      const nameParts = formData.full_name.trim().split(' ');
      if (nameParts.length < 2) {
        newErrors.full_name = 'Nome deve conter nome e sobrenome';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      toast.success('Perfil atualizado com sucesso');
      onToggle();
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onToggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>
        <div className="d-flex gap-2 justify-content-between w-100">
          <User size={20}/>
          Editar Perfil
        </div>
      </ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="full_name">Nome Completo *</Label>
          <Input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            placeholder="Digite seu nome completo"
            invalid={!!errors.full_name}
          />
          {errors.full_name && (
            <Alert color="danger" className="mt-2 py-2">
              {errors.full_name}
            </Alert>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Digite seu email"
            invalid={!!errors.email}
          />
          {errors.email && (
            <Alert color="danger" className="mt-2 py-2">
              {errors.email}
            </Alert>
          )}
        </FormGroup>

        {profileData && (
          <FormGroup>
            <Label>Data de Criação</Label>
            <Input
              type="text"
              value={new Date(profileData.created_at).toLocaleDateString(
                'pt-BR',
              )}
              disabled
              className="bg-light"
            />
          </FormGroup>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" className="d-flex gap-2 justify-content-between" onClick={handleClose} disabled={loading}>
          <X size={16} className="me-1" />
          Cancelar
        </Button>
        <Button color="primary" className="d-flex gap-2 justify-content-between" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <div
                className="spinner-border spinner-border-sm me-1"
                role="status"
              >
                <span className="visually-hidden">Carregando...</span>
              </div>
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} className="me-1" />
              Salvar
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProfileModal;

