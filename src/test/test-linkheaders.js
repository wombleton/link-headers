module('Link Header Testing');

test("header parsing", function() {
  var header = 'Link: </collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
  ok(parse(header), 'We get something truthy back from parsing');
  ok(parse(header).find, 'We get a find function on the return of parsing');
  ok(parse(header).find('baz'), 'We get something truthy back from find')
  ok(!parse(header).find('floopadoop'), 'We do not get something by passing a bad ref');
  ok(parse(header).find('foz').template(), 'We get something truthy back from calling template on a found link');
  equals(parse(header).find('foz').template().expand(), '/collection/', 'We get /collection/ from expanding template w/o args');
  equals(parse(header).find('baz').template().expand({ fozId: 'xxx'}), '/fozzes/xxx', 'We get /fozzes/xxx from expanding template w/ args');
  equals(parse(header).find('baz').resolve({ fozId: 'xxx'}), '/fozzes/xxx', 'resolve is a synonum for href().expand');
  equals(parse(header).find(['foo', 'foz']).rels().join(' '), 'foo foz bar', 'We get [foo foz bar] from calling refs');
  equals(parse(header).find('baz foz').attr('type'), 'application/json', 'We get application/json from calling type');
  equals(parse(header).find('baz foz').attr('media'), '', 'We get empty string from calling media');
  ok(parse(header).each, 'An each method exists');
});

function parse(header) {
  return $.linkheaders(header);
}