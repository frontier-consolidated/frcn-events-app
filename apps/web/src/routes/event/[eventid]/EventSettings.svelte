<script lang="ts">
	import { goto, invalidate } from "$app/navigation";
	import { strings, EventTypeOptions } from "@frcn/shared";
	import { Checkbox, Helper, Input, Label, Toggle } from "flowbite-svelte";
	import { EditOutline, CaretRightSolid, CloseSolid, ArchiveSolid } from "flowbite-svelte-icons";
	import { twMerge } from "tailwind-merge";
	import isURL from "validator/lib/isURL";

	import {
		DatetimePicker,
		LocationSelectInput,
		MarkdownEditor,
		ConfirmationModal,
		SectionHeading,
		Select,
		Field,
		FieldValidator,
		Button
	} from "$lib/components";
	import { Mutations, Queries, getApollo } from "$lib/graphql";
	import { EventAccessType } from "$lib/graphql/__generated__/graphql";
	import preventNavigation from "$lib/preventNavigation";
	import { pushNotification } from "$lib/stores/NotificationStore";

	import type { PageData } from "./$types";
	import RsvpTable from "./RSVPTable.svelte";
	import { checkIfDirty, cloneEventSettingsData } from "./settings";
	import DurationSelect from "$lib/components/datetime/DurationSelect.svelte";
	import LocationInput from "$lib/components/location/LocationInput.svelte";

	export let data: PageData;
	let editData = cloneEventSettingsData(data);

	const { canNavigate, initNavigation } = preventNavigation();

	let isDirty = false;
	$: {
		isDirty = checkIfDirty(data, editData);
		canNavigate.set(!isDirty);
	}

	$: canEdit = !data.archived && !data.endedAt;

	let startDate: Date | null = editData.startAt ? new Date(editData.startAt) : null;
	$: if (startDate) editData.startAt = startDate.getTime();

	let imagePlaceholder = false;
	let validator = new FieldValidator();

	let deleteModalOpen = false;
	let archiveModalOpen = false;

	async function save(notifyOfSuccess = true) {
		if (!validator.validate(!data.posted)) {
			pushNotification({
				type: "error",
				message: "Check your inputs"
			});
			return false;
		}
		if (editData.location.some((loc) => !loc)) {
			pushNotification({
				type: "error",
				message: "Invalid location"
			});
			return false;
		}

		const { errors } = await getApollo().mutate({
			mutation: Mutations.EDIT_EVENT,
			variables: {
				eventId: data.id,
				data: {
					channel: editData.channel.id ? editData.channel.id : undefined,
					name: editData.name ? editData.name : undefined,
					summary: editData.summary ? editData.summary : undefined,
					description: editData.description
						? editData.description.slice(0, 2024)
						: undefined,
					imageUrl: editData.imageUrl,
					eventType: editData.eventType,
					location: editData.location.map((loc) => loc.name),
					startAt: editData.startAt,
					duration: editData.duration,
					roles: editData.rsvpRoles.map((r) => ({
						id: r.id,
						name: r.name,
						limit: r.limit,
						emoji: r.emoji.name,
						emojiId: r.emoji.id
					})),
					mentions: editData.mentions,
					settings: {
						createEventThread: editData.settings.createEventThread,
						createThreadsForRoles: editData.settings.createThreadsForRoles,
						hideLocation: editData.settings.hideLocation,
						inviteOnly: editData.settings.inviteOnly,
						openToJoinRequests: editData.settings.openToJoinRequests
					},
					accessType: editData.accessType,
					accessRoles: editData.accessRoles.map((role) => role.id)
				}
			},
			errorPolicy: "all"
		});

		if (errors && errors.length > 0) {
			pushNotification({
				type: "error",
				message: "Failed to save"
			});
			console.error(errors);
			return false;
		}

		await invalidate("app:currentevent");

		if (notifyOfSuccess) {
			pushNotification({
				type: "success",
				message: "Event successfully saved!"
			});
		}
		return true;
	}

	async function post() {
		if (!validator.validate()) {
			pushNotification({
				type: "error",
				message: "Check your inputs"
			});
			return false;
		}
		if (isDirty && !(await save(false))) return false;

		const { data: postData, errors } = await getApollo().mutate({
			mutation: Mutations.POST_EVENT,
			variables: {
				eventId: data.id
			},
			errorPolicy: "all"
		});

		if (!postData?.success || (errors && errors.length > 0)) {
			pushNotification({
				type: "error",
				message: "Failed to post"
			});
			console.error(errors);
			return false;
		}

		await invalidate("app:currentevent");
		pushNotification({
			type: "success",
			message: "Event successfully posted!"
		});
		return true;
	}

	let guildOptions = data.options;

	let previousEventChannelId = editData.channel.id;
	let fetchingGuildData = false;
	$: {
		if (data.options && editData.channel.id !== previousEventChannelId) {
			previousEventChannelId = editData.channel.id;
			fetchingGuildData = true;

			editData.mentions = [];

			editData.channel =
				data.options.channels.find((channel) => channel.id === editData.channel.id) ??
				editData.channel;

			if (editData.channel.id === data.channel?.id) {
				guildOptions = data.options;
				fetchingGuildData = false;
			} else if ("id" in editData.channel.discordGuild) {
				getApollo()
					.query({
						query: Queries.GET_EVENT_SETTINGS_CHANNEL_OPTIONS,
						variables: {
							guildId: editData.channel.discordGuild.id
						}
					})
					.then((options) => {
						guildOptions = {
							channels: data.options!.channels,
							emojis: data.options!.emojis,
							discordRoles: options.data.discordRoles
						};
					})
					.catch((err) => {
						pushNotification({
							type: "error",
							message: "Failed to fetch data for selected event channel"
						});
						console.error(err);
					})
					.finally(() => {
						fetchingGuildData = false;
					});
			} else {
				guildOptions = {
					channels: data.options.channels,
					emojis: data.options.emojis,
					discordRoles: []
				};
				fetchingGuildData = false;
			}
		}
	}
