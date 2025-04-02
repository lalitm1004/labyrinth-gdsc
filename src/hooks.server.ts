import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { sensitiveRoutes } from "$lib/data/sensitiveRoutes";
import { createServerClient } from "@supabase/ssr";

import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const createSupabase: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll() {
                return event.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, { ...options, path: '/' })
                });
            },
        },
    })

    event.locals.safeGetSession = async () => {
        const {
            data: { user },
            error
        } = await event.locals.supabase.auth.getUser();
        if (error) {
            return { session: null, user: null }
        }

        const {
            data: { session }
        } = await event.locals.supabase.auth.getSession();
        if (!session) {
            return { session: null, user: null }
        }

        return { session, user }
    }

    event.locals.getSession = async () => {
        const { session } = await event.locals.safeGetSession();
        return session;
    }
    event.locals.session = await event.locals.getSession();

    event.locals.getUser = async () => {
        const { user } = await event.locals.safeGetSession();
        return user;
    }
    event.locals.user = await event.locals.getUser();

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    });
}

const authGuard: Handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;
    const shouldRedirect = sensitiveRoutes.some(route => 
        currentPath === route || currentPath.startsWith(`${route}/`)
    );

    if (shouldRedirect) {
        return new Response(null, {
            status: 302,
            headers: {
                location: 'https://www.youtube.com/watch?v=8pJZ9dWvxyA'
            }
        });
    }
    
    return resolve(event);
}

export const handle: Handle = sequence(createSupabase, authGuard)