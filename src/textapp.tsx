import { Dispatch, SetStateAction, useRef, useState } from "react";
import { ChatHistory, createStream } from "./api";
import { Settings } from "./settings-hook";
import TextareaAutosize from "react-textarea-autosize";
import { Editable } from "./editable";

export function ChatPiece({
	role,
	content,
	image,
	set,
}: ChatHistory & {
	set: ((value: string) => void) | undefined;
}) {
	return (
		<div className="p-2 border border-gray-300 rounded-md my-2 w-full">
			<p className="text-sm font-semibold">
				{role === "user" ? "You" : "Assistant"}
			</p>
			{image && <img src={image} alt="user image" className="w-24 h-24" />}
			{set ? (
				<Editable content={content} set={set} />
			) : (
				// fold long text
				<div className="whitespace-pre-wrap break-words">{content}</div>
			)}
		</div>
	);
}

export function TextApp({
	history,
	setHistory,
	settings,
}: {
	history: ChatHistory[];
	setHistory: Dispatch<SetStateAction<ChatHistory[]>>;
	settings: Settings;
}) {
	const [userPrompt, setUserPrompt] = useState<string | null>(null);
	const [userImage, setUserImage] = useState<string | null>(null);
	const [responseStream, setResponseStream] = useState<string | null>(null);
	const [speedInfo, setSpeedInfo] = useState<{
		count: number;
		time: number;
	} | null>(null);
	const [cancel, setCancel] = useState(() => () => {});
	const submitRef = useRef<HTMLButtonElement | null>(null);
	const imageSelectRef = useRef<HTMLInputElement | null>(null);
	return (
		<>
			{history.map((chat, index) => (
				<ChatPiece
					key={index}
					{...chat}
					set={(v) => {
						setHistory((history) => {
							const newHistory = history.slice();
							newHistory[index] = { ...newHistory[index], content: v };
							return newHistory;
						});
					}}
				/>
			))}
			{responseStream && (
				<ChatPiece role="assistant" content={responseStream} set={undefined} />
			)}
			{userImage && (
				<img src={userImage} alt="user image" className="w-24 h-24" />
			)}
			<TextareaAutosize
				minRows={2}
				placeholder="Type your message here..."
				onChange={(e) => setUserPrompt(e.target.value)}
				onDrop={(e) => {
					e.preventDefault();
					const file = e.dataTransfer.files?.[0];
					if (!file) return;
					const reader = new FileReader();
					reader.onload = (e) => {
						setUserImage(e.target?.result as string);
					};
					reader.readAsDataURL(file);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.ctrlKey) {
						e.preventDefault();
						e.stopPropagation();
						e.currentTarget?.blur();
						submitRef.current?.click();
						const event = new KeyboardEvent("keydown", {
							key: "Enter",
						});
						e.target.dispatchEvent(event);
					}
				}}
				value={userPrompt || ""}
				className={`border border-gray-300 rounded-md w-full mt-1 ${
					settings.dark ? "bg-gray-800 text-white" : ""
				} resize-y`}
			/>
			<input
				type="file"
				accept="image/*"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					const reader = new FileReader();
					reader.onload = (e) => {
						setUserImage(e.target?.result as string);
					};
					reader.readAsDataURL(file);
				}}
				className="hidden"
				ref={imageSelectRef}
			/>
			<p>
				<kbd
					className={`${
						settings.dark ? "bg-gray-800 text-white" : "bg-gray-200"
					} px-1 rounded-md`}
				>
					Ctrl
				</kbd>{" "}
				+{" "}
				<kbd
					className={`${
						settings.dark ? "bg-gray-800 text-white" : "bg-gray-200"
					} px-1 rounded-md`}
				>
					Enter
				</kbd>{" "}
				to send
			</p>
			{speedInfo && (
				<p className="text-sm text-gray-500">
					Last response took {speedInfo.time.toFixed(2)} seconds and{" "}
					{speedInfo.count} tokens, speed:{" "}
					{(speedInfo.count / speedInfo.time).toFixed(2)} tokens/second
				</p>
			)}
			<div className="flex justify-center mt-2">
				<button
					ref={submitRef}
					onClick={async () => {
						if (!userPrompt) return;
						if (responseStream) return;
						setUserImage(null);
						setUserPrompt(null);
						setResponseStream("...");
						setHistory((history) => [
							...history,
							{
								role: "user",
								content: userPrompt,
								image: userImage || undefined,
							},
						]);
						const startTime = Date.now();
						let tokens = 0;
						let resText = "";
						const stream = await createStream(
							settings.api_base_url,
							[
								...history,
								{
									role: "user",
									content: userPrompt,
									image: userImage || undefined,
								},
							],
							settings.seed,
							settings.system_prompt,
							settings.tokens,
						);
						setCancel(() => () => {
							stream?.controller.abort();
							setResponseStream(() => null);
						});
						for await (const response of stream) {
							const part = response.choices[0].delta.content;
							if (part) {
								tokens++;
								resText += part;
								setResponseStream(resText);
							}
						}
						setResponseStream(null);
						setHistory((history) => [
							...history,
							{ role: "assistant", content: resText },
						]);
						setSpeedInfo({
							count: tokens,
							time: (Date.now() - startTime) / 1000,
						});
					}}
					disabled={responseStream !== null}
					className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
				>
					Send
				</button>
				<button
					onClick={() => {
						if (responseStream !== null) return;
						setHistory([]);
						setSpeedInfo(null);
						setUserImage(null);
					}}
					disabled={responseStream !== null}
					className="bg-red-500 text-white px-4 py-2 rounded-md ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
				>
					Clear Chat
				</button>
				<button
					onClick={responseStream ? cancel : () => {}}
					disabled={!responseStream}
					className="bg-yellow-500 text-white px-4 py-2 rounded-md ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
				>
					Cancel Generation
				</button>
				<button
					onClick={() =>
						responseStream ? null : imageSelectRef.current?.click()
					}
					className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
					disabled={responseStream !== null}
				>
					Upload Image
				</button>
			</div>
		</>
	);
}
