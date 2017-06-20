(function ($) {

    $.extend(CenitIO, {

        /**
         * Init process to send form data to CenitIO platform.
         *
         * @param formData {Object} Form data to be seved.
         * @param callback {Function} Callback function with status and menssage response parameters.
         */
        saveFormData: function (formData, callback) {
            var vThis = this;

            formData = this.parseData(formData);

            vThis.validate(function (err) {
                if (err) return callback(500, err);

                var token = (vThis.token || vThis.getToken()).trim(),
                    dtName = vThis.dtName.trim(),
                    dtNamespace = vThis.dtNamespace.trim(),
                    dtNamespaceSlug = (vThis.dtNamespaceSlug || dtNamespace.toUnderscoreCase()).trim(),
                    baUrl = vThis.baseApiUrl.trim().replace(/\/$/, '');

                vThis.token = token;

                vThis.getDataType(baUrl, token, dtNamespace, dtName, function (err, dataType) {
                    if (err) return callback(500, err);
                    if (dataType) {
                        dataType.namespaceSlug = dtNamespaceSlug;
                        vThis.saveDataInDataType(baUrl, token, dataType, formData, callback);
                    } else {
                        vThis.createDataType(baUrl, token, dtNamespace, dtName, formData, function (err, dataType) {
                            if (err) return callback(500, err);
                            dataType.namespaceSlug = dtNamespaceSlug;
                            vThis.saveDataInDataType(baUrl, token, dataType, formData, callback);
                        });
                    }
                });
            });
        },

        /**
         * Send form data to CenitIO platform.
         *
         * @param baUrl {String} Base URL to CenitIO API.
         * @param token {String} CenitIO application authorization token.
         * @param dataType {Object} Data type record.
         * @param formData {Object} Form data to be seved.
         * @param callback {Function} Callback function with status and menssage response parameters.
         */
        saveDataInDataType: function (baUrl, token, dataType, formData, callback) {
            $.ajax({
                url: '{0}/{1}/{2}'.format(baUrl, dataType.namespaceSlug, dataType.slug),
                headers: this.headers(token),
                method: 'POST',
                dataType: 'json',
                crossOrigin: true,
                data: JSON.stringify(formData),

                success: function (resData, textStatus, jqXHR) {
                    var msg, status;

                    if (resData.summary) {
                        msg = resData.summary;
                        status = 500;
                    } else {
                        msg = 'Data was successfully saved.';
                        status = 200;
                    }

                    callback(status, msg);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback(500, "Request failed ({0}), data can't be saved.".format(errorThrown || textStatus));
                }
            });
        },

        /**
         * Search and return data type record with given name and namespace.
         *
         * @param baUrl {String} Base URL to CenitIO API.
         * @param token {String} CenitIO application authorization token.
         * @param dtNamespace {String} Data type namespace.
         * @param dtName {String} Data type name.
         * @param callback {Function} Callback function with error and data type record parameters.
         */
        getDataType: function (baUrl, token, dtNamespace, dtName, callback) {
            $.ajax({
                url: '{0}/setup/json_data_type'.format(baUrl),
                headers: this.headers(token),
                method: 'GET',
                dataType: 'json',
                crossOrigin: true,
                data: { limit: 1, namespace: dtNamespace, name: dtName },

                success: function (resData, textStatus, jqXHR) {
                    if (resData.summary) return callback(resData.summary);
                    callback(null, resData.json_data_types[0]);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback("Request failed ({0}), data type record can't be obtained.".format(errorThrown || textStatus));
                }
            });
        },

        getRecords: function (baUrl, token, apiService, callback) {
            $.ajax({
                url: '{0}/{1}'.format(baUrl, apiService),
                headers: this.headers(token),
                method: 'GET',
                dataType: 'json',
                crossOrigin: true,

                success: function (resData, textStatus, jqXHR) {
                    if (resData.summary) return callback(resData.summary);
                    callback(null, resData);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback("Request failed ({0}), can't be accessed to ({1}) service.".format(
                        errorThrown || textStatus, apiService
                    ));
                }
            });
        },

        /**
         * Create and return data type record with given name and namespace.
         *
         * @param baUrl {String} Base URL to CenitIO API.
         * @param token {String} CenitIO application authorization token.
         * @param dtNamespace {String} Data type namespace.
         * @param dtName {String} Data type name.
         * @param formData {Object} Form data to be seved.
         * @param callback {Function} Callback function with error and data type record parameters.
         */
        createDataType: function (baUrl, token, dtNamespace, dtName, formData, callback) {
            var schema = this.parseJsonSchema(formData);

            $.ajax({
                url: '{0}/setup/json_data_type'.format(baUrl),
                headers: this.headers(token),
                method: 'POST',
                dataType: 'json',
                crossOrigin: true,
                data: JSON.stringify({
                    namespace: dtNamespace,
                    name: dtName,
                    schema: schema
                }),

                success: function (resData, textStatus, jqXHR) {
                    if (resData.summary) return callback(resData.summary);
                    callback(null, resData.success.json_data_type);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback("Request failed ({0}), data type record can't be created.".format(errorThrown || textStatus));
                }
            });
        },

        /**
         * Parse json schema from formData.
         *
         * @param formData {Object} Form data to be seved.
         * @returns {{type: string, properties: { field1: { type: "string" ... } } } }
         */
        parseJsonSchema: function (formData) {
            var schema = { type: 'object', properties: {} };

            Object.keys(formData).forEach(function (key) {
                schema.properties[key] = { type: this.parseType(formData[key]) };
            }, this);

            return schema;
        },

        /**
         * Parse data fields from formData.
         *
         * @param formData {Object} Form data to be seved.
         * @returns {Object}
         */
        parseData: function (formData) {
            var item = {};

            Object.keys(formData).forEach(function (key) {
                if (!key.match(/^xl_/)) item[key] = this.parseValue(formData[key]);
            }, this);

            return item;
        },

        /**
         * Parse type from given value.
         *
         * @param value {*}
         * @returns {string}
         */
        parseType: function (value) {
            // TODO: Parse field value type.
            return 'string';
        },

        /**
         * Parse value in real type from given string value.
         *
         * @param value {string}
         * @returns {*}
         */
        parseValue: function (value) {
            // TODO: Parse field value.
            return value;
        },

        /**
         * Validate CenitIO connection setting.
         *
         * @param callback {Function} Callback function with error parameter.
         */
        validate: function (callback) {
            var errMsg = 'CenitIO.{0} is a required string, please set it to the CenitIO.js file.',
                isValid = function (v) {
                    return typeof v == 'string' && v.trim() != ''
                };

            if (!isValid(this.baseApiUrl)) return callback(errMsg.format('baseApiUrl'));
            if (!isValid(this.dtName)) return callback(errMsg.format('dtName'));
            if (!isValid(this.dtNamespace)) return callback(errMsg.format('dtNamespace'));

            callback();
        },

        /**
         * Returns headers to be sent in CenitIO request.
         *
         * @param token {String} CenitIO application authorization token.
         * @returns {{Content-Type: string, X-Tenant-Access-Key: *, X-Tenant-Access-Token: *}}
         */
        headers: function (token) {
            return {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {0}'.format(token)
            };
        },

        /**
         * Render view.
         *
         * @param status {Integer} Http response status.
         * @param msg {String} Response message
         * @returns {String} Response html
         */
        renderView: function (status, msg) {
            // TODO: Customise view.
            var tmpl = '' +
                '<div style="border: 1px solid gray; background-color: {0}; padding: 1.5em; text-align: center;">{1}</div>' +
                '<script type="text/javascript">setTimeout(function () { window.location = "/" }, 5000)</script>';

            return tmpl.format(status == 500 ? 'red' : '#c9e2b3', msg.toString());
        },

        /**
         * Prompt authorization token.
         */
        getToken: function () {
            return prompt('Authorization token:') || '';
        },

        startLoading: function () {
            var $el = $('#loading');

            if ($el.length == 0) {
                $('body').append('<div id="loading" class="modal"><img src="assets/CenitIO/images/loading.gif"/></div>');
                $el = $('#loading');
            }

            $el.modal('show');
        },

        stopLoading: function () {
            $('#loading').modal('hide');
        },

        /**
         * Create selection boxes.
         */
        createSelectionBoxes: function (callback) {
            var token = (this.token || this.getToken()).trim(),
                baUrl = this.baseApiUrl.trim().replace(/\/$/, ''),
                selectionItems = Object.keys(this.selectionItems || {}),

                create = function (selItem, idx, select2options) {
                    var $el = $("#{0}".format(selItem)),
                        $parent = $el.parent(),
                        classes = $el.prop('class');

                    $el.remove();
                    $parent.append('<select name="{0}" id="{0}" class="{1}"></select>'.format(selItem, classes));

                    $("select#{0}".format(selItem)).select2(select2options);

                    if (idx == selectionItems.length - 1) callback(200, null, true);
                };

            selectionItems.forEach(function (selItem, idx) {
                if (this.selectionItems[selItem].remote) {
                    this.getRemoteOptions(baUrl, token, selItem, function (err, options) {
                        if (err) return callback(500, err, idx == selectionItems.length - 1);
                        create(selItem, idx, { data: options });
                    });
                } else {
                    this.getStaticOptions(selItem, function (options) {
                        create(selItem, idx, { data: options });
                    });
                }
            }, this);
        },

        getStaticOptions: function (selItem, callback) {
            var options = (this.selectionItems[selItem].options || ['not-options']).map(function (o) {
                if ($.isString(o) || $.isNumeric(o)) return { id: o, text: o };
                if ($.isBoolean(o)) return { id: o, text: o ? 'true' : 'false' };
                if ($.isPlainObject(o)) return {
                    id: o.value == undefined ? o.id : o.value,
                    text: o.label == undefined ? o.text : o.label
                }
            });

            callback(options);
        },

        getRemoteOptions: function (baUrl, token, selItem, callback) {
            var apiService = this.selectionItems[selItem].remote.apiService,
                rField = this.selectionItems[selItem].remote.rField,
                vField = this.selectionItems[selItem].remote.vField,
                lField = this.selectionItems[selItem].remote.lField;

            this.getRecords(baUrl, token, apiService, function (err, data) {
                if (err) return callback(err);

                var records = data[rField] || [],
                    options = records.map(function (record) {
                        return {
                            id: record[vField],
                            text: record[lField]
                        }
                    });

                callback(null, options);
            });
        }

    });

    $.isString = function (v) {
        return 'string' == typeof v
    };

    $.isBoolean = function (v) {
        return 'boolean' == typeof v
    };

    // Extending String class with format method.
    String.prototype.format = function () {
        var args = arguments;

        return this.replace(/\{\d+\}/g, function (item) {
            var index = parseInt(item.substring(1, item.length - 1));
            return args[index];
        });
    };

    // Extending String class with toUnderscoreCase method.
    String.prototype.toUnderscoreCase = function () {
        return this.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
                return "_" + y.toLowerCase()
            }
        ).replace(/^_/, "");
    };

    // Connect submit action with CenitIO.saveFormData.
    $('form#formc').off('submit').on('submit', function (e) {
        var formData = $(this).serializeObject();

        CenitIO.startLoading();
        CenitIO.saveFormData(formData, function (status, msg) {
            CenitIO.stopLoading();
            alert(msg);
        });

        e.preventDefault();
    });

    // Create selection boxes.
    CenitIO.startLoading();
    CenitIO.createSelectionBoxes(function (status, msg, finish) {
        if (msg) alert(msg);
        if (finish) CenitIO.stopLoading();

    });

}(jQuery));



