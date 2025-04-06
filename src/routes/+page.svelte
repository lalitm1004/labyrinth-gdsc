<script lang="ts">
    import type { IVoteEntry } from '$lib/server/database/vote.db';
    import { LoadingStore } from '$lib/stores/LoadingStore.js';
    import { MultiplierStore } from '$lib/stores/MultiplierStore.js';
    import { addToast } from '$lib/stores/ToastStore.js';
    import { VoteStore } from '$lib/stores/VoteStore';
    import type { Movie, MovieMultiplier } from '@prisma/client';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    let { data } = $props();
    let { supabase, user, movies, votes, multipliers } = $derived(data);

    let isModalOpen: boolean = $state(false);
    let selectedMovie: Movie | null = $state(null);

    onMount(() => {
        MultiplierStore.set(multipliers);
        VoteStore.set(votes);

        const voteRefreshInterval = setInterval(refreshVotes, 5000)        

        const multiplierSubscription = supabase
            .channel('multiplier_channel')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'moviemultiplier',
                },
                async (_) => {
                    await refreshMultiplier();
                }
            )
            .subscribe();

        return () => {
            clearInterval(voteRefreshInterval);
            multiplierSubscription.unsubscribe();
        }
    })

    const refreshVotes = async () => {
        const response = await fetch('/api/vote');
        const data = await response.json();
        const map: Map<string, IVoteEntry> = new Map(Object.entries(data));
        VoteStore.set(map)
    }

    const refreshMultiplier = async () => {
        const response = await fetch('/api/multiplier');
        const data: MovieMultiplier[] = await response.json();
        MultiplierStore.set(data)
    }

    const getVoteCount = (moveId: string): string => {
        if (!$VoteStore) return '';
        const voteEntry = $VoteStore.get(moveId)!;
        const count = voteEntry ? voteEntry.voteCount : 0;
        return count.toString()
    }

    const getMultiplier = (movieId: string): number => {
        if (!$MultiplierStore) return 1;
        const entry = $MultiplierStore.find(m => m.movieId === movieId)!;
        return entry.voteMultiplier ?? 1;
    }

    const alreadyVoted = () => {
        window.localStorage.setItem('has_voted', 'true');
        addToast({
            message: 'You have already submitted a vote.',
            type: 'warning',
        })
    };

    const handleVote = async () => {
        if (!selectedMovie) {
            await fetch('/api/shame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, shameReason: 'Tried to vote without selecting a movie.' }),
            });
            return;
        }

        if (window.localStorage.getItem('has_voted') === 'true') {
            alreadyVoted();
            closeConfirmationModal();
            return;
        }

        LoadingStore.set(true);
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, movieId: selectedMovie.id }),
        });
        const data = await response.json();
        LoadingStore.set(false);

        if (data.success) {
            localStorage.setItem('has_voted', 'true')
            addToast({
                message: `Successfully voted for "${selectedMovie.name}"`,
                type: 'success',
            });
            closeConfirmationModal();
            return;
        }

        if (data.message === 'P2002') {
            alreadyVoted();
            closeConfirmationModal();
            return;
        }

        addToast({
            message: 'An unexpected error has occured. Please contact the administrator',
            type: 'danger',
        });
        closeConfirmationModal();
    }
    
    const openConfirmationModal = (movieId: string) => {
        if (localStorage.getItem('has_voted') === 'true') {
            alreadyVoted();
            return;
        }

        selectedMovie = movies.find(m => m.id === movieId)!;
        isModalOpen = true;
        document.body.style.overflow = 'hidden';
    }

    const closeConfirmationModal = () => {
        selectedMovie = null;
        isModalOpen = false;
        document.body.style.overflow = 'auto';
    }

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

<main>
    <hgroup class={`text-center`}>
        <span class={`flex justify-center items-center gap-2`}>
            <img class={`w-[40px] aspect-auto`} src={`/assets/images/gdsc.png`} alt={`GDSC Logo`}/>
            <h1 class={`font-alpino text-4xl font-black`}>Labyrinth'25</h1>
        </span>
        <p class={`text-xl mt-2 tracking-tight leading-6`}>
            Vote for your favorite film to be the theme for this years labyrinth!
        </p>
    </hgroup>

    {#if user}
        <div class={`flex md:flex-row flex-col items-center gap-2`}>
            {#each movies as movie (movie.id)}
                <button onclick={() => openConfirmationModal(movie.id)} class={`cursor-pointer`}>
                    <figure class={`bg-blue-400 flex flex-col gap-1 px-2 py-2 rounded-sm text-center`}>
                        <img class={`md:h-[300px] md:w-auto w-[200px] aspect-auto rounded-sm`} src={movie.thumbnailSource} alt={`${movie.name} poster`} fetchpriority={`high`}>
                        <figcaption>
                            <p>{movie.name}</p>
                            <p>{getVoteCount(movie.id)}</p>
                            <p>{getMultiplier(movie.id)}</p>
                        </figcaption>
                    </figure>
                </button>
            {/each}
        </div>
    {:else}
        <button onclick={handleSignIn}>
            <img class={`w-[60px]`} src={`/assets/images/gdsc.png`} alt={`GDSC Logo`}/>
            <p class={`text-2xl font-medium`}>Sign In</p>
        </button>
    {/if}


    {#if isModalOpen}
        <!-- blurring screen -->
        <button
            transition:fade={{ duration: 100 }}
            onclick={() => closeConfirmationModal()}
            aria-label={`exit modal`}
            class={`fixed top-0 left-0 z-20 h-dvh w-dvw bg-black/80 backdrop-blur-sm`}
        ></button>

        <div
            transition:fade={{ duration: 100 }}
            class={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[30%] w-[90%] h-fit bg-white flex flex-col justify-center items-center gap-3 px-4 py-4 rounded-xl z-30`}
        >
            <hgroup class={`flex flex-col justify-center text-center gap-2`}>
                <h2 class={`text-3xl font-black font-alpino`}>Confirm Your Vote</h2>
                <p class={`text-xl leading-5`}>Are you sure you want to vote for <span class={`font-bold`}>{selectedMovie?.name}</span>?</p>
                <p class={`text-sm text-gray-500 leading-4 tracking-tighter`}>*This action cannot be undone and you can only vote once.</p>
            </hgroup>
            
            <div class={`w-[90%] grid grid-cols-2 gap-2`}>
                <button
                    onclick={() => handleVote()}
                    class={`bg-green-400 text-xl py-3 rounded-lg`}
                >
                    Confirm
                </button>
                <button
                    onclick={() => closeConfirmationModal()}
                    class={`bg-red-500 text-xl rounded-lg`}
                >
                    Cancel
                </button>
            </div>
        </div>
    {/if}
</main>


<svelte:head>
    <title>Labyrinth'25 Theme Vote</title>
    <meta name="description" content="We are giving you the chance to decide labyrinth'25s theme fair and square. No rigging whatsoever!">
</svelte:head>