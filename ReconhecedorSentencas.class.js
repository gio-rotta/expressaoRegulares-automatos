/**
 * Esta classe envolve duas operações, o reconhecedor de sentenças e o gerador de sentenças, ambos precisam 
 * de um autômato finito para a execução.
 */
function ReconhecedorSentencas () {

    /**
     * @author: Giovanni Rotta
     * Este método recebe como parâmetro o autômato finito, além da sentença a ser reconhecida, primeiro ele verifica se
     * o autômato é determinístico, e no caso negativo ele realiza a determinização com a ajuda da classe Determinizacao,
     * após a realização deste passo, o algoritmo transforma a sentença em um array de caracteres, o último passo é transformar
     * o autômato em uma máquina de estados que sofre uma iteração a cada caracter da lista, mudando o estado atual para o estado
     * resultante da transição, se no final das iterações o estado atual for um estado final, então o método retorna true,
     * caso contrário, retorna false.
     * @param estados - objeto correspondente aos estados de um autômato e suas transições
     * @param alfabeto - lista de simbolos do alfabeto de um autômato
     * @param sentença - sentenca a ser verificada
     * @return bool;
     */
	this.verificarSentenca = function(estados, alfabeto, sentenca) {

		// verificar determinismo e determinizar
		var determinizador = new Determinizacao(estados, alfabeto);

		var ehDeterministico = determinizador.verificarDeterminismo();
		if (!ehDeterministico) {
			var automato = determinizador.determinizarAutomato();
            estados = automato.estados;
            alfabeto = automato.alfabeto;
		}

        var arrayLetras = sentenca.split("");
        var estadoInicial;

        for (var i in estados) {
            var estadoInicial = estados[i]
            if (estadoInicial.inicial) break;
        }

        var estadoAtual = estadoInicial.id;

        for ( var i = 0; i < arrayLetras.length ; i++ ) {
            var letra = arrayLetras[i];

            if (estados[estadoAtual].transicoes[letra]) {
                if (estados[estadoAtual].transicoes[letra][0]) {
                    var estadoAtual = estados[estadoAtual].transicoes[letra][0];
                } else {
                    return false;
                }
            } else {
                return false;
            }

        }

        if (estados[estadoAtual].final) {
            return true;
        } else {
            return false;
        }
	}

    /**
     * @author: Guilherme Nakayama
     * Este método foi implementado seguindo um estilo de algoritmo tipo busca em largura de grafos, dado o estado inicial 
     * do Autômato Finito, e o tamanho das sentenças a serem geradas, a função lista todas as transições possíveis a partir
     * do estado inicial, gerando os próximos estados alcançados, a partir de cada novo estado gerado se repete o processo,
     * gerando novos estados, até chegarmos a n transições que equivalem a todas a possíveis sentenças de tamanho n, note que
     * ao final do algoritmo é necessário checar se o estado alcançado pelo algoritmo é um estado final, só assim a sentença
     * de tamanho n pode ser aceita.
     * @param n - inteiro que representa tamanho das sentenças a serem geredas
     * @param automato - objeto autômato
     * @return lista de possíveis sentenças;
     */
	this.gerarSentencas = function (n, automato) {
	    var strings = [[{'q0': {'string': ''}}]];
        var ret = [];

	    for (var i = 0; i < n; i++) {
            var current = strings[i];
            var next = [];

            for(var k = 0; k < current.length; k++) {
                var state = Object.keys(current[k])[0];

                for (var j = 0; j < automato.alfabeto.length; j++) {
                    if (state && state != 'false') {
                        var nextState = automato.estados[state].transicoes[automato.alfabeto[j]];

                        if(nextState) {
                            var transition = {};
                            transition[nextState] = {'string': ''};
                            transition[nextState]['string'] = current[k][state].string + automato.alfabeto[j];
                            next.push(transition);
                        }
                    }
                }
            }

            if (state) strings.push(next)
        }

        for (var i = 0; i < strings[n].length; i++) {
            var transition = strings[n][i];
            var state = Object.keys(transition)[0];

            if(automato.estados[state].final) {
                ret.push(transition[state]['string']);
            }
        }

        return ret;
    }

}