/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-02 17:50:47
 * @FilePath     : /src/types/bind-md.d.ts
 * @LastEditTime : 2024-10-02 17:50:59
 * @Description  : 
 */
interface IBindMdConfig {
    fname: string;
    mdDir: string;
    assetDir: string;
    assetPrefix: string;
    yaml?: string;
    frontmatter?: Record<string, any>;
    exportBasicYaml?: boolean;
}


