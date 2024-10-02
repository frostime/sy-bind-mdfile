import { Component, createMemo, createSignal, JSXElement, Show } from "solid-js";

import { FormInput as InputItem, FormWrap as ItemWrap } from '@/libs/components/Form';
import { formatDateTime } from "@/utils";

import i18n from "./i18n";
import { TemplateManagerUI } from "./template-manager";
import { ConfigTemplate, deleteTemplate, getTemplates, hasTemplate } from "./template-store";
import { solidDialog } from "@/libs/dialog";

import { addTemplate } from "./template-store";
import { confirm, showMessage } from "siyuan";

const nodeFs = window.require('fs');
const nodePath = window.require('path');

const chooseDirectory = async (setter: (value: string) => void) => {

    const remote = require('@electron/remote');

    const webApproach = () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        //@ts-ignore
        input.directory = true;
        input.style.display = 'none';
        input.onchange = (event: InputEvent) => {
            //@ts-ignore
            const files = event.target.files;
            if (files.length > 0) {
                const path: string = files[0].path;
                const directoryPath = path.replace(/\\/g, '/');
                let dir = directoryPath.split('/');
                dir.pop();
                let dirPath = dir.join('/');
                setter(dirPath);
            }
        };
        input.click();
    }
    const nodeApproach = () => {
        const { dialog } = remote;
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
                setter(result.filePaths[0]);
            }
        }).catch(err => {
            console.error("Failed to choose directory:", err);
        });
    }

    if (!remote) {
        webApproach();
    } else {
        nodeApproach();
    }
}

function useMDConfig(props: Parameters<typeof SyncMdConfig>[0]) {
    let [fname, setFname] = createSignal(props.fname);
    let [mdDir, setMdDir] = createSignal(props.mdDir);
    let [assetDir, setAssetDir] = createSignal(props.assetDir);
    let [assetPrefix, setAssetPrefix] = createSignal(props.assetPrefix);
    let [yaml, setYaml] = createSignal(props.yaml);
    const [warning, setWarning] = createSignal(false);

    const assetPattern = createMemo(() => {
        let prefix = assetPrefix();
        if (prefix === '') return `${i18n.assetpattern}: ![xxx](xxx.png)`;
        else return `${i18n.assetpattern}: ![](${prefix}/xxx.png)`;
    });


    const updateFname = (fname: string) => {
        setFname(fname);
        props.updateFname(fname);
    };

    const updateMdDir = (dir: string) => {
        setMdDir(dir);
        props.updateMdDir(dir);
        if (assetDir() === '') {
            updateAssetDir(`${dir}/assets`);
        }
    }

    const updateAssetDir = (dir: string) => {
        setAssetDir(dir);
        props.updateAsset(dir);
        setWarning(true);
    }


    const updateAssetPrefix = (prefix: string) => {
        setAssetPrefix(prefix)
        props.updateAssetPrefix(prefix);
        setWarning(false);
        console.debug(`Asset prefix: ${prefix}`);
    }

    return {
        fname,
        mdDir,
        assetDir,
        assetPrefix,
        warning,
        yaml,
        updateFname,
        updateMdDir,
        updateAssetDir,
        updateAssetPrefix,
        assetPattern,
        setYaml
    };
}

const checkFile = (fpath: string): { exist: boolean, updatedTime?: any } => {
    let exist = nodeFs.existsSync(fpath);
    if (exist) {
        let stat = nodeFs.statSync(fpath);
        return { exist: true, updatedTime: formatDateTime('yyyy-MM-dd HH:mm:ss', stat.mtime) };
    } else {
        return { exist: false };
    }
}

/**
 * 将配置保存为模板，方便复用
 * @param config 
 * @returns 
 */
