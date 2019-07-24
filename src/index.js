import React from "react";
import ReactDOM from "react-dom";
import logo from "./logo.svg";
import "./global.scss";

const App = () => {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
			</header>
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
