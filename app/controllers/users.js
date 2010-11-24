
var Users = function () {
  var _this = this;
  this.respondsWith = ['html', 'json', 'js', 'txt'];

  this.index = function (params) {
    User.all(function (err, items) {
      if (err) throw err;
      params.items = items;
      _this.respond({params: params});
    });
  };

  this.add = function (params) {
    this.respond({params: params});
  };

  this.create = function (params) {
    var item = User.create(params);
    item.save(function (err, res) {
      if (err) {
        params.errors = err;
        _this.transfer('add');
      }
      else {
        _this.redirect({controller: _this.name});
      }
    });
  };

  this.show = function (params) {
    User.find(params.id, function (err, items) {
      if (err) throw err;
      params.item = items[0];
      _this.respond({params: params});
    });
  };

  this.edit = function (params) {
    User.find(params.id, function (err, items) {
      if (err) throw err;
      geddy.util.meta.mixin(params, items[0]);
      _this.respond({params: params});
    });
  };

  this.update = function (params) {
    User.update(params.id, params, function (err, res) {
      if (err) {
        params.errors = err;
        _this.transfer('edit');
      }
      else {
        _this.redirect({controller: _this.name});
      }
    });
  };

  this.remove = function (params) {
    User.remove(params.id, function (err, items) {
      if (err) throw err;
      _this.redirect({controller: _this.name});
    });
  };

};

exports.Users = Users;

