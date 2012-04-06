var Stream = require('../lib/index.js');

describe('streams', function () {
  it('can have finite streams', function () {
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


