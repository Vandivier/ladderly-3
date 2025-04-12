import { LadderlySession } from '~/server/auth'
import { IconVerticalChevron } from '../core/components/icons/VerticalChevron'
import {
  AccountMenuItems,
  MENU_ITEM_STANDARD_CLASSES,
} from '../core/components/page-wrapper/TopNavSubmenu'

export const MOBILE_LINK_CLASSES =
  'block rounded-lg bg-white p-4 py-2 text-lg text-gray-700 shadow hover:text-gray-900'

const MOBILE_SUBMENU_ITEM_CLASSES = `${MENU_ITEM_STANDARD_CLASSES} m-3`

export const MobileAccountDropdown = ({
  toggleAccountSubmenu,
  isSubmenuOpen,
  session,
}: {
  toggleAccountSubmenu: () => void
  isSubmenuOpen: boolean
  session: LadderlySession
}) => (
  <li>
    <button
      className={`${MOBILE_LINK_CLASSES} flex items-center justify-between ${
        isSubmenuOpen && 'border border-gray-200 bg-gray-100'
      }`}
      onClick={toggleAccountSubmenu}
    >
      Account
      <IconVerticalChevron isPointingUp={isSubmenuOpen} />
    </button>

    {isSubmenuOpen && (
      <ul className="flex w-full">
        <AccountMenuItems
          userId={session.user?.id ?? ''}
          linkClassName={MOBILE_SUBMENU_ITEM_CLASSES}
        />
      </ul>
    )}
  </li>
)
