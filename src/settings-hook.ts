import { useEffect, useState } from "react";

export interface Settings {
	api_base_url: string;
	seed: number;
	dark: boolean;
}

function defaultSettings(): Settings {
	return {
		api_base_url: "http://googlechrome:8888",
		seed: 1234,
		dark: false,
	};
}

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
