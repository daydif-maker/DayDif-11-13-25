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
 * - Defaults to mock mode when unset (for easier local development).
 * - Any unrecognized value falls back to real backend to avoid silent mocks.
 */
export const USE_MOCK_DATA = parseBooleanEnv(process.env.EXPO_PUBLIC_USE_MOCK_DATA, {
  defaultValue: true,
  variableName: 'EXPO_PUBLIC_USE_MOCK_DATA',
  fallbackOnInvalid: false,
});

export { parseBooleanEnv };
