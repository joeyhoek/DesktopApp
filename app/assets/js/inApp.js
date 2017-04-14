const remote = require('electron').remote;

window.onload = function () {
	// Close button
	document.getElementById("close").addEventListener("click", function (e) {
		var window = remote.getCurrentWindow();
		window.close();
	});
	
	// Deleting previous session
	window.localStorage.setItem("present", -1);
		
	// Getting QRCode and other code through custom http prototol (absence:\\)
	function getParams(parameters) {
		var window = remote.getCurrentWindow();
		if (parameters !== "" && parameters !== undefined && parameters.indexOf(",") >= 0) {
			parameters = parameters.replace("$", "&");
			parameters = parameters.split(",");
			parameters = parameters[1] + parameters[2];
			parameters = parameters.replace("absence:\\\\", "");			
			parameters = parameters.split("%");
			if (parameters.length !== 4) {
				alert("Invalid request: Open the app through the Absence WebApp");
				window.close();
			} else {
				return {
					'qrCode': parameters[0],
					'userId': parameters[1],
					'token': parameters[2],
					'classId': parameters[3]
				};
			}
		} else {
			alert("Invalid request: Open the app through the Absence WebApp");
			window.close();
		}
	}

	var parameters = getParams(remote.process.argv + "");
	var qrCode = new Image();
	qrCode.src = parameters.qrCode;
	qrCode.onload = function () {
		document.getElementsByTagName("img")[0].src = parameters.qrCode;
		
		setInterval(function(){
			var userId = parameters.userId;
			var token = parameters.token;
			var classId = parameters.classId;
			var url = "http://www.team16j.p004.nl/api/desktopClient.php";
			var http = new XMLHttpRequest();
			var params = "userId=" + userId + "&token=" + token + "&classId=" + classId;

			http.open("POST", url, true);
			http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			http.onreadystatechange = function() {
				var response;
				if(http.readyState == 4 && http.status == 200) {
					var textContent = http.responseText;
					http.abort();
					http = null;
					response = JSON.parse(textContent);
					
					if (response == false) {
						response = {
							'present': -1,
							'toLate': -1,
							'absent': -1
						};
					}
				} else {
					response = {
						'present': -1,
						'toLate': -1,
						'absent': -1
					};
				}
				
				var stored = parseInt(window.localStorage.getItem("present"));
				var present = parseInt(response.present);
				
				if (stored !== -1) {
					if (present !== -1 && stored !== present) {
						window.localStorage.setItem("present", present);
						alert("Present: " + present);
					}
				} else {
					if (present !== -1) {
						window.localStorage.setItem("present", present);
						alert("Present: " + present);
					} else {
						window.localStorage.setItem("present", 0);
						alert("Present: 0");
					}
				}
			};
			http.send(params);
		}, 1);
	};
};

