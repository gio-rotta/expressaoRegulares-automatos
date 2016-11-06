function DeSimone (expressao) {

    this._expressao = expressao.replace(/\*\*[*]*/g, '*');
    this._alfabeto = [];

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

    this._initComposition = function() {
        var newComposition = {};

        for (var i = 0; i < this._alfabeto.length; i++) {
            newComposition[this._alfabeto[i]] = [];
        }

        return newComposition;
    };

    this._getNextUp = function(index) {
        switch (this._treeRPN[index]) {
            case '*':
                return index;
            case '?':
                return index%2 === 0 ? -1 : Math.floor((index - 1)/2);
            case '|':
                while (this._treeRPN[index] === '*' || this._treeRPN[index] === '|') {
                    index = 2*(index + 1);
                }

                if (this._treeRPN[index] === '?' || this._treeRPN[index] === '*') {
                    return -1;
                }

                return this._getNextRight(index);
            case '.':
                return 2*(index + 1);
                break;
            default:
                return -1;
        }
    };

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
                    console.log(this._treeRPN);
                    console.log(next);

                    if (composition[leaf[leaf.length - 1]].indexOf(leaf) < 0) {
                        composition[leaf[leaf.length - 1]].push(leaf);
                    }

                    if (waiting.length == 0) {
                        endLoop = true;
                    } else {
                        next = waiting.pop();

                        if (this._treeRPN[next] == '*' || this._treeRPN[next] == '?') {
                            if (next === 0 || next%2 === 0) {
                                if (this._getNextRight(next) < 0) {
                                    composition['L'] = true;
                                    endLoop = true;
                                } else {
                                    next = this._getNextRight(next);
                                }
                            } else {
                                next = this._getNextUp(Math.floor((next - 1)/2));

                                if (next === -1) {
                                    composition['L'] = true;
                                    endLoop = true;
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

    this._getNextRight = function (index) {
        var parent = Math.floor((index - 1)/2);

        while (parent%2 === 0) {
            index = parent;
            parent = Math.floor((index - 1)/2);
        }

        return Math.floor((Math.floor((index - 1)/2) - 1)/2);
    };

    this._getCompositionUp = function(start, newComposition) {
        var next = this._getNextUp(start%2 === 0 ? this._getNextRight(start) : Math.floor((start - 1)/2));
        var composition = newComposition ? newComposition : this._initComposition();

        if(next == -1) {
            composition['isFinal'] = true;
            return composition;
        }

        return this._getCompositionDown(next, composition);
    };

    this._findEquivalent = function(states, newComposition) {
        for (var i = 0; i < states.length; i++) {
            var composition = states[i].composition;
            var isEqual = true;

            if (!(composition.hasOwnProperty('L') && newComposition.hasOwnProperty('L'))
                && !(!composition.hasOwnProperty('L') && !newComposition.hasOwnProperty('L'))) {
                continue;
            }

            for (var j = 0; j < this._alfabeto.length; j++) {
                var termComposition = composition[this._alfabeto[j]];

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
	