"use server";
import { cookies } from "next/headers";
import {
  loadGithubActivity,
  GITHUB_PROFILE_URL,
  type GithubCommit,
} from "@/lib/github";

export async function setLocale(locale: string) {
  const store = await cookies();
  
  store.set("locale", locale, { path: "/" });
}

export type GithubActivityResult = {
  ok: boolean;
  commits: GithubCommit[];
  profileUrl: string;
};

/** On-demand feed of recent public commits for the GitHub activity panel.
 *  Never throws to the client — a failed fetch returns `ok: false` so the UI
 *  can show a retry state instead of crashing the transition. */
export async function getGithubActivity(): Promise<GithubActivityResult> {
  try {
    const commits = await loadGithubActivity();
    return { ok: true, commits, profileUrl: GITHUB_PROFILE_URL };
  } catch {
    return { ok: false, commits: [], profileUrl: GITHUB_PROFILE_URL };
  }
}