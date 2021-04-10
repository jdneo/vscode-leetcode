// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { Command } from "vscode";
import { IProblem, ProblemState } from "../shared";

export class LeetCodeNode {

    constructor(private data: IProblem, private isProblemNode: boolean = true) { }

    public get locked(): boolean {
        return this.data.locked;
    }
    public get name(): string {
        return this.data.name;
    }

    public get category(): string {
        return this.data.category;
    }

    public get state(): ProblemState {
        return this.data.state;
    }

    public get id(): string {
        return this.data.id;
    }

    public get passRate(): string {
        return this.data.passRate;
    }

    public get difficulty(): string {
        return this.data.difficulty;
    }

    public get tags(): string[] {
        return this.data.tags;
    }

    public get companies(): string[] {
        return this.data.companies;
    }

    public get isFavorite(): boolean {
        return this.data.isFavorite;
    }

    public get isProblem(): boolean {
        return this.isProblemNode;
    }

    public get previewCommand(): Command {
        return {
            title: "Preview Problem",
            command: "leetcode.previewProblem",
            arguments: [this],
        };
    }

}
