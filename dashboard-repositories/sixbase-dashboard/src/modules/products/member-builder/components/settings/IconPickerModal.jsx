import React from 'react';
import { Modal } from 'react-bootstrap';

// Lista de ícones direcionados a estatísticas
const FEATHER_ICONS = [
  'Activity', 'Award', 'BarChart', 'BarChart2', 'PieChart', 'LineChart',
  'TrendingUp', 'TrendingDown', 'Target', 'Trophy', 'Medal',
  'Users', 'User', 'UserCheck', 'UserPlus',
  'DollarSign', 'Euro', 'Pound', 'Yen', 'Bitcoin', 'Percent',
  'CheckCircle', 'Check', 'CheckSquare',
  'Clock', 'Calendar',
  'Star', 'Heart', 'ThumbsUp', 'ThumbsDown',
  'Eye', 'Download', 'Upload',
  'ShoppingCart', 'ShoppingBag',
  'Database', 'Zap', 'Globe',
  'Info'
];

// Mapeamento de ícones react-feather para boxicons equivalentes
const getBoxIcon = (featherIconName) => {
  const iconMap = {
    'Activity': 'bx-pulse',
    'Award': 'bx-award',
    'BarChart': 'bx-bar-chart-alt-2',
    'BarChart2': 'bx-bar-chart-square',
    'Book': 'bx-book',
    'BookOpen': 'bx-book-open',
    'Briefcase': 'bx-briefcase',
    'Calendar': 'bx-calendar',
    'CheckCircle': 'bx-check-circle',
    'Clock': 'bx-time-five',
    'Coffee': 'bx-coffee',
    'CreditCard': 'bx-credit-card',
    'DollarSign': 'bx-dollar',
    'Download': 'bx-download',
    'Eye': 'bx-show',
    'Film': 'bx-film',
    'Flag': 'bx-flag',
    'Gift': 'bx-gift',
    'Globe': 'bx-globe',
    'Heart': 'bx-heart',
    'Home': 'bx-home',
    'Image': 'bx-image',
    'Layers': 'bx-layer',
    'Mail': 'bx-envelope',
    'MessageCircle': 'bx-message-rounded',
    'MessageSquare': 'bx-message-square',
    'Package': 'bx-package',
    'Play': 'bx-play',
    'PlayCircle': 'bx-play-circle',
    'Plus': 'bx-plus',
    'PlusCircle': 'bx-plus-circle',
    'Star': 'bx-star',
    'TrendingUp': 'bx-trending-up',
    'TrendingDown': 'bx-trending-down',
    'Users': 'bx-group',
    'User': 'bx-user',
    'UserCheck': 'bx-user-check',
    'UserPlus': 'bx-user-plus',
    'Video': 'bx-video',
    'Zap': 'bx-bolt-circle',
    'Target': 'bx-target-lock',
    'ShoppingCart': 'bx-cart',
    'ShoppingBag': 'bx-shopping-bag',
    'Settings': 'bx-cog',
    'Search': 'bx-search',
    'Save': 'bx-save',
    'Share': 'bx-share',
    'Share2': 'bx-share-alt',
    'Shield': 'bx-shield',
    'Smile': 'bx-happy',
    'ThumbsUp': 'bx-like',
    'ThumbsDown': 'bx-dislike',
    'Trophy': 'bx-trophy',
    'Umbrella': 'bx-cloud-rain',
    'Upload': 'bx-upload',
    'Wifi': 'bx-wifi',
    'X': 'bx-x',
    'XCircle': 'bx-x-circle',
    'AlertCircle': 'bx-error-circle',
    'AlertTriangle': 'bx-error',
    'Check': 'bx-check',
    'ChevronDown': 'bx-chevron-down',
    'ChevronUp': 'bx-chevron-up',
    'ChevronLeft': 'bx-chevron-left',
    'ChevronRight': 'bx-chevron-right',
    'ArrowLeft': 'bx-left-arrow',
    'ArrowRight': 'bx-right-arrow',
    'ArrowUp': 'bx-up-arrow',
    'ArrowDown': 'bx-down-arrow',
    'Edit': 'bx-edit',
    'Edit2': 'bx-edit-alt',
    'Edit3': 'bx-pencil',
    'Trash': 'bx-trash',
    'Trash2': 'bx-trash-alt',
    'Copy': 'bx-copy',
    'File': 'bx-file',
    'FileText': 'bx-file-blank',
    'Folder': 'bx-folder',
    'Lock': 'bx-lock',
    'Unlock': 'bx-lock-open',
    'Key': 'bx-key',
    'Bell': 'bx-bell',
    'BellOff': 'bx-bell-off',
    'Camera': 'bx-camera',
    'Music': 'bx-music',
    'Mic': 'bx-microphone',
    'MicOff': 'bx-microphone-off',
    'Volume': 'bx-volume',
    'Volume1': 'bx-volume-low',
    'Volume2': 'bx-volume-full',
    'VolumeX': 'bx-volume-mute',
    'Headphones': 'bx-headphone',
    'Monitor': 'bx-desktop',
    'Smartphone': 'bx-mobile',
    'Tablet': 'bx-tablet',
    'Laptop': 'bx-laptop',
    'HardDrive': 'bx-hdd',
    'Database': 'bx-data',
    'Server': 'bx-server',
    'Cloud': 'bx-cloud',
    'Sun': 'bx-sun',
    'Moon': 'bx-moon',
    'Map': 'bx-map',
    'MapPin': 'bx-map-pin',
    'Navigation': 'bx-navigation',
    'Compass': 'bx-compass',
    'Building': 'bx-building',
    'Store': 'bx-store',
    'Tag': 'bx-purchase-tag',
    'Tags': 'bx-purchase-tag-alt',
    'Percent': 'bx-math',
    'PieChart': 'bx-pie-chart',
    'LineChart': 'bx-line-chart',
    'Euro': 'bx-euro',
    'Pound': 'bx-pound',
    'Yen': 'bx-yen',
    'Bitcoin': 'bx-bitcoin',
    'Wallet': 'bx-wallet',
    'Receipt': 'bx-receipt',
    'Archive': 'bx-archive',
    'Bookmark': 'bx-bookmark',
    'GraduationCap': 'bx-graduation',
    'Medal': 'bx-medal',
    'Meh': 'bx-meh',
    'Frown': 'bx-sad',
    'Send': 'bx-send',
    'Inbox': 'bx-inbox',
    'Outbox': 'bx-mail-send',
    'Phone': 'bx-phone',
    'PhoneCall': 'bx-phone-call',
    'VideoOff': 'bx-video-off',
    'CameraOff': 'bx-camera-off',
    'Images': 'bx-images',
    'Pause': 'bx-pause',
    'PauseCircle': 'bx-pause-circle',
    'SkipBack': 'bx-skip-previous',
    'SkipForward': 'bx-skip-next',
    'Rewind': 'bx-rewind',
    'FastForward': 'bx-fast-forward',
    'Repeat': 'bx-repeat',
    'Shuffle': 'bx-shuffle',
    'Radio': 'bx-radio',
    'Disc': 'bx-disc',
    'Italic': 'bx-italic',
    'Bold': 'bx-bold',
    'Underline': 'bx-underline',
    'Strikethrough': 'bx-strikethrough',
    'AlignLeft': 'bx-align-left',
    'AlignCenter': 'bx-align-middle',
    'AlignRight': 'bx-align-right',
    'AlignJustify': 'bx-align-justify',
    'List': 'bx-list-ul',
    'Layout': 'bx-layout',
    'Grid': 'bx-grid-alt',
    'Columns': 'bx-columns',
    'Rows': 'bx-rows',
    'Maximize': 'bx-fullscreen',
    'Minimize': 'bx-exit-fullscreen',
    'Move': 'bx-move',
    'RotateCw': 'bx-rotate-right',
    'RotateCcw': 'bx-rotate-left',
    'FlipHorizontal': 'bx-reflect-horizontal',
    'FlipVertical': 'bx-reflect-vertical',
    'Crop': 'bx-crop',
    'Scissors': 'bx-cut',
    'Type': 'bx-font',
    'Link': 'bx-link',
    'Link2': 'bx-link-alt',
    'Unlink': 'bx-unlink',
    'ExternalLink': 'bx-link-external',
    'Code': 'bx-code',
    'Terminal': 'bx-terminal',
    'Command': 'bx-command',
    'Hash': 'bx-hash',
    'AtSign': 'bx-at',
    'Asterisk': 'bx-asterisk',
    'Slash': 'bx-slash',
    'Minus': 'bx-minus',
    'Divide': 'bx-math',
    'Equal': 'bx-equalizer',
    'GreaterThan': 'bx-chevron-right',
    'LessThan': 'bx-chevron-left',
    'ChevronsUp': 'bx-chevrons-up',
    'ChevronsDown': 'bx-chevrons-down',
    'ChevronsLeft': 'bx-chevrons-left',
    'ChevronsRight': 'bx-chevrons-right',
    'ArrowUpRight': 'bx-up-arrow-alt',
    'ArrowDownRight': 'bx-down-arrow-alt',
    'ArrowDownLeft': 'bx-left-arrow-alt',
    'ArrowUpLeft': 'bx-right-arrow-alt',
    'RefreshCw': 'bx-refresh',
    'RefreshCcw': 'bx-reset',
    'ZoomIn': 'bx-zoom-in',
    'ZoomOut': 'bx-zoom-out',
    'CheckSquare': 'bx-checkbox-checked',
    'Info': 'bx-info-circle',
    'HelpCircle': 'bx-help-circle',
    'QuestionMark': 'bx-question-mark',
    'Ban': 'bx-block',
    'StopCircle': 'bx-stop-circle',
  };
  
  return iconMap[featherIconName] || 'bx-image';
};

const IconPickerModal = ({ show, onHide, onSelect, currentIcon }) => {
  const handleIconSelect = (iconName) => {
    onSelect(iconName);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size='lg'
      contentClassName='icon-picker-modal'
    >
      <Modal.Header 
        closeButton
        style={{
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Modal.Title>Selecionar Ícone</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
            gap: '10px',
          }}
        >
          {FEATHER_ICONS.map((iconName) => (
            <div
              key={iconName}
              onClick={() => handleIconSelect(iconName)}
              className={`text-center p-3 border rounded cursor-pointer d-flex align-items-center justify-content-center ${
                currentIcon === iconName ? 'border-primary bg-primary bg-opacity-10' : ''
              }`}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '60px',
              }}
              onMouseEnter={(e) => {
                if (currentIcon !== iconName) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#0f1b35';
                }
              }}
              onMouseLeave={(e) => {
                if (currentIcon !== iconName) {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }
              }}
              title={iconName}
            >
              <i className={`bx ${getBoxIcon(iconName)}`} style={{ fontSize: '28px' }} />
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default IconPickerModal;

