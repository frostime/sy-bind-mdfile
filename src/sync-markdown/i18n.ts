const I18N = {
    zh_CN: {
        warn: '⚠️ 注意Asset目录已更改！',
        menuLabel: '同本地 Markdown 文件同步',
        notSet: '请先选择导出目录',
        docName: '文档名称',
        docNameDesc: '导出的 Markdown 文件名',
        exportDir: '导出文档目录',
        exportDirDesc: '导出的 *.md 文件会被保存到这里',
        mdExportDirPlaceholder: 'MD 文件导出目录',
        choose: '选择',
        assetDir: '资源文件目录',
        assetDirDesc: 'Markdown 文件中的资源文件（如图片等）会被保存到这里',
        assetPrefix: 'Asset路径前缀',
        assetPrefixDesc: 'Markdown 文件中的图片路径前缀, 可以是绝对路径、 相对路径或者自行填写',
        absolutePath: '绝对路径',
        relativePath: '相对路径',
        succssConfirm: '已经导出到: {0}；是否需要跳转到文件夹？',
        mdfilepath: 'Markdown 文件路径',
        assetpattern: 'MD 文件中资源链接的样式',
        import: '导入文档',
        export: '导出文档',
        filestatus: {
            not: '文件尚不存在',
            exist: '文件已存在, 上次更改时间'
        },
        doimport: {
            loadasset: '是否导入资源文件?',
            method: {
                title: '导入方案',
                new: '导入到新建子文裆',
                overwrite: '直接覆盖当前文件'
            }
        },
        yaml: '导出时将 YAML Front Matter 添加在 markdown 的开头；<b>可选项目</b>; 有无 <span>---</span> 皆可',
        templateManager: '模板管理',
        saveAsTemplate: '保存为模板',
        manageTemplates: '管理模板',
        templateName: '模板名称',
        // exportDir: '导出目录',
        apply: '应用',
        edit: '编辑',
        delete: '删除',
        save: '保存',
        close: '关闭'
    },
    en_US: {
        warn: '⚠️ Warning: Asset directory has changed!',
        menuLabel: 'Sync With Local Markdown File',
        notSet: 'Please select the export directory first',
        docName: 'Document Name',
        docNameDesc: 'Name of the exported Markdown file',
        exportDir: 'Export Document Directory',
        exportDirDesc: 'The exported *.md file will be saved to this directory',
        mdExportDirPlaceholder: 'MD File Export Directory',
        choose: 'Choose',
        assetDir: 'Asset Directory',
        assetDirDesc: 'The directory where the assets (such as images) in the Markdown file are saved',
        assetPrefix: 'Asset Path Prefix',
        assetPrefixDesc: 'The prefix for image paths in the Markdown file. It can be an absolute path, relative path, or custom.',
        absolutePath: 'Absolute Path',
        relativePath: 'Relative Path',
        succssConfirm: 'Exported to: {0}; Do you want to jump to the folder?',
        mdfilepath: 'MD File Path',
        assetpattern: 'Pattern of asset link in Markdown file',
        import: 'Import',
        export: 'Export',
        filestatus: {
            not: 'File does not exist yet',
            exist: 'File already exists, last modified time'
        },
        doimport: {
            loadasset: 'Do you want to import the asset files?',
            method: {
                title: 'Import Method',
                new: 'Import to a new sub-document',
                overwrite: 'Overwrite the current document'
            }
        },
        yaml: 'When exporting, YAML Front Matter will be added at the beginning of the markdown; <b>optional</b>; either <span>---</span> written or not is ok',
        templateManager: 'Template Manager',
        saveAsTemplate: 'Save as Template',
        manageTemplates: 'Manage Templates',
        templateName: 'Template Name',
        // exportDir: 'Export Directory',
        apply: 'Apply',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        close: 'Close'
    }
};


let i18n: typeof I18N.zh_CN = window.siyuan.config.lang in I18N ? I18N[window.siyuan.config.lang] : I18N.en_US;
export default i18n;