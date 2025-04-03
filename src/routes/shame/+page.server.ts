import { getShameEntries } from "$lib/server/database/shame.db";
import type { PageServerLoad } from "./$types";

//@ts-ignore
export const load: PageServerLoad = async () => {
    const shameMap = await getShameEntries();
    return  {
        shameMap
    }
}