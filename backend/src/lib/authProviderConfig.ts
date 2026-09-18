import type { AuthProviderAvailability } from "@mike/contracts";
import { ssoEnabled } from "./ssoConfig";

export function emailPasswordAuthOnly(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return /^(?:1|true|yes)$/i.test(
    env.EMAIL_PASSWORD_AUTH_ONLY?.trim() ?? "",
  );
}

export function googleAuthEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return !/^(?:0|false|no)$/i.test(
    env.GOTRUE_EXTERNAL_GOOGLE_ENABLED?.trim() ?? "",
  );
}

export function authProviderAvailability(
  env: NodeJS.ProcessEnv = process.env,
): AuthProviderAvailability {
  const passwordOnly = emailPasswordAuthOnly(env);
  return {
    emailPassword: true,
    google: !passwordOnly && googleAuthEnabled(env),
    sso: !passwordOnly && ssoEnabled(env),
  };
}
