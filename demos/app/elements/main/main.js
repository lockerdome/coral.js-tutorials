var main = {
  constants: {
    sidebarItemsList: [
      { id: 'demo_intro', title: 'Demos'},
      { id: 'demo_001', title: '001: Click to Increment',
        description: 'Variables and Events (click handler).'
      },
      { id: 'demo_002', title: '002: Red or Blue?',
        description: 'Models and inline expressions in the view.'
      },
      { id: 'demo_003', title: '003: Fish',
        description: 'View conditionals {{#if _}}, {{#elseif _}}, {{#else _}}, {{#endif _}} and using inline expressions in them.'
      },
      { id: 'demo_004', title: '004: RGB',
        description: 'Two-way value binding.'
      },
      { id: 'demo_005', title: '005: RGB Converter',
        description: 'Different ways to write Models.'
      },
      { id: 'demo_006', title: '006: Sea Creature List',
        description: 'Elements and Dynamic Element Lists.'
      },
      { id: 'demo_007', title: '007: Outer/Inner',
        description: 'Element and Dynamic Element List nesting, Event listener behaviour, Dynamic Element Lists using "item" notation.'
      },
      { id: 'demo_008', title: '008: Multiplication Tables',
        description: 'emitEvent and catching emitEvents.'
      },
      { id: 'demo_009', title: '009: Countdown to zero',
        description: 'The Initialize event handler, .set() true flag.'
      },
      { id: 'demo_010', title: '010: Magic Number',
        description: 'environmentVars.'
      },
      { id: 'demo_011', title: '011: Data Fetch Simulator',
        description: 'Async Models, Zones, Callbacks, /* from */ Parameter annotation'
      }
      // After adding a new demo here, remember to update the content Dynamic Element List below.
    ]
  },
  variables: {
    selectedSidebarItemId: 'demo_intro'
  },
  models: {
    contentDELModel: function (sidebarItemsList, selectedSidebarItemId) {
      for (var i = 0; i !== sidebarItemsList.length; i++) {
        var sidebarItem = sidebarItemsList[i];
        if (sidebarItem.id === selectedSidebarItemId) return [sidebarItem];
      }
      return [];
    }
  },
  dynamicElementLists: {
    sidebarItems: {
      model: 'sidebarItemsList',
      identity: 'id',
      item: {
        args: { sidebarItemId: 'item.id', sidebarItemTitle: 'item.title', sideBarItemDescription: 'item.description', selectedSidebarItemId: 'selectedSidebarItemId' },
        type: 'main/sidebar_item'
      }
    },
    content: {
      model: 'contentDELModel',
      map: function (item) { return item.id; },
      identity: 'id',
      options: {
        demo_intro: { args: { title: 'item.title' }, type: 'demos/demo_intro' },
        demo_001: { args: { title: 'item.title' }, type: 'demos/demo_001'},
        demo_002: { args: { title: 'item.title' }, type: 'demos/demo_002'},
        demo_003: { args: { title: 'item.title' }, type: 'demos/demo_003'},
        demo_004: { args: { title: 'item.title' }, type: 'demos/demo_004'},
        demo_005: { args: { title: 'item.title' }, type: 'demos/demo_005'},
        demo_006: { args: { title: 'item.title' }, type: 'demos/demo_006'},
        demo_007: { args: { title: 'item.title' }, type: 'demos/demo_007'},
        demo_008: { args: { title: 'item.title' }, type: 'demos/demo_008'},
        demo_009: { args: { title: 'item.title' }, type: 'demos/demo_009'},
        demo_010: { args: { title: 'item.title' }, type: 'demos/demo_010'},
        demo_011: { args: { title: 'item.title' }, type: 'demos/demo_011'}
      }
    }
  },
  events: {
    'click .sidebar-item': function (event, selectedSidebarItemId) {
      var elementId = event.target && event.target.id;
      if (elementId) selectedSidebarItemId.set(elementId);
    }
  }
};
