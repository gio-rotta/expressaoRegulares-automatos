/**
 * Esta classe é responsável por duas operações que serão usadas para a realização de duas operações que serão 
 * usadas para determinar a intersecção de autômatos, assim como equivalência.
 */
function OperacoesFormais () {

	/**
	 * @author: Giovanni Rotta
	 * Este método é responsável pela realização do complemento de um autômato, recebido por parâmetro, 
	 * para isso ele utiliza a classe Determinização para determinar o autômato caso necessário, e também a
	 * class Minimização para eliminar indefinições (deixar o autômato completo). Após a realização destas duas
	 * operações o método simplesmente inverte os estados finais pelos estados não finais. O método retorna os novos
	 * estados do autômato.
	 * @param estados - objeto correspondente aos estados de um autômato e suas transições
 	 * @param alfabeto - lista de simbolos do alfabeto de um autômato
 	 * @return estados - objeto correspondente aos estados de um autômato e suas transições
	 */
	this.complemento = function(estados, alfabeto) {

		// verificar determinismo e determinizar
		var determinizador = new Determinizacao(estados, alfabeto);

		var ehDeterministico = determinizador.verificarDeterminismo();
		if (!ehDeterministico) {
			var automato = determinizador.determinizarAutomato();
			estados = automato.estados;
			alfabeto = automato.alfabeto;
		}

		// completar automato
    	var minimizador = new Minimizacao(estados, alfabeto);
    	estados = minimizador.eliminarIndefinicoes();

    	//Inverter Estados
    	for (var estado in estados) {
    		var estado = estados[estado];
    		if (estado.final) {
    			estado.final = false;
    		} else  {
    			estado.final = true;
    		}
    	}

    	return estados
	}

	/**
	 * @author: Giovanni Rotta
	 * Este método recebe por parâmetro os dois estados que irá realizar a união, primeiro ele renomeia os estados de ambos
	 * autômatos em uma sequência numérica, para evitar estados com nomes iguais, após este passo ele junta ambos estados em
	 * um mesmo objeto. O terceiro passo do algoritmo é inserir um novo estado inicial, cuja transição será as mesmas dos
	 * estados iniciais antigos, estes por sua vez, deixam de ser iniciais, caso um deles seja também final, o novo estado
	 * inicial também passa a ser final. O método retorna os novos estados do autômato, assim como o alfabeto.
	 * @param estados1 - objeto correspondente aos estados de um autômato e suas transições
 	 * @param alfabeto1 - lista de simbolos do alfabeto de um autômato
 	 * @param estados2 - objeto correspondente aos estados de um autômato e suas transições
 	 * @param alfabeto2 - lista de simbolos do alfabeto de um autômato
 	 * @return Objeto Autômato
	 */
	this.uniao = function(estados1, alfabeto1, estados2, alfabeto2) {
		var index = 1;
		var novoEstados1 = {};
		var novoEstados2 = {};
    	//renomear estados para evitar conflitos
    	var alfabetoResultante = _.union(alfabeto1, alfabeto2);
    	
    	for(var estadoAlterado in estados1) {

    		var novoNome = 'Q'+index;
    		estadoAlterado = estados1[estadoAlterado];

		    for (var indexAlfabeto in alfabetoResultante) {
		    	var letra = alfabetoResultante[indexAlfabeto];
		    	
		    	for(var estado in estados1) {
					estado = estados1[estado];
					if (estado.transicoes[letra]) {
						for (var transicao in estado.transicoes[letra]) {
							if (estado.transicoes[letra][transicao] == estadoAlterado.id) {
								estado.transicoes[letra][transicao] = 'Q'+index;
							}
						}
					} else {
						estado.transicoes[letra] = [false]							
					}
				}
			}

		    estadoAlterado.nome = novoNome;
    		estadoAlterado.id = novoNome;
    		index++;
    	}

    	for(var estadoAlterado in estados1) {
    		estadoAlterado = estados1[estadoAlterado];
    		novoEstados1[estadoAlterado.id] = estadoAlterado;
    	}

    	//renomear estados para evitar conflitos
    	for(var estadoAlterado in estados2) {

    		var novoNome = 'Q'+index;
    		estadoAlterado = estados2[estadoAlterado];

		    for (var indexAlfabeto in alfabetoResultante) {
		    	var letra = alfabetoResultante[indexAlfabeto];
		    	
		    	for(var estado in estados2) {
					estado = estados2[estado];
					if (estado.transicoes[letra]) {
						for (var transicao in estado.transicoes[letra]) {
							if (estado.transicoes[letra][transicao] == estadoAlterado.id) {
								estado.transicoes[letra][transicao] = 'Q'+index;
							}
						}
					} else {
						estado.transicoes[letra] = [false]							
					}
				}
		    }

		    estadoAlterado.nome = novoNome;
    		estadoAlterado.id = novoNome;
    		index++;
    	}

    	for(var estadoAlterado in estados2) {
    		estadoAlterado = estados2[estadoAlterado];
    		novoEstados2[estadoAlterado.id] = estadoAlterado;
    	}

		// juntar estados
		var estadosResultante = _.extend(novoEstados1, novoEstados2);

		// criar estado inicial para união

		// capturar estados iniciais antigos
		estadosIniciais = [];
		var final = false;
		for (var i in estadosResultante) {
			var estado = estadosResultante[i]
			if (estado.final) final = true;
			if (estado.inicial) {
				estadosIniciais.push(estado)
				estado.inicial = false;
			}
		}

		estadosResultante['Q0'] = {
			nome: 'Q0',
			id: 'Q0',
			inicial: true,
			final: final,
			transicoes : {}
		};

		// criar Transicoes do novo estado incial
		for (var i in estadosIniciais) {
			var estado = estadosIniciais[i]
			for (var indexTerminal in alfabetoResultante) {
				var terminal = alfabetoResultante[indexTerminal];
				var transicoes = estado.transicoes[terminal]
				if (!estadosResultante['Q0'].transicoes[terminal]) {
					estadosResultante['Q0'].transicoes[terminal] = [];
				}
				if (estado.transicoes[terminal]) {
					for (var transicao in transicoes) {
						if (transicoes[transicao]) {
							estadosResultante['Q0'].transicoes[terminal].push(transicoes[transicao]);
						}
					}
				}
			}
		}

		for (var indexTerminal in alfabetoResultante) {
			terminal = alfabetoResultante[indexTerminal];
			if (!estadosResultante['Q0'].transicoes[terminal][0]) {
				estadosResultante['Q0'].transicoes[terminal][0] = false
			};
		}

		return { 
			estados: estadosResultante,
			alfabeto: alfabetoResultante
		};
	}
};


	