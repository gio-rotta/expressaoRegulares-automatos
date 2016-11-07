
var OperacoesPanelView = Backbone.View.extend({
  el: '.js-lr-panel',

  events : {
    "click .js-salvar-automato" : "salvarAutomato",
    "click .js-abrir-modal-automato" : "abrirModalSalvarAutomato",
    "change .js-lr1-inputfile": "lr1Selecionado",
    "change .js-lr2-inputfile": "lr2Selecionado",
    "click .js-novo-er1" : "novoEr1",
    "click .js-novo-er2" : "novoEr2",
    "keyup .js-er1-input" : "verificarER1",
    "keyup .js-er2-input" : "verificarER2",
    "click .js-interseccao" : "interseccao",
    "click .js-equivalencia" : "equivalencia",
  },
  
  initialize: function(options) {

    this.expressaoRegular = new ExpressaoRegular();
    this.operacoesFormais = new OperacoesFormais();
    this.expressao1 = false;
    this.automato1 = false;
    this.automato1View = false;
    this.lr1Selecionado = false;

    this.expressao2 = false;
    this.automato2 = false;
    this.automato2View = false;
    this.lr2Selecionado = false;

    this.on('new', this.habilitarBotoes);
  },  

  interseccao: function() {
    if (!this.automato1) {
      if (this.expressao1) {
        this.automato1 = this.executarDeSimone(this.expressao1);
      } else {
        alert('Insira uma representação para a linguagem regular 1!');
      }
    }

    if (!this.automato2) {
      if (this.expressao2) {
        this.automato2 = this.executarDeSimone(this.expressao2);
      } else {
        alert('Insira uma representação para a linguagem regular 2!');
      }
    }

    this.$('.section-interseccao').removeClass('hidden');
    this.$('.section-equivalencia').addClass('hidden');

    //gerar complemento de af1
    this.automato1.estados = this.operacoesFormais.complemento(this.automato1.estados, this.automato1.alfabeto);
    this.automato1View = new AutomatoView(this.automato1);
    this.automato1View.gerarTabela();
    this.$el.find('.section-interseccao').find('.js-af1-complemento').html(this.automato1View.el);

    //gerar complemento de af2
    this.automato2.estados = this.operacoesFormais.complemento(this.automato2.estados, this.automato2.alfabeto);
    this.$('.panel-af2-complemento').removeClass('hidden');
    this.automato2View = new AutomatoView(this.automato2);
    this.automato2View.gerarTabela();
    this.$el.find('.section-interseccao').find('.js-af2-complemento').html(this.automato2View.el);

    //gerar uniao de ~af1 e ~af2
    this.automato1 = this.operacoesFormais.uniao(this.automato1.estados, this.automato1.alfabeto, this.automato2.estados, this.automato2.alfabeto)
    this.$('.panel-af1-af2-uniao').removeClass('hidden');
    this.automato1View = new AutomatoView(this.automato1);
    this.automato1View.gerarTabela();
    this.$el.find('.section-interseccao').find('.js-af1-af2-uniao').html(this.automato1View.el);

    //complemento uniao
    this.automato1.estados = this.operacoesFormais.complemento(this.automato1.estados, this.automato1.alfabeto);
    this.$('.panel-af1-interseccao').removeClass('hidden');
    this.automato1View = new AutomatoView(this.automato1);
    this.automato1View.gerarTabela();
    this.$el.find('.section-interseccao').find('.js-af1-interseccao').html(this.automato1View.el);

  },

  equivalencia: function() {
    if (!this.automato1) {
      if (this.expressao1) {
        this.automato1 = this.executarDeSimone(this.expressao1);
      } else {
        alert('Insira uma representação para a linguagem regular 1!');
      }
    }

    if (!this.automato2) {
      if (this.expressao2) {
        this.automato2 = this.executarDeSimone(this.expressao2);
      } else {
        alert('Insira uma representação para a linguagem regular 2!');
      }
    }

    this.$('.section-interseccao').addClass('hidden');
    this.$('.section-equivalencia').removeClass('hidden');

    var automato1 = jQuery.extend(true, {}, this.automato1);
    var automato2 = jQuery.extend(true, {}, this.automato2);
    var automato1Complemento = {};
    var automato2Complemento = {};
    var uniao1 = {};
    var uniao2 = {};
    var diferenca1 = {};
    var diferenca2 = {};

    // Diferenca 1

    //gerar complemento de af1
    automato1Complemento.alfabeto = this.automato1.alfabeto;
    automato1Complemento.estados = this.operacoesFormais.complemento(automato1.estados, automato1.alfabeto);
    var automato1CView = new AutomatoView(automato1Complemento);
    automato1CView.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-af1-complemento').html(automato1CView.el);

    //gerar uniao de ~af1 e af2
    uniao1 = this.operacoesFormais.uniao(automato1Complemento.estados, automato1Complemento.alfabeto, automato2.estados, automato2.alfabeto)
    var automatoUniao1View = new AutomatoView(uniao1);
    automatoUniao1View.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-uniao-1').html(automatoUniao1View.el);

    //complemento uniao
    diferenca1.alfabeto = uniao1.alfabeto;
    diferenca1.estados = this.operacoesFormais.complemento(uniao1.estados, uniao1.alfabeto);
    var automatoDiferenca1View = new AutomatoView(diferenca1);
    automatoDiferenca1View.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-diferenca-1').html(automatoDiferenca1View.el);

    //gerar complemento de af1
    automato2Complemento.alfabeto = this.automato2.alfabeto;
    automato2Complemento.estados = this.operacoesFormais.complemento(this.automato2.estados, this.automato2.alfabeto);
    var automato2CView = new AutomatoView(automato2Complemento);
    automato2CView.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-af2-complemento').html(automato2CView.el);

    //gerar uniao de ~af1 e af2
    uniao2 = this.operacoesFormais.uniao(automato2Complemento.estados, automato2Complemento.alfabeto, this.automato1.estados, this.automato1.alfabeto)
    var automatoUniao2View = new AutomatoView(uniao2);
    automatoUniao2View.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-uniao-2').html(automatoUniao2View.el);

    //complemento uniao
    diferenca2.alfabeto = uniao2.alfabeto;
    diferenca2.estados = this.operacoesFormais.complemento(uniao2.estados, uniao2.alfabeto);
    var automatoDiferenca2View = new AutomatoView(diferenca2);
    automatoDiferenca2View.gerarTabela();
    this.$el.find('.section-equivalencia').find('.js-diferenca-2').html(automatoDiferenca2View.el);
    
  },

  executarDeSimone: function(expressao) {
    var deSimone = new DeSimone(expressao);
    deSimone.construirArvoreRPN();
    var estados = deSimone.gerarEstadosRPN('q0');
    var automato = {isAutomato:true, estados:estados, alfabeto:deSimone._alfabeto};
    return automato;
  },

  verificarER2: function(event) {
    var expressao = $(event.currentTarget).val();
    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    if (!eValido || expressao === '') {
      this.$('.er2-validador').text('Expressão Inválida');
      this.$('.er2-validador').addClass('text-danger').removeClass('text-success');
      this.expressao = false;
    } else {
      this.$('.er2-validador').text('Expressão Válida!');
      this.$('.er2-validador').removeClass('text-danger').addClass('text-success')
      expressao = $(event.currentTarget).val().replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
      this.expressao2 = expressao;
    }
    this.trigger("new", {});
  },

  verificarER1: function(event) {
    var expressao = $(event.currentTarget).val();
    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    if (!eValido || expressao === '') {
      this.$('.er1-validador').text('Expressão Inválida');
      this.$('.er1-validador').addClass('text-danger').removeClass('text-success');
      this.expressao = false;
    } else {
      this.$('.er1-validador').text('Expressão Válida!');
      this.$('.er1-validador').removeClass('text-danger').addClass('text-success')
      expressao = $(event.currentTarget).val().replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
      this.expressao1 = expressao;
    }
    this.trigger("new", {});
  },

  novoEr1: function() {
    this.automato1 = false;
    this.$el.find('.js-er1').removeClass('hidden');
    this.$el.find('.js-tabela-af1').addClass('hidden');
  },

  novoEr2: function() {
    this.automato2 = false;
    this.$el.find('.js-er2').removeClass('hidden');
    this.$el.find('.js-tabela-af2').addClass('hidden');
  },

  lr1Selecionado: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        if (fileData.isAutomato) {
          this.automato1 = {estados:fileData.estados, alfabeto:fileData.alfabeto, elGrafo:'grafo-automato-2'};
          this.automato1View = new AutomatoView(this.automato1);
          this.automato1View.gerarTabela();
          this.$el.find('.js-tabela-af1').html(this.automato1View.el);
          this.$el.find('.js-tabela-af1').removeClass('hidden');
          this.$el.find('.js-er1').addClass('hidden');

        } else if (fileData.isRegex) {
          this.automato1 = false;
          this.$el.find('.js-er1').removeClass('hidden');
          this.$el.find('.js-tabela-af1').addClass('hidden');
          this.$el.find('.js-er1-input').val(fileData.regex);
          this.expressao1 = fileData.regex;
        }
        this.lr1Selecionado = true;
        this.$el.find('js-lr1-upload').addClass('hidden');
        this.trigger("new", {});
      } catch(e) {
        console.log(e);
        alert('Arquivo escolhido não se encontra no formato válido.');
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

  lr2Selecionado: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        if (fileData.isAutomato) {

          this.automato2 = {estados:fileData.estados, alfabeto:fileData.alfabeto, elGrafo:'grafo-automato-2'};
          this.automato2View = new AutomatoView(this.automato2);
          this.automato2View.gerarTabela();
          this.$el.find('.js-tabela-af2').html(this.automato2View.el);
          this.$el.find('.js-tabela-af2').removeClass('hidden');
          this.$el.find('.js-er2').addClass('hidden');
        } else if (fileData.isRegex) {
          this.automato2 = false;
          this.$el.find('.js-er2').removeClass('hidden');
          this.$el.find('.js-tabela-af2').addClass('hidden');
          this.$el.find('.js-er2-input').val(fileData.regex)
          this.expressao1 = fileData.regex;

        }
        this.$el.find('js-lr2-upload').addClass('hidden');
        this.lr2Selecionado = true;
        this.trigger("new", {});
      } catch(e) {
        console.log(e);
        alert('Arquivo escolhido não se encontra no formato válido.');
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

  habilitarBotoes: function() {
    if ((this.automato1 || this.expressao1) && (this.automato2 || this.expressao2)) {
      this.$('.js-interseccao').toggleClass('disabled', false);
      this.$('.js-equivalencia').toggleClass('disabled', false);
    }
  },

});
