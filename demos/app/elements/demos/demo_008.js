var demo = {
  params: ['title'],
  constants: {
    chartList: [
      { baseValue: 3, chartColor: '#ff3b59' },
      { baseValue: 4, chartColor: '#3b59ff' },
      { baseValue: 5, chartColor: '#ffb03b' }
    ]
  },
  variables: {
    selectedBaseValue: null,
    selectedMultiplier: null,
    product: null
  },
  dynamicElementLists: {
    multiplicationCharts: {
      model: 'chartList',
      identity: 'baseValue',
      item: {
        args: { baseValue: 'item.baseValue', chartColor: 'item.chartColor' },
        type: {
          params: ['baseValue', 'chartColor'],
          constants: {
            multiplicationValuesList: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }]
          },
          dynamicElementLists: {
            multiplierButtons: {
              model: 'multiplicationValuesList',
              identity: 'x',
              item: {
                args: {multiplicationValue: 'item.x'},
                type: {
                  params: ['multiplicationValue'],
                  variables: {
                    innerInnerClickCount: 0
                  },
                  events: {
                    click: function (emitEvent, multiplicationValue) {
                      emitEvent('multiplierWasSelected', Coral.Observable.unpack(multiplicationValue));
                    }
                  },
                  view: '' +
                    '<button type="button" class="btn rounded-pill btn-lg btn-block mb-3 bg-light">' +
                      '{{"x " + multiplicationValue}}' +
                    '</button>'
                }
              }
            }
          },
          events: {
            'catch multiplierWasSelected': function (args, baseValue, emitEvent) {
              var multiplier = args[0];
              emitEvent('doMultiplication', {
                baseValue: baseValue,
                multiplier: Coral.Observable.unpack(multiplier)
              });
            }
          },
          view:  '' +
            '<div class="container rounded d-inline-block p-3 m-2" style="background-color: {{chartColor}}; max-width: 200px;">' +
              '<h1 class="display-3 text-center text-light">{{baseValue}}</h1>' +
              '{{{multiplierButtons}}}' +
            '</div>'
        }
      }
    }
  },
  events: {
    'catch doMultiplication': function (args, selectedBaseValue, selectedMultiplier, product) {
      var data = args[0];
      _baseValue = Coral.Observable.unpack(data.baseValue);
      _multiplier = Coral.Observable.unpack(data.multiplier);
      selectedBaseValue.set(_baseValue);
      selectedMultiplier.set(_multiplier);
      product.set(_baseValue * _multiplier);
    },
    'catch multiplierWasSelected': function () {
      throw new Error("This will never get called because the event stops propagating upward after it is caught");
    }
  }
};
