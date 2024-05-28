function decSafe(dec: TextDecoder, value: Uint8Array) {
	try {
		return dec.decode(value);
	} catch (e) {
		return null;
	}
}

export async function* generate(
	base: string,
	chat: ChatHistory[],
	seed: number,
) {
	const stream = (
		await fetch(`${base}/stream?seed=${seed}`, {
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
	let stack = new Uint8Array();
	const dec = new TextDecoder(undefined, {
		fatal: true,
	});
	while (true) {
		const { done, value } = await stream.read();
		if (done) {
			break;
		}
		const v = decSafe(dec, new Uint8Array([...stack, ...value]));
		if (!v) {
			console.warn("Invalid UTF-8 sequence, adding to stack...");
			stack = new Uint8Array([...stack, ...value]);
			continue;
		}
		yield v;
	}
	if (stack.length > 0) {
		yield new TextDecoder().decode(stack);
	}
}

export interface ChatHistory {
	role: "user" | "assistant";
	content: string;
}
