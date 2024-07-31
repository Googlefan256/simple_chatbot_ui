import { OpenAI } from "openai";

export async function createStream(
	baseURL: string,
	chat: ChatHistory[],
	seed: number,
) {
	console.log("a");
	const stream = await new OpenAI({
		baseURL,
		apiKey: "null",
		dangerouslyAllowBrowser: true,
	}).chat.completions.create({
		messages: chat,
		model: "custom",
		stream: true,
		seed,
	});
	console.log(stream);
	return stream;
}

export interface ChatHistory {
	role: "user" | "assistant";
	content: string;
	image?: string;
}
