import type { MovieMultiplier } from "@prisma/client";
import { writable } from "svelte/store";

export const MultiplierStore = writable<MovieMultiplier[]>();