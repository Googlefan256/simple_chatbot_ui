import { OpenAI } from "openai";

export async function createStream(
	baseURL: string,
	chat: ChatHistory[],
	seed: number,
) {
	const stream = await new OpenAI({ baseURL }).chat.completions.create({
		messages: chat,
		model: "custom",
		stream: true,
		seed,
	});
	return stream;
}

export interface ChatHistory {
	role: "user" | "assistant";
	content: string;
	image?: string;
}
