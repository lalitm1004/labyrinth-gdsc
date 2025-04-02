<script lang="ts">
	import '../app.css';
    import { onMount } from 'svelte';
    import { invalidate, invalidateAll } from '$app/navigation';

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


		return () => subscription.unsubscribe();
	})
</script>

{@render children()}
