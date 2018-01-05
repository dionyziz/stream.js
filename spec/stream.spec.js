'use strict';

const Stream = require('../src/stream.js');

describe('finite streams', () => {
  it('can be made and accessess', () => {
    const finite = Stream.make(10, 20, 30);
    expect(finite.length()).toBe(3);
    expect(finite.head()).toBe(10);
    expect(finite.item(0)).toBe(10);
    expect(finite.item(1)).toBe(20);
    expect(finite.item(2)).toBe(30);
  });

  it('has a head and tail', () => {
    const ini = {};
    const fin = {};
    const duo = Stream.make(ini, fin);

    expect(duo.head()).toBe(ini);
    expect(duo.tail().head()).toBe(fin);
    expect(duo.tail().tail().empty()).toBeTruthy();
  });

  it('detects membership', () => {
    const stooges = Stream.make('Curly', 'Moe', 'Larry');
    expect(stooges.member('Curly')).toBeTruthy();
    expect(stooges.member('Bobert')).toBeFalsy();
  });

  it('appends another stream', () => {
    const s0 = new Stream();
    const s1 = Stream.make(1);
    const s2 = Stream.make(2, 3);
    const appendedStream1 = s1.append(s2);
    const appendedStream2 = s0.append(s2);
    expect(appendedStream1.head()).toBe(1);
    expect(appendedStream1.item(1)).toBe(2);
    expect(appendedStream1.item(2)).toBe(3);
    expect(appendedStream1.length()).toBe(3);
    expect(s2).toBe(appendedStream2);
  });

  it('compares 2 streams for equality', () => {
    const s1 = Stream.make(1);
    const s2 = Stream.make(1);
    const s3 = Stream.make(2, 3);
    expect(Stream.equals(s1, s2)).toBeTruthy();
    expect(Stream.equals(s1, s3)).toBeFalsy();
  });
});

describe('construction', () => {
  it('can be created from array', () => {
    const testStream = Stream.fromArray([1, 2, 3]);

    expect(testStream.head()).toBe(1);
    expect(testStream.item(1)).toBe(2);
    expect(testStream.item(2)).toBe(3);
    expect(testStream.length()).toBe(3);
  });

  it('can be created with iterate', () => {
    const powersOfTwo = Stream.iterate(1, x => x * 2);

    expect(powersOfTwo.item(1)).toBe(2);
    expect(powersOfTwo.item(2)).toBe(4);
    expect(powersOfTwo.item(3)).toBe(8);
    expect(powersOfTwo.item(10)).toBe(1024);
  });

  it('can be created by applying cycle to an array', () => {
    const s = Stream.cycle([98, 99, 100]);

    expect(s.head()).toBe(98);
    expect(s.item(1)).toBe(99);
    expect(s.item(2)).toBe(100);
    expect(s.item(3)).toBe(98);
    expect(s.item(4)).toBe(99);
    expect(s.item(30)).toBe(98);
    expect(s.item(31)).toBe(99);
    expect(s.item(32)).toBe(100);
  });

  it('Can be created of an element', () => {
    const s = Stream.repeat('element');

    expect(s.head()).toBe('element');
    expect(s.item(1)).toBe('element');
    expect(s.item(2)).toBe('element');
    expect(s.item(1024)).toBe('element');
  });

  it('Memoizes properly', () => {
    let calls = 0;
    function countCalls() {
      calls += 1;
      return new Stream(1, countCalls);
    }

    const s = new Stream(1, countCalls);

    s.head();
    expect(calls, 0);

    // Evaluating the tail more than once shouldn't call the function >1 time
    s.tail().head();
    expect(calls, 1);

    s.tail().head();
    expect(calls, 1);
  });

  it('Doesn\'t memoize when we ask for Eager', () => {
    let calls = 0;
    function countCalls() {
      calls += 1;
      return new Stream.Eager(1, countCalls);
    }

    const s = new Stream(1, countCalls);

    s.head();
    expect(calls, 0);

    // Evaluating tail() should call the function each time
    s.tail().head();
    expect(calls, 1);

    s.tail().head();
    expect(calls, 2);
  });
});

describe('range', () => {
  it('can make ranges from a minimum value to a maximal', () => {
    const threeToSeven = Stream.range(3, 7);

    expect(threeToSeven.length()).toBe(5);
    expect(threeToSeven.item(0)).toBe(3);
    expect(threeToSeven.item(1)).toBe(4);
    expect(threeToSeven.item(2)).toBe(5);
    expect(threeToSeven.item(3)).toBe(6);
    expect(threeToSeven.item(4)).toBe(7);
  });

  it('has an optional highest value', () => {
    const tenPlus = Stream.range(10);
    expect(tenPlus.head()).toBe(10);
    expect(tenPlus.tail().head()).toBe(11);
  });

  it('defaults to the natural numbers', () => {
    const naturals = Stream.range();
    expect(naturals.head()).toBe(1);
    expect(naturals.tail().head()).toBe(2);
  });
});

