/***********************************************
	Aluno: Giovanni Rotta - 14103948  
	Classe com a estrutura de dados de um Grafo  
    + Algoritmos de busca em largura e profundidade  
    Para determinar se é completo, conexo, fechoTransitivo e se é uma Árvore.

    Exemplo de uso:

    var grafo = new Grafo; 
    grafo.adicionaVertice('a');
	grafo.adicionaVertice('b'); 
	grafo.adicionaVertice('c'); 
	grafo.adicionaVertice('d'); 
	grafo.adicionaVertice('e'); 
	grafo.adicionaVertice('f'); 
	grafo.adicionaVertice('g'); 
	grafo.adicionaVertice('h'); 
	grafo.adicionaVertice('i'); 
	grafo.adicionaVertice('j');
	grafo.conecta('a','b');
	grafo.conecta('a','c');
	grafo.conecta('b','d');
	grafo.conecta('b','e');
	grafo.conecta('c','f');
	grafo.conecta('c','g');
	grafo.conecta('c','h');
	grafo.conecta('g','i');
	grafo.conecta('g','j');
	console.log(grafo.vertices())
	grafo.eConexo();
	//true
	grafo.eArvore();
	//true
	grafo.conecta('e','a');
	grafo.eArvore();
	//false
	grafo.removeVertice('a')
	grafo.eConexo();
	//false

************************************************/

