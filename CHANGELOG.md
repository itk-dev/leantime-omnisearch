# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

* [PR-20](https://github.com/ITK-Leantime/leantime-omnisearch/pull/20)
  - Build with webpack
  - Use npm package fuzzy-search (https://www.npmjs.com/package/fuzzy-search)
  - Change folder structure
  - Setup yarn audit on pr
  - Update readme
  - Only show todo/project when user has typed 3 characters

## [1.2.3] 2024-06-05
- Make it possible to search on todo id
- Make done todos visually stand out, and sort the array so they appear at the bottom

## [1.2.2] 2024-06-03

- Add projectname in parentheses to search result on todos/tickets
- Expand filter results by tolowercase'ing, because the result from the leantime has type set to be either "Task" and "task". 
- remove sprintname/client from searcher to simplify result
- add tags to omnisearch

## [1.2.1] 2024-04-29

- Used `APP_ROOT` for installing assets.
- Moved Select2 dependency from CDN to files in plugin.

## [1.2.0] 2024-02-12

### Fixed

- Typo in cache constant.

### Added

- Settings page.
- Added github actions

## [1.1.0] 2024-02-01

### Added

- Added caching.

### Fixed

- Bug where data would load in after overlay close.

## [1.0.1] 2024-01-31

### Fixed

- Readded searchCriteria api parameter for LT 2.4.8.

## [1.0.0] 2024-01-30

### Added

- Added OmniSearch plugin.
- Added fuzzy search.
- Install, uninstall script.

[1.2.1]: https://github.com/ITK-Leantime/leantime-omnisearch/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/ITK-Leantime/leantime-omnisearch/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/ITK-Leantime/leantime-omnisearch/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/ITK-Leantime/leantime-omnisearch/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/ITK-Leantime/leantime-omnisearch/releases/tag/1.0.0
