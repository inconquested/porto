import { unstable_cache } from "next/cache";

/* Public GitHub handle whose commit activity the site surfaces.
   Placeholder — swap for the real Magicworks account before launch. */
const GITHUB_USER = "inconquested";

export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USER}`;

export type GithubCommit = {
  id: string;
  repo: string; // "owner/name"
  message: string; // first line only
  sha: string; // short sha
  url: string; // link to the commit on github.com
  date: string; // ISO string of the push
};

// The public events feed no longer inlines a `commits[]` array in PushEvent
// payloads — only the tip (`head`) and previous (`before`) SHAs. We resolve
// each push's head SHA to a commit resource to recover its message.
type GithubEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: { head?: string; before?: string };
};

type GithubCommitResource = {
  sha: string;
  html_url: string;
  commit: { message: string; author?: { date?: string } };
};

const MAX_COMMITS = 12;

/** Shared headers — an optional GITHUB_TOKEN lifts the 60-req/hr anon limit. */
function githubHeaders(): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "magicworks-portfolio",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

/** Pull recent public PushEvents and flatten them into a `git log`-style feed.
 *  Runs server-side only. Each push contributes its head commit, resolved via
 *  the commit resource since the events payload only carries SHAs. */
async function fetchActivity(): Promise<GithubCommit[]> {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=50`,
    { headers: githubHeaders() },
  );
  if (!res.ok) throw new Error(`GitHub responded ${res.status}`);

  const events = (await res.json()) as GithubEvent[];

  // Newest-first: collect each push's head SHA, deduped, capped at MAX_COMMITS.
  const heads: { repo: string; sha: string; date: string }[] = [];
  const seen = new Set<string>();
  for (const ev of events) {
    if (ev.type !== "PushEvent" || !ev.payload?.head) continue;
    const id = `${ev.repo.name}@${ev.payload.head}`;
    if (seen.has(id)) continue;
    seen.add(id);
    heads.push({ repo: ev.repo.name, sha: ev.payload.head, date: ev.created_at });
    if (heads.length >= MAX_COMMITS) break;
  }

  // Resolve each head SHA to its commit message in parallel. A push whose
  // commit can't be fetched (deleted repo, force-push) is dropped, not fatal.
  const commits = await Promise.all(
    heads.map(async ({ repo, sha, date }): Promise<GithubCommit | null> => {
      try {
        const r = await fetch(
          `https://api.github.com/repos/${repo}/commits/${sha}`,
          { headers: githubHeaders() },
        );
        if (!r.ok) return null;
        const c = (await r.json()) as GithubCommitResource;
        return {
          id: `${repo}@${sha}`,
          repo,
          message: c.commit.message.split("\n")[0],
          sha: sha.slice(0, 7),
          url: c.html_url,
          date: c.commit.author?.date ?? date,
        };
      } catch {
        return null;
      }
    }),
  );

  return commits.filter((c): c is GithubCommit => c !== null);
}

/* Cached at the data layer so the GitHub API isn't hit on every expand
   (unauthenticated limit is 60/hr per IP). Refreshes every 15 minutes. */
export const loadGithubActivity = unstable_cache(
  fetchActivity,
  ["github-activity", GITHUB_USER],
  { revalidate: 900, tags: ["github-activity"] },
);
