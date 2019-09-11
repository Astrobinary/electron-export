import React from "react";
import { remote, shell } from "electron";
import isDev from "electron-is-dev";
import { MdFolderOpen } from "react-icons/md";
import { GiProcessor, GiLightThornyTriskelion } from "react-icons/gi";
import "./jobinfobar.scss";

const JobInfoBar = () => {

	const openSFPFolder = () => {
		shell.openItem(remote.getGlobal("jobLocation"));
	};

	const openJobFolder = () => {
		shell.openItem(remote.getGlobal("jobFolderLocation"));
	};
	const openConfigFile = () => {
		shell.openItem(remote.getGlobal("jobFolderLocation") + "/config.json");
	};

	return (
		<div className="JobInfoBar">
			<div className="jobNumber">{remote.getGlobal("jobNumber")}</div>

			{isDev ?<div className="btn-contain job sep" onClick={() => openSFPFolder()}>
				<div className="icon">
					<GiLightThornyTriskelion />
				</div>
				open SFP 
			</div> : null}

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
