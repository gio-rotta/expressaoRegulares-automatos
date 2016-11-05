var RegexPanelView = Backbone.View.extend({
  el: '.js-er-panel',

  events : {
    "click .js-tab" : "mudarPanel",
    "keyup .js-er-input" : "verificarER",
    "click .js-deSimone" : "executarDeSimone",
    "click .js-salvar-regex" : "salvarRegex",
    "click .js-abrir-modal-regex" : "abrirModalSalvarRegex",
    "change .js-regex-inputfile": "regexSelecionado",
    "click .js-salvar-automato" : "salvarAutomato",
    "click .js-abrir-modal-automato" : "abrirModalSalvarAutomato",
    "click .js-fechar-modal-regex" : "fecharModalRegex",
    "click .js-fechar-modal-automato" : "fecharModalAutomato",
  },

  initialize: function(options) {
    this.expressaoRegular = new ExpressaoRegular();
    this.expressao = '';
    this.automato = '';
  },  

  regexSelecionado: function(event) {
    $in = $(event.currentTarget);
    var fileData;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
      try {
        fileData = JSON.parse(text);
        if (!fileData.isRegex) {
          alert('Arquivo especificado não representa uma expressão regular!')
        } else {
          $('.js-er-input').val(fileData.regex);
          this.expressao = fileData.regex;

        }
      } catch(e) {
        alert('Arquivo escolhido não se encontra no formato válido.')
      }  
    }.bind(this);
    reader.readAsText($in[0].files[0]);
  },

  abrirModalSalvarAutomato: function(event) {
    this.$el.append($('#saveAutomatoModal').modal('show'));
  },

  salvarAutomato: function(event) {
    // serialize JSON directly to a file
    var name = $('.js-nome-automato').val();
    console.log(JSON.stringify(this.automato))
    this.download(name+'.json', JSON.stringify(this.automato));
    $(document.body).append($('#saveAutomatoModal').modal('hide'));
  },

  fecharModalAutomato: function() {
    $(document.body).append($('#saveAutomatoModal').modal('hide'));
  },

  fecharModalRegex: function() {
    $(document.body).append($('#saveRegexModal').modal('hide'));
  },

  abrirModalSalvarRegex: function(event) {
    this.$el.append($('#saveRegexModal').modal('show'));
  },

  salvarRegex: function(event) {
    // serialize JSON directly to a file
    var name = $('.js-nome-regex').val();
    this.download(name+'.json', JSON.stringify({isRegex:true, regex: this.expressao}));
    $(document.body).append($('#saveRegexModal').modal('hide'));
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

  verificarER: function(event) {
    // adicionar concatenação a expressão
    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    expressao = $(event.currentTarget).val().replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
    if (!eValido || expressao === '') {
      this.$('.js-save-er').toggleClass('disabled', true);
      this.$('.js-deSimone').toggleClass('disabled', true);
      this.$('.er-validador').text('Expressão Inválida');
      this.$('.er-validador').addClass('text-danger').removeClass('text-success');
    } else {
      this.$('.js-save-er').toggleClass('disabled', false);
      this.$('.js-deSimone').toggleClass('disabled', false);
      this.$('.er-validador').text('Expressão Válida!');
      this.$('.er-validador').removeClass('text-danger').addClass('text-success')
      expressao = $(event.currentTarget).val().replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
      this.expressao = expressao;
    }
  },

  executarDeSimone: function() {
    var deSimone = new DeSimone(this.expressao);
    deSimone.construirArvore();
    deSimone._estadosAutomato['q0'] = { nome: 'q0', id:'q0', inicial: true, transicoes : {}, };
    console.log(deSimone._grafo)
    var estados = deSimone.gerarEstados('q0');
    this.automato = {isAutomato:true, estados:estados, alfabeto:deSimone._alfabeto};
    var automatoView = new AutomatoView({estados:estados, alfabeto:deSimone._alfabeto, elGrafo:'grafo-automato-1'});
    automatoView.gerarTabela();
    this.$('.panel-automato').html(automatoView.el);
    automatoView.gerarGrafo();
  }

});