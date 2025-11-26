const TRUE_VALUES = ['true', '1', 'yes', 'on'];
const FALSE_VALUES = ['false', '0', 'no', 'off'];

type BooleanEnvOptions = {
  defaultValue?: boolean;
  variableName?: string;
  fallbackOnInvalid?: boolean;
};

const parseBooleanEnv = (
  value: string | undefined,
  {
    defaultValue = false,
    variableName = 'BOOLEAN_ENV',
    fallbackOnInvalid,
  }: BooleanEnvOptions = {}
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.includes(normalized)) return true;
  if (FALSE_VALUES.includes(normalized)) return false;

  console.warn(
    `${variableName} has unexpected value "${value}". ` +
      `Expected one of ${[...TRUE_VALUES, ...FALSE_VALUES].join(', ')}. ` +
      `Defaulting to ${(fallbackOnInvalid ?? defaultValue) ? 'true' : 'false'}.`
  );

  // For safety, allow callers to force a specific fallback on invalid values
  if (fallbackOnInvalid !== undefined) {
    return fallbackOnInvalid;
  }

  return defaultValue;
};

/**
 * Shared flag for determining whether the app should use mock data.
 * - Defaults to false so the app uses the real backend by default.
 * - Set to true explicitly to use mock data for offline development.
 */
export const USE_MOCK_DATA = parseBooleanEnv(process.env.EXPO_PUBLIC_USE_MOCK_DATA, {
  defaultValue: false,
  variableName: 'EXPO_PUBLIC_USE_MOCK_DATA',
  fallbackOnInvalid: false,
});

/**
 * Auth bypass flag - when enabled, skips authentication requirements
 * and uses an anonymous user ID for backend operations.
 * - Defaults to true for easier local development without auth setup.
 * - Set to false in production to require real authentication.
 */
export const AUTH_BYPASS_ENABLED = parseBooleanEnv(process.env.EXPO_PUBLIC_AUTH_BYPASS, {
  defaultValue: true,
  variableName: 'EXPO_PUBLIC_AUTH_BYPASS',
  fallbackOnInvalid: false,
});

/**
 * Anonymous user ID used when auth bypass is enabled.
 * This provides a consistent user ID for database operations
 * when running without authentication.
 * Note: Cannot use nil UUID (all zeros) as Supabase Auth rejects it.
 */
export const ANONYMOUS_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

export { parseBooleanEnv };
