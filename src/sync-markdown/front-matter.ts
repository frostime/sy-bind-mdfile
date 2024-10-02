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
