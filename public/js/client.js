var CONFIG = { debug: true
             , nickName: "#"   // set in onConnect
             , last_message_time: 1
             , focus: true //event listeners bound in onConnect
             , game_started: false
             , game_started_with: null,
             };

//get a list of the users presently in the room, and add it to the stream
function who () {
  jQuery.get("/players", {}, function (data, status) {
    if (status != "success") return;

    var players = data.params.items;
    $("#users-content a").remove();
    $("#users-content br").remove();
    $("#users-content img").remove();

    for (i=0;i<players.length;i++)
    {
      if (players[i].isPlaying == true) 
      {
        $("#users-content").append("<img src='red.png'>");
        $("#users-content").append(" <a class='user' href='javascript:void(0);' >" + players[i].nickName + "</a><br>");
      }
      else
      {
        $("#users-content").append("<img src='green.png'>");
        $("#users-content").append(" <a class='user' href='javascript:iWantToPlayWith(\\'" + players[i].nickName + "\\');' >" + players[i].nickName + "</a><br>");
      }
    }
  }, "json");
}

function send(msg) {
  jQuery.post("/send", {message: msg}, function (data, status) {
    alert('message sent with status : ' + status);
    }, "json");
}

function iWantToPlayWith(nick){
  var msg = Message.create({to: nick, type:"play", text:"do you want to play with me?"});
}

who();