function Grafo () {

	this._vertices = [];
	this._numeroVertices = 0;
	this._numeroArestas = 0;

	this.reiniciarGrafo = function() {
		this._vertices = [];
		this._numeroVertices = 0;
		this._numeroArestas = 0;		
	}

	this.adicionaVertice = function(v, dados){
		if (!this._vertices[v]) {
		this._vertices[v] = {
			_nome: v,
			_dados: dados,
        	_emissor: {},
        	_receptor: {}
      	};
		this._numeroVertices++;
			// console.log('Vértice adicionado');
			return true;
		} else {
			console.log('Este vértice já existe');
			return false;
		}
	};

	this.removeVertice = function(v){
		if (!this._vertices[v]) {
			console.log('Este vértice não existe');
			return;
		} else {
			var verticeRetirar = this._vertices[v]
			var emitidas = verticeRetirar._emissor;
			for (var aresta in emitidas) {
				this.desconecta(v, aresta);
			}
			var recebidas = verticeRetirar._receptor;
			for (var aresta in recebidas) {
				this.desconecta(aresta, v);
			}
 	    this._numeroVertices--;
        delete this._vertices[v];
    	}
    return verticeRetirar;
	};

		 
	this.conecta = function (origem, destino, valor){
		var valor = valor || 0;
		if (this.getArestaEmitida(origem, destino)) {
			return false;
		}
		if (!this._vertices[origem] || !this._vertices[destino]) {
			// console.log('Um dos vértices escolhidos não existe');
			return false;
		} else {
			var aresta =  { _valor: valor };
			var vOrigem = this._vertices[origem]
    		var vDestino = this._vertices[destino]
    		vOrigem._emissor[destino] = aresta;
    		vDestino._receptor[origem] = aresta;
    		this._numeroArestas++;
    		// console.log('Aresta criada');
		}
	};

    this.getArestaEmitida = function(origem, destino) {
	    var vOrigem  = this._vertices[origem];
	    var vDestino = this._vertices[destino];
	    if (!vOrigem || !vDestino) {
			console.log('Um dos vértices escolhidos não existe');
			return true;
	    } else if(!vOrigem._emissor[destino]) {
	    	// console.log('Esta aresta não existe');
			return false;
	    } else {
	    	console.log('Esta aresta já existe');
	      return vOrigem._emissor[destino];
	    }
    };

    this.desconecta = function(origem, destino) {
	    vOrigem = this._vertices[origem];
	    vDestino = this._vertices[destino];
	    var arestaDeletar = this.getArestaEmitida(origem, destino);
	    if (!arestaDeletar) {
	      	console.log('Esta aresta não existe');
			return;
	    }
	    delete vOrigem._emissor[destino];
	    delete vDestino._receptor[origem];
	    this._numeroArestas--;
	    return arestaDeletar;
  	};

  	this.ordem = function(){
  		return this._numeroVertices;
  	};

  	this.vertices = function(){
  		return this._vertices;
  	};

	this.umVertice = function(){
  		return Object.keys(this._vertices)[0];
  	};

  	this.dadosDoVertice = function(v){
  		return this._vertices[v]._dados;
  	};

  	this.adjacentes = function(v){
  		var vertice = this._vertices[v];
  		var colecao = [];
  		if ( !vertice ) {
  			console.log('Este vértice não existe');
  			return;
  		}
  		for (var emitidos in vertice._emissor){
  			colecao.push(emitidos);
  		}
		for (var recebidos in vertice._receptor){
			if( !colecao[recebidos] ){
				 colecao.push(recebidos);
			}
  		}
		return colecao;
  	};

	this.recebidos = function(v){
  		var vertice = this._vertices[v];
  		var colecao = [];
  		for (var recebidos in vertice._receptor){
  			if( !colecao[recebidos] ){
				 colecao.push(recebidos);
			}
  		}
  		return colecao	
  	}

  	this.emitidos = function(v){
  		var vertice = this._vertices[v];
  		var colecao = [];
  		for (var emitidos in vertice._emissor){
  			colecao.push(emitidos);
  		}
  		return colecao	
  	}

  	this.grau = function(v){
		return this.adjacentes(v).length;
  	} 

  	this.eRegular = function(){
  		var vertice = this.umVertice();
  		for(var vertices in this._vertices){
  			if(this.grau(vertice) != this.grau(vertices)){
  				return false;
   			}
  		}
  		return true;
  	};

  	//Utilizando busca em largura
  	this.eCompleto = function(){
  		for(var v in this._vertices){
	  		var marcados  = [];
			var	listaVertices = [];
			var vertice = this._vertices[v];
			marcados[v] = vertice;
			listaVertices.push(vertice);
			while (listaVertices.length > 0) {
				var vertice = listaVertices.shift();
				for (var emitido in vertice._emissor){
					if (!marcados[emitido]) {
						marcados[emitido] = this._vertices[emitido];	
						listaVertices.push(this._vertices[emitido]);
					} 
				}
			}
			//Se o tamanho do array de arestas emitidas des todos vértices for igual ao número de vertices
			// do grafo, então esse grafo é completo.
			if(!(Object.keys(marcados).length == this.ordem())){
				return false;
			}
		}
		return true;
  	};


  	//Utilizando busca em largura
  	this.fechoTransitivo = function(v){
  		var marcados  = [];
		var	listaVertices = [];
		var vertice = this._vertices[v];
		listaVertices.push(vertice);
		while (listaVertices.length > 0) {
			var vertice = listaVertices.shift();
			for (var emitido in vertice._emissor){
				if (!marcados[emitido]) {
					marcados[emitido] = this._vertices[emitido];	
					listaVertices.push(this._vertices[emitido]);
				} 
			}
		}
		return marcados;
  	};

  	//Utilizando busca em largura
  	this.eConexo = function(){
  		for(var v in this._vertices){
	  		var marcados  = [];
			var	listaVertices = [];
			vertice = this._vertices[v];
			marcados[v] = vertice;
			listaVertices.push(vertice);
			while (listaVertices.length > 0) {
				var vertice = listaVertices.shift();
				for (var adjacente in this.adjacentes(vertice._nome)){
					adjacente = this.adjacentes(vertice._nome)[adjacente]
					if (!marcados[adjacente]) {
						marcados[adjacente] = this._vertices[adjacente];	
						listaVertices.push(this._vertices[adjacente]);
					} 
				}
			}
			//Se o tamanho do array de ftd + fti des todos vértices for igual ao número de vertices
			// do grafo, então esse grafo é conexo.
			if(!(Object.keys(marcados).length == this.ordem())){
				return false;
			}
		}
		return true;
  	}

  	this.buscaProfundidade = function(v, marcados){
  		var vertice = this._vertices[v];
  		if (marcados[v] == false) {
  			marcados[v] = true;
  		} else {
  			return marcados;
  		}
  		for (var emitido in vertice._emissor){
  				if (marcados[emitido] == false) {
  					marcados[v] = true;
  					var retorno = this.buscaProfundidade(emitido, marcados)
  					if(!retorno) return false;
  				} else {
  					return false; //Existe Ciclo!
  				}
  			}
  		return marcados;
  	}

  	/* Busca em profundidade em busca de um ciclo */
  	this.eArvore = function(){
  		if(!this.eConexo()) return false;
  		var marcados  = {};
  		for( var v in this._vertices){
  			marcados[v] = false;	
  		}
		for( var v in this._vertices){
  			var retorno = this.buscaProfundidade(v, marcados);
  			if (!retorno) {
  				return false
  			} else {
  				marcados = retorno;
  			}
	  	}
  		return true;
  	}

};
	