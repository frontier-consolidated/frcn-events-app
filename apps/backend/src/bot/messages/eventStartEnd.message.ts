import { dates } from "@frcn/shared";
import type { Event } from "@prisma/client";
import { type BaseMessageOptions, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client } from "discord.js";

import { $events } from "../../services/events";
import { PRIMARY_COLOR } from "../constants";

export function buildEventStartMessage(event: Event, eventMessageLink: string) {
	const scheduledEndTime = Math.floor((event.startAt!.getTime() + event.duration!) / 1000)

	const embed = new EmbedBuilder()
		.setColor(PRIMARY_COLOR)
		.setTitle(`${event.name} - Event starting!`)
		.setDescription(`The event is now starting! Scheduled event end: <t:${scheduledEndTime}:R>`)

	const joinButton = new ButtonBuilder()
		.setEmoji("🔊")
		.setLabel("Join Ready Room")
		.setURL(eventMessageLink)
		.setStyle(ButtonStyle.Link);
	
	const weblinkButton = new ButtonBuilder()
		.setLabel("See Details")
		.setURL(eventMessageLink)
		.setStyle(ButtonStyle.Link);
	
	const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
	buttonsRow.addComponents(weblinkButton);
	
	return {
		content: "@everyone",
		embeds: [embed],
		components: [buttonsRow]
	} satisfies BaseMessageOptions;
}

export function buildEventScheduledEndMessage(event: Event) {
	const embed = new EmbedBuilder()
		.setColor(PRIMARY_COLOR)
		.setTitle(`${event.name} - Scheduled end`)
		.setDescription("Reached the scheduled end of the event")

	const endButton = new ButtonBuilder()
		.setCustomId(`end-event-${event.id}`)
		.setLabel("End Event")
		.setStyle(ButtonStyle.Danger);
	
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
		)

	const archiveButton = new ButtonBuilder()
		.setCustomId(`archive-event-${event.id}`)
		.setEmoji("🗃️")
		.setLabel("Archive Event")
		.setStyle(ButtonStyle.Secondary);
	
	const buttonsRow = new ActionRowBuilder<ButtonBuilder>();
	buttonsRow.addComponents(archiveButton);
	
	return {
		embeds: [embed],
		components: [buttonsRow]
	} satisfies BaseMessageOptions;
}

export async function postEventEndMessage(client: Client, event: Event) {
	const thread = await $events.getEventThread(event, client)

	const payload = buildEventEndedMessage(event);
	if (!payload) throw new Error("Failed to build event end message")
	await thread.send(payload);
}