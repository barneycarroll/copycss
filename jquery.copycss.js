/*
Copyright 2013 Mike Dunn
http://upshots.org/
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($){

	// convenience methods to turn css case ('background-image') to camel ('backgroundImage')
	function camelize(string){
		return string.replace(/\-([a-z])/g, function(a, b){
			return b.toUpperCase();
		});
	}

	// Wrapper function. Returns the appropriate access method dependign on browser implementation.
	var getStyle = (function forkStyleAccessMethod(){
		// Used to test style object iteration
		var testStyles = window.getComputedStyle(document.lastChild, null);

		// The four possible methods for style access
		function getComputedStyleByIndex(dom){
			var style   = window.getComputedStyle(dom, null);
			var product = {};

			if(!style){
				return product;
			}

			var name;
			var camel;
			var value;
			var i, l;

			for (i = 0, l = style.length; i < l; i++){
				name           = style[i];
				camel          = camelize(name);
				value          = style.getPropertyValue(name);
				product[camel] = value;
			}

			return product;
		}

		function getComputedStyleByName(dom){
			var style   = window.getComputedStyle(dom, null);
			var product = {};

			if(!style){
				return product;
			}

			var name;
			var camel;
			var value;
			var i, l;

			for (name in style) {
				camel          = camelize(name);
				value          = style.getPropertyValue(name) || style[name];
				product[camel] = value;
			}

			return product;
		}

		function getCurrentStyle(dom){
			var name;
			var product = {};

			for (name in dom.currentStyle) {
				product[name] = dom.currentStyle[name];
			}
		}

		function getStyleProperty(dom){
			var name;
			var product = {};

			for (name in dom.style) {
				if (typeof dom.style[name] != 'function'){
					product[name] = dom.style[name];
				}
			}
		}

		// Logic to determine which method to return
		if(window.getComputedStyle){
			if(testStyles.length){
				return getComputedStyleByIndex;
			}
			else {
				return getComputedStyleByName;
			}
		}
		else if (window.currentStyle) {
			return getCurrentStyle;
		}
		else if (window.style) {
			return getStyleProperty;
		}
	}());

	$.fn.getStyles = function(only, except){
		var name;
		var product;
		var i, l;

		// if it's a limited list, no need to run through the entire style object
		if(only && only instanceof Array){
			for(i = 0, l = only.length; i < l; i++){
				// since we have the name already, just return via built-in .css method
				name          = only[i];
				product[name] = this.css(name);
			}
		}
		else {
			product = getStyle(this.get(0));
		}

		// remove any styles specified...
		// be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text
		if(except && except instanceof Array){
			for(i = 0, l = except.length; i < l; i++){
				name = except[i];
				delete product[name];
			}
		}

		// one way out so we can process blacklist in one spot
		return product;
	};

	// sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional
	$.fn.copyCSS = function(source, only, except){
		var styles = $(source).getStyles(only, except);
		this.css(styles);
	};

})(jQuery);
