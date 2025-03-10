/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-08-11 14:55:52
 * @FilePath     : /src/sync-markdown/do-port.ts
 * @LastEditTime : 2025-02-24 22:11:25
 * @Description  : 
 */
import { openTab, showMessage } from "siyuan";

import { createDocWithMd, exportMdContent, putFile, request, updateBlock } from "@frostime/siyuan-plugin-kits/api";
import { app, formatDateTime, html2ele, confirmDialog } from "@frostime/siyuan-plugin-kits";

import i18n from './i18n';
import { addFMToMd, parseFMFromMd, type FrontMatter } from './front-matter';

const nodeFs = window.require('fs') as typeof import('fs');
const nodePath = window.require('path') as typeof import('path');
const electron = window.require('electron');

function convertHtmlImagesToMarkdown(content: string): string {
    const imgRegex = /<img\s+(?:[^>]*?\s+)?src=(["'])(.*?)\1(?:\s+alt=(["'])(.*?)\3)?[^>]*>(?:<\/img>)?/gi;
    return content.replace(imgRegex, (match, _quote1, src, _quote2, alt = '') => {
        // Decode HTML entities in src and alt
        src = src.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        alt = alt.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

        // Escape special characters in alt text
        alt = alt.replace(/([[\]])/g, '\\$1');

        return `![${alt}](${src})`;
    });
}

export const doImport = async (
    doc: Block,
    config: IBindMdConfig,
    confirmCb?: (frontMatter: FrontMatter, content) => void
) => {
    let mdPath = nodePath.join(config.mdDir, `${config.fname}.md`);
    let { assetDir, assetPrefix } = config;
    //读取 mdpath 文件的文本内容
    let content = nodeFs.readFileSync(mdPath, 'utf8');

    // Convert HTML images to Markdown syntax
    content = convertHtmlImagesToMarkdown(content);

    let data = parseFMFromMd(content);
    const frontmatter = data.frontmatter;
    content = data.markdown;

    const confirm = `
<div class="fn__flex fn__flex-column">
  <div class="fn__flex" style="margin-bottom: 16px;">
    <label class="fn__flex-1">${i18n.doimport.loadasset}</label>
    <input type="checkbox" class="b3-switch fn__flex-center">
  </div>
  <div class="fn__flex" style="margin-bottom: 16px;">
    <label class="fn__flex-1" for="importMethod" style="margin-bottom: 8px;">${i18n.doimport.method.title}</label>
    <select id="importMethod" name="importMethod" class="b3-select">
      <option value="new" selected>${i18n.doimport.method.new}</option>
      <option value="overwrite">${i18n.doimport.method.overwrite}</option>
    </select>
  </div>
  <div class="fn__flex fn__flex-1">
    <textarea class="b3-text-field fn__block" readonly
        style="font-size: 17px; flex: 1; min-height: 300px; resize: vertical;"
        spellcheck="false"
    >${content}</textarea>
  </div>
</div>
`;
    const ele = html2ele(confirm);

    confirmDialog({
        title: 'Import Confirm',
        content: ele,
        width: '600px',
        confirm: async (dialog: HTMLElement) => {
            const checkbox = dialog.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const select = dialog.querySelector('select') as HTMLSelectElement;
            const loadAsset = checkbox.checked;
            const method = select.value;

            //解析 md 文件当中所有的 asset (![...](...))
            const assetRegex = /!\[.*?\]\((.*?)\)/g;
            let match: RegExpExecArray;
            let assets: string[] = [];
            while ((match = assetRegex.exec(content)) !== null) {
                let asset = match[1];
                if (asset.startsWith('http://') || asset.startsWith('https://') || asset.startsWith('file:///')) {
                    continue;
                }
                assets.push(match[1]);
            }

            //解析所有的 asset 的 link 地址
            // TODO 兼容 `./` 的前缀
            for (let asset of assets) {
                let localPath = asset;
                if (asset.startsWith(assetPrefix)) {
                    localPath = asset.replace(assetPrefix, assetDir);
                }
                console.log(`Asset 文件: ${localPath}`);

                /**
                 * 不导入文件
                 */
                if (loadAsset === false) {
                    const dataDir = window.siyuan.config.system.dataDir;
                    let filename = nodePath.basename(localPath);
                    const fileInSiyuan = nodePath.join(dataDir, 'assets', filename);
                    //如果 markdown 中指向的文件已经在 siyuan 中，那么就使用思源当中的链接
                    if (nodeFs.existsSync(fileInSiyuan)) {
                        content = content.replace(asset, `assets/${filename}`);
                    } else {
                        //如果 markdown 中指向的文件不在 siyuan 中，那么就使用本地文件的 file:/// 协议
                        let fileUri = `file:///${localPath.replace(/\\/g, '/')}`;
                        content = content.replace(asset, fileUri);
                    }
                } else {
                    if (!nodeFs.existsSync(localPath)) {
                        console.log(`Asset file not found: ${localPath}`);
                        continue;
                    }
                    let filename = nodePath.parse(asset);
                    let filebasename = filename.name;
                    let fext = filename.ext;
                    let id = window.Lute.NewNodeID();
                    let sylink = `assets/Import-${filebasename}-${id}${fext}`;
                    let sypath = `/data/${sylink}`;

                    let fileBuffer = nodeFs.readFileSync(localPath);

                    // 不需要创建 FormData 对象，直接传递文件内容
                    let fileblob = new Blob([fileBuffer], { type: 'application/octet-stream' });

                    await putFile(sypath, false, fileblob);
                    content = content.replace(asset, sylink);
                }
            }

            let newDocId: BlockId;
            if (method === 'new') {
                let filename = nodePath.basename(mdPath);
                let newPath = `${doc.hpath}/${filename}[${Date.now()}]`;
                newDocId = await createDocWithMd(doc.box, newPath, content);
            } else {
                await updateBlock('markdown', content, doc.id);
            }

            openTab({
                app: app,
                doc: {
                    id: newDocId
                }
            });

            showMessage(`Import from: ${mdPath}`, 6000);
            if (confirmCb) {
                confirmCb(frontmatter, content);
            }
        }
    });
}

export const doExport = async (
    document: Block, config: IBindMdConfig
) => {

    let mdPath = nodePath.join(config.mdDir, `${config.fname}.md`);

    let { assetDir, assetPrefix, frontmatter, exportBasicYaml } = config;

    let { content } = await exportMdContent(document.id, {
        yfm: false
    });
    const lines = content.split('\n');
    //去掉重复的顶级标题
    if (lines.length > 1 && lines[0].startsWith('# ')) {
        content = lines.slice(1).join('\n');
    }

    assetDir = assetDir.replace(/\\/g, '/');

    // let assets: string[] = await request('/api/asset/getDocImageAssets', { id: document.id });
    // https://github.com/siyuan-note/siyuan/issues/13875
    let assets: string[] = await request('/api/asset/getDocAssets', { id: document.id });
    assets = assets?.filter((asset) => {
        if (asset.startsWith('http://') || asset.startsWith('https://')) {
            return false;
        }
        return true;
    });

    if (assets) {
        //check assetDir
        if (!nodeFs.existsSync(assetDir)) {
            nodeFs.mkdirSync(assetDir, { recursive: true });
        }

        // Replace asset URLs in the markdown content
        let replaceMaps: Record<string, string> = assets.reduce((obj, asset) => {
            let fname = nodePath.basename(asset);
            if (!asset.startsWith('file:///')) {
                obj[asset] = nodePath.join(assetPrefix, fname);
            } else {
                //转换为本地路径
                let localpath = asset.replace('file:///', '');
                let dir = nodePath.dirname(localpath);
                //如果 localpath 实际上就是 assetDir，那么就使用 assetPrifix 替换
                if (dir.replace(/\\/g, '/') === assetDir.replace(/\\/g, '/')) {
                    asset = asset.replaceAll(' ', '%20');  //导入的 md content 中的 file:/// 协议是编码过的
                    obj[asset] = nodePath.join(assetPrefix, fname);
                }
            }
            return obj;
        }, {});
        for (let [oldPath, newPath] of Object.entries(replaceMaps)) {
            // content = content.replace(new RegExp(oldPath, 'g'), newPath);
            newPath = newPath.replace(/\\/g, '/');
            content = content.replaceAll(oldPath, newPath);
        }

        const dataDir = window.siyuan.config.system.dataDir;
        for (let asset of assets) {
            const sourcePath = nodePath.join(dataDir, asset);
            const destPath = nodePath.join(assetDir, nodePath.basename(asset));
            if (!nodeFs.existsSync(sourcePath)) {
                console.log(`Asset file not found: ${sourcePath}`);
                continue;
            }
            nodeFs.copyFileSync(sourcePath, destPath);
            console.log(`Copying ${sourcePath} ---> ${destPath}`);
        }
    }

    // ADD Default FrontMatter
    if (exportBasicYaml) {
        frontmatter = {
            ...frontmatter,
            'id': document.id,
            'title': document.content,
            'notebook': window.siyuan.notebooks.find(n => n.id = document.box)?.name ?? '',
            'hpath': document.hpath,
            'export': formatDateTime('yyyy-MM-dd HH:mm:ss'),
        };
    }

    content = addFMToMd(content, frontmatter);
    content = content.trimStart();
    // Save the modified Markdown content
    nodeFs.writeFileSync(mdPath, content, 'utf8');
    console.log(`Export success: ${mdPath}`);
    // let fileUri = `file:///${mdPath.replace(/\\/g, '/')}`

    showMessage(`Export to: ${mdPath}`, 6000);
    confirmDialog({
        title: 'Export Success',
        content: i18n.succssConfirm.replace('{0}', `<a href="${mdPath}" target="_blank">${mdPath}</a>`),
        width: '600px',
        confirm: () => {
            electron.shell.showItemInFolder(mdPath);
        }
    });
}




