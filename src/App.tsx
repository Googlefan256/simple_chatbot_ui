import { useState } from "react";
import { ChatHistory, generate } from "./api";
import { MdSettings } from "react-icons/md";

function ChatPiece({ role, content }: ChatHistory) {
	return (
		<div className="p-2 border border-gray-300 rounded-md my-2 w-full">
			<p className="text-sm font-semibold">
				{role === "user" ? "You" : "Assistant"}
			</p>
			{
				content.split("\n").map((line, index) => (
					<p key={index} className="text-base">
						{line}
					</p>
				))
			}
		</div>
	);
}

interface Settings {
	api_base_url: string;
}

function defaultSettings(): Settings {
	return {
		api_base_url: "http://googlechrome:8888",
	};
}

function SettingsWindow({
	open,
	onClose,
	settings,
	setSettings,
}: {
	open: boolean;
	onClose: () => void;
	settings: Settings;
	setSettings: (settings: Settings) => void;
}) {
	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
				open ? "" : "hidden"
			}`}
			onClick={onClose}
		>
			<div
				className="bg-white p-4 rounded-md"
				onClick={(e) => e.stopPropagation()}
			>
				<h1 className="text-xl font-semibold mb-2">Settings</h1>
				<label className="block">
					<span className="text-sm font-semibold">API Base URL</span>
					<input
						type="text"
						value={settings.api_base_url}
						onChange={(e) =>
							setSettings({
								...settings,
								api_base_url: e.target.value,
							})
						}
						className="border border-gray-300 rounded-md w-full p-2 mt-1"
					/>
				</label>
				<div className="flex justify-center">
					<button
						onClick={() => setSettings(defaultSettings())}
						className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
					>
						Reset to default
					</button>
					<button
						onClick={onClose}
						className="bg-red-500 text-white px-4 py-2 ml-2 rounded-md mt-2"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

function App() {
	const [history, setHistory] = useState<ChatHistory[]>([]);
	const [userPrompt, setUserPrompt] = useState<string | null>(null);
	const [responseStream, setResponseStream] = useState<string | null>(null);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [settings, setSettings] = useState<Settings>(defaultSettings());
	return (
		<>
			<SettingsWindow
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				settings={settings}
				setSettings={setSettings}
			/>
			<div className="md:p-8 p-4">
				<div className="flex justify-between">
					<h1 className="text-2xl font-semibold mb-4">Simple Chatbot UI</h1>
					<div className="flex items-center">
						<MdSettings
							className="text-2xl hover:text-blue-500 cursor-pointer"
							onClick={() => setSettingsOpen(!settingsOpen)}
						/>
					</div>
				</div>
				{history.map((chat, index) => (
					<ChatPiece key={index} {...chat} />
				))}
				{responseStream && (
					<ChatPiece role="assistant" content={responseStream} />
				)}
				<textarea
					onChange={(e) => setUserPrompt(e.target.value)}
					value={userPrompt || ""}
					className="border border-gray-300 rounded-md w-full mb-2 mt-1"
				/>
				<div className="flex justify-center">
					<button
						onClick={async () => {
							if (!userPrompt) return;
							if (responseStream) return;
							setUserPrompt(null);
							setResponseStream("...");
							setHistory((history) => [
								...history,
								{ role: "user", content: userPrompt },
							]);
							let resText = "";
							for await (const response of generate(settings.api_base_url, [
								...history,
								{ role: "user", content: userPrompt },
							])) {
								resText += response;
								setResponseStream(resText);
							}
							setResponseStream(null);
							setHistory((history) => [
								...history,
								{ role: "assistant", content: resText },
							]);
						}}
						disabled={responseStream !== null}
						className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
					>
						Send
					</button>
					<button
						onClick={() => {
							if (responseStream === null) setHistory([]);
						}}
						disabled={responseStream !== null}
						className="bg-red-500 text-white px-4 py-2 rounded-md ml-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
					>
						Clear Chat
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
