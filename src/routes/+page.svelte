<script lang="ts">
    let { data } = $props();
    let { supabase, session, user } = $derived(data);

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
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
        await supabase.auth.signOut();
    }
</script>

TODO