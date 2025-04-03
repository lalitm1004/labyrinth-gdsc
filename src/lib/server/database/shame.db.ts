import { db } from "$lib/server/database/prisma";

export interface IShameEntry {
    name: string;
    email: string;
    shameCount: number;
    shameReasons: string[];
}

export const getShameEntries = async (): Promise<Map<string, IShameEntry>> => {
    const shame = await db.shame.findMany({
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            reason: true,
            createdAt: true
        },
        orderBy: [{ createdAt: 'desc' }]
    });

    const shameCount = new Map<string, IShameEntry>();

    shame.forEach(s => {
        const { id, name, email } = s.user;
        const reason = s.reason;

        if (shameCount.has(id)) {
            const entry = shameCount.get(id)!
            entry.shameCount += 1;
            if (reason)
                entry.shameReasons.push(reason)
        } else
            shameCount.set(id, { name, email, shameCount: 1, shameReasons: reason ? [reason] : [] });
    });

    return shameCount;
}