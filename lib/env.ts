const defaultAppName = "HomeLongevityMD";
const defaultAppUrl = "http://localhost:3000";

type NodeEnvironment = "development" | "production" | "test";

export type PublicEnvironment = {
  appName: string;
  appUrl: string;
  nodeEnv: NodeEnvironment;
};

export type SupabaseEnvironment = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

const readOptionalEnvironmentValue = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
};

const readRequiredEnvironmentValue = (
  key: string,
  value: string | undefined
) => {
  const normalizedValue = readOptionalEnvironmentValue(value);

  if (!normalizedValue) {
    throw new Error(`${key} is required to initialize Supabase.`);
  }

  return normalizedValue;
};

const normalizeAppName = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : defaultAppName;
};

const normalizeNodeEnv = (value: string | undefined): NodeEnvironment => {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
};

const normalizeAppUrl = (value: string | undefined) => {
  const candidateUrl = value?.trim() || defaultAppUrl;

  try {
    const normalizedUrl = new URL(candidateUrl);

    return normalizedUrl.toString().replace(/\/$/, "");
  } catch {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be a valid absolute URL, for example http://localhost:3000"
    );
  }
};

const normalizeRequiredUrl = (key: string, value: string | undefined) => {
  const candidateUrl = readRequiredEnvironmentValue(key, value);

  try {
    const normalizedUrl = new URL(candidateUrl);

    return normalizedUrl.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${key} must be a valid absolute URL.`);
  }
};

const createPublicEnvironment = (): PublicEnvironment => {
  return {
    appName: normalizeAppName(process.env.NEXT_PUBLIC_APP_NAME),
    appUrl: normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL),
    nodeEnv: normalizeNodeEnv(process.env.NODE_ENV),
  };
};

export const env = createPublicEnvironment();

export const isProduction = env.nodeEnv === "production";

export const hasSupabaseEnvironment = Boolean(
  readOptionalEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    readOptionalEnvironmentValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

export const getSupabaseEnvironment = (): SupabaseEnvironment => {
  return {
    url: normalizeRequiredUrl(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    anonKey: readRequiredEnvironmentValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    serviceRoleKey: readOptionalEnvironmentValue(
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  };
};