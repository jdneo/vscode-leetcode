// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as cp from "child_process";
import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as requireFromString from "require-from-string";
import { ExtensionContext } from "vscode";
import { ConfigurationChangeEvent, Disposable, MessageItem, window, workspace, WorkspaceConfiguration } from "vscode";
import { Endpoint, IProblem, leetcodeHasInited, supportedPlugins } from "./shared";
import { executeCommand, executeCommandWithProgress } from "./utils/cpUtils";
import { DialogOptions, openUrl } from "./utils/uiUtils";
import * as wsl from "./utils/wslUtils";
import { toWslPath, useWsl } from "./utils/wslUtils";

class LeetCodeExecutor implements Disposable {
    private leetCodeRootPath: string;
    private nodeExecutable: string;
    private configurationChangeListener: Disposable;

    constructor() {
        this.leetCodeRootPath = path.join(__dirname, "..", "..", "node_modules", "@baoxi/vsc-leetcode-cli");
        this.nodeExecutable = this.getNodePath();
        this.configurationChangeListener = workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
            if (event.affectsConfiguration("leetcode.nodePath")) {
                this.nodeExecutable = this.getNodePath();
            }
        }, this);
    }

    public async getLeetCodeBinaryPath(): Promise<string> {
        if (wsl.useWsl()) {
            return `${await wsl.toWslPath(`"${path.join(this.leetCodeRootPath, "bin", "leetcode")}"`)}`;
        }
        return `"${path.join(this.leetCodeRootPath, "bin", "leetcode")}"`;
    }

    public async meetRequirements(context: ExtensionContext): Promise<boolean> {
        const hasInited: boolean | undefined = context.globalState.get(leetcodeHasInited);
        if (!hasInited) {
            await this.removeOldCache();
        }
        if (this.nodeExecutable !== "node") {
            if (!await fse.pathExists(this.nodeExecutable)) {
                throw new Error(`The Node.js executable does not exist on path ${this.nodeExecutable}`);
            }
            // Wrap the executable with "" to avoid space issue in the path.
            this.nodeExecutable = `"${this.nodeExecutable}"`;
            if (useWsl()) {
                this.nodeExecutable = await toWslPath(this.nodeExecutable);
            }
        }
        try {
            await this.executeCommandEx(this.nodeExecutable, ["-v"]);
        } catch (error) {
            const choice: MessageItem | undefined = await window.showErrorMessage(
                "LeetCode extension needs Node.js installed in environment path",
                DialogOptions.open,
            );
            if (choice === DialogOptions.open) {
                openUrl("https://nodejs.org");
            }
            return false;
        }
        for (const plugin of supportedPlugins) {
            try { // Check plugin
                await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "plugin", "-e", plugin]);
            } catch (error) { // Remove old cache that may cause the error download plugin and activate
                await this.removeOldCache();
                await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "plugin", "-i", plugin]);
            }
        }
        // Set the global state HasInited true to skip delete old cache after init
        context.globalState.update(leetcodeHasInited, true);
        return true;
    }

    public async deleteCache(): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "cache", "-d"]);
    }

    public async getUserInfo(): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "user"]);
    }

    public async signOut(): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "user", "-L"]);
    }

    public async listProblems(showLocked: boolean, category: string): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, showLocked ?
            [await this.getLeetCodeBinaryPath(), "list", "-c", category] :
            [await this.getLeetCodeBinaryPath(), "list", "-c", category, "-q", "L"],
        );
    }

    public async showProblem(problemNode: IProblem, language: string, filePath: string, showDescriptionInComment: boolean = false): Promise<void> {
        const templateType: string = showDescriptionInComment ? "-cx" : "-c";

        if (!await fse.pathExists(filePath)) {
            await fse.createFile(filePath);
            const codeTemplate: string = await this.executeCommandWithProgressEx("Fetching problem data...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "show", `"${problemNode.id}"`, templateType, "-l", language]);
            await fse.writeFile(filePath, codeTemplate);
        }
    }

    public async showSolution(input: string, language: string): Promise<string> {
        const solution: string = await this.executeCommandWithProgressEx("Fetching top voted solution from discussions...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "show", input, "--solution", "-l", language]);
        return solution;
    }

    public async getDescription(problemNodeId: string): Promise<string> {
        return await this.executeCommandWithProgressEx("Fetching problem description...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "show", `"${problemNodeId}"`, "-x"]);
    }

    public async listSessions(): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "session"]);
    }

    public async enableSession(name: string): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "session", "-e", name]);
    }

    public async createSession(id: string): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "session", "-c", id]);
    }

    public async deleteSession(id: string): Promise<string> {
        return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "session", "-d", id]);
    }

    public async submitSolution(filePath: string): Promise<string> {
        try {
            return await this.executeCommandWithProgressEx("Submitting to LeetCode...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "submit", `"${filePath}"`]);
        } catch (error) {
            if (error.result) {
                return error.result;
            }
            throw error;
        }
    }

    public async testSolution(filePath: string, testString?: string): Promise<string> {
        if (testString) {
            return await this.executeCommandWithProgressEx("Submitting to LeetCode...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "test", `"${filePath}"`, "-t", `${testString}`]);
        }
        return await this.executeCommandWithProgressEx("Submitting to LeetCode...", this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "test", `"${filePath}"`]);
    }

    public async switchEndpoint(endpoint: string): Promise<string> {
        switch (endpoint) {
            case Endpoint.LeetCodeCN:
                return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "plugin", "-e", "leetcode.cn"]);
            case Endpoint.LeetCode:
            default:
                return await this.executeCommandEx(this.nodeExecutable, [await this.getLeetCodeBinaryPath(), "plugin", "-d", "leetcode.cn"]);
        }
    }

    public async toggleFavorite(node: IProblem, addToFavorite: boolean): Promise<void> {
        const commandParams: string[] = [await this.getLeetCodeBinaryPath(), "star", node.id];
        if (!addToFavorite) {
            commandParams.push("-d");
        }
        await this.executeCommandWithProgressEx("Updating the favorite list...", "node", commandParams);
    }

    public async getCompaniesAndTags(): Promise<{ companies: { [key: string]: string[] }, tags: { [key: string]: string[] } }> {
        // preprocess the plugin source
        const companiesTagsPath: string = path.join(this.leetCodeRootPath, "lib", "plugins", "company.js");
        const companiesTagsSrc: string = (await fse.readFile(companiesTagsPath, "utf8")).replace(
            "module.exports = plugin",
            "module.exports = { COMPONIES, TAGS }",
        );
        const { COMPONIES, TAGS } = requireFromString(companiesTagsSrc, companiesTagsPath);
        return { companies: COMPONIES, tags: TAGS };
    }

    public get node(): string {
        return this.nodeExecutable;
    }

    public dispose(): void {
        this.configurationChangeListener.dispose();
    }

    private getNodePath(): string {
        const extensionConfig: WorkspaceConfiguration = workspace.getConfiguration("leetcode", null);
        return extensionConfig.get<string>("nodePath", "node" /* default value */);
    }

    private async executeCommandEx(command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        if (wsl.useWsl()) {
            return await executeCommand("wsl", [command].concat(args), options);
        }
        return await executeCommand(command, args, options);
    }

    private async executeCommandWithProgressEx(message: string, command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        if (wsl.useWsl()) {
            return await executeCommandWithProgress(message, "wsl", [command].concat(args), options);
        }
        return await executeCommandWithProgress(message, command, args, options);
    }

    private async removeOldCache(): Promise<void> {
        const oldPath: string = path.join(os.homedir(), ".lc");
        if (await fse.pathExists(oldPath)) {
            await fse.remove(oldPath);
        }
    }

}

export const leetCodeExecutor: LeetCodeExecutor = new LeetCodeExecutor();
