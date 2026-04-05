import { useState, useMemo } from "react";

export function useFilters(projects) {
  const [filters, setFilters] = useState({
    tags: [],
    categories: [],
    stack: [],
    minRating: 0,
    sortByRating: false,
    dateSort: null, // "latest" | "oldest"
  });

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

  // All unique tech stacks used at least once
  const allStacks = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.stack)) p.stack.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    let result = [...projects];

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
      result = result.sort((a, b) => {
        const avgA = a.ratings?.length ? a.ratings.reduce((x, y) => x + y, 0) / a.ratings.length : 0;
        const avgB = b.ratings?.length ? b.ratings.reduce((x, y) => x + y, 0) / b.ratings.length : 0;
        return avgB - avgA;
      });
    }

    if (filters.dateSort === "latest") {
      result = result.sort((a, b) => {
        const ya = parseInt(a.year) || 0;
        const yb = parseInt(b.year) || 0;
        return yb - ya;
      });
    } else if (filters.dateSort === "oldest") {
      result = result.sort((a, b) => {
        const ya = parseInt(a.year) || 0;
        const yb = parseInt(b.year) || 0;
        return ya - yb;
      });
    }

    return result;
  }, [projects, filters]);

  return { filters, updateFilter, toggleArrayFilter, clearFilters, hasActiveFilters, allStacks, filtered };
}
