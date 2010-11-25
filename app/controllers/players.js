
var Players = function () {
  var _this = this;
  this.respondsWith = ['html', 'json', 'js', 'txt'];

  this.index = function (params) {
    Player.all(function (err, items) {
      if (err) throw err;
      params.items = items;
      _this.respond({params: params});
    });
  };

  this.add = function (params) {
    this.respond({params: params}, 'html');
  };

  this.create = function (params) {
    log.debug(params['nickName']).flush();
    log.debug(lesJoueurs[params['nickName']]).flush();
    log.debug(_this.session.sid).flush();

    log.debug(lesJoueurs);

    if (lesJoueurs[params['nickName']] == null)
    {
      var item = Player.create(params);
      if (item.errors)
      {
         params.errors = item.errors;
         this.transfer('add');
      }
      else
      {
         item.messages = [];
         _this.session.set('player', item);
         lesJoueurs[params['nickName']] = item;
         this.redirect('/gameboard');
      }
    }
    else
    {
      if (params.errors ==null)
        params.errors = [];
      params.errors.push("Nickname already in use");
      this.transfer('add');
    }

    /*item.save(function (err, res) {
      if (err) {
        params.errors = err;
        _this.transfer('add');
      }
      else {
        _this.redirect({controller: _this.name});
      }
    }); */

  };

  this.show = function (params) {
    Player.find(params.id, function (err, items) {
      if (err) throw err;
      params.item = items[0];
      _this.respond({params: params});
    });
  };

  this.edit = function (params) {
    Player.find(params.id, function (err, items) {
      if (err) throw err;
      geddy.util.meta.mixin(params, items[0]);
      _this.respond({params: params});
    });
  };

  this.update = function (params) {
    Player.update(params.id, params, function (err, res) {
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
    log.debug(_this.session.sid).flush();
    log.debug(_this.session.get('player')).flush();

    log.debug('deleting player from players list').flush();
    delete lesJoueurs[_this.session.get('player').nickName]; 
    log.debug(lesJoueurs);
    log.debug('sanitizing session').flush();
    _this.session.unset('player');// = null;
    log.debug('redirecting...').flush();
/*
    Player.remove(params.id, function (err, items) {
      if (err) throw err;
      _this.redirect({controller: _this.name});
    });
*/
    _this.redirect('/');
  };

};

exports.Players = Players;

