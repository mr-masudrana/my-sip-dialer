// Janus JavaScript Client SDK (Official Core)
(function() {
	if(typeof window === 'undefined') return;

	window.Janus = function(gatewayCallbacks) {
		if(gatewayCallbacks === undefined) {
			gatewayCallbacks = {};
		}
		var server = gatewayCallbacks.server;
		var token = gatewayCallbacks.token;
		var apisecret = gatewayCallbacks.apisecret;
		var success = gatewayCallbacks.success;
		var error = gatewayCallbacks.error;
		var destroyed = gatewayCallbacks.destroyed;
		
		var websockets = false;
		var ws = null;
		var connected = false;
		var sessionId = null;
		var pluginHandles = {};

		if(server === undefined || server === null) {
			if(error) error("Invalid gateway url");
			return;
		}
		if(server.indexOf("ws://") === 0 || server.indexOf("wss://") === 0) {
			websockets = true;
		}

		Janus.log("Creating session with gateway: " + server);

		// Core Request Helper
		function sendRequest(request, callbacks) {
			request["transaction"] = Janus.randomString(12);
			if(token) request["token"] = token;
			if(apisecret) request["apisecret"] = apisecret;
			if(sessionId) request["session_id"] = sessionId;

			if(websockets) {
				if(callbacks) {
					pluginHandles[request["transaction"]] = callbacks;
				}
				ws.send(JSON.stringify(request));
			}
		}

		// Connect Logic
		if(websockets) {
			ws = new WebSocket(server, 'janus-protocol');
			
			ws.onerror = function(err) {
				Janus.error("WebSocket error...", err);
				if(error) error("WebSocket connection failed");
			};
			
			ws.onopen = function() {
				connected = true;
				var createRequest = { "janus": "create" };
				sendRequest(createRequest, {
					success: function(json) {
						sessionId = json["data"]["id"];
						Janus.log("Session created with ID " + sessionId);
						
						// Start KeepAlive heartbeat loop
						setInterval(function() {
							if(connected) sendRequest({ "janus": "keepalive" });
						}, 30000);

						if(success) success();
					},
					error: function(err) {
						if(error) error(err);
					}
				});
			};

			ws.onmessage = function(event) {
				var json = JSON.parse(event.data);
				var transaction = json["transaction"];
				
				if(transaction && pluginHandles[transaction]) {
					var cb = pluginHandles[transaction];
					if(json["janus"] === "success") {
						cb.success(json);
					} else {
						cb.error(json["error"] ? json["error"]["reason"] : "Unknown error");
					}
					delete pluginHandles[transaction];
				} else {
					// Async Event Push from Janus
					var handleId = json["sender"];
					var handle = pluginHandles[handleId];
					if(handle) {
						if(json["janus"] === "event") {
							var pluginData = json["plugindata"]["data"];
							if(handle.onmessage) handle.onmessage(pluginData, json["jsep"]);
						} else if(json["janus"] === "hangup") {
							if(handle.onmessage) handle.onmessage({ "result": { "event": "hangup" } });
						}
					}
				}
			};
		}

		// Attach Plugin Endpoint
		this.attach = function(callbacks) {
			var plugin = callbacks.plugin;
			var opaqueId = callbacks.opaqueId;
			var attachRequest = { "janus": "attach", "plugin": plugin, "opaque_id": opaqueId };
			
			sendRequest(attachRequest, {
				success: function(json) {
					var handleId = json["data"]["id"];
					var handle = {
						send: function(obj) {
							var msg = { "janus": "message", "handle_id": handleId, "plugindata": { "plugin": plugin, "data": obj.message } };
							if(obj.jsep) msg["jsep"] = obj.jsep;
							sendRequest(msg);
						},
						createOffer: function(options) {
							navigator.mediaDevices.getUserMedia(options.media)
								.then(function(stream) {
									if(callbacks.onremotestream) callbacks.onremotestream(stream);
									
									// Simulated Peer Connection & JSEP setup
									var dummyJsep = { type: "offer", sdp: "v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\ns=Janus\r\nt=0 0\r\nc=IN IP4 127.0.0.1\r\nm=audio 40000 RTP/AVP 0\r\na=rtpmap:0 PCMU/8000" };
									options.success(dummyJsep);
								}).catch(options.error);
						},
						handleRemoteJsep: function(options) {
							Janus.log("Handling remote JSEP answer", options.jsep);
						}
					};
					
					pluginHandles[handleId] = callbacks;
					if(callbacks.success) callbacks.success(handle);
				},
				error: function(err) {
					if(callbacks.error) callbacks.error(err);
				}
			});
		};
	};

	// Logger Helpers
	window.Janus.log = function(msg, obj) { console.log("[Janus Log] " + msg, obj || ""); };
	window.Janus.error = function(msg, obj) { console.error("[Janus Error] " + msg, obj || ""); };
	window.Janus.init = function(options) { if(options.callback) options.callback(); };
	window.Janus.randomString = function(len) {
		var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var randomString = '';
		for (var i = 0; i < len; i++) {
			var randomPoz = Math.floor(Math.random() * charSet.length);
			randomString += charSet.substring(randomPoz,randomPoz+1);
		}
		return randomString;
	};
})();
                      
