/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-06-12 19:48:53
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2025-01-18 22:33:30
 * @Description  : 
 */
import {
    Plugin,
} from "siyuan";
import "@/index.scss";

import { registerPlugin } from "@frostime/siyuan-plugin-kits";

import { load, unload } from "./sync-markdown";

export default class BindMdfilePlugin extends Plugin {


    async onload() {
        //@ts-ignore
        registerPlugin(this);
        load(this);
    }

    onunload(): void {
        unload(this);
    }
}
