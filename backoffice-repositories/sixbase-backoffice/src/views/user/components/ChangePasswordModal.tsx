import React, { useState } from 'react';
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
  Progress,
} from 'reactstrap';
import { Lock, Save, X, Eye, EyeOff } from 'react-feather';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onToggle,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[@$!%*?&#^+=\-_~`|\\/:;"'<>.,()[\]{}]/.test(password),
    };

    return {
      isValid: Object.values(checks).every(Boolean),
      checks,
    };
  };

  const getPasswordStrength = (password: string) => {
    const { checks } = validatePassword(password);
    const score = Object.values(checks).filter(Boolean).length;
    return (score / 5) * 100;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Senha atual é obrigatória';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Nova senha é obrigatória';
    } else {
      const passwordValidation = validatePassword(formData.new_password);
      if (!passwordValidation.isValid) {
        newErrors.new_password = 'Senha não atende aos critérios de segurança';
      }
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirmação de senha é obrigatória';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.put('/auth/password', formData);
      toast.success('Senha alterada com sucesso');
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao alterar senha';
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
    setFormData({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onToggle();
  };

  const passwordStrength = getPasswordStrength(formData.new_password);
  const passwordValidation = validatePassword(formData.new_password);

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>
        <div className="d-flex gap-2 justify-content-between w-100">
          <Lock size={20} />
          Alterar Senha
        </div>
      </ModalHeader>
      <ModalBody>
        <form autoComplete="off">
          <FormGroup>
            <Label for="current_password">Senha Atual *</Label>
            <div className="position-relative">
              <Input
                id="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) =>
                  handleInputChange('current_password', e.target.value)
                }
                placeholder="Digite sua senha atual"
                invalid={!!errors.current_password}
                autoComplete="current-password"
                name="current_password"
              />
              <Button
                type="button"
                color="link"
                className="position-absolute end-0 top-50 translate-middle-y me-2 p-0"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </Button>
            </div>
            {errors.current_password && (
              <Alert color="danger" className="mt-2 py-2">
                {errors.current_password}
              </Alert>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="new_password">Nova Senha *</Label>
            <div className="position-relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) =>
                  handleInputChange('new_password', e.target.value)
                }
                placeholder="Digite sua nova senha"
                invalid={!!errors.new_password}
                autoComplete="new-password"
                name="new_password"
              />
              <Button
                type="button"
                color="link"
                className="position-absolute end-0 top-50 translate-middle-y me-2 p-0"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            {formData.new_password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between mb-1">
                  <small>Força da senha:</small>
                  <small>{Math.round(passwordStrength)}%</small>
                </div>
                <Progress
                  value={passwordStrength}
                  color={
                    passwordStrength < 60
                      ? 'danger'
                      : passwordStrength < 80
                      ? 'warning'
                      : 'success'
                  }
                />
              </div>
            )}

            {formData.new_password && (
              <div className="mt-2">
                <small className="text-muted">Critérios de segurança:</small>
                <ul className="list-unstyled mt-1">
                  <li
                    className={
                      passwordValidation.checks.length
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    <small>✓ Pelo menos 8 caracteres</small>
                  </li>
                  <li
                    className={
                      passwordValidation.checks.lowercase
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    <small>✓ Letra minúscula</small>
                  </li>
                  <li
                    className={
                      passwordValidation.checks.uppercase
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    <small>✓ Letra maiúscula</small>
                  </li>
                  <li
                    className={
                      passwordValidation.checks.number
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    <small>✓ Número</small>
                  </li>
                  <li
                    className={
                      passwordValidation.checks.symbol
                        ? 'text-success'
                        : 'text-muted'
                    }
                  >
                    <small>
                      ✓ Símbolo especial
                      (@$!%*?&#^+=\-_~`|\\/:;&quot;&apos;&lt;&gt;.,()[\]{})
                    </small>
                  </li>
                </ul>
              </div>
            )}

            {errors.new_password && (
              <Alert color="danger" className="mt-2 py-2">
                {errors.new_password}
              </Alert>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="confirm_password">Confirmar Nova Senha *</Label>
            <div className="position-relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) =>
                  handleInputChange('confirm_password', e.target.value)
                }
                placeholder="Digite novamente sua nova senha"
                invalid={!!errors.confirm_password}
                autoComplete="new-password"
                name="confirm_password"
              />
              <Button
                type="button"
                color="link"
                className="position-absolute end-0 top-50 translate-middle-y me-2 p-0"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </Button>
            </div>
            {errors.confirm_password && (
              <Alert color="danger" className="mt-2 py-2">
                {errors.confirm_password}
              </Alert>
            )}
          </FormGroup>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          className="d-flex gap-2 justify-content-between"
          onClick={handleClose}
          disabled={loading}
        >
          <X size={16} className="me-1" />
          Cancelar
        </Button>
        <Button
          color="primary"
          className="d-flex gap-2 justify-content-between"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <div
                className="spinner-border spinner-border-sm me-1"
                role="status"
              >
                <span className="visually-hidden">Carregando...</span>
              </div>
              Alterando...
            </>
          ) : (
            <>
              <Save size={16} className="me-1" />
              Alterar Senha
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChangePasswordModal;
