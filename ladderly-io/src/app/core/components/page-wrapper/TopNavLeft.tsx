import Link from "next/link";
import { IconHome } from "../icons/Home";
import { ThemeToggle } from "~/app/core/theme/ThemeToggle";

export const TopNavLeft = () => (
  <>
    <Link href="/" className="rounded-lg bg-white p-2" aria-label="Home">
      <IconHome />
    </Link>
    <ThemeToggle />
  </>
);
