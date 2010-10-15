module('Link Header Testing');

test("header parsing", function() {
  var header = 'Link: </collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
  ok(parse(header), 'We get something truthy back from parsing');
  ok(parse(header).find, 'We get a find function on the return of parsing')
});

function parse(header) {
  return $.linkheader(header);
}