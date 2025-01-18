/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-02 16:20:15
 * @FilePath     : /src/sync-markdown/template-store.ts
 * @LastEditTime : 2025-01-18 22:37:22
 * @Description  : 
 */
import { thisPlugin } from "@frostime/siyuan-plugin-kits";
import { createStore } from "solid-js/store";

export interface ConfigTemplate extends Omit<IBindMdConfig, 'fname'> {
    name: string;
}

const STORAGE_KEY = `config-templates@${window.siyuan.config.system.id}.json`;

const [templates, setTemplates] = createStore<ConfigTemplate[]>([]);

export const initTemplates = async () => {
    const plugin = thisPlugin();
    let data = await plugin.loadData(STORAGE_KEY);
    if (data) {
        setTemplates(data);
    }
};

export const saveTemplates = async () => {
    const plugin = thisPlugin();
    await plugin.saveData(STORAGE_KEY, JSON.stringify(templates));
};

export const hasTemplate = (name: string) => templates.some(t => t.name === name);

export const addTemplate = async (template: ConfigTemplate) => {
    setTemplates([...templates, template]);
    await saveTemplates();
};

export const deleteTemplate = async (name: string) => {
    setTemplates(templates.filter(t => t.name !== name));
    await saveTemplates();
};

export const getTemplates = () => templates;

export { templates };
