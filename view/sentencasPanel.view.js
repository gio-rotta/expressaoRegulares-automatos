
var SentencaPanelView = Backbone.View.extend({
  el: '.js-sentenca-panel',

  events : {
    "change .js-lr-inputfile": "lrSelecionado",
    "click .js-novo-er" : "novoEr",
    "keyup .js-er-input" : "verificarER",
    "keyup .js-sentenca" : "verificarSentenca",
    "keyup .js-n-sentencas" : "habilitarBotaoGerado",
    "click .js-gerar-sentencas" : "gerarSentencas",
  },
  
  initialize: function(options) {

    this.expressaoRegular = new ExpressaoRegular();
    this.operacoesFormais = new OperacoesFormais();
    this.expressao = false;
    this.automato = false;
    this.automato1View = false;
    this.lr1Selecionado = false;

    this.on('new', this.habilitarBotoes);
  }, 

  executarDeSimone: function(expressao) {
    var deSimone = new DeSimone(expressao);
    deSimone.construirArvoreRPN();
    var estados = deSimone.gerarEstadosRPN('q0');
    var automato = {isAutomato:true, estados:estados, alfabeto:deSimone._alfabeto};
    return automato;
  },

  verificarER: function(event) {
    var expressao = $(event.currentTarget).val();
    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    if (!eValido || expressao === '') {
      this.$('.er-validador').text('Expressão Inválida');
      this.$('.er-validador').addClass('text-danger').removeClass('text-success');
      this.expressao = false;
    } else {
      this.$('.er-validador').text('Expressão Válida!');
      this.$('.er-validador').removeClass('text-danger').addClass('text-success')
      expressao = $(event.currentTarget).val().replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
      this.expressao = expressao;
    }
    this.trigger("new", {});
  },

  verificarSentenca: function(event) {
    var expressao = $(event.currentTarget).val();
    var eValido = this.verificador.verificarSentenca();
    if (!eValido || expressao === '') {
      this.$('.sentenca-validador').text('Expressão Inválida');
      this.$('.sentenca-validador').addClass('text-danger').removeClass('text-success');
    } else {
      this.$('.sentenca-validador').text('Expressão Válida!');
      this.$('.sentenca-validador').removeClass('text-danger').addClass('text-success');
    }
    this.trigger("new", {});
  },

  gerarSentencas: function() {
    var listaSentencas = gerarSentencas();
    this.$('.js-container-sentencas').html(listaSentencas);
  },

  habilitarBotaoGerado: function() {
    if (this.$('.js-n-sentencas').val() != '') {
      this.$('.js-gerar-sentencas').toggleClass('disabled', false);
    }
  },

  novoEr: function() {
    this.automato = false;
    this.$el.find('.js-er').removeClass('hidden');
    this.$el.find('.js-tabela-af').addClass('hidden');
  },

  lrSelecionado: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        if (fileData.isAutomato) {
          this.automato = {estados:fileData.estados, alfabeto:fileData.alfabeto, elGrafo:'grafo-automato-2'};
          this.automatoView = new AutomatoView(this.automato);
          this.automatoView.gerarTabela();
          this.$el.find('.js-tabela-af').html(this.automatoView.el);
          this.$el.find('.js-tabela-af').removeClass('hidden');
          this.$el.find('.js-er').addClass('hidden');

        } else if (fileData.isRegex) {
          this.automato = false;
          this.$el.find('.js-er').removeClass('hidden');
          this.$el.find('.js-tabela-af').addClass('hidden');
          this.$el.find('.js-er-input').val(fileData.regex);
          this.expressao = fileData.regex;
        }
        this.lr1Selecionado = true;
        this.$el.find('js-lr-upload').addClass('hidden');
        this.trigger("new", {});
      } catch(e) {
        console.log(e);
        alert('Arquivo escolhido não se encontra no formato válido.');
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

  habilitarBotoes: function() {
    $('.js-sentenca').prop('disabled', !(this.automato || this.expressao));
    $('.js-n-sentencas').prop('disabled', !(this.automato || this.expressao));
    if (this.automato || this.expressao) {
      this.$('.js-sentenca').toggleClass('disabled', false);
      this.$('.js-n-sentencas').toggleClass('disabled', false);
    }
  },

});
