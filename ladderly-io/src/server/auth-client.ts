import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./better-auth";

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL!,
    plugins: [
        inferAdditionalFields<typeof auth>()
    ]
});

export const { signIn, signOut, useSession } = authClient;