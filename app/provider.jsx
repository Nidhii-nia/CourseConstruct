"use client";

import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Provider({ children }) {
  const { user, isLoaded } = useUser();
  const [userDetail, setUserDetail] = useState();
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [hasSynced, setHasSynced] = useState(false);

useEffect(() => {
  if (
    isLoaded &&
    user &&
    user?.primaryEmailAddress?.emailAddress &&
    user?.fullName &&
    !hasSynced
  ) {
    CreateNewUser();
    setHasSynced(true);
  }
}, [user, isLoaded, hasSynced]);

  const CreateNewUser = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const name = user?.fullName;

      if (!email || !name) {
        console.warn("User data incomplete, skipping API call");
        return;
      }

      const result = await axios.post("/api/user", {
        name,
        email,
      });

      setUserDetail(result.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SelectedChapterIndexContext.Provider
        value={{ selectedChapterIndex, setSelectedChapterIndex }}
      >
        <div>{children}</div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;