export type ExecutionEnvironment = "sandbox" | "development" | "production";

function isIpAddress(hostname: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

export function getExecutionEnvironment(hostname: string): ExecutionEnvironment {
  if (hostname.includes("sandbox")) {
    return "sandbox";
  }

  if (hostname === "localhost" || isIpAddress(hostname)) {
    return "development";
  }

  return "production";
}

function normalizeHostname(hostname: string) {
  return hostname.split(":")[0]?.trim().toLowerCase();
}

export function getDomainInfo(hostname: string) {
  const fullHostname = normalizeHostname(hostname);
  const parts = fullHostname.split(".").filter(Boolean);

  if (parts.length <= 2) {
    return {
      fullHostname,
      rootDomain: fullHostname,
    };
  }

  const rootDomain = parts.slice(-2).join(".");

  return {
    fullHostname,
    rootDomain,
  };
}
