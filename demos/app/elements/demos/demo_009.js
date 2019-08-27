var demo = {
  params: ['title'],
  variables: {
    isInputBlank: false,
    iscurrentlyCounting: true,
    countDownStartingValue: 5,
    countDownCurrentValue: 5,
  },
  models: {
    countdownMessage: function (countDownCurrentValue) {
      if (countDownCurrentValue <= 0) return 'Timer expired.';
      var needsPlural = countDownCurrentValue !== 1;
      var seconds = 'second' + (needsPlural ? 's' : '');
      return countDownCurrentValue + ' ' + seconds + ' remaining.';
    }
  },
  events: {
    initialize: function (isInputBlank, iscurrentlyCounting, countDownStartingValue, countDownCurrentValue) {

      var countDown = setInterval(doCountDown, 1000);

      countDownStartingValue.on('change', function (_newCountDownStartingValue) {
        var _isInputBlank = _newCountDownStartingValue !== 0 && !_newCountDownStartingValue;
        if (_isInputBlank) {
          isInputBlank.set(true);
          clearInterval(countDown);
          iscurrentlyCounting.set(false);
          return;
        }
        isInputBlank.set(false);
        countDownCurrentValue.set(_newCountDownStartingValue);
        if (!iscurrentlyCounting.get()) {
          iscurrentlyCounting.set(true);
          countDown = setInterval(doCountDown, 1000);
        }
      });

      function doCountDown () {
        var _countDownCurrentValue = parseFloat(countDownCurrentValue.get());
        if (_countDownCurrentValue <= 0) {
          stopCountDown();
          iscurrentlyCounting.set(false);
        } else {
          _countDownCurrentValue--;
          countDownCurrentValue.set(_countDownCurrentValue);
          iscurrentlyCounting.set(true);
        }
      }

      function stopCountDown () {
        clearInterval(countDown);
      }

    },
    'click button': function (countDownStartingValue, countDownCurrentValue) {
      var _countDownStartingValue = countDownStartingValue.get();
      countDownStartingValue.set(_countDownStartingValue, true); // This .set() call uses the force trigger change flag
    }
  }
};
