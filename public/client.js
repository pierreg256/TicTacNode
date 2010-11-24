var CONFIG = { debug: true
             , nick: "#"   // set in onConnect
             , id: null    // set in onConnect
             , last_message_time: 1
             , focus: true //event listeners bound in onConnect
             , game_started: false
			 , game_started_with: null,
             };


//game presentation methods
function showConnect()
{
	$("#game").hide('slow');
	$("#connect").show('slow');
}

function showGame()
{
	$("#game").show('slow');
	$("#connect").hide('slow');
}

//handle the server's response to our nickname and join request
function onConnect (session) {
  if (session.error) {
    alert("error connecting: " + session.error);
    showConnect();
    return;
  }
  CONFIG.nick=session.nick;
  CONFIG.id=session.id;
  $("#log table").remove();
  who();
  showGame();
}

//handle the server's response to our nickname and join request
function onLogout (session) {
  CONFIG.nick='#';
  CONFIG.id=null;
  CONFIG.game_started=false;
  CONFIG.game_started_with=null;
  showConnect();
}

//inserts an event into the stream for display
//the event may be a msg, join or part type
//from is the user, text is the body and time is the timestamp, defaulting to now
//_class is a css class to apply to the message, usefull for system events
function addMessage (from, text, time, _class) {
  if (text === null)
    return;

  if (time == null) {
    // if the time is null or undefined, use the current time.
    time = new Date();
  } else if ((time instanceof Date) === false) {
    // if it's a timestamp, interpret it
    time = new Date(time);
  }

  //every message you see is actually a table with 3 cols:
  //  the time,
  //  the person who caused the event,
  //  and the content
  var messageElement = $(document.createElement("table"));

  messageElement.addClass("message");
  if (_class)
    messageElement.addClass(_class);

  var content = '<tr>'
              + '  <td class="date">' + time + '</td>'
              + '  <td class="nick">' + from + '</td>'
              + '  <td class="msg-text">' + text  + '</td>'
              + '</tr>'
              ;
  messageElement.html(content);

  //the log is the stream that we view
  $("#log").append(messageElement);

  //always view the most recent message when it is added
  //scrollDown();
}

//add a list of present chat members to the stream
function outputUsers () {
  return false;
}

//get a list of the users presently in the room, and add it to the stream
function who () {
  jQuery.get("/who", {}, function (data, status) {
    if (status != "success") return;
    nicks = data.nicks;
	$("#users-content a").remove();
	$("#users-content br").remove();
	$("#users-content img").remove();

	for (i=0;i<nicks.length;i++)
	{
	  if ((nicks[i].playing == true) || (nicks[i].id == CONFIG.id))
	{
	    $("#users-content").append("<img src='red.png'>");
	  $("#users-content").append(" <a class='user' href='javascript:void(0);' userid='" + nicks[i].id + "'>" + nicks[i].nick + "</a><br>");
		
	}
	else
	{
	    $("#users-content").append("<img src='green.png'>");
	  $("#users-content").append(" <a class='user' href='javascript:wantsToPlay(" + CONFIG.id + "," + nicks[i].id + ")' userid='" + nicks[i].id + "'>" + nicks[i].nick + "</a><br>");
		
	}
	
	}
  }, "json");
}

var transmission_errors = 0;
var first_poll = true;


//process updates if we have any, request updates from the server,
// and call again with response. the last part is like recursion except the call
// is being made from the response handler, and not at some point during the
// function's execution.
function longPoll (data) {
  if (transmission_errors > 2) {
    showConnect();
    return;
  }

  //process any updates we may have
  //data will be null on the first call of longPoll
  if (data && data.messages) 
  {
    for (var i = 0; i < data.messages.length; i++) 
    {
      var message = data.messages[i];

      //track oldest message so we only request newer messages from server
      if (message.timestamp > CONFIG.last_message_time)
        CONFIG.last_message_time = message.timestamp;
        addMessage(message.nick + '-->' + message.to, message.type +':' + message.text, message.timestamp);


		if ((message.to == CONFIG.id) || (message.to == "ALL"))
		{
//	        addMessage(message.nick + '-->' + message.to, message.type +':' + message.text, message.timestamp);
	        switch (message.type)
	        {
				case "join": 
				  who();
				  break;
				case "part": 
				  who();
				  break;
				case "move" :
				  $("#"+message.text).attr("src", "O.png");
				  break;
				case "start": 
				  who();
				  CONFIG.game_started = true;
				  //CONFIG.game_started_with = message.from;
				$("#dialog-message p").remove();
				  var messageElement = $(document.createElement("p"));

				  var content = message.nick + ' is OK to start a TicTacNode game with You!<br>'
				              + '  Please, start by clicking on one of the free cells.'
				              ;
				  messageElement.html(content);

				  //the log is the stream that we view
				  $("#dialog-message").append(messageElement);
				
				  $( "#dialog-message" ).dialog('open');
				  break;
	        }
		}
/*
      //dispatch new messages to their appropriate handlers
      switch (message.type) 
      {
        case "msg":
          if(!CONFIG.focus){
            CONFIG.unread++;
          }
          break;

        case "join":
          userJoin(message.nick, message.timestamp);
          break;

        case "part":
          userPart(message.nick, message.timestamp);
          break;
      }
*/
    }

    //update the document title to include unread message count if blurred
    //updateTitle();

    //only after the first request for messages do we want to show who is here
    if (first_poll) {
      first_poll = false;
      who();
    }
  }

  //make another request
  $.ajax({ cache: false
         , type: "GET"
         , url: "/recv"
         , dataType: "json"
         , data: { since: CONFIG.last_message_time, id: CONFIG.id }
         , error: function () {
             addMessage("", "long poll error. trying again...", new Date(), "error");
             transmission_errors += 1;
             //don't flood the servers on error, wait 10 seconds before retrying
             setTimeout(longPoll, 10*1000);
           }
         , success: function (data) {
             transmission_errors = 0;
             //if everything went well, begin another request immediately
             //the server will take a long time to respond
             //how long? well, it will wait until there is another message
             //and then it will return it to us and close the connection.
             //since the connection is closed when we get data, we longPoll again
             longPoll(data);
           }
         });
}
function send(to, type, msg) {
    // XXX should be POST
    // XXX should add to messages immediately
  $.ajax({ cache: false
         , type: "GET"
         , url: "/send"
         , dataType: "json"
         , data: { from: CONFIG.id, to: to, type: type, message:msg }
         , error: function (data) {
             alert("Error connecting to the server : " + data.error);
           }
         , success: function (data) {
           }
         });
}

