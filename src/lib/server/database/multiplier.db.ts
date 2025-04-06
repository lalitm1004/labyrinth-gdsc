import { db } from "./prisma"

export const getAllMultipliers = async () => {
    return await db.movieMultiplier.findMany()
}