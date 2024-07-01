"use client";

import CardGrid from "@/components/cards/card-grid";
import SearcherProfileCard from "@/components/cards/searcher-profile-card";
import { useSearchStore } from "@/store/searchStore";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Separator } from "@radix-ui/react-separator";
import React, { use, useEffect } from "react";

const Search = () => {
  const searchStore = useSearchStore();
  const [movingTime, setMovingTime] = React.useState("1");

  const searcherProfilesFilter = {
    movingTime: movingTime,
  };

  useEffect(() => {
    searchStore.search(searcherProfilesFilter);
  }, []);

  function onFilterChange(movingTime: string) {
    setMovingTime(movingTime);
    searchStore.search(searcherProfilesFilter);
  }

  return (
    <div>
      {/* Create a plain dropdown with value of "1", "2", "3" */}
      <select value={movingTime} onChange={(e) => onFilterChange(e.target.value)}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="">ANY</option>
      </select>

      <>
        <h2 className="text-2xl font-bold my-4">Today</h2>
        <CardGrid>
          {searchStore.searchResults.map((profile) => (
            <SearcherProfileCard key={profile.user_id} profile={profile} />
          ))}
        </CardGrid>
      </>
    </div>
  );
};

export default Search;
