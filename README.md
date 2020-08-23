# levego

## BOX01

Pápay

### sensor.community

https://devices.sensor.community/sensors/25898/data

SDS sensor id: #48809	

https://maps.sensor.community/grafana/d/GUaL5aZMz/pm-sensors?orgId=1&var-chipID=esp8266-6246165


## devel

```
docker run --rm --volume="$PWD:/srv/jekyll" --volume="$PWD/vendor/bundle:/usr/local/bundle" --env JEKYLL_ENV=development jekyll/jekyll:3.8 jekyll build --incremental --watch

docker run --rm -v "$PWD/_site:/usr/share/nginx/html:ro" -p 8080:80  nginx

open localhost:8080
```
