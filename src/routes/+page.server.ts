import { getAllMovies } from "$lib/server/database/movie.db";
import { getAllVotes } from "$lib/server/database/vote.db";
import type { PageServerLoad } from "./$types";

// @ts-ignore
export const load: PageServerLoad = async () => {
    const movies = await getAllMovies();
    const votes = await getAllVotes();
    return {
        movies,
        votes,
    }
}