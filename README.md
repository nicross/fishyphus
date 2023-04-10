# Fishyphus
A fishing horror game developed for [Games for Blind Gamers 2](https://itch.io/jam/games-for-blind-gamers-2).

## Links
- [Play in browser](https://shiftbacktick.itch.io/fishyphus)
- [Game manual](https://fishyphus.shiftbacktick.io/manual.html)
- [Development log](https://shiftbacktick.io/fishyphus)

## Getting started
To get started, please use [npm](https://nodejs.org) to install the required dependencies:
```sh
npm install
```

### Common tasks
Common tasks have been automated with [Gulp](https://gulpjs.com):

#### Build once
```sh
gulp build
```

#### Build continuously
```sh
gulp watch
```

#### Create distributables
```sh
gulp dist
```

#### Open in Electron
```sh
gulp electron
```

#### Build and open in Electron
```sh
gulp electron-build
```

#### Start web server
```sh
gulp serve
```

#### Start web server and build continuously
```sh
gulp dev
```

#### Command line flags
| Flag | Description |
| - | - |
| `--debug` | Suppresses minification. |
