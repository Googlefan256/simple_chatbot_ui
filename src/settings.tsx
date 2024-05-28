import { useEffect, useState } from "react";

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [initialised, setInitialised] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem("settings");
		if (stored) {
			setSettings(JSON.parse(stored));
		}
        setInitialised(true);
	}, []);
	useEffect(() => {
        if (!initialised) {
            return;
        }
		localStorage.setItem("settings", JSON.stringify(settings));
	}, [settings, initialised]);
	function reset() {
		localStorage.removeItem("settings");
		setSettings(defaultSettings);
	}

	return [settings, setSettings, reset] as const;
}

export function SettingsWindow({
	open,
	onClose,
	settings,
	setSettings,
	reset,
}: {
	open: boolean;
	onClose: () => void;
	settings: Settings;
	setSettings: (settings: Settings) => void;
	reset: () => void;
}) {
	return (
		<div
			className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
				open ? "" : "hidden"
			} ${settings.dark ? "text-white" : ""}`}
			onClick={onClose}
		>
			<div
				className={`p-4 rounded-md ${
					settings.dark ? "text-white bg-gray-900" : "bg-white"
				}`}
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
						className={`border border-gray-300 rounded-md w-full p-2 mt-1 ${
							settings.dark ? "bg-gray-800 text-white" : ""
						}`}
					/>
				</label>
				<label className="block mt-2">
					<span className="text-sm font-semibold">Seed</span>
					<input
						type="number"
						value={settings.seed}
						onChange={(e) =>
							setSettings({
								...settings,
								seed: parseInt(e.target.value),
							})
						}
						className={`border border-gray-300 rounded-md w-full p-2 mt-1 ${
							settings.dark ? "bg-gray-800 text-white" : ""
						}`}
					/>
				</label>
				<label className="block mt-2">
					<span className="text-sm font-semibold">Dark Theme</span>
					<br />
					<input
						type="checkbox"
						checked={settings.dark}
						onChange={(e) =>
							setSettings({
								...settings,
								dark: e.target.checked,
							})
						}
						className="w-4 h-4 m-2"
					/>
				</label>
				<div className="flex justify-center">
					<button
						onClick={reset}
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

export interface Settings {
	api_base_url: string;
	seed: number;
	dark: boolean;
}

export function defaultSettings(): Settings {
	return {
		api_base_url: "http://googlechrome:8888",
		seed: 1234,
		dark: false,
	};
}
