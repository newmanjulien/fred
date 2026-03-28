<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" />
	<title>Overbase</title>
</svelte:head>

{@render children()}
