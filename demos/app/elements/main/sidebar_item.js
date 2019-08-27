var sidebar_item = {
  params: ['sidebarItemId', 'sidebarItemTitle', 'sideBarItemDescription', 'selectedSidebarItemId'],
  models: {
    isCurrentlySelected: function (sidebarItemId, selectedSidebarItemId) {
      return sidebarItemId === selectedSidebarItemId;
    },
    sidebarItemClass: function (isCurrentlySelected) {
      return 'sidebar-item nav-link text-dark ' + (isCurrentlySelected ? 'font-weight-bolder' : '');
    }
  },
  view: '' +
  '<div class="mt-1"><a id="{{sidebarItemId}}" class="{{sidebarItemClass}}" href="#">{{sidebarItemTitle}}</a></div>' +
  '{{#if sideBarItemDescription}}<div class="ml-4"><small class="{{isCurrentlySelected ? \'text-dark\': \'text-muted\'}}">{{sideBarItemDescription}}</small></div>{{#endif}}'
};
