const remote = require('electron').remote;
const shell = require('electron').shell;
const domain = "http://absence.innovatewebdesign.nl/";

window.onload = function () {
	// Close button
	document.getElementById("close").addEventListener("click", function (e) {
		var window = remote.getCurrentWindow();
		window.close();
	});
	
	// Open EULA in browser
	document.getElementsByTagName("a")[0].addEventListener("click", function (e) {
		shell.openExternal(domain + "EULA");
	});
	
	// Deleting previous session
	window.localStorage.setItem("present", -1);
	window.localStorage.setItem("toLate", -1);
	window.localStorage.setItem("absent", -1);
		
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
		document.getElementsByTagName("img")[0].classList.remove("hide");
		
		// Get presence/late/absence every 1/1000st of a second
		setInterval(function(){
			var userId = parameters.userId;
			var token = parameters.token;
			var classId = parameters.classId;
			var url = domain + "api/desktopClient.php";
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
							'absent': -1,
							'finished': "notDone"
						};
					}
				} else {
					response = {
						'present': -1,
						'toLate': -1,
						'absent': -1,
						'finished': "notDone"
					};
				}
				
				var stored = parseInt(window.localStorage.getItem("present"));
				var present = parseInt(response.present);
				
				if (stored !== -1) {
					if (present !== -1 && stored !== present) {
						window.localStorage.setItem("present", present);
						document.getElementById("presentCount").innerHTML = present;
					}
				} else {
					if (present !== -1) {
						window.localStorage.setItem("present", present);
						document.getElementById("presentCount").innerHTML = present;
					} else {
						window.localStorage.setItem("present", 0);
						document.getElementById("presentCount").innerHTML = 0;
					}
				}
				
				stored = parseInt(window.localStorage.getItem("toLate"));
				var toLate = parseInt(response.toLate);
				
				if (stored !== -1) {
					if (toLate !== -1 && stored !== toLate) {
						window.localStorage.setItem("toLate", toLate);
						document.getElementById("lateCount").innerHTML = toLate;
					}
				} else {
					if (toLate !== -1) {
						window.localStorage.setItem("toLate", toLate);
						document.getElementById("lateCount").innerHTML = toLate;
					} else {
						window.localStorage.setItem("toLate", 0);
						document.getElementById("lateCount").innerHTML = 0;
					}
				}
				
				stored = parseInt(window.localStorage.getItem("absent"));
				var absent = parseInt(response.absent);
				
				if (stored !== -1) {
					if (absent !== -1 && stored !== absent) {
						window.localStorage.setItem("absent", absent);
						document.getElementById("absentCount").innerHTML = absent;
					}
				} else {
					if (absent !== -1) {
						window.localStorage.setItem("absent", absent);
						document.getElementById("absentCount").innerHTML = absent;
					} else {
						window.localStorage.setItem("absent", 0);
						document.getElementById("absentCount").innerHTML = 0;
					}
				}
				
				if (response.finished !== "notDone") {
					document.getElementById("content").classList.add("hover");
				} else {
					document.getElementById("content").classList.remove("hover");
				}
			};
			http.send(params);
		}, 500);
	};
};

