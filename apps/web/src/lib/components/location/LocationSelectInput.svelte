<script lang="ts">
	import { locations, getChildren, type AnyLocation } from "@frcn/shared/locations";

	import LocationSelectLi from "./LocationSelectLi.svelte";
	import Button from "../Button.svelte";
	import type { Option } from "../select/types";


	const rootOptions = locations.map((location) => ({
		name: location.name,
		value: location,
	}));

	export let value: AnyLocation[] = [];
	export let disabled = false;
	let liOptions: Option<AnyLocation>[][] = [rootOptions];

	let canAdd = false;

	$: {
		if (value.length > liOptions.length && value.every((loc) => !!loc)) {
			const refreshedOptions: Option<AnyLocation>[][] = [rootOptions];
			for (const loc of value.slice(0, -1)) {
				const children = getChildren(loc);
				if (!children) break;

				refreshedOptions.push(
					children.map((location) => ({
						name: location.name,
						value: location,
					}))
				);
			}

			value = value.slice(0, refreshedOptions.length);
			liOptions = refreshedOptions;
		}

		if (value[0] == undefined && value.length > 1) {
			liOptions = [rootOptions];
			value = [value[0]];
		}

		const lastValue = value.slice(-1)[0];
		canAdd = lastValue && "children" in lastValue && value.length == liOptions.length;
	}
</script>

<ul class="flex flex-col gap-2" {...$$restProps}>
	{#each liOptions as options, i}
		<LocationSelectLi
			{options}
			deletable={i > 0}
			disabled={disabled || i + 1 != liOptions.length}
			bind:value={value[i]}
			on:delete={() => {
				if (i + 1 != liOptions.length) return;
				liOptions = [...liOptions.slice(0, -1)];
				value = [...value.slice(0, liOptions.length)];
			}}
		/>
	{/each}
	{#if canAdd}
		<Button
			{disabled}
			on:click={() => {
				const lastValue = value.slice(-1)[0];
				const children = getChildren(lastValue);
				if (!children) return;

				liOptions = [
					...liOptions,
					children.map((location) => ({
						name: location.name,
						value: location,
					})),
				];
			}}>Add Location</Button
		>
	{/if}
</ul>
