import { insertShameEntry } from "$lib/server/database/shame.db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async({ locals: { user }, request}) => {
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, shameReason } = await request.json();
    if (!userId || !shameReason) {
        if (!userId && shameReason) insertShameEntry(user.id, "Tried to make an anonymous entry to /shame endpoint");
        if (userId && !shameReason) insertShameEntry(user.id, "Really wants to be on /shame?? idk why. Might have tried to put someone else on here.");
        if (!userId && !shameReason) insertShameEntry(user.id, "Employed chinas strategy to dethrone the united states, did not work. I like to think I am slightly smarted than trump")
        return json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const shame = await insertShameEntry(userId, shameReason);

        return json({
            success: true,
            message: `Shame entry added.`
        }, { status: 201 });
    } catch (error) {
        console.error(`/shame POST error: ${error}`);
        return json({
            success: false,
            message: 'A server side error has occured. Please contact administrator.'
        });
    }
}