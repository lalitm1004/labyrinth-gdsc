import { db } from '$lib/server/database/prisma';

export const getAllMovies = async () => {
    return await db.movie.findMany({
        orderBy: [{ name: 'desc' }]
    })
}