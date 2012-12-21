/* global */
(function () {
  {{{emitter}}}

  var {{{jaderuntime}}}

  var template = {{{templatefunc}}}

  var phoney = window.att && window.att.phoneNumber || window.phoney;

  var Dialer = function (spec) {
    // inherit wildemitter properties
    WildEmitter.call(this);
    this.number = '';
    this.on('*', function (event, payload) {
      console.log('e', event, payload);
    });
  };

  Dialer.prototype = new WildEmitter();
  
  Dialer.prototype.render = function (container) {
    this.dom = this.domify(template(this));
    this.addButtonHandlers();
    this.numberField = this.dom.querySelector('.numberEntry');
    this.clear();
    this.addDocListener();
    return this.dom;
  };

  Dialer.prototype.hide = function () {
    this.removeDocListener();
    this.dom.parentElement.removeChild(this.dom);
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

  Dialer.prototype.addButtonHandlers = function () {
    var self = this;
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
  
  Dialer.prototype.handleKeyDown = function (e) {
    var number,
        keyCode = e.which;
    // only handle if dialer is showing
    if (keyCode >= 48 && keyCode <= 57) {
        number = keyCode - 48;
        this.addNumber(number);
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
      oldNumber = this.number;
    this.number = newNumber;
    this.numberField.innerHTML = phoney.stringify(this.number);
    if (newNumber !== oldNumber) {
      this.emit('change', newNumber);
    }
  };

  Dialer.prototype.addNumber = function (number) {
    var newNumber = (this.getNumber() + '') + number,
        callable = phoney.getCallable(newNumber);
    this.setNumber(newNumber);
    if (callable) {
      this.emit('callableNumber', callable);
    }
  };

  Dialer.prototype.removeLastNumber = function () {
    this.setNumber(this.getNumber().slice(0, -1));
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
    this.emit('call', phoney.getCallable(this.number));
    return false;
  };

  window.Dialer = Dialer;
})(window);
