module('Link Header Testing');

test("header parsing", function() {
  var header = 'Link: </collection/{itemId}>; rel="foo foz bar"; type="application/json", </fozzes/{fozId}>; rel="foz baz"; type="application/json"';
  ok(parse(header), 'We get something truthy back from parsing');
  ok(parse(header).find, 'We get a find function on the return of parsing');
  ok(parse(header).find('baz'), 'We get something truthy back from find')
  ok(!parse(header).find('floopadoop'), 'We do not get something by passing a bad ref');
  ok(parse(header).find('foz').href(), 'We get something truthy back from calling href on a found link')
  equals(parse(header).find('foz').href().expand(), '/collection/', 'We get /collection/ from expanding href w/o args')
  equals(parse(header).find('baz').href().expand({ fozId: 'xxx'}), '/fozzes/xxx', 'We get /fozzes/xxx from expanding href w/ args')
  equals(parse(header).find(['foo', 'foz']).rels().join(' '), 'foo foz bar', 'We get [foo foz bar] from calling refs');
  equals(parse(header).find('baz foz').attr('type'), 'application/json', 'We get application/json from calling type');
  equals(parse(header).find('baz foz').attr('media'), '', 'We get empty string from calling media');
});

function parse(header) {
  return $.linkheader(header);
}