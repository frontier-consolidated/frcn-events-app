<script lang="ts">
	import { CMSContainerType, SectionContainer, type IndexContainer } from "@frcn/cms";
	import { Heading } from "flowbite-svelte";
	import { BookSolid, BuildingSolid, MapPinAltSolid, UsersSolid } from "flowbite-svelte-icons";

	import CallToActionRenderer from "$lib/cms/CallToActionRenderer.svelte";
	import { transformContainer } from "$lib/cms/transformContainer";
	import { Head, Hr, Markdown } from "$lib/components";
	import logo from "$lib/images/logo.png";
	import activitiesImage from "$lib/images/stock/activities.png?w=580&imagetools";
	import communityImage from "$lib/images/stock/community.png?w=580&imagetools";
	import metaImage from "$lib/images/stock/hero.png?w=1200&format=webp&imagetools";
	import heroImageSrcset from "$lib/images/stock/hero.png?w=500;900;1200;1600;2000&format=webp&as=srcset&imagetools";
	import orgImage from "$lib/images/stock/org.png?w=580&imagetools";
	import placeholder from "$lib/images/stock/placeholder.jpg";
	import resourcesImage from "$lib/images/stock/resources.png?w=580&imagetools";

	import type { PageData } from "./$types";

	export let data: PageData;
	$: index = data.index ? transformContainer<IndexContainer>(data.index) : null;
	$: welcomeSection = index?.findFirstChild("welcome")?.as<SectionContainer>();
	$: welcomeCtas = welcomeSection?.getChildrenOfType(CMSContainerType.CallToAction) ?? [];
	$: galleryImages =
		index
			?.findFirstChildOfType(CMSContainerType.Gallery)
			?.getFiles()
			.map((f) => f.getSrc())
			.filter((src): src is string => !!src) ?? [];

	const pageCards = [
		{ src: communityImage, name: "COMMUNITY", href: "/about/community", icon: UsersSolid },
		{ src: orgImage, name: "ORGANISATION", href: "/about/org", icon: BuildingSolid },
		{
			src: activitiesImage,
			name: "ACTIVITES",
			href: "/about/activities",
			icon: MapPinAltSolid
		},
		{ src: resourcesImage, name: "GUIDES & RESOURCES", href: "/resources", icon: BookSolid }
	];

	const partners = [
		// {
		// 	src: "https://www.teamspeak.com/user/themes/teamspeak/images/logo_inverse.svg",
		// 	href: "https://www.teamspeak.com/",
		// 	alt: "Teamspeak"
		// },
		// {
		// 	src: "https://robertsspaceindustries.com/media/6wlp3kdl35hz6r/logo/ANZIA-Logo.png",
		// 	href: "https://anziaracing.com/",
		// 	alt: "ANZIA Racing"
		// }
	];
</script>

<Head
	title={index?.getMetaTitle()}
	titleSide="right"
	description={index?.getMetaDescription()}
	image={metaImage}
	imageSize="large"
