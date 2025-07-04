# FsPlayground

Vite5 + TypeScript5 前端技术栈Monorepo项目模板

## 运行环境

建议使用[NVM](https://github.com/nvm-sh/nvm)管理Node版本

- Node: 18.20.0
- PNPM: 9.7.0

## 项目运行与构建

### 依赖安装与管理

```bash
# 工作区全局安装依赖（使用-Dw参数安装开发依赖）
pnpm add pkg-name -w
# 工作区依赖更新
pnpm install -r
# 工作区依赖移除
pnpm remove pkg-name
```

### 项目运行与构建

通过`--filter`参数筛选某个子包进行运行或构建，下面`dev`或`build`指令需要提前在子包的package.json中配置

```bash
pnpm --filter ./apps/app-name dev
pnpm --filter ./packages/pkg-name build
```

或者在根目录package.json中配置快捷命令。

```json
{
  //...some config other
  "scripts": {
    "dev": "pnpm --filter ./apps/app-name dev",
    "build:pkgName": "pnpm --filter ./packages/pkg-name build"
  }
}
```

## 关键配置说明

### 根目录tsconfig

主要注意`include`配置，描述该Monorepo项目中包含哪些子项目需要被ts服务器管理

```json
// tsconfig.base.json
{
  "include": [
    "vite-env.d.ts",
    "packages/shared/tsconfig.json",
    "packages/core/tsconfig.json",
    "packages/client/tsconfig.json",
    "packages/server/tsconfig.json",
    "apps/fs-app/tsconfig.json"
  ]
}
```

### 子项目配置

每个子包都需要包含下面三个文件：

- **package.json**: 描述该子包依赖了工作区下的哪些包
- **tsconfig.json**：配置继承项目根目录下的tsconfig.json，主要注意path字段配置依赖别名
- **vite.config.ts**：各个子项目都由vite负责启动开发服务或构建，该文件主要配置一些构建相关配置

每添加一个子包，需要注意在根目录的tsconfig.base.json中的`include`中添加一个项目

