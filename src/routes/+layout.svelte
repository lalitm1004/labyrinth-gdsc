<script lang="ts">
	import '../app.css';
    import { onMount } from 'svelte';
    import { invalidate, invalidateAll } from '$app/navigation';
    import { SupaStore, UserStore } from '$lib/stores/SupaStore';
    import { PUBLIC_ENV } from '$env/static/public';
    import SessionPanel from '$lib/components/SessionPanel.svelte';
    import { addToast, ToastStore } from '$lib/stores/ToastStore';
    import Toast from '$lib/components/Toast.svelte';

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

		// addToast({
		// 	message: 'Successfully voted for "Scott Pilgrim vs. the World"',
		// 	type: 'success'
		// })

		return () => subscription.unsubscribe();
	})
</script>

{@render children()}
{#if PUBLIC_ENV === 'development'}
	
	<SessionPanel />
{/if}

{#if $ToastStore}
    {#each $ToastStore as toast (toast.id)}
        <Toast {...toast} />
    {/each}
{/if}