var demo = {
  params: ['title'],
  variables: {
    newEntry: '',
    seaCreatureList: ['starfish', 'whale']
  },
  elements: {
    seaCreatureAdder: {
      type: { // seaCreatureAdder is an inline element.
        params: ['newEntry', 'seaCreatureList'],
        events: {
          'click button': function (newEntry, seaCreatureList) {
            var _newEntry = newEntry.get();
            if (_newEntry) {
              var clonedSeaCreatureList = seaCreatureList.get().slice();
              clonedSeaCreatureList.push(_newEntry);
              newEntry.set('');
              seaCreatureList.set(clonedSeaCreatureList);
            }
          }
        },
        view: '' + // seaCreatureAdder uses an inline view instead of an .hjs file.
          '<div class="input-group mb-3" style="width: 320px;">' +
            '<input type="text" class="form-control" value="{{newEntry}}" placeholder="type something here...">' +
            '<div class="input-group-append">' +
              '<button class="btn bg-coral text-light" type="button" id="button-addon1">+</button>' +
            '</div>' +
          '</div>'
      }
    }
  },
  dynamicElementLists: {
    seaCreatureListDisplay: {
      model: 'seaCreatureList',
      // the identity key specifies how the Dynamic Element list should distinguish between items in the model, and deduplicates them accordingly.
      identity: '',
      // The map function helps determine which option is used for each item in the Dynamic Element List's model.
      map: function (item) { return /sea urchin/i.test(item) ? 'detailedEntryForSeaUrchin' : 'basicEntry'; },
      options: {
        basicEntry: {
          args: { title: 'item', text: constant(''), imagePath: constant(''), altText: constant(''), buttonText: constant(''), buttonLink: constant('') },
          type: 'bootstrap_components/card' // This is a non-inline element.
        },
        detailedEntryForSeaUrchin: {
          args: {
            title: constant('Sea urchin'),
            text: constant('Sea urchins use their spines and tube feet to walk around.'),
            imagePath: constant('../../assets/images/doodles/sea_urchin.png'),
            altText: constant('A sea urchin'),
            buttonText: constant('Read more about tube feet >>'),
            buttonLink: constant('https://en.wikipedia.org/wiki/Tube_feet ')
          },
          type: 'bootstrap_components/card'
        }, // An extra comma at the end won't break the code.
        // More options can be added here.
      }
    }
  }
};
