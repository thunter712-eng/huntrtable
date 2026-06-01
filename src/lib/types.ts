/**
 * Shared types for YappoZappo.
 */

/** Stable identifier for each conversation category. */
export type CategoryId =
  | "this-or-that"
  | "what-if"
  | "favorites"
  | "family-friends"
  | "faith";

/** Describes one of the colorful category buttons. */
export interface Category {
  id: CategoryId;
  /** Display name shown on the button and card. */
  name: string;
  /** Short flavor line shown under the button label. */
  tagline: string;
  /** Emoji used as the button's playful icon. */
  emoji: string;
  /** Base brand color (hex) used to build the 3D gradient and shadow. */
  color: string;
  /** Lighter shade (hex) used for the glossy top highlight of the button. */
  colorLight: string;
  /** Darker shade (hex) used for the pressed/base of the button. */
  colorDark: string;
}

/** A question that is currently being shown, paired with its category. */
export interface ActiveQuestion {
  category: Category;
  text: string;
}
