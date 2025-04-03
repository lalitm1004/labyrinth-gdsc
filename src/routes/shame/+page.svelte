<script lang="ts">
    let { data } = $props();
    let { shameMap } = $derived(data);
    $inspect(shameMap)
</script>

<pre>
    {JSON.stringify(Object.fromEntries(shameMap), null, 2)}
</pre>