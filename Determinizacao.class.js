function Determinizacao(estados, alfabeto) {

    this._alfabeto = alfabeto;
    this._estados = estados;
    this._listaDeLetras = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','X','W','Y','Z'];

	this.determinizarAutomato = function() {
		// verificar se autômato é determinístico
		var ehDeterministico = this.verificarDeterminismo();
		if (ehDeterministico) return this._estados;

		var estadoInicial = this.encontrarEstadoInicial();
		var estados = this._estados;
		var alfabeto = this._alfabeto;
		var novosEstados = {};

		criarEstadosDeterministicos(JSON.stringify([estadoInicial.id]));

		function criarEstadosDeterministicos(transicoes) {


			var final = false;
			var transicoes = JSON.parse(transicoes)
			//se alguma transição que compõe o estado for final, então estado é final
			for (var transicaoIndex in transicoes) {
				var transicao = transicoes[transicaoIndex];
				if (transicao) {
					if (estados[transicao].final) {
						final = estados[transicao].final;
					}
				}
			}

			// nome do estado é o conjunto das transições
			var nomeEstado = JSON.stringify(transicoes);

			// criar estado
			novosEstados[nomeEstado] = {
				nome: nomeEstado,
				id: nomeEstado,
				inicial: false,
				final: final,
				transicoes : {}
			}

			var listaTransicoes = [];

			// percorre cada estado que compõe o novo estado
			for (var t = 0; t < JSON.parse(nomeEstado).length; t++) {
				var estado = JSON.parse(nomeEstado)[t];
	
				if (estado) {
					// verifica em cada letra do alfabeto as transições equivalentes
					for (var terminal in alfabeto) {
						terminal = alfabeto[terminal];
						var transicoes = estados[estado].transicoes[terminal];

						for (var transicaoIndex in transicoes) {
						 	if (!transicoes[transicaoIndex] || transicoes[transicaoIndex] == null) {
						 		delete transicoes[transicaoIndex];
							}
						}

						if (!transicoes) {
							estados[estado].transicoes[terminal] = [];
						}

						if (!(transicoes[0] == null)) {
						
							if (!listaTransicoes[terminal]) {
								listaTransicoes[terminal] = [];
							}

							listaTransicoes[terminal] = _.union(listaTransicoes[terminal], transicoes);
						}
					}
				}
			}
			
			//adicionar transições resultantes por letra do alfabeto
			for (var terminal in alfabeto) {
				console.log(terminal)
				terminal = alfabeto[terminal];

				if (!novosEstados[JSON.stringify(listaTransicoes[terminal])] && listaTransicoes[terminal]) {
					criarEstadosDeterministicos(JSON.stringify(listaTransicoes[terminal]));
				}

				if (listaTransicoes[terminal]) {
					novosEstados[nomeEstado].transicoes[terminal] = []
					novosEstados[nomeEstado].transicoes[terminal][0] = JSON.stringify(listaTransicoes[terminal]);
				} else {
					novosEstados[nomeEstado].transicoes[terminal] = []
					novosEstados[nomeEstado].transicoes[terminal][0] = false;
				}
			}
		}
		
		novosEstados[JSON.stringify([estadoInicial.id])].inicial = true;
		return novosEstados;
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

	this.encontrarEstadoInicial = function() {		
		for (var i in this._estados) {
			var estado = this._estados[i]
			if (estado.inicial) break;
		}
		return estado;
	}

}