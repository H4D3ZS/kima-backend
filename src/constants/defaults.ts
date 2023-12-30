export const DEFAULTS = {
  // passwords
  salt_rounds: 10,
};

export const USER_TYPES = ["member", "professional", "business"] as const;

export const GENDER = ["male", "female", "others", "do_not_specify"] as const;

export const CLASSIFIED_CATEGORIES = [
  "events",
  "for_sale",
  "job_posting",
  "real_estate",
  "misc",
] as const;

export const EVENT_TYPES = ["paid", "free"] as const;

export const ITEM_CONDITIONS = ["used", "new"] as const;
