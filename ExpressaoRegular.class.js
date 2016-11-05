function ExpressaoRegular () {

	this._alphabet = [];
    this._expression = "";

	this.verificarExpressao = function(expressao) {
    	var checkLetters = /[^a-z0-9?*|()]/.test(expressao);

        if ( checkLetters || /[*?.|(][*?|]/.test(expressao) || /[(][)]/.test(expressao) || /[(]([*?|.\s]|$)/.test(expressao) || (/[|]$/.test(expressao)) ) {
            return false;
        } else {
        	if (this.verificadorParenteses(expressao)) {
        		return true;
        	} else {
        		return false;
        	}
        }		
	}

	this.verificadorParenteses = function(str){
	  var pos = str.indexOf("("),
	      bracket = 0;
	  var posClose = str.indexOf(")");
	  if ( pos === -1 && posClose === -1) return true;
	  if ( pos === -1 && posClose != -1) return false;

	  for(var x=pos; x<str.length; x++){
	    var char = str.substr(x, 1);    
	    
	    bracket = bracket + (char=="(" ? 1 : (char==")" ? -1 : 0));
	  }
	  
	  if(bracket==0) return true;
	  return false;
	}
};
	