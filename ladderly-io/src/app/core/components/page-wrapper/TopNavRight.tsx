import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import { IconVerticalChevron } from "../icons/VerticalChevron";
import { MenuContext } from "./MenuProvider";
import {
  AccountMenuItems,
  CommunityMenuItems,
  TOP_NAV_STANDARD_CLASSES,
  TopHonorsMenuItems,
} from "./TopNavSubmenu";

const TOP_NAV_RIGHT_SECTION_CLASSES = "ml-auto flex items-center space-x-6";

export const TopNavRight = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserQuery = api.user.getCurrentUser.useQuery();
  const currentUser = currentUserQuery.data;
  const { setMenu, openMenuName } = React.useContext(MenuContext);

  useEffect(() => {
    const refreshCurrentUser = searchParams.get("refresh_current_user");

    if (refreshCurrentUser === "true") {
      // Remove the query parameter and refetch data
      const newQuery = new URLSearchParams(searchParams);
      newQuery.delete("refresh_current_user");
      router.replace(`?${newQuery.toString()}`);

      // Refetch the current user
      currentUserQuery.refetch();
    }
  }, [searchParams, currentUserQuery, router]);

  const handleCommunityClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (openMenuName === "community") {
      setMenu(null, "");
    } else {
      setMenu(<CommunityMenuItems />, "community");
    }
  };

  const handleAccountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (openMenuName === "account") {
      setMenu(null, "");
    } else if (currentUser) {
      setMenu(<AccountMenuItems currentUser={currentUser} />, "account");
    }
  };

  const handleLeaderboardClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (openMenuName === "leaderboard") {
      setMenu(null, "");
    } else {
      setMenu(<TopHonorsMenuItems />, "leaderboard");
    }
  };

  return (
    <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
      <button
        onClick={handleLeaderboardClick}
        className={TOP_NAV_STANDARD_CLASSES}
      >
        Top Honors Leaderboard
        <IconVerticalChevron isPointingUp={openMenuName === "leaderboard"} />
      </button>
      <Link href="/perks" className={TOP_NAV_STANDARD_CLASSES}>
        Perks
      </Link>
      <Link href="/blog" className={TOP_NAV_STANDARD_CLASSES}>
        Blog
      </Link>
      <button
        onClick={handleCommunityClick}
        className={TOP_NAV_STANDARD_CLASSES}
      >
        Community
        <IconVerticalChevron isPointingUp={openMenuName === "community"} />
      </button>
      {currentUser ? (
        <button
          onClick={handleAccountClick}
          className={TOP_NAV_STANDARD_CLASSES}
        >
          Account
          <IconVerticalChevron isPointingUp={openMenuName === "account"} />
        </button>
      ) : (
        <>
          <Link className={TOP_NAV_STANDARD_CLASSES} href="/login">
            Log In
          </Link>
          <Link className={TOP_NAV_STANDARD_CLASSES} href="/signup">
            Create Account
          </Link>
        </>
      )}
    </div>
  );
};

export const TopNavRightSkeleton = () => (
  <div className={TOP_NAV_RIGHT_SECTION_CLASSES}>
    <Link href="/perks" className={TOP_NAV_STANDARD_CLASSES}>
      Perks
    </Link>
    <Link href="/blog" className={TOP_NAV_STANDARD_CLASSES}>
      Blog
    </Link>
  </div>
);
