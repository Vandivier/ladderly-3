import React from "react"

type MenuContextType = {
  menuContent: React.ReactNode | null
  setMenuContent: (node: React.ReactNode | null) => void
}

export const MenuContext = React.createContext<MenuContextType>({
  menuContent: null,
  setMenuContent: () => {},
})

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuContent, setMenuContent] = React.useState<React.ReactNode | null>(null)

  return (
    <MenuContext.Provider value={{ menuContent, setMenuContent }}>{children}</MenuContext.Provider>
  )
}
