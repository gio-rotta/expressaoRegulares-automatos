function DeSimone (expressao) {

    this._expressao = expressao;
    this._alfabeto = _.uniq(expressao.match(/[a-z]/g));
    this._grafo = new Grafo();
    this._contadorDeSimbolos = 1;
	this._simbolosSubstituidos = {};
	this._contadorArvore = -1;
	this._listaNodosEsperandoCostura = [];
	this._listaEspera = [];
	this._folhasEncontradas = [];
	this._contadorEstados = 1;
	this._estadosAutomato = {};

	function spliceSlice(str, index, end, add) {
	  if (index < 0) {
	    index = str.length + index;
	    if (index < 0) {
	      index = 0;
	    }
	  }

	  return str.slice(0, index) + (add || "") + str.slice(end);
	}

	this.construirArvore = function(expressao, raiz) {
		var expressao = (expressao)? expressao : this._expressao;
		// reconhecer parenteses e sustituir por simbolos
		var subexpEntreParenteses = XRegExp.matchRecursive(expressao, '\\(', '\\)', 'g', {
			valueNames: [null, null, 'value', null],
		});

		// for (var i; i < subexpEntreParenteses.length; i++) {
			// subexpEntreParentesesparcial = [];
			// subexpEntreParenteses[i]
		// }

		while(subexpEntreParenteses.length > 0) {
			var obj = subexpEntreParenteses[0];
			expressao = spliceSlice(expressao, obj.start - 1, obj.end + 1, this._contadorDeSimbolos);
			this._simbolosSubstituidos[this._contadorDeSimbolos++] = obj.value;
			var subexpEntreParenteses = XRegExp.matchRecursive(expressao, '\\(', '\\)', 'g', {
				valueNames: [null, null, 'value', null],
			});
		}

		//reconhecer operadores pela ordem, |, ., ?, *
    	var operadorU = expressao.indexOf('|');
    	var operadorC = expressao.indexOf('.');
    	var operadorD = expressao.indexOf('?');
    	var operadorF = expressao.indexOf('*');

    	if (operadorU !== -1) {
    		this._contadorArvore++;
    		this._grafo.adicionaVertice(this._contadorArvore, {folha:false, operador: "|", costura: "false"});
    		this._listaNodosEsperandoCostura.push(this._contadorArvore);
    		if (raiz !== undefined) this._grafo.conecta(raiz, this._contadorArvore);
    		
    		var proximaRaiz = this._contadorArvore;
    		var esq = expressao.slice(0, operadorU);
    		this.construirArvore(esq, proximaRaiz);
    		var dir = expressao.slice(operadorU + 1, expressao.length);
    		this.construirArvore(dir, proximaRaiz);
    	} else if (operadorC !== -1) {
    		this._contadorArvore++;
    		this._grafo.adicionaVertice(this._contadorArvore, {folha:false, operador: ".", costura: "false"});
    		this._listaNodosEsperandoCostura.push(this._contadorArvore);
    		if (raiz !== undefined) this._grafo.conecta(raiz, this._contadorArvore);

			var proximaRaiz = this._contadorArvore;
    		var esq = expressao.slice(0, operadorC);
    		this.construirArvore(esq, proximaRaiz);
    		var dir = expressao.slice(operadorC + 1, expressao.length);
    		this.construirArvore(dir, proximaRaiz);
    	} else if (operadorD !== -1) {
    		this._contadorArvore++;
    		var costura = (this._listaNodosEsperandoCostura.length > 0)? this._listaNodosEsperandoCostura.pop() : 'fim';
    		this._grafo.adicionaVertice(this._contadorArvore, {folha:false, operador: "?", costura: costura});
    		this._listaNodosEsperandoCostura.push(this._contadorArvore);
    		if (raiz !== undefined) this._grafo.conecta(raiz, this._contadorArvore);

    		var esq = expressao.charAt(operadorD - 1);
    		this.construirArvore(esq, this._contadorArvore);
    	} else if (operadorF !== -1) {
    		this._contadorArvore++;
    		var costura = (this._listaNodosEsperandoCostura.length > 0)? this._listaNodosEsperandoCostura.pop() : 'fim';
    		this._grafo.adicionaVertice(this._contadorArvore, {folha:false, operador: "*", costura: costura});
    		this._listaNodosEsperandoCostura.push(this._contadorArvore);
    		if (raiz !== undefined) this._grafo.conecta(raiz, this._contadorArvore);

    		var esq = expressao.charAt(operadorF - 1);
    		this.construirArvore(esq, this._contadorArvore);
    	} else {
    		if (/^\d+$/.test(expressao)) {
				this.construirArvore(this._simbolosSubstituidos[expressao], this._contadorArvore);
    		} else {
    			this._contadorArvore++;
    			var costura = (this._listaNodosEsperandoCostura.length > 0)? this._listaNodosEsperandoCostura.pop() : 'fim';
    			this._grafo.adicionaVertice(this._contadorArvore, {folha:true, costura: costura, valor: expressao });
    			if (raiz !== undefined) this._grafo.conecta(raiz, this._contadorArvore);
    		}
    	}
    	return;
	}

	this.percorrerNodo = function(nodo, direcao) {
		if (nodo === 'fim') {
			this._folhasEncontradas.push(nodo);
			return ['fim'];
		}
		if (!nodo) var nodo = 0;
		if (!direcao) var direcao = 'descer';
		var operador = this._grafo.dadosDoVertice(nodo).operador
		if (operador) {
			if (direcao == 'descer') {
				var proximoNodo = this.rotinasDescer(nodo, operador);
			} else {
				var proximoNodo = this.rotinasSubir(nodo, operador);
			}
			if (proximoNodo) this.percorrerNodo(proximoNodo.nodo, proximoNodo.direcao);
		} else {
			this._folhasEncontradas.push(nodo);
			if (this._listaEspera.length > 0) {
				nodoEsperando = this._listaEspera.pop();
				this.percorrerNodo(nodoEsperando.nodoDestino, nodoEsperando.direcao);
			}
		}
		return this._folhasEncontradas;
	}

	this.rotinasDescer = function(nodo, operador) {
		var recebidos = this._grafo.recebidos(nodo);
		var emitidos = this._grafo.emitidos(nodo)

		if (recebidos.length < 0 || emitidos.length < 0) return false;

		if (operador === '|') {
			this._listaEspera.push({direcao: "descer", nodoDestino: emitidos[1]})
			return { nodo:emitidos[0], direcao: 'descer' };
		} else if (operador === '.') {
			return { nodo:emitidos[0], direcao: 'descer' };
		} else if (operador === '?') {
			var recebido = (recebidos[0])? recebidos[0] : 'fim';
			this._listaEspera.push({direcao: "subir", nodoDestino: this._grafo.dadosDoVertice(nodo).costura})
			return { nodo:emitidos[0], direcao: 'descer' };
		} else if (operador === '*') {
			var recebido = (recebidos[0])? recebidos[0] : 'fim';
			this._listaEspera.push({direcao: "subir", nodoDestino: this._grafo.dadosDoVertice(nodo).costura})
			return { nodo:emitidos[0], direcao: 'descer' };
		}
	}

	this.rotinasSubir = function(nodo, operador) {
		var recebidos = this._grafo.recebidos(nodo);
		var emitidos = this._grafo.emitidos(nodo)
		if (recebidos.length < 0 || emitidos.length < 0) return;

		if (operador === '|') {
			//ignorar tudo e pegar a costura mais a direita
			while (!(this._grafo.dadosDoVertice(nodo).folha)) {
				nodo = ( this._grafo.emitidos(nodo)[1])?  this._grafo.emitidos(nodo)[1] :  this._grafo.emitidos(nodo)[0];
			}
			return { nodo:this._grafo.dadosDoVertice(nodo).costura, direcao: 'subir' };
		} else if (operador === '.') {
			return { nodo:emitidos[1], direcao: 'descer' };
		} else if (operador === '?') {
			var recebido = (recebidos[0])? recebidos[0] : 'fim';
			return { nodo:recebido, direcao: 'subir' };
		} else if (operador === '*') {
			var recebido = (recebidos[0])? recebidos[0] : 'fim';
			this._listaEspera.push({direcao: "subir", nodoDestino: this._grafo.dadosDoVertice(nodo).costura})
			return { nodo:emitidos[0], direcao: 'descer' };
		}	
	}

	this.gerarEstados = function(estado) {
		console.log(estado)
		var originado = this._estadosAutomato[estado].originado;
		this._folhasEncontradas = [];
		var folhas = [];
		// Percorre a árvore a fim de encontrar as folhas alcançaveis.
		if (originado) {
			for (var o = 0; o < originado.length; o++) {
				origem = originado[o]
				folhas = _.union(folhas, this.percorrerNodo(this._grafo.dadosDoVertice(origem).costura, 'subir'));
			}
		} else {
			folhas = this.percorrerNodo();
		}

		// Verifica se as folhas alcançáveis corresponde a algum estado existente.
		var existeEquivalente = this.verificarEquivalencia(folhas, estado);
		if (existeEquivalente) { 
			return false;
		} else {
			this._estadosAutomato[estado].alcancavel = folhas;
		}

		// Para cada letra do afabeto, verifica quais folhas são correspondentes
		for (var l = 0; l < this._alfabeto.length; l++) {
			letra = this._alfabeto[l]
			this._estadosAutomato[estado].transicoes[letra] = false;
			var folhasDaLetra = [];
			var final = false;
			for (var f = 0; f < folhas.length; f++) {
				folha = folhas[f];
				if (folha !== 'fim' && this._grafo.dadosDoVertice(parseInt(folha)).valor == letra) {
					folhasDaLetra.push(folha);
				}
				if (folha === 'fim' ) this._estadosAutomato[estado].final = true;
			}
			if (folhasDaLetra.length > 0) {
				// cria estados correspondentes as transições;
				var nomeEstado = 'q'+this._contadorEstados;
				this._estadosAutomato[estado].transicoes[letra] = nomeEstado;
				this._estadosAutomato['q'+this._contadorEstados] = {
					nome: nomeEstado,
					originado: _.uniq(folhasDaLetra),
					inicial: false,
					final: false,
					transicoes : []
				};
				this._contadorEstados++;
			}
  		}
		for( var t in this._estadosAutomato[estado].transicoes) {
			if (this._estadosAutomato[estado]) {
				var transicao = this._estadosAutomato[estado].transicoes[t]
				if (transicao) {
					this.gerarEstados(transicao);
				}
			}
		}

		return this._estadosAutomato;
	}

	this.verificarEquivalencia = function(folhas, nome) {
		var estadoEquivalente = false;
		for( var i in this._estadosAutomato ) {
			estado = this._estadosAutomato[i]
			//se existir, trocar todos os nomes de transições.
			if (estado.alcancavel) {
				if ( _.isEqual(estado.alcancavel.sort(function(a, b){return a-b}), folhas.sort(function(a, b){return a-b}))) {
					estadoEquivalente = estado.nome;
					delete this._estadosAutomato[nome];
					break;
				}
			}
		}

		if (estadoEquivalente) {
			for( var e in this._estadosAutomato) {
				estado = this._estadosAutomato[e]
				for (var l = 0; l < this._alfabeto.length; l++) {
					letra = this._alfabeto[l]
					if (estado.transicoes[letra] && estado.transicoes[letra] === nome) {
						estado.transicoes[letra] = estadoEquivalente;
						break;
					}
				}
			}
			return true;
		}
		return false;
	}
};
	