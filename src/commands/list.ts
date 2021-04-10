// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { leetCodeExecutor } from "../leetCodeExecutor";
import { leetCodeManager } from "../leetCodeManager";
import { IProblem, ProblemCategory, ProblemState, UserStatus } from "../shared";
import { DialogType, promptForOpenOutputChannel } from "../utils/uiUtils";

export async function listProblems(): Promise<IProblem[]> {
    try {
        if (leetCodeManager.getStatus() === UserStatus.SignedOut) {
            return [];
        }
        const leetCodeConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("leetcode");
        const showLocked: boolean = !!leetCodeConfig.get<boolean>("showLocked");
        const problems: IProblem[] = [];
        for (const pc in ProblemCategory) {
            const result: string = await leetCodeExecutor.listProblems(showLocked, ProblemCategory[pc]);
            const lines: string[] = result.split("\n");
            const reg: RegExp = /^(.)\s(.{1,2})\s(.)\s\[(.*)\]\s*(.*)\s*(Easy|Medium|Hard)\s*\((\s*\d+\.\d+ %)\)/;
            const { companies, tags } = await leetCodeExecutor.getCompaniesAndTags();
            for (const line of lines) {
                const match: RegExpMatchArray | null = line.match(reg);
                if (match && match.length === 8) {
                    const id: string = match[4].trim();
                    problems.push({
                        id,
                        isFavorite: match[1].trim().length > 0,
                        locked: match[2].trim().length > 0,
                        state: parseProblemState(match[3]),
                        name: match[5].trim(),
                        difficulty: match[6].trim(),
                        passRate: match[7].trim(),
                        companies: companies[id] || ["Unknown"],
                        tags: tags[id] || ["Unknown"],
                        category: ProblemCategory[pc],
                    });
                }
            }
        }
        return problems.reverse();
    } catch (error) {
        await promptForOpenOutputChannel("Failed to list problems. Please open the output channel for details.", DialogType.error);
        return [];
    }
}

function parseProblemState(stateOutput: string): ProblemState {
    if (!stateOutput) {
        return ProblemState.Unknown;
    }
    switch (stateOutput.trim()) {
        case "v":
        case "✔":
        case "√":
            return ProblemState.AC;
        case "X":
        case "✘":
        case "×":
            return ProblemState.NotAC;
        default:
            return ProblemState.Unknown;
    }
}
