"use strict";

import * as path from "path";
import * as wsl from "./utils/wslUtils";

export interface ILeetCodeExecutor {
    getLeetCodeBinaryPath(): Promise<string>;

    /* section for user command */
    getUserInfo(): Promise<string>;
    signOut(): Promise<string>;
    // TODO: implement login when leetcode-cli support login in batch mode.
    // signIn(): Promise<string>;

    /* section for problem command */
    listProblems(showLocked: boolean): Promise<string>;
    showProblem(id: string, language: string, outdir: string): Promise<string>;

    /* section for session command */
    listSessions(): Promise<string>;
    enableSession(name: string): Promise<string>;
    createSession(name: string): Promise<string>;

    /* section for solution command */
    submitSolution(filePath: string): Promise<string>;
    testSolution(filePath: string, testString?: string): Promise<string>;
}

class LeetCodeExecutor implements ILeetCodeExecutor {
    private leetCodeBinaryPath: string;
    private leetCodeBinaryPathInWsl: string;

    constructor() {
        this.leetCodeBinaryPath = path.join(__dirname, "..", "..", "node_modules", "leetcode-cli", "bin", "leetcode");
        this.leetCodeBinaryPathInWsl = "";
    }

    public async getLeetCodeBinaryPath(): Promise<string> {
        if (wsl.useWsl()) {
            if (!this.leetCodeBinaryPathInWsl) {
                this.leetCodeBinaryPathInWsl = `${await wsl.toWslPath(this.leetCodeBinaryPath)}`;
            }
            return `"${this.leetCodeBinaryPathInWsl}"`;
        }
        return `"${this.leetCodeBinaryPath}"`;
    }

    public async getUserInfo(): Promise<string> {
        return await wsl.executeCommandEx("node", [await this.getLeetCodeBinaryPath(), "user"]);
    }

    public async signOut(): Promise<string> {
        return await await wsl.executeCommandEx("node", [await this.getLeetCodeBinaryPath(), "user", "-L"]);
    }

    public async listProblems(showLocked: boolean): Promise<string> {
        return await wsl.executeCommandEx("node", showLocked ?
            [await this.getLeetCodeBinaryPath(), "list"] :
            [await this.getLeetCodeBinaryPath(), "list", "-q", "L"],
        );
    }

    public async showProblem(id: string, language: string, outdir: string): Promise<string> {
        return await wsl.executeCommandWithProgressEx("Fetching problem data...", "node", [await this.getLeetCodeBinaryPath(), "show", id, "-gx", "-l", language, "-o", `"${outdir}"`]);
    }

    public async listSessions(): Promise<string> {
        return await wsl.executeCommandEx("node", [await this.getLeetCodeBinaryPath(), "session"]);
    }

    public async enableSession(name: string): Promise<string> {
        return await wsl.executeCommandEx("node", [await this.getLeetCodeBinaryPath(), "session", "-e", name]);
    }

    public async createSession(name: string): Promise<string> {
        return await wsl.executeCommandEx("node", [await this.getLeetCodeBinaryPath(), "session", "-c", name]);
    }

    public async submitSolution(filePath: string): Promise<string> {
        return await wsl.executeCommandWithProgressEx("Submitting to LeetCode...", "node", [await this.getLeetCodeBinaryPath(), "submit", `"${filePath}"`]);
    }

    public async testSolution(filePath: string, testString?: string): Promise<string> {
        if (testString) {
            return await wsl.executeCommandWithProgressEx("Submitting to LeetCode...", "node", [await this.getLeetCodeBinaryPath(), "test", `"${filePath}"`, "-t", `"${testString}"`]);
        }
        return await wsl.executeCommandWithProgressEx("Submitting to LeetCode...", "node", [await this.getLeetCodeBinaryPath(), "test", `"${filePath}"`]);
    }
}

export const leetCodeExecutor: ILeetCodeExecutor = new LeetCodeExecutor();
