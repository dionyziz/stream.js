var Stream = require('../lib/index.js');

describe('finite streams', function () {
  it('can be made and accessess', function () {
    var finite = Stream.make(10, 20, 30);
    expect(finite.length()).toBe(3);
    expect(finite.head()).toBe(10);
    expect(finite.item(0)).toBe(10);
    expect(finite.item(1)).toBe(20);
    expect(finite.item(2)).toBe(30);
  });
  
  it('has a head and tail', function () {
    var ini = {};
    var fin = {};
    var duo = Stream.make(ini, fin);
    
    expect(duo.head()).toBe(ini);
    expect(duo.tail().head()).toBe(fin);
    expect(duo.tail().tail().empty()).toBeTruthy();
  });
  
  it('detects membership', function () {
    var stooges = Stream.make("Curly", "Moe", "Larry");
    expect(stooges.member("Curly")).toBeTruthy();
    expect(stooges.member("Bobert")).toBeFalsy();
  });
});

describe('range', function () {
  it('can make ranges from a minimum value to a maximal', function () {
    var three_to_seven = Stream.range(3, 7);
    
    expect(three_to_seven.length()).toBe(5);
    expect(three_to_seven.item(0)).toBe(3);
    expect(three_to_seven.item(1)).toBe(4);
    expect(three_to_seven.item(2)).toBe(5);
    expect(three_to_seven.item(3)).toBe(6);
    expect(three_to_seven.item(4)).toBe(7);
  });
  
  it('has an optional highest value', function () {
    var ten_plus = Stream.range(10);
    expect(ten_plus.head()).toBe(10);
    expect(ten_plus.tail().head()).toBe(11);
  });
  
  it('defaults to the natural numbers', function () {
    var naturals = Stream.range();    
    expect(naturals.head()).toBe(1);
    expect(naturals.tail().head()).toBe(2);
  });
});

describe('standard functional functions', function () {
  it('takes', function () {
    var naturals = Stream.range();
    var first_three_naturals = naturals.take(3);
    
    expect(first_three_naturals instanceof Stream).toBeTruthy();
    expect(first_three_naturals.length()).toBe(3);
    expect(first_three_naturals.item(0)).toBe(1);
    expect(first_three_naturals.item(1)).toBe(2);
    expect(first_three_naturals.item(2)).toBe(3);
    expect(function () {first_three_naturals.item(3);})
      .toThrow('Item index does not exist in stream.')
  });
  
  it('drops', function () {
    oldComment = {};
    oldestComment = {};
    newComment = {};
    newestComment = {};
    var comments = Stream.make(oldestComment, oldComment, newComment, newestComment);
    var newComments = comments.drop(2);
    expect(newComments.length()).toBe(2);
    expect(newComments.member(oldComment)).toBeFalsy();
    expect(newComments.member(newComment)).toBeTruthy();
    expect(newComments.head()).toBe(newComment);
    expect(newComments.tail().head()).toBe(newestComment);
  })
  
  it('maps', function () {
    var alphabet_ascii = Stream.range(97, 122);
    var alphabet = alphabet_ascii.map(function (code) {
      return String.fromCharCode(code);
    });
    
    expect(alphabet.head()).toBe('a');
    expect(alphabet.tail().head()).toBe('b');
    expect(alphabet.item(25)).toBe('z');
  });
  
  it('filters', function () {
    var first_ten_naturals = Stream.range(1, 10);
    var first_five_evens = first_ten_naturals.filter(function (n) {
      return (n % 2 === 0);
    });
    
    expect(first_five_evens.length()).toBe(5);
    first_five_evens.map(function (n) {
      expect(n / 2).toBe(Math.floor(n / 2));
    });
  });
  
  it('reduces', function () {
    var first_twenty_naturals = Stream.range(1, 20);
    var twentieth_triangular_number = first_twenty_naturals.reduce(function (prior, current) {
      return prior + current;
    }, 0);
    
    expect(twentieth_triangular_number).toBe(210);
  });
});

describe('special numeric stream functions', function () {
  it('sums', function () {
    var first_twenty_naturals = Stream.range(1, 20);
    var twentieth_triangular_number = first_twenty_naturals.sum();
    expect(twentieth_triangular_number).toBe(210);
  });
  
  it('scales', function () {
    var first_ten_naturals = Stream.range(1, 10);
    var first_ten_evens = first_ten_naturals.scale(2);
    
    expect(first_ten_evens.length()).toBe(10);
    expect(first_ten_evens.head()).toBe(2);
    expect(first_ten_evens.item(9)).toBe(20);
  })
});


