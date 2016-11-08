OUTPUT := stream.js stream.min.js stream.min.js.map
SOURCE = src/stream.js

$(OUTPUT): $(SOURCE)
	test -d "node_modules" || npm install; \
  echo "Build UMD/CommonJS version of stream.js"; \
  npm run build:browser; \
	echo "Running minify..."; \
	npm run minify;

clean:
	@rm --verbose $(OUTPUT)

all: $(OUTPUT)
.PHONY: clean
