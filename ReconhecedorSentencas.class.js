function ReconhecedorSentencas () {

	this.verificarSentenca = function(estados, alfabeto, sentenca) {

		// verificar determinismo e determinizar
		var determinizador = new Determinizacao(estados, alfabeto);

		var ehDeterministico = determinizador.verificarDeterminismo();
		if (!ehDeterministico) {
			estados = determinizador.determinizarAutomato();
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

	this.gerarSentencas = function (n, automato) {
	    var strings = [[{'q0': {'string': ''}}]];
        var ret = [];

	    for (var i = 0; i < n; i++) {
            var current = strings[i];
            var next = [];

            for(var k = 0; k < current.length; k++) {
                var state = Object.keys(current[k])[0];

                for (var j = 0; j < automato.alfabeto.length; j++) {
                    var nextState = automato.estados[state].transicoes[automato.alfabeto[j]];

                    if(nextState) {
                        var transition = {};
                        transition[nextState] = {'string': ''};
                        transition[nextState]['string'] = current[k][state].string + automato.alfabeto[j];
                        next.push(transition);
                    }
                }
            }

            strings.push(next)
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