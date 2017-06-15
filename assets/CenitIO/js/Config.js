var CenitIO = {
    // Setting of the basic variables.
    baseApiUrl: "https://cenit.io/api/v2",      // REQUIRED: Base URL to CenitIO API.
    dtName: "combobox_test",                    // REQUIRED: Data type name.
    dtNamespace: "DataService",                 // REQUIRED: Data type namespace.
    dtNamespaceSlug: null,                      // OPTIONAL: Data type namespace slug, default value is dtNamespace in underscore case.
    token: null,                                // OPTIONAL: Authorisation token, by default it will be prompted in the submit action.

    // Setting of the selection items.
    selectionItems: {                           // OPTIONAL
        XLEW_1_6_2: {
            apiService: "data_service/data1",   // REQUIRED: Url to REST API service in CenitIO. It is (Namespace slug/Model slug).
            rField: "data1s",                   // REQUIRED: Attribute name that contain the records.
            vField: "ci",                       // REQUIRED: Record attribute use to get option value.
            lField: "name"                      // REQUIRED: Record attribute use to get option label.
        }
    }
};
