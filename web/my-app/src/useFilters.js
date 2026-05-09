import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { getUploadOptions } from "./configs.js";

export function useFilters(projects) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    tags: searchParams.getAll("tags"),
    categories: searchParams.getAll("categories"),
    stack: searchParams.getAll("stack"),
    minRating: Number(searchParams.get("minRating")) || 0,
    sortByRating: searchParams.get("sortByRating") === "true",
    dateSort: searchParams.get("dateSort") || null,
  });

  const [search, setSearchState] = useState(searchParams.get("search") || "");

  const [configOptions, setConfigOptions] = useState({
    tags: [],
    categories: [],
    techStacks: [],
  });

  useEffect(() => {
    getUploadOptions().then((data) => {
      if (data && data !== "get-options-fail") {
        setConfigOptions({
          tags: data.tags || [],
          categories: data.categories || [],
          techStacks: data.techStacks || [],
        });
      }
    });
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (filters.tags.length > 0) params.tags = filters.tags;
    if (filters.categories.length > 0) params.categories = filters.categories;
    if (filters.stack.length > 0) params.stack = filters.stack;
    if (filters.minRating > 0) params.minRating = filters.minRating;
    if (filters.sortByRating) params.sortByRating = "true";
    if (filters.dateSort) params.dateSort = filters.dateSort;

    setSearchParams(params, { replace: true });
  }, [filters, search]);

  const setSearch = (val) => setSearchState(val);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const clearAll = () => {
    setFilters({ tags: [], categories: [], stack: [], minRating: 0, sortByRating: false, dateSort: null });
    setSearchState("");
  };

  const clearFilters = () => {
    setFilters({ tags: [], categories: [], stack: [], minRating: 0, sortByRating: false, dateSort: null });
  };

  const hasActiveFilters =
    filters.tags.length > 0 ||
    filters.categories.length > 0 ||
    filters.stack.length > 0 ||
    filters.minRating > 0 ||
    filters.sortByRating ||
    filters.dateSort !== null;

  const isSearchOrFilter = search.trim() !== "" || hasActiveFilters;

  const allStacks = useMemo(() => {
    if (configOptions.techStacks.length > 0) return [...configOptions.techStacks].sort();
    const set = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.stack)) p.stack.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [projects, configOptions.techStacks]);

  const allTags = useMemo(() => {
    if (configOptions.tags.length > 0) return [...configOptions.tags].sort();
    return [...new Set(projects.map((p) => p.tag || (p.tags && p.tags[0]) || "").filter(Boolean))].sort();
  }, [projects, configOptions.tags]);

  const allCategories = useMemo(() => {
    if (configOptions.categories.length > 0) return [...configOptions.categories].sort();
    return [...new Set(projects.map((p) => p.category).filter(Boolean))].sort();
  }, [projects, configOptions.categories]);

  const fuse = useMemo(() => new Fuse(projects, {
      keys: [
    { name: "title",       weight: 0.4  },
    { name: "author",      weight: 0.2  },
    { name: "desc",        weight: 0.15 },
    { name: "description", weight: 0.15 },
    { name: "tags",        weight: 0.1  },
    { name: "tag",         weight: 0.1  },
    { name: "stack",       weight: 0.1  },
    { name: "category",    weight: 0.1  }, 
    ],
    threshold: 0.4,
    includeScore: true,
  }), [projects]);

  const filtered = useMemo(() => {
    let result = [...projects];

    if (search.trim()) {
      const fuseResults = fuse.search(search.trim());
      result = fuseResults.map((r) => r.item);
    }

    if (filters.tags.length > 0) {
      result = result.filter((p) => {
        const tag = p.tag || (p.tags && p.tags[0]) || "";
        return filters.tags.includes(tag);
      });
    }

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    if (filters.stack.length > 0) {
      result = result.filter((p) =>
        Array.isArray(p.stack) && filters.stack.some((s) => p.stack.includes(s))
      );
    }

    if (filters.minRating > 0) {
      result = result.filter((p) => {
        const ratings = p.ratings || [];
        if (ratings.length === 0) return false;
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        return avg >= filters.minRating;
      });
    }

    if (filters.sortByRating) {
      result = [...result].sort((a, b) => {
        const avgA = a.ratings?.length ? a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length : 0;
        const avgB = b.ratings?.length ? b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length : 0;
        return avgB - avgA;
      });
    }

    if (filters.dateSort === "latest") {
      result = [...result].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
    } else if (filters.dateSort === "oldest") {
      result = [...result].sort((a, b) => (parseInt(a.year) || 0) - (parseInt(b.year) || 0));
    }

    return result;
  }, [projects, search, filters, fuse]);

  return {
    search,
    setSearch,
    filters,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    clearAll,
    hasActiveFilters,
    isSearchOrFilter,
    allStacks,
    allTags,
    allCategories,
    filtered,
  };
}