"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface University {
  name: string;
  country: string;
  web_pages: string[];
  alpha_two_code: string;
}

const CUSTOM_UNIVERSITIES: University[] = [
  {
    name: "German International University",
    country: "Egypt",
    web_pages: ["https://giu-uni.de/"],
    alpha_two_code: "EG",
  },
];

const fetchUniversities = async (query: string): Promise<University[]> => {
  const response = await fetch(
    `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch universities: ${response.statusText}`);
  }

  const apiResults: University[] = await response.json();

  // Merge custom entries that match the query, deduplicating by name
  const q = query.toLowerCase();
  const customMatches = CUSTOM_UNIVERSITIES.filter((u) =>
    u.name.toLowerCase().includes(q),
  );

  const apiNames = new Set(apiResults.map((u) => u.name.toLowerCase()));
  const deduped = customMatches.filter(
    (u) => !apiNames.has(u.name.toLowerCase()),
  );

  return [...deduped, ...apiResults].slice(0, 10);
};

export function useUniversitySearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ["universities", debouncedQuery],
    queryFn: () => fetchUniversities(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
