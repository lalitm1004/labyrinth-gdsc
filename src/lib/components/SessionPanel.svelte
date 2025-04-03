<script lang="ts">
    import { SupaStore } from "$lib/stores/SupaStore";

    const handleSignIn = async () => {
        await $SupaStore.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
    }

    const handleSignOut = async () => {
        await $SupaStore.auth.signOut();
    }
</script>

<div class={`fixed bottom-0 left-0 flex bg-red-400 px-4 py-2`}>
    <button onclick={() => handleSignIn()} class={`cursor-pointer bg-neutral-900 text-white px-4 py-2-2`}>Sign In</button>
    <button onclick={() => handleSignOut()} class={`cursor-pointer bg-neutral-900 text-white px-4 py-2`}>Sign Out</button>
</div>