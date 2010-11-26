
var Messages = function () {
  this.respondsWith = ['html', 'json', 'js', 'txt'];

  this.send = function (params) {
    log.debug(params).flush();
    this.respond({params: params}, 'json');
  };

  this.index = function (params) {
    this.respond({params: params});
  };

  this.add = function (params) {
    this.respond({params: params});
  };

  this.create = function (params) {
    // Save the resource, then display index page
    this.redirect({controller: this.name});
  };

  this.show = function (params) {
    this.respond({params: params});
  };

  this.edit = function (params) {
    this.respond({params: params});
  };

  this.update = function (params) {
    // Save the resource, then display the item page
    this.redirect({controller: this.name, id: params.id});
  };

  this.remove = function (params) {
    this.respond({params: params});
  };

};

exports.Messages = Messages;

