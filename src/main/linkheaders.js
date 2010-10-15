/**
 * JavaScript parsing of linkheaders from http://tools.ietf.org/html/draft-nottingham-http-link-header-10
 *
 * Depends on jQuery and $.uritemplate
 * Usage:
 *
 * var linkHeader = 'Link: </collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
 * var links = $.linkheaders(linkHeader);
 * links.find('foo bar').href().expand({ itemId: 'xxx' }) => /collection/xxx
 * links.find(['foz']).href().expand({ itemId: 'xxx' }) => /collection/xxx
 * links.find('baz').rel() => 'foz baz'
 * links.find('foz').rel() => 'application/json
 * links.each() => iterator
 */

(function($, undefined) {
  function linkheader(header) {
    header = $.trim(header);
    var links = [];
    return links;
  }

  $.extend({
    linkheader: linkheader
  })

})(jQuery);