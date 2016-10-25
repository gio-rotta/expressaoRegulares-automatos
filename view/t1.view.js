var TrabalhoView = Backbone.View.extend({
  el: '.trabalho',
  events : {
    "click .js-tab" : "mudarPanel",
  },

  initialize: function(options) {
    this.panelView = new RegexPanelView();
  },  

  mudarPanel: function(event) {
    $(event.currentTarget).addClass('active');
    $(event.currentTarget).siblings().removeClass('active');
    var target = $(event.currentTarget).data('tab');
    this.$('.js-'+target).removeClass('hidden');
    this.$('.js-'+target).siblings().addClass('hidden');

    if (target == 'er-panel') {
      this.panelView = new RegexPanelView();
    } else if (target == 'af-panel') {
      this.panelView = new AutomatoPanelView();
    }
  },
});