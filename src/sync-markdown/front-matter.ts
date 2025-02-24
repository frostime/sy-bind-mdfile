/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-08-12 17:14:43
 * @FilePath     : /src/sync-markdown/front-matter.ts
 * @LastEditTime : 2025-02-24 22:11:55
 * @Description  : 
 */
import matter from "gray-matter";
import { stringify } from "gray-matter";

export type YAML = string;
export type FrontMatter = Record<string, any>;
export const yaml2frontmatter = (yaml: YAML): FrontMatter => {
    let frontMatter = '';
    yaml = yaml.trim();
    if (yaml !== '') {
        if (!yaml.startsWith('---')) frontMatter += '---\n';
        frontMatter += yaml + '\n';
        if (!yaml.endsWith('---')) frontMatter += '---\n';
    }
    let file = matter(frontMatter);
    return file.data;
}

export const frontmatter2yaml = (frontmatter: FrontMatter): YAML => {
    let yaml = matter.stringify('', frontmatter);
    yaml = yaml.trim();
    return yaml;
}

export const addFMToMd = (markdown: string, frontmatter: FrontMatter) => {
    return stringify(markdown, frontmatter);
}

export const parseFMFromMd = (markdown: string) => {
    let file = matter(markdown);
    return { frontmatter: file.data, markdown: file.content };
}
