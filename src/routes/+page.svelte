<script lang="ts">
    let { data } = $props();
    let { supabase, session, user, movies } = $derived(data);

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

    const handleVote = async (id: string) => {
        alert(id)
    }
</script>

<main class={`h-dvh w-dvw flex flex-col items-center pt-16`}>
    <hgroup class={`text-center`}>
        <span class={`flex justify-center items-center gap-2`}>
            <img class={`w-[40px] aspect-auto`} src={`/assets/images/gdsc.png`} alt={`GDSC Logo`}/>
            <h1 class={`font-alpino text-4xl font-black`}>Labyrinth'25</h1>
        </span>
        <p class={`text-xl mt-2 tracking-tight leading-6`}>
            Vote for your favorite film to be the theme for this years labyrinth!
        </p>
    </hgroup>

    {#if session}
        <div class={`flex md:flex-row flex-col items-center gap-2`}>
            {#each movies as movie (movie.id)}
                <button onclick={() => handleVote(movie.id)} class={`cursor-pointer`}>
                    <figure class={`bg-blue-400 flex flex-col gap-1 px-2 py-2 rounded-sm text-center`}>
                        <img class={`md:h-[300px] md:w-auto w-[200px] aspect-auto rounded-sm`} src={movie.thumbnailSource} alt={`${movie.name} poster`} fetchpriority={`high`}>
                        <figcaption>{movie.name}</figcaption>
                    </figure>
                </button>
            {/each}
        </div>
    {:else}
        <button onclick={() => handleSignIn()} class={`mt-12 flex gap-2 px-4 py-2 rounded-xl border-4 border-neutral-800`}>
            <img class={`w-[60px]`} src={`/assets/images/gdsc.png`} alt={`GDSC Logo`}/>
            <p class={`text-2xl font-medium`}>Sign In</p>
        </button>
    {/if}
</main>

<svelte:head>
    <title>Labyrinth'25 Voting</title>
    <meta name="description" content="We are giving you the choice to decide labyrinth'25s theme fair and square. No rigging whatsoever">
</svelte:head>