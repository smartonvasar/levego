# levego


## devel

```
docker run --rm --volume="$PWD:/srv/jekyll" --volume="$PWD/vendor/bundle:/usr/local/bundle" --env JEKYLL_ENV=development jekyll/jekyll:3.8 jekyll build --incremental --watch

docker run --rm -v "$PWD/_site:/usr/share/nginx/html:ro" -p 8080:80  nginx

open localhost:8080
```