const useConfigTemplate = (config: ReturnType<typeof useMDConfig>) => {

    const handleSaveTemplate = async () => {
        const template: ConfigTemplate = {
            name: `${config.mdDir()}/${config.fname()}`,
            mdDir: config.mdDir(),
            assetDir: config.assetDir(),
            assetPrefix: config.assetPrefix(),
            yaml: config.yaml()
        };
        if (hasTemplate(template.name)) {
            confirm('Warn', 'Template exists, overwrite?', () => {
                deleteTemplate(template.name);
                addTemplate(template);
                showMessage('Template overwritten');
            });
        } else {
            addTemplate(template);
            showMessage('Template saved');
        }
    };

    const handleApplyTemplate = (template: ConfigTemplate) => {
        config.updateMdDir(template.mdDir ?? '');
        config.updateAssetDir(template.assetDir ?? '');
        config.updateAssetPrefix(template.assetPrefix ?? '');
        config.setYaml(template.yaml ?? '');
    };

    const save = () => {
        handleSaveTemplate();
    }

    const show = () => {
        const dialog = solidDialog({
            title: i18n.templateManager,
            loader: () => TemplateManagerUI({
                onApply: (template) => {
                    handleApplyTemplate(template);
                    dialog.destroy();
                },
                onClose: () => {
                    dialog.destroy();
                }
            }),
            width: '750px',
        });
    }

    const TemplateManagerArea = () => {
        return (
            <div style={{
                display: "flex", gap: '5px', padding: '8px 24px',
                'border-bottom': '2px solid var(--b3-theme-primary)'
            }}>
                <div style={{ flex: 1, "font-weight": "bold" }}>
                    {i18n.templateManager}
                    <span class="counter">{getTemplates().length}</span>
                </div>
                <button class="b3-button" onClick={save}>
                    {i18n.saveAsTemplate}
                </button>
                <button class="b3-button" onClick={show}>
                    {i18n.manageTemplates}
                </button>
            </div>
        );
    };

    return {
        TemplateManagerArea
    }
}

