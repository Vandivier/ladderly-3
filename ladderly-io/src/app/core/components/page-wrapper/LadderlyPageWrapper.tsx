import Link from "next/link";
import React from "react";

import { TopNav } from "./TopNav";

import styles from "src/styles/Home.module.css";

export const LadderlyPageWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className={styles.container}>
    <TopNav />

    <div className={styles.globe} />

    {children}

    <footer className={styles.footer}>
      <ul className={styles["footer-links"]}>
        <li>
          <Link href="/about" className={styles.textLink}>
            About
          </Link>
        </li>
        <li>
          <Link
            href="https://discord.gg/fAg6Xa4uxc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Discord
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/Vandivier/ladderly-3"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            GitHub
          </Link>
        </li>
        <li>
          <Link href="/privacy-policy" className={styles.textLink}>
            Privacy Policy
          </Link>
        </li>
      </ul>
      <p>
        Copyright © {new Date().getFullYear()}{" "}
        <Link
          href="https://vandivier.github.io/not-johns-linktree/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          John Vandivier
        </Link>
      </p>
    </footer>
  </div>
);
