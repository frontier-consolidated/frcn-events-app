<script lang="ts">
	import { invalidate } from "$app/navigation";
	import { Label, Modal } from "flowbite-svelte";

	import { Mutations, getApollo } from "$lib/graphql";
	import type { EventFragmentFragment } from "$lib/graphql/__generated__/graphql";
	import { pushNotification } from "$lib/stores/NotificationStore";

	import Button from "../Button.svelte";
	import Select from "../select/Select.svelte";

	export let event: Omit<EventFragmentFragment, "location">;
	export let open: boolean = false;
	export let dependency = "app:events";

	let rsvpRole: string | null = null;
</script>

<Modal
	title="RSVP for '{event.name}'"
	placement="top-center"
	outsideclose
	bind:open
	bodyClass="overflow-y-visible"
>
	<div>
		<Label for="event-rsvp-role" class="mb-2">RSVP Role</Label>
		<Select
			id="event-rsvp-role"
			name="event-rsvp-role"
			options={event.rsvpRoles.map((role) => ({
				value: role.id,
				name: role.name
			}))}
			required
			bind:value={rsvpRole}
		/>
	</div>
	<svelte:fragment slot="footer">
		<Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
		<Button
			disabled={!rsvpRole}
			on:click={async () => {
				if (!rsvpRole) return;

				const { data: rsvpData, errors } = await getApollo().mutate({
					mutation: Mutations.RSVP_FOR_EVENT,
					variables: {
						eventId: event.id,
						rsvpId: rsvpRole
					}
				});

				if (!rsvpData?.success || (errors && errors.length > 0)) {
					pushNotification({
						type: "error",
						message: "Failed to rsvp for event"
					});
					console.error(errors);
					return;
				}

				await invalidate(dependency);
				pushNotification({
					type: "success",
					message: "RSVPed for event"
				});
				open = false;
			}}>RSVP</Button
		>
	</svelte:fragment>
</Modal>
