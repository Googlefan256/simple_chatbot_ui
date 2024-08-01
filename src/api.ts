import { OpenAI } from "openai";

export async function createStream(
	baseURL: string,
	chat: ChatHistory[],
	seed: number,
	system: string,
) {
	const stream = await new OpenAI({
		baseURL,
		apiKey: "null",
		dangerouslyAllowBrowser: true,
	}).chat.completions.create({
		messages: [
			...(system.length === 0
				? []
				: [
						{
							role: "system" as const,
							content: system,
						},
					]),
			...chat,
		],
		model: "custom",
		stream: true,
		seed,
		max_tokens: 4096,
	});
	return stream;
}

export interface ChatHistory {
	role: "user" | "assistant";
	content: string;
	image?: string;
}
