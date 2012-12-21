/* global */
(function () {
  var jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});

  var template = function anonymous(locals, attrs, escape, rethrow, merge) {
    attrs = attrs || jade.attrs;
    escape = escape || jade.escape;
    rethrow = rethrow || jade.rethrow;
    merge = merge || jade.merge;
    var buf = [];
    with (locals || {}) {
        var interp;
        var __indent = [];
        buf.push('\n<div id="callStatus"><img');
        buf.push(attrs({
            src: locals.picUrl,
            "class": "callerAvatar"
        }, {
            src: true
        }));
        buf.push('/>\n  <h1 class="callerName">');
        var __val__ = locals.caller;
        buf.push(escape(null == __val__ ? "" : __val__));
        buf.push('</h1>\n  <h2 class="callerNumber">');
        var __val__ = locals.caller;
        buf.push(escape(null == __val__ ? "" : __val__));
        buf.push('</h2>\n  <h2 class="callTime">0:00:00</h2>\n  <div class="callActions">\n    <button class="answer">Answer</button>\n    <button class="ignore">Ignore</button>\n    <button class="end">End Call</button>\n    <button class="take">Take Call</button>\n    <button class="push">Push Call</button>\n    <button class="addParty">Add Party</button>\n    <button class="mute">Mute</button>\n    <button class="hold">Hold</button>\n  </div>\n</div>');
    }
    return buf.join("");
}

  var CandyBar = function (spec) {
    this.states = {
      incoming: {
        buttons: ['answer', 'ignore']
      },
      calling: {
        buttons: ['cancel']
      },
      active: {
        buttons: ['hangup', 'mute', 'push'],
        timer: true
      },
      muted: {
        buttons: ['hangup', 'unmute'],
        timer: true
      },
      inactive: {
        buttons: [],
        clearUser: true,
        hidden: true
      },
      remote: {
        buttons: ['take']
      },
      ending: {
        buttons: []
      },
      waiting: {
        buttons: []
      }
    };

    this.config = {
      defaultName: '',
      defaultNumber: 'Unknown Number'
    };
  };
  
  CandyBar.prototype.render = function () {
    if (!this.dom) {
      this.dom = this.domify(template(this));
      this.addButtonHandlers();
      document.body.insertBefore(this.dom, document.body.firstChild);
    } else {
      this.dom.innerHTML = this.domify(template(this)).innerHTML;
    }
    this.clearUser();
    return this.dom;
  };
  
  CandyBar.prototype.addButtonHandlers = function () {
    this.dom.addEventListener('click', function (e) {
      var target = e.target;
      if (target.tagname === 'BUTTON') {
        if (this[target.className]) {
          this[target.className]();
        }
        return false;
      }
    }, true);
  };
  
  CandyBar.prototype.getStates = function () {
    return Object.keys(this.states);
  };

  CandyBar.prototype.setState = function (state) {
    if (!this.dom) return;
    var buttons = this.dom.querySelectorAll('button'),
      self = this,
      stateDef = this.states[state],
      forEach = Array.prototype.forEach;
    if (stateDef) {
      // set proper class on bar itself
      this.getStates().forEach(function (cls) {
        self.dom.classList.remove(cls);
      });
      self.dom.classList.add(state);
      
      // set/remove 'hidden' class on bar itself
      if (stateDef.hidden) {
        self.dom.classList.remove('visible');
        document.body.classList.remove('candybarVisible');
      } else {
        self.dom.classList.add('visible');
        document.body.classList.add('candybarVisible');
      }

      // show/hide the correct buttons
      forEach.call(buttons, function (button) {
        if (stateDef.buttons.indexOf(button.className) !== -1) {
          button.style.display = 'block';
        } else {
          button.style.display = 'none';
        }
      });

      // start/stop timer
      if (stateDef.timer) {
        if (this.timerStopped) {
          this.startTimer();
        }
      } else {
        this.resetTimer();
      }

      // reset user if relevant
      if (stateDef.clearUser) {
        this.setUser({});
      }

    } else {
      throw new Error('Invalid value for CandyBar state. Valid values are: ' + this.getStates().join(', '));
    }
  };

  CandyBar.prototype.endGently = function (delay) {
    var self = this;
    this.setState('ending');
    setTimeout(function () {
      self.dom.classList.remove('visible');
      setTimeout(function () {
        self.setState('inactive');
        self.clearUser();
      }, 1000);
    }, 1000);
  };

  CandyBar.prototype.getUser = function () {
    var user = this.user || {};
    return {
      picUrl: user.picUrl,
      name: (user.name && user.name) || this.config.defaultName,
      number: (user.number && escape(user.number)) || this.config.defaultNumber
    };
  };

  CandyBar.prototype.setUser = function (details) {
    this.user = details;
    if (!this.dom) return;
    var user = this.getUser();
    this.dom.querySelector('.callerAvatar').src = user.picUrl;
    this.dom.querySelector('.callerNumber').innerHTML = user.number;
    this.dom.querySelector('.callerName').innerHTML = user.name;
    if (user.picUrl) {
      this.dom.classList.add('havatar');
    } else {
      this.dom.classList.remove('havatar');
    }
  };

  CandyBar.prototype.clearUser = function () {
    this.setUser({
      picUrl: '',
      name: '',
      number: ''
    });
  };

  CandyBar.prototype.domify = function (str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    return div.firstElementChild;
  };

  CandyBar.prototype.startTimer = function () {
    this.timerStartTime = Date.now();
    this.timerStopped = false;
    this.updateTimer();
  };

  CandyBar.prototype.stopTimer = function () {
    this.timerStopped = true;
  };

  CandyBar.prototype.resetTimer = function () {
    this.timerStopped = true;
    this.setTimeInDom('0:00:00');
  };

  CandyBar.prototype.updateTimer = function () {
    if (this.timerStopped) return;
    
    var diff = Date.now() - this.timerStartTime,
        s = Math.floor(diff / 1000) % 60,
        min = Math.floor((diff / 1000) / 60) % 60,
        hr = Math.floor(((diff / 1000) / 60) / 60) % 60,
        time = [hr, this.zeroPad(min), this.zeroPad(s)].join(':');
    
    if (this.time !== time) {
        this.time = time;
        this.setTimeInDom(time);
    }

    setTimeout(this.updateTimer.bind(this), 100);
  };

  CandyBar.prototype.setTimeInDom = function (timeString) {
    if (!this.dom) return;
    this.dom.querySelector('.callTime').innerHTML = timeString;
  };

  CandyBar.prototype.zeroPad = function (num) {
    return ((num + '').length === 1) ? '0' + num : num;
  };

  window.CandyBar = CandyBar;
})(window);
