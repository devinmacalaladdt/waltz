/*
 * Waltz - Enterprise Architecture
 * Copyright (C) 2016, 2017, 2018, 2019 Waltz open source project
 * See README.md for more information
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific
 *
 */

import {initialiseData} from "../../common";
import template from "./change-log-table.html";

const bindings = {
    entries: "<",
    onInitialise: "<"
};



const initialState = {
};


function controller() {
    const vm = initialiseData(this, initialState);

    vm.columnDefs = [
        {
            field: "severity",
            name: "Severity",
            width: "10%",
            cellFilter: "toDisplayName:'severity'"
        },
        {
            field: "message",
            name: "Message",
            width: "70%",
            cellTemplate: "<div class=\"ui-grid-cell-contents\"><span title=\"{{COL_FIELD}}\" ng-bind=\"COL_FIELD\"></span></div>"
        },
        {
            field: "userId",
            name: "User",
            width: "10%",
            cellTemplate: "<div class=\"ui-grid-cell-contents\"><a ui-sref=\"main.profile.view ({userId: COL_FIELD})\"><span ng-bind=\"COL_FIELD\"></span></a></div>"
        },
        {
            field: "createdAt",
            name: "Timestamp",
            width: "10%",
            cellTemplate: "<div class=\"ui-grid-cell-contents\"><waltz-from-now timestamp=\"COL_FIELD\"></waltz-from-now></div>"
        }
    ];

}


const component = {
    bindings,
    template,
    controller
};


export default component;