</script>

<div class="flex flex-col md:grid md:grid-cols-2 md:gap-6" use:initNavigation>
	<div>
		<section>
			<SectionHeading>General Settings</SectionHeading>
			<div class="flex flex-col gap-4 p-4">
				<Field {validator} for="event-type" value={editData.eventType} required>
					<Label for="event-type" class="mb-2">Event Type</Label>
					<Select
						id="event-type"
						name="event-type"
						options={EventTypeOptions}
						required
						disabled={!canEdit}
						bind:value={editData.eventType}
					/>
				</Field>
				<Field {validator} for="event-name" value={editData.name} required>
					<Label for="event-name" class="mb-2">Event Name</Label>
					<Input
						id="event-name"
						name="event-name"
						type="text"
						placeholder="Event name"
						required
						maxlength="255"
						class="rounded"
						disabled={!canEdit}
						bind:value={editData.name}
					/>
				</Field>
				<Field {validator} for="event-summary" value={editData.summary} required>
					<Label for="event-summary" class="mb-2">Event Summary</Label>
					<Input
						id="event-summary"
						name="event-summary"
						type="text"
						placeholder="Event summary"
						required
						maxlength="255"
						class="rounded"
						disabled={!canEdit}
						bind:value={editData.summary}
					/>
					<Helper class="mt-1">
						This is used on the events page and as a description in link embeds
					</Helper>
				</Field>
				<Field
					{validator}
					for="event-image"
					value={editData.imageUrl}
					validate={(value) => {
						if (!value) return [true, null];
						const valid = isURL(value, {
							require_protocol: true,
							require_valid_protocol: true,
							protocols: ["https"],
							validate_length: true
						});
						if (valid) return [true, null];
						return [false, "Not a valid or allowed image url"];
					}}
				>
					<Label for="event-image" class="mb-2">Event Image</Label>
					<Input
						id="event-image"
						name="event-image"
						type="text"
						placeholder="https://example.com/image.png"
						required
						maxlength="2084"
						class="rounded"
						disabled={!canEdit}
						bind:value={editData.imageUrl}
					/>
					<div class="mt-2">
						{#if editData.imageUrl}
							<img
								src={editData.imageUrl}
								alt="Event thumbnail"
								class={twMerge(
									"rounded h-48",
									imagePlaceholder ? "hidden" : undefined
								)}
								on:error={() => {
									setTimeout(() => {
										imagePlaceholder = true;
									}, 100);
								}}
								on:load={() => {
									setTimeout(() => {
										imagePlaceholder = false;
									}, 100);
								}}
							/>
						{/if}
						{#if editData.imageUrl && imagePlaceholder}
							<div
								role="status"
								class="animate-pulse flex justify-center items-center w-full h-48 bg-gray-300 rounded dark:bg-gray-700"
							>
								<svg
									width="48"
									height="48"
									class="text-gray-200"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
									fill="currentColor"
									viewBox="0 0 640 512"
								>
									<path
										d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"
									/>
								</svg>
							</div>
						{/if}
					</div>
				</Field>
				<Field {validator} for="event-description" value={editData.description}>
					<Label for="event-description" class="mb-2">Event Description</Label>
					<MarkdownEditor
						maxlength="2048"
						placeholder="Describe the event"
						disabled={!canEdit}
						bind:value={editData.description}
					/>
				</Field>
			</div>
		</section>
	</div>
	<div>
		<section>
			<SectionHeading>Event Time</SectionHeading>
			<div class="flex flex-col gap-4 p-4">
				<Field {validator} for="event-start" value={startDate} required>
					<Label for="event-start" class="mb-2">Event Start</Label>
					<DatetimePicker
						id="event-start"
						name="event-start"
						disable="past"
						disabled={!canEdit}
						bind:value={startDate}
					/>
				</Field>
				<Field {validator} for="event-duration" value={editData.duration} required>
					<Label for="event-duration" class="mb-2">Event Duration</Label>
					<DurationSelect
						id="event-duration"
						name="event-duration"
						disabled={!canEdit}
						bind:value={editData.duration}
					/>
				</Field>
			</div>
		</section>
		<section>
			<SectionHeading>Event Location</SectionHeading>
			<div class="flex flex-col gap-4 p-4">
				<Field {validator} for="event-hide-location" value={editData.settings.hideLocation}>
					<Checkbox
						id="event-hide-location"
						disabled={!canEdit}
						bind:checked={editData.settings.hideLocation}
					>
						Hide Location
					</Checkbox>
					<Helper>
						If enabled, the event location will only be shown to users once the event
						starts
					</Helper>
				</Field>
				<Field {validator} for="event-location" value={editData.location}>
					<LocationInput
						id="event-location"
						disabled={!canEdit}
						bind:value={editData.location}
					/>
				</Field>
			</div>
		</section>
		<section>
			<SectionHeading>Join Permissions</SectionHeading>
			<div class="flex flex-col gap-4 p-4">
				<Field {validator} for="event-access" value={editData.accessType}>
					<Label for="event-access" class="mb-2">Event Access</Label>
					<Select
						id="event-access"
						name="event-access"
						options={[EventAccessType.Channel, EventAccessType.Everyone].map(
							(type) => ({
								value: type,
								name: strings.toTitleCase(type)
							})
						)}
						required
						disabled={!canEdit}
						bind:value={editData.accessType}
					/>
				</Field>
				<!-- <Field {validator} for="event-require-invite" value={editData.settings.inviteOnly}>
					<Toggle id="event-require-invite" disabled={!canEdit} bind:checked={editData.settings.inviteOnly}>
						Require Invite to Join
					</Toggle>
					<Helper class="mt-1">
						Selected users will have to request an invitation to join
					</Helper>
				</Field>
				<Field {validator} for="event-open-to-requests" value={editData.settings.openToJoinRequests}>
					{#key editData.settings.inviteOnly}
						<Toggle
							id="event-open-to-requests"
							disabled={!editData.settings.inviteOnly || !canEdit}
							bind:checked={editData.settings.openToJoinRequests}
						>
							Open to Join Requests
						</Toggle>
					{/key}
					<Helper class="mt-1">Selected users can request to join the event</Helper>
				</Field> -->
			</div>
		</section>
		<section>
			<SectionHeading>Discord Settings</SectionHeading>
			<div class="flex flex-col gap-4 p-4">
				<Field {validator} for="event-channel" value={editData.channel.id} required>
					<Label for="event-channel" class="mb-2">Events Channel</Label>
					<Select
						id="event-channel"
						name="event-channel"
						options={data.options?.channels.map((channel) => ({
							value: channel.id,
							name: `${channel.discordGuild.name} > ${channel.discord.name}`
						})) ?? [
							{
								value: editData.channel.id,
								name: `${editData.channel.discordGuild.name} > ${editData.channel.discord.name}`
							}
						]}
						required
						disabled={!canEdit}
						bind:value={editData.channel.id}
					/>
				</Field>
				<Field {validator} for="event-mentions" value={editData.mentions}>
					<Label for="event-mentions" class="mb-2">Mentions</Label>
					<Select
						id="event-mentions"
						name="event-mentions"
						options={guildOptions?.discordRoles.map((role) => ({
							value: role.id,
							name: role.name,
							style: {
								color: role.color === "#000000" ? "#e5e7eb" : role.color
							}
						}))}
						required
						multi
						search
						max={10}
						disabled={!canEdit || fetchingGuildData}
						bind:value={editData.mentions}
						let:option
					>
						<div class="flex items-center">
							<div
								class="rounded-full w-3 h-3 me-2"
								style="background-color:{option.style?.color}"
							/>
							<span>{option.name}</span>
						</div>
					</Select>
				</Field>
				<Field
					{validator}
					for="event-create-thread"
					value={editData.settings.createEventThread}
				>
					<Toggle
						id="event-create-thread"
						disabled={!canEdit || data.posted}
						bind:checked={editData.settings.createEventThread}
					>
						Create Event Thread
					</Toggle>
				</Field>
				<Field
					{validator}
					for="event-create-threads-for-roles"
					value={editData.settings.createThreadsForRoles}
				>
					<Toggle
						id="event-create-threads-for-roles"
						disabled={!canEdit || data.posted}
						bind:checked={editData.settings.createThreadsForRoles}
					>
						Create Threads for RSVP Roles
					</Toggle>
				</Field>
			</div>
		</section>
	</div>
</div>
<section>
	<SectionHeading>Event RSVPs</SectionHeading>
	<div class="py-4 sm:px-4">
		<RsvpTable
			id="event-rsvps"
			{validator}
			{data}
			disabled={!canEdit}
			bind:value={editData.rsvpRoles}
		/>
	</div>
</section>
<div class="flex flex-wrap justify-end items-center gap-2">
	{#if data.posted && startDate && startDate <= new Date()}
		<Button
			disabled={data.archived}
			color="dark"
			class="mr-auto"
			on:click={() => {
				if (data.archived) return;
				archiveModalOpen = true;
			}}
		>
			<ArchiveSolid class="me-2" tabindex="-1" /> Archive
		</Button>
	{:else}
		<Button
			color="red"
			class="mr-auto"
			on:click={() => {
				deleteModalOpen = true;
			}}
		>
			<CloseSolid class="me-2" tabindex="-1" /> Delete
		</Button>
	{/if}
	<Button
		color="alternative"
		on:click={() => {
			if (data.createdAt === data.updatedAt) {
				deleteModalOpen = true;
			} else {
				editData = cloneEventSettingsData(data);
			}
		}}
	>
		<CloseSolid class="me-2" tabindex="-1" /> Cancel
	</Button>
	{#if data.posted}
		<Button
			disabled={!isDirty || !canEdit}
			on:click={() => {
				if (!isDirty || !canEdit) return;
				save();
			}}
		>
			<EditOutline class="me-2" tabindex="-1" /> Save
		</Button>
	{:else}
		<Button
			color="green"
			disabled={!isDirty}
			on:click={() => {
				if (!isDirty) return;
				save();
			}}
		>
			<EditOutline class="me-2" tabindex="-1" /> Save Draft
		</Button>
		<Button
			disabled={data.posted}
			on:click={() => {
				if (data.posted) return;
				post();
			}}
		>
			<CaretRightSolid class="me-2" tabindex="-1" /> Post
		</Button>
	{/if}
</div>

<ConfirmationModal
	title="Delete event"
	bind:open={deleteModalOpen}
	on:confirm={async () => {
		const { errors } = await getApollo().mutate({
			mutation: Mutations.DELETE_EVENT,
			variables: {
				id: data.id
			},
			errorPolicy: "all"
		});

		if (errors && errors.length > 0) {
			pushNotification({
				type: "error",
				message: "Failed to delete event"
			});
			console.error(errors);
			return;
		}

		deleteModalOpen = false;
		goto("/events");
	}}
>
	<span>Are you sure you want to delete this event? Once deleted it cannot be undone.</span>
</ConfirmationModal>

<ConfirmationModal
	title="Archive event"
	bind:open={archiveModalOpen}
	on:confirm={async () => {
		const { errors } = await getApollo().mutate({
			mutation: Mutations.ARCHIVE_EVENT,
			variables: {
				id: data.id
			},
			errorPolicy: "all"
		});

		if (errors && errors.length > 0) {
			pushNotification({
				type: "error",
				message: "Failed to archive event"
			});
			console.error(errors);
			return;
		}

		archiveModalOpen = false;
		await invalidate("app:currentevent");
	}}
>
	<p>Are you sure you want to archive this event?</p>
	{#if !data.endedAt}
		<p>This event has not been ended, archiving the event will end the event.</p>
	{/if}
</ConfirmationModal>