const SyncMdConfig: Component<{
    fname: string,
    mdDir: string,
    assetDir: string,
    assetPrefix: string,
    yaml: string,
    exportBasicYaml: boolean,
    updateFname: (v: string) => void,
    updateMdDir: (v: string) => void,
    updateAsset: (v: string) => void,
    updateAssetPrefix: (v: string) => void,
    updateYaml: (v: string) => void,
    updateExportBasicYaml: (v: boolean) => void,
    import: () => void,
    export: () => void,
    cancel: () => void
}> = (props) => {

    const mdConfig = useMDConfig(props);
    const {
        fname,
        mdDir,
        assetDir,
        assetPrefix,
        warning,
        updateFname,
        updateMdDir,
        updateAssetDir,
        updateAssetPrefix,
        assetPattern
    } = mdConfig;

    const { TemplateManagerArea } = useConfigTemplate(mdConfig);


    const exportMdFileStatus = createMemo(() => {
        let file = fname();
        let dir = mdDir();
        if (dir === '' || file === '') return {
            exist: false,
            text: ''
        };
        let path = `${dir}/${file}.md`;
        let status = checkFile(path);
        if (status.exist === false) {
            return {
                path,
                exist: false,
                text: `<span style="font-weight: bold;">${i18n.filestatus.not}</span>`
            };
        } else {
            return {
                path,
                exist: true,
                text: `<span style="font-weight: bold; color: var(--b3-theme-primary)">${i18n.filestatus.exist}: ${status.updatedTime}</span>`
            };
        }
    });

    const WarningArea = (p: { children: JSXElement }) => (
        <div style="position: relative;">
            <span style={{
                ...{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: 'var(--b3-card-warning-color)',
                    'background-color': 'var(--b3-card-warning-background)',
                    border: '3px solid var(--b3-theme-warning)',
                    "border-radius": '5px',
                    padding: '3px'
                },
                ...(warning() ? {
                    display: "block",
                } : {
                    display: "none",
                }
                )
            }}>{i18n.warn}</span>
            {p.children}
        </div>
    );

    const LocalMDFileStatus = () => {
        return (
            <div class="b3-label__text" style={{
                padding: '8px 24px', 'border-bottom': '2px solid var(--b3-theme-primary)',
                display: 'flex', gap: '5px',
                'align-items': 'center'
            }}>
                <div class="fn__flex-1" style={{ "line-height": '1.5rem' }}>
                    <div>{i18n.mdfilepath}: <u>{exportMdFileStatus().path}</u></div>
                    <div innerHTML={exportMdFileStatus().text}></div>
                </div>
                <div class="fn__flex fn__flex-column" style="gap: 5px;">
                    <Show when={exportMdFileStatus().exist}>
                        <button class="b3-button fn__block" onClick={props.import}>
                            {i18n.import}
                        </button>
                    </Show>
                    <button class="b3-button fn__block" onClick={props.export}>
                        {i18n.export}
                    </button>
                </div>
            </div>
        );
    };

    const Body = () => (
        <div style={{ flex: 1, display: "flex", "flex-direction": "column", padding: '16px 4px;' }}>
            <LocalMDFileStatus />

            <TemplateManagerArea />

            <ItemWrap
                title={i18n.docName}
                description={i18n.docNameDesc}
                direction="column"
            >
                <InputItem
                    type="textinput"
                    key="fname"
                    value={props.fname}
                    placeholder={i18n.docName}
                    changed={(v) => {
                        updateFname(v);
                    }}
                />
            </ItemWrap>

            <ItemWrap
                title={i18n.exportDir}
                description={i18n.exportDirDesc}
                direction="row"
            >
                <div style={{ display: "flex", gap: '5px' }}>
                    <InputItem
                        type="textinput"
                        key="md-dir"
                        value={mdDir()}
                        placeholder={i18n.mdExportDirPlaceholder}
                        style={{ flex: '1' }}
                        changed={(v) => {
                            updateMdDir(v);
                        }}
                    />
                    <button
                        class="b3-button"
                        style="max-width: 100px"
                        onClick={() => {
                            chooseDirectory(updateMdDir);
                        }}
                    >
                        {i18n.choose}
                    </button>
                </div>
            </ItemWrap>
            <ItemWrap
                title={i18n.assetDir}
                description={i18n.assetDirDesc}
                direction="row"
            >
                <div style={{ display: "flex", gap: '5px' }}>
                    <InputItem
                        type="textinput"
                        key="asset-dir"
                        value={assetDir()}
                        placeholder={i18n.assetDir}
                        style={{ flex: '1' }}
                        changed={(v) => {
                            updateAssetDir(v);
                        }}
                    />
                    <button
                        class="b3-button"
                        style="max-width: 100px"
                        onClick={() => {
                            chooseDirectory(updateAssetDir);
                        }}
                    >
                        {i18n.choose}
                    </button>
                </div>
            </ItemWrap>
            <WarningArea>
                <ItemWrap
                    title={i18n.assetPrefix}
                    description={i18n.assetPrefixDesc}
                    direction="row"
                >
                    <div style={{ display: "flex", gap: '5px' }}>
                        <InputItem
                            type="textinput"
                            key="asset-prefix"
                            value={assetPrefix()}
                            placeholder={i18n.assetPrefix}
                            style={{ flex: '1' }}
                            changed={(v) => {
                                updateAssetPrefix(v);
                            }}
                        />
                        <button
                            class="b3-button"
                            style="max-width: 100px"
                            onClick={() => {
                                updateAssetPrefix(assetDir());
                            }}
                        >
                            {i18n.absolutePath}
                        </button>
                        <button
                            class="b3-button"
                            style="max-width: 125px"
                            onClick={() => {
                                let path = nodePath.relative(mdDir(), assetDir());
                                updateAssetPrefix(path);
                            }}
                        >
                            {i18n.relativePath}
                        </button>
                    </div>
                    <div>{assetPattern()}</div>
                </ItemWrap>
            </WarningArea>

            <ItemWrap
                title="YAML Front Matter "
                description={i18n.yaml}
                direction="row"
                action={(
                    <div style={{ display: "flex", gap: '5px' }}>
                        <span>{i18n.exportBasicInfo}</span>
                        <input
                            type="checkbox"
                            class="b3-switch fn__flex-center"
                            checked={props.exportBasicYaml}
                            onChange={(e) => {
                                props.updateExportBasicYaml(e.target.checked);
                            }}
                        />
                    </div>
                )}
            >
                <InputItem
                    type="textarea"
                    key="yaml"
                    value={mdConfig.yaml()}
                    placeholder=""
                    changed={(v) => {
                        mdConfig.setYaml(v);
                        props.updateYaml(v);
                    }}
                    style={{ height: '7rem', 'font-size': '17px', 'line-height': '22px' }}
                />
            </ItemWrap>
        </div>
    );

    return (
        <Body />
    );
};

export default SyncMdConfig;