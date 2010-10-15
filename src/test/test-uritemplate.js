module('Template URI Testing');


test("getProperty tests", function() {

    expect(15);
    
    var context = {
        "obj" : {
            "str": "ok",
            "int": "1",
            "arr": [2, "way", {"str":"do", "int": 3}]
        },
        "arr" : [4, "wake", {"str":"!", "int": 5}, ["sleep", 6]],
        "str" : "hello",
        "int" : 7,
        "quad.func": function(){return 4;}
    };

    checkProperty(context, "int", 7 );
    checkProperty(context, "str", "hello");
    checkProperty(context, "arr[0]", 4);
    checkProperty(context, "arr[1]", "wake");
    checkProperty(context, "arr[2].str", "!");
    checkProperty(context, 'arr[2]["int"]', 5);
    checkProperty(context, "arr[3][0]", "sleep");
    checkProperty(context, "arr[3][1]", 6);
    checkProperty(context, "obj.int", 1);
    checkProperty(context, "obj.str", "ok");
    checkProperty(context, "obj.arr[0]", 2);
    checkProperty(context, "obj.arr[1]", "way");
    checkProperty(context, "obj.arr[2].str", "do");
    checkProperty(context, "obj.arr[2]['int']", 3);    
    checkProperty(context, "quad.func", context['quad.func']);   
    //checkProperty(context, "alert('me')", 4);       
});

function checkProperty(context, expr, expected) {
    equals($.getProperty(context, expr), expected, "getProperty for [" + expr + "]"); 
}


/*
 * Insipration for tests ripped from draft uritemplate specifications:
 * 
 * http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-01.html#examples
 * http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-02.html#examples
 * http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-03.html#examples
 * 
 */

test("own examples", function() {

    var testdata = {
        "x"  : "one",
        "y"  : {
            "y": 2
        },
        "z.z": function() { return "three" ;}
    }

    var testset = {
        "uri without tokens" :"uri without tokens",
        "-{x}-{y.y}-{z.z}-": "-one-2-three-"           
    }

    uriTests(testdata, testset);
});

test("draft 0.1 examples", function() {

    /*
     * 3.3.1 Examples
     * 
     * Given the following template names and values: Name Value
     */
    var testdata = {
        a :"fred",
        b :"barney",
        c :"cheeseburger",
        d :"one two three",
        e :"20% tricky",
        f :"",
        20 :"this-is-spinal-tap",
        scheme :"https",
        p :"quote=to be or not to be",
        q :"hullo#world"
    }
    /*
     * Table 1
     * 
     * (Note that the name 'wilma' has not been defined, and the value of 'f' is the empty string.)
     * 
     * The following URI Templates will be expanded as shown:
     */
    var testset = {
        "http://example.org/page1#{a}" :"http://example.org/page1#fred",

        "http://example.org/{a}/{b}/" :"http://example.org/fred/barney/",

        "http://example.org/{a}{b}/" :"http://example.org/fredbarney/",

        "http://example.com/order/{c}/{c}/{c}/" :"http://example.com/order/cheeseburger/cheeseburger/cheeseburger/",

        "http://example.org/{d}" :"http://example.org/one%20two%20three",

        "http://example.org/{e}" :"http://example.org/20%25%20tricky",

        "http://example.com/{f}/" :"http://example.com//",

        "{scheme}://{20}.example.org?date={wilma}&option={a}" :"https://this-is-spinal-tap.example.org?date=&option=fred" 
            
    /*
     * , these tests are no longer valid, later clarificatioons of the spec force pcnt-encoding of all generated values
     * "http://example.org?{p}": "http://example.org?quote=to+be+or+not+to+be",
     * 
     * "http://example.com/{q}": "http://example.com/hullo#world"
     */
    };

    uriTests(testdata, testset);
});


