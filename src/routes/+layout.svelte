<script lang="ts">
	import '../app.css';
    import { onMount } from 'svelte';
    import { invalidate, invalidateAll } from '$app/navigation';
    import { SupaStore, UserStore } from '$lib/stores/SupaStore';
    import { ToastStore } from '$lib/stores/ToastStore';
    import Toast from '$lib/components/Toast.svelte';
    import { LoadingStore } from '$lib/stores/LoadingStore';
    import ScreenBlur from '$lib/components/ScreenBlur.svelte';
    import { setDevice } from '$lib/stores/DeviceStore';

	let { data, children } = $props();
	let { supabase, session, user } = $derived(data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }

			if (event === "SIGNED_OUT")
				invalidateAll();
		})

		SupaStore.set(supabase);
		UserStore.set(user);

		if (window.matchMedia('(max-width: 767px)').matches) setDevice('mobile');
        else setDevice('desktop');

		return () => subscription.unsubscribe();
	})
</script>

<!-- handle device on resize -->
<svelte:window onresize={() => setDevice(window.matchMedia('(max-width: 767px').matches ? 'mobile' : 'desktop')}/>

{@render children()}

{#if $ToastStore}
    {#each $ToastStore as toast (toast.id)}
        <Toast {...toast} />
    {/each}
{/if}

{#if $LoadingStore}
	<ScreenBlur />
{/if}