
var SentencaPanelView = Backbone.View.extend({
  el: '.js-sentenca-panel',

  events : {
    "change .js-lr-inputfile": "lrSelecionado",
    "click .js-novo-er" : "novoEr",
    "keyup .js-er-input" : "verificarER",
    "keyup .js-sentenca" : "habilitarBotaoVerificador",
    "click .js-verificar-sentenca" : "verificarSentenca",
    "keyup .js-n-sentencas" : "habilitarBotaoGerador",
    "click .js-gerar-sentencas" : "gerarSentencas",
  },
  
  initialize: function(options) {

    this.expressaoRegular = new ExpressaoRegular();
    this.reconhecedorSentencas = new ReconhecedorSentencas();
    this.expressao = false;
    this.automato = false;
    this.automato1View = false;
    this.lr1Selecionado = false;

    this.on('new', this.habilitarBotoes);
  }, 

  executarDeSimone: function(expressao) {
    var expressaoRPN =  this.expressaoRegular.getRPN(expressao);
    var deSimone = new DeSimone(expressaoRPN);
    deSimone.construirArvoreRPN();
    var estados = deSimone.gerarEstadosRPN('q0');
    var automato = {isAutomato:true, estados:estados, alfabeto:deSimone._alfabeto};
    return automato;
  },

  verificarER: function(event) {

    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    expressao = this.expressaoRegular.inserirConcatenacao($(event.currentTarget).val());

    if (!eValido || expressao === '') {
      this.$('.er-validador').text('Expressão Inválida');
      this.$('.er-validador').addClass('text-danger').removeClass('text-success');
      this.expressao = false;
    } else {
      this.$('.er-validador').text('Expressão Válida!');
      this.$('.er-validador').removeClass('text-danger').addClass('text-success')
      this.expressao = expressao;
    }
    this.trigger("new", {});
  },

  verificarSentenca: function(event) {
     if (!this.automato) {
      if (this.expressao) {
        this.automato = this.executarDeSimone(this.expressao);
      } else {
        alert('Insira uma representação para a linguagem regular 1!');
      }
    }

    var sentenca = this.$('.js-sentenca').val();
    var eValido = this.reconhecedorSentencas.verificarSentenca(this.automato.estados, this.automato.alfabeto, sentenca);
    if (!eValido || sentenca === '') {
      this.$('.sentenca-validador').text('Sentença Inválida');
      this.$('.sentenca-validador').addClass('text-danger').removeClass('text-success');
    } else {
      this.$('.sentenca-validador').text('Sentença Válida!');
      this.$('.sentenca-validador').removeClass('text-danger').addClass('text-success');
    }
  },

  gerarSentencas: function() {
    if (!this.automato) {
      if (this.expressao) {
        this.automato = this.executarDeSimone(this.expressao);
      } else {
        alert('Insira uma representação para a linguagem regular 1!');
      }
    }

    console.log(this.automato)

    var listaSentencas = this.reconhecedorSentencas.gerarSentencas(this.$('.js-n-sentencas').val(), this.automato);
    listaSentencas = listaSentencas.map(function (current) {
      return "<p>" + current + "</p>"
    });

    this.$('.js-container-sentencas').html(listaSentencas);
  },

  habilitarBotaoGerador: function() {
    if (this.$('.js-n-sentencas').val() != '') {
      this.$('.js-gerar-sentencas').toggleClass('disabled', false);
    }
  },

  habilitarBotaoVerificador: function() {
    if (this.$('.js-sentenca').val() != '') {
      this.$('.js-verificar-sentenca').toggleClass('disabled', false);
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
