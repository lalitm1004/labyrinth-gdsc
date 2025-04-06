import { insertShameEntry } from "$lib/server/database/shame.db";
import { getAllVotes, insertVote } from "$lib/server/database/vote.db";
import { Prisma } from "@prisma/client";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async({ locals: { user }, request }) => {
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, movieId } = await request.json();
    if (!userId || !movieId) {
        if (!userId && movieId) insertShameEntry(user.id, "Tried to make an anonymous vote");
        if (userId && !movieId) insertShameEntry(user.id, "Wondered what would happen if they sent userId and voted for nothing.");
        if (!userId && !movieId) insertShameEntry(user.id, "\"I bet I could break this endpoint by doing nothing.\"")
        return json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const vote = await insertVote(userId, movieId);

        return json({
            success: true,
            message: `User with id "${userId}" voted for movie with id "${movieId}" successfully`,
        }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return json({
                success: false,
                message: 'P2002',
            }, { status: 409 });
        }

        console.error(`/vote POST error: ${error}`);
        return json({
            success: false,
            message: 'A server side error has occured. Please contact administrator.'
        });
    }
}

export const GET: RequestHandler = async () => {
    const votes = await getAllVotes();
    const votesObject = Object.fromEntries(votes);
    return json(votesObject);
}