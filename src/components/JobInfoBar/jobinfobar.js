import React from "react";
import "./jobinfobar.scss";
import { remote, shell } from "electron";
import { MdFolderOpen } from "react-icons/md";
import { GiProcessor } from "react-icons/gi";

const JobInfoBar = () => {
	const openJobFolder = () => {
		shell.openItem(remote.getGlobal("jobFolderLocation"));
	};
	const openConfigFile = () => {
		shell.openItem(remote.getGlobal("jobFolderLocation") + "/config.json");
	};

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
