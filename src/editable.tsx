import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

export function Editable({
	content,
	set,
}: {
	content: string;
	set: (v: string) => void;
}) {
	const [contentStable, setContentStable] = useState("");
	const [hover, setHover] = useState(false);
	useEffect(() => {
		setContentStable(content);
		// this is because we just need to set the contentStable once
	}, []);
	return (
		<span>
			<div
				className="whitespace-pre-wrap outline-none"
				contentEditable={true}
				suppressContentEditableWarning
				onKeyUpCapture={(t) => {
					set(t.currentTarget.textContent || "");
				}}
				onFocus={() => {
					setHover(true);
				}}
				onBlur={() => {
					setHover(false);
				}}
			>
				{contentStable}
				{!hover && <FaEdit className="inline-block ml-2" />}
			</div>
		</span>
	);
}
