function Minimizacao(estados, alfabeto) {

    this._alfabeto = alfabeto;
    this._estados = jQuery.extend(true, {}, estados);
    this._alcancaveis = [];
    this._vivos = [];
    this._listaDeLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','W','Y','Z'];

	this.minimizarAutomato = function() {
		var ehDeterministico = this.verificarDeterminismo();
		if (!ehDeterministico) {
			alert('Não é possível minimizar um autômato não determinístico!');
			return this._estados;
		}
		this._estados = this.eliminarEstadosInacessíveis();
		this.eliminarEstadosMortos();
		this._estados = this.eliminarIndefinicoes();
		this.eliminarEstadosEquivalentes();
		return this._estados;
	}

	this.verificarDeterminismo = function() {
		var ehDeterministico = true;
		for (var estado in this._estados) {
			var estado = this._estados[estado];

			for (var terminal in estado.transicoes) {
				var transicoes = estado.transicoes[terminal];
				
				if (transicoes.length > 1) {
					ehDeterministico = false;
				}

			}

		}

		return ehDeterministico;
	}

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
					this._estados[estado].transicoes[transicoes][0] = false;
				}
			}
		}
	}

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

	//Cria estados e transições a partir das classes de equivalência.
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

	this.encontrarEstadoInicial = function() {
		
		for (var i in this._estados) {
			var estado = this._estados[i]
			if (estado.inicial) break;
		}
		return estado;
	}

	this.encontrarEstadosFinais = function() {
		var estadosFinais = [];
		for (var i in this._estados) {
			var estado = this._estados[i]
			if (estado.final) estadosFinais.push(estado.id);
		}
		return estadosFinais;
	}

};
	