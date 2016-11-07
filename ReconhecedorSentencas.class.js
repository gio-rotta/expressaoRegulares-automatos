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

}