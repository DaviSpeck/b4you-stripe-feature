import { ReactNode } from "react";

export interface KanbanColumnCardProps {
  title: string;
  icon?: ReactNode;
  badgeColorClass?: string;
  count?: number;
  loadingCount?: boolean;
  description?: string;
  children: ReactNode;
}