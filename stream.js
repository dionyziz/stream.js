(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Stream = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function Lazy(func) {
    this.has_evaluated = false;
    this.func = func;
    this.value = null;
}

Lazy.prototype = {
    eval: function() {
        if ( this.has_evaluated ) {
            return this.value;
        }

        this.value = this.func();
        this.has_evaluated = true;
        return this.value;
    }
};

function Eager(func) {
    this.func = func;
}

Eager.prototype = {
    eval: function() {
        return this.func();
    }
}

function Stream( head, tailPromise, wrapper ) {
    if ( typeof wrapper == 'undefined' ) {
        wrapper = Lazy;
    }
    
    this.wrapper = wrapper;

    if ( typeof head != 'undefined' ) {
        this.headValue = head;
    }
    if ( typeof tailPromise == 'undefined' ) {
        tailPromise = function () {
            return this.create();
        };
    }

    if ( typeof tailPromise == 'function' ) {
        tailPromise = new wrapper(tailPromise);
    }

    this.tailPromise = tailPromise;
}

// TODO: write some unit tests
Stream.prototype = {
    // This makes it easier to avoid passing around the explicit wrapper
    // when making new streams below
    create: function(head, tailPromise) {
        return new Stream( head, tailPromise, this.wrapper );
    },
    empty: function() {
        return typeof this.headValue == 'undefined';
    },
    head: function() {
        if ( this.empty() ) {
            throw new Error('Cannot get the head of the empty stream.');
        }
        return this.headValue;
    },
    tail: function() {
        if ( this.empty() ) {
            throw new Error('Cannot get the tail of the empty stream.');
        }

        return this.tailPromise.eval();
    },
    item: function( n ) {
        if ( this.empty() ) {
            throw new Error('Cannot use item() on an empty stream.');
        }
        var s = this;
        while ( n != 0 ) {
            --n;
            try {
                s = s.tail();
            }
            catch ( e ) {
                throw new Error('Item index does not exist in stream.');
            }
        }
        try {
            return s.head();
        }
        catch ( e ) {
            throw new Error('Item index does not exist in stream.');
        }
    },
    length: function() {
        // requires finite stream
        var s = this;
        var len = 0;

        while ( !s.empty() ) {
            ++len;
            s = s.tail();
        }
        return len;
    },
    add: function( s ) {
        return this.zip( function ( x, y ) {
            return x + y;
        }, s );
    },
    append: function ( stream ) {
        if ( this.empty() ) {
            return stream;
        }
        var self = this;
        return this.create(
            self.head(),
            function () {
                return self.tail().append( stream );
            }
        );
    },
    zip: function( /* arguments */ ) {
        var args = Array.prototype.slice.call( arguments, 0 )
        var f = args[0];
        args.shift();
        var streams = [this].concat( args );
        var self = this;

        // If any streams are empty, return an empty stream
        if( streams.filter( function(x) { return x.empty(); } ).length > 0 ) {
          return new Stream();
        }

        return new Stream(
          f.apply( null, streams.map( function(x) { return x.head(); }) ),
          function () {
            var tail = self.tail();
            return tail.zip.apply( tail, [f].concat(
              args.map( function (x) { return x.tail(); } )
            ) );
          }
        );
    },
    map: function( f ) {
        if ( this.empty() ) {
            return this;
        }
        var self = this;
        return this.create( f( this.head() ), function () {
            return self.tail().map( f );
        } );
    },
    concatmap: function ( f ) {
        return this.reduce( function ( a, x ) {
            return a.append( f(x) );
        }, this.create() );
    },
    reduce: function () {
        var aggregator = arguments[0];
        var initial, self;
        if(arguments.length < 2) {
            if(this.empty()) throw new TypeError("Array length is 0 and no second argument");
            initial = this.head();
            self = this.tail();
        }
        else {
            initial = arguments[1];
            self = this;
        }
        // requires finite stream
        if ( self.empty() ) {
            return initial;
        }
        // TODO: iterate
        return self.tail().reduce( aggregator, aggregator( initial, self.head() ) );
    },
    sum: function () {
        // requires finite stream
        return this.reduce( function ( a, b ) {
            return a + b;
        }, 0 );
    },
    walk: function( f ) {
        // requires finite stream
        this.map( function ( x ) {
            f( x );
            return x;
        } ).force();
    },
    force: function() {
        // requires finite stream
        var stream = this;
        while ( !stream.empty() ) {
            stream = stream.tail();
        }
    },
    scale: function( factor ) {
        return this.map( function ( x ) {
            return factor * x;
        } );
    },
    filter: function( f ) {
        if ( this.empty() ) {
            return this;
        }
        var h = this.head();
        var t = this.tail();
        if ( f( h ) ) {
            return this.create( h, function () {
                return t.filter( f );
            } );
        }
        return t.filter( f );
    },
    take: function ( howmany ) {
        if ( this.empty() ) {
            return this;
        }
        if ( howmany == 0 ) {
            return this.create();
        }
        var self = this;
        return this.create(
            this.head(),
            function () {
                return self.tail().take( howmany - 1 );
            }
        );
    },
    takeWhile: function( condition ) {
      if(this.empty()) return new Stream();
      var self = this, result = [];

      while( condition( self.head() ) ) {
        result.push( self.head() );
        self = self.tail();
      }

      return Stream.fromArray(result);
    },
    drop: function( n ){
        var self = this; 
        
        while ( n-- > 0 ) {
          
            if ( self.empty() ) {
                return this.create();
            }

          self = self.tail();
        }
        
        // create clone/a contructor which accepts a stream?
        return this.create( self.headValue, self.tailPromise );
    },
    dropWhile: function( condition ) {
      if(this.empty()) return new Stream();
      var self = this;

      while( condition( self.head() ) ) self = self.tail();
      return new Stream( self.headValue, self.tailPromise );
    },
    member: function( x ){
        var self = this;

        while( !self.empty() ) {
            if ( self.head() == x ) {
                return true;
            }

            self = self.tail();
        }

        return false;
    },
    print: function( n ) {
        var target;
        if ( typeof n != 'undefined' ) {
            target = this.take( n );
        }
        else {
            // requires finite stream
            target = this;
        }
        target.walk( function ( x ) {
            console.log( x );
        } );
    },
    toString: function() {
        // requires finite stream
        return '[stream head: ' + this.head() + '; tail: ' + this.tail() + ']';
    }
};

function _continually( callback, wrapper ) {
    return Stream.iterate( callback(), callback, wrapper );
}

Stream.continually = function( callback ) {
    return _continually( callback, Lazy );
}

Stream.continuallyEager = function( callback ) {
    return _continually( callback, Eager );
}

Stream.repeat = function( element ) {
    return Stream.continually( function() { return element; } );
};

Stream.makeOnes = function() {
    return new Stream( 1, Stream.makeOnes );
};

Stream.makeNaturalNumbers = function() {
    return new Stream( 1, function () {
        var nats = Stream.makeNaturalNumbers();
        return nats.add( Stream.makeOnes() );
    } );
};

Stream.make = function( /* arguments */ ) {
    if ( arguments.length == 0 ) {
        return new Stream();
    }
    var restArguments = Array.prototype.slice.call( arguments, 1 );
    return new Stream( arguments[ 0 ], function () {
        return Stream.make.apply( null, restArguments );
    } );
};

// This is Eager-only, since keeping around a Lazy for each element would
// just copy array needlessly
Stream.fromArray = function ( array ) {
    if ( array.length == 0 ) {
        return new Stream();
    }
    return new Stream( array[0], function() { return Stream.fromArray(array.slice(1), Eager ); }, Eager );
};

Stream.range = function ( low, high ) {
    if ( typeof low == 'undefined' ) {
        low = 1;
    }
    if ( low == high ) {
        return Stream.make( low );
    }
    // if high is undefined, there won't be an upper bound
    return new Stream( low, function () {
        return Stream.range( low + 1, high );
    });
};

Stream.equals = function ( stream1, stream2 ) {
    if ( ! (stream1 instanceof Stream) ) return false;
    if ( ! (stream2 instanceof Stream) ) return false;
    if ( stream1.empty() && stream2.empty() ) {
        return true;
    }
    if ( stream1.empty() || stream2.empty() ) {
        return false;
    }
    if ( stream1.head() === stream2.head() ) {
        return Stream.equals( stream1.tail(), stream2.tail() );
    }
};

function _iterate( x, f, wrapper ) {
  return new Stream( x, function () {
    return _iterate( f( x ), f, wrapper );
  }, wrapper );
};

Stream.iterate = function( x, f ) {
    return _iterate( x, f, Lazy );
}

Stream.iterateEager = function( x, f ) {
    return _iterate( x, f, Eager );
}

// Like fromArray, this is Eager-only since it would needlessly copy
// parts of the array if Lazy was used
Stream.cycle = function( array ) {
  var promise_generator = function( array, index) {
    if( index >= array.length ) index = 0;
    return function() {
      return new Stream( array[index], promise_generator(array, index + 1 ), Eager );
    };
  };
  return new Stream( array[0], promise_generator( array, 1 ), Eager );
};

/*
 * Since Lazy and Eager aren't exported to the outside, this is used to make
 * eager streams.
 */
function EagerStream( head, tailPromise ) {
    return Stream.call( this, head, tailPromise, Eager );
}

EagerStream.prototype = Stream.prototype;

Stream.Eager = EagerStream;
module.exports = Stream;

},{}]},{},[1])(1)
});