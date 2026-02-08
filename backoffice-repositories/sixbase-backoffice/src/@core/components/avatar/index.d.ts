import * as React from 'react';

export interface AvatarProps {
  icon?: React.ReactNode;
  src?: string;
  badgeUp?: boolean;
  content?: string;
  badgeText?: string;
  className?: string;
  imgClassName?: string;
  contentStyles?: React.CSSProperties;
  size?: 'sm' | 'lg' | 'xl';
  tag?: React.ComponentType<any> | string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  imgHeight?: string | number;
  imgWidth?: string | number;
  badgeColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'info'
    | 'warning'
    | 'dark'
    | 'light-primary'
    | 'light-secondary'
    | 'light-success'
    | 'light-danger'
    | 'light-info'
    | 'light-warning'
    | 'light-dark';
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'info'
    | 'warning'
    | 'dark'
    | 'light-primary'
    | 'light-secondary'
    | 'light-success'
    | 'light-danger'
    | 'light-info'
    | 'light-warning'
    | 'light-dark';
  initials?: boolean;
  img?: string | false;
  style?: React.CSSProperties;
}

declare const Avatar: React.ForwardRefExoticComponent<
  AvatarProps & React.RefAttributes<HTMLElement>
>;

export default Avatar;
