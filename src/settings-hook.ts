import { useEffect, useState } from "react";

export type Mode = "text" | "voice";

export const mode: Mode[] = ["text", "voice"];

export interface Settings {
	api_base_url: string;
	seed: number;
	dark: boolean;
	system_prompt: string;
	mode: Mode;
	tokens: number;
}

function defaultSettings(): Settings {
	return {
		api_base_url: "http://localhost:8080",
		seed: 1234,
		dark: false,
		system_prompt: "",
		mode: "text",
		tokens: -1,
	};
}

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(defaultSettings);
	const [initialised, setInitialised] = useState(false);
	useEffect(() => {
		const stored = localStorage.getItem("settings");
		if (stored) {
			setSettings({
				...defaultSettings(),
				...JSON.parse(stored),
			});
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
