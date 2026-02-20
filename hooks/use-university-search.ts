"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface University {
  name: string;
  country: string;
  web_pages: string[];
  alpha_two_code: string;
}

const fetchUniversities = async (query: string): Promise<University[]> => {
  const response = await fetch(
    `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch universities: ${response.statusText}`);
  }

  const data: University[] = await response.json();
  return data.slice(0, 10);
};

/**
 * Searches universities via the Hipolabs API.
 * Data changes frequently based on user input → React Query with debounced key.
 */
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
    staleTime: 1000 * 60 * 5, // 5 min – results are stable enough to cache
  });
}
