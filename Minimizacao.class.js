/**
 * A classe de minimização reúne uma série de métodos que possibilitam a transformação de um autômato em sua versão mínima,
 * para isso a classe recebe como parâmetro os estados do autômato e suas transições em um mesmo objeto, além do alfabeto
 * correspondente.
 * @param estados - objeto correspondente aos estados de um autômato e suas transições
 * @param alfabeto - lista de simbolos do alfabeto de um autômato
 */
function Minimizacao(estados, alfabeto) {

    this._alfabeto = alfabeto;
    this._estados = jQuery.extend(true, {}, estados);
    this._alcancaveis = [];
    this._vivos = [];
    this._listaDeLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','W','Y','Z'];

    /**
     * @author: Giovanni Rotta
     * Este método chama outros métodos da classe na sequência ideal para a realização do minimização de um autômato, 
     * primeiro verifica se o autômato é determinístico utilizando o método verificarDeterminismo da classe Determinizacao,
     * caso o autômato seja não determinístico, o método termina sua execução enviando um alerta ao usuário, após essa etapa
     * ele chama em sequência os métodos eliminarEstadosInacessíveis, seguido por eliminarEstadosMortos, seguido por eliminar
     * indefinições e por último eliminarEstadosEquivalentes. Retorna um novo conjunto de estados, correspondente ao autômato
     * mínimo.
     * @return estados - objeto correspondente aos estados de um autômato e suas transições
     */
	this.minimizarAutomato = function() {
		var determinismo = new Determinizacao(this._estados, this._alfabeto);
		var ehDeterministico = determinismo.verificarDeterminismo();
		if (!ehDeterministico) {
			alert('Não é possível minimizar um autômato não determinístico!');
			return this._estados;
		}
		this._estados = determinismo._estados;
		this._alfabeto = determinismo._alfabeto;
		
		this._estados = this.eliminarEstadosInacessíveis();
		this.eliminarEstadosMortos();
		this._estados = this.eliminarIndefinicoes();
		this.eliminarEstadosEquivalentes();
		return this._estados;
	}

	/**
	 * @author: Giovanni Rotta
	 * A partir do estado inicial encontrado através do método encontrarEstadoInicial, suas transições são percorridas,
	 * os estados alcançados são marcados, estes então passam a ser o novo conjunto de estados.
	 * @return estados - objeto correspondente aos estados de um autômato e suas transições
	 */
	this.eliminarEstadosInacessíveis = function() {
		
		var estadoInicial = this.encontrarEstadoInicial();
		this._alcancaveis.push(estadoInicial.id);
		var alcancaveis = this._alcancaveis;
		var estados = this._estados;

		// percorrer estados alcançaveis
		function percorrerEstadosAlcancaveis(estadoPai) {
			estadoPai = estados[estadoPai];
			for (var terminal in estadoPai.transicoes) {
				var transicao = estadoPai.transicoes[terminal][0];
				if (transicao && !_.contains(alcancaveis, transicao)) {
					alcancaveis.push(transicao)
					percorrerEstadosAlcancaveis(transicao);
				}
			}
			return;
		}

		percorrerEstadosAlcancaveis(estadoInicial.id);
		var estadosParaDeletar = _.difference(Object.keys(estados), this._alcancaveis);
		var novosEstados = {};

		// eliminar estados inacessíveis
		for (var i = 0; i < this._alcancaveis.length; i++) {
			novosEstados[this._alcancaveis[i]] = estados[this._alcancaveis[i]]
		}

		return novosEstados;
	}

	/**
	 * @author: Giovanni Rotta
	 * A partir dos estados finais, obtido através do método encontrarEstadosFinais, todos os estados que de fato 
	 * conseguem chegar aos estados finais são considerados vivos. Os estados finais são adicionados na lista de
	 * estados vivos, e os estados do autômato são percorridos a fim de achar alguma transição que pertença ao conjunto
	 * de vivos, caso isso ocorra este estado é adicionado ao conjunto, e uma nova rodada percorrendo os estados acontece,
	 * até mais nenhum estado ser adicionado.
	 */
	this.eliminarEstadosMortos = function() {
		var estadosFinais = this.encontrarEstadosFinais();
		var vivos = this._vivos;
		var estados = this._estados;

		for (var i = 0; i < estadosFinais.length; i++) {
			var estadoFinal = this._estados[estadosFinais[i]];
			vivos.push(estadoFinal.id);
		}

		// percorrer estados vivos
		function percorrerEstadosVivos() {
			for (var estadoIndex in estados) {
				var estado = estados[estadoIndex];
				for (var terminal in estado.transicoes) {
					var transicao = estado.transicoes[terminal][0];

					if (transicao && _.contains(vivos, transicao) && !_.contains(vivos, estado.id)) {
						vivos.push(estado.id);
						percorrerEstadosVivos(transicao);
					}
				}
			}
			return;
		}

		percorrerEstadosVivos();
		var estadosParaDeletar = _.difference(Object.keys(this._estados), this._vivos);

		// eliminar estados mortos
		for (var i = 0; i < estadosParaDeletar.length; i++) {
			delete this._estados[estadosParaDeletar[i]];
		}

		// eliminar transições mortas
		for (var estado in this._estados) {
			for (var terminal in this._estados[estado].transicoes) {
				if (_.contains(estadosParaDeletar, this._estados[estado].transicoes[terminal][0])) {
					this._estados[estado].transicoes[terminal][0] = false;
				}
			}
		}
	}

	/**
	 * @author: Giovanni Rotta
	 * Caso o autômato contenha estados sem transições para todos os símbolos do alfabeto, um novo estado phi é criado, 
	 * e todos os símbolos sem transições no estado, ganham um transição para o estado phi, que por sua vez, contém transições
	 * para si próprio.
	 * @return estados - objeto correspondente aos estados de um autômato e suas transições
	 */
	this.eliminarIndefinicoes = function() {
		var counter = 0;
		
		this._estados['Φ'] = {
          nome: 'Φ',
          id: 'Φ',
          inicial: false,
          final: false,
          transicoes : {}
      	};
      
      	for (var index in this._alfabeto) {
        	var terminal = this._alfabeto[index];
        	this._estados['Φ'].transicoes[terminal] = [];
        	this._estados['Φ'].transicoes[terminal][0] = 'Φ';
      	}

      	for (var i in this._estados) {
			var estado = this._estados[i];
			for (var terminal in estado.transicoes) {
				var transicao = estado.transicoes[terminal][0];
				if (transicao === false) {
					estado.transicoes[terminal][0] = 'Φ';
					counter++;
				}
			}
		}

		if (counter < 1) delete this._estados['Φ'];
		
		return this._estados;
	}

	/**
	 * @author: Giovanni Rotta
	 * Talvez o método mais complicado da Classe, cria uma lista de conjunto, com dois conjuntos, obtidos através dos estados,
	 * os separando em finais e não finais, após separados, é então chamada uma função nomeada como rodadaConstrucaoEquivalencia,
	 * toda vez que é chamada, esta função percorre todos os elementos dos conjuntos e os divide em novos conjuntos de acordo com
	 * os conjuntos que cada transição pertence, toda vez que ocorre a criação de um novo conjunto, uma variável indica a mudança,
	 * e quando acaba de percorrer os estados, caso esta variável indique mudança, a função é chamada novamente. A lista do conjunto
	 * é então passada como parâmetro para o método, construirNovaTabela.
	 */
	this.eliminarEstadosEquivalentes = function() {
		var listaConjuntos = {};
		var estadosFinais = this.encontrarEstadosFinais();
		var estadosNFinais = _.difference(Object.keys(this._estados), estadosFinais);
		listaConjuntos[this._listaDeLetras.shift()] = estadosFinais;
		listaConjuntos[this._listaDeLetras.shift()] = estadosNFinais

		var estadosOficiais = this._estados;

		function rodadaConstrucaoEquivalencia() {
			
			var novaListaDeConjuntos = {};
			//percorrer todos os estados
			for ( var estado in estadosOficiais) {
				estado = estadosOficiais[estado];
				var listaTransicao = [];
				var isEqual = false;

				// adicionar as transições do estado em uma lista
				for (var terminal in estado.transicoes) {
					var transicao = estado.transicoes[terminal][0];
					listaTransicao.push(transicao);
				}

				//verificar em qual conjunto estado pertence
				for (var indexConjunto in listaConjuntos) {
					var conjunto = listaConjuntos[indexConjunto];
					if (_.contains(conjunto, estado.id)) {
						var chaveConjunto = indexConjunto;
					} 
				}

				// percorre todos os conjuntos para verificar se existe outro equivalente, se existir ele adiciona a este conjunto
				for (var indexConjunto in listaConjuntos) {
					var conjunto = listaConjuntos[indexConjunto];
					if (_.isEqual(_.intersection(_.uniq(listaTransicao), conjunto), _.uniq(listaTransicao))) {
						isEqual = true;
						if (!novaListaDeConjuntos[chaveConjunto]) {
							novaListaDeConjuntos[chaveConjunto] = [];
						}
						novaListaDeConjuntos[chaveConjunto].push(estado.id);
					}
				}

				// caso não exista, cria novo conjunto, de acordo com suas transições
				if (!isEqual) {
					var novoConjunto = '';

					for (var terminal in estado.transicoes) {
						var transicao = estado.transicoes[terminal][0];
						for (var indexConjunto in listaConjuntos) {
							var conjunto = listaConjuntos[indexConjunto];
							if (_.contains(conjunto, transicao)) {
								novoConjunto = novoConjunto+''+indexConjunto;
							}
						}
					}

					
					if (!novaListaDeConjuntos[novoConjunto]) {
						novaListaDeConjuntos[novoConjunto] = [];
					}
					novaListaDeConjuntos[novoConjunto].push(estado.id);

				}
			}

			// verifica se ocorreu mudanças da lista de conjunto nova para a anterior.
			ocorreuMudancas = false;
			if (Object.keys(listaConjuntos).length != Object.keys(novaListaDeConjuntos).length) ocorreuMudancas = true;

			for (var i = 0; i < listaConjuntos.length; i++) {
				if (!_.isEqual(listaConjuntos[i].sort(function(a, b){return a-b}), novaListaDeConjuntos[i].sort(function(a, b){return a-b}))) {
					ocorreuMudancas = true;
				}
			}

			//caso ocorreu mudança continua verificando as classes de equivalência.
			if (ocorreuMudancas) {
				listaConjuntos = novaListaDeConjuntos;
				rodadaConstrucaoEquivalencia()
			} else {
				return;
			}
		}

		rodadaConstrucaoEquivalencia();

		//construir nova tabela com a lista de conjuntos como estados;
		return this.construirNovaTabela(listaConjuntos);
	}

	/**
	 * @author: Giovanni Rotta
	 * Este método percorre a lista de conjuntos, e para cada conjunto cria um estado, as transições do estado são obtidas 
	 * a partir do autômato inicial, verificando sua correspondência aos conjuntos formados. No final do processamento, o
	 * objeto de estados antigos é substituído pelo novo.
	 * @return estados - objeto correspondente aos estados de um autômato e suas transições
	 */
	this.construirNovaTabela = function(conjuntoEstados) {
		var listaEstados = {};

		for (var nomeEstado in conjuntoEstados ) {
			
			var conjunto = conjuntoEstados[nomeEstado];

			listaEstados[nomeEstado] = {
				nome: nomeEstado,
				id: nomeEstado,
				inicial: false,
				final: false,
				transicoes : {}
			};

			for (var indexEstado in conjunto) {
				var estado = conjunto[indexEstado];
				if (this._estados[estado].inicial) {
					listaEstados[nomeEstado].inicial = true;
				}
				if (this._estados[estado].final) {
					listaEstados[nomeEstado].final = true;
				}
			}

			var estadoRepresentado = conjunto[0];
			for (var terminal in this._estados[estadoRepresentado].transicoes) {
				var transicao = this._estados[estadoRepresentado].transicoes[terminal][0];
				var transicaoRepresentada;

				for (var indexConjunto in conjuntoEstados ) {
					var conjuntoRepresentado = conjuntoEstados[indexConjunto];
					if (_.contains(conjuntoRepresentado, transicao)) {
						transicaoRepresentada = indexConjunto;
						break;
					}
				}

				listaEstados[nomeEstado].transicoes[terminal] = [];
				listaEstados[nomeEstado].transicoes[terminal][0] = transicaoRepresentada;
			}
		}

		this._estados = listaEstados;
	}

    /**
     * @author: Giovanni Rotta
     * Percorre os estados em busca do estado inicial, finaliza sua execução ao encontrá-lo e o retorna.
     * @return estado inicial
     */
	this.encontrarEstadoInicial = function() {
		
		for (var i in this._estados) {
			var estado = this._estados[i]
			if (estado.inicial) break;
		}
		return estado;
	}

    /**
     * @author: Giovanni Rotta
     * Percorre os estados em busca dos estados finais, adicionando-os em uma lista.
     * @return lista de estados finais
     */
	this.encontrarEstadosFinais = function() {
		var estadosFinais = [];
		for (var i in this._estados) {
			var estado = this._estados[i]
			if (estado.final) estadosFinais.push(estado.id);
		}
		return estadosFinais;
	}

};
	