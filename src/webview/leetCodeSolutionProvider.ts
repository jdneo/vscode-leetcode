// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { ViewColumn } from "vscode";
import { leetCodePreviewProvider } from "./leetCodePreviewProvider";
import { ILeetCodeWebviewOption, LeetCodeWebview } from "./LeetCodeWebview";
import { markdownEngine } from "./markdownEngine";

class LeetCodeSolutionProvider extends LeetCodeWebview {

    protected readonly viewType: string = "leetcode.solution";
    private problemName: string;
    private solution: Solution;

    public show(solutionString: string): void {
        this.solution = this.parseSolution(solutionString);
        this.showWebviewInternal();
    }

    protected getWebviewOption(): ILeetCodeWebviewOption {
        if (leetCodePreviewProvider.isSideMode()) {
            return {
                title: "Solution",
                viewColumn: ViewColumn.Two,
                preserveFocus: true,
            };
        } else {
            return {
                title: `Solution: ${this.problemName}`,
                viewColumn: ViewColumn.One,
            };
        }
    }

    protected getWebviewContent(): string {
        const styles: string = markdownEngine.getStyles();
        const { title, url, lang, author, votes } = this.solution;
        const head: string = markdownEngine.render(`# [${title}](${url})`);
        const auth: string = `[${author}](https://leetcode.com/${author}/)`;
        const info: string = markdownEngine.render([
            `| Language |  Author  |  Votes   |`,
            `| :------: | :------: | :------: |`,
            `| ${lang}  | ${auth}  | ${votes} |`,
        ].join("\n"));
        const body: string = markdownEngine.render(this.solution.body, {
            lang: this.solution.lang,
            host: "https://discuss.leetcode.com/",
        });
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; script-src vscode-resource:; style-src vscode-resource:;"/>
                ${styles}
            </head>
            <body class="vscode-body 'scrollBeyondLastLine' 'wordWrap' 'showEditorSelection'" style="tab-size:4">
                ${head}
                ${info}
                ${body}
            </body>
            </html>
        `;
    }

    protected onDidDisposeWebview(): void {
        super.onDidDisposeWebview();
        // delete this.solution;
    }

    private parseSolution(raw: string): Solution {
        raw = raw.slice(1); // skip first empty line
        [this.problemName, raw] = raw.split(/\n\n([^]+)/); // parse problem name and skip one line
        const solution: Solution = new Solution();
        // [^] matches everything including \n, yet can be replaced by . in ES2018's `m` flag
        [solution.title, raw] = raw.split(/\n\n([^]+)/);
        [solution.url, raw] = raw.split(/\n\n([^]+)/);
        [solution.lang, raw] = raw.match(/\* Lang:\s+(.+)\n([^]+)/)!.slice(1);
        [solution.author, raw] = raw.match(/\* Author:\s+(.+)\n([^]+)/)!.slice(1);
        [solution.votes, raw] = raw.match(/\* Votes:\s+(\d+)\n\n([^]+)/)!.slice(1);
        solution.body = raw;
        return solution;
    }
}

// tslint:disable-next-line:max-classes-per-file
class Solution {
    public title: string = "";
    public url: string = "";
    public lang: string = "";
    public author: string = "";
    public votes: string = "";
    public body: string = ""; // Markdown supported
}

export const leetCodeSolutionProvider: LeetCodeSolutionProvider = new LeetCodeSolutionProvider();
