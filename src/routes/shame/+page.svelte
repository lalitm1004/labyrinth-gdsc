<script lang="ts">
    let { data } = $props();
    let { shameMap } = $derived(data);
</script>

<pre class={`text-white`}>
{JSON.stringify(Object.fromEntries(shameMap), null, 2)}
</pre>