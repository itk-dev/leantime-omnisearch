# Leantime OmniSearch

A plugin for Leantime that gives access to a plethora of shortcuts, to speed up navigating the system.

## Development

This plugin requires an instance of Leantime running locally.

Git clone this repo into app/Plugins as follows:

```shell
git clone https://github.com/ITK-Leantime/leantime-omnisearch app/Plugins/OmniSearch
```

Install the plugin through Leantime in your web browser.

The install process symlinks the built file `dist/omniSearch.js` with `public/dist/js/omniSearch.js`in leantime.

Run this to watch files

```shell
docker compose run --rm php npm install
docker compose run --rm php npm run dev
```

## Coding standards

Run prettier via the following command:

```shell
docker compose build
docker compose run --rm php npm install
docker compose run --rm php npm run coding-standards-apply
```

```shell
docker run --rm --volume "$(pwd):/md" peterdavehello/markdownlint markdownlint --ignore LICENSE.md --ignore vendor/ --ignore node_modules/ '**/*.md' --fix
docker run --rm --volume "$(pwd):/md" peterdavehello/markdownlint markdownlint --ignore LICENSE.md --ignore vendor/ --ignore node_modules/ '**/*.md'
```

```shell
docker run --rm --tty --volume "$(pwd):/app" peterdavehello/shellcheck shellcheck /app/bin/deploy
```

```shell name=coding-standards-php
docker compose build
docker compose run --rm php composer install
docker compose run --rm php composer coding-standards-apply
docker compose run --rm php composer coding-standards-check
```

## Test release build

``` shell
docker compose build && docker compose run --rm php bash bin/create-release dev-test
```

The create-release script replaces `@@VERSION@@` in
[register.php](https://github.com/ITK-Leantime/leantime-omnisearch/blob/develop/register.php#L13) and
[Services/OmniSearch.php](https://github.com/ITK-Leantime/leantime-omnisearch/blob/develop/Services/OmniSearch.php#L12)
with the tag provided (in the above it is `dev-test`).

## Deploy

The deploy script downloads a [release](https://github.com/ITK-Leantime/leantime-omnisearch/releases) from Github and
unzips it. The script should be passed a tag as argument. In the process the script deletes itself, but the script
finishes because it [is still in memory](https://linux.die.net/man/3/unlink).
