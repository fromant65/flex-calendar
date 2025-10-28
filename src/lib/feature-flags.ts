import { env } from "~/env";

/**
 * Feature flags configuration
 * Controls visibility of experimental or optional features
 */
export const featureFlags = {
  /**
   * Timeline page feature flag
   */
  timeline: env.NEXT_PUBLIC_FEATURE_TIMELINE === "true",

  /**
   * Stats page feature flag
   */
  stats: env.NEXT_PUBLIC_FEATURE_STATS === "true",
} as const;

export type FeatureFlag = keyof typeof featureFlags;
