// src/server/constants.ts

// return 0 instead of null to avoid `TRPCClientError: Invalid response or stream interrupted`
// ref: https://github.com/trpc/trpc/discussions/5919#discussioncomment-10172462
export const NULL_RESULT_TRPC_INT = 0;
