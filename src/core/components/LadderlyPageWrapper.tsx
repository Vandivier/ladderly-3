import Layout, { LayoutProps } from "../layouts/Layout"

import styles from "src/styles/Home.module.css"

export const LadderlyPageWrapper: React.FC<LayoutProps> = ({ children, title }) => (
  <Layout title={title}>
    <div className={styles.container}>
      {children}

      <footer className={styles.footer}>
        <a
          href="https://discord.gg/fAg6Xa4uxc"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          Discord
        </a>
        <a
          href="https://github.com/Vandivier/ladderly-3#about"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          GitHub
        </a>
        <p>Copyright © 2023 John Vandivier</p>
      </footer>
    </div>
  </Layout>
)
