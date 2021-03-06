(function CenitIOStartup($) {

    if (CenitIO == undefined) return setTimeout(CenitIOStartup, 10, $);

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
                    create(selItem, idx, this.getRemoteOptions(baUrl, token, selItem));
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

        getRemoteOptions: function (baUrl, token, selItem) {
            var apiService = this.selectionItems[selItem].remote.apiService,
                rField = this.selectionItems[selItem].remote.rField,
                vField = this.selectionItems[selItem].remote.vField,
                lField = this.selectionItems[selItem].remote.lField;

            return {
                ajax: {
                    url: '{0}/{1}'.format(baUrl, apiService),
                    headers: this.headers(token),
                    method: 'GET',
                    dataType: 'json',
                    crossOrigin: true,
                    delay: 250,
                    data: function (params) {
                        var filters = { page: params.page };
                        filters[lField] = { "$regex": ".*" + params.term + ".*", "$options": 'i' };
                        return filters;
                    },
                    processResults: function (data, params) {
                        params.page = params.page || 1;
                        return {
                            results: data[rField].map(function (item) {
                                return { id: item[vField], text: item[lField] }
                            }),
                            pagination: {
                                more: (params.page * 30) < data.count
                            }
                        };
                    },
                    cache: true
                },
                escapeMarkup: function (markup) {
                    return markup;
                },
                minimumInputLength: 1
            };
        },

        /**
         * Create signature boxes.
         */
        createSignatureBoxes: function (callback) {
            $('body').append(
                '<div id="signature">' +
                '<canvas/>' +
                '<div class="actions">' +
                '<button class="clear">Clear</button>' +
                '<button class="cancel">Cancel</button>' +
                '<button class="save">Save</button>' +
                '</div>' +
                '</div>'
            );

            var $signature = $('div#signature'),
                $canvas = $('div#signature canvas'),
                signaturePad = new SignaturePad($canvas[0]),
                signatureItems = this.signatureItems || [];

            $('#signature .actions .clear').on('click', function (e) {
                signaturePad.clear();
                e.preventDefault();
            });

            $('#signature .actions .cancel').on('click', function (e) {
                $signature.hide();
                e.preventDefault();
            });

            $('#signature .actions .save').on('click', function (e) {
                var $img = $('img[data-field={0}]'.format(signaturePad.currentField)),
                    $field = $('input[name={0}]'.format(signaturePad.currentField)),
                    src = signaturePad.toDataURL("image/svg+xml");

                $img.prop('src', src);
                $field.val(src);
                $signature.hide();
                e.preventDefault();
            });

            signatureItems.forEach(function (field, idx) {
                var $el = $("#{0}".format(field)),
                    $parent = $el.parent(),
                    classes = $el.prop('class'),
                    ratio = Math.max(window.devicePixelRatio || 1, 1),
                    $img, $field;

                $el.remove();
                $parent.append('<input name="{0}" id="{0}" type="hidden">'.format(field));
                $parent.append('<div class="{1} field"><img class="{1} signature" data-field="{0}"/></div>'.format(field, classes));

                $img = $("img[data-field={0}]".format(field));
                $field = $("input[name={0}]".format(field));

                $img.on('click', function (e) {
                    $signature.show();
                    $signature.height($(window).height() * 0.8);
                    $canvas[0].width = $canvas[0].offsetWidth * ratio;
                    $canvas[0].height = $canvas[0].offsetHeight * ratio;
                    $canvas[0].getContext("2d").scale(ratio, ratio);
                    signaturePad.clear();
                    signaturePad.currentField = $(this).data('field');
                    signaturePad.fromDataURL($field.val());
                });

                if (idx == signatureItems.length - 1) callback(200, null, true);
            }, this);
        },

        /**
         * Create video record boxes.
         */
        createVideoRecordBoxes: function (callback) {
            $('body').append(
                '<div id="dlg-video-record">' +
                '<video controls="true" id="lll"></video>' +
                '<div class="actions">' +
                '<button class="record">Start recording</button>' +
                '<button class="cancel">Cancel</button>' +
                '<button class="save" disabled="true">Save</button>' +
                '</div>' +
                '</div>'
            );

            var $dlgVideoRecord = $('div#dlg-video-record'),
                $video = $('div#dlg-video-record video'),
                videoItems = this.videoItems || [],
                mediaConstraints = { video: true, audio: true },
                videoOptions = this.videoOptions || {},
                recordRTC,

                successCallback = function (stream) {
                    // RecordRTC usage goes here
                    var options = {
                        recorderType: MediaStreamRecorder,
                        mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
                        audioBitsPerSecond: videoOptions.aBitrate || 40 * 1024,
                        videoBitsPerSecond: videoOptions.vBitrate || 400 * 1024,
                    };

                    if (recordRTC == undefined) {
                        recordRTC = RecordRTC(stream, options);

                        recordRTC.onStateChanged = function (state) {
                            if (state == 'recording') {
                                $('#dlg-video-record .actions .save').prop('disabled', true);
                                $('#dlg-video-record .actions .record').html('Stop recording');

                                $video[0].src = URL.createObjectURL(stream);
                                $video[0].play();
                            } else {
                                recordRTC.getDataURL(function (dataURL) {
                                    $video.prop('src', dataURL);
                                });
                                $video[0].pause();
                                $('#dlg-video-record .actions .save').prop('disabled', false);
                                $('#dlg-video-record .actions .record').html('Start recording');
                            }
                        };
                    }
                    recordRTC.startRecording();
                },

                errorCallback = function (error) {
                    console.error(error);
                    alert(error);
                };

            $('#dlg-video-record .actions .record').on('click', function (e) {
                if (recordRTC && recordRTC.state == 'recording') {
                    recordRTC.stopRecording();
                } else {
                    navigator.getUserMedia(mediaConstraints, successCallback, errorCallback);
                }

                e.preventDefault();
            });

            $('#dlg-video-record .actions .cancel').on('click', function (e) {
                recordRTC && recordRTC && (recordRTC.state == 'recording') && recordRTC.stopRecording();
                $dlgVideoRecord.hide();

                e.preventDefault();
            });

            $('#dlg-video-record .actions .save').on('click', function (e) {
                var $field = $('input[name={0}]'.format($dlgVideoRecord.currentField));

                $field.val($video.prop('src'));
                $dlgVideoRecord.hide();
                e.preventDefault();
            });

            videoItems.forEach(function (field, idx) {
                var $el = $("#{0}".format(field)),
                    $parent = $el.parent(),
                    classes = $el.prop('class'),
                    $img, $field;

                $el.remove();
                $parent.append('<input name="{0}" id="{0}" type="hidden">'.format(field));
                $parent.append('<div class="{1} field"><img class="video" data-field="{0}" src="assets/CenitIO/images/video.png"/></div>'.format(field, classes));

                $img = $("img[data-field={0}]".format(field));
                $field = $("input[name={0}]".format(field));

                $img.on('click', function (e) {
                    $dlgVideoRecord.show();

                    $('#dlg-video-record .actions .record').prop('disabled', false);
                    $('#dlg-video-record .actions .play').prop('disabled', true);
                    $('#dlg-video-record .actions .stop').prop('disabled', true);
                    $('#dlg-video-record .actions .save').prop('disabled', true);

                    $dlgVideoRecord.height($(window).height() * 0.8);
                    $dlgVideoRecord.currentField = $(this).data('field');
                    $video.prop('src', $field.val());
                });

                if (idx == videoItems.length - 1) callback(200, null, true);
            }, this);
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

    // Create signature boxes.
    CenitIO.startLoading();
    CenitIO.createSignatureBoxes(function (status, msg, finish) {
        if (msg) alert(msg);
        if (finish) CenitIO.stopLoading();
    });

    // Create signature boxes.
    CenitIO.startLoading();
    CenitIO.createVideoRecordBoxes(function (status, msg, finish) {
        if (msg) alert(msg);
        if (finish) CenitIO.stopLoading();
    });

}(jQuery));



