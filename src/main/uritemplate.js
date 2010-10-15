// *************************************************************************//
// * URI Template Library *//
// * James M Snell (jasnell@gmail.com) *//
// * http://www.snellspace.com *//
// * Apache License 2.0 *//
// *************************************************************************//
// * Example: *//
// * *//
// * var t = new Template("http://example.org{-prefix|/|foo}"); *//
// * var c = { "foo" : "bar" }; *//
// * var r = t.expand(c); *//
// * -> r = http://example.org/bar *//
// * *//
// *************************************************************************//

/**
 * Resources on URI-templating: Article: - http://www.ibm.com/developerworks/web/library/wa-uri/
 * 
 * Spec in progress: - http://www.ietf.org/internet-drafts/draft-gregorio-uritemplate-03.txt (note previous drafts become
 * unavailable) - http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-03.html
 * 
 * James' implementation - http://www.snellspace.com/public/template.js @ blog: http://www.snellspace.com/wp/?p=831 @ test:
 * http://www.snellspace.com/public/templatelab.html
 * 
 * Maillists: - on the spec: http://lists.w3.org/Archives/Public/uri/
 */

/**
 * Contents of the file lifted from http://www.snellspace.com/public/template.js
 * 
 * This file has been edited for inclusion in the kauri project. 
 * The following items were changed: 
 * - added namespacing to kauri and tests for dependencies 
 * - replaced adding 'contains' function to the prototype of Array by the jQuery.inArray(item, array) equivalent 
 * - added constant BIDIREGEXP - based on our own tests we also fixed: 
 * - replace-all tokens fix (was only replacing the first occurance before) 
 * - listjoin operator was renamed to list (0.3) 
 * - making %HH codes uppercase (per recommendation of URI rfc) - converting number-values automatically
 * - allowing sub-references on context-objects through $.getProperty()
 * 
 * Added feature
 * - opts grouping of features:
 *   - iri (as it was before) 
 *   - skipEscape: boolean to control if %HH replacements should be made or not: without the replacing this templates get broader use outside URI scopes.
 *
 *
 * Adapted further to be less namespaced, not require 'new' call
 */