describe('standard functional functions', () => {
  it('takes', () => {
    const naturals = Stream.range();
    const firstThreeNaturals = naturals.take(3);

    expect(firstThreeNaturals instanceof Stream).toBeTruthy();
    expect(firstThreeNaturals.length()).toBe(3);
    expect(firstThreeNaturals.item(0)).toBe(1);
    expect(firstThreeNaturals.item(1)).toBe(2);
    expect(firstThreeNaturals.item(2)).toBe(3);
    expect(() => { firstThreeNaturals.item(3); })
      .toThrow();
  });

  it('drops', () => {
    const oldComment = {};
    const oldestComment = {};
    const newComment = {};
    const newestComment = {};
    const comments = Stream.make(oldestComment, oldComment, newComment, newestComment);
    const newComments = comments.drop(2);
    expect(newComments.length()).toBe(2);
    expect(newComments.member(oldComment)).toBeFalsy();
    expect(newComments.member(newComment)).toBeTruthy();
    expect(newComments.head()).toBe(newComment);
    expect(newComments.tail().head()).toBe(newestComment);
  });

  it('maps', () => {
    const alphabetAscii = Stream.range(97, 122);
    const alphabet = alphabetAscii.map(code => String.fromCharCode(code));

    expect(alphabet.head()).toBe('a');
    expect(alphabet.tail().head()).toBe('b');
    expect(alphabet.item(25)).toBe('z');
  });

  it('filters', () => {
    const firstTenNaturals = Stream.range(1, 10);
    const firstFiveEvens = firstTenNaturals.filter(n => (n % 2 === 0));

    expect(firstFiveEvens.length()).toBe(5);
    firstFiveEvens.map(n => expect(n / 2).toBe(Math.floor(n / 2)));
  });

  it('reduces', () => {
    const firstTwentyNaturals = Stream.range(1, 20);
    const twentiethTriangularNumberWInitial =
    firstTwentyNaturals.reduce((prior, current) => prior + current, 0);

    const twentiethTriangularNumber =
    firstTwentyNaturals.reduce((prior, current) => prior + current);

    expect(twentiethTriangularNumber).toBe(210);
    expect(twentiethTriangularNumberWInitial).toBe(210);
  });

  it('dropsWhile', () => {
    const someNumbers = Stream.make(-5, -8, -2, 34, 10, -2);
    const remainingNumbers = someNumbers.dropWhile(x => x < 0);

    expect(remainingNumbers.head()).toBe(34);
    expect(remainingNumbers.item(1)).toBe(10);
    expect(remainingNumbers.item(2)).toBe(-2);
  });

  it('dropsWhile on empty streams', () => {
    const s = new Stream();
    expect(s.dropWhile(() => true).empty()).toBeTruthy();
  });

  it('dropsWhile on exhausted streams', () => {
    const someNumbers = Stream.make(-5, -8, -2, 34, 10, -2);
    expect(someNumbers.dropWhile(() => true).empty()).toBeTruthy();
  });

  it('takesWhile', () => {
    const someNumbers = Stream.make(-5, -8, -2, 34, 10, -2);
    const remainingNumbers = someNumbers.takeWhile(x => x < 0);

    expect(remainingNumbers.head()).toBe(-5);
    expect(remainingNumbers.item(1)).toBe(-8);
    expect(remainingNumbers.item(2)).toBe(-2);
  });

  it('takesWhile on empty streams', () => {
    const s = new Stream();
    expect(s.takeWhile(x => x > 0).empty()).toBeTruthy();
  });

  it('zips', () => {
    const a = Stream.make(4, 8, 12, 23, 5);
    const b = Stream.make(2, 10, 5, 99, 100);
    const c = Stream.make(-5, 63, 12, 43, 2);

    const biggestOfTwo = a.zip(Math.max, b);
    const sumOfFour = a.zip((w, x, y, z) => w + x + y + z, b, c, a);

    expect(biggestOfTwo.head()).toBe(4);
    expect(biggestOfTwo.item(1)).toBe(10);
    expect(biggestOfTwo.item(2)).toBe(12);
    expect(biggestOfTwo.item(3)).toBe(99);
    expect(biggestOfTwo.item(4)).toBe(100);

    expect(sumOfFour.head()).toBe(5);
    expect(sumOfFour.item(1)).toBe(89);
    expect(sumOfFour.item(2)).toBe(41);
    expect(sumOfFour.item(3)).toBe(188);
    expect(sumOfFour.item(4)).toBe(112);
  });

  it('zips streams of different lengths', () => {
    const a = Stream.make(4, 8, 12, 16);
    const b = Stream.make(1, 12, 42);

    const biggestOfTwo1 = a.zip(Math.max, b);
    const biggestOfTwo2 = b.zip(Math.max, a);

    expect(biggestOfTwo1.length()).toBe(3);
    expect(biggestOfTwo2.length()).toBe(3);

    expect(biggestOfTwo1.head()).toBe(4);
    expect(biggestOfTwo1.item(1)).toBe(12);
    expect(biggestOfTwo1.item(2)).toBe(42);

    expect(biggestOfTwo2.head()).toBe(4);
    expect(biggestOfTwo2.item(1)).toBe(12);
    expect(biggestOfTwo2.item(2)).toBe(42);
  });
});

describe('special numeric stream functions', () => {
  it('sums', () => {
    const firstTwentyNaturals = Stream.range(1, 20);
    const twentiethTriangularNumber = firstTwentyNaturals.sum();
    expect(twentiethTriangularNumber).toBe(210);
  });

  it('scales', () => {
    const firstTenNaturals = Stream.range(1, 10);
    const firstTenEvens = firstTenNaturals.scale(2);

    expect(firstTenEvens.length()).toBe(10);
    expect(firstTenEvens.head()).toBe(2);
    expect(firstTenEvens.item(9)).toBe(20);
  });
});
