import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import IconPickerModal from './IconPickerModal';

// Mapeamento de ícones react-feather para boxicons equivalentes
const getBoxIcon = (featherIconName) => {
  if (!featherIconName) return 'bx-image';
  
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

const StatsSettings = ({ config, onChange }) => {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleAddItem = () => {
    const newItems = [
      ...(config.items || []),
      { id: Date.now(), value: '', label: '', icon: 'BarChart' },
    ];
    onChange('items', newItems);
  };

  const handleRemoveItem = (id) => {
    const newItems = config.items.filter((item) => item.id !== id);
    onChange('items', newItems);
  };

  const handleUpdateItem = (id, field, value) => {
    const newItems = config.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange('items', newItems);
  };

  const handleOpenIconPicker = (itemId) => {
    setSelectedItemId(itemId);
    setIconPickerOpen(true);
  };

  const handleIconSelect = (iconName) => {
    if (selectedItemId) {
      handleUpdateItem(selectedItemId, 'icon', iconName);
    }
    setIconPickerOpen(false);
    setSelectedItemId(null);
  };

  const selectedItem = config.items?.find(item => item.id === selectedItemId);

  return (
    <div className='block-settings'>
      <Form.Group className='mb-3'>
        <Form.Label>Colunas</Form.Label>
        <Form.Control
          as='select'
          value={config.columns}
          onChange={(e) => onChange('columns', parseInt(e.target.value))}
        >
          <option value='2'>2 colunas</option>
          <option value='3'>3 colunas</option>
          <option value='4'>4 colunas</option>
        </Form.Control>
      </Form.Group>

      <div className='mb-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Label className='mb-0'>Estatísticas</Form.Label>
          <Button size='sm' variant='primary' onClick={handleAddItem}>
            <i className='bx bx-plus me-1' />
            Adicionar
          </Button>
        </div>

        {config.items?.length > 0 ? (
          <div className='stats-items'>
            {config.items.map((item, index) => (
              <Card key={item.id} className='mb-2'>
                <Card.Body className='p-2'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <small className='text-muted'>Estatística {index + 1}</small>
                    <Button
                      size='sm'
                      variant='link'
                      className='text-danger p-0'
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className='bx bx-trash' />
                    </Button>
                  </div>
                  <Form.Control
                    size='sm'
                    type='text'
                    placeholder='Valor (Ex: 1000+)'
                    value={item.value}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'value', e.target.value)
                    }
                    className='mb-2'
                  />
                  <Form.Control
                    size='sm'
                    type='text'
                    placeholder='Label (Ex: Alunos satisfeitos)'
                    value={item.label}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'label', e.target.value)
                    }
                    className='mb-2'
                  />
                  <Button
                    size='sm'
                    variant='outline-secondary'
                    className='w-100'
                    onClick={() => handleOpenIconPicker(item.id)}
                  >
                    <i className={`bx ${getBoxIcon(item.icon)} me-2`} />
                    {item.icon || 'Selecionar Ícone'}
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted py-3 border rounded'>
            <small>Nenhuma estatística adicionada</small>
          </div>
        )}
      </div>

      <IconPickerModal
        show={iconPickerOpen}
        onHide={() => {
          setIconPickerOpen(false);
          setSelectedItemId(null);
        }}
        onSelect={handleIconSelect}
        currentIcon={selectedItem?.icon}
      />
    </div>
  );
};

export default StatsSettings;

