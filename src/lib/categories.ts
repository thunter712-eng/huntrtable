import type { Category, CategoryId } from "./types";

import thisOrThat from "@/data/this-or-that.json";
import whatIf from "@/data/what-if.json";
import favorites from "@/data/favorites.json";
import familyFriends from "@/data/family-friends.json";
import faith from "@/data/faith.json";

/**
 * The five conversation categories, in display order.
 * Colors follow the brief: blue, purple, green, orange, red.
 */
export const CATEGORIES: Category[] = [
  {
    id: "this-or-that",
    name: "This or That",
    tagline: "Quick choices",
    emoji: "🔀",
    color: "#3b82f6",
    colorLight: "#7cb3ff",
    colorDark: "#1d4ed8",
  },
  {
    id: "what-if",
    name: "What If?",
    tagline: "Big imagination",
    emoji: "💭",
    color: "#8b5cf6",
    colorLight: "#b79bff",
    colorDark: "#6d28d9",
  },
  {
    id: "favorites",
    name: "Favorites",
    tagline: "Things you love",
    emoji: "⭐",
    color: "#22c55e",
    colorLight: "#6ee79e",
    colorDark: "#15803d",
  },
  {
    id: "family-friends",
    name: "Family & Friends",
    tagline: "People who matter",
    emoji: "🤝",
    color: "#f97316",
    colorLight: "#ffb066",
    colorDark: "#c2410c",
  },
  {
    id: "faith",
    name: "Faith",
    tagline: "Heart & spirit",
    emoji: "🙏",
    color: "#ef4444",
    colorLight: "#ff8a8a",
    colorDark: "#b91c1c",
  },
];

/** Look up a category by its id. */
export function getCategory(id: CategoryId): Category {
  const found = CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown category: ${id}`);
  return found;
}

/** All questions, keyed by category id. Loaded from the JSON data files. */
export const QUESTIONS: Record<CategoryId, string[]> = {
  "this-or-that": thisOrThat,
  "what-if": whatIf,
  favorites: favorites,
  "family-friends": familyFriends,
  faith: faith,
};
