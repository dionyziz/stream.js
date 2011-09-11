function Stream( head, tailPromise ) {
    if ( typeof head == 'undefined' ) {
        head = null;
    }
    else if ( typeof tailPromise == 'undefined' ) {
        tailPromise = function () {
            return new Stream();
        };
    }
    this.headValue = head;
    this.tailPromise = tailPromise;
}

Stream.prototype = {
    empty: function() {
        return this.headValue === null;
    },
    head: function() {
        if ( this.empty() ) {
            throw 'Cannot get the head of the empty stream.';
        }
        return this.headValue;
    },
    tail: function() {
        if ( this.empty() ) {
            throw 'Cannot get the tail of the empty stream.';
        }
        return this.tailPromise();
    },
    item: function( n ) {
        if ( this.empty() ) {
            throw 'Cannot use item() on an empty stream.';
        }
        if ( n == 0 ) {
            return this.head();
        }
        // TODO: iteration
        return this.tail().item( n - 1 );
    },
    length: function() {
        if ( this.empty() ) {
            return 0;
        }
        // TODO: iteration
        return 1 + this.tail().length();
    },
    add: function( s ) {
        return this.zip( function ( x, y ) {
            return x + y;
        }, s );
    },
    zip: function( f, s ) {
        if ( this.empty() ) {
            return s;
        }
        if ( s.empty() ) {
            return this;
        }
        var self = this;
        return new Stream( f( s.head(), this.head() ), function () {
            return self.tail().zip( f, s.tail() );
        } );
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
    walk: function( f ) {
        this.map( function ( x ) {
            f( x );
            return x;
        } ).force();
    },
    force: function() {
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
        // TODO: optimize: iterate
        var self = this;
        return new Stream(
            this.head(),
            function () {
                return self.tail().take( howmany - 1 );
            }
        );
    },
    print: function() {
        this.walk( function ( x ) {
            console.log( x );
        } );
    },
    toString: function() {
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
