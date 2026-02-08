// ** Vertical Menu Components
import VerticalNavMenuLink from './VerticalNavMenuLink';
import VerticalNavMenuGroup from './VerticalNavMenuGroup';
import VerticalNavMenuSectionHeader from './VerticalNavMenuSectionHeader';
import { AbilityContext } from '@src/utility/context/Can';

// ** Utils
import {
  // canViewMenuItem,
  // canViewMenuGroup,
  resolveVerticalNavMenuItemComponent as resolveNavItemComponent,
} from '@layouts/utils';
import { useContext } from 'react';

const VerticalMenuNavItems = (props) => {
  // ** Components Object
  const Components = {
    VerticalNavMenuLink,
    VerticalNavMenuGroup,
    VerticalNavMenuSectionHeader,
  };
  const ability = useContext(AbilityContext);

  // ** Render Nav Menu Items
  const RenderNavItems = props.items.map((item) => {
    const TagName = Components[resolveNavItemComponent(item)];

    // Check if user has permission for this menu item
    if (item.action && item.resource) {
      if (ability.can(item.action, item.resource)) {
        return <TagName key={item.id || item.header} item={item} {...props} />;
      }
      return null;
    }

    if (item.access === 'manage') {
      if (ability.can('manage')) {
        return <TagName key={item.id || item.header} item={item} {...props} />;
      }
      return null;
    }

    // Show items without permission checks
    return <TagName key={item.id || item.header} item={item} {...props} />;
  });
  return RenderNavItems;
};

export default VerticalMenuNavItems;
