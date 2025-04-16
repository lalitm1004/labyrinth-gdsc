<script lang="ts">
    import { LoadingStore } from "$lib/stores/LoadingStore";
    import { addToast } from "$lib/stores/ToastStore";

    let { data } = $props();
    let { user } = $derived(data);

    let username: string = $state('');
    let password: string = $state('');

    const handleClick = async () => {
        if (!username.trim() || !password.trim()) {
            addToast({
                message: 'Please enter both values',
                type: 'warning'
            });
            return;
        }

        await fetch('/api/shame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: user!.id,
                shameReason: `Tried to access admin panel with username/password > ${username}/${password}`
            }),
        });

        LoadingStore.set(true);
        setTimeout(() => {
            LoadingStore.set(false);
            addToast({
                message: 'Invalid credentials',
                type: 'danger'
            });
        }, 1000);
    }
</script>

<main class={`h-screen w-screen grid place-items-center bg-neutral-900 text-black`}>
    <div class={`bg-white md:w-[25%] w-[90%] h-[40%] rounded-lg flex flex-col justify-center items-center`}>
        <h1 class={`md:text-5xl text-2xl font-gidole`}>Admin Panel</h1>

        <div class={`flex flex-col justify-center items-center gap-2 mt-4`}>
            <input
                bind:value={username}
                class={`border-2 p-2 rounded-lg`}
                id={`username`}
                name={`username`}
                placeholder={`Username`}
            />
            <input
                bind:value={password}
                class={`border-2 p-2 rounded-lg`}
                id={`password`}
                name={`password`}
                type={`password`}
                placeholder={`Password`}
                required
            />

            <button
                onclick={() => handleClick()}
                class={`border-2 w-fit py-2 px-4 rounded-lg hover:bg-neutral-500/30 active:bg-neutral-800/30`}
            >
                Login
            </button>
        </div>
    </div>
</main>

<svelte:head>
    <title>Admin Panel</title>
</svelte:head>