function wantsToPlay(from, to)
{
	CONFIG.game_started_with = to;
	send (to, "play", "<empty>")
}

$(document).ready(function() {
	showConnect();
	
   $("#logoutButton").click(function () 
    {
	    $.ajax({ cache: false
	           , type: "GET" // XXX should be POST
	           , dataType: "json"
	           , url: "/logout"
	           , data: { id: CONFIG.id }
	           , error: function () {
	               alert("error connecting to server");
	               showConnect();
	             }
	           , success: onLogout
	           });
	    return false;
	});
	
   //try logging in
   $("#loginButton").click(function () {
    //lock the UI while waiting for a response
    //TODO;
    var nick = $("#loginInput").attr("value");

    //dont bother the backend if we fail easy validations
    if (nick.length > 50) {
      alert("Nick too long. 50 character max.");
      //showConnect();
      return false;
    }

    //more validations
    if (/[^\w_\-^!]/.exec(nick)) {
      alert("Bad character in nick. Can only have letters, numbers, and '_', '-', '^', '!'");
      //showConnect();
      return false;
    }

    //make the actual join request to the server
    $.ajax({ cache: false
           , type: "GET" // XXX should be POST
           , dataType: "json"
           , url: "/login"
           , data: { nick: nick }
           , error: function () {
               alert("error connecting to server");
               //showConnect();
             }
           , success: onConnect
           });
    return false;
  });


  $( "div.cell" ).click(function( event ) {
						var $item = $( this ),
							$target = $( event.target );
/*
			if ( $target.is( "a.ui-icon-trash" ) ) {
				deleteImage( $item );
			} else if ( $target.is( "a.ui-icon-zoomin" ) ) {
				viewLargerImage( $target );
			} else if ( $target.is( "a.ui-icon-refresh" ) ) {
				recycleImage( $item );
			}
*/
    if (CONFIG.game_started == true)
	{
		//alert ($target.attr("id"));
		if ($target.attr("src") == "filler.png")
		{
			$target.attr("src", "X.png");
			var boardString="";
			if ($("#a1").attr("src") == "filler.png") boardString += "a1-" ;
			if ($("#a2").attr("src") == "filler.png") boardString += "a2-" ;
			if ($("#a3").attr("src") == "filler.png") boardString += "a3-" ;
			if ($("#b1").attr("src") == "filler.png") boardString += "b1-" ;
			if ($("#b2").attr("src") == "filler.png") boardString += "b2-" ;
			if ($("#b3").attr("src") == "filler.png") boardString += "b3-" ;
			if ($("#c1").attr("src") == "filler.png") boardString += "c1-" ;
			if ($("#c2").attr("src") == "filler.png") boardString += "c2-" ;
			if ($("#c3").attr("src") == "filler.png") boardString += "c3-" ;
			if (boardString=="") 
			{
				send(CONFIG.game_started_with, "over", "<empty>");
				  CONFIG.game_started = false;
				  CONFIG.game_started_with = null;
				$("#dialog-message p").remove();
				  var messageElement = $(document.createElement("p"));

				  var content = 'Game Over !'
				              ;
				  messageElement.html(content);

				  $("#dialog-message").append(messageElement);
				  $( "#dialog-message" ).dialog('open');
				$("#a1").attr("src","filler.png");
				$("#a2").attr("src","filler.png");
				$("#a3").attr("src","filler.png");
				$("#b1").attr("src","filler.png");
				$("#b2").attr("src","filler.png");
				$("#b3").attr("src","filler.png");
				$("#c1").attr("src","filler.png");
				$("#c2").attr("src","filler.png");
				$("#c3").attr("src","filler.png");
			}
			else
			  send(CONFIG.game_started_with, "move", boardString);
			
		}
	}
			return false;
		});



  longPoll();
}); // onload()
