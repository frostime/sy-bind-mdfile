import { Component, For } from "solid-js";
import { templates, deleteTemplate, ConfigTemplate } from "./template-store";
import i18n from "./i18n";

export const TemplateManagerUI: Component<{
    onApply: (template: ConfigTemplate) => void;
    onClose: () => void;
}> = (props) => {
    return (
        <div style={{ padding: '24px', flex: 1 }}>
            <h2>{i18n.templateManager}</h2>
            <For each={templates} fallback={
                <div class="b3-list--empty" style="padding: 8px 0px;">{window.siyuan.languages.emptyContent}</div>}
            >
                {(template) => (
                    <div style={{
                        display: 'flex', 'justify-content': 'space-between',
                        'align-items': 'center', 'margin-bottom': '10px', gap: '10px'
                    }}>
                        <div style={{ flex: 1 }}>{template.name}</div>
                        <div>
                            <button class="b3-button b3-button--text" onClick={() => props.onApply(template)}>
                                {i18n.apply}
                            </button>
                            <button class="b3-button b3-button--text" onClick={() => deleteTemplate(template.name)}>
                                {i18n.delete}
                            </button>
                        </div>
                    </div>
                )}
            </For>
            {/* <button class="b3-button" onClick={props.onClose}>{i18n.close}</button> */}
        </div>
    );
};