(function($, undefined) {

  var EXPR_REGEXP = /[.[]/; // tests if this is an expression to evaluate
  var SUBPROP_REGEXP = /^(\w+)([.[].*)$/;  // matches [1] for the propname and [2] for the remainder
  var INDEXPROP_REGEXP = /^\[("([^"]+)"|'([^']+)'|(\d*))\](.*)$/; // produces [2] or [3] for propnames or [4] for index number + \5 for remainder
    
  /**
     * Gets a property as noted in a js expression (including array and property references) from a context object.
     * <p>Supported sub-property notations include:
     * <ul> <li>x.y</li>
     *      <li>x["y"] or x['y']</li>
     *      <li>x[1]></li>
     *
     * @param {context} 
     *      object to read property from
     * @param {expr}
     *      expression to be evaluated versus the context 
     */
  $.getProperty = function (context, expr) {
    if (!$.trim(expr) || context == undefined) return context;
        
    // fast turn around for the simplest case.
    if (Object.hasOwnProperty.call(context,expr)) return context[expr];
    // no need to further evaluate if there is no expression inside:
    if (!EXPR_REGEXP.test(expr))
      return undefined;
        
        
    /* unsafe eval implementation
         * disadvantages: 
         *   1/ inherited context through with() 
         *   2/ eval could execute unwanted things
         *   3/ method call-arguments should not be expressed             
        var result = undefined;
        with (context) {
            try {
                result = eval(expr);
            } catch (e) {
            }
        }
        return result;
        */
        
    var subexpr, remainder;

    // switch between two options: starts with '[' or not
    if (expr.charAt(0) == '[') {  // expression starts with ["abc"] ['xyz'] or [123]
      var match = INDEXPROP_REGEXP.exec(expr);
      if (match) {
        subexpr = match[2] || match[3] || match[4];
        remainder = match[5];
      }
      else {
        throw "incorrect index-property syntax in expression= " + expr;
      }
    } else { // expression starts with normal character
      var match = SUBPROP_REGEXP.exec(expr);
      if (match) {
        subexpr = match[1];
        remainder = match[2];
      }
      else {
        throw "incorrect sub-property syntax in expression= " + expr;
      }
    }
    var subcontext = $.getProperty(context, subexpr);
    if (remainder.charAt(0) == '.')
      remainder = remainder.substring(1);
    return $.getProperty(subcontext, remainder);
  }
    
    
  function Template() {

    var template = arguments[0];
    this.opts = arguments[1];
    this.template = Template.stripBidi(template);
    this.tokens = Template.initTokens(template);
    this.variables = Template.initVariables(this.tokens);
  }

  Template.contains = function( array, item) {

    return ($.inArray(item, array) != -1);
  }

  var BIDIREGEXP = /[\u202A\u202B\u202D\u202E\u200E\u200F\u202C]/g;
  Template.stripBidi = function() {

    var str = arguments[0];
    return str.replace(BIDIREGEXP, "");
  }

  Template.opregex = /^\{-([^\|]+)\|([^\|]+)\|([^\|\}]+)\}$/
  Template.tregex = /^\{([^\}]+)\}$/
  Template.initTokens = function() {

    var template = arguments[0];
    var vars = new Array();
    var tokens = template.match(/\{[^{}]+\}/g);
    if (tokens) {
      for ( var i = 0; i < tokens.length; i++) {
        if (!Template.contains(vars, tokens[i]))
          vars.push(tokens[i]);
      }
    }
    return vars;
  }
  Template.initVariables = function() {

    var tokens = arguments[0];
    var vars = new Array();
    for ( var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token.match(Template.opregex)) {
        var matches = Template.opregex.exec(token);
        matches = matches[3].split(/\s*,\s*/);
        for ( var n = 0; n < matches.length; n++) {
          var name = matches[n].split(/\s*=\s*/)[0];
          if (!Template.contains(vars, name))
            vars.push(name);
        }
      } else {
        var matches = Template.tregex.exec(token);
        var name = matches[1].split(/\s*=\s*/)[0];
        if (!Template.contains(vars, name))
          vars.push(name);
      }
    }
    return vars;
  }
  Template.evaluate = function() {

    var template = arguments[0];
    var token = arguments[1];
    var context = arguments[2];
    var uriEscape = arguments[3];
        
    if (token.match(Template.opregex)) {
      var matches = Template.opregex.exec(token);
      switch (matches[1]) {
        case "prefix":
          // TODO fix to work with arrays!
          var value = Template.getVarValue(matches[3], context, null);
          return value ? matches[2] + Template.escape(value, template.opts) : "";
          break;
        case "append":
          var value = Template.getVarValue(matches[3], context, null);
          return value ? Template.escape(value, template.opts) + matches[2] : "";
          break;
        case "opt":
          var vars = matches[3].split(/\s*,\s*/);
          for ( var n = 0; n < vars.length; n++) {
            var value = Template.getVarValue(vars[n], context, null);
            if (value)
              return matches[2];
          }
          return "";
        case "neg":
          var vars = matches[3].split(/\s*,\s*/);
          for ( var n = 0; n < vars.length; n++) {
            var value = Template.getVarValue(vars[n], context, null);
            if (value)
              return "";
          }
          return matches[2];
        case "list":
          var value = Template.getVarValue(matches[3], context, null);
          var sep = matches[2];
          var rep = "";
          for ( var n = 0; n < value.length; n++) {
            if (n > 0)
              rep += sep;
            rep += Template.escape(value[n], template.opts);
          }
          return rep;
          break;
        case "join":
          var rep = "";
          var vars = matches[3].split(/\s*,\s*/);
          var sep = matches[2];
          for ( var n = 0; n < vars.length; n++) {
            var name = vars[n];
            var value = Template.getVarValue(name, context, null);
            if (value) {
              if (rep.length > 0)
                rep += sep;
              rep += name.split(/\s*=\s*/)[0] + "=" + Template.escape(value, template.opts);
            }
          }
          return rep;
          break;
      }
    } else {
      var matches = Template.tregex.exec(token);
      return Template.getVarOrDefaultValue(matches[1], context, "", template.opts);
    }
  }

  Template.getVarOrDefaultValue = function() {

    var variable = arguments[0].split(/\s*=\s*/);
    var context = arguments[1];
    var defval = arguments[2];
    var opts = arguments[3];

    var name = variable[0];
    var def = variable[1];
    var value = $.getProperty(context, name);
    if (value instanceof Function) {
      value = value();
    }

    if (value != undefined || value != null)
      return Template.escape(value, opts);
    else if (def)
      return def;
    else
      return defval;
  }

  Template.getVarValue = function() {

    var variable = arguments[0].split(/\s*=\s*/);
    var context = arguments[1];
    var defval = arguments[2];
    var name = variable[0];
    var def = variable[1];
    var value = context[name];
    if (value instanceof Function) {
      value = value();
    }
    return value ? value : def ? def : defval;
  }
  Template.escape = function() {
    var str = arguments[0];
    var opts = arguments[1];
    if (opts && opts.skipEscape)
      return str;
        
    // TODO the URI template spec forces a specific unicode normalization to happen on the characters
    // we have to check in what way that algorithm is available inside the browser/to the javascript
    var iri = opts && opts.iri || undefined;

    str = "" + str; // ensure numbers are cast to string before escaping
    var ret = "";
    for ( var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);

      if (!iri && !Template.isunreserved(c)) {
        ret += Template.utf8escape(c);
      } else if (iri && !Template.isiunreserved(c)) {
        ret += Template.utf8escape(c);
      } else {
        ret += String.fromCharCode(c);
      }
    }
    return ret;
  }
  Template.isunreserved = function() {

    var c = arguments[0];
    return (c >= 48 && c <= 57) || (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c == 45 || c == 46 || c == 95 || c == 126;
  }
  Template.isiunreserved = function() {

    var c = arguments[0];
    return Template.isunreserved(c) || (c >= 0x00a0 && c <= 0xd7ff) || (c >= 0xF900 && c <= 0xfdcf)
    || (c >= 0xFDF0 && c <= 0xfeff) || (c >= 0x10000 && c <= 0x1FFFD) || (c >= 0x20000 && c <= 0x2FFFD)
    || (c >= 0x30000 && c <= 0x3FFFD) || (c >= 0x40000 && c <= 0x4FFFD) || (c >= 0x50000 && c <= 0x5FFFD)
    || (c >= 0x60000 && c <= 0x6FFFD) || (c >= 0x70000 && c <= 0x7FFFD) || (c >= 0x80000 && c <= 0x8FFFD)
    || (c >= 0x90000 && c <= 0x9FFFD) || (c >= 0xA0000 && c <= 0xAFFFD) || (c >= 0xB0000 && c <= 0xBFFFD)
    || (c >= 0xC0000 && c <= 0xCFFFD) || (c >= 0xD0000 && c <= 0xDFFFD) || (c >= 0xE0000 && c <= 0xEFFFD);
  }
  Template.utf8escape = function() {

    var c = arguments[0];
    ret = "";
    if (c < 128) {
      ret += "%" + c.toString(16).toUpperCase();
    } else if ((c > 127) && (c < 2048)) {
      ret += "%" + ((c >> 6) | 192).toString(16).toUpperCase();
      ret += "%" + ((c & 63) | 128).toString(16).toUpperCase();
    } else {
      ret += "%" + ((c >> 12) | 224).toString(16).toUpperCase();
      ret += "%" + (((c >> 6) & 63) | 128).toString(16).toUpperCase();
      ret += "%" + ((c & 63) | 128).toString(16).toUpperCase();
    }
    return ret;
  }
  Template.expand = function() {

    var template = arguments[0];
    var context = arguments[1];
    return new Template(template).expand(context);
  }

  Template.makeTokenReplaceRegex = function( text) {

    text = text.replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\|/g, "\\|");
    return new RegExp(text, "g");
  }

  Template.prototype = {
    expand : function() {

      var context = arguments[0];
      var template = this.template;
      for ( var i = 0; i < this.tokens.length; i++) {
        var token = this.tokens[i];
        var value = Template.evaluate(this, token, context);
        var allToken = Template.makeTokenReplaceRegex(token); // the leading \ ensures that {20} is not considered a
        // regex-quantifier
        template = template.replace(allToken, value);
      }
      return template;
    }
  }


  $.extend({
    uritemplate: function(template, options) {
      return new Template(template, options);
    }
  });
})(jQuery);