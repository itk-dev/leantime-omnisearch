# Leantime OmniSearch

A plugin for Leantime that gives access to a plethora of shortcuts, to speed up 
navigating the system.

## Build
Todo: This will be in a following pr

## Development

This plugin requires an instance of Leantime running locally.



Git clone this repo into app/Plugins as follows:

```shell
git clone https://github.com/ITK-Leantime/leantime-omnisearch app/Plugins/OmniSearch  
```

Install the plugin through Leantime in your web browser.

The install process symlinks the the build file 
`
dist/omniSearch.js
` with `public/dist/js/omniSearch.js`in leantime.

Run this to update files

```
docker compose run --rm php npm install
docker compose run --rm php npm run dev
```

### Coding standards

Run prettier via the following command:

```shell
    docker compose run --rm php npm --prefix /app install
    docker compose run --rm php npm --prefix /app prettier src --fix --write
```
