// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as cp from "child_process";
import * as vscode from "vscode";
import { leetCodeChannel } from "../leetCodeChannel";

interface IExecError extends Error {
    result?: string;
}

export async function executeCommand(command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
    return new Promise((resolve: (res: string) => void, reject: (e: Error) => void): void => {
        let result: string = "";

        const childProc: cp.ChildProcess = cp.spawn(command, args, { ...options, env: createEnvOption() });

        childProc.stdout?.on("data", (data: string | Buffer) => {
            data = data.toString();
            result = result.concat(data);
            leetCodeChannel.append(data);
        });

        childProc.stderr?.on("data", (data: string | Buffer) => leetCodeChannel.append(data.toString()));

        childProc.on("error", reject);

        childProc.on("close", (code: number) => {
            if (code !== 0 || result.indexOf("ERROR") > -1) {
                const error: IExecError = new Error(`Command "${command} ${args.toString()}" failed with exit code "${code}".`);
                if (result) {
                    error.result = result; // leetcode-cli may print useful content by exit with error code
                }
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export async function executeCommandWithProgress(message: string, command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
    let result: string = "";
    await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (p: vscode.Progress<{}>) => {
        return new Promise(async (resolve: (value?: unknown) => void, reject: (e: Error) => void): Promise<void> => {
            p.report({ message });
            try {
                result = await executeCommand(command, args, options);
                resolve(undefined);
            } catch (e) {
                reject(e);
            }
        });
    });
    return result;
}

// clone process.env and add http proxy
export function createEnvOption(): {} {
    const proxy: string | undefined = getHttpAgent();
    if (proxy) {
        const env: any = Object.create(process.env);
        env.http_proxy = proxy;
        return env;
    }
    return process.env;
}

function getHttpAgent(): string | undefined {
    return vscode.workspace.getConfiguration("http").get<string>("proxy");
}
