var inflections = {};


var User = {"filename":{"singular":"user","plural":"users"},"constructor":{"singular":"User","plural":"Users"},"property":{"singular":"user","plural":"users"}};
inflections['user'] = User;
inflections['users'] = User;
inflections['User'] = User;
inflections['Users'] = User;
inflections['user'] = User;
inflections['users'] = User;
var Player = {"filename":{"singular":"player","plural":"players"},"constructor":{"singular":"Player","plural":"Players"},"property":{"singular":"player","plural":"players"}};
inflections['player'] = Player;
inflections['players'] = Player;
inflections['Player'] = Player;
inflections['Players'] = Player;
inflections['player'] = Player;
inflections['players'] = Player;
module.exports = inflections;