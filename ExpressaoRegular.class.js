function ExpressaoRegular () {

	this._alphabet = [];
    this._expression = "";

	this.verificarExpressao = function(expressao) {
    	var checkLetters = /[^a-z0-9?*|()]/.test(expressao);

        if ( checkLetters || /[*?.|(][*?]/.test(expressao) || /[(][)]/.test(expressao) || /[(]([*?|.\s]|$)/.test(expressao) 
        	|| (/[|]$/.test(expressao) || /^([*?|.\s]|$)/.test(expressao)) ) {
            return false;
        }

        return this.verificadorParenteses(expressao);
	};

	this.verificadorParenteses = function(str){
		var counter = 0;

	  for(var i = 0; i < str.length; i++){
	      counter += (str[i] === '(' ? 1 : (str[i] === ')' ? -1 : 0));

            if (counter < 0)
	            return false;
	  }

	  return counter == 0;
	};

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

                    counter -= 1;
                    stack.pop();
                    break;
                case '*':
                case '?':
                    stack.push(str[i]);
                    break;
                case '|':
                case '.':
                    if (stack.length > 0 && counter === 0) {
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
	