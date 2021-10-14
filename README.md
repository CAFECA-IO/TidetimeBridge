# TidetimeBridge

### edit config
```shell
cp default.config.toml private/config.toml
vi private/config.toml
```
```toml
[api]
pathname = [
  "get | /,/version | Static.Utils.readPackageInfo"
]

# [method] | [path] | [execute function]
```

## Run Project
```
npm install
npm start
```