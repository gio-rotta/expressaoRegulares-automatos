function DeSimone (expressao) {

    this._expressao = expressao.replace(/\*\*[*]*/g, '*');
    this._alfabeto = [];

    /**
     * @author: Guilherme Nakayama
     * Constrói e retorna a árvore que será utilizada no algoritmo De Simone,
     * a partir de uma ER em notação pós fixada. A árvore construida é apenas um array em que a posição 0 representa
     * a raiz, e para calcular o filho da direita no nodo i, usa-se a expressão 2*i + 1, e para o filho esquerdo 2*(i +1)
     * @return A árvore de De Simone
     */
	this.construirArvoreRPN = function(expressao) {
        var tree = [];
        var index = 0;
        var alphabet = '';
        var counter = 1;
        var waiting = [];

	    expressao = (expressao)? expressao : this._expressao;

        for (var i = expressao.length - 1; i >= 0; i--) {
            switch (expressao[i]) {
                case '*':
                case '?':
                    tree[index] = expressao[i];
                    tree[2*index + 1] = '';
                    tree[2*(index + 1)] = '';
                    index = 2*index + 1;
                    break;
                case '|':
                case '.':
                    tree[index] = expressao[i];
                    tree[2*index + 1] = '';
                    tree[2*(index + 1)] = '';
                    waiting.push(index);
                    index = 2*(index + 1);
                    break;
                default:
                    tree[index] = counter + '-' + expressao[i];

                    if (alphabet.indexOf(expressao[i]) < 0) {
                        alphabet = alphabet + expressao[i];
                    }

                    index = 2*waiting.pop() + 1;
                    counter++;
                    break;
            }
        }

        this._alfabeto = alphabet.split('');
        this._treeRPN = tree;
        return tree;
    };

    /**
     * @author: Guilherme Nakayama
     * Cria e retorna a estrutura que representa a composição inicial de um estado a ser analisado pelo algoritmo De Simone.
     * @return Composição incial
     */
    this._initComposition = function() {
        var newComposition = {};

        for (var i = 0; i < this._alfabeto.length; i++) {
            newComposition[this._alfabeto[i]] = [];
        }

        return newComposition;
    };

    /**
     * @author: Guilherme Nakayama
     * Calcula o próximo nodo a ser lido de um movimento de subida,
     * por exemplo, caso o índice passado seja de um nodo do tipo concatenação,
     * a função retorna o filho da direita deste nodo.
     * @return Posição na �rvore do pr�ximo nodo ap�s uma s�bida
     */
    this._getNextUp = function(index) {
        switch (this._treeRPN[index]) {
            case '*':
                return index;
            case '?':
                return this._getNextUp(index%2 === 0 ? this._getNextRight(index) : Math.floor((index - 1)/2));
            case '|':
                while (this._treeRPN[index] === '.' || this._treeRPN[index] === '|') {
                    index = 2*(index + 1);
                }

                return this._getNextUp(this._getNextRight(index));
            case '.':
                return 2*(index + 1);
            default:
                return -1;
        }
    };

    /**
     * @author: Guilherme Nakayama
     * Efetua a rotina de descida a partir do índice do nodo passado, e modifica o objeto composição de acordo com as
     * folhas encontradas na rotina de descida.
     * @return Retorna a nova composição.
     */
    this._getCompositionDown = function(start, newComposition) {
        var endLoop = false;
        var next = start;
        var composition = newComposition ? newComposition : this._initComposition();
        var waiting = [];

        while (!endLoop) {
            switch (this._treeRPN[next]) {
                case '*':
                    waiting.push(next);
                    next = 2*next + 1;
                    break;
                case '?':
                    waiting.push(next);
                    next = 2*next + 1;
                    break;
                case '|':
                    waiting.push(next);
                    next = 2*next + 1;
                    break;
                case '.':
                    next = 2*next + 1;
                    break;
                default:
                    var leaf = this._treeRPN[next];
		    var aux = next;

                    if (composition[leaf[leaf.length - 1]].indexOf(leaf) < 0) {
                        composition[leaf[leaf.length - 1]].push(leaf);
                    }

                    if (waiting.length == 0) {
                        endLoop = true;
                    } else {
                        next = waiting.pop();

                        if (this._treeRPN[next] == '*' || this._treeRPN[next] == '?') {
                            if (next % 2 === 0) {
                                if (this._getNextRight(next) < 0) {
                                    composition['L'] = true;
                                    endLoop = true;
                                    next = -1;
                                } else {
                                    next = this._getNextRight(next);

                                    if ((waiting.indexOf(next) >= 0 && (this._treeRPN[next] == '*' || this._treeRPN[next] == '?')) || next == -1) {
                                        endLoop = true;
                                        composition['L'] = true;
                                    } else {
                                        next = this._getNextUp(next);

                                        if(next == -1) {
                                            endLoop = true;
                                            composition['L'] = true;
                                        }
                                    }

                                }
                            } else {
                                next = this._getNextUp(Math.floor((next - 1) / 2));

                                if (next === -1) {
                                    composition['L'] = true;
					if(waiting.length === 0) {
                                    		endLoop = true;
					}else{
						next = aux;
					}
                                }
                            }
                        } else {
                            next = 2 * (next + 1);
                        }
                    }

                    break;
            }
        }

        return composition;
    };

    /**
     * @author: Guilherme Nakayama
     * Calcula a costura de um nodo filho a direita, segue a lógica de que a costura de um nodo filho da direita
     * sempre será o pai do primeiro nodo antecessor que é filho da esquerda, caso não exista, a costura vai para lambda.
     * @return Posição na �rvore do pr�ximo nodo ap�s uma s�bida  de um nodo a direita
     * */
    this._getNextRight = function (index) {
        var parent = Math.floor((index - 1)/2);

        while (parent%2 === 0) {
            index = parent;
            parent = Math.floor((index - 1)/2);
        }

        return Math.floor((parent - 1)/2);
    };

    /**
     * @author: Guilherme Nakayama
     * Calcula a subida a partir de um nodo folha, e aplica a rotina de descida no nodo da costura do nodo folha.
     * @return Retorna a nova composição.
     */
    this._getCompositionUp = function(start, newComposition) {
        var next = this._getNextUp(start%2 === 0 ? this._getNextRight(start) : Math.floor((start - 1)/2));
        var composition = newComposition ? newComposition : this._initComposition();

        if(next == -1) {
            composition['L'] = true;
            return composition;
        }

        return this._getCompositionDown(next, composition);
    };

    /**
     * @author: Guilherme Nakayama
     * Calcula se a nova composição gerada é equivalente a algum estado já gerado pelo algoritmo, caso seja,
     * retorna o estado equivalente, caso contrário retorna null.
     * @return O nome do estado equivalente ou null
     */
    this._findEquivalent = function(states, newComposition) {
        for (var i = 0; i < states.length; i++) {
            var composition = states[i].composition;
            var isEqual = true;

            if ((composition.hasOwnProperty('L') && !newComposition.hasOwnProperty('L')) || (!composition.hasOwnProperty('L') && newComposition.hasOwnProperty('L'))) {
                continue;
            }

            for (var j = 0; j < this._alfabeto.length; j++) {
                var termComposition = composition[this._alfabeto[j]];

                if (termComposition.length !== newComposition[this._alfabeto[j]].length) {
                    isEqual = false;
                    break;
                }

                for (var k = 0; k < termComposition.length; k++) {
                    var newTermComposition = newComposition[this._alfabeto[j]];
                    isEqual = false;

                    for (var t = 0; t < newTermComposition.length; t++) {
                        if (newTermComposition[t] === termComposition[k]) {
                            isEqual = true;
                            break;
                        }
                    }

                    if (!isEqual) {
                        break;
                    }
                }

                if (!isEqual) {
                    break;
                }
            }

            if (isEqual) {
                return states[i].name;
            }
        }

        return undefined;
    };

    /**
     * @author: Guilherme Nakayama
     * Gera os estados do autômato finito equivalente à ER em notação pós-fixada, recebe os estados gerados até o momento,
     * o índice do estado a ser analisado, e o índice do último estado gerado ainda não analisado,
     * caso novos estado sejam gerados a partir do estado analisado, de forma recursiva chama  mesma função para os novos estado gerados.
     * @return O array de estados gerados at� o momento.
     */
    this._gerarEstadosRPN = function (states, start, end) {
        var created = 0;

        for (var i = 0; i < this._alfabeto.length; i++) {
            if (states[start].composition[this._alfabeto[i]].length > 0) {
                var composition = states[start].composition[this._alfabeto[i]];
                var newComposition = this._initComposition();

                for (var t = 0; t < composition.length; t++) {
                    newComposition = this._getCompositionUp(this._treeRPN.indexOf(composition[t]), newComposition);
                }

                var state = this._findEquivalent(states, newComposition);

                if (state === undefined) {
                    states[start].transitions[this._alfabeto[i]] = 'q' + states.length;

                    states.push({
                        'name': 'q' + states.length,
                        'transitions': {},
                        'composition': newComposition,
                        'isFinal': Object.keys(newComposition).indexOf('L') >= 0,
                        'initial': false
                    });

                    created++;
                } else {
                    states[start].transitions[this._alfabeto[i]] = state;
                }
            } else {
                states[start].transitions[this._alfabeto[i]] = '-';
            }
        }

        for (var i = end; i < end + created ; i++) {
            this._gerarEstadosRPN(states, i, states.length);
        }
        
        return states;
    };

    /**
     * @author: Guilherme Nakayama
     * Converte os estados do autômato gerado, para a formatação usada na representação gráfica do autômato.
     * @return Estados convertidos
     */
    this._convert = function (states) {
        var r = {};

        for (var i = 0; i < states.length; i++) {
            var transitions = {};

            for (var terminal in states[i].transitions) {
                transitions[terminal] = states[i].transitions[terminal] === '-' ? false : [states[i].transitions[terminal]];
            }

            r[states[i].name] = {
                'nome': states[i].name,
                'id': states[i].name,
                'transicoes': transitions,
                'final': states[i].isFinal,
                'inicial': states[i].initial
            }
        }

        return r
    };

    /**
     * @author: Guilherme Nakayama
     * Método público que inicia o algoritmo de De Simone, faz a primeira rotina de descida a partir do nodo raiz,
     * e chama o método _geraEstadosRPN(), para o resultado do estado inicial q0 obtido.
     * * @return Estados do AF
     */
    this.gerarEstadosRPN = function() {
        var states = [{
            'name': 'q0',
            'transitions': {},
            'composition': this._getCompositionDown(0),
            'initial': true
        }];

        states[0]['isFinal'] = Object.keys(states[0].composition).indexOf('L') >= 0;

        this._gerarEstadosRPN(states, 0, states.length);

        return this._convert(states);
    };
};
	
