/* global */
(function () {
  var {{{jaderuntime}}}

  var template = {{{templatefunc}}}

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
      defaultName: 'Unknown',
      defaultNumber: 'unknown'
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
