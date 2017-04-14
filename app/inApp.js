const remote = require('electron').remote;

window.onload = function () {
	document.getElementById("close").addEventListener("click", function (e) {
		var window = remote.getCurrentWindow();
		window.close();
	});
		
	function getParams(parameters) {
		//var window = remote.getCurrentWindow();
		//if (parameters !== "" && parameters !== undefined && parameters.search(new RegExp(",")) !== false && parameters.search(new RegExp('//')) !== false && parameters.search(new RegExp("%")) !== false) {
			parameters = parameters.replace("$", "&");
			parameters = parameters.replace("$", "&");
			parameters = parameters.replace("$", "&");
			parameters = parameters.split(",");
			parameters = parameters[1] + parameters[2];
			parameters = parameters.replace("absence:\\\\", "");			
			parameters = parameters.split("%");
		//} else {
		//	alert("Ongeldig verzoek");
		//	window.close();
		//}

		return {
			'qrCode': parameters[0],
			'userId': parameters[1],
			'token': parameters[2],
			'classId': parameters[3]
		};
	}
	
	var parameters = getParams(remote.process.argv + "");
	document.getElementsByTagName("img")[0].src = parameters.qrCode;
};

