import { dates, strings } from "@frcn/shared";
import { getLocations } from "@frcn/shared/locations";
import type { Event } from "@prisma/client";
import { type BaseMessageOptions, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client } from "discord.js";

import { $discord } from "../../services/discord";
import { $events } from "../../services/events";
import { PRIMARY_COLOR } from "../constants";
import { getLocationEmoji } from "../helpers";

export async function buildEventStartMessage(client: Client, event: Event, eventMessageLink: string) {
	const scheduledEndTime = Math.floor((event.startAt!.getTime() + event.duration!) / 1000);

	const embed = new EmbedBuilder()
		.setColor(PRIMARY_COLOR)
		.setTitle(`${event.name} - Event starting!`)
		.setDescription(`The event is now starting! Scheduled event end: <t:${scheduledEndTime}:R>`);

	{
		// location
		let value = "";
		if (event.location.length > 0) {
			const locations = getLocations(event.location);
			value = locations.map((loc) => `${getLocationEmoji(loc)} **${strings.toTitleCase(loc.name)}**`.trim()).join(" > ");
		} else {
			value = "Anywhere";
		}
	
		embed.addFields({
			name: "Location",
			value
		});
	}
	
	let vcLink = "";
	if (event.channelId) {
		const readyRoom = await $events.getEventChannelReadyRoom(event.channelId);
		const readyRoomChannel = readyRoom && await $discord.getChannel(client, readyRoom.discordId);

		if (readyRoomChannel) vcLink = readyRoomChannel.url;
	}
	
	const weblinkButton = new ButtonBuilder()
		.setLabel("See Details")
		.setURL(eventMessageLink)
		.setStyle(ButtonStyle.Link);
	
	const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
	buttonsRow.addComponents(weblinkButton);
	
	return {
		content: `@everyone ${vcLink}`,
		embeds: [embed],
		components: [buttonsRow]
	} satisfies BaseMessageOptions;
}

export function buildEventScheduledEndMessage(event: Event) {
	const embed = new EmbedBuilder()
		.setColor(PRIMARY_COLOR)
		.setTitle(`${event.name} - Scheduled end`)
		.setDescription("Reached the scheduled end of the event");

	const endButton = new ButtonBuilder()
		.setCustomId(`end-event-${event.id}`)
		.setLabel("End Event")
		.setStyle(ButtonStyle.Danger)
		.setDisabled(!!event.endedAt);
	
	const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
	buttonsRow.addComponents(endButton);
	
	return {
		embeds: [embed],
		components: [buttonsRow]
	} satisfies BaseMessageOptions;
}

export function buildEventEndedMessage(event: Event) {
	const embed = new EmbedBuilder()
		.setColor(PRIMARY_COLOR)
		.setTitle(`${event.name} - Event ended`)
		.addFields(
			{
				name: "Total Duration",
				value: dates.toDuration(event.endedAt!.getTime() - event.startAt!.getTime())
			}
		);

	const archiveButton = new ButtonBuilder()
		.setCustomId(`archive-event-${event.id}`)
		.setEmoji("🗃️")
		.setLabel("Archive Event")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(event.archived);
	
	const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
	buttonsRow.addComponents(archiveButton);
	
	return {
		embeds: [embed],
		components: [buttonsRow]
	} satisfies BaseMessageOptions;
}

export async function postEventEndMessage(client: Client, event: Event) {
	if (!event.posted) return;
	
	const thread = await $events.getEventThread(event, client);

	const payload = buildEventEndedMessage(event);
	if (!payload) throw new Error("Failed to build event end message");
	await thread.send(payload);
}