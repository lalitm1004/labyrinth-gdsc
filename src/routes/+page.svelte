<script lang="ts">
    import type { IVoteEntry } from '$lib/server/database/vote.db';
    import { device } from '$lib/stores/DeviceStore';
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

    let isPageLoaded: boolean = $state(false);
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

        isPageLoaded = true;

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
        const multiplier = getMultiplier(moveId)
        const count = voteEntry ? voteEntry.voteCount * multiplier : 0;
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
        console.log(movieId);
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

{#if isPageLoaded}
{#if $device === 'mobile'}
    <main class={`h-dvh overflow-x-hidden overflow-y-scroll`}>
            <div class={`relative h-[100vh] w-dvw bg-[url(/assets/images/bg.png)] bg-center bg-cover flex flex-col gap-12 py-10`}>
                <hgroup class={`text-center font-alpino font-black text-white`}>
                    <h1 class={`text-8xl`}>VOTE</h1>
                    <div class={`text-4xl -mt-2 tracking-tight leading-7`}>
                        <p>for the theme of</p>
                        <p class={`text-5xl`}>labyrinth'25!</p>
                    </div>
                </hgroup>

                <div class={`text-white w-full flex flex-col gap-4`}>
                    <span class={`w-full flex`}>
                        <span class={`flex-grow`}></span>
                        <img class={`w-[65%] aspect-auto slide-from-right`} src={`/assets/images/girl.png`} alt={`Ramona Flowers`}/>
                    </span>
                    <span>
                        <img class={`w-[65%] aspect-auto slide-from-left`} src={`/assets/images/scott.png`} alt={`Scott Pilgrim`}/>
                        <span class={`flex-grow`}></span>
                    </span>
                </div>

                <img class={`absolute bottom-0 left-0 t/ranslate-y-[50%]`} src={`/assets/images/stars.png`} alt={`star margin`}/>
            </div>

            <div class={`relative h-[100vh] w-dvw bg-gradient-to-b from-[#212139] to-neutral-950 flex flex-col pt-24 gap-12`}>
                <hgroup class={`z-20 text-center font-alpino font-black text-white`}>
                    <h2 class={`text-7xl text-pink-300`}>Pick your choice!</h2>
                </hgroup>

                <div class={`w-full flex flex-col items-center gap-4`}>
                    {#each movies as  movie (movie.id)}
                        <button onclick={() => openConfirmationModal(movie.id)} class={`relative z-20 bg-white w-[90%] flex flex-col items-center gap-2 py-4 rounded-lg`}>
                            <p class={`font-gotham text-xl`}>{movie.name}</p>

                            <hr class={`w-[80%]`}/>

                            <p class={`font-gotham text-2xl`}>
                                {getVoteCount(movie.id)}
                            </p>

                            {#if getMultiplier(movie.id) !== 1}
                                <div class={`absolute top-0 right-0 -translate-y-[40%] shadow-neutral-600 shadow-md translate-x-[40%] grid place-items-center text-white bg-red-300 rotate-20 rounded-full px-2 py-2 text-lg font-alpino font-black`}>
                                    x{getMultiplier(movie.id)}
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>

                <div class={`absolute top-0 left-0 z-10 h-[100vh] w-dvw bg-[url(/assets/images/starbg.png)] bg-cover bg-center`}></div>
            </div>
        
            
    </main>
{:else}
    <main>
        Desktop TODO
    </main>
{/if}
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

<svelte:head>
    <title>Labyrinth Voting </title>
</svelte:head>

<style>
    .slide-from-left {
        animation: slideFromLeft 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        transform: translateX(-100vw);
    }

    .slide-from-right {
        animation: slideFromRight 1000ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        transform: translateX(100vw);
    }

    @keyframes slideFromLeft {
        0% {
            transform: translateX(-100vw);
        }
        100% {
            transform: translateX(0);
        }
    }

    @keyframes slideFromRight {
        0% {
            transform: translateX(100vw);
        }
        100% {
            transform: translateX(0);
        }
    }
</style>
