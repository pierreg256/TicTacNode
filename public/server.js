HOST = '127.0.0.1'; // localhost
PORT = 8001;

// when the daemon started
var starttime = (new Date()).getTime();

var fu = require("./fu"),
    sys = require("sys"),
    url = require("url"),
    qs = require("querystring");

var MESSAGE_BACKLOG = 200,
    SESSION_TIMEOUT = 60 * 1000;

	var channel = new function () {
	  var messages = [],
	      callbacks = [];

	  this.appendMessage = function (to, nick, type, text) {
	    var m = { to: to
		        , nick: nick
	            , type: type // "msg", "join", "part"
	            , text: text
	            , timestamp: (new Date()).getTime()
	            };

		console.log("Message (" + type + ") from " + nick + " to " + to + ": " + text);

	    messages.push( m );

	    while (callbacks.length > 0) {
	      callbacks.shift().callback([m]);
	    }

	    while (messages.length > MESSAGE_BACKLOG)
	      messages.shift();
	  };

	  this.query = function (since, id, callback) {
	    var matching = [];
	    for (var i = 0; i < messages.length; i++) {
	      var message = messages[i];
	      if (message.timestamp > since && (message.to == id))
	        matching.push(message);
	      else
  	        if (message.timestamp > since && (message.to == "ALL"))
 	          matching.push(message);
	    }

	    if (matching.length != 0) {
	      callback(matching);
	    } else {
	      callbacks.push({ timestamp: new Date(), callback: callback });
	    }
	  };

	  // clear old callbacks
	  // they can hang around for at most 30 seconds.
	  setInterval(function () {
	    var now = new Date();
	    while (callbacks.length > 0 && now - callbacks[0].timestamp > 30*1000) {
	      callbacks.shift().callback([]);
	    }
	  }, 3000);
	};


var sessions = {};

function createSession (nick,comp) 
{
   if (nick.length > 50) return null;
   if (/[^\w_\-^!]/.exec(nick)) return null;

   for (var i in sessions) {
	    var session = sessions[i];
	    if (session && session.nick === nick) return null;
	  }

	  var session = { 
	    nick: nick, 
	    id: Math.floor(Math.random()*99999999999).toString(),
	    timestamp: new Date(),
	    playing: false,
	    computer: comp ? comp : false,
	    last_message_time: 1,

	    poke: function () {
	      session.timestamp = new Date();
	    },

	    destroy: function () {
	      channel.appendMessage("ALL", session.nick, "part");
	      console.log(session.nick + ' left the game...');
	      delete sessions[session.id];
	    }
	  };

	  sessions[session.id] = session;
	  return session;
}
function handleComputerMessages(msgs)
{
	if (msgs)
	{
		for (var i=0;i<msgs.length;i++)
		{
			if (msgs[i].to != "ALL")
			   console.log("message to: " + msgs[i].to +" = " + msgs[i].text);
		}
	}
}
// interval to kill off old sessions
setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    if (now - session.timestamp > SESSION_TIMEOUT) {
      if (session.computer == false)
        session.destroy();
    }
  }

}, 1000);

fu.listen(Number(process.env.PORT || PORT), HOST);

console.log('Server running at http://'+HOST+':'+PORT+'/');

createSession("john", true);
createSession("Susie", true);
createSession("Mark", true);
createSession("Jennifer", true);

fu.get("/", fu.staticHandler("index.html"));
fu.get("/style.css", fu.staticHandler("style.css"));
fu.get("/client.js", fu.staticHandler("client.js"));
fu.get("/jquery-1.4.4.min.js", fu.staticHandler("jquery-1.4.4.min.js"));
fu.get("/filler.png", fu.staticHandler("filler.png"));
fu.get("/X.png", fu.staticHandler("X.png"));
fu.get("/O.png", fu.staticHandler("O.png"));
fu.get("/red.png", fu.staticHandler("red.png"));
fu.get("/green.png", fu.staticHandler("green.png"));
fu.get("/jquery-ui-1.8.6.custom.css", fu.staticHandler("jquery-ui-1.8.6.custom.css"))
fu.get("/jquery-ui-1.8.6.custom.min.js", fu.staticHandler("jquery-ui-1.8.6.custom.min.js"))
fu.get("/images/ui-bg_diagonals-thick_15_0b3e6f_40x40.png", fu.staticHandler("images/ui-bg_gloss-wave_20_111111_500x100.png"));
fu.get("/images/ui-bg_gloss-wave_20_111111_500x100.png", fu.staticHandler("images/ui-bg_gloss-wave_20_111111_500x100.png"));
fu.get("/images/ui-icons_9ccdfc_256x240.png", fu.staticHandler("images/ui-icons_9ccdfc_256x240.png"));
fu.get("/images/ui-bg_flat_0_aaaaaa_40x100.png", fu.staticHandler("images/ui-bg_flat_0_aaaaaa_40x100.png"));
fu.get("/images/ui-bg_dots-small_40_00498f_2x2.png", fu.staticHandler("images/ui-bg_dots-small_40_00498f_2x2.png"));
fu.get("/images/ui-icons_98d2fb_256x240.png", fu.staticHandler("images/ui-icons_98d2fb_256x240.png"));
fu.get("/images/ui-bg_dots-small_20_333333_2x2.png", fu.staticHandler("images/ui-bg_dots-small_20_333333_2x2.png"));
fu.get("/images/ui-bg_flat_40_292929_40x100.png", fu.staticHandler("/images/ui-bg_flat_40_292929_40x100.png"));

