var demo = {
  params: ['title'],
  variables: {
    counterValue: 0
  },
  events: {
    'click button': function (counterValue) {
      var _counterValue = counterValue.get();
      counterValue.set(_counterValue + 1);
    }
  }
};
