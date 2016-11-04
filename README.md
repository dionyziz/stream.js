#stream.js [![Build Status](https://travis-ci.org/dionyziz/stream.js.svg?branch=master)](https://travis-ci.org/dionyziz/stream.js) [![codecov.io](https://codecov.io/github/dionyziz/stream.js/coverage.svg?branch=master)](https://codecov.io/github/dionyziz/stream.js?branch=master)

stream.js is a tiny Javascript library that unlocks a new data structure for you: streams.

Go to https://dionyziz.github.io/stream.js-website/ to read all about what streams are and how they can make your
code better and your soul happier.


## Installation

In nodejs:

```
npm install https://github.com/dionyziz/stream.js.git
```

In bower:

```
bower install stream.js
```

As per [bower.json specification](https://github.com/bower/spec/blob/master/json.md#main),
we have defined the source file for stream.js and not a minified version. You can get a
minified version from [jsDelivr](https://www.jsdelivr.com/projects/stream.js).

## Usage
In nodejs:

```js
var Stream = require('stream.js');
var s1 = Stream.make(1,2,3);
var s2 = new Stream();
s2.append(1).append(2).append(3);
```

In the browser:

```html
<script src="stream.js"></script>
<script>
	var s1 = Stream.make(1,2,3);
	var s2 = new Stream();
	s2.append(1).append(2).append(3);
</script>
```

or with AMD:
```js
define(function(require) {
	var Stream = require("stream.js");
	Stream.make(1,2,3).print();
});
```