fu.get("/login", function (req, res) {
  var nick = qs.parse(url.parse(req.url).query).nick;
  if (nick == null || nick.length == 0) {
    res.simpleJSON(200, {error: "Bad nick."});
    return;
  }
  var session = createSession(nick);
  if (session == null) {
    res.simpleJSON(200, {error: "Nick in use"});
    return;
  }

  console.log("Created session for " + nick);

  channel.appendMessage("ALL", session.nick, "join");
  res.simpleJSON(200, { id: session.id
                      , nick: session.nick
                      //, rss: mem.rss
                      //, starttime: starttime
                      });
});

fu.get("/logout", function (req, res) {
  var id = qs.parse(url.parse(req.url).query).id;

  if (sessions && sessions[id] && (sessions[id].id == id))
  {
	sessions[id].destroy();
  }
  res.simpleJSON(200, { status: "OK"
                      });
});

fu.get("/recv", function (req, res) {
  if (!qs.parse(url.parse(req.url).query).since) {
    res.simpleJSON(400, { error: "Must supply since parameter" });
    return;
  }
  var id = qs.parse(url.parse(req.url).query).id;
  var session;
  if (id && sessions[id]) {
    session = sessions[id];
    session.poke();
  }

  var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);

  channel.query(since, id, function (messages) {
    if (session) session.poke();
    res.simpleJSON(200, { messages: messages });
  });
});

fu.get("/who", function (req, res) {
  var nicks = [];
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];
    nicks.push(session);
  }
  res.simpleJSON(200, { nicks: nicks
                      });
});

fu.get("/send", function (req, res) {
  if (!qs.parse(url.parse(req.url).query).from) {
    res.simpleJSON(400, { error: "Must supply from parameter" });
    return;
  }
  if (!qs.parse(url.parse(req.url).query).to) {
    res.simpleJSON(400, { error: "Must supply to parameter" });
    return;
  }
  if (!qs.parse(url.parse(req.url).query).type) {
    res.simpleJSON(400, { error: "Must supply type parameter" });
    return;
  }
  if (!qs.parse(url.parse(req.url).query).message) {
    res.simpleJSON(400, { error: "Must supply message parameter" });
    return;
  }
  var from = qs.parse(url.parse(req.url).query).from;
  var to = qs.parse(url.parse(req.url).query).to;
  var type = qs.parse(url.parse(req.url).query).type;
  var message = qs.parse(url.parse(req.url).query).message;

	console.log("message from:"+from+", to:"+to+", type:"+type+", message:"+message);
	
  var session = sessions[from];
  if (!session || !type) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }
  session.poke();

  var computerSession = sessions[to];
  if (!computerSession) {
    res.simpleJSON(400, { error: "No such session id" });
    return;
  }

  if (computerSession.computer == false)
  {
     channel.appendMessage(to, session.nick, type, message);
  }
  else
  {
    	switch (type)
        {
			case "play" : computerSession.playing = true;
			channel.appendMessage(from, computerSession.nick, "start", "<empty>");
			break;
			
			case "over" : computerSession.playing = false;
			channel.appendMessage("ALL", computerSession.nick, "join", "<empty>");
			break;
			
			case "move" : var availMoves = message.split("-");
			var move = Math.floor(Math.random()*(availMoves.length-1)) ;
			var cell = availMoves[move];
			console.log("length:" + availMoves.length + ", move: " + move);
			channel.appendMessage(from, computerSession.nick, "move", cell);
        }
  }
  
  res.simpleJSON(200, { ok: "ok" });
  
});


