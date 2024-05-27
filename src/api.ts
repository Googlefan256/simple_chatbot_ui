export async function* generate(base: string, chat: ChatHistory[]) {
	const stream = (
		await fetch(`${base}/stream`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(chat),
		})
	).body?.getReader();
	if (!stream) {
		return;
	}
	while (true) {
		const { done, value } = await stream.read();
		if (done) {
			break;
		}
		const v = new TextDecoder().decode(value);
		yield v;
	}
}

export interface ChatHistory {
	role: "user" | "assistant";
	content: string;
}
