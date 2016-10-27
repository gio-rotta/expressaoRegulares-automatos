
var AutomatoPanelView = Backbone.View.extend({
  el: '.js-af-panel',

  events : {
    "click .js-salvar-automato" : "salvarAutomato",
    "click .js-abrir-modal-automato" : "abrirModalSalvarAutomato",
    "change .js-automato-inputfile": "automatoSelecionado",
    "click .js-fechar-modal-regex" : "fecharModalRegex",
    "click .js-fechar-modal-automato" : "fecharModalAutomato",
    "click .js-adc-estado": "adicionarEstado",
    "click .js-rm-estado": "removerEstado",
    "click .js-adc-terminal": "adicionarTerminal",
    "click .js-rm-terminal": "removerTerminal",
    "click .js-novo-automato": "novoAutomato",
    "click .js-abrir-modal-automato" : "abrirModalSalvarAutomato",
    "click .js-fechar-modal-automato" : "fecharModalAutomato",
    "click .js-minimizar" : "minimizarAutomato",
    "click .js-determinizar" : "determinizarAutomato"
  },
  
  initialize: function(options) {
    this.expressaoRegular = new ExpressaoRegular();
    this.expressao = '';
    this.automato = {};
    this.automatoView = false;
    this.on('new', this.habilitarBotoes);
  },  

  habilitarBotoes: function() {
    if (this.automatoView) {
      this.$('.js-determinizar').toggleClass('disabled', false);
      this.$('.js-minimizar').toggleClass('disabled', false);
      this.$('.js-abrir-modal-automato').toggleClass('disabled', false);
    }
  },

  minimizarAutomato: function(event) {
    var minimizadorAutomato = new Minimizacao(this.automato.estados, this.automato.alfabeto);
    var estados = minimizadorAutomato.minimizarAutomato();
    this.automato = {estados:estados, alfabeto:this.automato.alfabeto, elGrafo:'grafo-automato-2'};
    this.automatoView = new AutomatoView(this.automato);
    this.automatoView.gerarTabelaDinamica();
    this.$el.find('.panel-automato').html(this.automatoView.el);
    this.automatoView.gerarGrafo();
  },

  determinizarAutomato: function(event) {
    var determinizadorAutomato = new Determinizacao(this.automato.estados, this.automato.alfabeto);
    var estados = determinizadorAutomato.determinizarAutomato();
    this.automato = {estados:estados, alfabeto:this.automato.alfabeto, elGrafo:'grafo-automato-2'};
    this.automatoView = new AutomatoView(this.automato);
    this.automatoView.gerarTabelaDinamica();
    this.$el.find('.panel-automato').html(this.automatoView.el);
    this.automatoView.gerarGrafo();
  },

  automatoSelecionado: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        if (!fileData.isAutomato) {
          alert('Arquivo especificado não representa um automâto')
        } else {
          this.automato = {estados:fileData.estados, alfabeto:fileData.alfabeto, elGrafo:'grafo-automato-2'};
          this.automatoView = new AutomatoView(this.automato);
          this.automatoView.gerarTabelaDinamica();
          this.$el.find('.panel-automato').html(this.automatoView.el);
          this.automatoView.gerarGrafo();
          this.trigger("new", {});
        }
      } catch(e) {
        console.log(e)
        alert('Arquivo escolhido não se encontra no formato válido.')
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

  novoAutomato: function() {
    if (!this.automatoView) {
      var estados = {};
      estados['q0'] = { nome: 'q0', id:'q0', inicial: true, final:true, transicoes : {a:['q0']}, }
      this.automato = {estados:estados, alfabeto:['a'], elGrafo:'grafo-automato-2'};
      this.automatoView = new AutomatoView(this.automato);
      this.automatoView.gerarTabelaDinamica();
      this.$el.find('.panel-automato').html(this.automatoView.el);
      this.trigger("new", {});
      this.automatoView.gerarGrafo();
    }
  },

  abrirModalSalvarAutomato: function(event) {
    this.$el.append($('#saveAutomatoModal').modal('show'));
  },

  salvarAutomato: function(event) {
    // serialize JSON directly to a file
    var name = $('.js-nome-automato').val();
    this.download(name+'.json', JSON.stringify({isAutomato:true, estados:this.automatoView.estados, alfabeto:this.automatoView.alfabeto}));
    $(document.body).append(this.$('#saveAutomatoModal').modal('hide'));
  },

  fecharModalAutomato: function() {
    $(document.body).append(this.$('#saveAutomatoModal').modal('hide'));
  },

  adicionarEstado: function() {
    if (this.automatoView) {
     this.automatoView.novoEstado();
    } else {

    }
  },

  removerEstado: function() {
    if (this.automatoView) {
     this.automatoView.removerEstado();
    } else {

    }
  },

  adicionarTerminal: function() {
    if (this.automatoView) {
      this.automatoView.novoTerminal();
    } else {

    }
  },

  removerTerminal: function() {
    if (this.automatoView) {
     this.automatoView.removerTerminal();
    } else {

    }
  },

  download: function(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
  },

});
