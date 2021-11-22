# Changelog

## [4.0.0](https://www.github.com/gulpjs/liftoff/compare/v3.1.0...v4.0.0) (2021-11-22)


### ⚠ BREAKING CHANGES

* Support `extends` syntax in config files (#103)
* Normalize repository, dropping node <10.13 support (#118)
* call `env.completion` inside execute to allow additional configuration (#106)
* Rename `opts.require` to `opts.preload`
* Rename events to be more specific
* Remove launch API

### Features

* Add beforeRequire event ([65f350d](https://www.github.com/gulpjs/liftoff/commit/65f350d0140f91467252f58489b5e13bc19f169e))
* Rename `opts.require` to `opts.preload` ([596926a](https://www.github.com/gulpjs/liftoff/commit/596926a177df254726715ffed7bc4b344e87bef0))
* Rename events to be more specific ([cbb8456](https://www.github.com/gulpjs/liftoff/commit/cbb8456e0273505d1ba237060aaebb7b79c26112))
* Support `extends` syntax in config files ([#103](https://www.github.com/gulpjs/liftoff/issues/103)) ([68c9db7](https://www.github.com/gulpjs/liftoff/commit/68c9db7fc4f26b7b9e3e91f8e8c6374d1a9dbb1f))


### Bug Fixes

* call `env.completion` inside execute to allow additional configuration ([#106](https://www.github.com/gulpjs/liftoff/issues/106)) ([2a1fc4b](https://www.github.com/gulpjs/liftoff/commit/2a1fc4b632e55effcd45ab3c48bd7aba0ce049bf))
* Update rechoir to support dots in config name ([33a6286](https://www.github.com/gulpjs/liftoff/commit/33a62869bc2474d4168f17f611dadbd66cc6adac))


### Miscellaneous Chores

* Normalize repository, dropping node <10.13 support ([#118](https://www.github.com/gulpjs/liftoff/issues/118)) ([d671e76](https://www.github.com/gulpjs/liftoff/commit/d671e7600bd96f3c6c23697575436e89fa407c99))
* Remove launch API ([dea6860](https://www.github.com/gulpjs/liftoff/commit/dea68609a669195f8d59df2164a5f4ba6e680004))
