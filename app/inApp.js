const remote = require('electron').remote;

window.onload = function () {
	document.getElementById("close").addEventListener("click", function (e) {
		var window = remote.getCurrentWindow();
		window.close();
	});
	
};

