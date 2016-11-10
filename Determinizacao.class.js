/**
 * Classe responsável por determinizar autômatos não determinísticos. Ela precisa de dois parâmetros,
 * o objeto estados, correspondente aos estados do autômato e suas transições, e de uma lista de símbolos
 * do alfabeto correspondente a este autômato.
 * @param estados - objeto correspondente aos estados de um autômato e suas transições
 * @param alfabeto - lista de simbolos do alfabeto de um autômato
 */

function Determinizacao(estados, alfabeto) {

    this._alfabeto = alfabeto;
    this._estados = jQuery.extend(true, {}, estados);

    /**
     * @author: Giovanni Rotta
     * Utilizando o algoritmo visto em aula, determiniza as transições do autômato. Primeiro, realiza a verificação de 
     * determinismo utilizando o metodo verificarDeterminismo, caso não seja determínistico, o método continua.
	 * Dentro deste método, existe uma função chamada criarEstadosDeterministicos, que recebe o novo nome do estado como
	 * parâmetro (lista com os estados formadores do novo estado), ela verifica as transições que compõem este estado, e para
	 * cada símbolo do alfabeto cria uma nova transição herdando as transições dos estados verificados, cada nova transição, 
	 * vira um novo estado, chamando de forma recursiva a função, até serem criadas todas as transições.
	 * A função criarEstadosDeterministicos é chamada pela primeira vez passando o estado inicial como parâmetro.
	 * @return Objeto Autômato
	 */
	this.determinizarAutomato = function() {
		// verificar se autômato é determinístico
		var ehDeterministico = this.verificarDeterminismo();
		console.log(ehDeterministico)
		if (ehDeterministico) {
			return 	{
				estados: this._estados,
				alfabeto: this._alfabeto
			}
		}

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
		return {
			estados: novosEstados,
			alfabeto: this._alfabeto
			}
	}

	/**
	 * @author: Giovanni Rotta
	 * Primeiro verifica se existe epsilon transição, caso exista, o método eliminarEpsilonTransicao é chamado, 
	 * após esse passo o método percorre as transições em busca de não determinismo, retorna true caso seja determinístico
	 * e false para o caso contrário.
	 */
	this.verificarDeterminismo = function() {
		var ehDeterministico = true;
		var temEpsilonTransicao = this.verificarEpsilonTransicao();

		if (temEpsilonTransicao) {
			this.eliminarEpsilonTransicao();
		}

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

	/**
	 * @author: Giovanni Rotta
	 * Verifica se existe algum símbolo epsilon no alfabeto(‘&’), caso exista retorna true, caso contrário, retorna false.
	 */
	this.verificarEpsilonTransicao = function() {
    	var espilonTransicao = false;
		for (var indexSimbolo in this._alfabeto) {
			var simbolo = this._alfabeto[indexSimbolo];
			if (simbolo == '&') {
				espilonTransicao = true;
				break;
			}
		}

		return espilonTransicao;
    }

    /**
     * @author: Giovanni Rotta
     * Percorre os estados do autômato, e caso encontre uma transição associada ao símbolo epsilon, 
     * adiciona as transições dos estados resultantes das transições de epsilon ao estado que continha a epsilon transição.
     */
    this.eliminarEpsilonTransicao = function() {
    	var espilonTransicao = false;
    	var estadosQueContemEpsilon = []
    	var estadosPertencentesTransicaoEpsilon = []

		for (var estado in this._estados) {
			var estado = this._estados[estado];

			for (var terminal in estado.transicoes) {
				var transicoes = estado.transicoes[terminal];

				if (terminal === "&") {
					
					for (var transicao in transicoes) {
						var transicao = transicoes[transicao];

						if (transicao) {
							for (var simboloIndex in this._alfabeto) {
								var simbolo = this._alfabeto[simboloIndex];
								if (this._estados[transicao].transicoes[simbolo]) {
									estado.transicoes[simbolo] = _.union(this._estados[transicao].transicoes[simbolo], estado.transicoes[simbolo]);
								}
							}
						}

					}

					delete estado.transicoes['&'];
				}

			}
		}

		var novoAlfabeto = [];
		for (var indexSimbolo in this._alfabeto) {
			var simbolo = this._alfabeto[indexSimbolo];
			if (simbolo != '&') {
				novoAlfabeto.push(this._alfabeto[indexSimbolo]);
			}
		}

		this._alfabeto = novoAlfabeto;
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

}