>
	<link rel="preload" imagesrcset={heroImageSrcset} imagesizes="100vw" as="image" />
	{#each galleryImages as image}
		<link rel="preload" href={image} as="image" />
	{/each}
</Head>

<div class="relative">
	<img
		srcset={heroImageSrcset}
		alt="index hero"
		class="w-full object-cover min-h-[25rem] h-[50vh] brightness-90 bg-slate-950"
	/>
	<div class="absolute top-0 left-0 h-full w-full flex items-center justify-center gap-12">
		<div class="flex items-center px-4 sm:px-0">
			<img
				src={logo}
				class="drop-shadow-md h-16 sm:h-24 md:h-32 mr-4"
				alt="Frontier Consolidated logo"
			/>
			<div class="drop-shadow-md self-stretch w-px bg-gray-300"></div>
			<h1
				class="drop-shadow-md ml-6 sm:ml-12 text-2xl min-[460px]:text-3xl sm:text-4xl md:text-5xl text-white font-medium"
				>Frontier Consolidated</h1
			>
		</div>
	</div>
</div>
<section
	class="relative p-4 pt-0 border-y border-primary-400 dark:border-primary-600 bg-neutral-200 dark:bg-gray-900"
>
	<div class="-mt-10 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mx-auto max-w-7xl">
		{#each pageCards as card}
			<a href={card.href} class="group/card relative rounded clip-tr-8">
				<figure class="h-36 min-[480px]:h-48 sm:h-60 cursor-pointer">
					<img
						class="clip-tr-8 rounded h-full w-full object-cover transition-[filter] group-hover/card:grayscale"
						src={card.src}
						alt={card.name}
					/>
					<figcaption
						class="absolute rounded-b flex items-center w-full bottom-0 left-0 p-2 sm:p-4 bg-white/50 dark:bg-black/30 backdrop-blur-lg text-gray-900 dark:text-white font-semibold text-md"
					>
						<svelte:component this={card.icon} size="sm" class="me-2" tabindex="-1" />
						{card.name}
					</figcaption>
				</figure>
			</a>
		{/each}
	</div>
	<div
		class="absolute -bottom-[2rem] left-0 clip-br-parallel-8 w-[20%] h-8 bg-primary-400 dark:bg-primary-600"
	></div>
	<div
		class="absolute -bottom-[2rem] right-0 clip-bl-parallel-8 w-[20%] h-8 bg-primary-400 dark:bg-primary-600"
	></div>
	<div
		class="absolute -bottom-[calc(2rem-1px)] left-0 clip-br-parallel-8 w-[calc(20%-1px)] h-8 bg-neutral-200 dark:bg-gray-900"
	></div>
	<div
		class="absolute -bottom-[calc(2rem-1px)] right-0 clip-bl-parallel-8 w-[calc(20%-1px)] h-8 bg-neutral-200 dark:bg-gray-900"
	></div>
</section>
<section class="w-full bg-white dark:bg-slate-950 bg-triangle-pattern px-4 py-16">
	<div class="mx-auto w-full max-w-5xl flex flex-col md:flex-row gap-2 md:gap-8">
		<div
			class="shrink-0 overflow-hidden rounded clip-tl-br-12 h-[500px] md:self-stretch w-full md:w-[350px] lg:w-[400px] p-px dark:bg-gray-700"
		>
			<img
				src={welcomeSection?.getFiles()[0]?.getSrc() ?? placeholder}
				alt="welcome to the frontier"
				class="h-full w-full object-cover clip-tl-br-12"
			/>
		</div>
		<div class="self-stretch flex flex-col p-6">
			<h2 class="text-3xl lg:text-4xl font-semibold text-black dark:text-white"
				><span class="me-4 text-primary-700 dark:text-primary-500">///</span>
				{welcomeSection?.getTitle() ?? ""}</h2
			>
			<div class="mt-6 flex flex-col gap-4 text-lg text-gray-800 dark:text-gray-300">
				<Markdown nowrap source={welcomeSection?.getContent() ?? ""} disabled={["space"]} />
			</div>
			{#if welcomeCtas.length > 0}
				<div class="flex-1 w-full pt-12 flex justify-center items-center gap-4">
					{#each welcomeCtas as cta}
						<CallToActionRenderer container={cta} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
{#if partners.length}
	<section
		class="border-y border-primary-400 dark:border-primary-600 bg-slate-300 dark:bg-gray-900 py-8"
	>
		<!-- <h2 class="text-center text-3xl font-medium text-primary-600 dark:text-gray-300">Our Partners</h2>
		<Marquee fade class="mt-8">
			{#each partners as partner}
				<a href={partner.href} class="shrink-0 rounded-lg h-32 w-32">
					<img src={partner.src} alt={partner.alt} class="w-full h-full object-contain" />
				</a>
			{/each}
		</Marquee> -->
	</section>
{/if}
<div class="mt-24 flex flex-col mx-auto w-full max-w-5xl p-4 pt-0 gap-24">
	<section>
		<Heading tag="h2" class="font-medium text-2xl">
			<span class="me-4 text-primary-700 dark:text-primary-500">///</span> Gallery
		</Heading>
		<Hr class="my-4 bg-primary-300 dark:bg-primary-600" />
		<div class="grid md:grid-cols-2 gap-4">
			<div class="grid gap-4 h-min">
				{#each galleryImages.slice(0, Math.ceil(galleryImages.length / 2)) as image}
					<div class="rounded clip-tr-8 p-px bg-gray-400 dark:bg-gray-800">
						<img
							src={image}
							alt=""
							class="w-full max-w-full clip-tr-8 rounded object-cover"
						/>
					</div>
				{/each}
			</div>
			<div class="grid gap-4 h-min">
				{#each galleryImages.slice(Math.ceil(galleryImages.length / 2)) as image}
					<div class="rounded clip-tr-8 p-px bg-gray-400 dark:bg-gray-800">
						<img
							src={image}
							alt=""
							class="w-full max-w-full clip-tr-8 rounded object-cover"
						/>
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>
