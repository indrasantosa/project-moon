import { supabase } from "../supabaseClient";
import { RedisClientType } from "redis";
import { getUserSession } from "./auth";
import { getCurrentTimestamp, isValidUUID } from "./general";
import { z } from "zod";

// ----- Users & Profiles -----

export async function getUserData(userID?: string) {
  // Returns all data from public.users for current user, if it exists

  // If userID not passed, attempts to retrieve from session
  userID = userID ?? (await getUserSession())?.userID;
  if (!userID) {
    throw "failed to find userID";
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userID)
    .maybeSingle();

  if (error) {
    console.error(error);
  } else if (data) {
    return data;
  }
}

export async function createUser(
  newUser: Database["public"]["Tables"]["users"]["Insert"]
) {
  const { data, error } = await supabase
    .from("users")
    .upsert(newUser, { onConflict: "user_id" })
    .select();

  if (error) {
    console.error(error);
    throw "error";
  } else {
    console.log(data);
    return data[0];
  }
}

export async function getHousingSearchProfiles(
  startIdx: number = 0,
  count: number = 25,
  filters: SearcherProfilesFilterType = {}
) {
  const { leaseLength, housemateCount, movingTime } = filters;
  let query = supabase
    .from("housing_search_profiles")
    .select(
      `
      *, user:users(name, twitter_handle, twitter_avatar_url)
    `
    )
    .range(startIdx, startIdx + count - 1)
    .order("last_updated_date", { ascending: false });

  if (leaseLength) {
    query = query.eq("pref_housing_type", leaseLength);
  }
  if (housemateCount) {
    query = query.eq("pref_housemate_count", housemateCount);
  }
  if (movingTime) {
    query = query.eq("pref_move_in", movingTime);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function getOrganizerProfiles(
  startIdx: number = 0,
  count: number = 25
) {
  const { data, error } = await supabase
    .from("organizer_profiles")
    .select(
      `
      *, user:users(name, twitter_handle, twitter_avatar_url)
    `
    )
    .range(startIdx, startIdx + count);
  // .eq("housing_search_profiles.user_id", "follow_intersections.user_id_1");

  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function getCommunities(start: number = 0, count: number = 10) {
  const { data, error } = await supabase
    .from("communities")
    .select(
      `
      *, user:users(name, twitter_handle, twitter_avatar_url)
    `
    )
    .order("last_updated_date", { ascending: false })
    .range(start, start + count - 1);
  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function getSpaceDetails(spaceSlug: string) {
  if (isValidUUID(spaceSlug)) {
    // if valid UUID, using default slug
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("space_slug", spaceSlug)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      return data;
    }
  } else {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .eq("custom_space_slug", spaceSlug)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else {
      return data;
    }
  }
}

export async function getUserHousingSearchProfile(userID: string) {
  const { data, error } = await supabase
    .from("housing_search_profiles")
    .select("*")
    .eq("user_id", userID)
    .maybeSingle();

  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function saveUserHousingSearchProfile(profileData: {
  link: string;
  pref_housemate_count: string;
  pref_housemate_details: string;
  pref_housing_type: string;
  pref_move_in: string;
  user_id: string;
}) {
  const dbSchema = z.object({
    pref_housemate_details: z.coerce.string(),
    pref_housing_type: z.coerce.number(),
    pref_move_in: z.coerce.number(),
    pref_housemate_count: z.coerce.number(),
    link: z.coerce.string(),
    user_id: z.coerce.string().uuid(),
    last_updated_date: z.coerce.string(),
    contact_phone: z.coerce.string(),
    contact_email: z.coerce.string(),
  });

  const { data, error } = await supabase
    .from("housing_search_profiles")
    .upsert(
      dbSchema.parse({
        ...profileData,
        last_updated_date: getCurrentTimestamp(),
      })
    )
    .select();

  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function confirmHousingSearchProfileActive(user_id: string) {
  return await supabase
    .from("housing_search_profiles")
    .upsert({ user_id, last_updated_date: getCurrentTimestamp() })
    .select();
}

export async function deleteUserHousingSearchProfile(userID: string) {
  const { error } = await supabase
    .from("housing_search_profiles")
    .delete()
    .eq("user_id", userID);

  if (error) {
    console.error(error);
    return { status: "error" };
  } else {
    return { status: "success" };
  }
}

export async function getUserSpaceListing(userID: string) {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("user_id", userID)
    .maybeSingle();

  if (error) {
    console.error(error);
  } else {
    return data;
  }
}

export async function confirmSpaceListingActive(user_id: string) {
  return await supabase
    .from("communities")
    .update({ last_updated_date: getCurrentTimestamp() })
    .eq("user_id", user_id);
}

export async function saveUserSpaceListing(
  spaceListingData: Partial<SpaceListingType>,
  userID: string
) {
  const existingSpaceData = await getUserSpaceListing(userID);
  if (existingSpaceData) {
    const { error } = await supabase
      .from("communities")
      .update({ ...spaceListingData, last_updated_date: getCurrentTimestamp() })
      .eq("user_id", userID);
    if (error) {
      return { success: false, message: error };
    }
  } else {
    const { error } = await supabase.from("communities").insert({
      ...spaceListingData,
      user_id: userID,
      last_updated_date: getCurrentTimestamp(),
    });
    if (error) {
      return { success: false, message: error };
    }
  }
  return { success: true };
}

export async function deleteSpaceListing(userID: string) {
  const { error } = await supabase
    .from("communities")
    .delete()
    .eq("user_id", userID);

  if (error) {
    console.error(error);
    return { success: false, error };
  } else {
    return { success: true };
  }
}

export const saveCommunityImage = async (image: File, userID: string) => {
  const { data, error } = await supabase.storage
    .from("community_profile_pictures")
    .upload(`${userID}/space.png`, image, {
      upsert: true,
    });

  if (data) {
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("community_profile_pictures")
      .getPublicUrl(data.path);
    return { success: true, publicURL: publicUrl };
  } else {
    return { success: false, error };
  }
};

export const deleteCommunityImage = async (userID: string) => {
  const { data, error } = await supabase.storage
    .from("community_profile_pictures")
    .remove([`${userID}/space.png`]);

  if (data) {
    return { status: "success", data };
  } else {
    return { status: "error", error };
  }
};
