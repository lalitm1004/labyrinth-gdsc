<script lang="ts">
	import '../app.css';
    import { onMount } from 'svelte';
    import { invalidate, invalidateAll } from '$app/navigation';
    import { SupaStore, UserStore } from '$lib/stores/SupaStore';
    import { PUBLIC_ENV } from '$env/static/public';
    import SessionPanel from '$lib/components/SessionPanel.svelte';

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

		return () => subscription.unsubscribe();
	})
</script>

{@render children()}
{#if PUBLIC_ENV === 'development'}
	
	<SessionPanel />
{/if}
