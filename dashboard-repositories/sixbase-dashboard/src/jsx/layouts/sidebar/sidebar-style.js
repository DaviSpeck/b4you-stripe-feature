import styled, { css, keyframes } from 'styled-components';
import logoSidebarClose from '../../../images/logo-horizontal-header-dark-small.svg';
import logoSidebarOpen from '../../../images/logo-horizontal-header-dark.svg';

export const Overlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #0f1b35b3;
  z-index: 10;
  overflow-x: hidden;

  ${({ isMobile, isOpen }) =>
    (!isMobile || !isOpen) &&
    css`
      display: none;
      visibility: hidden;
      z-index: -10;
    `}
`;

export const SidebarWrapper = styled.div`
  position: fixed;
  width: 80px;
  height: 100vh;
  transition: ease-in-out 0.3s;
  background-color: #0f1b35;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow-y: ${({ isOpen }) => (isOpen ? 'auto' : 'hidden')};
  overflow-x: hidden;
  justify-content: flex-start;
  z-index: 10;
  border-radius: 0;

  .sidebarLogo {
    min-width: 40px;
    min-height: 27px;
    background-image: url(${logoSidebarClose});
    background-repeat: no-repeat;
    background-size: cover;
    transition: ease-in-out 0.2s;
  }

  &:hover {
    width: 230px;
    transition: ease-in-out 0.2s;
    align-items: flex-start;

    .sidebarLogo {
      width: 82px;
      height: 27px;
      background-image: url(${logoSidebarOpen});
      background-repeat: no-repeat;
      background-size: cover;
      transition: ease-in-out 0.2s;
    }
  }

  &::-webkit-scrollbar {
    width: 5px;
    margin: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #0f1b35;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #27468a;
    height: 3px;
    border-radius: 5px;
  }

  @media (max-width: 990px) {
    width: 0;
    padding: 0;
    align-items: flex-start;

    .sidebarLogo {
      width: 82px;
      height: 27px;
      background-image: url(${logoSidebarOpen});
      background-repeat: no-repeat;
      background-size: cover;
      transition: ease-in-out 0.2s;
    }

    ${({ isOpen }) =>
      isOpen &&
      css`
        width: 230px;
        padding: 16px 16px 0px 16px;
      `};
  }
`;

export const SidebarItemList = styled.ul`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SidebarItem = styled.li`
  width: auto;
  border: 1px solid #192d57;
  padding: 12px;
  border-radius: 6px;
  transition: ease-in-out 0.2s;
  cursor: pointer;
  justify-content: center;
  display: flex;
  color: #ffffff;
  flex-direction: column;

  ${({ isShowText, isOpen }) => css`
    background-color: ${isOpen ? '#192d57' : 'transparent'};
    .item-wrapper {
      display: flex;
      justify-content: space-between;

      .arrow-container {
        display: ${isShowText ? 'block' : 'none'};
        color: #ffffff;
      }
    }
    .icon-label-container {
      display: flex;
      align-items: center;
      .icon {
        font-size: 24px;
      }
      .label {
        display: ${isShowText ? 'block' : 'none'};
        font-size: 0.75rem;
        font-family: 'inter';
        font-weight: 600;
      }
    }
  `};

  &:hover {
    background-color: #192d57;
    transition: ease-in-out 0.2s;
    .icon-label-container {
      .label {
        color: #5bebd4;
      }
    }
  }

  ${({ isSelected, isOpen }) =>
    isSelected &&
    !isOpen &&
    css`
      background-color: #5bebd4;
      .icon {
        color: #0f1b35;
      }
      .label {
        color: #0f1b35;
      }
      &:hover {
        .icon {
          color: #ffffff;
        }
      }
    `}
`;

const heightGrow = keyframes`
  from {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    display: hidden;
    visibility: hidden;
  }
  to {
    max-height: 700px;
    opacity: 1;
    overflow: hidden;
  }
`;

const heightCollapse = keyframes`
  from {
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
  }
  to {
    display: hidden;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    visibility: hidden;
  }
`;

export const SidebarItemChildrenWrapper = styled.ul`
  background-color: #192d57;
  border-radius: 0px 0px 6px 6px;
  display: none;
  ${({ isShowText, isOpen, isRendering }) => {
    return css`
      display: block;
      visibility: ${!isRendering && isOpen && isShowText
        ? 'visible'
        : 'hidden'};
      animation: ${isRendering ? 'none' : isOpen ? heightGrow : heightCollapse}
        0.3s ease-in-out forwards;
    `;
  }};
`;

export const SidebarItemChildren = styled.li`
  padding: 12px 0px 0px 0px;
  color: white;
  font-size: 0.75rem;
  white-space: nowrap;

  &:hover {
    cursor: pointer;
    color: #5bebd4;
  }
`;
