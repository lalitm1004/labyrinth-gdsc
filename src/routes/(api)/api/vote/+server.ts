import { insertShameEntry } from "$lib/server/database/shame.db";
import { insertVote } from "$lib/server/database/vote.db";
import { Prisma } from "@prisma/client";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async({ locals: { user }, request }) => {
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, movieId } = await request.json();
    if (!userId || !movieId) {
        insertShameEntry(user.id, "Tried to access /vote endpoint with invalid parameters");
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