# LeetCode

> 在 VS Code 中练习 LeetCode

<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/resources/LeetCode.png" alt="">
</p>
<p align="center">
  <a href="https://github.com/LeetCode-OpenSource/vscode-leetcode/actions?query=workflow%3ACI+branch%3Amaster">
    <img src="https://img.shields.io/github/workflow/status/LeetCode-OpenSource/vscode-leetcode/CI/master?style=flat-square" alt="">
  </a>
  <a href="https://gitter.im/vscode-leetcode/Lobby">
    <img src="https://img.shields.io/gitter/room/LeetCode-OpenSource/vscode-leetcode.svg?style=flat-square" alt="">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=LeetCode.vscode-leetcode">
    <img src="https://img.shields.io/visual-studio-marketplace/d/LeetCode.vscode-leetcode.svg?style=flat-square" alt="">
  </a>
  <a href="https://github.com/LeetCode-OpenSource/vscode-leetcode/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/LeetCode-OpenSource/vscode-leetcode.svg?style=flat-square" alt="">
  </a>
</p>

- [English Document](https://github.com/LeetCode-OpenSource/vscode-leetcode#requirements) | 中文文档

## ❗️ 注意 ❗️- 无法登录 LeetCode 节点的临时解决办法
> 注意：如果使用的是 `leetcode-cn.com` 账户，可以跳过此段落。

近期我们发现插件出现了[无法登录 leetcode.com 节点的问题](https://github.com/LeetCode-OpenSource/vscode-leetcode/issues/478)。原因是因为近期 leetcode.com 改变了登录机制，目前我们暂时没有找到解决该问题的完美解决方案。

感谢 [@yihong0618](https://github.com/yihong0618) 提供了一个临时解决办法。现在你可以直接点击登录按钮并选择第三方登录或者 `Cookie` 登录。


> 注意：如果你希望使用第三方登录（**推荐**），请确保你的账户已经与第三方账户连接。如果你希望通过 `Cookie` 登录，请点击[该连接](https://github.com/LeetCode-OpenSource/vscode-leetcode/issues/478#issuecomment-564757098)查看登录步骤。

## 运行条件
- [VS Code 1.23.0+](https://code.visualstudio.com/)
- [Node.js 10+](https://nodejs.org)
    > 注意：请确保`Node`在`PATH`环境变量中。您也可以通过设定 `leetcode.nodePath` 选项来指定 `Node.js` 可执行文件的路径。

## 快速开始

![demo](https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/gifs/demo.gif)

## 功能

### 登入登出
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/sign_in.png" alt="登入登出" />
</p>

- 点击 `LeetCode Explorer` 中的 `Sign in to LeetCode` 即可登入。

- 你也可以使用下列快捷键(`Ctrl+shift+p`)命令登入或利用cookie登入或登出:
  - **LeetCode: Sign in**
  - **LeetCode: Sign out**
---

### 切换 LeetCode 版本
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/endpoint.png" alt="切换 LeetCode 版本" />
</p>

- LeetCode 目前有**英文版**和**中文版**两种版本。点击 `LeetCode Explorer` 导航栏中的 ![btn_endpoint](https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/btn_endpoint.png) 按钮可切换版本。

- 目前可切换的版本有:
  - **leetcode.com**
  - **leetcode-cn.com**

  > 注意：两种版本的 LeetCode 账户并**不通用**，请确保当前激活的版本是正确的。插件默认激活的是**英文版**。

---

### 选择题目
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/pick_problem.png" alt="选择题目" />
</p>

- 直接点击题目或者在 `LeetCode Explorer` 中**右键**题目并选择 `Preview Problem` 可查看题目描述
- 选择 `Show Problem` 可直接进行答题。

  > 注意：你可以通过更新配置项 `leetcode.workspaceFolder` 来指定保存题目文件所用的工作区路径。默认工作区路径为：**$HOME/.leetcode/**。

  > 注意：你可以通过更新配置项 `leetcode.showCommentDescription` 来指定是否要在注释中包含题目描述。

  > 注意：你可以通过 `LeetCode: Switch Default Language` 命令变更答题时默认使用编程语言。

---

### 编辑器快捷方式
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/shortcuts.png" alt="Editor Shortcuts" />
</p>

- 插件会在编辑区域内支持五种不同的快捷方式（Code Lens）:
  - `Submit`: 提交你的答案至 LeetCode；
  - `Test`: 用给定的测试用例测试你的答案；
  - `Star`: 收藏或取消收藏该问题；
  - `Solution`: 显示该问题的高票解答；
  - `Description`: 显示该问题的题目描述。

  > 注意：你可以通过 `leetcode.editor.shortcuts` 配置项来定制需要激活的快捷方式。默认情况下只有 `Submit` 和 `Test` 会被激活。

---

### 通过关键字搜索题目
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/search.png" alt="通过关键字搜索题目" />
</p>

- 点击 `LeetCode Explorer` 导航栏中的 ![btn_search](https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/btn_search.png) 按钮可按照关键字搜索题目。

---

### 管理存档
<p align="center">
  <img src="https://raw.githubusercontent.com/LeetCode-OpenSource/vscode-leetcode/master/docs/imgs/session.png" alt="管理存档" />
</p>

- 点击位于 VS Code 底部状态栏的 `LeetCode: ***` 管理 `LeetCode 存档`。你可以**切换**存档或者**创建**，**删除**存档。


## 插件配置项
| 配置项名称                                                                         | 描述                                                                                                                                                                                                                                                                                            | 默认值             |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `leetcode.hideSolved`                                                              | 指定是否要隐藏已解决的问题                                                                                                                                                                                                                                                                      | `false`            |
| `leetcode.showLocked`                                                              | 指定是否显示付费题目，只有付费账户才可以打开付费题目                                                                                                                                                                                                                                            | `false`            |
| `leetcode.defaultLanguage`                                                         | 指定答题时使用的默认语言，可选语言有：`bash`, `c`, `cpp`, `csharp`, `golang`, `java`, `javascript`, `kotlin`, `mysql`, `php`, `python`,`python3`,`ruby`, `rust`, `scala`, `swift`, `typescript`                                                                                                                | `N/A`              |
| `leetcode.useWsl`                                                                  | 指定是否启用 WSL                                                                                                                                                                                                                                                                                | `false`            |
| `leetcode.endpoint`                                                                | 指定使用的终端，可用终端有：`leetcode`, `leetcode-cn`                                                                                                                                                                                                                                           | `leetcode`         |
| `leetcode.workspaceFolder`                                                         | 指定保存文件的工作区目录                                                                                                                                                                                                                                                                        | `""`               |
| `leetcode.filePath`                                                                | 指定生成题目文件的相对文件夹路径名和文件名。点击查看[更多详细用法](https://github.com/LeetCode-OpenSource/vscode-leetcode/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E9%A2%98%E7%9B%AE%E6%96%87%E4%BB%B6%E7%9A%84%E7%9B%B8%E5%AF%B9%E6%96%87%E4%BB%B6%E5%A4%B9%E8%B7%AF%E5%BE%84%E5%92%8C%E6%96%87%E4%BB%B6%E5%90%8D)。 |                    |
| `leetcode.enableStatusBar`                                                         | 指定是否在 VS Code 下方显示插件状态栏。                                                                                                                                                                                                                                                         | `true`             |
| `leetcode.editor.shortcuts`                                                        | 指定在编辑器内所自定义的快捷方式。可用的快捷方式有: `submit`, `test`, `star`, `solution`, `description`。                                                                                                                                                                                               | `["submit, test"]` |
| `leetcode.enableSideMode`                                                          | 指定在解决一道题时，是否将`问题预览`、`高票答案`与`提交结果`窗口集中在编辑器的第二栏。                                                                                                                                                                                                          | `true`             |
| `leetcode.nodePath`                                                                | 指定 `Node.js` 可执行文件的路径。如：C:\Program Files\nodejs\node.exe                                                                                                                                                                                                                           | `node`             |
| `leetcode.showCommentDescription`                                                  | 指定是否要在注释中显示题干。                                                                                                                                                                                                                                                                    | `false`            |
| `leetcode.useEndpointTranslation`                                                       | 是否显示翻译版本内容。                                                                                                                                                                                                                                                                                                                                                                | `true`            |

## 需要帮助？
在遇到任何问题时，可以先查看一下[疑难解答](https://github.com/LeetCode-OpenSource/vscode-leetcode/wiki/%E7%96%91%E9%9A%BE%E8%A7%A3%E7%AD%94)以及[常见问题](https://github.com/LeetCode-OpenSource/vscode-leetcode/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)寻求帮助。

如果您的问题依然没有解决，可以在 [Gitter Channel](https://gitter.im/vscode-leetcode/Lobby) 联系我们，或者您也可以[记录一个新的 issue](https://github.com/LeetCode-OpenSource/vscode-leetcode/issues/new/choose)。

## 更新日志

请参考[更新日志](https://github.com/LeetCode-OpenSource/vscode-leetcode/blob/master/CHANGELOG.md)

## 鸣谢

- 本插件基于[@skygragon](https://github.com/skygragon)的[leetcode-cli](https://github.com/skygragon/leetcode-cli)开源项目制作。
- 特别鸣谢这些[贡献者们](https://github.com/LeetCode-OpenSource/vscode-leetcode/blob/master/ACKNOWLEDGEMENTS.md)。
