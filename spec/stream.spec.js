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
  it('can take the first n elements', function () {
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
  
  it('can be mapped', function () {
    
  });
})


