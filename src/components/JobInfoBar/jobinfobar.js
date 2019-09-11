import React from "react";
import "./jobinfobar.scss";
import { remote } from "electron";
import { MdFolderOpen } from "react-icons/md";
import { GiProcessor } from "react-icons/gi";

const JobInfoBar = () => {
	const openJobFolder = () => {};
	const openConfigFile = () => {};

	return (
		<div className="JobInfoBar">
			<div className="jobNumber">{remote.getGlobal("jobNumber")}</div>

			<div className="btn-contain job sepL" onClick={() => openJobFolder()}>
				<div className="icon">
					<MdFolderOpen />
				</div>
				open job
			</div>

			<div className="btn-contain job" onClick={() => openConfigFile()}>
				<div className="icon">
					<GiProcessor />
				</div>
				view config
			</div>
		</div>
	);
};
export default JobInfoBar;
