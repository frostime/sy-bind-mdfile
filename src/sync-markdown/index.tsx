/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-08-07 15:34:04
 * @FilePath     : /src/sync-markdown/index.tsx
 * @LastEditTime : 2024-10-02 16:24:55
 * @Description  : 
 */
import { IEventBusMap, showMessage } from "siyuan";

import type BindMdfilePlugin from "@/index";
import { solidDialog } from "@/libs/dialog";
import { getBlockAttrs, getBlockByID, setBlockAttrs } from "@/api";

import SyncMdConfig from './md-config';
import { doExport, doImport } from "./do-port";

import i18n from './i18n';
import { frontmatter2yaml, yaml2frontmatter } from "./front-matter";

import { initTemplates } from "./template-store";

const nodeFs = window.require('fs');
const nodePath = window.require('path');

/**
 * 保存的 custom attr 名称；不同设备保存在不同的属性下
 */
const blockAttrName = (device: boolean = true) => {
    if (!device) return 'custom-export-md';
    return `custom-export-md-${window.siyuan.config.system.id}`
}

const updateCustomAttr = async (
    document: Block, fname: string, mdDir: string,
    assetDir: string, assetPrefix: string, frontmatter?: Record<string, string>
) => {
    let attrs = {
        fname: fname,
        mdDir: mdDir,
        assetDir: assetDir,
        assetPrefix: assetPrefix,
    };
    if (frontmatter) {
        attrs['frontmatter'] = frontmatter;
    }
    const store = {};
    store[blockAttrName(true)] = JSON.stringify(attrs);
    setBlockAttrs(document.id, store);
}

const getCustomAttr = async (document: Block) => {
    let attr = await getBlockAttrs(document.id);
    let data = { fname: '', mdDir: '', assetDir: '', assetPrefix: '', frontmatter: {} };
    let cache = {}
    if (attr[blockAttrName(true)]) {
        cache = JSON.parse(attr[blockAttrName(true)]);
    } else if (attr[blockAttrName(false)]) {
        cache = JSON.parse(attr[blockAttrName(false)]);
    }
    data = { ...data, ...cache };
    return data;
}

const eventHandler = async (e: CustomEvent<IEventBusMap['click-editortitleicon']>) => {
    let docId = e.detail.data.rootID;
    let menu = e.detail.menu;
    menu.addItem({
        icon: 'iconUpload',
        label: i18n.menuLabel,
        'click': async () => {
            let doc = await getBlockByID(docId);

            let { fname, mdDir, assetDir, assetPrefix, frontmatter } = await getCustomAttr(doc);
            fname = fname || doc.content;

            let yaml = frontmatter2yaml(frontmatter);

            const dialog = solidDialog({
                'title': i18n.menuLabel,
                loader: () => SyncMdConfig({
                    fname: fname,
                    mdDir, assetDir, assetPrefix, yaml,
                    updateFname: (v) => {
                        fname = v;
                    },
                    updateMdDir: (v) => {
                        mdDir = v;
                    },
                    updateAsset: (v) => {
                        assetDir = v;
                    },
                    updateAssetPrefix: (v) => {
                        assetPrefix = v;
                    },
                    updateYaml: (v) => {
                        yaml = v;
                    },
                    import: () => {
                        if (fname && mdDir && assetDir) {
                            let mdPath = nodePath.join(mdDir, `${fname}.md`);
                            doImport(doc, mdPath, assetDir, assetPrefix, (frontmatter: Record<string, string>) => {
                                updateCustomAttr(doc, fname, mdDir, assetDir, assetPrefix, frontmatter);
                            });
                        } else {
                            showMessage(i18n.notSet, 4000, 'error');
                            console.log(`Import failed: ${i18n.notSet}`);
                            console.log(fname, mdDir, assetDir);
                        }
                        dialog.destroy();
                    },
                    export: () => {
                        if (fname && mdDir && assetDir) {
                            let mdPath = nodePath.join(mdDir, `${fname}.md`);
                            const frontmatter = yaml2frontmatter(yaml);

                            doExport(doc, mdPath, assetDir, assetPrefix, frontmatter);
                            updateCustomAttr(doc, fname, mdDir, assetDir, assetPrefix, frontmatter);
                        } else {
                            showMessage(i18n.notSet, 4000, 'error');
                            console.log(`Export failed: ${i18n.notSet}`);
                            console.log(fname, mdDir, assetDir);
                        }
                        dialog.destroy();
                    },
                    cancel: () => {
                        dialog.destroy();
                    }
                }),
                width: '700px'
            })
        }
    })


}


export let name = "SyncMarkdown";
export let enabled = false;
export const load = (plugin: BindMdfilePlugin) => {
    if (!nodeFs || !nodePath) return;

    if (enabled) return;
    enabled = true;
    initTemplates();
    plugin.eventBus.on('click-editortitleicon', eventHandler);
}

export const unload = (plugin: BindMdfilePlugin) => {
    if (!enabled) return;
    enabled = false;

    plugin.eventBus.off('click-editortitleicon', eventHandler);
}