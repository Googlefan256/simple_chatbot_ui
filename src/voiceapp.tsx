import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChatHistory } from "./api";
import { Settings } from "./settings-hook";
import { createStream } from "./api";
import { ChatPiece } from "./textapp";
import removeMd from "remove-markdown";

function useSound() {
	const [sound, setSound] = useState<{
		record: SpeechRecognition;
		speech: SpeechSynthesis;
	}>();
	useEffect(() => {
		const sr = window.webkitSpeechRecognition ?? window.SpeechRecognition;
		const speech = window.speechSynthesis;
		if (!sr) return;
		if (!speech) return;
		setSound({
			record: new sr(),
			speech,
		});
	}, []);
	return sound;
}

export function VoiceApp({
	history,
	setHistory,
	settings,
}: {
	history: ChatHistory[];
	setHistory: Dispatch<SetStateAction<ChatHistory[]>>;
	settings: Settings;
}) {
	const sound = useSound();
	async function chat() {
		if (!sound) return;
		sound.record.start();
		const content = await new Promise<string | undefined>((resolve) => {
			const okListener = (event: SpeechRecognitionEvent) => {
				sound.record.removeEventListener("result", okListener);
				sound.record.removeEventListener("error", ngListener);
				sound.record.removeEventListener("nomatch", ngListener);
				resolve(event.results[0][0].transcript);
			};
			const ngListener = (_event: any) => {
				sound.record.removeEventListener("result", okListener);
				sound.record.removeEventListener("error", ngListener);
				sound.record.removeEventListener("nomatch", ngListener);
				resolve(undefined);
			};
			sound.record.addEventListener("result", okListener);
			sound.record.addEventListener("error", ngListener);
			sound.record.addEventListener("nomatch", ngListener);
		});
		if (!content) return;
		const stream = await createStream(
			settings.api_base_url,
			[
				...history,
				{
					role: "user",
					content,
				},
			],
			settings.seed,
			settings.system_prompt,
			settings.tokens,
		);
		let resText = "";
		for await (const response of stream) {
			const part = response.choices[0].delta.content;
			if (part) {
				resText += part;
			}
		}
		const run = new SpeechSynthesisUtterance(removeMd(resText));
		run.rate = 3;
		run.voice =
			sound.speech.getVoices().find((x) => x.name == "Google 日本語") ||
			sound.speech.getVoices()[0];
		sound.speech.speak(run);
		await new Promise((resolve) => {
			const end = (_event: any) => {
				run.removeEventListener("end", end);
				run.removeEventListener("error", end);
				resolve(undefined);
			};
			run.addEventListener("end", end);
			run.addEventListener("error", end);
		});
		setHistory((history) => [
			...history,
			{
				role: "user",
				content,
			},
			{
				role: "assistant",
				content: resText,
			},
		]);
	}
	const [isChat, setIsChat] = useState(false);
	return (
		<div className="p-4 max-w-md mx-auto">
			<div
				className={`shadow-md rounded-lg p-6 ${settings.dark ? "shadow-white" : "shadow-dark"}`}
			>
				<h2 className="text-2xl font-bold mb-4">Voice Chat</h2>
				<button
					onClick={() => {
						setIsChat(true);
						chat()
							.then(() => setIsChat(false))
							.catch(() => setIsChat(false));
					}}
					disabled={isChat}
					className="w-full bg-blue-500 py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
				>
					{isChat ? "Chatting..." : "Start Chat"}
				</button>
				<div className="mt-6">
					<h3 className="text-lg font-semibold mb-2">Chat History:</h3>
					<div className="space-y-2">
						{history.map((entry, index) => (
							<ChatPiece
								role={entry.role}
								content={entry.content}
								set={undefined}
								key={index}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
