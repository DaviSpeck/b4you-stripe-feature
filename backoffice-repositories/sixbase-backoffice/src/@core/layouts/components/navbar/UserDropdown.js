// ** React Imports
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Utils
import { isUserLoggedIn } from "@utils";

import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "@store/authentication";

// ** Third Party Components
import {
  User,
  Mail,
  CheckSquare,
  MessageSquare,
  Settings,
  CreditCard,
  HelpCircle,
  Power,
  Lock,
} from "react-feather";

// ** Reactstrap Imports
import {
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
} from "reactstrap";

// ** Default Avatar Image
import defaultAvatar from "@src/assets/images/portrait/small/avatar-s-11.jpg";
import { capitalizeName } from "utility/Utils";

// ** Profile Components
import ProfileModal from '../../../../views/user/components/ProfileModal';
import ChangePasswordModal from '../../../../views/user/components/ChangePasswordModal';

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch();
  const storeUserData = useSelector((state) => state.auth);
  // ** State
  const [userData, setUserData] = useState(null);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem("userData")));
    }
  }, []);

  const handleProfileUpdated = () => {
    // Recarregar dados do usuário após atualização do perfil
    if (isUserLoggedIn() !== null) {
      setUserData(JSON.parse(localStorage.getItem("userData")));
    }
  };

  //** Vars
  const userAvatar = (userData && userData.avatar) || defaultAvatar;

  return (
    <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
      <DropdownToggle
        href="/"
        tag="a"
        className="nav-link dropdown-user-link"
        onClick={(e) => e.preventDefault()}
      >
        <div className="user-nav d-sm-flex d-none">
          <span className="user-name fw-bold">
            {(storeUserData && storeUserData.userData["name"]) || "John Doe"}
          </span>
          <span className="user-status">
            {capitalizeName(userData?.role || "Admin")}
          </span>
        </div>
        <Avatar img={userAvatar} imgHeight="40" imgWidth="40" status="online" />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem
          onClick={() => setProfileModal(true)}
          style={{ cursor: 'pointer' }}
          className="d-flex gap-2 justify-content-between w-100"
        >
          <User size={14} className="me-75" />
          <span className="align-middle">Perfil</span>
        </DropdownItem>
        <DropdownItem
          onClick={() => setPasswordModal(true)}
          style={{ cursor: 'pointer' }}
          className="d-flex gap-2 justify-content-between w-100"
        >
          <Lock size={14} className="me-75" />
          <span className="align-middle">Alterar Senha</span>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem
          onClick={() => dispatch(handleLogout())}
          style={{ cursor: 'pointer' }}
          className="d-flex gap-2 justify-content-between w-100"
        >
          <Power size={14} className="me-75" />
          <span className="align-middle">Sair</span>
        </DropdownItem>
      </DropdownMenu>

      {/* Modais de Gerenciamento de Conta */}
      <ProfileModal
        isOpen={profileModal}
        onToggle={() => setProfileModal(false)}
        onProfileUpdated={handleProfileUpdated}
      />
      <ChangePasswordModal
        isOpen={passwordModal}
        onToggle={() => setPasswordModal(false)}
      />
    </UncontrolledDropdown>
  );
};

export default UserDropdown;
