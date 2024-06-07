"use client";
import styles from "./page.module.css";
import Navbar from "../../components/navbar/navbar";
import InviteButton from "../../components/invite-button/invite-button";
import { signout } from "../../lib/utils/auth";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getUserSession } from "../../lib/utils/auth";
import { getUserData, getUserHousingSearchProfile } from "../../lib/utils/data";
import Dropdown from "../../components/dropdown/dropdown";
import Footer from "@/components/footer";
import LoadingSpinner from "@/components/loading-spinner/loading-spinner";
import { useAuthContext } from "@/contexts/auth-context";
import SpacesContextProvider from "@/contexts/spaces-context";

export type ProfilesContextType = {
  searcherProfiles: HousingSearchProfile[] | null;
  setSearcherProfiles: Dispatch<SetStateAction<HousingSearchProfile[]>>;
  searcherProfilesFilter: SearcherProfilesFilterType;
  setSearcherProfilesFilter: Dispatch<
    SetStateAction<SearcherProfilesFilterType>
  >;
  userHousingSearchProfile: UserHousingSearchProfile;
  refreshUserHousingSearchProfileData: (userID: string) => Promise<void>;
};

export type UserHousingSearchProfile =
  | Database["public"]["Tables"]["housing_search_profiles"]["Row"]
  | null;

export const ProfilesContext = createContext<ProfilesContextType | null>(null);

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userHousingSearchProfile, setUserHousingSearchProfile] =
    useState<UserHousingSearchProfile>(null);
  const router = useRouter();
  const [searcherProfiles, setSearcherProfiles] = useState<
    HousingSearchProfile[]
  >([]);
  const [searcherProfilesFilter, setSearcherProfilesFilter] =
    useState<SearcherProfilesFilterType>({});
    

  // const { userData, userSession, authLoading } = useAuthContext();
  const userData = {
    user_id: "c692c83e-5e2f-4bc1-ba8c-2808de92aab0",
    name: "Frontend Lover",
    email: "frontendlover1234@gmail.com",
    contact_email: "frontendlover1234@gmail.com",
    twitterAvatarURL: "/path-to-default-avatar.jpg",
  };

  const userSession = {
    userID: "c692c83e-5e2f-4bc1-ba8c-2808de92aab0",
    accessToken: "mock-access-token",
    twitterAvatarURL: "/path-to-avatar.jpg",
  };
  
  const authLoading = false;
  
  
  useEffect(() => {
    async function handleAuthCheck() {
      if (!authLoading) {
        if (!userSession) {
          router.replace("/");
          return;
        }

        if (!userData) {
          await signout();
          router.replace("/");
          return;
        }

        await refreshUserHousingSearchProfileData(userSession.userID);
      }
    }
    handleAuthCheck();
  }, [authLoading, router, userData, userSession]);

  async function refreshUserHousingSearchProfileData(userID: string) {
    const userSearchProfile = await getUserHousingSearchProfile(userID);
  }

  if (userSession && userData) {
    return (
      // <div className={styles.container}>
      <div className="w-full bg-white bg-grid-blue-300/[0.2] relative flex flex-col items-center justify-center">
        <div className="drop-shadow-xl p-4 sm:p-12 max-w-screen-xl	mx-auto w-full z-10">
          <div>
            <div className={styles.topArea}>
              <div className={styles.directoryInviteSettings}>
                <h1 className="text-3xl font-bold my-4">DirectorySF</h1>
                <div className={styles.inviteSettingsContainer}>
                  <InviteButton />
                  <Dropdown userAvatarURL={userSession.twitterAvatarURL} />
                </div>
              </div>
              <Navbar />
            </div>
            <ProfilesContext.Provider
              value={{
                searcherProfiles,
                setSearcherProfiles,
                searcherProfilesFilter,
                setSearcherProfilesFilter,
                userHousingSearchProfile,
                refreshUserHousingSearchProfileData,
              }}
            >
              <SpacesContextProvider>
                <div className={styles.directoryContainer}>{children}</div>
              </SpacesContextProvider>
            </ProfilesContext.Provider>
          </div>
          <Footer />
        </div>
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
}