test("draft 0.2 examples", function() {

    /*
     * : 3.4 Examples
     * 
     * Given the following template variable names and values: Name: Value
     */

    var testdata = {
        a :"foo",
        b :"bar",
        data :"10,20,30",
        points : [ "10", "20", "30" ],
        list0 : [],
        str0 :"",
        reserved :":/?#[]@!$&'()*+,;=",
        u :"\u2654\u2655",
        a_b :"baz"
    };

    /*
     * The name 'foo' has not been defined, the value of 'str0' is the empty string, and both list0 and points are lists. The
     * variable 'u' is a string of two unicode characters, the WHITE CHESS KING (0x2654) and the WHITE CHESS QUEEN (0x2655).
     * 
     * NOTE: 'listjoin' was replaced with 'list'
     * 
     * The following URI Templates will be expanded as shown:
     */

    var testset = {
        "http://example.org/?q={a}" :"http://example.org/?q=foo",

        "http://example.org/{foo}" :"http://example.org/",

        "relative/{reserved}/" :"relative/%3A%2F%3F%23%5B%5D%40%21%24%26%27%28%29%2A%2B%2C%3B%3D/",

        "http://example.org/{foo=fred}" :"http://example.org/fred",

        "http://example.org/{foo=%25}/" :"http://example.org/%25/",

        "/{-prefix|#|foo}" :"/",

        "./{-prefix|#|str0}" :"./",

        "/{-append|/|a}{-opt|data|points}{-neg|@|a}{-prefix|#|b}" :"/foo/data#bar",

        "http://example.org/q={u}" :"http://example.org/q=%E2%99%94%E2%99%95",

        "http://example.org/?{-join|&|a,data}" :"http://example.org/?a=foo&data=10%2C20%2C30",

        "http://example.org/?d={-list|,|points}&{-join|&|a,b}" :"http://example.org/?d=10,20,30&a=foo&b=bar",

        "http://example.org/?d={-list|,|list0}&{-join|&|foo}" :"http://example.org/?d=&",

        "http://example.org/?d={-list|&d=|points}" :"http://example.org/?d=10&d=20&d=30",

        "http://example.org/{a}{b}/{a_b}" :"http://example.org/foobar/baz",

        "http://example.org/{a}{-prefix|/-/|a}/" :"http://example.org/foo/-/foo/"
    };

    uriTests(testdata, testset);
});


test("draft 0.3 examples", function() {

    /*
     * 4.5. Examples
     * 
     * Given the following template variable names and values: Name Value
     */
    var testdata = {
        foo :"\u03d3",
        bar :"fred",
        baz :"10,20,30",
        qux : [ "10", "20", "30" ],
        corge : [],
        grault :"",
        garply :"a/b/c",
        waldo :"ben & jerrys",
        fred : [ "fred", "", "wilma" ],
        plugh : [ "\u017F\u0307", "\u0073\u0307" ],
        '1-a_b.c' :200
    };

    /*
     * Table 1
     * 
     * The variable 'foo' is the unicode character GREEK UPSILON WITH ACUTE AND HOOK SYMBOL. This character was chosen because it
     * is one of only three characters that has a different normal form for each of the four normalization forms (NFC, NFD, NFKC,
     * NFKD). The name 'xyzzy' has not been defined, the value of 'grault' is the empty string. The variables qux, corge, fred,
     * and plugh are lists.
     * 
     * The following URI Templates will be expanded as shown:
     * 
     * ----
     */

    var testset = {
        "http://example.org/?q={bar}" :"http://example.org/?q=fred",

        "/{xyzzy}" :"/",

        /*
         * we're ignoring the test with the wicked unicode normalization...
         * 
         * "http://example.org/?{-join|&|foo,bar,xyzzy,baz}": "http://example.org/?foo=%CE%8E&bar=fred&baz=10%2C20%2C30",
         */
        "http://example.org/?d={-list|,|qux}" :"http://example.org/?d=10,20,30",

        "http://example.org/?d={-list|&d=|qux}" :"http://example.org/?d=10&d=20&d=30",

        "http://example.org/{bar}{bar}/{garply}" :"http://example.org/fredfred/a%2Fb%2Fc",

        /*
         * currently excluding this test since -prefix operator is not expected yet to work with array's
         * 
         * "http://example.org/{bar}{-prefix|/|fred}": "http://example.org/fred/fred//wilma",
         * 
         * and the same goes for -neg and -suffix currently "{-neg|:|corge}{-suffix|:|plugh}": ":%E1%B9%A1:%E1%B9%A1:",
         */

        "../{waldo}/" :"../ben%20%26%20jerrys/",

        /*
         * again a test for array operation on context values
         * 
         * "telnet:192.0.2.16{-opt|:80|grault}": "telnet:192.0.2.16:80",
         */

        " :{1-a_b.c}:" :" :200:"
    };

    uriTests(testdata, testset);
});


function uriTests( data, set) {

    var count = 0;
    for (pattern in set) {
        count++
    }
    expect(count);
    
    for (pattern in set) {
        var template = $.uritemplate(pattern);
        var res = template.expand(data);
        var expected = set[pattern];

        equals(res, expected, "tested pattern: " + pattern);
    }
}
