import React from 'react'

type MenuContextType = {
  menuContent: React.ReactNode
  openMenuName: string | null
  setMenu: null | ((menuContent: React.ReactNode, openMenuName: string) => void)
}

export const MenuContext = React.createContext<MenuContextType>({
  menuContent: null,
  openMenuName: null,
  setMenu: null,
})

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [menuContent, setMenuContent] = React.useState<React.ReactNode>(null)
  const [openMenuName, setOpenMenuName] = React.useState<string | null>(null)

  const setMenu = (menuContent: React.ReactNode, openMenuName: string) => {
    setMenuContent(menuContent)
    setOpenMenuName(openMenuName)
  }

  return (
    <MenuContext.Provider value={{ menuContent, openMenuName, setMenu }}>
      {children}
    </MenuContext.Provider>
  )
}
