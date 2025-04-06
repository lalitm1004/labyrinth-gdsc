import { getAllMovies } from "$lib/server/database/movie.db";
import { getAllMultipliers } from "$lib/server/database/multiplier.db";
import { getAllVotes } from "$lib/server/database/vote.db";
import type { PageServerLoad } from "./$types";

// @ts-ignore
export const load: PageServerLoad = async () => {
    const multipliers = await getAllMultipliers();
    const movies = await getAllMovies();
    const votes = await getAllVotes();
    return {
        multipliers,
        movies,
        votes,
    }
}