/*

 @author Rowan Crawford (wombleton@gmail.com)
 @version 0.2
 @requires jQuery, $.uritemplate
 @link http://github.com/wombleton/linkheaders

 JavaScript parsing of linkheaders as per http://tools.ietf.org/html/draft-nottingham-http-link-header-10

 Usage:
 var linkHeader = '</collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
 var links = $.linkheaders(linkHeader);
 links.find('foo bar').href().expand({ itemId: 'xxx' }) => /collection/xxx
 links.find(['foz']).href().expand({ itemId: 'xxx' }) => /collection/xxx
 links.find('baz').rel() => 'foz baz'
 links.find('foz').attr('type') => 'application/json
 links.findAll('foz') => Array with two links
 links.each(fn) => calls fn(i, link) on each link.
 links.each('foo', fn) => calls fn(i, link) on each link that has rel 'foo'.

 MIT License

*/

(function($, undefined) {
  var URI_TEMPLATE = /^\s*<(.+)>/,
      RELS = /rel\s*=\s*"([^"]+)"/,
      ATTR_NAMES = ['anchor', 'rev', 'hreflang', 'media', 'title', 'type'];

  function Link(link) {
    var attrs = {},
        href,
        rels;

    href = (link.match(URI_TEMPLATE) || [])[1];
    rels = ((link.match(RELS) || [])[1] || '').split(' ');
    $.each(ATTR_NAMES, function(i, name) {
      var re = new RegExp(name + '\s*=\s*"([^"]+)"');
      attrs[name] = (link.match(re) || [])[1] || '';
    });

    return {
      attr: function(key) {
        return attrs[key];
      },
      resolve: function(obj) {
        return this.template().expand(obj);
      },
      template: function() {
        return $.uritemplate(href);
      },
      rels: function() {
        return rels;
      },
      match: function(matches) {
        matches = $.isArray(matches) ? matches : matches.split(' ');

        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          if ($.inArray(match, rels) < 0) {
            return false;
          }
        }
        return true;
      }
    }
  }

  function Links(header) {
    var links = [];

    $.each(($.trim(header) || '').split(','), function(i, link) {
      link = new Link(link);
      links.push(link);
    });

    function find(rels) {
      var links = findAll(rels);
      return links.length ? links[0] : null;
    }

    function findAll(rels) {
      var i,
          link,
          result = [];

      for (i = 0; i < links.length; i++) {
        link = links[i];
        if (!rels || link.match(rels)) {
          result.push(link);
        }
      }
      return result;
    }

    return {
      each: function(rels, fn) {
        if ($.isFunction(rels)) {
          fn = rels;
          rels = undefined;
        }
        $.each(findAll(rels), fn);
      },
      find: find,
      findAll: findAll
    }
  }

  function linkheaders(header) {
    return new Links(header);
  }

  $.extend({
    linkheaders: linkheaders
  })

})(jQuery);