import { getAllMovies } from "$lib/server/database/movie.db";
import type { PageServerLoad } from "./$types";

// @ts-ignore
export const load: PageServerLoad = async () => {
    const movies = await getAllMovies();
    return {
        movies
    }
}