export interface FilterState {
  calendar: Date[];
}

export interface Producer {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  phone: string;
  revenue_total: number;
  achieved_date: string;
  status: 'pending' | 'sent';
  tracking_code?: string;
  tracking_link?: string;
  sent_date?: string;
  milestone: string;
  producer?: {
    id: number;
    uuid: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface Column {
  name: string;
  cell: (row: Producer) => React.ReactNode;
  selector?: (row: Producer) => any;
  sortable?: boolean;
  width?: string;
  center?: boolean;
}

export interface AwardsFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingTotal: number;
  sentTotal: number;
  filter: {
    calendar: Date[];
  };
  onDateChange: (dates: Date[]) => void;
  onQuickRange: (days: number) => void;
  onClearFilter: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export interface AwardsHeaderProps {
  onUploadClick: () => void;
  onCreateClick: () => void;
}

export interface AwardsTabsProps {
  activeTab: string;
  pendingProducers: Producer[];
  sentProducers: Producer[];
  pendingTotal: number;
  sentTotal: number;
  loading: boolean;
  skin: string;
  pendingColumns: Column[];
  sentColumns: Column[];
  onPendingPageChange: (page: number) => void;
  onPendingRowsPerPageChange: (newPerPage: number, page: number) => void;
  onSentPageChange: (page: number) => void;
  onSentRowsPerPageChange: (newPerPage: number, page: number) => void;
}

export interface CreateAwardModalProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMilestone: string;
  createForm: {
    producer_uuid: string;
    producer_email: string;
    tracking_code: string;
    tracking_link: string;
    status: 'pending' | 'sent';
  };
  onFormChange: (field: string, value: string) => void;
  onCreateAward: () => void;
  loading: boolean;
}


export interface EditAwardModalProps {
  isOpen: boolean;
  onToggle: () => void;
  editingProducer: Producer | null;
  editForm: {
    milestone: string;
    achieved_date: string;
    tracking_code: string;
    tracking_link: string;
    status: 'pending' | 'sent';
    sent_date: string;
  };
  onFormChange: (field: string, value: string) => void;
  onUpdateAward: () => void;
  onDeleteAward: () => void;
  onBlockAward?: () => void;
  blocking?: boolean;
  loading: boolean;
  getProducerData: (producer: Producer) => {
    id: number;
    uuid: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

export interface MilestoneNavigationProps {
  milestones: string[];
  selectedMilestone: string;
  onMilestoneChange: (milestone: string) => void;
}

export interface UploadAwardModalProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMilestone: string;
  uploadEmails: string[];
  uploadResults: {
    success: number;
    errors: string[];
  } | null;
  uploadLoading: boolean;
  onFileChange: (file: File) => void;
  onBulkUpload: () => void;
}