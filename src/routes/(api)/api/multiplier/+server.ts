import { getAllMultipliers } from "$lib/server/database/multiplier.db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    const multipliers = await getAllMultipliers();
    return json(multipliers);
}