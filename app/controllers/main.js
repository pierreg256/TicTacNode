/*
 * Geddy JavaScript Web development framework
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var Main = function () {
  this.respondsWith = ['html'];

  this.index = function (params) {
    log.debug(this.session.sid).flush();
    log.debug(this.session.get('player')).flush();
    //this.respond({params: params});

    if (this.session.get('player') == null)
      this.redirect("/login");
    else
      this.redirect("/gameborads");

  };
};

exports.Main = Main;


