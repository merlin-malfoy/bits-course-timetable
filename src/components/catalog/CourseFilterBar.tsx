"use client";

import type { CourseCategoryType } from "@/types/course";
import type { CourseCategory } from "@/types/category";

export interface CatalogFilters {
  search: string;
  categoryType: CourseCategoryType | "ALL";
  vibeCategoryId: string | "ALL";
  department: string | "ALL";
}

interface CourseFilterBarProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  categories: CourseCategory[];
  departments: string[];
  showCategoryTypeFilter?: boolean;
}

const CATEGORY_TYPES: (CourseCategoryType | "ALL")[] = ["ALL", "CDC", "DEL", "OPEL", "HUEL", "OTHER_ELECTIVE"];

export function CourseFilterBar({
  filters,
  onChange,
  categories,
  departments,
  showCategoryTypeFilter = true,
}: CourseFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-foreground/10 p-3">
      <input
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search code or title…"
        className="min-w-[10rem] flex-1 rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      />

      {showCategoryTypeFilter && (
        <select
          value={filters.categoryType}
          onChange={(e) => onChange({ ...filters, categoryType: e.target.value as CatalogFilters["categoryType"] })}
          className="rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
        >
          {CATEGORY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "ALL" ? "All requirement types" : type}
            </option>
          ))}
        </select>
      )}

      <select
        value={filters.vibeCategoryId}
        onChange={(e) => onChange({ ...filters, vibeCategoryId: e.target.value })}
        className="rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
      >
        <option value="ALL">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        className="rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
      >
        <option value="ALL">All departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  );
}
