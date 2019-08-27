var demo = {
  params: ['title'],
  variables: {
    counterValue: 0
  },
  models: {
    hasNotClicked: function (counterValue) {
      return counterValue === 0;
    },
    hasClickedOnce: function (counterValue) {
      return counterValue === 1;
    },
    hasClickedTwice: function (counterValue) {
      return counterValue === 2;
    },
    isMultipleOfThree: function (counterValue) {
      return counterValue % 3 === 0;
    }
  },
  events: {
    'click button#increment': function (counterValue) {
      var _counterValue = counterValue.get();
      counterValue.set(_counterValue + 1);
    },
    'click button#reset': function (counterValue) {
      counterValue.set(0);
    }
  }
};
