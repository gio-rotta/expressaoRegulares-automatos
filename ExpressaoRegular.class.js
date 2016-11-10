/**
 * A classe de ExpressaoRegular é responsável por validar e formatar expressões regulares inseridas no campo texto.
 */

function ExpressaoRegular () {

	this._alphabet = [];
    this._expression = "";

    /**
     * @author: Giovanni Rotta
     * Faz a verificação da expressão através de expressões regulares nativas do Javascript, limita a expressão a ter somente 
     * letras minúsculas, dígitos e símbolos representantes das operações vista em aula (*|()?), realiza algumas verificações
     * para evitar que operações sejam colocadas sem respectivos símbolos do alfabeto ou em lugares impróprios, no caso negativo
     * retorna um false, e por fim chama o método verificador de parênteses, para se certificar da corretude dos mesmos e retorna
     * seu valor.
     * @param expressão - string que representa a expressão regular
     * @return bool - true or false
     */
	this.verificarExpressao = function(expressao) {
    	var checkLetters = /[^a-z0-9?*|()]/.test(expressao);

        if ( checkLetters || /[*?.|(][*?]/.test(expressao) || /[(][)]/.test(expressao) || /[(]([*?|.\s]|$)/.test(expressao) 
        	|| (/[|]$/.test(expressao) || /^([*?|.\s]|$)/.test(expressao)) ) {
            return false;
        }

        return this.verificadorParenteses(expressao);
	};

    /**
     * @author: Giovanni Rotta
     * Método responsável por inserir o símbolo ‘.’ entre os símbolos da expressão, evidenciando a concatenação. 
     * Retorna a expressão com os símbolos ‘.’ inseridos.
     * @param expressão - string que representa a expressão regular
     */
    this.inserirConcatenacao = function(str) {
        var expressao = str.replace(/([a-z0-9*?)](?!$|[)*?|]))/g,'$1.');
        expressao = expressao.replace(/([a-z0-9]\*)/g,'($1)');
        expressao = expressao.replace(/([a-z0-9]\?)/g,'($1)');
        return expressao;
    }

    /**
     * @author: Giovanni Rotta
     * Um contador, responsável por informar se a quantidade de parênteses que abrem, equivale a quantidade de parênteses
     * que fecham, retorna true para o caso da contagem estar equivalente, e false do contrário.
     * @param expressão - string que representa a expressão regular
     * @return bool - true or false
     */
	this.verificadorParenteses = function(str){
		var counter = 0;

	  for(var i = 0; i < str.length; i++){
	      counter += (str[i] === '(' ? 1 : (str[i] === ')' ? -1 : 0));

            if (counter < 0)
	            return false;
	  }

	  return counter == 0;
	};

    /**
     * @author: Guilherme Nakayama
     * Este método transforma a expressão passada como argumento no formato infixado para o formato pós-fixado.
     * Este formato é usado ao longo do algoritmo de De Simone pois foi considerado mais fácil pelo grupo trabalhar
     * com esta notação.
     * @param expressão - string que representa a expressão regular
     * @return expressãoRPN - string que representa a expressão regular no formato RPN
     */
	this.getRPN= function(str) {
	    var aux = '';
        var stack = [];
        var counter = 0;

        for (var i = 0; i < str.length; i++) {
            switch (str[i]) {
                case '(':
                    counter += 1;
                    stack.push('(');
                    break;
                case ')':
                    while(stack[stack.length - 1] != '(') {
                        aux = aux + stack.pop();
                    }

                    if ((i + 1) < str.length && (str[i + 1] === '*' || str[i + 1] === '?')) {
                        aux = aux + str[i + 1];
                        i++;
                    }

                    counter -= 1;
                    stack.pop();
                    break;
                case '*':
                case '?':
                    stack.push(str[i]);
                    // aux = aux + str[i];
                    break;
                case '|':
                    if (stack.length > 0 && stack[stack.length - 1] != '(') {
                        aux = aux + stack.pop();
                    }

                    stack.push(str[i]);
                    break;
                case '.':
                    if (stack.length > 0 && stack[stack.length - 1] != '|' && (stack[stack.length - 1] != '(')) {
                        aux = aux + stack.pop();
                    }

                    stack.push(str[i]);
                    break;
                default:
                    aux = aux + str[i];
                    break;
            }
        }

        while(stack.length > 0) {
            aux = aux + stack.pop();
        }

		return aux;
	};
};
	