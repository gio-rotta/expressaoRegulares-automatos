function Minimizacao(estados, alfabeto) {

    this._alfabeto = alfabeto;
    this._estados = estados;
    this._alcancaveis = [];
    this._vivos = [];
    this._listaDeLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','W','Y','Z'];

	this.minimizarAutomato = function() {
		var ehDeterministico = this.verificarDeterminismo();
		if (!ehDeterministico) {
			alert('Não é possível minimizar um autômato não determinístico!');
			return this._estados;
		}
		this.eliminarEstadosInacessíveis();
		this.eliminarEstadosMortos();
		this.eliminarIndefinicoes();
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
		var estadosParaDeletar = _.difference(Object.keys(this._estados), this._alcancaveis);

		for (var i = 0; i < estadosParaDeletar.length; i++) {
			delete this._estados[estadosParaDeletar[i]];
		}
	}

	this.eliminarEstadosMortos = function() {
		var estadosFinais = this.encontrarEstadosFinais();
		var vivos = this._vivos;
		var estados = this._estados;

		for (var i = 0; i < estadosFinais.length; i++) {
			var estadoFinal = this._estados[estadosFinais[i]];
			vivos.push(estadoFinal.id);
		}

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

		for (var i = 0; i < estadosParaDeletar.length; i++) {
			delete this._estados[estadosParaDeletar[i]];
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
				var transicao = estado.transicoes[terminal];
				if (transicao === false) {
					estado.transicoes[terminal][0] = 'Φ';
					counter++;
				}
			}
		}

		if (counter < 1) delete this._estados['Φ'];
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
			for ( var estado in estadosOficiais) {
				estado = estadosOficiais[estado];
				var listaTransicao = [];
				var isEqual = false;
				for (var terminal in estado.transicoes) {
					var transicao = estado.transicoes[terminal][0];
					listaTransicao.push(transicao);
				}

				for (var indexConjunto in listaConjuntos) {
					var conjunto = listaConjuntos[indexConjunto];
					if (_.contains(conjunto, estado.id)) {
						var chaveConjunto = indexConjunto;
					} 
				}

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

			ocorreuMudancas = false;
			if (Object.keys(listaConjuntos).length != Object.keys(novaListaDeConjuntos).length) ocorreuMudancas = true;

			for (var i = 0; i < listaConjuntos.length; i++) {
				if (!_.isEqual(listaConjuntos[i].sort(function(a, b){return a-b}), novaListaDeConjuntos[i].sort(function(a, b){return a-b}))) {
					ocorreuMudancas = true;
				}
			}

			if (ocorreuMudancas) {
				listaConjuntos = novaListaDeConjuntos;
				rodadaConstrucaoEquivalencia()
			} else {
				return;
			}
		}

		rodadaConstrucaoEquivalencia();

		return this.construirNovaTabela(listaConjuntos);
	}

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
	