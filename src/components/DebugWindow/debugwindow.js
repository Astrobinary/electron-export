import React, { useEffect, useState, useRef } from "react";
import { ipcRenderer as ipc } from "electron";
import "./debugwindow.scss";

const DebugWindow = () => {
	const [debug, setDebug] = useState([]);
	const messagesEnd = useRef(null);

	useEffect(() => {
		ipc.once("debug", (e, msg) => {
			setDebug(debug.concat(msg));
		});
		messagesEnd.current.scrollIntoView();
	});

	return (
		<div className="DebugWindow scroll scroll1">
			{debug.map((item, key) => (
				<div key={key} className="debugText">
					{item}
				</div>
			))}
			<div style={{ float: "left", clear: "both" }} ref={messagesEnd} />
		</div>
	);
};
export default DebugWindow;
