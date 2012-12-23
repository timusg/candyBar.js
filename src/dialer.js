/* global */
(function () {
  {{{emitter}}}

  var {{{jaderuntime}}}

  var template = {{{templatefunc}}}

  var phoney = window.att && window.att.phoneNumber || window.phoney;

  var Dialer = function (spec) {
    var config = spec || {},
      availableCallbacks = {
        'onHide': 'hide',
        'onPress': 'press',
        'onCallableNumber': 'callableNumber',
        'onCall': 'call'
      };

    // inherit wildemitter properties
    WildEmitter.call(this);
    this.number = '';
    this.footer = true;

    // register handlers passed in on init
    for (var item in availableCallbacks) {
      if (config[item]) this.on(availableCallbacks[item], config[item]);
    }
  };

  Dialer.prototype = new WildEmitter();
  
  Dialer.prototype.render = function (container) {
    this.dom = this.domify(template(this));
    this.addClickHandlers();
    this.numberField = this.dom.querySelector('.numberEntry');
    this.clear();
    this.addDocListener();
    return this.dom;
  };

  Dialer.prototype.hide = function () {
    this.removeDocListener();
    this.dom.parentElement.removeChild(this.dom);
    this.emit('hide');
  };
  
  Dialer.prototype.addDocListener = function () {
    var self = this;
    this.boundKeyHandler = function () {
      self.handleKeyDown.apply(self, arguments);
    };
    document.addEventListener('keydown', this.boundKeyHandler, true);
  };

  Dialer.prototype.removeDocListener = function () {
    document.removeEventListener('keydown', this.boundKeyHandler, true);
  };

  Dialer.prototype.addClickHandlers = function () {
    var self = this,
      buttons = this.dom.querySelectorAll('button'),
      callButton = this.dom.querySelector('.call');

    // for button handlers
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function (e) {
        var data = this.attributes['data-value'],
          value = data && data.nodeValue;
        if (value == 'del') {
          self.removeLastNumber();
        } else {
          self.addNumber(value);
        }
        return false;
      }, true);
    });

    if (callButton) {
      callButton.addEventListener('click', function () {
        self.handleCallClick.apply(self, arguments);
      }, false);
    }
  };
  
  Dialer.prototype.handleKeyDown = function (e) {
    var number,
        keyCode = e.which;
    // only handle if dialer is showing
    if (keyCode >= 48 && keyCode <= 57) {
        number = keyCode - 48;
        this.addNumber(number + '');
    }

    if (keyCode === 8) {
        this.removeLastNumber();
        e.preventDefault();
    }
  };

  Dialer.prototype.getNumber = function () {
    return this.number;
  };

  Dialer.prototype.setNumber = function (number) {
    var newNumber = phoney.parse(number),
      oldNumber = this.number,
      callable = phoney.getCallable(newNumber);
    this.number = newNumber;
    this.numberField.innerHTML = phoney.stringify(this.number);
    if (callable) {
      this.emit('callableNumber', callable);
    }
  };

  Dialer.prototype.addNumber = function (number) {
    var newNumber = (this.getNumber() + '') + number;
    this.emit('press', number);
    this.setNumber(newNumber);
  };

  Dialer.prototype.removeLastNumber = function () {
    this.setNumber(this.getNumber().slice(0, -1));
    this.emit('press', 'del');
  };

  Dialer.prototype.clear = function () {
    this.setNumber('');
  };

  Dialer.prototype.domify = function (str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    return div.firstElementChild;
  };

  Dialer.prototype.handleCallClick = function (e) {
    e.preventDefault();
    this.emit('call', this.number, !!phoney.getCallable(this.number));
    return false;
  };

  // attach to window or export with commonJS
  if (typeof module !== "undefined") {
      module.exports = Dialer;
  } else if (typeof define === "function" && define.amd) {
      define(Dialer);
  } else {
      window.Dialer = Dialer;
  }
})(window);
