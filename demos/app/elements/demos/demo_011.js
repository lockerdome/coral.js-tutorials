var demo = {
  params: ['title'],
  constants: {
    getRandomNumber: function () {
      return Math.floor(Math.random() * 4000);
    }
  },
  variables: {
    arbitraryAmountOfTimeInMilliseconds: function (getRandomNumber) {
      return getRandomNumber();
    },
    shouldSucceed: true
  },
  elements: {
    timeoutDisplayZone: {
      type: {
        params: [{ name: 'shouldSucceed', invariant: true }, {name: 'arbitraryAmountOfTimeInMilliseconds', invariant: true }],
        preload: '' +
          '<div class="spinner-border spinner-border-sm mr-3 d-inline-block" role="status" style="color: #da5aa7"></div>' +
          '<div class="d-inline-block">Fetching data...please wait</div>',
        models: {
          fetchDataFromSomewhere: function (/* async */ arbitraryAmountOfTimeInMilliseconds, shouldSucceed) {
            // If an async model returns a Promise, the framework will wait for the Promise to be resolved or rejected.
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                if (shouldSucceed) resolve(arbitraryAmountOfTimeInMilliseconds);
                else reject(arbitraryAmountOfTimeInMilliseconds);
              }, arbitraryAmountOfTimeInMilliseconds);
            });
          },
          timeElapsedSecondsSuccess: function (timeElapsed /* from fetchDataFromSomewhere.result */) {
            return timeElapsed / 1000;
          },
          timeElapsedSecondsFailure: function (timeElapsed /* from fetchDataFromSomewhere.error */) {
            return timeElapsed / 1000;
          }
        },
        view: '' +
          '{{#if fetchDataFromSomewhere.result}}' +
            '<span class="text-success">Data successfully loaded! You waited <strong>{{timeElapsedSecondsSuccess}}</strong> seconds.</span>' +
          '{{#else}}' +
            '<span class="text-danger">Data failed to fetch! You waited <strong>{{timeElapsedSecondsFailure}}</strong> seconds.</span>' +
          '{{#endif}}'
      }
    }
  },
  callbacks: {
    reload: function (args, arbitraryAmountOfTimeInMilliseconds, shouldSucceed, getRandomNumber) {
      var _shouldSucceed = args[0].shouldSucceed;
      Coral.Observable.inTransaction(function () {
        arbitraryAmountOfTimeInMilliseconds.set(getRandomNumber());
        shouldSucceed.set(_shouldSucceed);
      });
    }
  },
  events: {
    'click #reload': function (reload) {
      reload({shouldSucceed: true});
    },
    'click #fail': function (reload) {
      reload({shouldSucceed: false});
    }
  }
};
