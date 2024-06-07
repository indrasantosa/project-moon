"use client";
import UserProfileImage from "@/components/user-profile-image";
import { useEffect, useState } from "react";
import LoadingSpinner from "./loading-spinner/loading-spinner";

type ReferrerData = {
  name: string | null;
  twitter_handle: string | null;
  twitter_avatar_url: string | null;
};

export default function ReferralBadge({ userID }: { userID: string }) {
  const [referrer, setReferrer] = useState<ReferrerData | null>(null);
  useEffect(() => {
    const fetchReferrer = async () => {
      try {
        const referrerData = {name: "None", twitter_handle: "none", twitter_avatar_url: null};
        if (referrerData) setReferrer(referrerData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReferrer();
  }, [userID]);

  if (referrer) {
    return (
      <a
        href={`https://x.com/${referrer.twitter_handle}`}
        className="flex items-center no-underline"
        target="_blank"
      >
        <span className="mx-1">
          <UserProfileImage size="small" src={referrer.twitter_avatar_url} />
        </span>
        <span className="text-blue-500 hover:text-blue-400">
          {referrer.name}
        </span>
      </a>
    );
  } else {
    return <span className="text-neutral-600">DirectorySF </span>;
  }
}
