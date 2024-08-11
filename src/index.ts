/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-06-12 19:48:53
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-08-11 20:36:36
 * @Description  : 
 */
import {
    Plugin,
} from "siyuan";
import "@/index.scss";

import { load, unload } from "./sync-markdown";

export default class BindMdfilePlugin extends Plugin {


    async onload() {
        load(this);
    }

    onunload(): void {
        unload(this);
    }
}
