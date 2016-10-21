
var TrabalhoView = Backbone.View.extend({
  el: '.trabalho',
  events : {
    "click .js-tab" : "mudarPanel",
    "keyup .js-er-input" : "verificarER",
    "click .js-deSimone" : "executarDeSimone"
  },

  initialize: function(options) {
    this.expressaoRegular = new ExpressaoRegular();
    this.expressao = '';
  },  

  mudarPanel: function(event) {
    $(event.currentTarget).addClass('active');
    $(event.currentTarget).siblings().removeClass('active');
    var target = $(event.currentTarget).data('tab');
    this.$('.js-'+target).removeClass('hidden');
    console.log()
    this.$('.js-'+target).siblings().addClass('hidden');
  },

  verificarER: function(event) {
    var eValido = this.expressaoRegular.verificarExpressao($(event.currentTarget).val());
    if (!eValido || $(event.currentTarget).val() === '') {
      this.$('.js-save-er').toggleClass('disabled', true);
      this.$('.js-deSimone').toggleClass('disabled', true);
      this.$('.er-validador').text('Expressão Inválida');
      this.$('.er-validador').addClass('text-danger').removeClass('text-success');
    } else {
      this.$('.js-save-er').toggleClass('disabled', false);
      this.$('.js-deSimone').toggleClass('disabled', false);
      this.$('.er-validador').text('Expressão Válida!');
      this.$('.er-validador').removeClass('text-danger').addClass('text-success')
      this.expressao = $(event.currentTarget).val();
    }
  },

  executarDeSimone: function() {
    var deSimone = new DeSimone(this.expressao);
    deSimone.construirArvore();
    deSimone._estadosAutomato['q0'] = { nome: 'q0', inicial: true, transicoes : [] };
    var estados = deSimone.gerarEstados('q0');
    var automatoView = new AutomatoView({estados:estados, alfabeto:deSimone._alfabeto});
    $('.panel-automato').html(automatoView.el);
    automatoView.gerarGrafo('grafo-automato-1');
  }

});

var AutomatoView = Backbone.View.extend({

    tagName: 'table',
    className: 'tabela-automato',

    initialize: function(options) {
      this.estados = options.estados;
      this.alfabeto = options.alfabeto;
      this.gerarTabela();
    },

    gerarTabela: function() {
      var header = this.gerarHeader();
      this.$el.append(header);
      var linhas = this.gerarLinhas();
      this.$el.append(linhas);
    },

    gerarHeader: function() {
      var colunas = '<th class="coluna-nome" >d</th>';
      for (var i = 0; i < this.alfabeto.length; i++) {
        colunas += '<th>'+this.alfabeto[i]+'</th>';
      }
      return '<tr>'+colunas+'</tr>';
    },

    gerarLinhas: function() {
      var linhas;
      console.log(this.estados)
      for (var estado in this.estados) {
        estado = this.estados[estado];
        var inicial = (estado.inicial)? '->' : '';
        var final = (estado.final)? '*' : '';
        var celulas = '<td class="coluna-nome" >'+inicial+final+estado.nome+'</td>';
        for (var transicao in estado.transicoes) {
          transicao = estado.transicoes[transicao];
          if (!transicao) transicao = '-';
          celulas += '<td>'+transicao+'</td>';
        }
        linhas += '<tr>'+celulas+'</tr>'
      }
      return linhas;
    },

    gerarGrafo: function(elemento) {
        $('#'+elemento).html('');
        var nodes = [];
        var edges = [];
        var contador = 1;
        for (var estado in this.estados) {
          var coluna = contador % this.alfabeto.length;
          var linha = this.alfabeto.length / contador ;
          contador++;
          estado = this.estados[estado];
          var inicial = (estado.inicial)? '->' : '';
          var borda = (estado.final)? 4 : 0;
          var corBorda = (estado.final)? '#214f77' : '#337ab7';
          nodes.push({"id":estado.nome, "label":inicial+estado.nome, "borderWidth":borda, "borderColor":'#214f77', "x":coluna, "y":linha, "size":10});
          for (var terminal in estado.transicoes) {
            transicao = estado.transicoes[terminal];
            if (transicao) {
              edges.push({"id": estado.nome+terminal, "source": estado.nome, "target": transicao, "label": terminal, "type":'curvedArrow', "size":1});
            }
          }
        }

        // We gave our own name 'border' to the custom renderer
        sigma.canvas.nodes.border = function(node, context, settings) {
          var prefix = settings('prefix') || '';

          context.fillStyle = node.color || settings('defaultNodeColor');
          context.beginPath();
          context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
          );

          context.closePath();
          context.fill();

          // Adding a border
          context.lineWidth = node.borderWidth || 1;
          context.strokeStyle = node.borderColor || '#fff';
          context.stroke();
        };

        s = new sigma({
          settings: {
            defaultEdgeColor: '#337ab7',
            defaultNodeColor: '#337ab7',
            borderSize: 4,
            defaultEdgeType: 'arrow',
            defaultNodeBorderColor: '#d9534f',
            minArrowSize: 3,
            maxEdgeSize: 3,
            maxNodeSize: 10,
            sideMargin: 0.5,
            drawEdgeLabels: true,
            defaultNodeType: 'border'
          },
          renderer: {              
            container: elemento,
            type: 'canvas'
          },
          graph: { nodes: nodes , edges: edges },
        });
    }


})