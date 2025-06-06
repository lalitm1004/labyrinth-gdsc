import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUserTriggers() {
    const queries = [
        Prisma.sql`
            CREATE OR REPLACE FUNCTION fnOnAuthNewUser()
            RETURNS trigger
            LANGUAGE plpgsql
            SECURITY DEFINER
            SET search_path = ''
            AS $$
            BEGIN
                INSERT INTO public.UserProfile (id, name, email)
                VALUES (new.id, '', '');

                UPDATE public.UserProfile SET
                    name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
                    email = COALESCE(new.email, '')
                WHERE id = new.id;

                RETURN NEW;
            END;
            $$;
        `,
        Prisma.sql`
            CREATE OR REPLACE TRIGGER trOnAuthNewUser
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE fnOnAuthNewUser();
        `,
    ];

    for (const query of queries) {
        await prisma.$executeRaw(query);
    }
}

async function seedMovie() {
    await prisma.$executeRawUnsafe(`DELETE FROM public.Movie`);

    const movies = [
        { name: 'Scott Pilgrim vs. the World', thumbnailSource: 'https://m.media-amazon.com/images/M/MV5BNTA5ZWMwNmYtNWI1ZS00NDRlLTkxNzktMzdhZDU2ZDhjNDJmXkEyXkFqcGc@._V1_FMjpg_UX1140_.jpg' },
        { name: 'Nadaaniyan', thumbnailSource: 'https://m.media-amazon.com/images/M/MV5BNDRkNWM0NTQtZmIyNy00MzZmLWI4OTktNzM0NTMzMGJiYzUyXkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg' },
        { name: 'The Maze Runner', thumbnailSource: 'https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_FMjpg_UX500_.jpg' },
    ];

    await prisma.movie.createMany({
        data: movies
    });
}

async function main() {
    await createUserTriggers()
        .then(() => console.log('✅ userTriggers created'))
        .catch((e) => console.error(`🚨 ${e}`));

    await seedMovie()
        .then(() => console.log('✅ public.Movie seeded'))
        .catch((e) => console.error(`🚨 ${e}`));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });