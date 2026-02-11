"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface University {
  name: string;
  country: string;
  web_pages: string[];
  alpha_two_code: string;
}

export function useUniversitySearch() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const searchUniversities = useCallback((query: string) => {
    if (query.length < 2) {
      setUniversities([]);
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);

    // Debounce the API call
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`,
        );
        const data = await response.json();
        setUniversities(data.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Error fetching universities:", error);
        setUniversities([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { universities, isLoading, searchUniversities };
}
