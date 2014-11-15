function Stream( head, tailPromise ) {
    if ( typeof head != 'undefined' ) {
        this.headValue = head;
    }
    if ( typeof tailPromise == 'undefined' ) {
        tailPromise = function () {
            return new Stream();
        };
    }
    this.tailPromise = tailPromise;
}

// TODO: write some unit tests
Stream.prototype = {
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
        // TODO: memoize here
        return this.tailPromise();
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
        return new Stream(
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
        return new Stream( f( this.head() ), function () {
            return self.tail().map( f );
        } );
    },
    concatmap: function ( f ) {
        return this.reduce( function ( a, x ) {
            return a.append( f(x) );
        }, new Stream () );
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
            return new Stream( h, function () {
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
            return new Stream();
        }
        var self = this;
        return new Stream(
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
    drop: function( n ) {
        var self = this; 
        
        while ( n-- > 0 ) {
          
            if ( self.empty() ) {
                return new Stream();
            }

          self = self.tail();
        }
        
        // create clone/a contructor which accepts a stream?
        return new Stream( self.headValue, self.tailPromise );
    },
    dropWhile: function( condition ) {
      if(this.empty()) return new Stream();
      var self = this;

      while( condition( self.head() ) ) self = self.tail();
      return new Stream( self.headValue, self.tailPromise );
    },
    member: function( x ) {
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

Stream.makeOnes = function() {
    return new Stream( 1, Stream.makeOnes );
};
Stream.makeNaturalNumbers = function() {
    return new Stream( 1, function () {
        return Stream.makeNaturalNumbers().add( Stream.makeOnes() );
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
Stream.fromArray = function ( array ) {
    if ( array.length == 0 ) {
        return new Stream();
    }
    return new Stream( array[0], function() { return Stream.fromArray(array.slice(1)); } );
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
    } );
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
Stream.iterate = function ( x, f ) {
  return new Stream( x, function () {
    return Stream.iterate( f( x ), f);
  } );
};
Stream.cycle = function( array ) {
  var promise_generator = function( array, index) {
    if( index >= array.length ) index = 0;
    return function() {
      return new Stream( array[index], promise_generator(array, index + 1 ) );
    };
  };
  return new Stream( array[0], promise_generator( array, 1 ) );
};

module.exports = Stream;
