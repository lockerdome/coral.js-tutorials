var demo = {
  params: ['title'],
  variables: {
    counterValue: 0
  },
  models: {
    isEven: function (counterValue) {
      return counterValue % 2 === 0;
    }
  },
  events: {
    'click button': function (counterValue) {
      var _counterValue = counterValue.get();
      counterValue.set(_counterValue + 1);
    }
  }
};
