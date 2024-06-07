"use client";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import {
  ProfilesContext,
  UserHousingSearchProfile,
} from "@/app/directory/layout";
import { saveUserHousingSearchProfile } from "@/lib/utils/data";
import { getUserSession } from "@/lib/utils/auth";

export default function SearcherProfileForm({
  handleSuccess,
}: {
  handleSuccess: (success: boolean) => void;
}) {
  const context = useContext(ProfilesContext);
  const rawUserProfile = context?.userHousingSearchProfile;
  // rawUserProfile will be undefined if user is creating a new profile, rather than editing an existing one
  const userProfile = rawUserProfile
    ? formSchema.safeParse(preprocessFormData(rawUserProfile))
    : null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // @ts-ignore
    defaultValues: userProfile?.data || {
      link: "",
      contact_phone: "",
      contact_email: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setSubmitted(true);
    const session = await getUserSession();
    if (!session) {
      handleSuccess(false);
      return;
    }

    const saveResult = await saveUserHousingSearchProfile({
      ...data,
      user_id: session.userID,
      link: data.link ?? "",
    });

    if (saveResult) {
      handleSuccess(true);
    }

    handleSuccess(false);
  }
  return (<></>
  );
}
