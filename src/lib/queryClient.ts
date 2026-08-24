import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute in milliseconds,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


/*
 * 
 * You create one QueryClient instance and export it, so it can be used app-wide via <QueryClientProvider client={queryClient}> at the root of your app. defaultOptions.queries sets the baseline config for every useQuery call, so you don't have to repeat these options on each one individually.
 * 
 * > staleTime: 1000 * 60, // 1 minute, in milliseconds
 * 
 *     This controls how long cached data is considered "fresh" before React Query will refetch it in the background.
 * 
 *         - Within that 1 minute, if a component re-mounts or you navigate back to a page using the same query, React Query serves the cached data instantly — no network request.
 *         - After 1 minute, the data is marked "stale" — it's still shown immediately from cache (no loading spinner), but React Query will silently refetch in the background next time that query is used, to bring it up to date.
 * 
 *     Default in React Query (if you don't set this) is 0 — meaning data is stale immediately, so it refetches constantly. Setting it to 1 minute reduces unnecessary network calls for data that doesn't change every second (e.g. your review list, user profile, etc.).
 * 
 * > retry: 1
 * 
 *     If a query fails (network error, 500, etc.), React Query will automatically retry it 1 more time before giving up and marking it as an error.
 * 
 *         - Default is retry: 3 (with exponential backoff between attempts).
 *         - Setting it to 1 means: try once, fail → retry once more → if that also fails, show the error state. This is a common tweak because 3 retries can feel slow/annoying in dev and for user-facing errors (e.g. a failed login shouldn't silently retry 3 times before showing "invalid credentials" — though for auth-related requests, you'd usually want retry: false specifically, since retrying a 401 won't magically succeed).
 * 
 * > refetchOnWindowFocus: false
 * 
 *     By default, React Query refetches all active queries whenever the browser window regains focus (e.g. you switch tabs away and back). This is great for keeping data fresh, but can be annoying in development (constant refetches every time you alt-tab) or unnecessary for data that doesn't change often.
 * 
 *     Setting this to false disables that automatic refetch-on-focus behavior globally.
 * 
 */