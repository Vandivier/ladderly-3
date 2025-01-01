import Link from "next/link";
import React from "react";

import { LadderlyAnalytics } from "../LadderlyAnalytics";
import { TopNav } from "./TopNav";

import styles from "src/styles/Home.module.css";

export const LadderlyPageWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <div className={styles.container}>
    <LadderlyAnalytics />
    <TopNav />

    <div className={styles.globe} />

    {children}

    <footer className={styles.footer}>
      <ul className={styles["footer-links"]}>
        <li>
          <Link href="/about" className="text-link-fancy">
            About
          </Link>
        </li>
        <li>
          <Link
            href="https://discord.gg/fAg6Xa4uxc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-fancy"
          >
            Discord
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/Vandivier/ladderly-3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-fancy"
          >
            GitHub
          </Link>
        </li>
        <li>
          <Link href="/privacy-policy" className="text-link-fancy">
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
          className="text-link-fancy"
        >
          John Vandivier
        </Link>
      </p>
    </footer>
  </div>
);
