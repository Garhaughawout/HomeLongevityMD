const defaultAppName = "HomeLongevityMD";
const defaultAppUrl = "http://localhost:3000";

type NodeEnvironment = "development" | "production" | "test";

export type PublicEnvironment = {
  appName: string;
  appUrl: string;
  nodeEnv: NodeEnvironment;
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

const createPublicEnvironment = (): PublicEnvironment => {
  return {
    appName: normalizeAppName(process.env.NEXT_PUBLIC_APP_NAME),
    appUrl: normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL),
    nodeEnv: normalizeNodeEnv(process.env.NODE_ENV),
  };
};

export const env = createPublicEnvironment();

export const isProduction = env.nodeEnv === "production";