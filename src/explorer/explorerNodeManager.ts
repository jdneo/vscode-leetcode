// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as _ from "lodash";
import { Disposable } from "vscode";
import * as list from "../commands/list";
import { Category, defaultProblem, ProblemCategory, ProblemState } from "../shared";
import { shouldHideSolvedProblem } from "../utils/settingUtils";
import { LeetCodeNode } from "./LeetCodeNode";

class ExplorerNodeManager implements Disposable {
    private explorerNodeMap: Map<string, LeetCodeNode> = new Map<string, LeetCodeNode>();
    private companySet: Set<string> = new Set<string>();
    private tagSet: Set<string> = new Set<string>();

    public async refreshCache(): Promise<void> {
        this.dispose();
        const shouldHideSolved: boolean = shouldHideSolvedProblem();
        for (const problem of await list.listProblems()) {
            if (shouldHideSolved && problem.state === ProblemState.AC) {
                continue;
            }
            this.explorerNodeMap.set(problem.id, new LeetCodeNode(problem));
            for (const company of problem.companies) {
                this.companySet.add(company);
            }
            for (const tag of problem.tags) {
                this.tagSet.add(tag);
            }
        }
    }

    public getRootNodes(): LeetCodeNode[] {
        return [
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: Category.All,
                name: Category.All,
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: Category.Difficulty,
                name: Category.Difficulty,
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: Category.Tag,
                name: Category.Tag,
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: Category.Company,
                name: Category.Company,
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: Category.Favorite,
                name: Category.Favorite,
            }), false),
        ];
    }

    public getAllNodes(): LeetCodeNode[] {
        // return Array.from(this.explorerNodeMap.values());
        const res: LeetCodeNode[] = [];
        res.push(
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.ALGORITHMS}`,
                name: "算法",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.DATABASE}`,
                name: "数据库",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.SHELL}`,
                name: "Shell",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.CONCURRENCY}`,
                name: "多线程",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.LCCI}`,
                name: "程序员面试金典",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.All}.${ProblemCategory.LCOF}`,
                name: "剑指Offer",
            }), false),
        );
        this.sortSubCategoryNodes(res, Category.All);
        return res;
    }

    public getAllDifficultyNodes(): LeetCodeNode[] {
        const res: LeetCodeNode[] = [];
        res.push(
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.Difficulty}.Easy`,
                name: "Easy",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.Difficulty}.Medium`,
                name: "Medium",
            }), false),
            new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.Difficulty}.Hard`,
                name: "Hard",
            }), false),
        );
        this.sortSubCategoryNodes(res, Category.Difficulty);
        return res;
    }

    public getAllCompanyNodes(): LeetCodeNode[] {
        const res: LeetCodeNode[] = [];
        for (const company of this.companySet.values()) {
            res.push(new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.Company}.${company}`,
                name: _.startCase(company),
            }), false));
        }
        this.sortSubCategoryNodes(res, Category.Company);
        return res;
    }

    public getAllTagNodes(): LeetCodeNode[] {
        const res: LeetCodeNode[] = [];
        for (const tag of this.tagSet.values()) {
            res.push(new LeetCodeNode(Object.assign({}, defaultProblem, {
                id: `${Category.Tag}.${tag}`,
                name: _.startCase(tag),
            }), false));
        }
        this.sortSubCategoryNodes(res, Category.Tag);
        return res;
    }

    public getNodeById(id: string): LeetCodeNode | undefined {
        return this.explorerNodeMap.get(id);
    }

    public getFavoriteNodes(): LeetCodeNode[] {
        const res: LeetCodeNode[] = [];
        for (const node of this.explorerNodeMap.values()) {
            if (node.isFavorite) {
                res.push(node);
            }
        }
        return res;
    }

    public getChildrenNodesById(id: string): LeetCodeNode[] {
        // The sub-category node's id is named as {Category.SubName}
        const metaInfo: string[] = id.split(".");
        const res: LeetCodeNode[] = [];
        for (const node of this.explorerNodeMap.values()) {
            switch (metaInfo[0]) {
                case Category.All:
                    if (node.category === metaInfo[1]) {
                        res.unshift(node);
                    }
                    break;
                case Category.Company:
                    if (node.companies.indexOf(metaInfo[1]) >= 0) {
                        res.push(node);
                    }
                    break;
                case Category.Difficulty:
                    if (node.difficulty === metaInfo[1]) {
                        res.push(node);
                    }
                    break;
                case Category.Tag:
                    if (node.tags.indexOf(metaInfo[1]) >= 0) {
                        res.push(node);
                    }
                    break;
                default:
                    break;
            }
        }
        return res;
    }

    public dispose(): void {
        this.explorerNodeMap.clear();
        this.companySet.clear();
        this.tagSet.clear();
    }

    private sortSubCategoryNodes(subCategoryNodes: LeetCodeNode[], category: Category): void {
        switch (category) {
            case Category.All:
                function getCategoryValue(input: LeetCodeNode): number {
                    switch (input.category.toLowerCase()) {
                        case "algorithms":
                            return 1;
                        case "database":
                            return 2;
                        case "shell":
                            return 3;
                        case "concurrency":
                            return 4;
                        case "lcci":
                            return 5;
                        case "lcof":
                            return 6;
                        default:
                            return Number.MAX_SAFE_INTEGER;
                    }
                }
                subCategoryNodes.sort((a: LeetCodeNode, b: LeetCodeNode): number => getCategoryValue(a) - getCategoryValue(b));
                break;
            case Category.Difficulty:
                function getDifficultyValue(input: LeetCodeNode): number {
                    switch (input.name.toLowerCase()) {
                        case "easy":
                            return 1;
                        case "medium":
                            return 2;
                        case "hard":
                            return 3;
                        default:
                            return Number.MAX_SAFE_INTEGER;
                    }
                }
                subCategoryNodes.sort((a: LeetCodeNode, b: LeetCodeNode): number => getDifficultyValue(a) - getDifficultyValue(b));
                break;
            case Category.Tag:
            case Category.Company:
                subCategoryNodes.sort((a: LeetCodeNode, b: LeetCodeNode): number => {
                    if (a.name === "Unknown") {
                        return 1;
                    } else if (b.name === "Unknown") {
                        return -1;
                    } else {
                        return Number(a.name > b.name) - Number(a.name < b.name);
                    }
                });
                break;
            default:
                break;
        }
    }
}

export const explorerNodeManager: ExplorerNodeManager = new ExplorerNodeManager();
