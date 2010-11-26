
var Gameboards = function () {
  this.respondsWith = ['html', 'json', 'js', 'txt'];

  this.index = function (params) {
    this.respond({params: params});
  };

};

exports.Gameboards = Gameboards;

