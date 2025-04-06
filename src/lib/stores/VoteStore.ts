import type { IVoteEntry } from "$lib/server/database/vote.db";
import { writable } from "svelte/store";

export const VoteStore = writable<Map<string, IVoteEntry>>();