# Leantime OmniSearch

A plugin for Leantime that gives access to a plethora of shortcuts, to speed up 
navigating the system.

## Development

This plugin requires an instance of Leantime running locally.

Git clone this repo into app/Plugins as follows:

```shell
    cd app/Plugins
    git clone https://github.com/ITK-Leantime/leantime-omnisearch /OmniSearch
```

Install the plugin through Leantime in your web browser.

The plugin copies its javascript and css into corresponding files at

```shell
    cat ./public/dist/js/omniSearch.js
```

and

```shell
    cat ./public/dist/css/omniSearch.css
```

These files are the ones loaded in the frontend,
and the ones you should make your changes to.

To prevent the need to copy the contents from the dist folder,
you can symlink the files as follows (from leantime/):

```shell
    (cd public/dist/js && ln -sf ../../../app/Plugins/OmniSearch/assets/js/omniSelectEngine.js omniSearch.js)
    (cd public/dist/css && ln -sf ../../../app/Plugins/OmniSearch/assets/css/omniSelectStyle.css omniSearch.css)
```

### Coding standards

Run prettier via the following command:

```shell
    npm install
    docker run -it --volume ${PWD}:/app --rm node:20 yarn --cwd /app prettier assets --write
```
