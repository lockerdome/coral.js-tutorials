var demo = {
  params: ['title'],
  environmentVars: ['magicNumber', 'inputNumber', 'inputNumberPlusFive'],
  constants: {
    magicNumber: 10,
    regularNumber: 3
  },
  variables: {
    inputNumber: 0
  },
  models: {
    inputNumberPlusFive: function (inputNumber) {
      return parseInt(inputNumber) + 5;
    }
  },
  elements: {
    innerElement: {
      type: {
        params: ['regularNumber'],
        environmentVars: ['magicNumber'],
        constants: {
          magicNumber: 8
        },
        elements: {
          innerElement: {
            type: {
              params: ['regularNumber'],
              view: '' +
                '<div class="rounded p-4 mt-2" style="background-color: #9372B3;">' +
                  '<div><strong>Level 3</strong></div>' +
                  '<div>regularNumber: {{regularNumber}}</div>' +
                  '<div>magicNumber: {{environment.magicNumber}}</div>' +
                  '<div>inputNumber: {{environment.inputNumber}}, inputNumberPlusFive: {{environment.inputNumberPlusFive}}</div>' +
                '</div>'
            }
          }
        },
        view: '' +
          '<div class="rounded p-4 mt-2" style="background-color: #C1AED3;">' +
            '<div><strong>Level 2</strong></div>' +
            '<div>regularNumber: {{regularNumber}}</div>' +
            '<div>magicNumber: {{environment.magicNumber}}</div>' +
            '{{{innerElement}}}' +
          '</div>'
      }
    }
  }
};
