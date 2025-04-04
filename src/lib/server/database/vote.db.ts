import { db } from '$lib/server/database/prisma';

export const insertVote = async (userId: string, movieId: string) => {
    return await db.vote.create({
        data: {
            userId,
            movieId,
        },
    });
}

export interface IVoteEntry {
    name: string;
    voteCount: number;
}

export const getAllVotes = async (): Promise<Map<string, IVoteEntry>> => {
    const votes = await db.vote.findMany({
        select: {
            movie: {
                select: {
                    id: true,
                    name: true
                },
            }
        },
    });

    const voteCount = new Map<string, IVoteEntry>();

    votes.forEach(v => {
        const { id, name } = v.movie

        if (voteCount.has(id))
            voteCount.get(id)!.voteCount += 1;
        else
            voteCount.set(id, { name, voteCount: 1 });
    });

    return voteCount;
}