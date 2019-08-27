var demo = {
  params: ['title'],
  constants: {
    elementLabel: 'Element A',
    innerElementsList: [{ name: 'Element B'}, { name: 'Element C'}]
  },
  variables: {
    outerClickCount: 0
  },
  dynamicElementLists: {
    innerElements: {
      model: 'innerElementsList',
      identity: 'name',
      item: {
        args: { elementLabel: 'item.name'},
        type: {
          params: ['elementLabel'],
          constants: {
            elementColor: '#d8d8d8', // light grey
            innerElementsList: [{ name: 1}, { name: 2}, { name: 3}]
          },
          variables: {
            innerClickCount: 0
          },
          dynamicElementLists: {
            innerElements: {
              model: 'innerElementsList',
              identity: 'name',
              item: {
                args: {parentElementName: 'elementLabel', elementName: 'item.name'},
                type: {
                  params: ['parentElementName', 'elementName'],
                  constants: {
                    elementColor: '#b2b2b2', // dark grey
                  },
                  variables: {
                    innerInnerClickCount: 0
                  },
                  models: {
                    elementLabel: function (parentElementName, elementName) {
                      return parentElementName + elementName;
                    }
                  },
                  events: {
                    click: function (innerInnerClickCount) {
                      innerInnerClickCount.set(innerInnerClickCount.get() + 1);
                    }
                  },
                  view: '' +
                    '<div class="container rounded p-2 mt-3 mb-3" style="background-color: {{elementColor}}">' +
                      '<strong>{{elementLabel}}</strong>' +
                      '<p><span class="font-monospace">innerInnerClickCount:</span> <strong>{{innerInnerClickCount}}</strong></p>' +
                    '</div>'
                }
              }
            }
          },
          events: {
            click: function (innerClickCount) {
              innerClickCount.set(innerClickCount.get() + 1);
            }
          },
          view:  '' +
            '<div class="container rounded d-inline-block p-5 m-4" style="background-color: {{elementColor}}; max-width: 350px;">' +
              '<strong>{{elementLabel}}</strong>' +
              '<p><span class="font-monospace">innerClickCount:</span> <strong>{{innerClickCount}}</strong></p>{{{innerElements}}}' +
            '</div>'
        }
      }
    }
  },
  events: {
    'click div': function (outerClickCount) {
      outerClickCount.set(outerClickCount.get() + 1);
    }
  }
};
