import { createStore } from "solid-js/store";
import { getPlugin } from "@/utils";

export interface ConfigTemplate {
    name: string;
    mdDir: string;
    assetDir: string;
    assetPrefix: string;
    yaml: string;
}

const STORAGE_KEY = `config-templates@${window.siyuan.config.system.id}.json`;

const [templates, setTemplates] = createStore<ConfigTemplate[]>([]);

export const initTemplates = async () => {
    const plugin = getPlugin();
    let data = await plugin.loadData(STORAGE_KEY);
    if (data) {
        setTemplates(data);
    }
};

export const saveTemplates = async () => {
    const plugin = getPlugin();
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
