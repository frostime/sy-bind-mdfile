/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-08-07 15:34:04
 * @FilePath     : /src/sync-markdown/index.tsx
 * @LastEditTime : 2025-01-18 22:36:18
 * @Description  : 
 */
import { IEventBusMap, showMessage } from "siyuan";

import type BindMdfilePlugin from "@/index";
import { solidDialog } from "@/libs/dialog";
import { getBlockAttrs, getBlockByID, setBlockAttrs } from "@frostime/siyuan-plugin-kits/api";

import SyncMdConfig from './md-config';
import { doExport, doImport } from "./do-port";

import i18n from './i18n';
import { frontmatter2yaml, yaml2frontmatter } from "./front-matter";

import { initTemplates } from "./template-store";
import { createStore } from "solid-js/store";

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
    assetDir: string, assetPrefix: string, frontmatter?: Record<string, string>, exportBasicYaml?: boolean
) => {
    let attrs = {
        fname: fname,
        mdDir: mdDir,
        assetDir: assetDir,
        assetPrefix: assetPrefix,
        exportBasicYaml: exportBasicYaml
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
    let data = { fname: '', mdDir: '', assetDir: '', assetPrefix: '', frontmatter: {}, exportBasicYaml: false };
    let cache = {}
    //兼容此前的版本
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
            let doc: Block = await getBlockByID(docId) as Block;

            let bindMdConfig = await getCustomAttr(doc);
            bindMdConfig.fname = bindMdConfig.fname || doc.content;

            bindMdConfig['yaml'] = frontmatter2yaml(bindMdConfig.frontmatter) ?? '';

            const [conf, setConf] = createStore<IBindMdConfig>(bindMdConfig);

            const dialog = solidDialog({
                'title': i18n.menuLabel,
                loader: () => SyncMdConfig({
                    configStore: conf,
                    setConfigStore: setConf,
                    import: () => {
                        if (conf.fname && conf.mdDir && conf.assetDir) {

                            doImport(doc, conf, (frontmatter: Record<string, any>) => {
                                updateCustomAttr(doc, conf.fname, conf.mdDir, conf.assetDir, conf.assetPrefix, frontmatter);
                            });
                        } else {
                            showMessage(i18n.notSet, 4000, 'error');
                            console.log(`Import failed: ${i18n.notSet}`);
                            console.log(conf.fname, conf.mdDir, conf.assetDir);
                        }
                        dialog.close();
                    },
                    export: () => {
                        if (conf.fname && conf.mdDir && conf.assetDir) {

                            const frontmatter = yaml2frontmatter(conf.yaml);
                            conf.frontmatter = frontmatter;

                            doExport(doc, conf);
                            updateCustomAttr(doc, conf.fname, conf.mdDir, conf.assetDir, conf.assetPrefix, frontmatter, conf.exportBasicYaml);
                        } else {
                            showMessage(i18n.notSet, 4000, 'error');
                            console.log(`Export failed: ${i18n.notSet}`);
                            console.log(conf.fname, conf.mdDir, conf.assetDir);
                        }
                        dialog.close();
                    },
                    cancel: () => {
                        dialog.close();
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