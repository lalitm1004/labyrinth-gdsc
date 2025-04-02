<script lang="ts">

    let { data } = $props();
    let { supabase, user } = $derived(data);

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
</script>

<div>
    <div>
        {user?.email}
    </div>
    <button onclick={handleSignIn} class={`bg-neutral-700`}>
        Sign In Vro
    </button>

    <button onclick={async () => {
        await supabase.auth.signOut();
    }}
        class={`bg-neutral-700`}
    >
        Sign Out Vro
    </button>
</div>