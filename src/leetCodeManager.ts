// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as cp from "child_process";
import { EventEmitter } from "events";
import * as vscode from "vscode";
import { leetCodeChannel } from "./leetCodeChannel";
import { leetCodeExecutor } from "./leetCodeExecutor";
import { IQuickItemEx, loginArgsMapping, UserStatus } from "./shared";
import { createEnvOption } from "./utils/cpUtils";
import { DialogType, promptForOpenOutputChannel } from "./utils/uiUtils";
import * as wsl from "./utils/wslUtils";

class LeetCodeManager extends EventEmitter {
    private currentUser: string | undefined;
    private userStatus: UserStatus;
    private readonly successRegex: RegExp = /(?:.*)Successfully .*login as (.*)/i;
    private readonly failRegex: RegExp = /.*\[ERROR\].*/i;

    constructor() {
        super();
        this.currentUser = undefined;
        this.userStatus = UserStatus.SignedOut;
    }

    public async getLoginStatus(): Promise<void> {
        try {
            const result: string = await leetCodeExecutor.getUserInfo();
            this.currentUser = this.tryParseUserName(result);
            this.userStatus = UserStatus.SignedIn;
        } catch (error) {
            this.currentUser = undefined;
            this.userStatus = UserStatus.SignedOut;
        } finally {
            this.emit("statusChanged");
        }
    }

    public async signIn(): Promise<void> {
        const picks: Array<IQuickItemEx<string>> = [];
        picks.push(
            {
                label: "LeetCode Account",
                detail: "Use LeetCode account to login (US endpoint is not supported)",
                value: "LeetCode",
            },
            {
                label: "Third-Party: GitHub",
                detail: "Use GitHub account to login",
                value: "GitHub",
            },
            {
                label: "Third-Party: LinkedIn",
                detail: "Use LinkedIn account to login",
                value: "LinkedIn",
            },
            {
                label: "LeetCode Cookie",
                detail: "Use LeetCode cookie copied from browser to login",
                value: "Cookie",
            },
        );
        const choice: IQuickItemEx<string> | undefined = await vscode.window.showQuickPick(picks);
        if (!choice) {
            return;
        }
        const loginMethod: string = choice.value;
        const commandArg: string | undefined = loginArgsMapping.get(loginMethod);
        if (!commandArg) {
            throw new Error(`The login method "${loginMethod}" is not supported.`);
        }
        const isByCookie: boolean = loginMethod === "Cookie";
        const inMessage: string = isByCookie ? "sign in by cookie" : "sign in";
        try {
            const userName: string | undefined = await new Promise(async (resolve: (res: string | undefined) => void, reject: (e: Error) => void): Promise<void> => {

                const leetCodeBinaryPath: string = await leetCodeExecutor.getLeetCodeBinaryPath();

                const childProc: cp.ChildProcess = wsl.useWsl()
                    ? cp.spawn("wsl", [leetCodeExecutor.node, leetCodeBinaryPath, "user", commandArg], { shell: true })
                    : cp.spawn(leetCodeExecutor.node, [leetCodeBinaryPath, "user", commandArg], {
                        shell: true,
                        env: createEnvOption(),
                    });

                childProc.stdout?.on("data", async (data: string | Buffer) => {
                    data = data.toString();
                    leetCodeChannel.append(data);
                    if (data.includes("twoFactorCode")) {
                        const twoFactor: string | undefined = await vscode.window.showInputBox({
                            prompt: "Enter two-factor code.",
                            ignoreFocusOut: true,
                            validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
                        });
                        if (!twoFactor) {
                            childProc.kill();
                            return resolve(undefined);
                        }
                        childProc.stdin?.write(`${twoFactor}\n`);
                    }
                    const successMatch: RegExpMatchArray | null = data.match(this.successRegex);
                    if (successMatch && successMatch[1]) {
                        childProc.stdin?.end();
                        return resolve(successMatch[1]);
                    } else if (data.match(this.failRegex)) {
                        childProc.stdin?.end();
                        return reject(new Error("Faile to login"));
                    }
                });

                childProc.stderr?.on("data", (data: string | Buffer) => leetCodeChannel.append(data.toString()));

                childProc.on("error", reject);
                const name: string | undefined = await vscode.window.showInputBox({
                    prompt: "Enter username or E-mail.",
                    ignoreFocusOut: true,
                    validateInput: (s: string): string | undefined => s && s.trim() ? undefined : "The input must not be empty",
                });
                if (!name) {
                    childProc.kill();
                    return resolve(undefined);
                }
                childProc.stdin?.write(`${name}\n`);
                const pwd: string | undefined = await vscode.window.showInputBox({
                    prompt: isByCookie ? "Enter cookie" : "Enter password.",
                    password: true,
                    ignoreFocusOut: true,
                    validateInput: (s: string): string | undefined => s ? undefined : isByCookie ? "Cookie must not be empty" : "Password must not be empty",
                });
                if (!pwd) {
                    childProc.kill();
                    return resolve(undefined);
                }
                childProc.stdin?.write(`${pwd}\n`);
            });
            if (userName) {
                vscode.window.showInformationMessage(`Successfully ${inMessage}.`);
                this.currentUser = userName;
                this.userStatus = UserStatus.SignedIn;
                this.emit("statusChanged");
            }
        } catch (error) {
            promptForOpenOutputChannel(`Failed to ${inMessage}. Please open the output channel for details`, DialogType.error);
        }

    }

    public async signOut(): Promise<void> {
        try {
            await leetCodeExecutor.signOut();
            vscode.window.showInformationMessage("Successfully signed out.");
            this.currentUser = undefined;
            this.userStatus = UserStatus.SignedOut;
            this.emit("statusChanged");
        } catch (error) {
            // swallow the error when sign out.
        }
    }

    public getStatus(): UserStatus {
        return this.userStatus;
    }

    public getUser(): string | undefined {
        return this.currentUser;
    }

    private tryParseUserName(output: string): string {
        const reg: RegExp = /^\s*.\s*(.+?)\s*https:\/\/leetcode/m;
        const match: RegExpMatchArray | null = output.match(reg);
        if (match && match.length === 2) {
            return match[1].trim();
        }

        return "Unknown";
    }
}

export const leetCodeManager: LeetCodeManager = new LeetCodeManager();
