var CenitIO = {
    // Setting of the basic variables.
    baseApiUrl: "https://cenit.io/api/v2",          // REQUIRED: Base URL to CenitIO API.
    dtName: "combobox_test",                        // REQUIRED: Data type name.
    dtNamespace: "DataService",                     // REQUIRED: Data type namespace.
    dtNamespaceSlug: null,                          // OPTIONAL: Data type namespace slug, default value is dtNamespace in underscore case.
    token: null,                                    // OPTIONAL: Authorisation token, by default it will be prompted in the submit action.

    selectionItems: {                               // OPTIONAL: Setting of the selection items.
        XLEW_1_6_2: {
            remote: {                               // OPTIONAL: Setting of remote selection item.
                apiService: "data_service/data1",   // REQUIRED: Url to REST API service in CenitIO. It is (Namespace slug/Model slug).
                rField: "data1s",                   // REQUIRED: Attribute name that contain the records. Usually it is the resource name pluralization.
                vField: "ci",                       // REQUIRED: Record attribute use to get option value.
                lField: "name"                      // REQUIRED: Record attribute use to get option label.
            }
        },
        XLEW_1_7_3: {
            options: [                              // OPTIONAL: Static options with value different to label.
                { value: 1, label: 'A' },
                { value: 2, label: 'B' },
                { value: 3, label: 'C' }
            ]
        },
        XLEW_1_7_4: {
            options: ['yes', 'no']                  // OPTIONAL: Static options with value equal to label.
        }
    },

    signatureItems: [                               // OPTIONAL: Configuration of items that will be transformed in signature box components.
        "XLEW_1_7_5"
    ],

    videoItems: [                                   // OPTIONAL: Configuration of items that will be transformed in video record box components.
        "RevenueFourthInputNumber"
    ],

    videoOptions: {
        audioBitsPerSecond: 40960,                 // OPTIONAL: The chosen bitrate for the audio component of the media. (Default 40960)
        videoBitsPerSecond: 409600                 // OPTIONAL: The chosen bitrate for the video component of the media. (Default 409600)
    }
};
