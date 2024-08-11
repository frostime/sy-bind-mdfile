/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-06-12 19:48:53
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-07-12 18:25:44
 * @Description  : 
 */
import {
    Plugin,
    Constants
} from "siyuan";
import "@/index.scss";

import Hello from './hello';
import SettingExample from "@/setting-example";

import type {} from "solid-styled-jsx";
import { solidDialog } from "./libs/dialog";


export default class PluginSample extends Plugin {


    async onload() {
        this.addTopBar({
            icon: 'iconEmoji',
            title: 'Test Solidjs',
            callback: () => {
                this.showHelloDialog();
            }
        })
    }

    showHelloDialog() {
        solidDialog({
            title: `SiYuan ${Constants.SIYUAN_VERSION}`,
            width: "720px",
            loader: () => Hello({app: this.app}),
        });
    }

    openSetting(): void {
        solidDialog({
            title: "SettingPannel",
            loader: () => SettingExample({}),
            width: "800px",
            height: "600px"
        });
    }
}
