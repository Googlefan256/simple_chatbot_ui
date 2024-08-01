import { useState } from "react";
import { TextApp } from "./textapp";
import { ChatHistory } from "./api";
import { useSettings } from "./settings-hook";
import { SettingsWindow } from "./settings";
import { MdSettings } from "react-icons/md";
import { VoiceApp } from "./voiceapp";

function App() {
	const [history, setHistory] = useState<ChatHistory[]>([]);
	const [settings, setSettings, reset] = useSettings();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const InnerApp = settings.mode == "text" ? TextApp : VoiceApp;
	return (
		<div
			className={`min-h-screen ${settings.dark ? "bg-black text-white" : ""}`}
		>
			<SettingsWindow
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				settings={settings}
				setSettings={setSettings}
				reset={reset}
			/>
			<div className="md:p-8 p-4">
				<div className="flex justify-between">
					<h1
						className={`text-2xl font-semibold mb-4 ${
							settings.dark ? "text-white" : ""
						}`}
					>
						Simple Chatbot UI
					</h1>
					<div className="flex items-center">
						<MdSettings
							className="text-2xl hover:text-blue-500 cursor-pointer"
							onClick={() => setSettingsOpen(!settingsOpen)}
						/>
					</div>
				</div>
				<InnerApp
					history={history}
					setHistory={setHistory}
					settings={settings}
				/>
			</div>
		</div>
	);
}

export default App;
