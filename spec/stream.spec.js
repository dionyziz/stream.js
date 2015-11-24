/* globals describe, it, expect */

"use strict";

var Stream = require('../lib/index');

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

  it("appends another stream", function() {
    var s0 = new Stream();
    var s1 = Stream.make(1);
    var s2 = Stream.make(2, 3);
    var appended_stream1 = s1.append(s2);
    var appended_stream2 = s0.append(s2);
    expect(appended_stream1.head()).toBe(1);
    expect(appended_stream1.item(1)).toBe(2);
    expect(appended_stream1.item(2)).toBe(3);
    expect(appended_stream1.length()).toBe(3);
    expect(s2).toBe( appended_stream2 );
  });

  it("compares 2 streams for equality", function() {
    var s1 = Stream.make(1);
    var s2 = Stream.make(1);
    var s3 = Stream.make(2, 3);
    expect(Stream.equals(s1,s2)).toBeTruthy;
    expect(Stream.equals(s1,s3)).toBeFalsy;
  });
});

describe('construction', function () {
  it('can be created from array', function () {
    var test_stream = Stream.fromArray([1, 2, 3]);

    expect(test_stream.head()).toBe(1);
    expect(test_stream.item(1)).toBe(2);
    expect(test_stream.item(2)).toBe(3);
    expect(test_stream.length()).toBe(3);
  });

  it('can be created with iterate', function () {
    var powers_of_two = Stream.iterate(1, function (x) { return x * 2; });

    expect(powers_of_two.item(1)).toBe(2);
    expect(powers_of_two.item(2)).toBe(4);
    expect(powers_of_two.item(3)).toBe(8);
    expect(powers_of_two.item(10)).toBe(1024);
  });

  it('can be created by applying cycle to an array', function() {
    var s = Stream.cycle([98, 99, 100]);

    expect(s.head()).toBe(98);
    expect(s.item(1)).toBe(99);
    expect(s.item(2)).toBe(100);
    expect(s.item(3)).toBe(98);
    expect(s.item(4)).toBe(99);
    expect(s.item(30)).toBe(98);
    expect(s.item(31)).toBe(99);
    expect(s.item(32)).toBe(100);
  });

  it('Can be created of an element', function() {
    var s = Stream.repeat('element');

    expect(s.head()).toBe('element');
    expect(s.item(1)).toBe('element');
    expect(s.item(2)).toBe('element');
    expect(s.item(1024)).toBe('element');
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
      .toThrow()
  });
  
  it('drops', function () {
    var oldComment = {};
    var oldestComment = {};
    var newComment = {};
    var newestComment = {};
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
    var twentieth_triangular_number_w_initial = first_twenty_naturals.reduce(function (prior, current) {
      return prior + current;
    }, 0);

    var twentieth_triangular_number = first_twenty_naturals.reduce(function (prior, current) {
      return prior + current;
    });
    
    expect(twentieth_triangular_number).toBe(210);
    expect(twentieth_triangular_number_w_initial).toBe(210);
  });

  it('dropsWhile', function () {
    var some_numbers = Stream.make(-5, -8, -2, 34, 10, -2);
    var remaining_numbers = some_numbers.dropWhile(function (x) { return x<0; });

    expect(remaining_numbers.head()).toBe(34);
    expect(remaining_numbers.item(1)).toBe(10);
    expect(remaining_numbers.item(2)).toBe(-2);
  });

  it('dropsWhile on empty streams', function () {
    var s = new Stream();
    expect(s.dropWhile(function (x) { return x>0; }).empty()).toBeTruthy();
  });

  it('takesWhile', function () {
    var some_numbers = Stream.make(-5, -8, -2, 34, 10, -2);
    var remaining_numbers = some_numbers.takeWhile(function (x) { return x<0; });

    expect(remaining_numbers.head()).toBe(-5);
    expect(remaining_numbers.item(1)).toBe(-8);
    expect(remaining_numbers.item(2)).toBe(-2);
  });

  it('takesWhile on empty streams', function () {
    var s = new Stream();
    expect(s.takeWhile(function (x) { return x>0; }).empty()).toBeTruthy();
  });

  it('zips', function () {
    var a = Stream.make(4, 8, 12, 23, 5);
    var b = Stream.make(2, 10, 5, 99, 100);
    var c = Stream.make(-5, 63, 12, 43, 2);

    var biggest_of_two = a.zip( Math.max, b );
    var sum_of_four = a.zip( function(w, x, y, z) {
      return w + x + y + z;
    }, b, c, a );

    expect(biggest_of_two.head()).toBe(4);
    expect(biggest_of_two.item(1)).toBe(10);
    expect(biggest_of_two.item(2)).toBe(12);
    expect(biggest_of_two.item(3)).toBe(99);
    expect(biggest_of_two.item(4)).toBe(100);

    expect(sum_of_four.head()).toBe(5);
    expect(sum_of_four.item(1)).toBe(89);
    expect(sum_of_four.item(2)).toBe(41);
    expect(sum_of_four.item(3)).toBe(188);
    expect(sum_of_four.item(4)).toBe(112);
  });

  it('zips streams of different lengths', function () {
    var a = Stream.make(4, 8, 12, 16);
    var b = Stream.make(1, 12, 42);

    var biggest_of_two1 = a.zip(Math.max, b);
    var biggest_of_two2 = b.zip(Math.max, a);

    expect(biggest_of_two1.length()).toBe(3);
    expect(biggest_of_two2.length()).toBe(3);

    expect(biggest_of_two1.head()).toBe(4);
    expect(biggest_of_two1.item(1)).toBe(12);
    expect(biggest_of_two1.item(2)).toBe(42);

    expect(biggest_of_two2.head()).toBe(4);
    expect(biggest_of_two2.item(1)).toBe(12);
    expect(biggest_of_two2.item(2)).toBe(42);
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

