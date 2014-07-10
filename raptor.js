(function(){;
// File start: c:\work\modules\raptor-gold\raptor-common/ajax.js
var ajax = function(args) {
    var url = args.url;
    if (args.data && args.method !== 'POST' || args.queryString) {
        url += '?' + ajax.prepare(args.data);
        args.data = undefined;
    } else if (typeof args.data !== 'undefined') {
        args.data = ajax.prepare(args.data);
    }
    ajax.send(url, args.success, args.method || 'GET', args.data, args.async, args.headers || {})
};

ajax.prepare = function(data) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return query.join('&');
};

ajax.send = function(url, callback, method, data, async, headers) {
    var x = new XMLHttpRequest();
    x.open(method, url, async);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText, x)
        }
    };
    x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    for (var header in headers) {
        x.setRequestHeader(header, headers[header]);
    }
    x.send(data)
};

ajax.get = function(url, data, successCallback, async, headers, method) {
    ajax({
        url: url,
        data: data,
        success: successCallback,
        async: async,
        headers: headers,
        method: method || 'GET'
    });
};

ajax.post = function(url, data, successCallback, async, headers, method) {
    ajax({
        url: url,
        data: data,
        success: successCallback,
        async: async,
        headers: headers,
        method: method || 'POST'
    });
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/ajax.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/debug.js
// <debug/>


// <strict/>
;
// File end: c:\work\modules\raptor-gold\raptor-common/debug.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/event.js
function eventMouseEnter(node, callback) {
    node.addEventListener('mouseover', function(event) {
        if (!event.relatedTarget || (event.relatedTarget !== this && !(this.compareDocumentPosition(event.relatedTarget) & Node.DOCUMENT_POSITION_CONTAINED_BY))) {
            callback.call(node, event);
        }
    });
};

function eventMouseLeave(node, callback) {
    node.addEventListener('mouseout', function(event) {
        if (!event.relatedTarget || (event.relatedTarget !== this && !(this.compareDocumentPosition(event.relatedTarget) & Node.DOCUMENT_POSITION_CONTAINED_BY))) {
            callback.call(node, event);
        }
    });
};

function eventEventable(object) {
    object.prototype.events = {};
    object.prototype.bindOptions = function(options) {
        for (var name in options) {
            this.bind(name, options[name]);
        }
    };
    object.prototype.bind = function(name, callback) {
        // <strict/>
        var names = name.split(/,\s*/);
        for (var i = 0, l = names.length; i < l; i++) {
            if (!this.events[names[i]]) {
                this.events[names[i]] = [];
            }
            this.events[names[i]].push(callback);
        }
    };
    object.prototype.fire = function(name, args) {
        var result = [];

        // <debug/>

        if (this.events[name]) {
            for (var i = 0; i < this.events[name].length; i++) {
                var event = this.events[name][i],
                    currentResult = event.apply(this, args);
                if (typeof currentResult !== 'undefined') {
                    result = result.concat(currentResult);
                }
            }
        }

        return result;
    };
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/event.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/format.js
function formatBytes(bytes, decimalPlaces) {
    if (typeof decimalPlaces === 'undefined') {
        decimalPlaces = 2;
    }
    var suffix = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    for (var i = 0; bytes > 1024 && i < 8; i++) {
        bytes /= 1024;
    }
    return Math.round(bytes, decimalPlaces) + ' ' + suffix[i];
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/format.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/i18n.js
/**
 * @fileOverview Editor internationalization (i18n) private functions and properties.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 */

/**
 * @type String|null
 */
var currentLocale = null;

var localeFallback = 'en';

/**
 * @type Object
 */
var locales = {};

/**
 * @type Object
 */
var localeNames = {};

/**
 *
 * @static
 * @param {String} languageCode The language code (e.g. `en`, `fr`, `zh-CN`).
 * @param {String} nativeName The languages native name.
 * @param {Object} [strings] Locale keys mapped to phrases.
 */
function registerLocale(name, nativeName, strings) {
    // <strict/>
    // <debug/>

    locales[name] = strings;
    localeNames[name] = nativeName;
}

/**
 * Extends an existing locale, or registers it if it does not already exist.
 *
 * @static
 * @param {String} languageCode The language code (e.g. `en`, `fr`, `zh-CN`).
 * @param {String|Object} nativeName The languages native name, or an locale keys mapped to phrases.
 * @param {Object} [strings] Locale keys mapped to phrases.
 */
function extendLocale(languageCode, nativeName, strings) {
    if (typeof locales[languageCode] === 'undefined') {
        registerLocale(languageCode, nativeName, strings);
    } else {
        // <debug/>

        // Allow only passing the nativeName once.
        strings = strings || nativeName;

        for (var key in strings) {
            locales[languageCode][key] = strings[key];
        }
    }
}

/**
 * @param {String} key
 */
function setLocale(key) {
    if (currentLocale !== key) {
        // <debug/>

        currentLocale = key;
        Raptor.eachInstance(function() {
            this.localeChange();
        });
    }
}

/**
 * Return the localised string for the current locale if present, else the
 * localised string for the first available locale, failing that return the
 * string.
 *
 * @param  {string} string
 * @param  {Boolean} allowMissing If true and the localized string is missing, false is returned.
 * @return {string|false}
 */
function getLocalizedString(string, allowMissing) {
    if (typeof locales[currentLocale] !== 'undefined' &&
            typeof locales[currentLocale][string] !== 'undefined') {
        return locales[currentLocale][string];
    }

    if (typeof locales[localeFallback] !== 'undefined' &&
            typeof locales[localeFallback][string] !== 'undefined') {
        return locales[localeFallback][string];
    }

    for (var localeName in localeNames) {
        if (typeof locales[localeName][string] !== 'undefined') {
            return locales[localeName][string];
        }
    }

    if (allowMissing) {
        return false;
    }

    // <debug/>
    return string;
}

/**
 * Internationalisation function. Translates a string with tagged variable
 * references to the current locale.
 *
 * <p>
 * Variable references should be surrounded with double curly braces {{ }}
 *      e.g. "This string has a variable: {{my.variable}} which will not be translated"
 * </p>
 *
 * @static
 * @param {String} string
 * @param {Object|false} variables If false, then no string is returned by default.
 */
function tr(string, variables) {
    if (!currentLocale) {
        var lastLocale = Raptor.persist('locale');
        if (lastLocale) {
            currentLocale = lastLocale;
        }
    } 
    if (!currentLocale) {
        currentLocale = 'en';
    }

    // Get the current locale translated string
    string = getLocalizedString(string, variables === false);
    if (string === false) {
        return false;
    }

    // Convert the variables
    if (!variables) {
        return string;
    } else {
        for (var key in variables) {
            string = string.replace('{{' + key + '}}', variables[key]);
        }
        return string;
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/i18n.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/node.js

/**
 * Generates a unique ID for a node.
 *
 * @returns {String} The unique ID.
 */
function nodeUniqueId(node) {
    if (!node || !node.id) {
        var id;
        do {
            id = 'ruid-' + Math.random().toString().replace('.', '');
        } while (document.getElementById(id))
        if (!node) {
            return id;
        }
        node.id = id;
    }
    return node.id;
}

function nodeClosestByClassName(node, className) {
    while (node.parentNode && node.parentNode.className != className) {
        node = node.parentNode;
    }
    if (node.parentNode) {
        return node.parentNode;
    }
    return null;
}

function nodeFromHtml(html, wrapper) {
    var node = document.createElement(wrapper || 'div');
    node.innerHTML = html;
    return node.children[0];
}

function nodeClassSwitch(node, classAdd, classRemove) {
    node.classList.add(classAdd);
    node.classList.remove(classRemove);
}

function nodeLastChild(node) {
    var lastChild = node.lastChild
    while (lastChild && lastChild.nodeType !== 1) {
        lastChild = lastChild.previousSibling;
    }
    return lastChild;
}

function nodeOffsetTop(node) {
    var offsetTop = 0;
    do {
        if (node.tagName === 'BODY') {
            break;
        } else {
            offsetTop += node.offsetTop;
        }
        node = node.offsetParent;
    } while(node);
    return offsetTop;
}

function nodeFreezeHeight(node) {
    if (typeof node.dataset.height === 'undefined') {
        node.dataset.height = node.style.height;
        node.style.height = document.body.clientHeight + 'px';
    }
}

function nodeUnfreezeHeight(node) {
    if (typeof node.dataset.height !== 'undefined') {
        node.style.height = node.dataset.height;
        delete node.dataset.height;
    }
}

function nodeMatches(node, selector) {
    var method =
        Element.prototype.matches ||
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector;
    return method.call(node, selector);
}

function nodeFindUnnested(node, findSelector, nestedSelector) {
    var nodes = node.querySelectorAll(findSelector),
        result = [];
    for (var i = 0; i < nodes.length; i++) {
        var closest = nodes[i];
        do {
            if (nodeMatches(closest, nestedSelector)) {
                break;
            }
        } while (closest = closest.parentNode);
        if (closest == node) {
            result.push(nodes[i]);
        }
    }
    return result;
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/node.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/persist.js
function persistSet(key, value) {
    // Local storage throws an error when using XUL
    try {
        if (localStorage) {
            var storage;
            if (localStorage.raptor) {
                storage = JSON.parse(localStorage.raptor);
            } else {
                storage = {};
            }
            storage[key] = value;
            localStorage.raptor = JSON.stringify(storage);
            return true;
        }
    } catch (e) {
    }
    return false;
};

function persistGet(key, defaultValue) {
    // Local storage throws an error when using XUL
    try {
        if (localStorage) {
            var storage;
            if (localStorage.raptor) {
                storage = JSON.parse(localStorage.raptor);
            } else {
                storage = {};
            }
            return storage[key];
        }
    } catch (e) {
    }
    return defaultValue;
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/persist.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/plugin.js
function Plugin(overrides) {
    for (var key in overrides) {
        this[key] = overrides[key];
    }
};

Plugin.prototype.init = function() {}

function pluginPluggable(object) {
    object.registerPlugin = function(plugin) {
        // <strict/>

        this.prototype.plugins[plugin.name] = plugin;
    };
    object.prototype.plugins = {};
    object.prototype.pluginInstances = {};
};

function pluginPrepare(pluggable, plugin, pluginOptions, pluginAttributes) {
    var instance = $.extend({}, plugin);

    var options = $.extend({}, pluggable.options, {
        baseClass: 'raptor-plugin-' + stringFromCamelCase(plugin.name)
    }, instance.options, pluginOptions);

    instance.pluggable = pluggable;
    instance.options = options;

    for (var key in pluginAttributes) {
        instance[key] = pluginAttributes[key];
    }

    // <strict/>
    var ui = instance.init();

    return {
        ui: ui,
        instance: instance
    };
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/state.js
var stateDirty = {};

jQuery(window).on('beforeunload', stateCheckDirty);

function stateSetDirty(owner, dirty) {
    if (dirty) {
        stateDirty[owner] = dirty;
    } else {
        delete stateDirty[owner];
    }
}

function stateCheckDirty(event) {
    var dirty = false;
    for (var key in stateDirty) {
        if (typeof stateDirty[key] === 'function') {
            if (stateDirty[key]()) {
                dirty = true;
            }
        } else if (stateDirty[key]) {
            dirty = true;
        }
    }
    if (dirty) {
        var confirmationMessage = 'There are unsaved changes on this page. Are you sure you wish to navigate away?';
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
    }
};
// File end: c:\work\modules\raptor-gold\raptor-common/state.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/string.js
function stringHash(string) {
    return string
        .split('')
        .reduce(function(a, b){
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
}

function stringUcFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function stringFromCamelCase(string, delimiter) {
    return string.replace(/([A-Z])/g, function(match) {
        return (delimiter || '-') + match.toLowerCase();
    });
}

function stringToCamelCase(string, ucFirst) {
    var result = string.toLowerCase().replace(/[^a-z0-9](.)/ig, function(match, char) {
        return char.toUpperCase();
    });
    if (ucFirst !== false) {
        result = stringUcFirst(result);
    }
    return result;
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/string.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/template.js
/**
 * @fileOverview Template helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 *
 * @type type
 */
var templateCache = { 
    "unsupported": "<div class=\"{{baseClass}}-unsupported-overlay\"></div> <div class=\"{{baseClass}}-unsupported-content\"> It has been detected that you a using a browser that is not supported by Raptor, please use one of the following browsers: <ul> <li><a href=\"http://www.google.com/chrome\">Google Chrome</a></li> <li><a href=\"http://www.firefox.com\">Mozilla Firefox</a></li> <li><a href=\"http://www.google.com/chromeframe\">Internet Explorer with Chrome Frame</a></li> </ul> <div class=\"{{baseClass}}-unsupported-input\"> <button class=\"{{baseClass}}-unsupported-close\">Close</button> <input name=\"{{baseClass}}-unsupported-show\" type=\"checkbox\" /> <label>Don't show this message again</label> </div> <div>",
    "class-menu.item": "<li><a data-value=\"{{value}}\">{{label}}</a></li>",
    "click-button-to-edit.button": "<button class=\"{{baseClass}}-button\">tr('clickButtonToEditPluginButton')</button>",
    "color-menu-basic.automatic": "<li><a data-color=\"automatic\"><div class=\"{{baseClass}}-swatch\" style=\"display: none\"></div> <span>tr('colorMenuBasicAutomatic')</span></a></li>",
    "color-menu-basic.item": "<li><a data-color=\"{{className}}\"><div class=\"{{baseClass}}-swatch\" style=\"background-color: {{color}}\"></div> <span>{{label}}</span></a></li>",
    "embed.dialog": "<div class=\"{{baseClass}}-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\"> <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\"> <li class=\"ui-state-default ui-corner-top ui-tabs-selected ui-state-active\"><a>tr('embedDialogTabCode')</a></li> <li class=\"ui-state-default ui-corner-top\"><a>tr('embedDialogTabPreview')</a></li> </ul> <div class=\"{{baseClass}}-code-tab\"> <p>tr('embedDialogTabCodeContent')</p> <textarea></textarea> </div> <div class=\"{{baseClass}}-preview-tab\" style=\"display: none\"> <p>tr('embedDialogTabPreviewContent')</p> <div class=\"{{baseClass}}-preview\"></div> </div> </div>",
    "image-resize.dialog": "<div class=\"raptor-resize-image\"> <div> <label for=\"{{baseClass}}-width\">tr('imageResizeDialogWidth')</label> <input class=\"form-text\" id=\"{{baseClass}}-width\" name=\"width\" type=\"text\" placeholder=\"tr('imageResizeDialogWidthPlaceHolder')\"/> </div> <div> <label for=\"{{baseClass}}-height\">tr('imageResizeDialogHeight')</label> <input class=\"form-text\" id=\"{{baseClass}}-height\" name=\"height\" type=\"text\" placeholder=\"tr('imageResizeDialogHeightPlaceHolder')\"/> </div> <div class=\"{{baseClass}}-lock-proportions-container\"> <span class=\"{{baseClass}}-lock-proportions\"> <span class=\"ui-button-text\">Constrain proportions</span> <span class=\"ui-icon ui-icon-locked\"></span> </span> </div> </div>",
    "insert-file.dialog": "<div> <div> <label class=\"form-label\">tr('insertFileURLLabel')</label> <input type=\"text\" name=\"location\" class=\"form-text\" placeholder=\"tr('insertFileURLPlaceHolder')\"/> </div> <div> <label class=\"form-label\">tr('insertFileNameLabel')</label> <input type=\"text\" name=\"name\" class=\"form-text\" placeholder=\"tr('insertFileNamePlaceHolder')\"/> </div> </div>",
    "link.dialog": "<div style=\"display:none\" class=\"{{baseClass}}-panel\"> <div class=\"{{baseClass}}-menu\"> <p>tr('linkCreateDialogMenuHeader')</p> <fieldset data-menu=\"\"></fieldset> </div> <div class=\"{{baseClass}}-wrap\"> <div class=\"{{baseClass}}-content\" data-content=\"\"></div> </div> </div>",
    "link.document": "<h2>tr('linkTypeDocumentHeader')</h2> <fieldset> <label for=\"{{baseClass}}-document-href\">tr('linkTypeDocumentLocationLabel')</label> <input id=\"{{baseClass}}-document-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-document-href\" type=\"text\" placeholder=\"tr('linkTypeDocumentLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeDocumentNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-document-target\"> <input id=\"{{baseClass}}-document-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeDocumentNewWindowLabel')</span> </label> </fieldset> tr('linkTypeDocumentInfo')",
    "link.email": "<h2>tr('linkTypeEmailHeader')</h2> <fieldset class=\"{{baseClass}}-email\"> <label for=\"{{baseClass}}-email\">tr('linkTypeEmailToLabel')</label> <input id=\"{{baseClass}}-email\" name=\"email\" type=\"text\" placeholder=\"tr('linkTypeEmailToPlaceHolder')\"/> </fieldset> <fieldset class=\"{{baseClass}}-email\"> <label for=\"{{baseClass}}-email-subject\">tr('linkTypeEmailSubjectLabel')</label> <input id=\"{{baseClass}}-email-subject\" name=\"subject\" type=\"text\" placeholder=\"tr('linkTypeEmailSubjectPlaceHolder')\"/> </fieldset>",
    "link.error": "<div style=\"display:none\" class=\"ui-widget {{baseClass}}-error-message {{messageClass}}\"> <div class=\"ui-state-error ui-corner-all\"> <p> <span class=\"ui-icon ui-icon-alert\"></span> {{message}} </p> </div> </div>",
    "link.external": "<h2>tr('linkTypeExternalHeader')</h2> <fieldset> <label for=\"{{baseClass}}-external-href\">tr('linkTypeExternalLocationLabel')</label> <input id=\"{{baseClass}}-external-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"tr('linkTypeExternalLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeExternalNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-external-target\"> <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeExternalNewWindowLabel')</span> </label> </fieldset> tr('linkTypeExternalInfo')",
    "link.file-url": "<h2>tr('Link to a document or other file')</h2> <fieldset> <label for=\"{{baseClass}}-external-href\">tr('Location')</label> <input id=\"{{baseClass}}-external-href\" value=\"http://\" name=\"location\" class=\"{{baseClass}}-external-href\" type=\"text\" placeholder=\"tr('Enter your URL')\" /> </fieldset> <h2>tr('New window')</h2> <fieldset> <label for=\"{{baseClass}}-external-target\"> <input id=\"{{baseClass}}-external-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('Check this box to have the file open in a new browser window')</span> </label> </fieldset> <h2>tr('Not sure what to put in the box above?')</h2> <ol> <li>tr('Ensure the file has been uploaded to your website')</li> <li>tr('Open the uploaded file in your browser')</li> <li>tr(\"Copy the file's URL from your browser's address bar and paste it into the box above\")</li> </ol>",
    "link.internal": "<h2>tr('linkTypeInternalHeader')</h2> <fieldset> <label for=\"{{baseClass}}-internal-href\">tr('linkTypeInternalLocationLabel') {{domain}}</label> <input id=\"{{baseClass}}-internal-href\" value=\"\" name=\"location\" class=\"{{baseClass}}-internal-href\" type=\"text\" placeholder=\"tr('linkTypeInternalLocationPlaceHolder')\" /> </fieldset> <h2>tr('linkTypeInternalNewWindowHeader')</h2> <fieldset> <label for=\"{{baseClass}}-internal-target\"> <input id=\"{{baseClass}}-internal-target\" name=\"blank\" type=\"checkbox\" /> <span>tr('linkTypeInternalNewWindowLabel')</span> </label> </fieldset> tr('linkTypeInternalInfo')",
    "link.label": "<label> <input type=\"radio\" name=\"link-type\" autocomplete=\"off\"/> <span>{{label}}</span> </label>",
    "paste.dialog": "<div class=\"{{baseClass}}-panel ui-dialog-content ui-widget-content\"> <div class=\"{{baseClass}}-panel-tabs ui-tabs ui-widget ui-widget-content ui-corner-all\"> <ul class=\"ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all\"> <li class=\"{{baseClass}}-tab-formatted-clean ui-state-default ui-corner-top ui-state-active ui-tabs-selected\" style=\"display: none\"><a>tr('pasteDialogFormattedCleaned')</a></li> <li class=\"{{baseClass}}-tab-plain-text ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogPlain')</a></li> <li class=\"{{baseClass}}-tab-formatted-unclean ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogFormattedUnclean')</a></li> <li class=\"{{baseClass}}-tab-source ui-state-default ui-corner-top\" style=\"display: none\"><a>tr('pasteDialogSource')</a></li> </ul> <div class=\"{{baseClass}}-tab {{baseClass}}-content-formatted-clean\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-markup\"></div> </div> <div class=\"{{baseClass}}-tab {{baseClass}}-content-plain-text\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-plain\"></div> </div> <div class=\"{{baseClass}}-tab {{baseClass}}-content-formatted-unclean\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-rich\"></div> </div> <div class=\"{{baseClass}}-tab {{baseClass}}-content-source\" style=\"display: none\"> <div contenteditable=\"true\" class=\"{{baseClass}}-area {{baseClass}}-source\"></div> </div> </div> </div>",
    "snippet-menu.item": "<li><a data-name=\"{{name}}\">{{name}}</a></li>",
    "special-characters.dialog": "<div> tr('specialCharactersHelp') <br/> <ul></ul> </div>",
    "special-characters.tab-button": "<button data-setKey=\"{{setKey}}\" data-charactersIndex=\"{{charactersIndex}}\" title=\"{{description}}\">{{htmlEntity}}</button>",
    "special-characters.tab-content": "<div id=\"{{baseClass}}-{{key}}\"></div>",
    "special-characters.tab-li": "<li><a href=\"#{{baseClass}}-{{key}}\">{{name}}</a></li>",
    "statistics.dialog": "<div> <ul> <li data-name=\"characters\"></li> <li data-name=\"words\"></li> <li data-name=\"sentences\"></li> <li data-name=\"truncation\"></li> </ul> </div>",
    "table.create-menu": "<table class=\"{{baseClass}}-menu\"> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> <tr> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> <td></td> </tr> </table>",
    "tag-menu.menu": "<li><a data-value=\"na\">tr('tagMenuTagNA')</a></li> <li><a data-value=\"p\">tr('tagMenuTagP')</a></li> <li><a data-value=\"h1\">tr('tagMenuTagH1')</a></li> <li><a data-value=\"h2\">tr('tagMenuTagH2')</a></li> <li><a data-value=\"h3\">tr('tagMenuTagH3')</a></li> <li><a data-value=\"h4\">tr('tagMenuTagH4')</a></li> <li><a data-value=\"div\">tr('tagMenuTagDiv')</a></li> <li><a data-value=\"pre\">tr('tagMenuTagPre')</a></li> <li><a data-value=\"address\">tr('tagMenuTagAddress')</a></li>",
    "unsaved-edit-warning.warning": "<div class=\"{{baseClass}} ui-corner-tl\"> <span class=\"ui-icon ui-icon-alert\"></span> <span>tr('unsavedEditWarningText')</span> </div>",
    "view-source.dialog": "<div class=\"{{baseClass}}-inner-wrapper\"> <textarea></textarea> </div>",
    "lorem-ipsum.lorem-ipsum": "<h1>Sed erat aequius Triarium aliquid de dissensione nostra iudicare.</h1> <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Si mala non sunt, iacet omnis ratio Peripateticorum. Sic enim censent, oportunitatis esse beate vivere. Cum id fugiunt, re eadem defendunt, quae Peripatetici, verba. <i>Istam voluptatem, inquit, Epicurus ignorat?</i> Ita fit cum gravior, tum etiam splendidior oratio. Expectoque quid ad id, quod quaerebam, respondeas. Maximas vero virtutes iacere omnis necesse est voluptate dominante. Duo Reges: constructio interrete. <a href='http://loripsum.net/' target='_blank'>Erat enim res aperta.</a> </p> <p>Cum id fugiunt, re eadem defendunt, quae Peripatetici, verba. Hic ambiguo ludimur. Quae quidem sapientes sequuntur duce natura tamquam videntes; Dic in quovis conventu te omnia facere, ne doleas. ALIO MODO. Qui enim existimabit posse se miserum esse beatus non erit. Haec bene dicuntur, nec ego repugno, sed inter sese ipsa pugnant. Nec lapathi suavitatem acupenseri Galloni Laelius anteponebat, sed suavitatem ipsam neglegebat; Hoc est non dividere, sed frangere. Potius ergo illa dicantur: turpe esse, viri non esse debilitari dolore, frangi, succumbere. <a href='http://loripsum.net/' target='_blank'>Quod vestri non item.</a> Quid est enim aliud esse versutum? </p> <h2>Profectus in exilium Tubulus statim nec respondere ausus;</h2> <p>Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas. Quae contraria sunt his, malane? <code>Eam tum adesse, cum dolor omnis absit;</code> Efficiens dici potest. Erat enim res aperta. <a href='http://loripsum.net/' target='_blank'>Traditur, inquit, ab Epicuro ratio neglegendi doloris.</a> Nonne videmus quanta perturbatio rerum omnium consequatur, quanta confusio? </p> <ol> <li>Ergo, si semel tristior effectus est, hilara vita amissa est?</li> <li>An vero displicuit ea, quae tributa est animi virtutibus tanta praestantia?</li> <li>Illa tamen simplicia, vestra versuta.</li> </ol> <ul> <li>Vide, quantum, inquam, fallare, Torquate.</li> <li>Ratio quidem vestra sic cogit.</li> <li>Atque hoc loco similitudines eas, quibus illi uti solent, dissimillimas proferebas.</li> <li>Istam voluptatem, inquit, Epicurus ignorat?</li> </ul> <h3>Dici enim nihil potest verius.</h3> <p>Et non ex maxima parte de tota iudicabis? Non minor, inquit, voluptas percipitur ex vilissimis rebus quam ex pretiosissimis. Omnes enim iucundum motum, quo sensus hilaretur. Varietates autem iniurasque fortunae facile veteres philosophorum praeceptis instituta vita superabat. Est enim tanti philosophi tamque nobilis audacter sua decreta defendere. Et ille ridens: Video, inquit, quid agas; At enim hic etiam dolore. Deinde disputat, quod cuiusque generis animantium statui deceat extremum. Beatus autem esse in maximarum rerum timore nemo potest. Rationis enim perfectio est virtus; Nemo igitur esse beatus potest. Hoc enim constituto in philosophia constituta sunt omnia. </p> <dl> <dt><dfn>Immo videri fortasse.</dfn></dt> <dd>Graecis hoc modicum est: Leonidas, Epaminondas, tres aliqui aut quattuor;</dd> <dt><dfn>Tubulo putas dicere?</dfn></dt> <dd>Honesta oratio, Socratica, Platonis etiam.</dd> <dt><dfn>Praeteritis, inquit, gaudeo.</dfn></dt> <dd>Et quidem saepe quaerimus verbum Latinum par Graeco et quod idem valeat;</dd> <dt><dfn>Scaevolam M.</dfn></dt> <dd>Cum autem venissemus in Academiae non sine causa nobilitata spatia, solitudo erat ea, quam volueramus.</dd> </dl> <h4>In schola desinis.</h4> <p>Tuo vero id quidem, inquam, arbitratu. <b>At, si voluptas esset bonum, desideraret.</b> Duo enim genera quae erant, fecit tria. Obsecro, inquit, Torquate, haec dicit Epicurus? </p> <blockquote cite='http://loripsum.net'> Atque haec contra Aristippum, qui eam voluptatem non modo summam, sed solam etiam ducit, quam omnes unam appellamus voluptatem. </blockquote> <pre> Idem fecisset Epicurus, si sententiam hanc, quae nunc Hieronymi est, coniunxisset cum Aristippi vetere sententia. Aut haec tibi, Torquate, sunt vituperanda aut patrocinium voluptatis repudiandum. </pre>",
    "revisions.apply-dialog": "<div class=\"{{baseClass}}-apply-dialog\">tr('revisionsApplyDialogContent')</div>",
    "revisions.dialog": "<div class=\"{{baseClass}}-inner-wrapper\"></div>",
    "revisions.diff-dialog": "<div class=\"{{baseClass}}-diff\"></div>",
    "revisions.table": "<table class=\"{{baseClass}}-table\"> <thead> <tr> <th class=\"ui-widget-header\">tr('revisionsCreated')</th> <th class=\"ui-widget-header\"></th> </thead> <tbody></tbody> </table>",
    "revisions.tr": "<tr> <td class=\"{{baseClass}}-updated\"></td> <td class=\"{{baseClass}}-controls\"></td> </tr>"
 };

function templateRegister(name, content) {
    templateCache[name] = content;
}

function templateGet(name) {
    return templateCache[name];
};

/**
 *
 * @param {type} template
 * @param {type} variables
 * @returns {unresolved}
 */
function templateConvertTokens(template, variables) {
    // Translate template
    template = template.replace(/tr\(['"]{1}(.*?)['"]{1}\)/g, function(match, key) {
        key = key.replace(/\\(.?)/g, function (s, slash) {
            switch (slash) {
                case '\\': {
                    return '\\';
                }
                case '0': {
                    return '\u0000';
                }
                case '': {
                    return '';
                }
                default: {
                    return slash;
                }
            }
        });
        return tr(key);
    });

    // Replace variables
    variables = $.extend({}, this.options, variables || {});
    variables = templateGetVariables(variables);
    template = template.replace(/\{\{(.*?)\}\}/g, function(match, variable) {
        // <debug/>
        return variables[variable];
    });

    return template;
};

/**
 *
 * @param {type} variables
 * @param {type} prefix
 * @param {type} depth
 * @returns {unresolved}
 */
function templateGetVariables(variables, prefix, depth) {
    prefix = prefix ? prefix + '.' : '';
    var maxDepth = 5;
    if (!depth) depth = 1;
    var result = {};
    for (var name in variables) {
        if (typeof variables[name] === 'object' && depth < maxDepth) {
            var inner = templateGetVariables(variables[name], prefix + name, ++depth);
            for (var innerName in inner) {
                result[innerName] = inner[innerName];
            }
        } else {
            result[prefix + name] = variables[name];
        }
    }
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/template.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/toolbar.js
function toolbarLayout(pluggable, uiOrder, panelElement, pluginAttributes) {
    panelElement = $(panelElement || document.createElement('div'));
    // Loop the UI component order option
    for (var i = 0, l = uiOrder.length; i < l; i++) {
        var uiGroupContainer = $('<div/>')
            .addClass('raptor-layout-toolbar-group');

        // Loop each UI in the group
        var uiGroup = uiOrder[i];
        for (var ii = 0, ll = uiGroup.length; ii < ll; ii++) {
            // <strict/>
            var pluginOptions = pluggable.plugins[uiGroup[ii]];
            if (pluginOptions === false) {
                continue;
            }

            var component = pluginPrepare(pluggable, pluggable.plugins[uiGroup[ii]], pluginOptions, pluginAttributes);

            pluggable.pluginInstances[uiGroup[ii]] = component.instance;

            if (typeIsElement(component.ui)) {
                // Fix corner classes
                component.ui.removeClass('ui-corner-all');

                // Append the UI object to the group
                uiGroupContainer.append(component.ui);
            }
        }

        // Append the UI group to the editor toolbar
        if (uiGroupContainer.children().length > 0) {
            uiGroupContainer.appendTo(panelElement);
        }
    }

    // Fix corner classes
    panelElement.find('.ui-button:first-child').addClass('ui-corner-left');
    panelElement.find('.ui-button:last-child').addClass('ui-corner-right');
    return panelElement[0];
};
;
// File end: c:\work\modules\raptor-gold\raptor-common/toolbar.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/types.js
/**
 * @fileOverview Type checking functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * Determine whether object is a number
 * {@link http://stackoverflow.com/a/1421988/187954}.
 *
 * @param  {mixed} object The object to be tested
 * @return {Boolean} True if the object is a number.
 */
function typeIsNumber(object) {
    return !isNaN(object - 0) && object !== null;
}

/**
 * Determines whether object is a string.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a string.
 */
function typeIsString(object) {
    return typeof object === 'string';
}

/**
 * @param  {mixed} object
 * @return {boolean} True if object is an Array.
 */
function typeIsArray(object) {
    return object instanceof Array;
}

/**
 * Determines whether object is a node.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a node.
 */
function typeIsNode(object) {
    return object instanceof Node;
}

/**
 * @param  {mixed} object
 * @return {boolean} True if object is a text node.
 */
function typeIsTextNode(object) {
    if (typeIsNode(object)) {
        return object.nodeType === Node.TEXT_NODE;
    }

    if (typeIsElement(object)) {
        return typeIsNode(object[0]);
    }

    return false;
}

/**
 * Determines whether object is a jQuery element.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a jQUery element.
 */
function typeIsElement(object) {
    return object instanceof jQuery;
}

function typeIsJQueryCompatible(object) {
    return object instanceof Node || object instanceof NodeList || object instanceof HTMLCollection || object instanceof jQuery;
};
// File end: c:\work\modules\raptor-gold\raptor-common/types.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/adapters/jquery-ui.js
/**
 * @fileOverview jQuery UI helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Wrap the jQuery UI button function.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The options relating to the creation of the button.
 * @returns {Element} The modified element.
 */
function aButton(element, options) {
    // <strict/>

    return $(element).button(options);
}

/**
 * Wrap the jQuery UI button's set label function.
 *
 * @param {Element|Node|selector} element
 * @param {String} text The text for the label.
 * @returns {Element} The labelled button.
 */
function aButtonSetLabel(element, text) {
    // <strict/>

    $(element).button('option', 'text', true);
    return $(element).button('option', 'label', text);
}

/**
 * Wrap the jQuery UI button's set icon function.
 *
 * @param {Element|Node|selector} element
 * @param {String} icon The icon name to be added to the button, e.g. 'ui-icon-disk'
 * @returns {Element} The modified button.
 */
function aButtonSetIcon(element, icon) {
    // <strict/>

    return $(element).button('option', 'icons', {
        primary: icon
    });
}

/**
 * Wrap the jQuery UI button's enable function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The enabled button.
 */
function aButtonEnable(element) {
    // <strict/>

    return $(element).button('option', 'disabled', false);
}

function aButtonIsEnabled(element) {
    return !$(element).is('.ui-state-disabled');
}

/**
 * Wrap the jQuery UI button's disable function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The disabled button.
 */
function aButtonDisable(element) {
    // <strict/>

    return $(element).button('option', 'disabled', true);
}

/**
 * Wrap the jQuery UI button's add class function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The highlighted button.
 */
function aButtonActive(element) {
    // <strict/>

    return $(element).addClass('ui-state-highlight');
}

/**
 * Wrap the jQuery UI button's remove class function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element} The button back in its normal state.
 */
function aButtonInactive(element) {
    // <strict/>

    return $(element).removeClass('ui-state-highlight');
}

/**
 * Wrap the jQuery UI button's initialise menu function.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The set of options for menu creation.
 * @returns {Element} The menu.
 */
function aMenu(element, options) {
    // <strict/>

    return $(element).menu(options);
}

/**
 * Initialises a dialog with the given element.
 *
 * @param {Element|Node|selector} element
 * @param {Object|null} options The set of options for the menu.
 * @returns {Element} A dialog.
 */
function aDialog(element, options) {
    // <strict/>

    options.dialogClass = typeof options.dialogClass !== 'undefined' ? options.dialogClass + ' ui-dialog-fixed' : 'ui-dialog-fixed';
    var dialog = $(element).dialog(options);
    dialog.parent().css({
        top: (parseInt(dialog.parent().css('top')) || 0) - $(window).scrollTop()
    });
    dialog.dialog("option", "position", 'center');
    return dialog;
}

/**
 * Wrap the jQuery UI open dialog function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element}
 */
function aDialogOpen(element) {
    // <strict/>

    return $(element).dialog('open');
}

/**
 * Wrap the jQuery UI close dialog function.
 *
 * @param {Element|Node|selector} element
 * @returns {Element}
 */
function aDialogClose(element) {
    // <strict/>

    return $(element).dialog('close');
}

function aDialogRemove(element) {
    // <strict/>

    return $(element).dialog('destroy').remove();
}

/**
 * Wrap the jQuery UI tabs function.
 *
 * @param  {Element|Node|selector} element
 * @param  {Object|null} options
 * @returns {Element}
 */
function aTabs(element, options) {
    // <strict/>

    return $(element).tabs(options);
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/adapters/jquery-ui.js
;
// File start: c:\work\modules\raptor-gold\raptor-common/adapters/pnotify.js
function aNotify(options) {
    if (options.type == 'success') {
        options.state = 'confirmation'
    }
    $.pnotify($.extend({
        type: 'success',
        styling: 'jqueryui',
        history: false
    }, options));
}
;
// File end: c:\work\modules\raptor-gold\raptor-common/adapters/pnotify.js
;
// File start: c:\work\modules\raptor-gold\raptor-locales/en.js
/**
 * @fileOverview English strings file.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 */
extendLocale('en', 'English', {
    alignCenterTitle: 'Align text center',
    alignJustifyTitle: 'Align text justify',
    alignLeftTitle: 'Align text left',
    alignRightTitle: 'Align text right',

    cancelDialogCancelButton: 'Continue Editing',
    cancelDialogContent: 'Are you sure you want to cancel editing? All changes will be lost!',
    cancelDialogOKButton: 'Cancel Editing',
    cancelDialogTitle: 'Cancel Editing',
    cancelTitle: 'Cancel editing',

    classMenuTitle: 'Style picker',
    cleanBlockTitle: 'Clean block',
    clearFormattingTitle: 'Clear formatting',
    clickButtonToEditText: 'Edit',
    clickButtonToEditTitle: null,

    closeTitle: 'Close this toolbar',

    colorMenuBasicAutomatic: 'Automatic',
    colorMenuBasicBlack: 'Black',
    colorMenuBasicBlue: 'Blue',
    colorMenuBasicGreen: 'Green',
    colorMenuBasicGrey: 'Grey',
    colorMenuBasicOrange: 'Orange',
    colorMenuBasicPurple: 'Purple',
    colorMenuBasicRed: 'Red',
    colorMenuBasicTitle: 'Change text color',
    colorMenuBasicWhite: 'White',

    dockToElementTitle: 'Dock/undock editor to element',
    dockToScreenTitle: 'Dock/undock editor to screen',

    embedTitle: 'Embed object',
    embedDialogTitle: 'Embed Object',
    embedDialogTabCode: 'Embed Code',
    embedDialogTabCodeContent: 'Paste your embed code into the text area below:',
    embedDialogTabPreview: 'Preview',
    embedDialogTabPreviewContent: 'A preview of your embedded object is displayed below:',
    embedDialogOKButton: 'Embed Object',
    embedDialogCancelButton: 'Cancel',

    errorUINoName: 'UI "{{ui}}" is invalid (must have a name property)',
    errorUINotObject: 'UI "{{ui}}" is invalid (must be an object)',
    errorUIOverride: 'UI "{{name}}" has already been registered, and will be overwritten',

    editPageDialogTitle: 'Edit Page',
    editPageDialogOKButton: 'Save',
    editPageDialogCancelButton: 'Cancel',

    floatLeftTitle: 'Align image to the left',
    floatNoneTitle: 'Remove image align',
    floatRightTitle: 'Align image to the right',

    fontFamilyMenuTitle: 'Choose your font',
    fontFamilyMenuFontDefault: 'Default Font',
    fontFamilyMenuFontArial: 'Arial',
    fontFamilyMenuFontPalatino: 'Palatino',
    fontFamilyMenuFontGeorgia: 'Georgia',
    fontFamilyMenuFontTimes: 'Times New Roman',
    fontFamilyMenuFontComicSans: 'Comic Sans',
    fontFamilyMenuFontImpact: 'Impact',
    fontFamilyMenuFontCourier: 'Courier New',

    guidesTitle: 'Show element guides',

    historyRedoTitle: 'Redo',
    historyUndoTitle: 'Undo',

    hrCreateTitle: 'Insert Horizontal Rule',

    imageResizeDialogWidth: 'Image width',
    imageResizeDialogHeight: 'Image height',
    imageResizeDialogWidthPlaceHolder: 'Width',
    imageResizeDialogHeightPlaceHolder: 'Height',
    imageResizeDialogTitle: 'Resize Image',
    imageResizeDialogOKButton: 'Resize',
    imageResizeDialogCancelButton: 'Cancel',
    imageResizeTitle: 'Resize this image',

    insertFileTitle: 'Insert file',
    insertFileDialogTitle: 'Insert file',
    insertFileDialogOKButton: 'Insert file',
    insertFileDialogCancelButton: 'Cancel',
    insertFileURLLabel: 'File URL',
    insertFileNameLabel: 'File Name',
    insertFileURLPlaceHolder: 'File URL...',
    insertFileNamePlaceHolder: 'File Name...',

    languageMenuTitle: 'Change Language',

    loremIpsumTitle: 'Insert dummy text for testing',

    listOrderedTitle: 'Ordered list',
    listUnorderedTitle: 'Unordered list',

    linkCreateTitle: 'Insert Link',
    linkRemoveTitle: 'Remove Link',

    linkCreateDialogTitle: 'Insert Link',
    linkCreateDialogOKButton: 'Insert Link',
    linkCreateDialogCancelButton: 'Cancel',
    linkCreateDialogMenuHeader: 'Choose a link type',

    linkTypeEmailLabel: 'Email address',
    linkTypeEmailHeader: 'Link to an email address',
    linkTypeEmailToLabel: 'Email:',
    linkTypeEmailToPlaceHolder: 'Enter email address',
    linkTypeEmailSubjectLabel: 'Subject (optional):',
    linkTypeEmailSubjectPlaceHolder: 'Enter subject',

    linkTypeExternalLabel: 'Page on another website',
    linkTypeExternalHeader: 'Link to a page on another website',
    linkTypeExternalLocationLabel: 'Location:',
    linkTypeExternalLocationPlaceHolder: 'Enter a URL',
    linkTypeExternalNewWindowHeader: 'New window',
    linkTypeExternalNewWindowLabel: 'Check this box to have the link open in a new browser window/tab.',
    linkTypeExternalInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Find the page on the web you want to link to.</li>' +
        '    <li>Copy the web address from your browser\'s address bar and paste it into the box above.</li>' +
        '</ol>',

    linkTypeDocumentLabel: 'Document or other file',
    linkTypeDocumentHeader: 'Link to a document or other file',
    linkTypeDocumentLocationLabel: 'Location:',
    linkTypeDocumentLocationPlaceHolder: 'Enter a URL',
    linkTypeDocumentNewWindowHeader: 'New window',
    linkTypeDocumentNewWindowLabel: 'Check this box to have the file open in a new browser window/tab.',
    linkTypeDocumentInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Ensure the file has been uploaded to your website.</li>' +
        '    <li>Open the uploaded file in your browser.</li>' +
        '    <li>Copy the file\'s URL from your browser\'s address bar and paste it into the box above.</li>' +
        '</ol>',

    linkTypeInternalLabel: 'Page on this website',
    linkTypeInternalHeader: 'Link to a page on this website',
    linkTypeInternalLocationLabel: '',
    linkTypeInternalLocationPlaceHolder: 'Enter a URI',
    linkTypeInternalNewWindowHeader: 'New window',
    linkTypeInternalNewWindowLabel: 'Check this box to have the link open in a new browser window/tab.',
    linkTypeInternalInfo:
        '<h2>Not sure what to put in the box above?</h2>' +
        '<ol>' +
        '    <li>Find the page on this site link to.</li>' +
        '    <li>Copy the web address from your browser\'s address bar, excluding "{{domain}}" and paste it into the box above.</li>' +
        '</ol>',

    logoTitle: 'Learn More About the Raptor WYSIWYG Editor',

    navigateAway: '\nThere are unsaved changes on this page. \nIf you navigate away from this page you will lose your unsaved changes',

    pasteDialogTitle: 'Paste',
    pasteDialogOKButton: 'Insert',
    pasteDialogCancelButton: 'Cancel',
    pasteDialogPlain: 'Plain Text',
    pasteDialogFormattedCleaned: 'Formatted &amp; Cleaned',
    pasteDialogFormattedUnclean: 'Formatted Unclean',
    pasteDialogSource: 'Source Code',

    placeholderPluginDefaultContent: '<br/>',

    saveTitle: 'Save content',
    saveNotConfigured: 'Save has not been configured, or is disabled.',
    saveJsonFail: 'Failed to save {{failed}} content block(s)',
    saveJsonSaved: 'Successfully saved {{saved}} content block(s).',
    saveRestFail: 'Failed to save {{failed}} content block(s).',
    saveRestPartial: 'Saved {{saved}} out of {{failed}} content blocks.',
    saveRestSaved: 'Successfully saved {{saved}} content block(s).',

    snippetMenuTitle: 'Snippets',

    specialCharactersArrows: 'Arrows',
    specialCharactersDialogOKButton: 'OK',
    specialCharactersDialogTitle: 'Insert Special Characters',
    specialCharactersGreekAlphabet: 'Greek Alphabet',
    specialCharactersHelp: 'Click a special character to add it. Click "OK" when done to close this dialog',
    specialCharactersMathematics: 'Mathematics',
    specialCharactersSymbols: 'Symbols',
    specialCharactersTitle: 'Insert a special character',

    statisticsButtonCharacterOverLimit: '{{charactersRemaining}} characters over limit',
    statisticsButtonCharacterRemaining: '{{charactersRemaining}} characters remaining',
    statisticsButtonCharacters: '{{characters}} characters',
    statisticsDialogCharactersOverLimit: '{{characters}} characters, {{charactersRemaining}} over the recommended limit',
    statisticsDialogCharactersRemaining: '{{characters}} characters, {{charactersRemaining}} remaining',
    statisticsDialogNotTruncated: 'Content will not be truncated',
    statisticsDialogOKButton: 'Ok',
    statisticsDialogSentence: '{{sentences}} sentence',
    statisticsDialogSentences: '{{sentences}} sentences',
    statisticsDialogTitle: 'Content Statistics',
    statisticsDialogTruncated: 'Content contains more than {{limit}} characters and may be truncated',
    statisticsDialogWord: '{{words}} word',
    statisticsDialogWords: '{{words}} words',
    statisticsTitle: 'Click to view statistics',

    imageSwapTitle: 'Swap this image',

    tableCreateTitle: 'Create table',
    tableDeleteColumnTitle: 'Delete table column',
    tableDeleteRowTitle: 'Delete table row',
    tableInsertColumnTitle: 'Insert table column',
    tableInsertRowTitle: 'Insert table row',
    tableMergeCellsTitle: 'Merge table cells',
    tableSplitCellsTitle: 'Split table cells',

    tagMenuTagH1: 'Heading&nbsp;1',
    tagMenuTagH2: 'Heading&nbsp;2',
    tagMenuTagH3: 'Heading&nbsp;3',
    tagMenuTagH4: 'Heading&nbsp;4',
    tagMenuTagNA: 'N/A',
    tagMenuTagP: 'Paragraph',
    tagMenuTagDiv: 'Div',
    tagMenuTagPre: 'Pre-formatted',
    tagMenuTagAddress: 'Address',
    tagMenuTitle: 'Change element style',

    tagTreeElementLink: 'Select {{element}} element',
    tagTreeElementTitle: 'Click to select the contents of the "{{element}}" element',
    tagTreeRoot: 'root',
    tagTreeRootLink: 'Select all editable content',
    tagTreeRootTitle: 'Click to select all editable content',

    textBlockQuoteTitle: 'Block quote',
    textBoldTitle: 'Bold',
    textItalicTitle: 'Italic',
    textStrikeTitle: 'Strike through',
    textSubTitle: 'Sub-script',
    textSuperTitle: 'Super-script',
    textUnderlineTitle: 'Underline',
    textSizeDecreaseTitle: 'Decrease text size',
    textSizeIncreaseTitle: 'Increase text size',

    unsavedEditWarningText: 'There are unsaved changes on this page',

    revisionsText: 'Revisions',
    revisionsTextEmpty: 'No Revisions',
    revisionsTitle: null,
    revisionsCreated: 'Created',
    revisionsApplyButtonTitle: 'Rollback',
    revisionsApplyButtonText: 'Rollback',
    revisionsAJAXFailed: 'Failed to retrieve revisions',
    revisionsApplyButtonDialogCancelButton: 'Cancel',
    revisionsApplyButtonDialogOKButton: 'Rollback',
    revisionsApplyButtonDialogTitle: 'Rollback Confirmation',
    revisionsApplyDialogContent: 'This will replace the current content with the selected revision.<br/>The current content will be added as a revision, and will be visible in the revisions list for this block.',
    revisionsDialogCancelButton: 'Cancel',
    revisionsDialogTitle: 'View content revisions',
    revisionsButtonCurrent: 'Current',
    revisionsButtonViewDiffText: 'Differences',
    revisionsButtonViewDiffTitle: null,
    revisionsDiffButtonDialogCancelButton: 'Close',
    revisionsDiffButtonDialogTitle: 'View differences',
    revisionsDiffButtonTitle: 'View differences',
    revisionsDiffButtonText: 'View differences',
    revisionsLoading: 'Loading revisions...',
    revisionsNone: 'No revisions for this element',
    revisionsPreviewButtonTitle: 'Preview',
    revisionsPreviewButtonText: 'Preview',

    fileManagerDialogTitle: 'File Manager',
    fileManagerTitle: 'File Manager',
    rfmClose: 'Close',
    rfmContinue: 'Continue',
    rfmDeleteTitle: 'Delete',
    rfmDownloadTitle: 'Download',
    rfmEditTitle: 'Edit',
    rfmFileActions: 'Actions',
    rfmFileModificationTime: 'Modified',
    rfmFileName: 'Name',
    rfmFileSize: 'Size',
    rfmFileType: 'Type',
    rfmFilteredTotal: 'Showing {{start}} to {{end}} of {{filteredTotal}} files',
    rfmFirst: 'First',
    rfmHeadingDirectories: 'Directories',
    rfmHeadingSearch: 'Search',
    rfmHeadingTags: 'Tags',
    rfmHeadingUpload: 'Upload',
    rfmInsertTitle: 'Insert',
    rfmLast: 'Last',
    rfmRenameTitle: 'Rename',
    rfmSearch: 'Go',
    rfmTagDocument: 'Document',
    rfmTagImage: 'Image',
    rfmTotal: ', filtered from {{total}}',
    rfmUpload: 'Upload',
    rfmUploadBrowse: 'Browse',
    rfmUploadDrop: 'Drop Files Here',
    rfmUploadFileRemove: 'Remove',
    rfmUploadOr: 'or',
    rfmViewTitle: 'View',

    imageEditorDialogCancelButton: 'Cancel',
    imageEditorDialogOKButton: 'Save',
    imageEditorDialogTitle: 'Image Editor',
    imageEditorTitle: 'Edit Image',
    rieApply: 'Apply',
    rieBlurTitle: 'Blur',
    rieBrightnessTitle: 'Brightness/Contrast',
    rieCancel: 'Cancel',
    rieCancelTitle: 'Cancel',
    rieColorAdjustTitle: 'Adjust Color',
    rieCropTitle: 'Crop',
    rieDesaturateTitle: 'Desaturate',
    rieFlipHTitle: 'Flip Horizontally',
    rieFlipVTitle: 'Flip Vertically',
    rieGlowTitle: 'Glow',
    rieHslTitle: 'Hue, Saturation, Lightness.',
    rieInvertTitle: 'Invert',
    riePosterizeTitle: 'Posterize',
    rieRedoTitle: 'Redo',
    rieRemoveNoiseTitle: 'Remove Noise',
    rieResizeTitle: 'Resize',
    rieRevertTitle: 'Revert',
    rieRotateLeftTitle: 'Rotate Left',
    rieRotateRightTitle: 'Rotate Right',
    rieSaveTitle: 'Save',
    rieSaveTitle: 'Save',
    rieSepiaTitle: 'Sepia',
    rieSharpenTitle: 'Sharpen',
    rieSolarizeTitle: 'Solarize',
    rieUndoTitle: 'Undo',
    rieUploadTitle: 'Upload',

    rieActionColorAdjustRed: 'Red',
    rieActionColorAdjustGreen: 'Green',
    rieActionColorAdjustBlue: 'Blue',
    rieActionBrightnessBrightness: 'Brightness',
    rieActionBrightnessContrast: 'Contrast',
    rieActionGlowAmount: 'Glow Amount',
    rieActionGlowRadius: 'Glow Radius',
    rieActionHsl: 'Hue',
    rieActionHsl: 'Saturation',
    rieActionHsl: 'Lightness',
    rieActionPosterize: 'Levels',

    viewSourceDialogCancelButton: 'Close',
    viewSourceDialogOKButton: 'Apply source code',
    viewSourceDialogTitle: 'Content source code',
    viewSourceTitle: 'View/edit source code'
});
;
// File end: c:\work\modules\raptor-gold\raptor-locales/en.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/../TOP
/**
 * Raptor Editor HTML5 WYSIWYG Editor
 * http://www.raptor-editor.com
 *
 * Copyright 2011-2013, PAN Media Limited. All rights reserved.
 * http://www.panmedia.co.nz
 *
 * Released under the GPL license.
 * See LICENSE for more information.
 *
 * All other components and libraries redistributed in this package are subject
 * to their respective copyright notices and licenses.
 * See THIRD-PARTY COMPONENTS AND LIBRARIES for more information.
 * All images and icons redistributed in this package are subject
 * to their respective copyright notices and licenses.
 * See IMAGES AND ICONS for more information.
 */
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/../TOP
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/action.js
/**
 * @fileOverview Action helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Previews an action on an element.
 * @todo check descriptions for accuracy
 * @param {Object} previewState The saved state of the target.
 * @param {jQuery} target Element to have the preview applied to it.
 * @param {function} action The action to be previewed.
 * @returns {Object} ??
 */
function actionPreview(previewState, target, action) {
    // <strict/>

    actionPreviewRestore(previewState, target);

    previewState = stateSave(target);
    action();
    rangy.getSelection().removeAllRanges();
    return previewState;
}

/**
 * Changes an element back to its saved state and returns that element.
 * @todo check descriptions please.
 * @param {Object} previewState The previously saved state of the target.
 * @param {jQuery} target The element to have it's state restored.
 * @returns {jQuery} The restored target.
 */
function actionPreviewRestore(previewState, target) {
    if (previewState) {
        var state = stateRestore(target, previewState);
        if (state.ranges) {
            rangy.getSelection().setRanges(state.ranges);
        }
        return state.element;
    }
    return target;
}

/**
 * Applies an action.
 * @todo types for params
 * @param {type} action The action to apply.
 * @param {type} history
 */
function actionApply(action, history) {
    action();
}

/**
 * Undoes an action.
 *
 * @returns {undefined}
 */
function actionUndo() {

}

/**
 * Redoes an action.
 *
 * @returns {undefined}
 */
function actionRedo() {

}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/action.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/clean.js
/**
 * @fileOverview Cleaning helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 */

/**
 * Replaces elements in another elements. E.g.
 *
 * @example
 * cleanReplaceElements('.content', {
 *     'b': '<strong/>',
 *     'i': '<em/>',
 * });
 *
 * @param  {jQuery|Element|Selector} selector The element to be find and replace in.
 * @param  {Object} replacements A map of selectors to replacements. The replacement
 *   can be a jQuery object, an element, or a selector.
 */
function cleanReplaceElements(selector, replacements) {
    for (var find in replacements) {
        var replacement = replacements[find];
        var i = 0;
        var found = false;
        do {
            found = $(selector).find(find);
            if (found.length) {
                found = $(found.get(0));
                var clone = $(replacement).clone();
                clone.html(found.html());
                clone.attr(elementGetAttributes(found));
                found.replaceWith(clone);
            }
        } while(found.length);
    }
}

/**
 * Unwrap function. Currently just wraps jQuery.unwrap() but may be extended in future.
 *
 * @param  {jQuery|Element|Selector} selector The element to unwrap.
 */
function cleanUnwrapElements(selector) {
    $(selector).unwrap();
}

/**
 * Takes a supplied element and removes all of the empty attributes from it.
 *
 * @param {jQuery} element This is the element to remove all the empty attributes from.
 * @param {array} attributes This is an array of the elements attributes.
 */
function cleanEmptyAttributes(element, attributes) {
    // <strict/>

    for (i = 0; i < attributes.length; i++) {
        if (!$.trim(element.attr(attributes[i]))) {
            element.removeAttr(attributes[i]);
        }
        element
            .find('[' + attributes[i] + ']')
            .filter(function() {
                return $.trim($(this).attr(attributes[i])) === '';
            }).removeAttr(attributes[i]);
    }
}

/**
 * Remove comments from element.
 *
 * @param  {jQuery} parent The jQuery element to have comments removed from.
 * @return {jQuery} The modified parent.
 */
function cleanRemoveComments(parent) {
    // <strict/>

    parent.contents().each(function() {
        if (this.nodeType == Node.COMMENT_NODE) {
            $(this).remove();
        }
    });
    parent.children().each(function() {
        cleanRemoveComments($(this));
    });
    return parent;
}


/**
 * Removed empty elements whose tag name matches the list of supplied tags.
 *
 * @param  {jQuery} element The jQuery element to have empty element removed from.
 * @param  {String[]} tags The list of tags to clean.
 * @return {jQuery} The modified element.
 */
function cleanEmptyElements(element, tags) {
    // <strict/>
    var found;
    // Need to loop incase removing an empty element, leaves another one.
    do {
        found = false;
        element.find(tags.join(',')).each(function() {
            var html = $(this).html().replace('&nbsp;', ' ').trim();
            if (html === '') {
                $(this).remove();
                found = true;
            }
        });
    } while (found);
    return element;
}

/**
 * Wraps any text nodes in the node with the supplied tag. This does not scan child elements.
 *
 * @param  {Node} node
 * @param  {String} tag The tag to use from wrapping the text nodes.
 */
function cleanWrapTextNodes(node, tag) {
    // <strict/>

    var textNodes = nodeFindTextNodes(node);
    for (var i = 0, l = textNodes.length; i < l; i++) {
        var clone = textNodes[i].cloneNode(),
            wrapper = document.createElement(tag);
        wrapper.appendChild(clone);
        node.insertBefore(wrapper, textNodes[i]);
        node.removeChild(textNodes[i]);
    }
}

function cleanUnnestElement(element, selector) {
    var found;
    do {
        found = false;
        $(element).find(selector).each(function() {
            if ($(this).parent().is(selector)) {
                $(this).unwrap();
                found = true;
            }
        });
    } while (found);

}

function cleanRemoveAttributes(element, attributes) {
    // <strict/>

    for (var i = 0; i < attributes.length; i++) {
        element.find('[' + attributes[i] + ']').removeAttr(attributes[i])
    }
}

function cleanRemoveElements(element, elements) {
    element.find(elements.join(',')).contents().unwrap();
}

/**
 * Generic clean function to remove misc elements.
 *
 * @param  {jQuery} element
 */
function clean(element) {
    $(element).find('.rangySelectionBoundary').remove();
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/clean.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/dock.js
/**
 * @fileOverview Docking to screen and element helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Docks a specified element to the screen.
 *
 * @param {jQuery} element The element to dock.
 * @param {string} options Any options to further specify the docking state.
 * @returns {Object} An object containing the docked element, a spacer div and the style state.
 */
function dockToScreen(element, options) {
    var position,
        spacer = $('<div>')
            .addClass('spacer');
    if (options.position === 'top') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            left: 0,
            right: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'topLeft') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            left: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'topRight') {
        position = {
            position: 'fixed',
            top: options.under ? $(options.under).outerHeight() : 0,
            right: 0
        };
        if (options.spacer) {
            if (options.under) {
                spacer.insertAfter(options.under);
            } else {
                spacer.prependTo('body');
            }
        }
    } else if (options.position === 'bottom') {
        position = {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    } else if (options.position === 'bottomLeft') {
        position = {
            position: 'fixed',
            bottom: 0,
            left: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    } else if (options.position === 'bottomRight') {
        position = {
            position: 'fixed',
            bottom: 0,
            right: 0
        };
        if (options.spacer) {
            spacer.appendTo('body');
        }
    }
    var styleState = styleSwapState(element, position);
    spacer.css('height', element.outerHeight());
    setTimeout(function() {
        spacer.css('height', element.outerHeight());
    }, 300);
    return {
        dockedElement: element,
        spacer: spacer,
        styleState: styleState
    };
}

/**
 * Undocks a docked element from the screen.
 * @todo not sure of description for dockState
 * @param {jQuery} dockState
 * @returns {unresolved}
 */
function undockFromScreen(dockState) {
    styleRestoreState(dockState.dockedElement, dockState.styleState);
    dockState.spacer.remove();
    return dockState.dockedElement.detach();
}

/**
 * Docks an element to a another element.
 *
 * @param {jQuery} elementToDock This is the element to be docked.
 * @param {jQuery} dockTo This is the element to which the elementToDock will be docked to.
 * @param {string} options These are any options to refine the docking position.
 * @returns {Object} An object containing the docked element, what it has been docked to, and their style states.
 */
function dockToElement(elementToDock, dockTo, options) {
    var wrapper = dockTo
            .wrap('<div>')
            .parent(),
        innerStyleState = styleSwapWithWrapper(wrapper, dockTo, {
            'float': 'none',
            display: 'block',
            clear: 'none',
            position: 'static',

            /* Margin */
            margin: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,

            /* Padding */
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,

            outline: 0,
            width: 'auto',
            border: 'none'
        }),
        dockedElementStyleState = styleSwapState(elementToDock, {
            position: 'static'
        });
    wrapper
        .prepend(elementToDock)
        .addClass(options.wrapperClass ? options.wrapperClass : '');
    return {
        dockedElement: elementToDock,
        dockedTo: dockTo,
        innerStyleState: innerStyleState,
        dockedElementStyleState: dockedElementStyleState
    };
}

/**
 * Undocks an element from the screen.
 *@todo not sure of description for dockState
 * @param {jQuery} dockState
 * @returns {Object} The undocked element.
 */
function undockFromElement(dockState) {
    styleRestoreState(dockState.dockedTo, dockState.innerStyleState);
    styleRestoreState(dockState.dockedElement, dockState.dockedElementStyleState);
    var dockedElement = dockState.dockedElement.detach();
    dockState.dockedTo.unwrap();
    return dockedElement;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/dock.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/element.js
/**
 * @fileOverview Element manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Remove all but the allowed attributes from the parent.
 *
 * @param {jQuery} parent The jQuery element to cleanse of attributes.
 * @param {String[]|null} allowedAttributes An array of allowed attributes.
 * @return {jQuery} The modified parent.
 */
function elementRemoveAttributes(parent, allowedAttributes) {
    parent.children().each(function() {
        var stripAttributes = $.map(this.attributes, function(item) {
            if ($.inArray(item.name, allowedAttributes) === -1) {
                return item.name;
            }
        });
        var child = $(this);
        $.each(stripAttributes, function(i, attributeName) {
            child.removeAttr(attributeName);
        });
        element.removeAttributes($(this), allowedAttributes);
    });
    return parent;
}

/**
 * Sets the z-index CSS property on an element to 1 above all its sibling elements.
 *
 * @param {jQuery} element The jQuery element to have it's z index increased.
 */
function elementBringToTop(element) {
    var zIndex = 1;
    element.siblings().each(function() {
        var z = $(this).css('z-index');
        if (!isNaN(z) && z > zIndex) {
            zIndex = z + 1;
        }
    });
    element.css('z-index', zIndex);
}

/**
 * Retrieve outer html from an element.
 *
 * @param  {jQuery} element The jQuery element to retrieve the outer HTML from.
 * @return {String} The outer HTML.
 */
function elementOuterHtml(element) {
    return element.clone().wrap('<div/>').parent().html();
}

/**
 * Retrieve outer text from an element.
 *
 * @param  {jQuery} element The jQuery element to retrieve the outer text from.
 * @return {String} The outer text.
 */
function elementOuterText(element) {
    return element.clone().wrap('<div/>').parent().text();
}

/**
 * Determine whether element is block.
 *
 * @param  {Element} element The element to test.
 * @return {Boolean} True if the element is a block element
 */
function elementIsBlock(element) {
    return elementDefaultDisplay(element.tagName) === 'block';
}

/**
 * Determine whether element contains a block element.
 *
 * @param  {Element} element
 * @return {Boolean} True if the element contains a block element, false otherwise.
 */
function elementContainsBlockElement(element) {
    var containsBlock = false;
    element.contents().each(function() {
        if (!typeIsTextNode(this) && elementIsBlock(this)) {
            containsBlock = true;
            return;
        }
    });
    return containsBlock;
}

/**
 * Determine whether element is inline or block.
 *
 * @see http://stackoverflow.com/a/2881008/187954
 * @param  {string} tag Lower case tag name, e.g. 'a'.
 * @return {string} Default display style for tag.
 */
function elementDefaultDisplay(tag) {
    var cStyle,
        t = document.createElement(tag),
        gcs = "getComputedStyle" in window;

    document.body.appendChild(t);
    cStyle = (gcs ? window.getComputedStyle(t, "") : t.currentStyle).display;
    document.body.removeChild(t);

    return cStyle;
}

/**
 * Check that the given element is one of the the given tags.
 *
 * @param  {jQuery|Element} element The element to be tested.
 * @param  {Array}  validTags An array of valid tag names.
 * @return {Boolean} True if the given element is one of the give valid tags.
 */
function elementIsValid(element, validTags) {
    return -1 !== $.inArray($(element)[0].tagName.toLowerCase(), validTags);
}

/**
 * According to the given array of valid tags, find and return the first invalid
 * element of a valid parent. Recursively search parents until the wrapper is
 * encountered.
 *
 * @param  {Node} element
 * @param  {string[]} validTags
 * @param  {Element} wrapper
 * @return {Node}           [description]
 */
function elementFirstInvalidElementOfValidParent(element, validTags, wrapper) {
    // <strict/>
    var parent = element.parentNode;
    if (parent[0] === wrapper[0]) {
        // <strict/>
        return element;
    }
    if (elementIsValid(parent, validTags)) {
        return element;
    }
    return elementFirstInvalidElementOfValidParent(parent, validTags, wrapper);
}

/**
 * Calculate and return the visible rectangle for the element.
 *
 * @param  {jQuery|Element} element The element to calculate the visible rectangle for.
 * @return {Object} Visible rectangle for the element.
 */
function elementVisibleRect(element) {
    // <strict/>
    element = $(element);

    var rect = {
        top: Math.round(element.offset().top),
        left: Math.round(element.offset().left),
        width: Math.round(element.outerWidth()),
        height: Math.round(element.outerHeight())
    };


    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var scrollBottom = scrollTop + windowHeight;
    var elementBottom = Math.round(rect.height + rect.top);

    // If top & bottom of element are within the viewport, do nothing.
    if (scrollTop < rect.top && scrollBottom > elementBottom) {
        return rect;
    }

    // Top of element is outside the viewport
    if (scrollTop > rect.top) {
        rect.top = scrollTop;
    }

    // Bottom of element is outside the viewport
    if (scrollBottom < elementBottom) {
        rect.height = scrollBottom - rect.top;
    } else {
        // Bottom of element inside viewport
        rect.height = windowHeight - (scrollBottom - elementBottom);
    }

    return rect;
}

/**
 * Returns a map of an elements attributes and values. The result of this function
 * can be passed directly to $('...').attr(result);
 *
 * @param  {jQuery|Element|Selector} element The element to get the attributes from.
 * @return {Object} A map of attribute names mapped to their values.
 */
function elementGetAttributes(element) {
    var attributes = $(element).get(0).attributes,
        result = {};
    for (var i = 0, l = attributes.length; i < l; i++) {
        result[attributes[i].name] = attributes[i].value;
    }
    return result;
}

/**
 * Gets the styles of an element.
 * @todo the type for result.
 * FIXME: this function needs reviewing.
 * @param {jQuerySelector|jQuery|Element} element This is the element to get the style from.
 * @returns {unresolved} The style(s) of the element.
 */
function elementGetStyles(element) {
    var result = {};
    var style = window.getComputedStyle(element[0], null);
    for (var i = 0; i < style.length; i++) {
        result[style.item(i)] = style.getPropertyValue(style.item(i));
    }
    return result;
}

/**
 * Wraps the inner content of an element with a tag.
 *
 * @param {jQuerySelector|jQuery|Element} element The element(s) to wrap.
 * @param {String} tag The wrapper tag name
 * @returns {jQuery} The wrapped element.
 */
function elementWrapInner(element, tag) {
    var result = new jQuery();
    selectionSave();
    for (var i = 0, l = element.length; i < l; i++) {
        var wrapper = $('<' + tag + '/>').html($(element[i]).html());
        element.html(wrapper);
        result.push(wrapper[0]);
    }
    selectionRestore();
    return result;
}

/**
 * Toggles the styles of an element.
 *
 * FIXME: this function needs reviewing
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element The jQuery element to have it's style changed.
 * @param {type} styles The styles to add or remove from the element.
 * @returns {undefined}
 */
function elementToggleStyle(element, styles) {
    $.each(styles, function(property, value) {
        if ($(element).css(property) === value) {
            $(element).css(property, '');
        } else {
            $(element).css(property, value);
        }
    });
}

/**
 * Swaps the styles of two elements.
 *
 * @param {jQuery|Element} element1 The element for element 2 to get its styles from.
 * @param {jQuery|Element} element2 The element for element 1 to get its styles from.
 * @param {Object} style The style to be swapped between the two elements.
 */
function elementSwapStyles(element1, element2, style) {
    for (var name in style) {
        element1.css(name, element2.css(name));
        element2.css(name, style[name]);
    }
}

/**
 * Checks if an element is empty.
 *
 * @param {Element} element The element to be checked.
 * @returns {Boolean} Returns true if element is empty.
 */
function elementIsEmpty(element) {
    // <strict/>

    // Images and elements containing images are not empty
    if (element.is('img') || element.find('img').length) {
        return false;
    }
    if ((/&nbsp;/).test(element.html())) {
        return false;
    }
    return element.text() === '';
}

/**
 * Positions an element underneath another element.
 *
 * @param {jQuery} element Element to position.
 * @param {jQuery} under Element to position under.
 */
function elementPositionUnder(element, under) {
    var pos = $(under).offset(),
        height = $(under).outerHeight();
    $(element).css({
        top: (pos.top + height - $(window).scrollTop()) + 'px',
        left: pos.left + 'px'
    });
}

/**
 * Removes the element from the DOM to manipulate it using a function passed to the method, then replaces it back to it's origional position.
 *
 * @todo desc and type for manip
 * @param {jQuery|Element} element The element to be manipulated.
 * @param {type} manip A function used to manipulate the element i think.
 */
function elementDetachedManip(element, manip) {
    var parent = $(element).parent();
    $(element).detach();
    manip(element);
    parent.append(element);
}

/**
 * Finds the closest parent, up to a limit element, to the supplied element that is not an display inline or null.
 * If the parent element is the same as the limit element then it returns null.
 *
 * @param {jQuery} element The element to find the closest parent of.
 * @param {jQuery} limitElement The element to stop looking for the closest parent at.
 * @returns {jQuery} Closest element that is not display inline or null, or null if the parent element is the same as the limit element.
 */
function elementClosestBlock(element, limitElement) {
    // <strict/>
    while (element.length > 0 &&
        element[0] !== limitElement[0] &&
        (element[0].nodeType === Node.TEXT_NODE || element.css('display') === 'inline')) {
        element = element.parent();
    }
    if (element[0] === limitElement[0]) {
        return null;
    }
    return element;
}

/**
 * Generates a unique id.
 *
 * @returns {String} The unique id.
 */
function elementUniqueId() {
    var id = 'ruid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
    while ($('#' + id).length) {
        id = 'ruid-' + new Date().getTime() + '-' + Math.floor(Math.random() * 100000);
    }
    return id;
}

/**
 * Changes the tags on a given element.
 *
 * @todo not sure of details of return
 * @param {jQuerySelector|jQuery|Element} element The element(s) to have it's tags changed
 * @param {Element} newTag The new tag for the element(s)
 * @returns {Element}
 */
function elementChangeTag(element, newTag) {
    // <strict/>
    var tags = [];
    for (var i = element.length - 1; 0 <= i ; i--) {
        var node = document.createElement(newTag);
        node.innerHTML = element[i].innerHTML;
        $.each(element[i].attributes, function() {
            $(node).attr(this.name, this.value);
        });
        $(element[i]).after(node).remove();
        tags[i] = node;
    }
    return $(tags);
}

/**
 * Positions an element over top of another element.
 *  - If the other element is big, then the element is positioned in the center of the visible part of the other element.
 *  - If the other element is small and not at the top of the screen, the other element is positioned at the top of the other element.
 *  - If the other element is small and not is at the top of the screen, the other element is positioned at the bottom of the other element.
 *
 * @param {Element} element The element to position.
 * @param {Element} over The element to position over.
 */
function elementPositionOver(element, over) {
    if (element.outerHeight() > over.outerHeight() - 20) {
        var visibleRect = elementVisibleRect(over),
            offset = over.offset();
        element.css({
            position: 'absolute',
            // Calculate offset center for the element
            top:  offset.top - element.outerHeight(),
            left: visibleRect.left + ((visibleRect.width / 2)  - (element.outerWidth()  / 2))
        });
    } else {
        var visibleRect = elementVisibleRect(over);
        element.css({
            position: 'absolute',
            // Calculate offset center for the element
            top:  visibleRect.top  + ((visibleRect.height / 2) - (element.outerHeight() / 2)),
            left: visibleRect.left + ((visibleRect.width / 2)  - (element.outerWidth()  / 2))
        });
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/element.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/fragment.js
/**
 * @fileOverview DOM fragment manipulation helper functions
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Convert a DOMFragment to an HTML string. Optionally wraps the string in a tag.
 * @todo type for domFragment and tag.
 * @param {type} domFragment The fragment to be converted to a HTML string.
 * @param {type} tag The tag that the string may be wrapped in.
 * @returns {String} The DOMFragment as a string, optionally wrapped in a tag.
 */
function fragmentToHtml(domFragment, tag) {
    var html = '';
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        var content = node.nodeType === Node.TEXT_NODE ? node.nodeValue : elementOuterHtml($(node));
        if (content) {
            html += content;
        }
    }
    if (tag) {
        html = $('<' + tag + '>' + html + '</' + tag + '>');
        html.find('p').wrapInner('<' + tag + '/>');
        html.find('p > *').unwrap();
        html = $('<div/>').html(html).html();
    }
    return html;
}

/**
 * Insert a DOMFragment before an element and wraps them both in a tag.
 *
 * @public @static
 * @param {DOMFragment} domFragment This is the DOMFragment to be inserted.
 * @param {jQuerySelector|jQuery|Element} beforeElement This is the element the DOMFragment is to be inserted before.
 * @param {String} wrapperTag This is the tag to wrap the domFragment and the beforeElement in.
 */
function fragmentInsertBefore(domFragment, beforeElement, wrapperTag) {
    // Get all nodes in the extracted content
    for (var j = 0, l = domFragment.childNodes.length; j < l; j++) {
        var node = domFragment.childNodes.item(j);
        // Prepend the node before the current node
        var content = node.nodeType === Node.TEXT_NODE ? node.nodeValue : $(node).html();
        if (content) {
            $('<' + wrapperTag + '/>')
                .html($.trim(content))
                .insertBefore(beforeElement);
        }
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/fragment.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/node.js
/**
 * @fileOverview Find node parent helper function.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */


/**
 * Find the first parent of a node that is not a text node.
 *
 * @param {Node} node
 * @returns {Node}
 */
function nodeFindParent(node) {
    while (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }
    return node;
}

function nodeFindTextNodes(node) {
    var textNodes = [], whitespace = /^\s*$/;
    for (var i = 0, l = node.childNodes.length; i < l; i++) {
        if (node.childNodes[i].nodeType == Node.TEXT_NODE) {
            if (!whitespace.test(node.childNodes[i].nodeValue)) {
                textNodes.push(node.childNodes[i]);
            }
        }
    }
    return textNodes;
}

function nodeIsChildOf(child, parent) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/node.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/persist.js
/**
 * @fileOverview Storage helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Stores key-value data.
 * If local storage is already configured, retrieve what is stored and convert it to an array, otherwise create a blank array.
 * The value is then set in the array based on the key and the array is saved into local storage.
 * @todo desc and type for returns
 * @param {type} key The key for the data to be stored at
 * @param {type} value The data to be stored at the key.
 * @returns {persistSet} ??
 */
function persistSet(key, value) {
    if (localStorage) {
        var storage;
        if (localStorage.raptor) {
            storage = JSON.parse(localStorage.raptor);
        } else {
            storage = {};
        }
        storage[key] = value;
        localStorage.raptor = JSON.stringify(storage);
    }
}

/**
 * Gets the data stored at the supplied key.
 *
 * @param {type} key The key to get the stored data from.
 * @returns {Object} The data stored at the key.
 */
function persistGet(key) {
    if (localStorage) {
        var storage;
        if (localStorage.raptor) {
            storage = JSON.parse(localStorage.raptor);
        } else {
            storage = {};
        }
        return storage[key];
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/persist.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/range.js
/**
 * @fileOverview Range manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Expands a range to to surround all of the content from its start container
 * to its end container.
 *
 * @param {RangyRange} range The range to expand.
 */
function rangeExpandToParent(range) {
    // <strict/>
    range.setStartBefore(range.startContainer);
    range.setEndAfter(range.endContainer);
}

/**
 * Ensure range selects entire element.
 *
 * @param  {RangyRange} range
 * @param  {Element} element
 */
function rangeSelectElement(range, element) {
    // <strict/>
    range.selectNode($(element)[0]);
}

function rangeSelectElementContent(range, element) {
    // <strict/>
    range.selectNodeContents($(element).get(0));
}

/**
 * Expand range to contain given elements.
 *
 * @param {RangyRange} range The range to expand.
 * @param {array} elements An array of elements to check the current range against.
 */
function rangeExpandTo(range, elements) {
    // <strict/>
    do {
        rangeExpandToParent(range);
        for (var i = 0, l = elements.length; i < l; i++) {
            if ($(range.commonAncestorContainer).is(elements[i])) {
                return;
            }
        }
    } while (range.commonAncestorContainer);
}

/**
 * Replaces the content of range with the given html.
 *
 * @param  {RangyRange} range The range to replace.
 * @param  {jQuery|String} html The html to use when replacing range.
 * @return {Node[]} Array of new nodes inserted.
 */
function rangeReplace(range, html) {
    // <strict/>

    var result = [],
        nodes = $('<div/>').append(html)[0].childNodes;
    range.deleteContents();
    if (nodes.length === undefined || nodes.length === 1) {
        range.insertNode(nodes[0].cloneNode(true));
    } else {
        $.each(nodes, function(i, node) {
            result.unshift(node.cloneNode(true));
            range.insertNodeAtEnd(result[0]);
        });
    }
    return result;
}

/**
 * Empties a supplied range of all the html tags.
 *
 * @param {RangyRange} range This is the range to remove tags from.
 * @returns {boolean} True if the range is empty.
 */
function rangeEmptyTag(range) {
    var html = rangeToHtml(range);
    if (typeof html === 'string') {
        html = html.replace(/([ #;&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
    }
    return stringHtmlStringIsEmpty(html);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's start element.
 */
function rangeGetStartElement(range) {
    // <strict/>
    return nodeFindParent(range.startContainer);
}

/**
 * @param  {RangyRange} range
 * @return {Node} The range's end element.
 */
function rangeGetEndElement(range) {
    // <strict/>
    return nodeFindParent(range.endContainer);
}

/**
 * Returns a single selected range's common ancestor.
 * Works for single ranges only.
 *
 * @param {RangyRange} range
 * @return {Element} The range's common ancestor.
 */
function rangeGetCommonAncestor(range) {
    // <strict/>
    return nodeFindParent(range.commonAncestorContainer);
}

/**
 * Returns true if the supplied range is empty (has a length of 0)
 *
 * @public @static
 * @param {RangyRange} range The range to check if it is empty
 */
function rangeIsEmpty(range) {
    // <strict/>
    return range.startOffset === range.endOffset &&
           range.startContainer === range.endContainer;
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {boolean} True if the range is entirely contained by the given node.
 */
function rangeIsContainedBy(range, node) {
    // <strict/>
    var nodeRange = range.cloneRange();
    nodeRange.selectNodeContents(node);
    return nodeRange.containsRange(range);
}

/**
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean} True if node is contained within the range, false otherwise.
 */
function rangeContainsNode(range, node) {
    // <strict/>
    return range.containsNode(node);
}

/**
 * Tests whether the range contains all of the text (within text nodes) contained
 * within node. This is to provide an intuitive means of checking whether a range
 * "contains" a node if you consider the range as just in terms of the text it
 * contains without having to worry about niggly details about range boundaries.
 *
 * @param  {RangyRange} range
 * @param  {Node} node
 * @return {Boolean}
 */
function rangeContainsNodeText(range, node) {
    // <strict/>
    return range.containsNodeText(node);
}

/**
 * Removes the white space at the start and the end of the range.
 *
 * @param {RangyRange} range This is the range of selected text.
 */
function rangeTrim(range) {
    // <strict/>
    if (range.startContainer.data) {
        while (/\s/.test(range.startContainer.data.substr(range.startOffset, 1))) {
            range.setStart(range.startContainer, range.startOffset + 1);
        }
    }

    if (range.endContainer.data) {
        while (range.endOffset > 0 && /\s/.test(range.endContainer.data.substr(range.endOffset - 1, 1))) {
            range.setEnd(range.endContainer, range.endOffset - 1);
        }
    }
}

/**
 * Serializes supplied ranges.
 *
 * @param {RangyRange} ranges This is the set of ranges to be serialized.
 * @param {Node} rootNode
 * @returns {String} A string of the serialized ranges separated by '|'.
 */
function rangeSerialize(range, rootNode) {
    // <strict/>
    return rangy.serializeRange(range, true, rootNode);
}

/**
 * Deseralizes supplied ranges.
 *
 * @param {string} serialized This is the already serailized range to be deserialized.
 * @param {Node} rootNode
 * @returns {Array} An array of deserialized ranges.
 */
function rangeDeserialize(serialized, rootNode) {
    // <strict/>
    var serializedRanges = serialized.split("|"),
        ranges = [];
    for (var i = 0, l = serializedRanges.length; i < l; i++) {
        ranges[i] = rangy.deserializeRange(serializedRanges[i], rootNode);
    }
    return ranges;
}

/**
 * Split the selection container and insert the given html between the two elements created.
 *
 * @param  {RangyRange}
 * @param  {jQuery|Element|string} html The html to replace selection with.
 */
function rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames) {
    // <strict/>
    var commonAncestor = rangeGetCommonAncestor(range);

    if (!elementIsValid(commonAncestor, validTagNames)) {
        commonAncestor = elementFirstInvalidElementOfValidParent(commonAncestor, validTagNames, wrapper);
    }

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(commonAncestor);
    startRange.setEnd(range.startContainer, range.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEndAfter(commonAncestor);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html).attr('data-replacement', true));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    replacement = $(replacement);

    $(commonAncestor).replaceWith(replacement);
    replacement = replacement.parent().find('[data-replacement]').removeAttr('data-replacement');

    // Remove empty surrounding tags only if they're of the same type as the split element
    if (replacement.prev().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.prev().html().trim()) {
        replacement.prev().remove();
    }
    if (replacement.next().is(commonAncestor.tagName.toLowerCase()) &&
        !replacement.next().html().trim()) {
        replacement.next().remove();
    }
    return replacement;
}

/**
 * Replace the given range, splitting the parent elements such that the given html
 * is contained only by valid tags.
 *
 * @param  {RangyRange} range
 * @param  {string} html
 * @param  {Element} wrapper
 * @param  {string[]} validTagNames
 * @return {Element}
 */
function rangeReplaceWithinValidTags(range, html, wrapper, validTagNames) {
    var startElement = nodeFindParent(range.startContainer);
    var endElement = nodeFindParent(range.endContainer);
    var selectedElement = rangeGetCommonAncestor(range);

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        return rangeReplace(range, html);
    }

    // Context is invalid. Split containing element and insert list in between.
    return rangeReplaceSplitInvalidTags(range, html, wrapper, validTagNames);
}

function rangeToHtml(range) {
    return fragmentToHtml(range.cloneContents());
}

function rangeGet() {
    var selection = rangy.getSelection();
    if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }
    return null;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/range.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/selection.js
/**
 * @fileOverview Selection manipulation helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @type {Boolean|Object} current saved selection.
 */
var savedSelection = false;

/**
 * Save selection wrapper, preventing plugins / UI from accessing rangy directly.
 * @todo check desc and type for overwrite.
 * @param {Boolean} overwrite True if selection is able to be overwritten.
 */
function selectionSave(overwrite) {
    if (savedSelection && !overwrite) return;
    savedSelection = rangy.saveSelection();
}

/**
 * Restore selection wrapper, preventing plugins / UI from accessing rangy directly.
 */
function selectionRestore() {
    if (savedSelection) {
        rangy.restoreSelection(savedSelection);
        savedSelection = false;
    }
}

/**
 * Reset saved selection.
 */
function selectionDestroy() {
    if (savedSelection) {
        rangy.removeMarkers(savedSelection);
    }
    savedSelection = false;
}

/**
 * Returns whether the selection is saved.
 *
 * @returns {Boolean} True if there is a saved selection.
 */
function selectionSaved() {
    return savedSelection !== false;
}

/**
 * Iterates over all ranges in a selection and calls the callback for each
 * range. The selection/range offsets is updated in every iteration in in the
 * case that a range was changed or removed by a previous iteration.
 *
 * @public @static
 * @param {function} callback The function to call for each range. The first and only parameter will be the current range.
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 * @param {object} [context] The context in which to call the callback.
 */
function selectionEachRange(callback, selection, context) {
    selection = selection || rangy.getSelection();
    var range, i = 0;
    // Create a new range set every time to update range offsets
    while (range = selection.getAllRanges()[i++]) {
        callback.call(context, range);
    }
}

/**
 * Replaces the current selection with the specified range.
 *
 * @param {RangySelection} mixed The specified range to replace the current range.
 */
function selectionSet(mixed) {
    rangy.getSelection().setSingleRange(mixed);
}

/**
 * Replaces the given selection (or the current selection if selection is not
 * supplied) with the given html.
 * @todo type for result
 * @public @static
 * @param  {jQuery|String} html The html to use when replacing.
 * @param  {RangySelection|null} selection The selection to replace, or null to replace the current selection.
 * @returns {type} The replaced selection.
 */
function selectionReplace(html, selection) {
    var result = [];
    selectionEachRange(function(range) {
        result = result.concat(rangeReplace(range, html));
    }, selection, this);
    return result;
}

/**
 * Selects all the contents of the supplied element, excluding the element itself.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
 /*
function selectionSelectInner(element, selection) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();
    $(element).focus().contents().each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        selection.addRange(range);
    });
}
*/
/**
 * Selects all the contents of the supplied node, excluding the node itself.
 *
 * @public @static
 * @param {Node} node
 * @param {RangySelection} [selection] A RangySelection, or by default, the current selection.
 */
function selectionSelectInner(node, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var range = rangy.createRange();
    range.selectNodeContents(node);
    selection.setSingleRange(range);
}

/**
 * Selects all the contents of the supplied node, including the node itself.
 *
 * @public @static
 * @param {Node} node
 * @param {RangySelection} [selection] A RangySelection, or null to use the current selection.
 */
function selectionSelectOuter(node, selection) {
    // <strict/>
    var range = rangy.createRange();
    range.selectNode(node);
    rangy.getSelection().setSingleRange(range);
}

/**
 * Move selection to the start or end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 * @param {Boolean} start True to select the start of the element.
 */
function selectionSelectEdge(element, selection, start) {
    selection = selection || rangy.getSelection();
    selection.removeAllRanges();

    $(element).each(function() {
        var range = rangy.createRange();
        range.selectNodeContents(this);
        range.collapse(start);
        selection.addRange(range);
    });
}

/**
 * Move selection to the end of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectEnd(element, selection) {
    selectionSelectEdge(element, selection, false);
}

/**
 * Move selection to the start of element.
 *
 * @param  {jQuerySelector|jQuery|Element} element The subject element.
 * @param  {RangySelection|null} selection A RangySelection, or null to use the current selection.
 */
function selectionSelectStart(element, selection) {
    selectionSelectEdge(element, selection, true);
}

/**
 * Extend selection to the end of element.
 *
 * @param  {Element} element
 * @param  {RangySelection|null} selection
 */
function selectionSelectToEndOfElement(element, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var range = selectionRange();
    selection.removeAllRanges();
    range.setEndAfter(element.get(0));
    selection.addRange(range);
}

/**
 * Gets the HTML from a selection. If no selection is supplied then current selection will be used.
 *
 * @param  {RangySelection|null} selection Selection to get html from or null to use current selection.
 * @return {string} The html content of the selection.
 */
function selectionGetHtml(selection) {
    selection = selection || rangy.getSelection();
    return selection.toHtml();
}

/**
 * Gets the closest common ancestor container to the given or current selection that isn't a text node.
 * @todo check please
 *
 * @param {RangySelection} range The selection to get the element from.
 * @returns {jQuery} The common ancestor container that isn't a text node.
 */
function selectionGetElement(range, selection) {
    selection = selection || rangy.getSelection();
    if (!selectionExists()) {
        return new jQuery;
    }
    var range = selectionRange(),
        commonAncestor;
    // Check if the common ancestor container is a text node
    if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
        // Use the parent instead
        commonAncestor = range.commonAncestorContainer.parentNode;
    } else {
        commonAncestor = range.commonAncestorContainer;
    }
    return $(commonAncestor);
}

/**
 * Gets all elements within and including the selection's common ancestor that contain a selection (excluding text nodes) and
 * returns them as a jQuery array.
 *
 * @public @static
 * @param {RangySelection|null} A RangySelection, or by default, the current selection.
 */
function selectionGetElements(selection) {
    var result = new jQuery();
    selectionEachRange(function(range) {
        result.push(selectionGetElement(range)[0]);
    }, selection, this);
    return result;
}

/**
 * Gets the start element of a selection.
 * @todo check the type of the return...i guessed and i have a feeling i might be wrong.
 * @returns {jQuery|Object} If the anchor node is a text node then the parent of the anchor node is returned, otherwise the anchor node is returned.
 */
function selectionGetStartElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.focusNode.nodeType === Node.TEXT_NODE ? $(selection.focusNode.parentElement) : $(selection.focusNode);
    }
    if (!selection.anchorNode) console.trace();
    return selection.anchorNode.nodeType === Node.TEXT_NODE ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
}

/**
 * Gets the end element of the selection.
 * @returns {jQuery|Object} If the focus node is a text node then the parent of the focus node is returned, otherwise the focus node is returned.
 */
function selectionGetEndElement() {
    var selection = rangy.getSelection();
    if (selection.anchorNode === null) {
        return null;
    }
    if (selection.isBackwards()) {
        return selection.anchorNode.nodeType === Node.TEXT_NODE ? $(selection.anchorNode.parentElement) : $(selection.anchorNode);
    }
    return selection.focusNode.nodeType === Node.TEXT_NODE ? $(selection.focusNode.parentElement) : $(selection.focusNode);
}

/**
 * Checks to see if the selection is at the end of the element.
 *
 * @returns {Boolean} True if the node immediately after the selection ends does not exist or is empty,
 *                      false if the whole nodes' text is not selected or it doesn't fit the criteria for the true clause.
 */
function selectionAtEndOfElement() {
    var selection = rangy.getSelection();
    var focusNode = selection.isBackwards() ? selection.anchorNode : selection.focusNode;
    var focusOffset = selection.isBackwards() ? selection.focusOffset : selection.anchorOffset;
    if (focusOffset !== focusNode.textContent.length) {
        return false;
    }
    var previous = focusNode.nextSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks to see if the selection is at the start of the element.
 *
 * @returns {Boolean} True if the node immediately before the selection starts does not exist or is empty,
 *                      false if the whole nodes' text is not selected or it doesn't fit the criteria for the true clause.
 */
function selectionAtStartOfElement() {
    var selection = rangy.getSelection();
    var anchorNode = selection.isBackwards() ? selection.focusNode : selection.anchorNode;
    if (selection.isBackwards() ? selection.focusOffset : selection.anchorOffset !== 0) {
        return false;
    }
    var previous = anchorNode.previousSibling;
    if (!previous || $(previous).html() === '') {
        return true;
    } else {
        return false;
    }
}

/**
 * Checks to see if the selection is empty.
 * @returns {Boolean} Returns true if the selection is empty.
 */
function selectionIsEmpty() {
    return rangy.getSelection().toHtml() === '';
}

/**
 * FIXME: this function needs reviewing.
 *
 * This should toggle an inline style, and normalise any overlapping tags, or adjacent (ignoring white space) tags.
 * @todo apparently this needs fixing and i'm not sure what it returns.
 * @public @static
 *
 * @param {String} tag This is the tag to be toggled.
 * @param {Array} options These are any additional properties to add to the element.
 * @returns {selectionToggleWrapper}
 */
function selectionToggleWrapper(tag, options) {
    options = options || {};
    var applier = rangy.createCssClassApplier(options.classes || '', {
        normalize: true,
        elementTagName: tag,
        elementProperties: options.attributes || {}
    });
    selectionEachRange(function(range) {
        if (rangeEmptyTag(range)) {
            var element = $('<' + tag + '/>')
                .addClass(options.classes)
                .attr(options.attributes || {})
                .append(fragmentToHtml(range.cloneContents()));
            rangeReplace(range, element);
        } else {
            applier.toggleRange(range);
        }
    }, null, this);
}

/**
 * @todo method description and check types
 *
 * @param {String} tag The tag for the selection to be wrapped in.
 * @param {String} attributes The attributes to be added to the selection.
 * @param {String} classes The classes to be added to the selection
 */
function selectionWrapTagWithAttribute(tag, attributes, classes) {
    selectionEachRange(function(range) {
        var element = selectionGetElement(range);
        if (element.is(tag)) {
            element.attr(attributes);
        } else {
            selectionToggleWrapper(tag, {
                classes: classes,
                attributes: attributes
            });
        }
    }, null, this);
}

/**
 * Check if there is a current selection.
 *
 * @public @static
 * @returns {Boolean} Returns true if there is at least one range selected.
 */
function selectionExists() {
    return rangy.getSelection().rangeCount !== 0;
}

/**
 * Gets the first range in the current selection. In strict mode if no selection
 * exists an error occurs.
 *
 * @public @static
 * @returns {RangyRange} Returns true if there is at least one range selected.
 */
function selectionRange() {
    // <strict/>
    return rangy.getSelection().getRangeAt(0);
}

/**
 * Split the selection container and insert the given html between the two elements created.
 * @param  {jQuery|Element|string} html The html to replace selection with.
 * @param  {RangySelection|null} selection The selection to replace, or null for the current selection.
 * @returns {Object} The selection container with it's new content added.
 */
function selectionReplaceSplittingSelectedElement(html, selection) {
    selection = selection || rangy.getSelection();

    var selectionRange = selectionRange();
    var selectedElement = selectionGetElements()[0];

    // Select from start of selected element to start of selection
    var startRange = rangy.createRange();
    startRange.setStartBefore(selectedElement);
    startRange.setEnd(selectionRange.startContainer, selectionRange.startOffset);
    var startFragment = startRange.cloneContents();

    // Select from end of selected element to end of selection
    var endRange = rangy.createRange();
    endRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
    endRange.setEndAfter(selectedElement);
    var endFragment = endRange.cloneContents();

    // Replace the start element's html with the content that was not selected, append html & end element's html
    var replacement = elementOuterHtml($(fragmentToHtml(startFragment)));
    replacement += elementOuterHtml($(html).attr('data-replacement', true));
    replacement += elementOuterHtml($(fragmentToHtml(endFragment)));

    replacement = $(replacement);

    $(selectedElement).replaceWith(replacement);
    return replacement.parent().find('[data-replacement]').removeAttr('data-replacement');
}

/**
 * Replace current selection with given html, ensuring that selection container is split at
 * the start & end of the selection in cases where the selection starts / ends within an invalid element.
 *
 * @param  {jQuery|Element|string} html The html to replace current selection with.
 * @param  {Array} validTagNames An array of tag names for tags that the given html may be inserted into without having the selection container split.
 * @param  {RangySeleciton|null} selection The selection to replace, or null for the current selection.
 * @returns {Object} The replaced selection if everything is valid or the selection container with it's new content added.
 */
function selectionReplaceWithinValidTags(html, validTagNames, selection) {
    selection = selection || rangy.getSelection();

    if (!selectionExists()) {
        return;
    }

    var startElement = selectionGetStartElement()[0];
    var endElement = selectionGetEndElement()[0];
    var selectedElement = selectionGetElements()[0];

    var selectedElementValid = elementIsValid(selectedElement, validTagNames);
    var startElementValid = elementIsValid(startElement, validTagNames);
    var endElementValid = elementIsValid(endElement, validTagNames);

    // The html may be inserted within the selected element & selection start / end.
    if (selectedElementValid && startElementValid && endElementValid) {
        return selectionReplace(html);
    }

    // Context is invalid. Split containing element and insert list in between.
    return selectionReplaceSplittingSelectedElement(html, selection);
}

/**
 * Toggles style(s) on the first block level parent element of each range in a selection
 *
 * @public @static
 * @param {Object} styles styles to apply
 * @param {jQuerySelector|jQuery|Element} limit The parent limit element.
 * If there is no block level elements before the limit, then the limit content
 * element will be wrapped with a "div"
 */
function selectionToggleBlockStyle(styles, limit) {
    selectionEachRange(function(range) {
        var parent = $(range.commonAncestorContainer);
        while (parent.length && parent[0] !== limit[0] && (
                parent[0].nodeType === Node.TEXT_NODE || parent.css('display') === 'inline')) {
            parent = parent.parent();
        }
        if (parent[0] === limit[0]) {
            // Only apply block style if the limit element is a block
            if (limit.css('display') !== 'inline') {
                // Wrap the HTML inside the limit element
                elementWrapInner(limit, 'div');
                // Set the parent to the wrapper
                parent = limit.children().first();
            }
        }
        // Apply the style to the parent
        elementToggleStyle(parent, styles);
    }, null, this);
}

/**
 * Iterates throught each block in the selection and calls the callback function.
 *
 * @todo revise blockContainer parameter!
 * @param {function} callback The function to be called on each block in the selection.
 * @param {jQuery} limitElement The element to stop searching for block elements at.
 * @param {undefined|Sring} blockContainer Thia parameter is unused for some reason.
 */
function selectionEachBlock(callback, limitElement, blockContainer) {
    // <strict/>
    selectionEachRange(function(range) {
        // Loop range parents until a block element is found, or the limit element is reached
        var startBlock = elementClosestBlock($(range.startContainer), limitElement),
            endBlock = elementClosestBlock($(range.endContainer), limitElement),
            blocks;
        if (!startBlock || !endBlock) {
            // Wrap the HTML inside the limit element
            callback(elementWrapInner(limitElement, blockContainer).get(0));
        } else {
            if (startBlock.is(endBlock)) {
                blocks = startBlock;
            } else if (startBlock && endBlock) {
                blocks = startBlock.nextUntil(endBlock).andSelf().add(endBlock);
            }
            for (var i = 0, l = blocks.length; i < l; i++) {
                callback(blocks[i]);
            }
        }
    });
}

/**
 * Add or removes a set of classes to the closest block elements in a selection.
 * If the `limitElement` is closer than a block element, then a new
 * `blockContainer` element wrapped around the selection.
 *
 * If any block in the selected text has not got the class applied to it, then
 * the class will be applied to all blocks.
 *
 * @todo revise blockContainer parameter!
 * @param {string[]} addClasses This is a set of classes to be added.
 * @param {string[]} removeClasses This is a set of classes to be removed.
 * @param {jQuery} limitElement The element to stop searching for block elements at.
 * @param {undefined|String} blockContainer Thia parameter is unused for some reason.
 */
function selectionToggleBlockClasses(addClasses, removeClasses, limitElement, blockContainer) {
    // <strict/>

    var apply = false,
        blocks = new jQuery();

    selectionEachBlock(function(block) {
        blocks.push(block);
        if (!apply) {
            for (var i = 0, l = addClasses.length; i < l; i++) {
                if (!$(block).hasClass(addClasses[i])) {
                    apply = true;
                }
            }
        }
    }, limitElement, blockContainer);

    $(blocks).removeClass(removeClasses.join(' '));
    if (apply) {
        $(blocks).addClass(addClasses.join(' '));
    } else {
        $(blocks).removeClass(addClasses.join(' '));
    }
}

/**
 * Removes all ranges from a selection that are not contained within the
 * supplied element.
 *
 * @public @static
 * @param {jQuerySelector|jQuery|Element} element The element to exclude the removal of ranges.
 * @param {RangySelection} [selection] The selection from which to remove the ranges.
 */
function selectionConstrain(node, selection) {
    // <strict/>
    selection = selection || rangy.getSelection();
    var ranges = selection.getAllRanges(),
        newRanges = [];
    for (var i = 0, l = ranges.length; i < l; i++) {
        var newRange = ranges[i].cloneRange();
        if (ranges[i].startContainer !== node &&
                !nodeIsChildOf(ranges[i].startContainer, node)) {
            newRange.setStart(node, 0);
        }
        if (ranges[i].endContainer !== node &&
                !nodeIsChildOf(ranges[i].endContainer, node)) {
            newRange.setEnd(node, node.childNodes.length);
        }
        newRanges.push(newRange);
    }
    selection.setRanges(newRanges);
}

/**
 * Clears the formatting on a supplied selection.
 *
 * @param {Node} limitNode The containing element.
 * @param {RangySelection} [selection] The selection to have it's formatting cleared.
 */
function selectionClearFormatting(limitNode, selection) {
    // <strict/>

    limitNode = limitNode || document.body;
    selection = selection || rangy.getSelection();
    if (selectionExists()) {
        // Create a copy of the selection range to work with
        var range = selectionRange().cloneRange();

        // Get the selected content
        var content = range.extractContents();

        // Expand the range to the parent if there is no selected content
        // and the range's ancestor is not the limitNode
        if (fragmentToHtml(content) === '') {
            rangeSelectElementContent(range, range.commonAncestorContainer);
            selection.setSingleRange(range);
            content = range.extractContents();
        }

        content = $('<div/>').append(fragmentToHtml(content)).html().replace(/(<\/?.*?>)/gi, function(match) {
            if (match.match(/^<(img|object|param|embed|iframe)/) !== null) {
                return match;
            }
            return '';
        });

        // Get the containing element
        var parent = range.commonAncestorContainer;
        while (parent && parent.parentNode !== limitNode) {
            parent = parent.parentNode;
        }

        if (parent) {
            // Place the end of the range after the paragraph
            range.setEndAfter(parent);

            // Extract the contents of the paragraph after the caret into a fragment
            var contentAfterRangeStart = range.extractContents();

            // Collapse the range immediately after the paragraph
            range.collapseAfter(parent);

            // Insert the content
            range.insertNode(contentAfterRangeStart);

            // Move the caret to the insertion point
            range.collapseAfter(parent);
        }
        content = $.parseHTML(content);
        if (content !== null) {
            $(content.reverse()).each(function() {
                if ($(this).is('img')) {
                    range.insertNode($(this).removeAttr('width height class style').get(0));
                    return;
                }
                range.insertNode(this);
            });
        }
    }
}

/**
 * Replaces specified tags and classes on a selection.
 *
 * @todo check descriptions and types please
 * @param {String} tag1 This is the tag to appear on the selection at the end of the method.
 * @param {jQuery} class1 This is the class to appear on the selection at the end of the method.
 * @param {String} tag2 This is the current tag on the selection, which is to be replaced.
 * @param {jQuery} class2 This is the current class on the selection, which is to be replaced.
 */
function selectionInverseWrapWithTagClass(tag1, class1, tag2, class2) {
    selectionSave();
    // Assign a temporary tag name (to fool rangy)
    var id = 'domTools' + Math.ceil(Math.random() * 10000000);

    selectionEachRange(function(range) {
        var applier2 = rangy.createCssClassApplier(class2, {
            elementTagName: tag2
        });

        // Check if tag 2 is applied to range
        if (applier2.isAppliedToRange(range)) {
            // Remove tag 2 to range
            applier2.toggleSelection();
        } else {
            // Apply tag 1 to range
            rangy.createCssClassApplier(class1, {
                elementTagName: id
            }).toggleSelection();
        }
    }, null, this);

    // Replace the temporary tag with the correct tag
    $(id).each(function() {
        $(this).replaceWith($('<' + tag1 + '/>').addClass(class1).html($(this).html()));
    });

    selectionRestore();
}

/**
 * Expands the user selection to encase a whole word.
 */
function selectionExpandToWord() {
    var selection = window.getSelection(),
        range = selection.getRangeAt(0);
    if (!range ||
            range.startContainer !== range.endContainer ||
            range.startOffset !== range.endOffset) {
        return;
    }
    var start = range.startOffset,
        end = range.startOffset;
    while (range.startContainer.data[start - 1] &&
            !range.startContainer.data[start - 1].match(/\s/)) {
        start--;
    }
    while (range.startContainer.data[end] &&
            !range.startContainer.data[end].match(/\s/)) {
        end++;
    }
    range.setStart(range.startContainer, start);
    range.setEnd(range.startContainer, end);
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * Expands the user selection to contain the supplied selector, stopping at the specified limit element.
 *
 * @param {jQuerySelector} selector The selector to expand the selection to.
 * @param {jQuerySelector} limit The element to stop at.
 * @param {boolean} outer If true, then the outer most matched element (by the
 *   selector) is wrapped. Otherwise the first matched element is wrapped.
 */
function selectionExpandTo(selector, limit, outer) {
    var ranges = rangy.getSelection().getAllRanges();
    for (var i = 0, l = ranges.length; i < l; i++) {
        // Start container
        var element = $(nodeFindParent(ranges[i].startContainer));
        if (outer || (!element.is(selector) && !element.is(limit))) {
            element = element.parentsUntil(limit, selector);
        }
        if (outer) {
            element = element.last();
        } else {
            element = element.first();
        }
        if (element.length === 1 && !element.is(limit)) {
            ranges[i].setStart(element[0], 0);
        }

        // End container
        element = $(nodeFindParent(ranges[i].endContainer));
        if (outer || (!element.is(selector) && !element.is(limit))) {
            element = element.parentsUntil(limit, selector);
        }
        if (outer) {
            element = element.last();
        } else {
            element = element.first();
        }
        if (element.length === 1 && !element.is(limit)) {
            ranges[i].setEnd(element[0], element[0].childNodes.length);
        }
    }
    rangy.getSelection().setRanges(ranges);
}

/**
 * Trims an entire selection as per rangeTrim.
 *
 * @see rangeTrim
 */
function selectionTrim() {
    if (selectionExists()) {
        var range = selectionRange();
        rangeTrim(range);
        selectionSet(range);
    }
}

/**
 * Finds the inner elements and the wrapping tags for a selector.
 *
 * @param {string} selector A jQuery selector to match the wrapping/inner element against.
 * @param {jQuery} limitElement The element to stop searching at.
 * @returns {jQuery}
 */
function selectionFindWrappingAndInnerElements(selector, limitElement) {
    var result = new jQuery();
    selectionEachRange(function(range) {
        var startNode = range.startContainer;
        while (startNode.nodeType === Node.TEXT_NODE) {
            startNode = startNode.parentNode;
        }

        var endNode = range.endContainer;
        while (endNode.nodeType === Node.TEXT_NODE) {
            endNode = endNode.parentNode;
        }

        var filter = function() {
            if (!limitElement.is(this)) {
                result.push(this);
            }
        };

        do {
            $(startNode).filter(selector).each(filter);

            if (!limitElement.is(startNode) && result.length === 0) {
                $(startNode).parentsUntil(limitElement, selector).each(filter);
            }

            $(startNode).find(selector).each(filter);

            if ($(endNode).is(startNode)) {
                break;
            }

            startNode = $(startNode).next();
        } while (startNode.length > 0 && $(startNode).prevAll().has(endNode).length === 0);
    });
    return result;
}

/**
 * Changes the tags on a selection.
 *
 * @param {String} changeTo The tag to be changed to.
 * @param {String} changeFrom The tag to be changed from.
 * @param {jQuery} limitElement The element to stop changing the tags at.
 */
function selectionChangeTags(changeTo, changeFrom, limitElement) {
    var elements = selectionFindWrappingAndInnerElements(changeFrom.join(','), limitElement);
    if (elements.length) {
        selectionSave();
        elementChangeTag(elements, changeTo);
        selectionRestore();
    } else {
        var limitNode = limitElement.get(0);
        if (limitNode.innerHTML.trim()) {
            selectionSave();
            limitNode.innerHTML = '<' + changeTo + '>' + limitNode.innerHTML + '</' + changeTo + '>';
            selectionRestore();
        } else {
            limitNode.innerHTML = '<' + changeTo + '>&nbsp;</' + changeTo + '>';
            selectionSelectInner(limitNode.childNodes[0]);
        }
    }
}

/**
 * Checks that the selecton only contains valid children.
 *
 * @param {String} selector A string containing a selector expression to match the current set of elements against.
 * @param {jQuery} limit The element to stop changing the tags at.
 * @returns {Boolean} True if the selection contains valid children.
 */
function selectionContains(selector, limit) {
    var result = true;
    selectionEachRange(function(range) {
        // Check if selection only contains valid children
        var children = $(range.commonAncestorContainer).find('*');
        if ($(range.commonAncestorContainer).parentsUntil(limit, selector).length === 0 &&
                (children.length === 0 || children.length !== children.filter(selector).length)) {
            result = false;
        }
    });
    return result;
}

function selectionDelete(selection) {
    selection = selection || rangy.getSelection();
    selection.deleteFromDocument();
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/selection.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/state.js
/**
 * @fileOverview Save state helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Saves the state of an element.
 * @param {jQuery} element The element to have its current state saved.
 * @returns {Object} The saved state of the element.
 */
function stateSave(element) {
    // <strict/>

    var range = rangeGet();
    return {
        element: element.clone(true),
        ranges: range ? rangeSerialize(range, element.get(0)) : null
    };
}

/**
 * Restores an element from its saved state.
 *
 * @param {jQuery} element The element to have its state restored.
 * @param {jQuery} state The state to restore the element to.
 * @returns {Object} The restored element.
 */
function stateRestore(element, state) {
    // <strict/>

    element.replaceWith(state.element);
    var ranges = null;
    try {
        if (state.ranges) {
            ranges = rangeDeserialize(state.ranges, state.element.get(0));
        }
    } catch (exception) {
        // <debug/>
    }
    return {
        element: state.element,
        ranges: ranges
    };
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/state.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/string.js
/**
 * @fileOverview String helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * Modification of strip_tags from PHP JS - http://phpjs.org/functions/strip_tags:535.
 * @param  {string} content HTML containing tags to be stripped
 * @param {Array} allowedTags Array of tags that should not be stripped
 * @return {string} HTML with all tags not present allowedTags array.
 */
function stringStripTags(content, allowedTags) {
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    allowed = [];
    for (var allowedTagsIndex = 0; allowedTagsIndex < allowedTags.length; allowedTagsIndex++) {
        if (allowedTags[allowedTagsIndex].match(/[a-z][a-z0-9]{0,}/g)) {
            allowed.push(allowedTags[allowedTagsIndex]);
        }
    }
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*\/?>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

    return content.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf($1.toLowerCase()) > -1 ? $0 : '';
    });
}

/**
 * Checks if an html string is empty.
 *
 * @param {Element} element The element to be checked.
 * @returns {Element}
 */
function stringHtmlStringIsEmpty(html) {
    // <strict/>
    return $($.parseHTML(html)).is(':empty');
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/string.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/style.js
/**
 * @fileOverview Style helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

/**
 * @todo desc all
 * @param {jQuerySelector|jQuery|Element} element This is the element to have its styles swapped.
 * @param {array} newState The new state to be applied to the element.
 * @returns {array}
 */
function styleSwapState(element, newState) {
    var node = element.get(0),
        previousState = {};
    // Double loop because jQuery will automatically assign other style properties like 'margin-left' when setting 'margin'
    for (var key in newState) {
        previousState[key] = node.style[key];
    }
    for (key in newState) {
        element.css(key, newState[key]);
    }
    return previousState;
}

/**
 * @todo type for wrapper and inner and descriptions
 * @param {type} wrapper
 * @param {type} inner
 * @param {array} newState
 * @returns {unresolved}
 */
function styleSwapWithWrapper(wrapper, inner, newState) {
    var innerNode = inner.get(0),
        previousState = {};
    // Double loop because jQuery will automatically assign other style properties like 'margin-left' when setting 'margin'
    for (var key in newState) {
        previousState[key] = innerNode.style[key];
    }
    for (key in newState) {
        wrapper.css(key, inner.css(key));
        inner.css(key, newState[key]);
    }
    return previousState;
}

/**
 * @todo all
 * @param {jQuery} element
 * @param {array} state
 * @returns {undefined}
 */
function styleRestoreState(element, state) {
    for (var key in state) {
        element.css(key, state[key] || '');
    }
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/style.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/table.js
/**
 * @fileOverview Table helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen - david@panmedia.co.nz
 */

/**
 * Create and return a new table element with the supplied number of rows/columns.
 *
 * @public @static
 * @param {int} columns The number of columns to add to the table.
 * @param {int} rows The number of rows to add to the table.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableElement}
 */
function tableCreate(columns, rows, options) {
    options = options || {};
    var table = document.createElement('table');
    while (rows--) {
        var row = table.insertRow(0);
        for (var i = 0; i < columns; i++) {
            var cell = row.insertCell(0);
            if (options.placeHolder) {
                cell.innerHTML = options.placeHolder;
            }
        }
    }
    return table;
}

/**
 * Adds a column to a table.
 *
 * @param {HTMLTableElement} table
 * @param {int[]} index Position to insert the column at, starting at 0.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableCellElement[]} An array of cells added to the table.
 */
function tableInsertColumn(table, index, options) {
    return resizeTable(table, 0, 0, 1, index, options || {});
}
/**
 * Removes a column from a table.
 *
 * @param {HTMLTableElement} table
 * @param {int} index Position to remove the column at, starting at 0.
 */
function tableDeleteColumn(table, index) {
    resizeTable(table, 0, 0, -1, index);
}

/**
 * Adds a row to a table, and append as many cells as the longest row in the table.
 *
 * @param {HTMLTableElement} table
 * @param {int[]} index Position to insert the row at, starting at 0.
 * @param [options] Extra options to apply.
 * @param [options.placeHolder=""] Place holder HTML to insert into each created cell.
 * @returns {HTMLTableCellElement[]} An array of cells added to the table.
 */
function tableInsertRow(table, index, options) {
    var googTable = new GoogTable(table);
    return googTable.insertRow(index, options);
}

/**
 * Removes a row from a table.
 *
 * @param {HTMLTableElement} table The table to remove the row from.
 * @param {int} index Position to remove the row at, starting at 0.
 */
function tableDeleteRow(table, index) {
    resizeTable(table, -1, index, 0, 0);
}

/**
 * Return the x/y position of a table cell, taking into consideration the column/row span.
 *
 * @param {HTMLTableCellElement} cell The table cell to get the index for.
 * @returns {tableGetCellIndex.Anonym$0}
 */
function tableGetCellIndex(cell) {
    var x, y, tx, ty,
        matrix = [],
        rows = cell.parentNode.parentNode.parentNode.tBodies[0].rows;
    for (var r = 0; r < rows.length; r++) {
        y = rows[r].sectionRowIndex;
        y = r;
        for (var c = 0; c < rows[r].cells.length; c++) {
            x = c;
            while (matrix[y] && matrix[y][x]) {
                // Skip already occupied cells in current row
                x++;
            }
            for (tx = x; tx < x + (rows[r].cells[c].colSpan || 1); ++tx) {
                // Mark matrix elements occupied by current cell with true
                for (ty = y; ty < y + (rows[r].cells[c].rowSpan || 1); ++ty) {
                    if (!matrix[ty]) {
                        // Fill missing rows
                        matrix[ty] = [];
                    }
                    matrix[ty][tx] = true;
                }
            }
            if (cell === rows[r].cells[c]) {
                return {
                    x: x,
                    y: y
                };
            }
        }
    }
}

/**
 * Gets a table cell by a given index.
 *
 * @param {HTMLTableElement} table This is the table to get the cell from.
 * @param {int} index This is the index to find the cell.
 * @returns {HTMLTableCellElement|null} The cell at the specified index.
 */
function tableGetCellByIndex(table, index) {
    var rows = table.tBodies[0].rows;
    for (var r = 0; r < rows.length; r++) {
        for (var c = 0; c < rows[r].cells.length; c++) {
            var currentIndex = tableGetCellIndex(rows[r].cells[c]);
            if (currentIndex.x === index.x &&
                    currentIndex.y === index.y) {
                return rows[r].cells[c];
            }
        }
    }
    return null;
}

/**
 * Returns an array of cells found within the supplied indexes.
 *
 * @param {HTMLTableElement} table
 * @param {int} startIndex This is the index to start searching at.
 * @param {int} endIndex This is the index to stop searching at.
 * @returns {Array} An array of the cells in the range supplied.
 */
function tableCellsInRange(table, startIndex, endIndex) {
    var startX = Math.min(startIndex.x, endIndex.x),
        x = startX,
        y = Math.min(startIndex.y, endIndex.y),
        endX = Math.max(startIndex.x, endIndex.x),
        endY = Math.max(startIndex.y, endIndex.y),
        cells = [];
    while (y <= endY) {
        while (x <= endX) {
            var cell = tableGetCellByIndex(table, {
                x: x,
                y: y
            });
            if (cell !== null) {
                cells.push(cell);
            }
            x++;
        }
        x = startX;
        y++;
    }
    return cells;
}

/**
 * Checks if the cells selected can be merged.
 *
 * @param {HTMLTableElement} table The table to check the selection with.
 * @param {int} startX Selection's start x position.
 * @param {int} startY Selection's start y position.
 * @param {int} endX Selection's end x position.
 * @param {int} endY Selection's end y position.
 */
function tableCanMergeCells(table, startX, startY, endX, endY) {
}

/**
 * Merges the selected cells of a table.
 *
 * @param {HTMLTableElement} table This is the table that is going to have cells merged.
 * @param {int} startX This is the X coordinate to start merging the cells at.
 * @param {int} startY This is the Y coordinate to start merging the cells at.
 * @param {int} endX This is the X coordinate to stop merging the cells at.
 * @param {int} endY This is the Y coordinate to stop merging the cells at.
 */
function tableMergeCells(table, startX, startY, endX, endY) {
    var googTable = new GoogTable(table);
    googTable.mergeCells(startX, startY, endX, endY);
}

/**
 * Checks if the cell at the given index can be split.
 *
 * @param {HTMLTableElement} table Table to check the seleciton with.
 * @param {int} x The X coordinate of the cell to be checked.
 * @param {int} y Ths Y coordinate of the cell to be checked.
 */
function tableCanSplitCells(table, x, y) {
}

/**
 * Splits the selected cell of a table.
 *
 * @param {HTMLTableElement} table The table to find the cell to be split on.
 * @param {int} x The X coordinate of the cell to be split.
 * @param {int} y The Y coordinate of the cell to be split.
 */
function tableSplitCells(table, x, y) {
    var googTable = new GoogTable(table);
    googTable.splitCell(x, y);
}


function tableIsEmpty(table) {
    for (var i = 0, l = table.rows.length; i < l; i++) {
        if (table.rows[i].cells.length > 0) {
            return false;
        }
    }
    return true;
};
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/table.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/template.js
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/template.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/tools/types.js
/**
 * @fileOverview Type checking functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson michael@panmedia.co.nz
 * @author David Neilsen david@panmedia.co.nz
 */

/**
 * Determines whether object is a rangy range.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a rangy range.
 */
function typeIsRange(object) {
    return object instanceof rangy.WrappedRange;
}

/**
 * Determines whether object is a rangy selection.
 *
 * @param {mixed} object The object to be tested.
 * @returns {Boolean} True if the object is a rangy selection.
 */
function typeIsSelection(object) {
    return object instanceof rangy.WrappedSelection;
}
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/tools/types.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/init.js
var $ = jQuery;

$(function() {
    // Initialise rangy
    if (!rangy.initialized) {
        rangy.init();
    }

    // Add helper method to rangy
    if (!$.isFunction(rangy.rangePrototype.insertNodeAtEnd)) {
        rangy.rangePrototype.insertNodeAtEnd = function(node) {
            var range = this.cloneRange();
            range.collapse(false);
            range.insertNode(node);
            range.detach();
            this.setEndAfter(node);
        };
    }
});

// Select menu close event (triggered when clicked off)
$('html').click(function(event) {
    $('.ui-editor-selectmenu-visible')
        .removeClass('ui-editor-selectmenu-visible');
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/init.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/support.js
var supported, ios, hotkeys, firefox, ie;

function isSupported() {
    if (supported === undefined) {
        supported = true;

        // <ios>
        ios = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);
        if (ios) {
            $('html').addClass('raptor-ios');

            // Fixed position hack
            if (ios) {
                $(document).on('scroll', function(){
                    setInterval(function() {
                        $('body').css('height', '+=1').css('height', '-=1');
                    }, 0);
                });
            }
        }
        // </ios>

        firefox = /Firefox/i.test(navigator.userAgent);
        if (firefox) {
            $('html').addClass('raptor-ff');
        }

        // <ie>
        /**
         * Returns the version of Internet Explorer or a -1 (indicating the use of another browser).
         * http://obvcode.blogspot.co.nz/2007/11/easiest-way-to-check-ie-version-with.html
         */
        var ieVersion = (function() {
            var version = -1;
            if (navigator.appVersion.indexOf("MSIE") != -1) {
                version = parseFloat(navigator.appVersion.split("MSIE")[1]);
            }
            return version;
        })();

        ie = ieVersion !== -1;
        if (ie && ieVersion < 9) {
            supported = false;

            // Create message modal
            $(function() {
                var message = $('<div/>')
                    .addClass('raptor-unsupported')
                    .html(
                        '<div class="raptor-unsupported-overlay"></div>' +
                        '<div class="raptor-unsupported-content">' +
                        '    It has been detected that you a using a browser that is not supported by Raptor, please' +
                        '    use one of the following browsers:' +
                        '    <ul>' +
                        '        <li><a href="http://www.google.com/chrome">Google Chrome</a></li>' +
                        '        <li><a href="http://www.firefox.com">Mozilla Firefox</a></li>' +
                        '        <li><a href="http://windows.microsoft.com/ie">Internet Explorer</a></li>' +
                        '    </ul>' +
                        '    <div class="raptor-unsupported-input">' +
                        '        <button class="raptor-unsupported-close">Close</button>' +
                        '        <input name="raptor-unsupported-show" type="checkbox" />' +
                        '        <label>Don\'t show this message again</label>' +
                        '    </div>' +
                        '<div>'
                    )
                    .appendTo('body');

                /**
                 * Sets the z-index CSS property on an element to 1 above all its sibling elements.
                 *
                 * @param {jQuery} element The jQuery element to have it's z index increased.
                 */
                var elementBringToTop = function(element) {
                    var zIndex = 1;
                    element.siblings().each(function() {
                        var z = $(this).css('z-index');
                        if (!isNaN(z) && z > zIndex) {
                            zIndex = z + 1;
                        }
                    });
                    element.css('z-index', zIndex);
                }
                elementBringToTop(message);

                // Close event
                message.find('.raptor-unsupported-close').click(function() {
                    message.remove();
                });
            });
        }
        // </ie>

        hotkeys = jQuery.hotkeys !== undefined;
    }
    return supported;
}

// <ie>

/**
 * Object.create polyfill
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 */
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

/**
 * Node.TEXT_NODE polyfill
 */
if (typeof Node === 'undefined') {
    Node = {
        TEXT_NODE: 3
    };
}

/**
 * String.trim polyfill
 * https://gist.github.com/eliperelman/1035982
 */
''.trim || (String.prototype.trim = // Use the native method if available, otherwise define a polyfill:
    function () { // trim returns a new string (which replace supports)
        return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'') // trim the left and right sides of the string
    });

// </ie>

// <strict/>;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/support.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/raptor.js
/**
 * @class Raptor
 */
var Raptor =  {

    globalDefaults: {},
    defaults: {},

    /** @property {boolean} enableHotkeys True to enable hotkeys */
    enableHotkeys: true,

    /** @property {Object} hotkeys Custom hotkeys */
    hotkeys: {},

    /**
     * Plugins added via Raptor.registerPlugin
     * @property {Object} plugins
     */
    plugins: {},

    /**
     * UI added via Raptor.registerUi
     * @property {Object} ui
     */
    ui: {},

    /**
     * Layouts added via Raptor.registerLayout
     * @property {Object} layouts
     */
    layouts: {},

    /**
     * Presets added via Raptor.registerPreset
     * @property {Object} presets
     */
    presets: {},

    hoverPanels: {},

    /**
     * @property {Raptor[]} instances
     */
    instances: [],

    /**
     * @returns {Raptor[]}
     */
    getInstances: function() {
        return this.instances;
    },

    eachInstance: function(callback) {
        for (var i = 0; i < this.instances.length; i++) {
            callback.call(this.instances[i], this.instances[i]);
        }
    },

    /*========================================================================*\
     * Templates
    \*========================================================================*/
    /**
     * @property {String} urlPrefix
     */
    urlPrefix: '/raptor/',

    /**
     * @param {String} name
     * @returns {String}
     */
    getTemplate: function(name, urlPrefix) {
        var template;
        if (!this.templates[name]) {
            // Parse the URL
            var url = urlPrefix || this.urlPrefix;
            var split = name.split('.');
            if (split.length === 1) {
                // URL is for and editor core template
                url += 'templates/' + split[0] + '.html';
            } else {
                // URL is for a plugin template
                url += 'plugins/' + split[0] + '/templates/' + split.splice(1).join('/') + '.html';
            }

            // Request the template
            $.ajax({
                url: url,
                type: 'GET',
                async: false,
                // <debug/>
                // 15 seconds
                timeout: 15000,
                error: function() {
                    template = null;
                },
                success: function(data) {
                    template = data;
                }
            });
            // Cache the template
            this.templates[name] = template;
        } else {
            template = this.templates[name];
        }
        return template;
    },

    /*========================================================================*\
     * Helpers
    \*========================================================================*/

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty()) return true;
        }
        return false;
    },

    /**
     *
     */
    unloadWarning: function() {
        var instances = this.getInstances();
        for (var i = 0; i < instances.length; i++) {
            if (instances[i].isDirty() &&
                    instances[i].isEditing() &&
                    instances[i].options.unloadWarning) {
                return tr('navigateAway');
            }
        }
    },

    /*========================================================================*\
     * Plugins and UI
    \*========================================================================*/

    /**
     * Registers a new UI component, overriding any previous UI components registered with the same name.
     *
     * @param {String} name
     * @param {Object} ui
     */
    registerUi: function(ui) {
        // <strict/>
        this.ui[ui.name] = ui;
    },

    /**
     * Registers a new layout, overriding any previous layout registered with the same name.
     *
     * @param {String} name
     * @param {Object} layout
     */
    registerLayout: function(layout) {
        // <strict/>

        this.layouts[layout.name] = layout;
    },

    registerPlugin: function(plugin) {
        // <strict/>

        this.plugins[plugin.name] = plugin;
    },

    registerPreset: function(preset, setDefault) {
        // <strict/>

        this.presets[preset.name] = preset;
        if (setDefault) {
            this.defaults = preset;
        }
    },

    /*========================================================================*\
     * Persistance
    \*========================================================================*/
    /**
     * @param {String} key
     * @param {mixed} value
     * @param {String} namespace
     */
    persist: function(key, value, namespace) {
        key = namespace ? namespace + '.' + key : key;
        if (value === undefined) {
            return persistGet(key);
        }
        return persistSet(key, value);
    }

};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/raptor.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/raptor-widget.js
/**
 *
 * @author David Neilsen - david@panmedia.co.nz
 * @author Michael Robinson - michael@panmedia.co.nz
 * @version 0.1
 * @requires jQuery
 * @requires jQuery UI
 * @requires Rangy
 */

/**
 * Set to true when raptor is reloading the page after it has disabled editing.
 *
 * @type Boolean
 */
var disabledReloading = false;

/**
 * @class
 */
var RaptorWidget = {

    /**
     * @constructs RaptorWidget
     */
    _init: function() {
        // Prevent double initialisation
        if (this.element.attr('data-raptor-initialised')) {
            // <debug/>
            return;
        }
        this.element.attr('data-raptor-initialised', true);

        // Add the editor instance to the global list of instances
        if ($.inArray(this, Raptor.instances) === -1) {
            Raptor.instances.push(this);
        }

        var currentInstance = this;

        // <strict/>

        // Set the initial locale
        var locale = this.persist('locale') || this.options.initialLocale;
        if (locale) {
            currentLocale = locale;
        }

        var options = this.options;
        if (this.options.preset) {
            this.options = $.extend(true, {}, Raptor.globalDefaults, Raptor.presets[this.options.preset], this.options);
        } else {
            this.options = $.extend(true, {}, Raptor.globalDefaults, Raptor.defaults, this.options);
        }
        if (options.layouts && options.layouts.toolbar && options.layouts.toolbar.uiOrder) {
            this.options.layouts.toolbar.uiOrder = options.layouts.toolbar.uiOrder;
        }

        // Give the element a unique ID
        if (!this.element.attr('id')) {
            this.element.attr('id', elementUniqueId());
        }

        // Initialise properties
        this.ready = false;
        this.events = {};
        this.plugins = {};
        this.layouts = {};
        this.templates = $.extend({}, Raptor.templates);
        this.target = this.element;
        this.layout = null;
        this.previewState = null;
        this.pausedState = null;
        this.pausedScrollX = null;
        this.pausedScrollY = null;

        // True if editing is enabled
        this.enabled = false;

        // True if editing is enabled at least once
        this.initialised = false;

        // List of UI objects bound to the editor
        this.uiObjects = {};

        // List of hotkeys bound to the editor
        this.hotkeys = {};
        this.hotkeysSuspended = false;

        // If hotkeys are enabled, register any custom hotkeys provided by the user
        if (this.options.enableHotkeys) {
            this.registerHotkey(this.hotkeys);
        }

        // Bind default events
        for (var name in this.options.bind) {
            this.bind(stringFromCamelCase(name), this.options.bind[name]);
        }

        // Undo stack, redo pointer
        this.history = [];
        this.present = 0;
        this.historyEnabled = true;

        // Check for browser support
        if (!isSupported()) {
            // @todo If element isn't a textarea, replace it with one
            return;
        }

        // Store the original HTML
        this.setOriginalHtml(this.element.is(':input') ? this.element.val() : this.element.html());
        this.historyPush(this.getOriginalHtml());

        // Replace textareas/inputs with a div
        if (this.element.is(':input')) {
            this.replaceOriginal();
        }

        // Load plugins
        this.loadPlugins();

        // Stores if the current state of the content is clean
        this.dirty = false;

        // Stores the previous state of the content
        this.previousContent = null;

        // Stores the previous selection
        this.previousSelection = null;

        this.getElement().addClass('raptor-editable-block');

        this.loadLayouts();

        // Fire the ready event
        this.ready = true;
        this.fire('ready');

        // Automatically enable the editor if autoEnable is true
        if (this.options.autoEnable) {
            $(function() {
                currentInstance.enableEditing();
            });
        }
    },

    /*========================================================================*\
     * Core functions
    \*========================================================================*/

    /**
     * Attaches the editor's internal events.
     *
     * @fires RaptorWidget#resize
     */
    attach: function() {
        this.bind('change', this.historyPush);

        this.getElement().on('click.raptor', 'img', function(event) {
            selectionSelectOuter(event.target);
            this.checkSelectionChange();
        }.bind(this));
        this.getElement().on('focus.raptor', this.showLayout.bind(this));
        this.target.on('mouseup.raptor', this.checkSelectionChange.bind(this));
        this.target.on('input.raptor keyup.raptor mouseup.raptor', this.checkChangeDelayed.bind(this));

        // Unload warning
        $(window).bind('beforeunload', Raptor.unloadWarning.bind(Raptor));

        // Trigger editor resize when window is resized
        var editor = this;
        $(window).resize(function(event) {
            editor.fire('resize');
        });
    },

    /**
     * Detaches the editor's internal events.
     */
    detach: function() {
        this.unbind('change');
        this.getElement().off('click.raptor', 'img');
        this.getElement().off('focus.raptor');
        this.getElement().blur();

        this.target.off('mouseup.raptor');
        this.target.off('keyup.raptor');
    },

    /**
     * Reinitialises the editor, unbinding all events, destroys all UI and plugins
     * then recreates them.
     */
    localeChange: function() {
        if (!this.ready) {
            // If the edit is still initialising, wait until its ready
            var localeChange;
            localeChange = function() {
                // Prevent reinit getting called twice
                this.unbind('ready', localeChange);
                this.localeChange();
            };
            this.bind('ready', localeChange);
            return;
        }

        this.actionPreviewRestore();
        var visibleLayouts = [];
        for (var name in this.layouts) {
            if (this.layouts[name].isVisible()) {
                visibleLayouts.push(name);
            }
        }
        this.layoutsDestruct();
        this.events = {};
        this.plugins = {};
        this.uiObjects = {};
        this.hotkeys = {};
        this.loadPlugins();
        this.loadLayouts();
        for (var i = 0; i < visibleLayouts.length; i++) {
            this.layouts[visibleLayouts[i]].show();
        }
        this.checkSelectionChange();
    },

    /**
     * Restore focus to the element being edited.
     */
    restoreFocus: function() {
        this.getElement().focus();
    },

    /**
     * Returns the current content editable element, which will be either the
     * orignal element, or the div the orignal element was replaced with.
     * @returns {jQuery} The current content editable element
     */
    getElement: function() {
        return this.target;
    },

    getNode: function() {
        return this.target[0];
    },

    /**
     *
     */
    getOriginalElement: function() {
        return this.element;
    },

    /**
     * Replaces the original element with a content editable div. Typically used
     * to replace a textarea.
     */
    replaceOriginal: function() {
        if (!this.target.is(':input')) return;

        // Create the replacement div
        var target = $('<div/>')
            // Set the HTML of the div to the HTML of the original element, or if the original element was an input, use its value instead
            .html(this.element.val())
            // Insert the div before the original element
            .insertBefore(this.element)
            // Give the div a unique ID
            .attr('id', elementUniqueId())
            // Copy the original elements class(es) to the replacement div
            .addClass(this.element.attr('class'))
            // Add custom classes
            .addClass(this.options.classes);

        var style = elementGetStyles(this.element);
        for (var i = 0; i < this.options.replaceStyle.length; i++) {
            target.css(this.options.replaceStyle[i], style[this.options.replaceStyle[i]]);
        }

        this.element.hide();
        this.bind('change', function() {
            if (this.getOriginalElement().is(':input')) {
                this.getOriginalElement().val(this.getHtml()).trigger('input');
            } else {
                this.getOriginalElement().html(this.getHtml());
            }
        });

        this.target = target;
    },

    checkSelectionChange: function() {
        // Check if the caret has changed position
        var currentSelection = rangy.serializeSelection(null, false);
        if (this.previousSelection !== currentSelection) {
            this.fire('selectionChange');
        }
        this.previousSelection = currentSelection;
    },

    checkChangeTimer: null,
    checkChangeCount: 0,
    checkChangeDelayed: function() {
        if (this.checkChangeTimer !== null) {
            clearTimeout(this.checkChangeTimer);
            this.checkChangeTimer = null;
        }
        if (this.checkChangeCount++ < 10) {
            this.checkChangeTimer = setTimeout(this.checkChange.bind(this), 200);
        } else {
            this.checkChange();
        }
    },

    /**
     * Determine whether the editing element's content has been changed.
     */
    checkChange: function() {
        this.checkChangeCount = 0;

        // Get the current content
        var currentHtml = this.getHtml();

        // Check if the dirty state has changed
        var wasDirty = this.dirty;

        // Check if the current content is different from the original content
        this.dirty = this.originalHtml !== currentHtml;

        // If the current content has changed since the last check, fire the change event
        if (this.previousHtml !== currentHtml) {
            this.previousHtml = currentHtml;
            this.fire('change', [currentHtml]);

            // If the content was changed to its original state, fire the cleaned event
            if (wasDirty !== this.dirty) {
                if (this.dirty) {
                    this.fire('dirty');
                } else {
                    this.fire('cleaned');
                }
            }

            this.checkSelectionChange();
        }
    },

    change: function() {
        this.fire('change', [
            this.getHtml()
        ]);
    },

    /*========================================================================*\
     * Destructor
    \*========================================================================*/

    /**
     * Hides the toolbar, disables editing, and fires the destroy event, and unbinds any events.
     * @public
     */
    destruct: function(reinitialising) {
        this.disableEditing();

        // Trigger destroy event, for plugins to remove them selves
        this.fire('destroy');

        // Remove all event bindings
        this.events = {};

        // Unbind all events
        this.getElement().off('.raptor');

        if (this.getOriginalElement().is(':input')) {
            this.target.remove();
            this.target = null;
            this.element.show();
        }

        this.layoutsDestruct();
    },

    /**
     * Runs destruct, then calls the UI widget destroy function.
     * @see $.
     */
//    destroy: function() {
//        this.destruct();
//        $.Widget.prototype.destroy.call(this);
//    },

    /*========================================================================*\
     * Preview functions
    \*========================================================================*/

    actionPreview: function(action) {
        this.actionPreviewRestore();
        try {
            var ranges = this.fire('selectionCustomise');
            if (ranges.length > 0) {
                this.previewState = actionPreview(this.previewState, this.target, function() {
                    for (var i = 0, l = ranges.length; i < l; i++) {
                        rangy.getSelection().setSingleRange(ranges[i]);
                        this.selectionConstrain();
                        action();
                    }
                }.bind(this));
            } else {
                this.selectionConstrain();
                this.previewState = actionPreview(this.previewState, this.target, action);
            }
            this.checkSelectionChange();
        } catch (exception) {
            // <strict/>
        }
    },

    actionPreviewRestore: function() {
        if (this.previewState) {
            this.target = actionPreviewRestore(this.previewState, this.target);
            this.previewState = null;
            this.checkSelectionChange();
        }
    },

    actionApply: function(action) {
        this.actionPreviewRestore();
        var state = this.stateSave();
        try {
            var ranges = this.fire('selectionCustomise');
            if (ranges.length > 0) {
                actionApply(function() {
                    for (var i = 0, l = ranges.length; i < l; i++) {
                        rangy.getSelection().setSingleRange(ranges[i]);
                        this.selectionConstrain();
                        actionApply(action, this.history);
                    }
                }.bind(this), this.history);
            } else {
                this.selectionConstrain();
                actionApply(action, this.history);
            }
            this.checkChange();
        } catch (exception) {
            this.stateRestore(state);
            // <strict/>
        }
    },

    actionUndo: function() { },

    actionRedo: function() { },

    stateSave: function() {
        this.selectionConstrain();
        return stateSave(this.target);
    },

    stateRestore: function(state) {
        // if (!this.isEditing()) {
        //     return;
        // }
        var restoredState = stateRestore(this.target, state),
            selection = rangy.getSelection();
        this.target = restoredState.element;
        if (restoredState.ranges !== null) {
            selection.setRanges(restoredState.ranges);
            selection.refresh();
        }
    },

    selectionConstrain: function() {
        selectionConstrain(this.target[0]);
    },

    pause: function() {
        if (!this.pausedState) {
            this.pausedState = this.stateSave()
            this.suspendHotkeys();
            // <jquery-ui>
            // Hack to fix when a dialog is closed, the editable element is focused, and the scroll jumps to the top
            this.pausedScrollX = window.scrollX;
            this.pausedScrollY = window.scrollY;
            // </jquery-ui>
        }
    },

    resume: function() {
        if (this.pausedState) {
            this.stateRestore(this.pausedState);
            this.pausedState = null;
            this.resumeHotkeys();
            this.restoreFocus();
            // <jquery-ui>
            window.scrollTo(this.pausedScrollX, this.pausedScrollY);
            // </jquery-ui>
        }
    },

    /*========================================================================*\
     * Persistance Functions
    \*========================================================================*/

    /**
     * @param {String} key
     * @param {mixed} [value]
     * @returns {mixed}
     */
    persist: function(key, value) {
        if (!this.options.persistence) return null;
        return Raptor.persist(key, value, this.options.namespace);
    },

    /*========================================================================*\
     * Other Functions
    \*========================================================================*/

    /**
     *
     */
    enableEditing: function() {
        if (!this.enabled) {
            this.fire('enabling');

            // Attach core events
            this.attach();

            this.enabled = true;

            this.getElement()
                .addClass(this.options.baseClass + '-editing')
                .addClass(this.options.classes);

            if (this.options.partialEdit) {
                this.getElement().find(this.options.partialEdit).prop('contenteditable', true);
            } else {
                this.getElement().prop('contenteditable', true);
            }

            if (!this.initialised) {
                this.initialised = true;
//                try {
//                    document.execCommand('enableInlineTableEditing', false, false);
//                    document.execCommand('styleWithCSS', true, true);
//                } catch (error) {
//                    // <strict/>
//                }

                for (var name in this.plugins) {
                    this.plugins[name].enable();
                }

                this.bindHotkeys();

                this.getElement().closest('form').on('submit.raptor', function() {
                    clean(this.getElement());
                    this.fire('change', [this.getHtml()]);
                }.bind(this));
            }

            clean(this.getElement());
            this.fire('enabled');
            this.showLayout();

            var selectNode = this.options.partialEdit ? this.getElement().find('[contenteditable]')[0] : this.getNode();
            switch (this.options.autoSelect) {
                case 'all': {
                    selectionSelectInner(selectNode);
                    break;
                }
                case 'start': {
                    var selectInnerNode = $(selectNode).find('*:first')[0];
                    if (!selectInnerNode) {
                        selectionSelectInner(selectNode);
                        break;
                    }
                    var range = rangy.createRange();
                    range.setStartBefore(selectInnerNode);
                    range.setEndBefore(selectInnerNode);
                    selectionSet(range);
                    break;
                }
                case 'end': {
                    var selectInnerNode = $(selectNode).find('*:last')[0];
                    if (!selectInnerNode) {
                        selectionSelectInner(selectNode);
                        break;
                    }
                    selectionSelectInner(selectInnerNode);
                    var range = rangy.createRange();
                    range.setStartAfter(selectInnerNode);
                    range.setEndAfter(selectInnerNode);
                    selectionSet(range);
                    break;
                }
            }
        }
    },

    /**
     *
     */
    disableEditing: function() {
        if (this.enabled) {
            this.detach();
            this.enabled = false;
            this.getElement()
                .prop('contenteditable', false)
                .removeClass(this.options.baseClass + '-editing')
                .removeClass(this.options.classes);
            rangy.getSelection().removeAllRanges();
            this.fire('disabled');
            if (this.options.reloadOnDisable && !disabledReloading) {
                disabledReloading = true;
                window.location.reload();
            }
        }
    },

    cancelEditing: function() {
        this.unify(function(raptor) {
            raptor.stopEditing();
        });
    },

    stopEditing: function() {
        this.fire('cancel');
        if (!this.options.reloadOnDisable) {
            this.resetHtml();
        }
        this.disableEditing();
        this.dirty = false;
        selectionDestroy();
    },

    /**
     *
     * @returns {boolean}
     */
    isEditing: function() {
        return this.enabled;
    },

    /**
     * @param {jQuerySelector|jQuery|Element} element
     * @returns {boolean}
     */
    isRoot: function(element) {
        return this.getElement()[0] === $(element)[0];
    },

    /**
     * @param {function} callback
     * @param {boolean} [callSelf]
     */
    unify: function(callback, callSelf) {
        if (callSelf !== false) {
            callback(this);
        }
        if (this.options.unify) {
            var currentInstance = this;
            Raptor.eachInstance(function(instance) {
                if (instance === currentInstance) {
                    return;
                }
                if (instance.options.unify) {
                    callback(instance);
                }
            });
        }
    },

    /*========================================================================*\
     * Layout
    \*========================================================================*/
    getLayout: function(type) {
        // <strict/>
        return this.layouts[type];
    },

    loadLayouts: function() {
        for (var name in this.options.layouts) {
            if (typeof Raptor.layouts[name] === 'undefined') {
                // <strict/>
                continue;
            }
            this.layouts[name] = this.prepareComponent(Raptor.layouts[name], this.options.layouts[name], 'layout').instance;

            if (this.layouts[name].hotkeys) {
                this.registerHotkey(this.layouts[name].hotkeys, null, this.layouts[name]);
            }
        }
    },

    layoutsDestruct: function() {
        for (var name in this.layouts) {
            this.layouts[name].destruct();
        }
    },

    prepareComponent: function(component, componentOptions, prefix) {
        var instance = $.extend({}, component);

        var options = $.extend({}, instance.options, this.options, {
            baseClass: this.options.baseClass + '-' + prefix + '-' + stringFromCamelCase(component.name)
        }, componentOptions);

        instance.raptor = this;
        instance.options = options;
        // <strict/>
        var init = instance.init();

        return {
            init: init,
            instance: instance
        };
    },

    /**
     * Show the layout for the current element.
     */
    showLayout: function() {
        // <debug/>

        // If unify option is set, hide all other layouts first
        this.unify(function(raptor) {
            raptor.fire('layoutHide');
        }, false);

        this.fire('layoutShow');

        this.fire('resize');
        if (typeof this.getElement().attr('tabindex') === 'undefined') {
            this.getElement().attr('tabindex', -1);
        }
    },

    /*========================================================================*\
     * Template functions
    \*========================================================================*/

    /**
     * @param {String} name
     * @param {Object} variables
     */
    getTemplate: function(name, variables) {
        if (!this.templates[name]) {
            this.templates[name] = templateGet(name, this.options.urlPrefix);
        }
        // <strict/>
        return templateConvertTokens(this.templates[name], variables);
    },

    /*========================================================================*\
     * History functions
    \*========================================================================*/

    /**
     *
     */
    historyPush: function() {
        if (!this.historyEnabled) return;
        var html = this.getHtml();
        if (html !== this.historyPeek()) {
            // Reset the future on change
            if (this.present !== this.history.length - 1) {
                this.history = this.history.splice(0, this.present + 1);
            }

            // Add new HTML to the history
            this.history.push(this.getHtml());

            // Mark the persent as the end of the history
            this.present = this.history.length - 1;

            this.fire('historyChange');
        }
    },

    /**
     * @returns {String|null}
     */
    historyPeek: function() {
        if (!this.history.length) return null;
        return this.history[this.present];
    },

    /**
     *
     */
    historyBack: function() {
        if (this.present > 0) {
            this.present--;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
            this.fire('historyChange');
        }
    },

    /**
     *
     */
    historyForward: function() {
        if (this.present < this.history.length - 1) {
            this.present++;
            this.setHtml(this.history[this.present]);
            this.historyEnabled = false;
            this.change();
            this.historyEnabled = true;
            this.fire('historyChange');
        }
    },

    /*========================================================================*\
     * Hotkeys
    \*========================================================================*/

    /**
     * @param {Array|String} mixed The hotkey name or an array of hotkeys
     * @param {Object} The hotkey object or null
     */
    registerHotkey: function(mixed, action) {
        // <strict/>

        this.hotkeys[mixed] = action;
    },

    bindHotkeys: function() {
        for (var keyCombination in this.hotkeys) {
            this.getElement().on('keydown.raptor', keyCombination, function(event) {
                if (this.isEditing() && !this.hotkeysSuspended) {
                    var result = this.hotkeys[event.data]();
                    if (result !== false) {
                        event.preventDefault();
                    }
                }
            }.bind(this));
        }
    },

    /**
     * Suspend hotkey functionality.
     */
    suspendHotkeys: function() {
        // <debug/>
        this.hotkeysSuspended = true;
    },

    /**
     * Resume hotkey functionality.
     */
    resumeHotkeys: function() {
        // <debug/>
        this.hotkeysSuspended = false;
    },

    /*========================================================================*\
     * Buttons
    \*========================================================================*/

    isUiEnabled: function(ui) {
        // Check if we are not automatically enabling UI, and if not, check if the UI was manually enabled
        if (this.options.enableUi === false &&
                typeof this.options.plugins[ui] === 'undefined' ||
                this.options.plugins[ui] === false) {
            // <debug/>
            return false;
        }

        // Check if we have explicitly disabled UI
        if ($.inArray(ui, this.options.disabledUi) !== -1 ||
                $.inArray(ui, this.options.disabledPlugins) !== -1) {
            // <strict/>
            return false;
        }

        return true;
    },

    /**
     * @deprecated
     * @param  {String} ui Name of the UI object to be returned.
     * @return {Object|null} UI object referenced by the given name.
     */
    getUi: function(ui) {
        // <strict/>
        return this.uiObjects[ui];
    },

    /*========================================================================*\
     * Plugins
    \*========================================================================*/
    /**
     * @param {String} name
     * @return {Object|undefined} plugin
     */
    getPlugin: function(name) {
        return this.uiObjects[name] || this.plugins[name];
    },

    /**
     *
     */
    loadPlugins: function() {
        var editor = this;

        if (!this.options.plugins) {
            this.options.plugins = {};
        }

        for (var name in Raptor.plugins) {
            // Check if we are not automaticly enabling plugins, and if not, check if the plugin was manually enabled
            if (this.options.enablePlugins === false &&
                    typeof this.options.plugins[name] === 'undefined' ||
                    this.options.plugins[name] === false) {
                // <debug/>
                continue;
            }

            // Check if we have explicitly disabled the plugin
            if ($.inArray(name, this.options.disabledUi) !== -1 ||
                    $.inArray(name, this.options.disabledPlugins) !== -1) {
                // <strict/>
                continue;
            }

            editor.plugins[name] = this.prepareComponent(Raptor.plugins[name], editor.options.plugins[name], 'plugin').instance;
        }
    },

    /*========================================================================*\
     * Content accessors
    \*========================================================================*/

    /**
     * @returns {boolean}
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @returns {String}
     */
    getHtml: function() {
        return this.getElement().html();
    },

    clean: function() {
        this.actionApply(function() {
            clean(this.getElement());
        }.bind(this));
    },

    /**
     * @param {String} html
     */
    setHtml: function(html) {
        this.getElement().html(html);
        this.fire('html');
        this.checkChange();
    },

    /**
     *
     */
    resetHtml: function() {
        this.setHtml(this.getOriginalHtml());
        this.fire('cleaned');
    },

    /**
     * @returns {String}
     */
    getOriginalHtml: function() {
        return this.originalHtml;
    },

    /**
     *
     */
    saved: function(args) {
        this.setOriginalHtml(this.getHtml());
        this.dirty = false;
        this.fire('saved', args);
        this.fire('cleaned');
    },

    /**
     * @param {String} html
     */
    setOriginalHtml: function(html) {
        this.originalHtml = html;
    },

    /*========================================================================*\
     * Event handling
    \*========================================================================*/
    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    bind: function(name, callback, context) {
        // <strict/>
        var names = name.split(/,\s*/);
        for (var i = 0, l = names.length; i < l; i++) {
            if (!this.events[names[i]]) {
                this.events[names[i]] = [];
            }
            this.events[names[i]].push({
                context: context,
                callback: callback
            });
        }
    },

    /**
     * @param {String} name
     * @param {function} callback
     * @param {Object} [context]
     */
    unbind: function(name, callback, context) {
        for (var i = 0, l = this.events[name].length; i < l; i++) {
            if (this.events[name][i] &&
                this.events[name][i].callback === callback &&
                this.events[name][i].context === context) {
                this.events[name].splice(i, 1);
            }
        }
    },

    /**
     * @param {String} name
     * @param {boolean} [global]
     * @param {boolean} [sub]
     */
    fire: function(name, args) {
        var result = [];

        // <debug/>

        if (this.events[name]) {
            for (var i = 0, l = this.events[name].length; i < l; i++) {
                var event = this.events[name][i];
                if (typeof event !== 'undefined' &&
                        typeof event.callback !== 'undefined') {
                    var currentResult = event.callback.apply(event.context || this, args);
                    if (typeof currentResult !== 'undefined') {
                        result = result.concat(currentResult);
                    }
                }
            }
        }

        return result;
    }
};

$.widget('ui.raptor', RaptorWidget);
$.fn.raptor.Raptor = Raptor;;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/raptor-widget.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout.js
function RaptorLayout(name) {
    this.name = name;
}

RaptorLayout.prototype.init = function() {
};

RaptorLayout.prototype.destruct = function() {
};

RaptorLayout.prototype.isVisible = function() {
    return false;
};

RaptorLayout.prototype.show = function() {
};

RaptorLayout.prototype.hide = function() {
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/plugin.js
/**
 * @fileOverview Contains the raptor plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The raptor plugin class.
 *
 * @todo type and desc for name.
 * @param {type} name
 * @param {Object} overrides Options hash.
 * @returns {RaptorPlugin}
 */
function RaptorPlugin(name, overrides) {
    this.name = name;
    for (var key in overrides) {
        this[key] = overrides[key];
    }
}

/**
 * Initialize the raptor plugin.
 */
RaptorPlugin.prototype.init = function() {};

/**
 * Enable the raptor plugin.
 */
RaptorPlugin.prototype.enable = function() {};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/ui-group.js
function UiGroup(raptor, uiOrder) {
    this.raptor = raptor;
    this.uiOrder = uiOrder;
};

UiGroup.prototype.appendTo = function(layout, panel) {
    // Loop the UI component order option
    for (var i = 0, l = this.uiOrder.length; i < l; i++) {
        var uiGroupContainer = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout-toolbar-group');

        // Loop each UI in the group
        var uiGroup = this.uiOrder[i];
        for (var ii = 0, ll = uiGroup.length; ii < ll; ii++) {
            // Check if the UI component has been explicitly disabled
            if (!this.raptor.isUiEnabled(uiGroup[ii])) {
                continue;
            }

            // Check the UI has been registered
            if (Raptor.ui[uiGroup[ii]]) {
                var uiOptions = this.raptor.options.plugins[uiGroup[ii]];
                if (uiOptions === false) {
                    continue;
                }

                var component = this.raptor.prepareComponent(Raptor.ui[uiGroup[ii]], uiOptions, 'ui');
                component.instance.layout = layout;

                this.raptor.uiObjects[uiGroup[ii]] = component.instance;

                if (typeIsElement(component.init)) {
                    // Fix corner classes
                    component.init.removeClass('ui-corner-all');

                    // Append the UI object to the group
                    uiGroupContainer.append(component.init);
                }
            }
            // <strict/>
        }

        // Append the UI group to the editor toolbar
        if (uiGroupContainer.children().length > 0) {
            uiGroupContainer.appendTo(panel);
        }
    }

    // Fix corner classes
    panel.find('.ui-button:first-child').addClass('ui-corner-left');
    panel.find('.ui-button:last-child').addClass('ui-corner-right');
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/ui-group.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/toolbar.js
/**
 * @fileOverview Toolbar layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

function ToolbarLayout() {
    RaptorLayout.call(this, 'toolbar');
    this.wrapper = null;
}

ToolbarLayout.prototype = Object.create(RaptorLayout.prototype);

ToolbarLayout.prototype.init = function() {
    this.raptor.bind('enabled', this.show.bind(this));
    this.raptor.bind('disabled', this.hide.bind(this));
    this.raptor.bind('layoutShow', this.show.bind(this));
    this.raptor.bind('layoutHide', this.hide.bind(this));
    $(window).resize(this.constrainPosition.bind(this));
};

ToolbarLayout.prototype.destruct = function() {
    if (this.wrapper) {
        this.wrapper.remove();
        this.wrapper = null;
    }
    this.raptor.fire('toolbarDestroy');
};

/**
 * Show the toolbar.
 *
 * @fires RaptorWidget#toolbarShow
 */
ToolbarLayout.prototype.show = function() {
    if (!this.isVisible()) {
        this.getElement().css('display', '');
        this.constrainPosition();
        if (this.raptor.getElement().zIndex() > this.getElement().zIndex()) {
            this.getElement().css('z-index', this.raptor.getElement().zIndex() + 1);
        } else {
            this.getElement().css('z-index', null);
        }
        this.raptor.fire('toolbarShow');
    }
};

/**
 * Hide the toolbar.
 *
 * @fires RaptorWidget#toolbarHide
 */
ToolbarLayout.prototype.hide = function() {
    if (this.isReady()) {
        this.getElement().css('display', 'none');
        this.raptor.fire('toolbarHide');
    }
};

ToolbarLayout.prototype.initDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            !this.getElement().data('ui-draggable')) {
        // <debug/>
        this.getElement().draggable({
            cancel: 'a, button',
            cursor: 'move',
            stop: this.constrainPosition.bind(this)
        });
        // Remove the relative position
        this.getElement().css('position', 'fixed');

        // Set the persistent position
        var pos = this.raptor.persist('position') || this.options.dialogPosition;

        if (!pos) {
            pos = [10, 10];
        }

        // <debug/>

        if (parseInt(pos[0], 10) + this.getElement().outerHeight() > $(window).height()) {
            pos[0] = $(window).height() - this.getElement().outerHeight();
        }
        if (parseInt(pos[1], 10) + this.getElement().outerWidth() > $(window).width()) {
            pos[1] = $(window).width() - this.getElement().outerWidth();
        }

        this.getElement().css({
            top: Math.abs(parseInt(pos[0], 10)),
            left: Math.abs(parseInt(pos[1], 10))
        });
    }
};

ToolbarLayout.prototype.enableDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            this.getElement().data('ui-draggable')) {
        this.getElement().draggable('enable');
    }
};

ToolbarLayout.prototype.disableDragging = function() {
    if ($.fn.draggable &&
            this.options.draggable &&
            this.getElement().is('.ui-draggable')) {
        this.getElement().draggable('disable').removeClass('ui-state-disabled');
    }
};

ToolbarLayout.prototype.isReady = function() {
    return this.wrapper !== null;
};

ToolbarLayout.prototype.isVisible = function() {
    return this.isReady() && this.getElement().is(':visible');
};

ToolbarLayout.prototype.constrainPosition = function() {
    if (this.isVisible()) {
        var x = parseInt(this.wrapper.css('left')) || -999,
            y = parseInt(this.wrapper.css('top')) || -999,
            width = this.wrapper.outerWidth(),
            height = this.wrapper.outerHeight(),
            windowWidth = $(window).width(),
            windowHeight = $(window).height(),
            newX = Math.max(0, Math.min(x, windowWidth - width)),
            newY = Math.max(0, Math.min(y, windowHeight - height));

        if (newX !== x || newY !== y) {
            this.wrapper.css({
                left: newX,
                top: newY
            });
        }

        // Save the persistent position
        this.raptor.persist('position', [
            this.wrapper.css('top'),
            this.wrapper.css('left')
        ]);
    }
};

ToolbarLayout.prototype.getElement = function() {
    if (this.wrapper === null) {
        // Load all UI components if not supplied
        if (!this.options.uiOrder) {
            this.options.uiOrder = [[]];
            for (var name in Raptor.ui) {
                this.options.uiOrder[0].push(name);
            }
        }

        // <debug/>

        var toolbar = this.toolbar = $('<div/>')
            .addClass(this.options.baseClass + '-toolbar');
        var innerWrapper = this.toolbarWrapper = $('<div/>')
            .addClass(this.options.baseClass + '-inner')
            .addClass('ui-widget-content')
            .mousedown(function(event) {
                event.preventDefault();
            })
            .append(toolbar);
        var path = this.path = $('<div/>')
            .addClass(this.options.baseClass + '-path')
            .addClass('ui-widget-header');
        var wrapper = this.wrapper = $('<div/>')
            .addClass(this.options.baseClass + '-outer ' + this.raptor.options.baseClass + '-layout')
            .css('display', 'none')
            .append(path)
            .append(innerWrapper);

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.toolbar);
        $('<div/>').css('clear', 'both').appendTo(this.toolbar);

        $(function() {
            wrapper.appendTo('body');
            this.initDragging();
            this.constrainPosition(true);
            this.raptor.fire('layoutReady', [this.wrapper]);
            this.raptor.fire('toolbarReady', [this]);
        }.bind(this));
    }
    return this.wrapper;
};

Raptor.registerLayout(new ToolbarLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/toolbar.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/hover-panel.js
/**
 * @fileOverview Hover panel layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 */

function HoverPanelLayout() {
    RaptorLayout.call(this, 'hoverPanel');
    this.hoverPanel = null;
    this.visible = false;
}

HoverPanelLayout.prototype = Object.create(RaptorLayout.prototype);

HoverPanelLayout.prototype.init = function() {
    this.raptor.bind('ready', this.ready.bind(this));
    this.raptor.bind('enabled', this.enabled.bind(this));
};

HoverPanelLayout.prototype.ready = function() {
    this.raptor.getElement()
        .mouseenter(this.show.bind(this))
        .mouseleave(this.hide.bind(this));
};

HoverPanelLayout.prototype.enabled = function() {
    this.getElement().hide();
};

HoverPanelLayout.prototype.getElement = function() {
    if (this.hoverPanel === null) {
        this.hoverPanel = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout ' + this.options.baseClass)
            .mouseleave(this.hide.bind(this));

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.hoverPanel);

        $(window).bind('scroll', this.position.bind(this));

        this.hoverPanel
            .appendTo('body');

        this.raptor.fire('layoutReady', [this.hoverPanel]);
    }
    return this.hoverPanel;
};

HoverPanelLayout.prototype.show = function(event) {
    if (!this.raptor.isEditing()) {
        this.visible = true;
        this.getElement().show();
        if (this.raptor.getElement().zIndex() > this.getElement().zIndex()) {
            this.getElement().css('z-index', this.raptor.getElement().zIndex() + 1);
        } else {
            this.getElement().css('z-index', null);
        }
        this.position();
        this.raptor.getElement().addClass(this.raptor.options.baseClass + '-editable-block-hover');
    }
};

HoverPanelLayout.prototype.hide = function(event) {
    if (!this.visible) {
        return;
    }
    if (!event) {
        return;
    }
    if ($.contains(this.getElement().get(0), event.relatedTarget)) {
        return;
    }
    if (event.relatedTarget === this.getElement().get(0)) {
        return;
    }
    if (this.getElement().get(0) === $(event.relatedTarget).parent().get(0)) {
        return;
    }
    if ($.contains(this.raptor.getElement().get(0), event.relatedTarget)) {
        return;
    }
    if (event.relatedTarget === this.raptor.getElement().get(0)) {
        return;
    }
    this.visible = false;
    this.getElement().hide();
    this.raptor.getElement().removeClass(this.raptor.options.baseClass + '-editable-block-hover');
};

HoverPanelLayout.prototype.position = function() {
    if (this.visible) {
        var visibleRect = elementVisibleRect(this.raptor.getElement());
        this.getElement().css({
            // Calculate offset center for the hoverPanel
            top:  visibleRect.top  + ((visibleRect.height / 2) - (this.getElement().outerHeight() / 2)),
            left: visibleRect.left + ((visibleRect.width / 2)  - (this.getElement().outerWidth()  / 2))
        });
    }
};

HoverPanelLayout.prototype.destruct = function() {
    if (this.hoverPanel) {
        this.hoverPanel.remove();
        this.hoverPanel = null;
    }
    this.visible = false;
};

Raptor.registerLayout(new HoverPanelLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/hover-panel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/element-hover-panel.js
/**
 * @fileOverview Element hover panel layout.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */

function ElementHoverPanelLayout() {
    RaptorLayout.call(this, 'elementHoverPanel');
    this.elements = 'img';
    this.hoverPanel = null;
    this.visible = false;
    this.target = null;
    this.enabled = true;
}

ElementHoverPanelLayout.prototype = Object.create(RaptorLayout.prototype);

ElementHoverPanelLayout.prototype.init = function() {
    this.raptor.bind('ready', this.ready.bind(this));
};

ElementHoverPanelLayout.prototype.ready = function() {
    this.raptor.getElement()
        .on('mouseenter', this.options.elements, this.show.bind(this))
        .on('mouseleave', this.options.elements, this.hide.bind(this));
};

ElementHoverPanelLayout.prototype.getElement = function() {
    if (this.hoverPanel === null) {
        this.hoverPanel = $('<div/>')
            .addClass(this.raptor.options.baseClass + '-layout raptor-layout-hover-panel ' + this.options.baseClass)
            .mouseleave(this.hide.bind(this));

        var uiGroup = new UiGroup(this.raptor, this.options.uiOrder);
        uiGroup.appendTo(this, this.hoverPanel);

        $(window).bind('scroll', this.position.bind(this));

        this.hoverPanel
            .appendTo('body');

        this.raptor.fire('layoutReady', [this.hoverPanel]);
    }
    return this.hoverPanel;
};

ElementHoverPanelLayout.prototype.show = function(event) {
    if (this.enabled && this.raptor.isEditing()) {
        this.target = event.target;
        this.visible = true;
        elementPositionOver(this.getElement().show(), $(this.target));
    }
};

ElementHoverPanelLayout.prototype.hide = function(event) {
    if (!this.visible) {
        return;
    }
    if (event) {
        if ($.contains(this.getElement().get(0), event.relatedTarget)) {
            return;
        }
        if (event.relatedTarget === this.getElement().get(0)) {
            return;
        }
        if (this.getElement().get(0) === $(event.relatedTarget).parent().get(0)) {
            return;
        }
        if ($.contains(this.raptor.getElement().get(0), event.relatedTarget)) {
            return;
        }
        if (event.relatedTarget === this.raptor.getElement().get(0)) {
            return;
        }
    }
    this.visible = false;
    this.getElement().hide();
};

ElementHoverPanelLayout.prototype.close = function() {
    if (this.visible) {
        this.enabled = false;
        this.visible = false;
        this.getElement().hide();
        setTimeout(function() {
            this.enabled = true;
        }.bind(this), 1000);
    }
};

ElementHoverPanelLayout.prototype.position = function() {
    if (this.visible) {
        elementPositionOver(this.getElement(), $(this.target));
    }
};

ElementHoverPanelLayout.prototype.destruct = function() {
    if (this.hoverPanel) {
        this.hoverPanel.remove();
        this.hoverPanel = null;
    }
    this.visible = false;
};

Raptor.registerLayout(new ElementHoverPanelLayout());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/layout/element-hover-panel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/button.js
/**
 * @fileOverview Contains the core button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The core button class.
 *
 * @param {Object} overrides Options hash.
 */
function Button(overrides) {
    this.text = false;
    this.label = null;
    this.icon = null;
    this.hotkey = null;
    for (var key in overrides) {
        this[key] = overrides[key];
    }
}

/**
 * Initialize the button.
 *
 * @return {Element}
 */
Button.prototype.init = function() {
    // Bind hotkeys
    if (typeof this.hotkey === 'string') {
        this.raptor.registerHotkey(this.hotkey, this.action.bind(this));
    } else if (typeIsArray(this.hotkey)) {
        for (var i = 0, l = this.hotkey.length; i < l; i++) {
            this.raptor.registerHotkey(this.hotkey[i], this.action.bind(this));
        }
    }

    // Return the button
    return this.getButton();
};

/**
 * Prepare and return the button Element to be used in the Raptor UI.
 *
 * @return {Element}
 */
Button.prototype.getButton = function() {
    if (!this.button) {
        var text = this.text || this.translate('Text', false);
        this.button = $('<div>')
            .html(text)
            .addClass(this.options.baseClass)
            .attr('title', this.getTitle())
            .click(this.click.bind(this));
        aButton(this.button, {
            icons: {
                primary: this.getIcon()
            },
            text: text,
            label: this.label
        });
    }
    return this.button;
};

/**
 * @return {String} The button's title property value, or if not present then the
 *   localized value for the button's name + Title.
 */
Button.prototype.getTitle = function() {
    return this.title || this.translate('Title');
};

/**
 * @return {String} The button's icon property value, or the ui-icon- prefix
 *   with the button's camel cased name appended.
 */
Button.prototype.getIcon = function() {
    if (this.icon === null) {
        return 'ui-icon-' + stringFromCamelCase(this.name);
    }
    return this.icon;
};

/**
 * Perform the button's action.
 *
 * @todo this probably should not nest actions
 */
Button.prototype.click = function() {
    if (aButtonIsEnabled(this.button)) {
        this.raptor.actionApply(this.action.bind(this));
    }
};

Button.prototype.translate = function(translation, variables) {
    return tr(this.name + translation, variables);
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-button.js
/**
 * @fileOverview Contains the preview button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The preview button class.
 *
 * @constructor
 * @augments Button
 *
 * @param {Object} options
 */
function PreviewButton(options) {
    this.previewing = false;
    this.previewTimer = null;
    this.options = {
        preview: true,
        previewTimeout: 500
    };
    Button.call(this, options);
}

PreviewButton.prototype = Object.create(Button.prototype);

/**
 * Prepare and return the preview button Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
PreviewButton.prototype.getButton = function() {
    if (!this.button) {
        this.button = Button.prototype.getButton.call(this)
            .mouseenter(this.mouseEnter.bind(this))
            .mouseleave(this.mouseLeave.bind(this));
    }
    return this.button;
};

PreviewButton.prototype.applyPreview = function() {
    if (this.canPreview()) {
        this.previewing = true;
        this.raptor.actionPreview(this.action.bind(this));
    }
};

PreviewButton.prototype.endPreview = function() {
    if (this.previewTimer !== null) {
        clearTimeout(this.previewTimer);
        this.previewTimer = null;
    }
    this.previewing = false;
};

/**
 * Mouse enter event that enables the preview.
 */
PreviewButton.prototype.mouseEnter = function() {
    if (this.canPreview()) {
        this.endPreview();
        if (this.options.previewTimeout !== false) {
            this.previewTimer = setTimeout(this.applyPreview.bind(this), this.options.previewTimeout)
        } else {
            this.applyPreview();
        }
    }
};

/**
 * Mouse leave event that reverts preview (if active).
 */
PreviewButton.prototype.mouseLeave = function() {
    this.endPreview();
    this.raptor.actionPreviewRestore();
};

/**
 * Click event that reverts preview (if active), and the fires the inherited button click event.
 */
PreviewButton.prototype.click = function() {
    this.endPreview();
    return Button.prototype.click.apply(this, arguments);
};

/**
 * Checks if previewing is enabled.
 *
 * @returns {Boolean}
 */
PreviewButton.prototype.canPreview = function() {
    return this.options.preview;
};

/**
 * Checks if previewing is currently active.
 *
 * @returns {Boolean}
 */
PreviewButton.prototype.isPreviewing = function() {
    return this.previewing;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/toggle-button.js
/**
 * @fileOverview Contains the core button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The toggle button class.
 *
 * @constructor
 * @augments Button
 *
 * @param {Object} options
 */
function ToggleButton(options) {
    this.disable = false;
    Button.call(this, options);
}

ToggleButton.prototype = Object.create(Button.prototype);

/**
 * Initialize the toggle button.
 *
 * @returns {Element}
 */
ToggleButton.prototype.init = function() {
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return Button.prototype.init.apply(this, arguments);
};

/**
 * Changes the state of the button depending on whether it is active or not.
 */
ToggleButton.prototype.selectionChange = function() {
    if (this.selectionToggle()) {
        aButtonActive(this.button);
        if (this.disable) {
            aButtonEnable(this.button);
        }
    } else {
        aButtonInactive(this.button);
        if (this.disable) {
            aButtonDisable(this.button);
        }
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-toggle-button.js
/**
 * @fileOverview Contains the preview toggle button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class the preview toggle button class.
 *
 * @constructor
 * @augments PreviewButton
 *
 * @param {Object} options
 */
function PreviewToggleButton(options) {
    PreviewButton.call(this, options);
}

PreviewToggleButton.prototype = Object.create(PreviewButton.prototype);

/**
 * Initialize the toggle preview button.
 *
 * @returns {Element}
 */
PreviewToggleButton.prototype.init = function() {
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return PreviewButton.prototype.init.apply(this, arguments);
};

/**
 * Sets the state of the button to active when preview is enabled.
 */
PreviewToggleButton.prototype.selectionChange = function() {
    if (this.selectionToggle()) {
        if (!this.isPreviewing()) {
            aButtonActive(this.button);
        }
    } else {
        aButtonInactive(this.button);
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/preview-toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/filtered-preview-button.js
/**
 * @fileOverview Contains the filtered preview button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class the filtered preview button class.
 *
 * @constructor
 * @augments PreviewButton
 *
 * @param {Object} options
 */
function FilteredPreviewButton(options) {
    Button.call(this, options);
}

FilteredPreviewButton.prototype = Object.create(PreviewButton.prototype);

/**
 * Initialize the filtered preview button.
 *
 * @returns {Element} result
 */
FilteredPreviewButton.prototype.init = function() {
    var result = PreviewButton.prototype.init.apply(this, arguments);
    this.raptor.bind('selectionChange', this.selectionChange.bind(this));
    return result;
};

/**
 * Toggles the button's disabled state.
 */
FilteredPreviewButton.prototype.selectionChange = function() {
    if (this.isEnabled()) {
        aButtonEnable(this.button);
    } else {
        aButtonDisable(this.button);
    }
};

// <strict/>


/**
 * @returns {Boolean} True if preview available and if the button is enabled, false otherwise.
 */
FilteredPreviewButton.prototype.canPreview = function() {
    return PreviewButton.prototype.canPreview.call(this) && this.isEnabled();
};

/**
 * @returns {Boolean} True if button is enabled, false otherwise.
 */
FilteredPreviewButton.prototype.isEnabled = function() {
    var range = rangeGet();
    if (range) {
        return !!this.getElement(range);
    }
    return !!this.previewing;
};

/**
 * Perform the button's action.
 */
FilteredPreviewButton.prototype.action = function() {
    selectionEachRange(function(range) {
        var element = this.getElement(range);
        if (element) {
            this.applyToElement(element);
        }
    }.bind(this));
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/filtered-preview-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/css-class-applier-button.js
/**
 * @fileOverview Contains the CSS class applier button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The CSS class applier button.
 *
 * @constructor
 * @augments PreviewToggleButton
 * @param {Object} options
 */
function CSSClassApplierButton(options) {
    PreviewToggleButton.call(this, options);
}

CSSClassApplierButton.prototype = Object.create(PreviewToggleButton.prototype);

/**
 * Applies the class from the button to a selection.
 */
CSSClassApplierButton.prototype.action = function() {
    selectionExpandToWord();
    this.raptor.selectionConstrain();
    for (var i = 0, l = this.classes.length; i < l; i++) {
        var applier = rangy.createCssClassApplier(this.options.cssPrefix + this.classes[i], {
            elementTagName: this.tag || 'span'
        });
        applier.toggleSelection();
    }
};

/**
 * Checks whether a class has been applied to a selection.
 *
 * @returns {Boolean} True if the css has been applied to the selection, false otherwise.
 */
CSSClassApplierButton.prototype.selectionToggle = function() {
    for (var i = 0, l = this.classes.length; i < l; i++) {
        var applier = rangy.createCssClassApplier(this.options.cssPrefix + this.classes[i], {
            elementTagName: this.tag || 'span'
        });
        if (!applier.isAppliedToSelection()) {
            return false;
        }
    }
    return true;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/css-class-applier-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-button.js
/**
 * @fileOverview Contains the dialog button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @type {Object} Container for Raptor dialogs.
 */
var dialogs = {};

/**
 * @class
 *
 * @constructor
 * @augments Button
 * @param {Object} options
 * @returns {DialogButton}
 */
function DialogButton(options) {
    this.state = null;
    Button.call(this, options);
}

DialogButton.prototype = Object.create(Button.prototype);

/**
 * A dialog button's action is to open a dialog, no content is modified at this
 * stage.
 */
DialogButton.prototype.action = function() {
    this.openDialog();
};

// <strict/>

/**
 * Checks the validility of a dialog.
 *
 * @param {type} dialog
 * @returns {Boolean} True if dialog is valid, false otherwise.
 */
DialogButton.prototype.validateDialog = function(dialog) {
    return true;
};

/**
 * Opens a dialog.
 *
 * @param {Object} dialog The dialog to open.
 */
DialogButton.prototype.openDialog = function() {
    this.raptor.pause();
    aDialogOpen(this.getDialog());
};

DialogButton.prototype.onDialogClose = function() {
    dialogs[this.name].instance.raptor.resume();
};

DialogButton.prototype.okButtonClick = function(event) {
    var valid = dialogs[this.name].instance.validateDialog();
    if (valid === true) {
        aDialogClose(dialogs[this.name].dialog);
        dialogs[this.name].instance.applyAction.call(dialogs[this.name].instance, dialogs[this.name].dialog);
    }
};

DialogButton.prototype.closeDialog = function() {
    aDialogClose(dialogs[this.name].dialog);
};

DialogButton.prototype.cancelButtonClick = DialogButton.prototype.closeDialog;

/**
 * Prepare and return the dialog's OK button's initialisation object.
 *
 * @param {String} name
 * @returns {Object} The initiialisation object for this dialog's OK button.
 */
DialogButton.prototype.getOkButton = function(name) {
    return {
        text: tr(name + 'DialogOKButton'),
        click: this.okButtonClick.bind(this),
        icons: {
            primary: 'ui-icon-circle-check'
        }
    };
};

/**
 * Prepare and return the dialog's cancel button's initialisation object.
 *
 * @param {String} name
 * @returns {Object} The initiialisation object for this dialog's cancel button.
 */
DialogButton.prototype.getCancelButton = function(name) {
    return {
        text: tr(name + 'DialogCancelButton'),
        click: this.cancelButtonClick.bind(this),
        icons: {
            primary: 'ui-icon-circle-close'
        }
    };
};

/**
 * Prepare and return the dialogs default options to be used in the Raptor UI.
 *
 * @param {String} name The name of the dialog to have the default options applied to it.
 * @returns {Object} the default options for the dialog.
 */
DialogButton.prototype.getDefaultDialogOptions = function(name) {
    var options = {
        modal: true,
        resizable: true,
        autoOpen: false,
        title: tr(name + 'DialogTitle'),
        dialogClass: this.options.baseClass + '-dialog ' + this.options.dialogClass,
        close: this.onDialogClose.bind(this),
        buttons: []
    };
    var okButton = this.getOkButton(name),
        cancelButton = this.getCancelButton(name);
    if (typeof okButton !== 'undefined' && okButton !== false) {
        options.buttons.push(okButton);
    }
    if (typeof cancelButton !== 'undefined' && cancelButton !== false) {
        options.buttons.push(cancelButton);
    }
    return options;
};

/**
 * Prepare and return the dialog to be used in the Raptor UI.
 *
 * @returns {Element} The dialog.
 */
DialogButton.prototype.getDialog = function() {
    if (typeof dialogs[this.name] === 'undefined') {
        dialogs[this.name] = {
            dialog: $(this.getDialogTemplate())
        };
        aDialog(dialogs[this.name].dialog, $.extend(this.getDefaultDialogOptions(this.name), this.dialogOptions));
    }
    dialogs[this.name].instance = this;
    return dialogs[this.name].dialog;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-toggle-button.js
/**
 * @fileOverview Contains the dialog toggle button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class
 *
 * @constructor
 * @augments DialogButton
 * @augments ToggleButton
 *
 * @param {type} options
 */
function DialogToggleButton(options) {
    DialogButton.call(this, options);
    ToggleButton.call(this, options);
}

DialogToggleButton.prototype = Object.create(DialogButton.prototype);

DialogToggleButton.prototype.init = ToggleButton.prototype.init;

DialogToggleButton.prototype.selectionChange = ToggleButton.prototype.selectionChange;
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/dialog-toggle-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu-button.js
/**
 * @fileOverview Contains the menu button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @constructor
 * @augments Button
 *
 * @param {Menu} menu The menu to create the menu button for.
 * @param {Object} options
 */
function MenuButton(menu, options) {
    this.menu = menu;
    this.name = menu.name;
    this.raptor = menu.raptor;
    this.options = menu.options;
    Button.call(this, options);
}

MenuButton.prototype = Object.create(Button.prototype);

/**
 * Shows the menu when button is clicked.
 *
 * @param {Event} event The click event.
 */
MenuButton.prototype.click = function(event) {
    if (this.menu.getMenu().is(':visible')) {
        $('.raptor-menu').hide();
    } else {
        this.menu.show();
    }
    event.preventDefault();
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu.js
/**
 * @fileOverview Contains the menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class
 * @constructor
 *
 * @param {Object} options
 * @returns {Menu}
 */
function Menu(options) {
    this.menu = null;
    this.menuContent = '';
    this.button = null;
    for (var key in options) {
        this[key] = options[key];
    }
}

/**
 * Initialize the menu.
 *
 * @returns {MenuButton}
 */
Menu.prototype.init = function() {
    this.setOptions();
    var button = this.getButton().init();
    button.addClass('raptor-menu-button');
    return button;
};

/**
 * Prepare and return the menu's button Element to be used in the Raptor UI.
 *
 * @returns {MenuButton}
 */
Menu.prototype.getButton = function() {
    if (!this.button) {
        this.button = new MenuButton(this);
    }
    return this.button;
};

/**
 * Applies options to the menu.
 */
Menu.prototype.setOptions = function() {
    this.options.title = tr(this.name + 'Title');
    this.options.icon = 'ui-icon-' + this.name;
};

/**
 * Prepare and return the menu Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
Menu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<div>')
            .addClass('ui-menu ui-widget ui-widget-content ui-corner-all ' + this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.menuContent)
            .css('position', 'fixed')
            .hide()
            .mousedown(function(event) {
                // Prevent losing the selection on the editor target
                event.preventDefault();
            })
            .children()
            .appendTo('body');
    }
    return this.menu;
};

/**
 * Display menu.
 */
Menu.prototype.show = function() {
    $('.raptor-menu').hide();
    elementPositionUnder(this.getMenu().toggle(), this.getButton().getButton());
};

/**
 * Click off close event.
 *
 * @param {Event} event The click event.
 */
$('html').click(function(event) {
    if (!$(event.target).hasClass('raptor-menu-button') &&
            $(event.target).closest('.raptor-menu-button').length === 0) {
        $('.raptor-menu').hide();
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/custom-menu.js
/**
 * @fileOverview Contains the custom menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The custom menu class.
 *
 * @constructor
 * @augments Menu
 *
 * Prepares and returns the custom menu Element to be used in the Raptor UI.
 *
 * @returns {Element}
 */
Menu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<div>')
            .addClass('ui-menu ui-widget ui-widget-content ui-corner-all ' + this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.menuContent)
            .css('position', 'fixed')
            .hide()
            .appendTo('body')
            .mousedown(function(event) {
                // Prevent losing the selection on the editor target
                event.preventDefault();
            });
    }
    return this.menu;
};

;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/custom-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/select-menu.js
/**
 * @fileOverview Contains the select menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The select menu class.
 *
 * @constructor
 * @augments Menu
 *
 * @param {Object} options
 */
function SelectMenu(options) {
    Menu.call(this, options);
}

SelectMenu.prototype = Object.create(Menu.prototype);

SelectMenu.prototype.menuItemMouseDown = function(event) {
    // Prevent losing the selection on the editor target
    event.preventDefault();
};

SelectMenu.prototype.menuItemClick = function(event) {
    aButtonSetLabel(this.button.button, $(event.target).html());
    $(this.menu).closest('ul').hide();
    // Prevent jQuery UI focusing the menu
    return false;
};

SelectMenu.prototype.menuItemMouseEnter = function(event) {
};

SelectMenu.prototype.menuItemMouseLeave = function(event) {
};

/**
 * Prepare and return the select menu Element to be used in the Raptor UI.
 *
 * @returns {Element} The select menu.
 */
SelectMenu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menu = $('<ul>')
            .addClass(this.options.baseClass + '-menu ' + this.raptor.options.baseClass + '-menu')
            .html(this.getMenuItems())
            .css('position', 'fixed')
            .hide()
            .find('a')
            .mousedown(this.menuItemMouseDown.bind(this))
            .mouseenter(this.menuItemMouseEnter.bind(this))
            .mouseleave(this.menuItemMouseLeave.bind(this))
            .click(this.menuItemClick.bind(this))
            .end()
            .appendTo('body');
        aMenu(this.menu);
    }
    return this.menu;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/components/ui/select-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src/expose.js

// <expose>
$.extend(Raptor, {
    Button: Button,
    CSSClassApplierButton: CSSClassApplierButton,
    DialogButton: DialogButton,
    DialogToggleButton: DialogToggleButton,
    FilteredPreviewButton: FilteredPreviewButton,
    HoverPanelLayout: HoverPanelLayout,
    Menu: Menu,
    MenuButton: MenuButton,
    PreviewButton: PreviewButton,
    PreviewToggleButton: PreviewToggleButton,
    RaptorLayout: RaptorLayout,
    RaptorPlugin: RaptorPlugin,
    SelectMenu: SelectMenu,
    TextAlignButton: TextAlignButton,
    ToggleButton: ToggleButton,
    ToolbarLayout: ToolbarLayout,
    UiGroup: UiGroup,
    aButton: aButton,
    aButtonActive: aButtonActive,
    aButtonDisable: aButtonDisable,
    aButtonEnable: aButtonEnable,
    aButtonInactive: aButtonInactive,
    aButtonIsEnabled: aButtonIsEnabled,
    aButtonSetIcon: aButtonSetIcon,
    aButtonSetLabel: aButtonSetLabel,
    aDialog: aDialog,
    aDialogClose: aDialogClose,
    aDialogOpen: aDialogOpen,
    aMenu: aMenu,
    aTabs: aTabs,
    actionApply: actionApply,
    actionPreview: actionPreview,
    actionPreviewRestore: actionPreviewRestore,
    actionRedo: actionRedo,
    actionUndo: actionUndo,
    clean: clean,
    cleanEmptyAttributes: cleanEmptyAttributes,
    cleanEmptyElements: cleanEmptyElements,
    cleanRemoveComments: cleanRemoveComments,
    cleanReplaceElements: cleanReplaceElements,
    cleanUnnestElement: cleanUnnestElement,
    cleanUnwrapElements: cleanUnwrapElements,
    cleanWrapTextNodes: cleanWrapTextNodes,
    dockToElement: dockToElement,
    dockToScreen: dockToScreen,
    elementBringToTop: elementBringToTop,
    elementChangeTag: elementChangeTag,
    elementClosestBlock: elementClosestBlock,
    elementContainsBlockElement: elementContainsBlockElement,
    elementDefaultDisplay: elementDefaultDisplay,
    elementDetachedManip: elementDetachedManip,
    elementFirstInvalidElementOfValidParent: elementFirstInvalidElementOfValidParent,
    elementGetAttributes: elementGetAttributes,
    elementGetStyles: elementGetStyles,
    elementIsBlock: elementIsBlock,
    elementIsEmpty: elementIsEmpty,
    elementIsValid: elementIsValid,
    elementOuterHtml: elementOuterHtml,
    elementOuterText: elementOuterText,
    elementPositionUnder: elementPositionUnder,
    elementRemoveAttributes: elementRemoveAttributes,
    elementSwapStyles: elementSwapStyles,
    elementToggleStyle: elementToggleStyle,
    elementUniqueId: elementUniqueId,
    elementVisibleRect: elementVisibleRect,
    elementWrapInner: elementWrapInner,
    extendLocale: extendLocale,
    fragmentInsertBefore: fragmentInsertBefore,
    fragmentToHtml: fragmentToHtml,
    getLocalizedString: getLocalizedString,
    nodeFindParent: nodeFindParent,
    nodeFindTextNodes: nodeFindTextNodes,
    nodeIsChildOf: nodeIsChildOf,
    persistGet: persistGet,
    persistSet: persistSet,
    rangeContainsNode: rangeContainsNode,
    rangeContainsNodeText: rangeContainsNodeText,
    rangeDeserialize: rangeDeserialize,
    rangeEmptyTag: rangeEmptyTag,
    rangeExpandTo: rangeExpandTo,
    rangeExpandToParent: rangeExpandToParent,
    rangeGet: rangeGet,
    rangeGetCommonAncestor: rangeGetCommonAncestor,
    rangeGetEndElement: rangeGetEndElement,
    rangeGetStartElement: rangeGetStartElement,
    rangeIsContainedBy: rangeIsContainedBy,
    rangeIsEmpty: rangeIsEmpty,
    rangeReplace: rangeReplace,
    rangeReplaceSplitInvalidTags: rangeReplaceSplitInvalidTags,
    rangeReplaceWithinValidTags: rangeReplaceWithinValidTags,
    rangeSelectElement: rangeSelectElement,
    rangeSelectElementContent: rangeSelectElementContent,
    rangeSerialize: rangeSerialize,
    rangeToHtml: rangeToHtml,
    rangeTrim: rangeTrim,
    registerLocale: registerLocale,
    selectionAtEndOfElement: selectionAtEndOfElement,
    selectionAtStartOfElement: selectionAtStartOfElement,
    selectionChangeTags: selectionChangeTags,
    selectionClearFormatting: selectionClearFormatting,
    selectionConstrain: selectionConstrain,
    selectionContains: selectionContains,
    selectionDelete: selectionDelete,
    selectionDestroy: selectionDestroy,
    selectionEachBlock: selectionEachBlock,
    selectionEachRange: selectionEachRange,
    selectionExists: selectionExists,
    selectionExpandTo: selectionExpandTo,
    selectionExpandToWord: selectionExpandToWord,
    selectionFindWrappingAndInnerElements: selectionFindWrappingAndInnerElements,
    selectionGetElement: selectionGetElement,
    selectionGetElements: selectionGetElements,
    selectionGetEndElement: selectionGetEndElement,
    selectionGetHtml: selectionGetHtml,
    selectionGetStartElement: selectionGetStartElement,
    selectionInverseWrapWithTagClass: selectionInverseWrapWithTagClass,
    selectionIsEmpty: selectionIsEmpty,
    selectionRange: selectionRange,
    selectionReplace: selectionReplace,
    selectionReplaceSplittingSelectedElement: selectionReplaceSplittingSelectedElement,
    selectionReplaceWithinValidTags: selectionReplaceWithinValidTags,
    selectionRestore: selectionRestore,
    selectionSave: selectionSave,
    selectionSaved: selectionSaved,
    selectionSelectEdge: selectionSelectEdge,
    selectionSelectEnd: selectionSelectEnd,
    selectionSelectInner: selectionSelectInner,
    selectionSelectOuter: selectionSelectOuter,
    selectionSelectStart: selectionSelectStart,
    selectionSelectToEndOfElement: selectionSelectToEndOfElement,
    selectionSet: selectionSet,
    selectionToggleBlockClasses: selectionToggleBlockClasses,
    selectionToggleBlockStyle: selectionToggleBlockStyle,
    selectionToggleWrapper: selectionToggleWrapper,
    selectionTrim: selectionTrim,
    selectionWrapTagWithAttribute: selectionWrapTagWithAttribute,
    setLocale: setLocale,
    stateRestore: stateRestore,
    stateSave: stateSave,
    stringHtmlStringIsEmpty: stringHtmlStringIsEmpty,
    stringStripTags: stringStripTags,
    styleRestoreState: styleRestoreState,
    styleSwapState: styleSwapState,
    styleSwapWithWrapper: styleSwapWithWrapper,
    tableCanMergeCells: tableCanMergeCells,
    tableCanSplitCells: tableCanSplitCells,
    tableCellsInRange: tableCellsInRange,
    tableCreate: tableCreate,
    tableDeleteColumn: tableDeleteColumn,
    tableDeleteRow: tableDeleteRow,
    tableGetCellByIndex: tableGetCellByIndex,
    tableGetCellIndex: tableGetCellIndex,
    tableInsertColumn: tableInsertColumn,
    tableInsertRow: tableInsertRow,
    tableMergeCells: tableMergeCells,
    tableSplitCells: tableSplitCells,
    templateConvertTokens: templateConvertTokens,
    templateGet: templateGet,
    templateGetVariables: templateGetVariables,
    typeIsArray: typeIsArray,
    typeIsElement: typeIsElement,
    typeIsNode: typeIsNode,
    typeIsNumber: typeIsNumber,
    typeIsRange: typeIsRange,
    typeIsSelection: typeIsSelection,
    typeIsString: typeIsString,
    typeIsTextNode: typeIsTextNode,
    undockFromElement: undockFromElement,
    undockFromScreen: undockFromScreen
});
window.Raptor = Raptor;
// </expose>
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src/expose.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/base.js
/**
 * @fileOverview Default options for Raptor.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @namespace Default options for Raptor.
 */
Raptor.globalDefaults = {
    /**
     * @type Object Default layouts to use.
     */
    layouts: {},

    /**
     * Plugins option overrides.
     *
     * @type Object
     */
    plugins: {},

    /**
     * UI option overrides.
     *
     * @type Object
     */
    ui: {},

    /**
     * Default events to bind.
     *
     * @type Object
     */
    bind: {},

    /**
     * Namespace used for persistence to prevent conflicting with other stored
     * values.
     *
     * @type String
     */
    namespace: null,

    /**
     * Switch to indicated that some events should be automatically applied to
     * all editors that are 'unified'
     *
     * @type boolean
     */
    unify: true,

    /**
     * Switch to indicate whether or not to stored persistent values, if set to
     * false the persist function will always return null
     *
     * @type boolean
     */
    persistence: true,

    /**
     * The name to store persistent values under
     * @type String
     */
    persistenceName: 'uiEditor',

    /**
     * Switch to indicate whether or not to a warning should pop up when the
     * user navigates aways from the page and there are unsaved changes
     *
     * @type boolean
     */
    unloadWarning: true,

    /**
     * Switch to automatically enabled editing on the element
     *
     * @type boolean
     */
    autoEnable: false,

    /**
     * Only enable editing on certian parts of the element
     *
     * @type {jQuerySelector}
     */
    partialEdit: false,

    /**
     * Automatically select the editable content when editing is enabled.
     *
     * @type boolean
     */
    autoSelect: 'end',

    /**
     * Switch to specify if the editor should automatically enable all plugins,
     * if set to false, only the plugins specified in the 'plugins' option
     * object will be enabled
     *
     * @type boolean
     */
    enablePlugins: true,

    /**
     * An array of explicitly disabled plugins.
     *
     * @type String[]
     */
    disabledPlugins: [],

    /**
     * Switch to specify if the editor should automatically enable all UI, if
     * set to false, only the UI specified in the {@link Raptor.defaults.ui}
     * option object will be enabled
     *
     * @type boolean
     */
    enableUi: true,

    /**
     * An array of explicitly disabled UI elements.
     *
     * @type String[]
     */
    disabledUi: [],

    /**
     * Switch to indicate that the element the editor is being applied to should
     * be replaced with a div (useful for textareas), the value/html of the
     * replaced element will be automatically updated when the editor element is
     * changed
     *
     * @type boolean
     */
    replace: false,

    /**
     * A list of styles that will be copied from the replaced element and
     * applied to the editor replacement element
     *
     * @type String[]
     */
    replaceStyle: [
        'display', 'position', 'float', 'width',
        'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
        'margin-left', 'margin-right', 'margin-top', 'margin-bottom'
    ],

    /**
     *
     * @type String
     */
    baseClass: 'raptor',

    /**
     * CSS class prefix that is prepended to inserted elements classes.
     * E.g. "cms-bold"
     *
     * @type String
     */
    cssPrefix: 'cms-',

    draggable: true
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/base.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/full.js
/**
 * @fileOverview Contains the full options preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @namespace Full options for Raptor.
 */
Raptor.registerPreset({
    name: 'full',
    plugins: {
        imageSwap: {
            chooser: 'insertFile'
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel'],
                ['dockToScreen', 'dockToElement', 'guides'],
                ['viewSource'],
                ['historyUndo', 'historyRedo'],
                ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['textSuper', 'textSub'],
                ['listUnordered', 'listOrdered'],
                ['hrCreate', 'textBlockQuote'],
                ['textSizeDecrease', 'textSizeIncrease', 'fontFamilyMenu'],
                ['clearFormatting', 'cleanBlock'],
                ['linkCreate', 'linkRemove'],
                ['embed', 'insertFile'],
                ['floatLeft', 'floatNone', 'floatRight'],
                ['colorMenuBasic'],
                ['tagMenu'],
                ['classMenu'],
                ['snippetMenu', 'specialCharacters'],
                ['tableCreate', 'tableInsertRow', 'tableDeleteRow', 'tableInsertColumn', 'tableDeleteColumn'],
                ['languageMenu'],
                ['statistics']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit']
            ]
        },
        elementHoverPanel: {
            elements: 'img',
            uiOrder: [
                ['imageResize', 'imageSwap', 'close']
            ]
        }
    }
}, true);
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/full.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/micro.js
/**
 * @fileOverview Contains the micro options preset.
 * @license http://www.raptor-editor.com/license
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Micro options for Raptor.
 */
Raptor.registerPreset({
    name: 'micro',
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel'],
                ['dockToScreen', 'dockToElement'],
                ['historyUndo', 'historyRedo'],
                ['specialCharacters'],
                ['languageMenu'],
                ['statistics']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit', 'revisions']
            ]
        }
    },
    plugins: {
        placeholder: false,
        paste: {
            panels: [
                'plain-text'
            ]
        },
        noBreak: {
            enabled: true
        }
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/micro.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\presets/inline.js
/**
 * @fileOverview Contains the inline preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Inline preset for Raptor.
 */
Raptor.registerPreset({
    name: 'inline',
    classes: 'raptor-editing-inline',
    autoEnable: true,
    draggable: false,
    unify: false,
    unloadWarning: false,
    reloadOnDisable: true,
    plugins: {
        unsavedEditWarning: false,
        dock: {
            dockToElement: true,
            docked: true,
            persist: false
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['colorMenuBasic'],
                ['textBlockQuote'],
                ['listOrdered', 'listUnordered'],
                ['textSizeDecrease', 'textSizeIncrease'],
                ['linkCreate', 'linkRemove']
            ]
        }
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\presets/inline.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src/presets/full-premium.js
/**
 * @fileOverview Contains the mammoth preset.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

/**
 * @namespace Mammoth preset for Raptor.
 */
Raptor.registerPreset({
    name: 'full-premium',
    plugins: {
        imageSwap: {
            chooser: 'fileManager'
        }
    },
    layouts: {
        toolbar: {
            uiOrder: [
                ['logo'],
                ['save', 'cancel', 'editPage'],
                ['dockToScreen', 'dockToElement', 'guides'],
                ['viewSource'],
                ['historyUndo', 'historyRedo'],
                ['alignLeft', 'alignCenter', 'alignJustify', 'alignRight'],
                ['textBold', 'textItalic', 'textUnderline', 'textStrike'],
                ['textSuper', 'textSub'],
                ['listUnordered', 'listOrdered'],
                ['hrCreate', 'textBlockQuote'],
                ['textSizeDecrease', 'textSizeIncrease', 'fontFamilyMenu'],
                ['clearFormatting', 'cleanBlock'],
                ['linkCreate', 'linkRemove'],
                ['embed', 'insertFile', 'fileManager', 'imageEditor'],
                ['floatLeft', 'floatNone', 'floatRight'],
                ['colorMenuBasic'],
                ['tagMenu'],
                ['classMenu'],
                ['snippetMenu', 'specialCharacters', 'loremIpsum'],
                ['tableCreate', 'tableInsertRow', 'tableDeleteRow', 'tableInsertColumn', 'tableDeleteColumn'],
                ['languageMenu'],
                ['statistics']
            ]
        },
        hoverPanel: {
            uiOrder: [
                ['clickButtonToEdit', 'revisions']
            ]
        },
        elementHoverPanel: {
            elements: 'img',
            uiOrder: [
                ['imageResize', 'imageSwap', 'imageEditor', 'close']
            ]
        },
        imageEditor: {
            uiOrder: [
                ['save', 'cancel'],
                ['revert', 'upload'],
                ['undo', 'redo'],
                ['flipV', 'flipH', 'rotateLeft', 'rotateRight', 'resize', 'crop'],
                ['blur', 'sharpen', 'desaturate', 'invert', 'sepia', 'solarize', 'brightness', 'colorAdjust', 'glow', 'hsl', 'posterize', 'removeNoise']
            ]
        },
        fileManager: {
            uiOrder: [
                ['insert', 'rename', 'edit', 'delete', 'download', 'view']
            ]
        }
    }
}, true);
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src/presets/full-premium.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/cancel/cancel.js
/**
 * @fileOverview Contains the cancel editing dialog code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a cancel dialog.
 *
 * @todo needs checking and not sure what to put in for the param stuff.
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'cancel',
    hotkey: 'esc',
    dialogOptions: {
        width: 500
    },

    action: function() {
        if (this.raptor.isDirty()) {
            DialogButton.prototype.action.call(this);
        } else {
            this.applyAction();
        }
    },

    applyAction: function() {
        this.raptor.cancelEditing();
    },

    getDialogTemplate: function() {
        return $('<div>').html(tr('cancelDialogContent'));
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/cancel/cancel.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/class-menu/class-menu.js
/**
 * @fileOverview Contains the class menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The select menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function ClassMenu(options) {
    SelectMenu.call(this, {
        name: 'classMenu'
    });
}

ClassMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialises the class menu.
 *
 * @todo type and desc for result
 * @returns {unresolved} result
 */
ClassMenu.prototype.init = function() {
    var result = SelectMenu.prototype.init.call(this);
    if (typeof this.options.classes === 'object' &&
            Object.keys(this.options.classes).length > 0) {
        this.raptor.bind('selectionChange', this.updateButton.bind(this));
        return result;
    }
};

/**
 * Toggles a given set of classes on a selection.
 *
 * @param {Object} classes
 */
ClassMenu.prototype.changeClass = function(classes) {
    selectionToggleBlockClasses(classes, [], this.raptor.getElement());
};

/**
 * Applies the class on click.
 *
 * @param event
 */
ClassMenu.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeClass([$(event.currentTarget).data('value')]);
    }.bind(this));
};

/**
 * Puts the selection into preview mode for the chosen class.
 *
 * @param event The mouse event which triggered the preview.
 */
ClassMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeClass([$(event.currentTarget).data('value')]);
    }.bind(this));
};

/**
 * Restores the selection from preview mode.
 *
 * @param event
 */
ClassMenu.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};
 /**
  * Updates the class menu button.
  */
ClassMenu.prototype.updateButton = function() {
};

//ClassMenu.prototype.getButton = function() {
//    if (!this.button) {
//        this.button = new Button({
//            name: this.name,
//            action: this.show.bind(this),
//            preview: false,
//            options: this.options,
//            icon: false,
//            text: 'Class Selector',
//            raptor: this.raptor
//        });
//    }
//    return this.button;
//};

/**
 * Prepare and return the menu items to be used in the Raptor UI.
 * @returns {Object} The menu items.
 */
ClassMenu.prototype.getMenuItems = function() {
    var items = '';
    for (var label in this.options.classes) {
        items += this.raptor.getTemplate('class-menu.item', {
            label: label,
            value: this.options.classes[label]
        });
    }
    return items;
};

Raptor.registerUi(new ClassMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/class-menu/class-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clean-block/clean-block.js
/**
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

Raptor.registerUi(new PreviewButton({
    name: 'cleanBlock',
    action: function() {
        var element = this.raptor.getElement();
        cleanRemoveAttributes(element, [
            'style'
        ]);
        cleanRemoveElements(element, [
            'font',
            'span:not([class])',
            '.cms-color:has(.cms-color)',
            ':header strong',
            ':header b',
            // @fixme why is this twice?
            ':header strong'
        ]);
        cleanEmptyElements(element, [
            'b',
            'big',
            'em',
            'i',
            'small',
            'span',
            'strong',
            ':not(:visible)'
        ]);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clean-block/clean-block.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clear-formatting/clear-formatting.js
/**
 * @fileOverview Contains the clear formatting button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button that clears the
 * formatting on a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'clearFormatting',
    action: function() {
        selectionClearFormatting(this.raptor.getElement().get(0));
        cleanEmptyElements(this.raptor.getElement(), [
            'a', 'b', 'i', 'sub', 'sup', 'strong', 'em', 'big', 'small', 'p'
        ]);
        cleanWrapTextNodes(this.raptor.getElement()[0], 'p');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/clear-formatting/clear-formatting.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/click-button-to-edit/click-button-to-edit.js
/**
 * @fileOverview Contains the click button to edit code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */
Raptor.registerUi(new Button({
    name: 'clickButtonToEdit',
    action: function() {
        this.raptor.enableEditing();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/click-button-to-edit/click-button-to-edit.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/close/close.js
/**
 * @fileOverview Contains the close panel code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */
Raptor.registerUi(new Button({
    name: 'close',

    click: function() {
        this.layout.close();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/close/close.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/color-menu-basic/color-menu-basic.js
/**
 * @fileOverview Contains the basic colour menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The basic colour menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function ColorMenuBasic(options) {
    this.options = {
        colors: {
            white: '#ffffff',
            black: '#000000',
            grey: '#999',
            blue: '#4f81bd',
            red: '#c0504d',
            green: '#9bbb59',
            purple: '#8064a2',
            orange: '#f79646'
        }
    };
    /**
     * Cache the current color so it can be reapplied to the button if the user
     * clicks the button to open the menu, hovers some colors then clicks off to
     * close it.
     *
     * @type {String}
     */
    this.currentColor = 'automatic';
    SelectMenu.call(this, {
        name: 'colorMenuBasic'
    });
}

ColorMenuBasic.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialize the basic colour menu.
 *
 * @returns {Element}
 */
ColorMenuBasic.prototype.init = function() {
    this.raptor.bind('selectionChange', this.updateButton.bind(this));
    this.updateButton();
    return SelectMenu.prototype.init.apply(this, arguments);
};

/**
 * Updates the basic colour menu with the current colour.
 */
ColorMenuBasic.prototype.updateButton = function() {
    var tag = selectionGetElements()[0],
        button = this.getButton().getButton(),
        color = null,
        closest = null;

    // TODO: set automatic icon color to the color of the text
    aButtonSetLabel(button, tr('colorMenuBasicAutomatic'));
    aButtonSetIcon(button, false);
    if (!tag) {
        return;
    }
    tag = $(tag);
    for (var label in this.options.colors) {
        closest = $(tag).closest('.' + this.options.cssPrefix + label);
        if (closest.length) {
            color = label;
            break;
        }
    }
    if (color) {
        aButtonSetLabel(button, tr('colorMenuBasic' + stringToCamelCase(color)));
        aButtonSetIcon(button, 'ui-icon-swatch');
        // FIXME: set color in an adapter friendly way
        button.find('.ui-icon').css('background-color', closest.css('color'));
        return;
    }
};

/**
 * Changes the colour of the selection.
 *
 * @param {type} color The current colour.
 */
ColorMenuBasic.prototype.changeColor = function(color, permanent) {
    if (permanent) {
        this.currentColor = color;
    }
    this.raptor.actionApply(function() {
        selectionExpandToWord();
        if (color === 'automatic') {
            selectionGetElements().parents('.' + this.options.cssPrefix + 'color').addBack().each(function() {
                var classes = $(this).attr('class');
                if (classes === null || typeof classes === 'undefined') {
                    return;
                }
                classes = classes.match(/(cms-(.*?))( |$)/ig);
                if (classes === null || typeof classes === 'undefined') {
                    return;
                }
                for (var i = 0, l = classes.length; i < l; i++) {
                    $(this).removeClass(classes[i].trim());
                    if (!$(this).attr('class').trim()) {
                        $(this).contents().unwrap();
                    }
                }
            });
        } else {
            var uniqueId = elementUniqueId();
            selectionToggleWrapper('span', {
                classes: this.options.cssPrefix + 'color ' + this.options.cssPrefix + color,
                attributes: {
                    id: uniqueId
                }
            });
            var element = $('#' + uniqueId);
            if (element.length) {
                selectionSelectInner(element.removeAttr('id').get(0));
                var splitNode;
                do {
                    splitNode = $('#' + uniqueId);
                    splitNode.removeAttr('id');
                } while (splitNode.length);
            }
        }
        cleanRemoveElements(this.raptor.getElement(), [
            '.cms-color:has(.cms-color)'
        ]);
    }.bind(this));
};

/**
 * The preview state for the basic colour menu.
 *
 * @param event The mouse event which triggered the preview.
 */
ColorMenuBasic.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeColor($(event.currentTarget).data('color'));
    }.bind(this));
};

/**
 * Restores the selection from the preview.
 *
 * @param event
 */
ColorMenuBasic.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};

/**
 * Applies the colour change to the selection.
 *
 * @param event The mouse event to trigger the application of the colour.
 */
ColorMenuBasic.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeColor($(event.currentTarget).data('color'), true);
    }.bind(this));
};

/**
 * Prepare and return the menu items to be used in the Raptor UI.
 * @returns {Element} The menu items.
 */
ColorMenuBasic.prototype.getMenuItems = function() {
    var template = this.raptor.getTemplate('color-menu-basic.automatic', this.options);
    for (var label in this.options.colors) {
        template += this.raptor.getTemplate('color-menu-basic.item', {
            color: this.options.colors[label],
            label: tr('colorMenuBasic' + stringToCamelCase(label)),
            className: label,
            baseClass: this.options.baseClass
        });
    }
    return template;
};

Raptor.registerUi(new ColorMenuBasic());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/color-menu-basic/color-menu-basic.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-plugin.js
/**
 * @fileOverview Contains the dock plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The dock plugin class.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides
 */
function DockPlugin(name, overrides) {
    this.options = {
        dockToElement: false,
        docked: false,
        position: 'top',
        spacer: true,
        persist: true,
        dockTo: null
    };
    this.dockState = false;
    this.marker = false;

    RaptorPlugin.call(this, name || 'dock', overrides);
}

DockPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initialize the dock plugin.
 */
DockPlugin.prototype.init = function() {
    var docked;
    if (this.options.persist) {
        docked = this.raptor.persist('docked');
    }
    if (typeof docked === 'undefined') {
        docked = this.options.docked;
    }
    if (typeof docked === 'undefined') {
        docked = false;
    }
    if (docked) {
        this.raptor.bind('toolbarReady', function() {
            if (docked) {
                this.toggleState();
            }
        }.bind(this));
        this.raptor.bind('toolbarHide', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.addClass(this.options.baseClass + '-hidden');
                this.dockState.spacer.removeClass(this.options.baseClass + '-visible');
            }
        }.bind(this));
        this.raptor.bind('toolbarShow', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.removeClass(this.options.baseClass + '-hidden');
                this.dockState.spacer.addClass(this.options.baseClass + '-visible');
            }
        }.bind(this));
        this.raptor.bind('toolbarDestroy', function() {
            if (this.dockState && this.dockState.spacer) {
                this.dockState.spacer.remove();
            }
        }.bind(this));
    }
};

/**
 * Switch between docked / undocked, depending on options.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleState = function() {
    if (this.options.dockToElement) {
        return this.toggleDockToElement();
    }
    return this.toggleDockToScreen();
};

/**
 * Gets the dock state on toggle dock to element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleDockToElement = function() {
    if (this.dockState) {
        if (typeof this.dockState.dockedTo !== 'undefined') {
            this.undockFromElement();
        } else {
            this.undockFromScreen();
            this.dockToElement();
        }
    } else {
        this.dockToElement();
    }
};

/**
 * Gets the dock state on dock to element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.dockToElement = function() {
    var element = this.options.dockTo ? $(this.options.dockTo) : this.raptor.getElement(),
        layoutElement = this.raptor.getLayout('toolbar').getElement();
    this.marker = $('<marker>').addClass(this.options.baseClass + '-marker').insertAfter(layoutElement);
    layoutElement.addClass(this.options.baseClass + '-docked-to-element');
    this.dockState = dockToElement(layoutElement, element, {
        position: this.options.position,
        spacer: false,
        wrapperClass: this.options.baseClass + '-inline-wrapper'
    });
    this.activateButton(this.raptor.getPlugin('dockToElement'));
    this.raptor.persist('docked', true);
};

/**
 * Gets the dock state on undocking from an element.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.undockFromElement = function() {
    this.marker.replaceWith(undockFromElement(this.dockState));
    this.dockState = null;
    this.raptor.getLayout('toolbar').getElement().removeClass(this.options.baseClass + '-docked-to-element');
    this.deactivateButton(this.raptor.getPlugin('dockToElement'));
    this.raptor.persist('docked', false);
};

/**
 * Gets the dock state on toggle dock to screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.toggleDockToScreen = function() {
    if (this.dockState) {
        if (typeof this.dockState.dockedTo !== 'undefined') {
            this.undockFromElement();
            this.dockToScreen();
        } else {
            this.undockFromScreen();
        }
    } else {
        this.dockToScreen();
    }
};

/**
 * Gets the dock state on dock to screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.dockToScreen = function() {
    if (!this.dockState) {
        var layout = this.raptor.getLayout('toolbar');
        if (layout.isReady()) {
            var layoutElement = layout.getElement();
            this.marker = $('<marker>').addClass(this.options.baseClass + '-marker')
                                .insertAfter(layoutElement);
            layoutElement.addClass(this.options.baseClass + '-docked');
            layout.disableDragging();
            this.dockState = dockToScreen(layoutElement, {
                position: this.options.position,
                spacer: this.options.spacer,
                under: this.options.under
            });
            if (!layout.isVisible()) {
                this.dockState.spacer.removeClass(this.options.baseClass + '-visible');
                this.dockState.spacer.addClass(this.options.baseClass + '-hidden');
            }
            this.activateButton(this.raptor.getPlugin('dockToScreen'));
            this.raptor.persist('docked', true);
        }
    }
};

/**
 * Gets the dock state on undocking from the screen.
 *
 * @return {Object} Resulting dock state
 */
DockPlugin.prototype.undockFromScreen = function() {
    if (this.dockState) {
        var layout = this.raptor.getLayout('toolbar'),
            layoutElement = undockFromScreen(this.dockState);
        this.marker.replaceWith(layoutElement);
        layout.enableDragging();
        layout.constrainPosition();
        this.dockState = null;
        layoutElement.removeClass(this.options.baseClass + '-docked');
        this.deactivateButton(this.raptor.getPlugin('dockToScreen'));
        this.raptor.persist('docked', false);
    }
};

DockPlugin.prototype.deactivateButton = function(ui) {
    if (typeof ui !== 'undefined' &&
            typeof ui.button !== 'undefined') {
        aButtonInactive(ui.button);
    }
};

DockPlugin.prototype.activateButton = function(ui) {
    if (typeof ui !== 'undefined' &&
            typeof ui.button !== 'undefined') {
        aButtonActive(ui.button);
    }
};

Raptor.registerPlugin(new DockPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-plugin.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-screen.js
/**
 * @fileOverview Contains the dock to screen button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dock to screen button for use in the Raptor UI.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'dockToScreen',
    action: function() {
        this.raptor.unify(function(raptor) {
            raptor.plugins.dock.toggleDockToScreen();
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-screen.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-element.js
/**
 * @fileOverview Contains the dock to element button code.
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dock to element button for use in the raptor UI.
 *
 * @todo not sure how to document this one.
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'dockToElement',
    action: function() {
        this.raptor.unify(function(raptor) {
            raptor.plugins.dock.toggleDockToElement();
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/dock/dock-to-element.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/embed/embed.js
/**
 * @fileOverview Contains the embed dialog button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an intance of the embed dialog for use in the Raptor UI.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'embed',
    state: null,
    dialogOptions: {
        width: 600,
        height: 400
    },

    /**
     * Replace selection with embed textarea content.
     *
     * @param  {Element} dialog
     */
    applyAction: function(dialog) {
        this.raptor.actionApply(function() {
            selectionReplace(dialog.find('textarea').val());
        });
    },

    /**
     * Create and prepare the embed dialog template.
     *
     * @return {Element}
     */
    getDialogTemplate: function() {
        var template = $('<div>').html(this.raptor.getTemplate('embed.dialog', this.options));

        template.find('textarea').change(function(event) {
            template.find('.' + this.options.baseClass + '-preview').html($(event.target).val());
        }.bind(this));

        // Create fake jQuery UI tabs (to prevent hash changes)
        var tabs = template.find('.' + this.options.baseClass + '-panel-tabs');
        tabs.find('li')
            .click(function() {
                tabs.find('ul li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                tabs.children('div').hide().eq($(this).index()).show();
            });
        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/embed/embed.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-left.js
/**
 * @fileOverview Contains the float left button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to float an image left.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatLeft',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-right');
        element.toggleClass(this.options.cssPrefix + 'float-left');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-left.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-none.js
/**
 * @fileOverview Contains the float none button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to remove the float an image.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatNone',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-right');
        element.removeClass(this.options.cssPrefix + 'float-left');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-none.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-right.js
/**
 * @fileOverview Contains the float right button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a filtered preview button to float an image right.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new FilteredPreviewButton({
    name: 'floatRight',
    applyToElement: function(element) {
        element.removeClass(this.options.cssPrefix + 'float-left');
        element.toggleClass(this.options.cssPrefix + 'float-right');
        cleanEmptyAttributes(element, ['class']);
    },
    getElement: function(range) {
        var images = $(range.commonAncestorContainer).find('img');
        return images.length ? images : null;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/float/float-right.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/guides/guides.js
/**
 * @fileOverview Contains the guides button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of a preview button to show the guides of the elements.
 *
 * @todo des and type for the param.
 * @param {type} param
 */
Raptor.registerUi(new PreviewButton({
    name: 'guides',

    action: function() {
        this.raptor.getElement().toggleClass(this.getClassName());
        this.updateButtonState();
    },

    updateButtonState: function() {
        if (this.raptor.getElement().hasClass(this.getClassName())) {
            aButtonActive(this.button);
        } else {
            aButtonInactive(this.button);
        }
    },

    init: function() {
        this.raptor.bind('cancel', this.removeClass.bind(this));
        this.raptor.bind('saved', this.removeClass.bind(this));
        return PreviewButton.prototype.init.call(this);
    },

    removeClass: function() {
        this.raptor.getElement().removeClass(this.getClassName());
    },

    getClassName: function() {
        return this.options.baseClass + '-visible';
    },

    mouseEnter: function() {
        PreviewButton.prototype.mouseEnter.call(this);
        this.updateButtonState();
    },

    mouseLeave: function() {
        PreviewButton.prototype.mouseLeave.call(this);
        this.updateButtonState();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/guides/guides.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-redo.js
/**
 * @fileOverview Contains the history redo code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to redo an action.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'historyRedo',
    hotkey: ['ctrl+y', 'ctrl+shift+z'],

    action: function() {
        this.raptor.historyForward();
    },

    init: function () {
        this.raptor.bind('historyChange', this.historyChange.bind(this));
        Button.prototype.init.apply(this, arguments);
        aButtonDisable(this.button);
        return this.button;
    },

    historyChange: function() {
        if (this.raptor.present < this.raptor.history.length - 1) {
            aButtonEnable(this.button);
        } else {
            aButtonDisable(this.button);
        }
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-redo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-undo.js
/**
 * @fileOverview Contains the history undo code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to undo an action.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'historyUndo',
    hotkey: 'ctrl+z',

    action: function() {
        this.raptor.historyBack();
    },

    init: function () {
        this.raptor.bind('historyChange', this.historyChange.bind(this));
        Button.prototype.init.apply(this, arguments);
        aButtonDisable(this.button);
        return this.button;
    },

    historyChange: function() {
        if (this.raptor.present === 0) {
            aButtonDisable(this.button);
        } else {
            aButtonEnable(this.button);
        }
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/history/history-undo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/hr/hr-create.js
/**
 * @fileOverview Contains the hr button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to insert a hr at the selection.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new PreviewButton({
    name: 'hrCreate',
    action: function() {
        selectionReplace('<hr/>');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/hr/hr-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-resize/image-resize.js
/**
 * @fileOverview Contains the image resize button code.
 * @author David Neilsen <david@panmedia.co.nz>
 */
Raptor.registerUi(new DialogButton({
    name: 'imageResize',
    proportional: true,
    image: null,
    dialogOptions: {
        width: 450
    },

    action: function() {
        var dialog = this.getDialog();
        this.image = nodeUniqueId(this.layout.target);
        this.originalWidth = this.layout.target.width;
        this.originalHeight = this.layout.target.height;
        dialog.find('[name=width]').val(this.layout.target.width),
        dialog.find('[name=height]').val(this.layout.target.height);
        this.openDialog();
    },

    applyAction: function() {
        var dialog = this.getDialog(),
            width = dialog.find('[name=width]').val(),
            height = dialog.find('[name=height]').val();
        this.raptor.actionApply(function() {
            $('#' + this.image)
                .css({
                    width: width,
                    height: height
                })
                .attr('width', width)
                .attr('height', height);
            selectionSelectOuter($('#' + this.image)[0]);
        }.bind(this));
    },

    getDialogTemplate: function() {
        var template = $('<div>').html(this.raptor.getTemplate('image-resize.dialog', this.options)),
            plugin = this;
        template.find('.' + this.options.baseClass + '-lock-proportions')
            .hover(function() {
                $(this).addClass('ui-state-hover');
            }, function() {
                $(this).removeClass('ui-state-hover');
            })
            .click(function() {
                dialogs[plugin.name].instance.proportional = !dialogs[plugin.name].instance.proportional;
                $(this)
                    .find('.ui-icon')
                    .toggleClass('ui-icon-locked', plugin.proportional)
                    .toggleClass('ui-icon-unlocked', !plugin.proportional);
            });

        var widthInput = template.find('[name=width]'),
            heightInput = template.find('[name=height]');

        widthInput.on('input.raptor', function() {
            var value = parseInt($(this).val());
            if (!isNaN(value)) {
                if (dialogs[plugin.name].instance.proportional) {
                    heightInput.val(Math.round(Math.abs(dialogs[plugin.name].instance.originalHeight / dialogs[plugin.name].instance.originalWidth * value)));
                }
            }
        });

        heightInput.on('input.raptor', function() {
            var value = parseInt($(this).val());
            if (!isNaN(value)) {
                if (dialogs[plugin.name].instance.proportional) {
                    widthInput.val(Math.round(Math.abs(dialogs[plugin.name].instance.originalWidth / dialogs[plugin.name].instance.originalHeight * value)));
                }
            }
        });

        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/image-resize/image-resize.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/insert-file/insert-file.js
/**
 * @fileOverview Contains the insert file button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to allow the insertation of files.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new DialogButton({
    name: 'insertFile',
    state: false,
    /** @type {string[]} Image extensions*/
    imageTypes: [
        'jpeg',
        'jpg',
        'png',
        'gif'
    ],
    options: {

        /**
         * Save the current state, show the insert file dialog or file manager.
         *
         * @type {null|Function} Specify a function to use instead of the default
         *                       file insertion dialog.
         * @return {Boolean} False to indicate that custom action failed and the
         *                         default dialog should be used.
         */
        customAction: false
    },

    /**
     * Open the insert file dialog or file manager.
     */
    action: function(target) {
        // If a customAction has been specified, use it instead of the default dialog.
        if (!this.options.customAction || this.options.customAction.call(this, target) === false) {
            if (typeof target !== 'undefined') {
                this.getDialog().find('[name=location]').val(target.getAttribute('src') || target.getAttribute('href'));
                this.getDialog().find('[name=name]').val(target.innerHTML);
            } else {
                this.getDialog().find('[name=location]').val('');
                this.getDialog().find('[name=name]').val('');
            }
            return this.openDialog();
        }
    },

    applyAction: function() {
        var dialog = this.getDialog(),
            location = dialog.find('[name=location]').val(),
            name = dialog.find('[name=name]').val();
        this.raptor.actionApply(function() {
            this.insertFiles([{
                location: location,
                name: name
            }]);
        }.bind(this));
    },

    getDialogTemplate: function() {
        return $(this.raptor.getTemplate('insert-file.dialog'));
    },

    /**
     * Attempt to determine the file type from either the file's explicitly set
     * extension property, or the file extension of the file's location property.
     *
     * @param  {Object} file
     * @return {string}
     */
    getFileType: function(file) {
        if (typeof file.extension !== 'undefined') {
            return file.extension.toLowerCase();
        }
        var extension = file.location.split('.');
        if (extension.length > 0) {
            return extension.pop().toLowerCase();
        }
        return 'unknown';
    },

    /**
     * @param  {Object} file
     * @return {Boolean} True if the file is an image.
     */
    isImage: function(file) {
        return $.inArray(this.getFileType(file), this.imageTypes) !== -1;
    },

    /**
     * Insert the given files. If files contains only one item, it is inserted
     * with selectionReplaceWithinValidTags using an appropriate valid tag array
     * for the file's type. If files contains more than one item, the items are
     * processed into an array of HTML strings, joined then inserted using
     * selectionReplaceWithinValidTags with a valid tag array of tags that may
     * contain both image and anchor tags.
     *
     * [
     *     {
     *         location: location of the file, e.g. http://www.raptor-editor.com/images/html5.png
     *         name: a name for the file, e.g. HTML5 Logo
     *         extension: explicitly defined extension for the file, e.g. png
     *     }
     * ]
     *
     * @param  {Object[]} files Array of files to be inserted.
     */
    insertFiles: function(files) {
        this.raptor.resume();
        if (!files.length) {
            return;
        }
        this.raptor.actionApply(function() {
            if (files.length === 1) {
                if ((this.isImage(files[0]) && $(selectionGetHtml()).is('img')) || selectionIsEmpty()) {
                    this.replaceFiles(files);
                } else {
                    this.linkFiles(files);
                }
            } else {
                this.linkFiles(files);
            }
        }.bind(this));
    },

    linkFiles: function(files) {
        selectionExpandTo('a', this.raptor.getElement());
        selectionTrim();
        var applier = rangy.createApplier({
            tag: 'a',
            attributes: {
                href: files[0].location.replace(/([^:])\/\//g, '$1/'),
                title: files[0].name,
                'class': this.options.cssPrefix + 'file ' + this.options.cssPrefix + this.getFileType(files[0])
            }
        });
        applier.applyToSelection();
    },

    replaceFiles: function(files) {
        var elements = [];
        for (var fileIndex = 0; fileIndex < files.length; fileIndex++) {
            elements.push(this.prepareElement(files[fileIndex]));
        }
        selectionReplace(elements.join(', '));
    },

    /**
     * Prepare the HTML for either an image or an anchor tag, depending on the file's type.
     *
     * @param {Object} file
     * @param {string|null} text The text to use as the tag's title and an anchor
     *                           tag's HTML. If null, the file's name is used.
     * @return {string} The tag's HTML.
     */
    prepareElement: function(file, text) {
        if (this.isImage(file)) {
            return this.prepareImage(file, this.options.cssPrefix + this.getFileType(file), text);
        } else {
            return this.prepareAnchor(file, this.options.cssPrefix + 'file ' + this.options.cssPrefix + this.getFileType(file), text);
        }
    },

    /**
     * Prepare HTML for an image tag.
     *
     * @param  {Object} file
     * @param  {string} classNames Classnames to apply to the image tag.
     * @param  {string|null} text Text to use as the image tag's title. If null,
     *                            the file's name is used.
     * @return {string} Image tag's HTML.
     */
    prepareImage: function(file, classNames, text) {
        return $('<div/>').html($('<img/>').attr({
            src: file.location.replace(/([^:])\/\//g, '$1/'),
            title: text || file.name,
            'class': classNames
        })).html();
    },

    /**
     * Prepare HTML for an anchor tag.
     *
     * @param  {Object} file
     * @param  {string} classNames Classnames to apply to the anchor tag.
     * @param  {string|null} text Text to use as the anchor tag's title & content. If null,
     *                            the file's name is used.
     * @return {string} Anchor tag's HTML.
     */
    prepareAnchor: function(file, classNames, text) {
        return $('<div/>').html($('<a/>').attr({
            href: file.location.replace(/([^:])\/\//g, '$1/'),
            title: file.name,
            'class': classNames
        }).html(text || file.name)).html();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/insert-file/insert-file.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-create.js
/**
 * @fileOverview Contains the create link button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var linkMenu,
    linkTypes,
    linkContent,
    linkAttributes;

/**
 * Creates an instance of the dialog toggle button to create links.
 *
 * @todo param stuff?
 * @param {type} param
 */
Raptor.registerUi(new DialogToggleButton({
    name: 'linkCreate',

    dialogOptions: {
        width: 850
    },

    applyAction: function() {
        this.raptor.actionApply(function() {
            if (!linkAttributes || linkAttributes.href.trim() === '') {
                return;
            }

            // Update
            var range = window.getSelection().getRangeAt(0);
            if (range.commonAncestorContainer.tagName === 'A') {
                for (var linkAttribute in linkAttributes) {
                    range.commonAncestorContainer.setAttribute(linkAttribute, linkAttributes[linkAttribute]);
                }
                return;
            }

            // Create
            selectionExpandToWord();
            selectionExpandTo('a', this.raptor.getElement());
            selectionTrim();
            var applier = rangy.createApplier({
                tag: 'a',
                attributes: linkAttributes
            });
            applier.applyToSelection();
            cleanEmptyElements(this.raptor.getElement(), ['a']);
        }.bind(this));
    },

    openDialog: function() {
        this.getDialog();
        var element = selectionGetElement();
        if (element.is('a')) {
            for (var i = 0, l = linkTypes.length; i < l; i++) {
                var result = linkTypes[i].updateInputs(element, linkContent.children('div:eq(' + i + ')'));
                if (result) {
                    linkMenu.find(':radio:eq(' + i + ')').trigger('click');
                }
            }
        }
        DialogToggleButton.prototype.openDialog.call(this);
    },

    validateDialog: function() {
        var i = linkMenu.find(':radio:checked').val();
        linkAttributes = linkTypes[i].getAttributes(linkContent.children('div:eq(' + i + ')'));
        return linkAttributes !== false;
    },

    selectionToggle: function() {
        var element = selectionGetElement();
        if (!element) {
            return false;
        }
        if (element.closest('a').length) {
            return true;
        }
        return false;
    },

    getDialogTemplate: function() {
        var template = $(this.raptor.getTemplate('link.dialog', this.options));

        linkMenu = template.find('[data-menu]');
        linkContent = template.find('[data-content]');
        linkTypes = [
            new LinkTypeInternal(this.raptor),
            new LinkTypeExternal(this.raptor),
            new LinkTypeDocument(this.raptor),
            new LinkTypeEmail(this.raptor)
        ];

        for (var i = 0, l = linkTypes.length; i < l; i++) {
            $(this.raptor.getTemplate('link.label', linkTypes[i]))
                .click(function() {
                    linkContent.children('div').hide();
                    linkContent.children('div:eq(' + $(this).index() + ')').show();
                })
                .find(':radio')
                    .val(i)
                .end()
                .appendTo(linkMenu);
            $('<div>')
                .append(linkTypes[i].getContent())
                .hide()
                .appendTo(linkContent);
        }
        linkMenu.find(':radio:first').prop('checked', true);
        linkContent.children('div:first').show();

        return template;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-remove.js
/**
 * @fileOverview Contains the remove link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the toggle button to remove links.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new PreviewToggleButton({
    name: 'linkRemove',
    disable: true,

    action: function() {
        this.raptor.actionApply(function() {
            document.execCommand('unlink');
        }.bind(this));
    },

    selectionToggle: function() {
        var element = selectionGetElement();
        if (!element) {
            return false;
        }
        if (element.closest('a').length) {
            return true;
        }
        return false;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-remove.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-document.js
/**
 * @fileOverview Contains the document link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The internal link class.
 *
 * @constructor
 * @param {Raptor} raptor
 */
function LinkTypeDocument(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeDocumentLabel');
}

LinkTypeDocument.prototype = Object.create(LinkTypeExternal.prototype);

/**
 * @return {String} The document link panel content.
 */
LinkTypeDocument.prototype.getContent = function() {
    return this.raptor.getTemplate('link.document', this.raptor.options);
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-document.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-email.js
/**
 * @fileOverview Contains the internal link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class Email link class.
 * @constructor
 *
 * @todo param details and des for return.
 * @param {type} raptor
 * @returns {LinkTypeEmail}
 */
function LinkTypeEmail(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeEmailLabel');
}

/**
 * Gets the content of the email link.
 *
 * @returns {Element}
 */
LinkTypeEmail.prototype.getContent = function() {
    return this.raptor.getTemplate('link.email', this.raptor.options);
};

/**
 * Gets the attributes of the email link.
 *
 * @todo panel and return details
 * @param {type} panel
 * @returns {LinkTypeEmail.prototype.getAttributes.Anonym$0|Boolean}
 */
LinkTypeEmail.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=email]').val(),
        subject = panel.find('[name=subject]').val();
    if ($.trim(subject)) {
        subject = '?Subject=' + encodeURIComponent(subject);
    }
    if ($.trim(address) === '') {
        return false;
    }
    return {
        href: 'mailto:' + address + subject
    };
};

/**
 * Updates the users inputs.
 *
 * @todo type and des for panel and des for return.
 * @param {String} link The email link.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeEmail.prototype.updateInputs = function(link, panel) {
    var result = false;
        email = '',
        subject = '',
        href = link.attr('href');
    if (href.indexOf('mailto:') === 0) {
        var subjectPosition = href.indexOf('?Subject=');
        if (subjectPosition > 0) {
            email = href.substring(7, subjectPosition);
            subject = href.substring(subjectPosition + 9);
        } else {
            email = href.substring(7);
            subject = '';
        }
        result = true;
    }
    panel.find('[name=email]').val(email);
    panel.find('[name=subject]').val(subject);
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-email.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-external.js
/**
 * @fileOverview Contains the external link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The external link class.
 * @constructor
 *
 * @todo check please
 * @param {Object} raptor
 * @returns {Element}
 */
function LinkTypeExternal(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeExternalLabel');
}

/**
 * Gets the content of the external link.
 *
 * @returns {Element}
 */
LinkTypeExternal.prototype.getContent = function() {
    return this.raptor.getTemplate('link.external', this.raptor.options);
};

/**
 * Gets the attributes of the external link.
 *
 * @todo type and des for panel
 * @param {type} panel
 * @returns {LinkTypeExternal.prototype.getAttributes.result|Boolean}
 */
LinkTypeExternal.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=location]').val(),
        target = panel.find('[name=blank]').is(':checked'),
        result = {
            href: address
        };

    if (target) {
        result.target = '_blank';
    }

    if ($.trim(result.href) === 'http://') {
        return false;
    }

    return result;
};

/**
 * Updates the users inputs.
 *
 * @todo type and desc for panel and return.
 * @param {String} link The external link.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeExternal.prototype.updateInputs = function(link, panel) {
    var result = false,
        href = link.attr('href');
    if (href.indexOf('http://') === 0) {
        panel.find('[name=location]').val(href);
        result = true;
    } else {
        panel.find('[name=location]').val('http://');
    }
    if (link.attr('target') === '_blank') {
        panel.find('[name=blank]').prop('checked', true);
    } else {
        panel.find('[name=blank]').prop('checked', false);
    }
    return result;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-external.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-internal.js
/**
 * @fileOverview Contains the internal link class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class The internal link class.
 * @constructor
 *
 * @todo check please
 * @param {Object} raptor
 * @returns {Element}
 */
function LinkTypeInternal(raptor) {
    this.raptor = raptor;
    this.label = tr('linkTypeInternalLabel');
}

/**
 * Gets the content of the internal link.
 *
 * @returns {Element}
 */
LinkTypeInternal.prototype.getContent = function() {
    return this.raptor.getTemplate('link.internal', {
        baseClass: this.raptor.options.baseClass,
        domain: window.location.protocol + '//' + window.location.host
    });
};

/**
 * Gets the attributes of the internal link.
 *
 * @todo type and des for panel and return
 * @param {type} panel
 * @returns {LinkTypeInternal.prototype.getAttributes.result}
 */
LinkTypeInternal.prototype.getAttributes = function(panel) {
    var address = panel.find('[name=location]').val(),
        target = panel.find('[name=blank]').is(':checked'),
        result = {
            href: address
        };

    if (target) {
        result.target = '_blank';
    }

    return result;
};

/**
 * Updates the users inputs.
 *
 * @todo type and des for panel and des for return.
 * @param {String} link The internal lnk.
 * @param {type} panel
 * @returns {Boolean}
 */
LinkTypeInternal.prototype.updateInputs = function(link, panel) {
    var href = link.attr('href');
    if (href.indexOf('http://') === -1 &&
            href.indexOf('mailto:') === -1) {
        panel.find('[name=location]').val(href);
    } else {
        panel.find('[name=location]').val('');
    }
    if (link.attr('target') === '_blank') {
        panel.find('[name=blank]').prop('checked', true);
    } else {
        panel.find('[name=blank]').prop('checked', false);
    }
    return false;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/link/link-type-internal.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-ordered.js
/**
 * @fileOverview Contains the ordered list button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the preview toggle button to create ordered lists.
 */
Raptor.registerUi(new Button({
    name: 'listOrdered',
    action: function() {
        document.execCommand('insertOrderedList');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-ordered.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-unordered.js
/**
 * @fileOverview Contains the unordered list button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the preview toggle button to create unordered lists.
 *
 * @todo param details?
 * @param {type} param
 */
Raptor.registerUi(new Button({
    name: 'listUnordered',
    action: function() {
        document.execCommand('insertUnorderedList');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/list/list-unordered.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/logo/logo.js
/**
 * @fileOverview Contains the logo button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a new instance of the button class to display the raptor logo and
 * link to the raptor version page.
 */
Raptor.registerUi(new Button({
    name: 'logo',
    // <usage-statistics>
    init: function() {
        var button = Button.prototype.init.apply(this, arguments);
        button.find('.ui-button-icon-primary').css({
            'background-image': 'url(//www.raptor-editor.com/logo/VERSION?json=' +
                encodeURIComponent(JSON.stringify(this.raptor.options)) + ')'
        });
        return button;
    },
    // </usage-statistics>
    action: function() {
        window.open('http://www.raptor-editor.com/about/VERSION', '_blank');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/logo/logo.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/no-break/no-break.js
/**
 * @fileOverview No break plugin.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */

function NoBreakPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'noBreak', overrides);
}

NoBreakPlugin.prototype = Object.create(RaptorPlugin.prototype);

NoBreakPlugin.prototype.init = function() {
    this.raptor.getElement().on('keypress.raptor', this.preventReturn.bind(this));
    this.raptor.getElement().on('drop.raptor', this.preventDrop.bind(this));
};

NoBreakPlugin.prototype.preventReturn = function(event) {
    if (this.options.enabled && event.which === 13) {
        return false;
    }
};

NoBreakPlugin.prototype.preventDrop = function(event) {
    return this.options.enabled;
// Attempt to allow dropping of plain text (not working)
//
//    console.log(event.originalEvent);
//    var range = rangy.getSelection().getRangeAt(0).cloneRange();
//    console.log(range);
//    console.log(range.startOffset);
//    console.log(range.endOffset);
//    for (var i = 0, l = event.originalEvent.dataTransfer.items.length; i < l; i++) {
//        console.log(event.originalEvent);
//        if (event.originalEvent.dataTransfer.items[i].type == 'text/plain' &&
//                event.originalEvent.dataTransfer.items[i].kind == 'string') {
//            event.originalEvent.dataTransfer.items[i].getAsString(function(content) {
//                this.raptor.actionApply(function() {
//                    rangeReplace(range, content);
////                    selectionReplace(content);
//                })
//            }.bind(this));
//        }
//    }
//    return false;
};

Raptor.registerPlugin(new NoBreakPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/no-break/no-break.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/normalise-line-breaks/normalise-line-breaks.js
/**
 * @fileOverview Contains the view normalise line breaks button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Attempts to enforce standard behaviour across browsers for return &
 * shift+return key presses.
 *
 * @constructor
 * @param {String} name
 * @param {Object} overrides
 */
function NormaliseLineBreaksPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'normaliseLineBreaks', overrides);
}

NormaliseLineBreaksPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Register hotkey actions.
 */
NormaliseLineBreaksPlugin.prototype.init = function() {
    this.raptor.registerHotkey('return', this.returnPressed.bind(this));
    this.raptor.registerHotkey('shift+return', this.shiftReturnPressed.bind(this));
};

NormaliseLineBreaksPlugin.prototype.returnPressedList = function(selectedElement) {
    var selectedListElement = selectedElement.closest('li');
    if (!selectedListElement.length) {
        return false;
    }

    var parentList = selectedListElement.closest('ul, ol');
    var listType = parentList.get(0).tagName.toLowerCase(),
        replacementElement = false;

    // If current list element is empty, list element needs to be replaced with <p>
    if (elementIsEmpty(selectedListElement)) {
        // If not at bottom of list, list must be broken
        var nextListElement = selectedListElement.next();
        if (nextListElement.length && nextListElement.is('li')) {
            replacementElement = listBreakByReplacingSelection(listType, 'li', this.raptor.getElement(), '<p>&nbsp;</p>');
            if (replacementElement) {
                selectionSelectInner(replacementElement.get(0));
            }
        } else {
            selectedListElement.remove();
            selectionSelectInner($('<p>&nbsp;</p>').insertAfter(parentList).get(0));
        }
    } else {
        replacementElement = listBreakAtSelection(listType, 'li', this.raptor.getElement());
        if (replacementElement) {
            selectionSelectStart(replacementElement.get(0));
        }
    }
    return true;

};

/**
 * Handle return keypress.
 *
 * When inside a ul/ol, the the current list item is split and the cursor is
 * placed at the start of the second list item.
 *
 * @return {Boolean} True if the keypress has been handled and should not propagate
 *                        further
 */
NormaliseLineBreaksPlugin.prototype.returnPressed = function() {
    var selectedElement = selectionGetElement();

    if (this.returnPressedList(selectedElement)) {
        return true;
    }
    return false;
};

NormaliseLineBreaksPlugin.prototype.shiftReturnPressedList = function(selectedElement) {
    if (selectedElement.closest('li').length) {
        var listType = selectedElement.closest('ul, ol').get(0).tagName.toLowerCase();
        var replacementElement = listBreakByReplacingSelection(listType, 'li', this.raptor.getElement(), '<p>&nbsp;</p>');
        if (replacementElement) {
            selectionSelectInner(replacementElement.get(0));
        }
        return true;
    }

    return false;
};

/**
 * Handle shift+return keypress.
 *
 * When inside a ul/ol, the the current selection is replaced with a p by splitting the list.
 *
 * @return {Boolean} True if the keypress has been handled and should not propagate
 *                        further
 */
NormaliseLineBreaksPlugin.prototype.shiftReturnPressed = function() {
    var selectedElement = selectionGetElement();
    if (this.shiftReturnPressedList(selectedElement)) {
        return true;
    }
    return false;
};

Raptor.registerPlugin(new NormaliseLineBreaksPlugin());

;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/normalise-line-breaks/normalise-line-breaks.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/paste/paste.js
/**
 * @fileOverview Contains the paste plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var pasteInProgress = false,
    pasteDialog = null,
    pasteInstance = null,
    pasteShiftDown = null;

/**
 * The paste plugin class.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function PastePlugin(name, overrides) {
    /**
     * Default options.
     *
     * @type {Object}
     */
    this.options = {
        /**
         * Tags that will not be stripped from pasted content.
         * @type {Array}
         */
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
            'p', 'a', 'span', 'hr', 'br', 'strong', 'em',
            'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot'
        ],

        allowedAttributes: [
            'href', 'title', 'colspan', 'rowspan'
        ],

        allowedEmptyTags: [
            'hr', 'br', 'td', 'th'
        ],

        panels: [
            'formatted-clean',
            'plain-text',
            'formatted-unclean',
            'source'
        ]
    };

    RaptorPlugin.call(this, name || 'paste', overrides);
}

PastePlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Enables pasting.
 */
PastePlugin.prototype.enable = function() {
    this.raptor.getElement().on('paste.raptor', this.capturePaste.bind(this));
};

PastePlugin.prototype.capturePaste = function(event) {
    if (pasteShiftDown) {
        return;
    }
    if (pasteInProgress) {
        return false;
    }

    selectionSave();

    var element = this.raptor.getNode();
    var savedContent = element.innerHTML;
    if (element && element.clipboardData && event.clipboardData.getData) {
        // Webkit - get data from clipboard, put into editable, cleanup, then cancel event
        if (/text\/html/.test(event.clipboardData.types)) {
            element.innerHTML = event.clipboardData.getData('text/html');
        } else if (/text\/plain/.test(event.clipboardData.types)) {
            element.innerHTML = event.clipboardData.getData('text/plain');
        } else {
            element.innerHTML = '';
        }
        this.waitForPasteData(element, savedContent);
        event.stopPropagation();
        event.preventDefault();
        return false;
    } else {
        // Everything else - empty editable and allow browser to paste content into it, then cleanup
        element.innerHTML = '';
        this.waitForPasteData(element, savedContent);
        return true;
    }
};

PastePlugin.prototype.waitForPasteData = function(element, savedContent) {
    if (element.innerHTML !== '') {
        this.processPaste(element, savedContent);
    } else {
        setTimeout(function() {
            this.waitForPasteData(element, savedContent)
        }.bind(this), 20);
    }
};

PastePlugin.prototype.processPaste = function(element, savedContent) {
    var pastedData = element.innerHTML;
    element.innerHTML = savedContent;
    this.showPasteDialog(pastedData);
};

/**
 * Opens the paste dialog.
 */
PastePlugin.prototype.showPasteDialog = function(pastedData) {
    aDialogOpen(this.getDialog(this, pastedData));
};

/**
 * Inserts the pasted content into the selection.
 *
 * @param {HTML} html The html to be pasted into the selection.
 */
PastePlugin.prototype.pasteContent = function(html) {
    this.raptor.actionApply(function() {
        // @todo fire an event to allow plugins to clean up, i.e. table plugin adding a cms-table class
        var uniqueId = elementUniqueId();
        selectionRestore();
        html = this.filterAttributes(html);
        html = this.filterChars(html);
        selectionReplace($('<placeholder id="' + uniqueId + '">' + html + '</placeholder>'));
        var placeholder = $('#' + uniqueId);
        selectionSelectInner(placeholder.get(0));
        selectionSave();
        placeholder.contents().unwrap();
        selectionRestore();
    }.bind(this));
};

/**
 * Gets the paste dialog.
 *
 * @todo type for instance
 * @param {type} instance The paste instance
 * @returns {Object} The paste dialog.
 */
PastePlugin.prototype.getDialog = function(instance, pastedData) {
    pasteInstance = instance;
    if (!pasteDialog) {
        pasteDialog = $('<div>').html(this.raptor.getTemplate('paste.dialog', this.options));
        for (var i = 0, l = this.options.panels.length; i < l; i++) {
            pasteDialog.find('.' + this.options.baseClass + '-tab-' + this.options.panels[i]).css('display', '');
            if (i === 0) {
                pasteDialog.find('.' + this.options.baseClass + '-content-' + this.options.panels[i]).css('display', '');
            }
        }
        pasteDialog.find('.' + this.options.baseClass + '-panel-tabs > div:visible:not(:first)').hide();
        aDialog(pasteDialog, {
            modal: true,
            resizable: true,
            autoOpen: false,
            width: 800,
            height: 500,
            minWidth: 700,
            minHeight: 400,
            title: tr('pasteDialogTitle'),
            dialogClass: this.options.baseClass + '-dialog',
            close: function() {
                pasteInProgress = false;
            },
            buttons: [
                {
                    text: tr('pasteDialogOKButton'),
                    click: function() {
                        var element = pasteDialog.find('.' + this.options.baseClass + '-area:visible');
                        aDialogClose(pasteDialog);
                        pasteInstance.pasteContent(element.html());
                    }.bind(this),
                    icons: {
                        primary: 'ui-icon-circle-check'
                    }
                },
                {
                    text: tr('pasteDialogCancelButton'),
                    click: function() {
                        selectionDestroy();
                        aDialogClose(pasteDialog);
                    },
                    icons: {
                        primary: 'ui-icon-circle-close'
                    }
                }
            ]
        });

        // Create fake jQuery UI tabs (to prevent hash changes)
        var tabs = pasteDialog.find('.' + this.options.baseClass + '-panel-tabs');
        tabs.find('li')
            .click(function() {
                tabs.find('ul li').removeClass('ui-state-active').removeClass('ui-tabs-selected');
                $(this).addClass('ui-state-active').addClass('ui-tabs-selected');
                tabs.children('div').hide().eq($(this).index()).show();
            });
    }
    this.updateAreas(pastedData);
    return pasteDialog;
};

/**
 * Attempts to filter rubbish from content using regular expressions.
 *
 * @param  {String} content Dirty text
 * @return {String} The filtered content
 */
PastePlugin.prototype.filterAttributes = function(content) {
    // The filters variable is an array of of regular expression & handler pairs.
    //
    // The regular expressions attempt to strip out a lot of style data that
    // MS Word likes to insert when pasting into a contentEditable.
    // Almost all of it is junk and not good html.
    //
    // The hander is a place to put a function for match handling.
    // In most cases, it just handles it as empty string.  But the option is there
    // for more complex handling.
    var filters = [
        // Meta tags, link tags, and prefixed tags
        {regexp: /(<meta\s*[^>]*\s*>)|(<\s*link\s* href="file:[^>]*\s*>)|(<\/?\s*\w+:[^>]*\s*>)/gi, handler: ''},
        // MS class tags and comment tags.
        {regexp: /(class="Mso[^"]*")|(<!--(.|\s){1,}?-->)/gi, handler: ''},
        // Apple class tags
        {regexp: /(class="Apple-(style|converted)-[a-z]+\s?[^"]+")/, handle: ''},
        // Google doc attributes
        {regexp: /id="internal-source-marker_[^"]+"|dir="[rtl]{3}"/, handle: ''},
        // blank p tags
        {regexp: /(<p[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/p[^>]*>)|(<p[^>]*>\s*<font[^>]*>\s*(\&nbsp;|\u00A0)*\s*<\/\s*font\s*>\s<\/p[^>]*>)/ig, handler: ''},
        // Strip out styles containing mso defs and margins, as likely added in IE and are not good to have as it mangles presentation.
        {regexp: /(style="[^"]*mso-[^;][^"]*")|(style="margin:\s*[^;"]*;")/gi, handler: ''},
        // Style tags
        {regexp: /(?:<style([^>]*)>([\s\S]*?)<\/style>|<link\s+(?=[^>]*rel=['"]?stylesheet)([^>]*?href=(['"])([^>]*?)\4[^>\/]*)\/?>)/gi, handler: ''},
        // Scripts (if any)
        {regexp: /(<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>)|(<\s*script\b([^<>]|\s)*>?)|(<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>)/ig, handler: ''}
    ];

    $.each(filters, function(i, filter) {
        content = content.replace(filter.regexp, filter.handler);
    });

    return content;
};

/**
 * Replaces commonly-used Windows 1252 encoded chars that do not exist in ASCII or ISO-8859-1 with ISO-8859-1 cognates.
 * @param  {[type]} content [description]
 * @return {[type]}
 */
PastePlugin.prototype.filterChars = function(content) {
    var s = content;

    // smart single quotes and apostrophe
    s = s.replace(/[\u2018|\u2019|\u201A]/g, '\'');

    // smart double quotes
    s = s.replace(/[\u201C|\u201D|\u201E]/g, '\"');

    // ellipsis
    s = s.replace(/\u2026/g, '...');

    // dashes
    s = s.replace(/[\u2013|\u2014]/g, '-');

    // circumflex
    s = s.replace(/\u02C6/g, '^');

    // open angle bracket
    s = s.replace(/\u2039/g, '<');

    // close angle bracket
    s = s.replace(/\u203A/g, '>');

    // spaces
    s = s.replace(/[\u02DC|\u00A0]/g, ' ');

    return s;
};

/**
 * Strip all attributes from content (if it's an element), and every element contained within
 * Strip loop taken from <a href="http://stackoverflow.com/a/1870487/187954">Remove all attributes</a>
 * @param  {String|Element} content The string / element to be cleaned
 * @return {String} The cleaned string
 */
PastePlugin.prototype.stripAttributes = function(content) {
    content = $('<div/>').html(content);
    var allowedAttributes = this.options.allowedAttributes;

    $(content.find('*')).each(function() {
        // First copy the attributes to remove if we don't do this it causes problems iterating over the array
        // we're removing elements from
        var attributes = [];
        $.each(this.attributes, function(index, attribute) {
            // Do not remove allowed attributes
            if (-1 !== $.inArray(attribute.nodeName, allowedAttributes)) {
                return;
            }
            attributes.push(attribute.nodeName);
        });

        // now remove the attributes
        for (var attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
            $(this).attr(attributes[attributeIndex], null);
        }
    });
    return content.html();
};

/**
 * Remove empty tags.
 *
 * @param {String} content The HTML containing empty elements to be removed
 * @return {String} The cleaned HTML
 */
PastePlugin.prototype.stripEmpty = function(content) {
    var wrapper = $('<div/>').html(content);
    var allowedEmptyTags = this.options.allowedEmptyTags;
    wrapper.find('*').filter(function() {
        // Do not strip elements in allowedEmptyTags
        if (-1 !== $.inArray(this.tagName.toLowerCase(), allowedEmptyTags)) {
            return false;
        }
        // If the element has at least one child element that exists in allowedEmptyTags, do not strip it
        if ($(this).find(allowedEmptyTags.join(',')).length) {
            return false;
        }
        return $.trim($(this).text()) === '';
    }).remove();
    return wrapper.html();
};

/**
 * Remove spans that have no attributes.
 *
 * @param {String} content
 * @return {String} The cleaned HTML
 */
PastePlugin.prototype.stripSpans = function(content) {
    var wrapper = $('<div/>').html(content);
    wrapper.find('span').each(function() {
        if (!this.attributes.length) {
            $(this).replaceWith($(this).html());
        }
    });
    return wrapper.html();
};

/**
 * Update text input content.
 */
PastePlugin.prototype.updateAreas = function(pastedData) {
    var markup = pastedData;
    markup = this.filterAttributes(markup);
    markup = this.filterChars(markup);
    markup = this.stripEmpty(markup);
    markup = this.stripAttributes(markup);
    markup = this.stripSpans(markup);
    markup = stringStripTags(markup, this.options.allowedTags);

    var plain = $('<div/>').html(pastedData).text();
    var html = pastedData;

    pasteDialog.find('.' + this.options.baseClass + '-markup').html(markup);
    pasteDialog.find('.' + this.options.baseClass + '-plain').html(plain.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br/>$2'));
    pasteDialog.find('.' + this.options.baseClass + '-rich').html(markup);
    pasteDialog.find('.' + this.options.baseClass + '-source').text(html);
};

$(document).on('keyup.raptor keydown.raptor', function(event) {
    pasteShiftDown = event.shiftKey;
});

Raptor.registerPlugin(new PastePlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/paste/paste.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/placeholder/placeholder.js
/**
 * @fileOverview Placeholder text component.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 * @author Michael Robinson michael@panmedia.co.nz
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Placeholder plugin
 *
 * @constructor
 * @augments RaptorPlugin
 * @param {[type]} name
 * @param {[type]} overrides
 */
function PlaceholderPlugin(name, overrides) {

    /**
     * Default placholder plugin options.
     *
     * @type {Object}
     */
    this.options = {

        /**
         * The placeholder content used if the Raptor Editor's instance has no content.
         *
         * @type {String}
         */
        content: tr('placeholderPluginDefaultContent'),

        /**
         * Tag to wrap placeholder content.
         *
         * @type {String}
         */
        tag: 'p',

        /**
         * Select placeholder content when inserted.
         *
         * @type {Boolean}
         */
        select: true
    };

    RaptorPlugin.call(this, name || 'placeholder', overrides);
}

PlaceholderPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Init placeholder plugin.
 */
PlaceholderPlugin.prototype.init = function() {
    this.raptor.bind('enabled', this.enabled.bind(this));
    this.raptor.bind('change', this.check.bind(this));
};

/**
 * Insert the placeholder if the editable element is empty.
 */
PlaceholderPlugin.prototype.enabled = function() {
    this.check(this.raptor.getHtml());
};

PlaceholderPlugin.prototype.check = function(html) {
    html = html.trim();
    if (!html || html === '<br>' || html === '<div><br></div>') {
        var raptorNode = this.raptor.getNode(),
            tag = document.createElement(this.options.tag);
        tag.innerHTML = this.options.content;
        raptorNode.innerHTML = '';
        raptorNode.appendChild(tag);
        if (this.options.select) {
            selectionSelectInner(raptorNode.childNodes[0]);
        }
        this.raptor.checkChange();
    }
};

Raptor.registerPlugin(new PlaceholderPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/placeholder/placeholder.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save.js
/**
 * @fileOverview Contains the save class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the button class to save any changes.
 */
Raptor.registerUi(new Button({
    name: 'save',

    action: function() {
        if (this.getPlugin()) {
            this.getPlugin().save();
        } else {
            aNotify({
                text: tr('saveNotConfigured'),
                type: 'error'
            });
        }
    },

    init: function() {
        if (this.options.plugin === null) {
            return;
        }

        var result = Button.prototype.init.apply(this, arguments);

        // <strict/>

        if (this.options.checkDirty !== false) {
            this.raptor.bind('dirty', this.dirty.bind(this));
            this.raptor.bind('cleaned', this.clean.bind(this));
            this.clean();
        }
        return result;
    },

    getPlugin: function() {
        return this.raptor.getPlugin(this.options.plugin);
    },

    dirty: function() {
        aButtonEnable(this.button);
    },

    clean: function() {
        aButtonDisable(this.button);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save-json.js
/**
 * @fileOverview Contains the save JSON plugin code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The save JSON class.
 *
 * @constructor
 * @param {String} name
 * @param {Object} overrides
 */
function SaveJsonPlugin(name, overrides) {
    this.options = {
        retain: false,
        checkDirty: true
    };
    RaptorPlugin.call(this, name || 'saveJson', overrides);
    this.size = null;
}

SaveJsonPlugin.prototype = Object.create(RaptorPlugin.prototype);

Raptor.registerPlugin(new SaveJsonPlugin());

// <strict/>

/**
 * Save Raptor content.
 */
SaveJsonPlugin.prototype.save = function(saveSections) {
    // Hack save sections
    if (typeof RaptorSection !== 'undefined' && saveSections !== false) {
        RaptorSection.save(false);
    }
    var data = {};
    this.raptor.unify(function(raptor) {
        if (this.options.checkDirty === false || raptor.isDirty()) {
            raptor.clean();
            var plugin = raptor.getPlugin('saveJson');
            var id = plugin.options.id.call(plugin);
            var html = raptor.getHtml();
            if (plugin.options.data) {
                // <strict/>
                data[id] = plugin.options.data.call(this, html);
            } else {
                data[id] = html;
            }
        }
    }.bind(this));
    var post = {};
    this.size = Object.keys(data).length;
    post[this.options.postName] = JSON.stringify(data);
    if (this.options.post) {
        // <strict/>
        post = this.options.post.call(this, post);
    }
    $.ajax({
            type: this.options.type || 'post',
            dataType: this.options.dataType || 'json',
            url: this.options.url,
            data: post
        })
        .done(this.done.bind(this))
        .fail(this.fail.bind(this));
};

/**
 * Done handler.
 *
 * @param {Object} data
 * @param {Integer} status
 * @param {Object} xhr
 */
SaveJsonPlugin.prototype.done = function(data, status, xhr) {
    this.raptor.unify(function(raptor) {
        if (!raptor.getPlugin('saveJson').options.checkDirty || raptor.isDirty()) {
            raptor.saved([data, status, xhr]);
        }
    });
    var message = tr('saveJsonSaved', {
        saved: this.size
    });
    if (this.options.formatResponse) {
        // <strict/>
        message = this.options.formatResponse.call(this, data, status, xhr) || message;
    }
    aNotify({
        text: message,
        type: 'success'
    });
    if (!this.options.retain) {
        this.raptor.unify(function(raptor) {
            raptor.disableEditing();
        });
    }
};

/**
 * Fail handler.
 *
 * @param {Object} xhr
 */
SaveJsonPlugin.prototype.fail = function(xhr, status, error) {
    this.raptor.fire('save-failed', [xhr.responseJSON || xhr.responseText, status, xhr]);
    var message = tr('saveJsonFail', {
        failed: this.size
    });
    if (this.options.formatResponse) {
        // <strict/>
        message = this.options.formatResponse.call(this, xhr.responseJSON || xhr.responseText, status, xhr) || message;
    }
    aNotify({
        text: message,
        type: 'error'
    });
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/save/save-json.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/snippet-menu/snippet-menu.js
/**
 * @fileOverview Contains the snippet menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The snippet menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options
 */
function SnippetMenu(options) {
    SelectMenu.call(this, {
        name: 'snippetMenu'
    });
}

SnippetMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initialize the snippet menu.
 *
 * @returns {Element}
 */
SnippetMenu.prototype.init = function() {
    var result = SelectMenu.prototype.init.call(this);
    if (typeof this.options.snippets !== 'undefined' &&
            Object.keys(this.options.snippets).length > 0) {
        return result;
    }
};

/**
 * Inserts the snippet into the selected text.
 *
 * @todo type for name
 * @param {type} name The name of the snippet.
 */
SnippetMenu.prototype.insertSnippet = function(name) {
    selectionReplace(this.options.snippets[name]);
};

/**
 * Applies the insertion of the snippet.
 *
 * @param {type} event The click event that applies the snippet.
 */
SnippetMenu.prototype.menuItemMouseDown = function(event) {
    this.raptor.actionApply(function() {
        this.insertSnippet($(event.currentTarget).data('name'));
    }.bind(this));
};

/**
 * Previews the insertion of a snippet.
 *
 * @param {type} event The mouse event that triggers the preview.
 */
SnippetMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.insertSnippet($(event.currentTarget).data('name'));
    }.bind(this));
};

/**
 * Removes the preview state.
 */
SnippetMenu.prototype.menuItemMouseLeave = function() {
    this.raptor.actionPreviewRestore();
};

/**
 * Gets the menu items for the snippet menu.
 *
 * @todo check type for return
 * @returns {Element} The menu items.
 */
SnippetMenu.prototype.getMenuItems = function() {
    var items = '';
    for (var name in this.options.snippets) {
        items += this.raptor.getTemplate('snippet-menu.item', {
            name: name
        });
    }
    return items;
};

Raptor.registerUi(new SnippetMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/snippet-menu/snippet-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/special-characters/special-characters.js
/**
 * @fileOverview Contains the special characters button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var insertCharacter = false;

/**
 * Creates an instance of the button class to insert special characters.
 */
Raptor.registerUi(new DialogButton({
    name: 'specialCharacters',
    dialogOptions: {
        width: 645
    },
    options: {
        setOrder: [
            'symbols',
            'mathematics',
            'arrows',
            'greekAlphabet'
        ],
        /**
         * Character sets available for display. From {@link http://turner.faculty.swau.edu/webstuff/htmlsymbols.html}
         */
        characterSets: {
            symbols: {
                name: tr('specialCharactersSymbols'),
                characters: [
                    ['<', '&lt;', 'less than'],
                    ['>', '&gt;', 'greater than'],
                    ['&', '&amp;', 'ampersand'],
                    ['"', '&quot;', 'quotation mark'],
                    ['&nbsp;', 'non-breaking space: \' \''],
                    ['&emsp;', 'em space: \'  \''],
                    ['&ensp;', 'en space: \' \''],
                    ['&thinsp;', 'thin space: \'\''],
                    ['&mdash;', 'em dash'],
                    ['&ndash;', 'en dash'],
                    ['&minus;', 'minus'],
                    ['-', 'hyphen'],
                    ['&oline;', 'overbar space'],
                    ['&cent;', 'cent'],
                    ['&pound;', 'pound'],
                    ['&euro;', 'euro'],
                    ['&sect;', 'section'],
                    ['&dagger;', 'dagger'],
                    ['&Dagger;', 'double dagger'],
                    ['&lsquo;', 'left single quotes'],
                    ['&rsquo;', 'right single quotes'],
                    ['\'', 'single quotes'],
                    ['&#x263a;', 'smiley face'],
                    ['&#x2605;', 'black star'],
                    ['&#x2606;', 'white star'],
                    ['&#x2610;', 'check box'],
                    ['&middot;', 'middle dot'],
                    ['&bull;', 'bullet'],
                    ['&copy;', 'copyright'],
                    ['&reg;', 'registered'],
                    ['&trade;', 'trade'],
                    ['&iquest;', 'inverted question mark'],
                    ['&iexcl;', 'inverted exclamation mark'],
                    ['&Aring;', 'Angström'],
                    ['&hellip;', 'ellipsis'],
                    ['&#x2295;', 'earth'],
                    ['&#x2299;', 'sun'],
                    ['&#x2640;', 'female'],
                    ['&#x2642;', 'male'],
                    ['&clubs;', 'clubs or shamrock'],
                    ['&spades;', 'spades'],
                    ['&hearts;', 'hearts or valentine'],
                    ['&diams;', 'diamonds'],
                    ['&loz;', 'diamond']
                ]
            },
            mathematics: {
                name: tr('specialCharactersMathematics'),
                characters: [
                    ['&lt;', 'less than'],
                    ['&le;', 'less than or equal to'],
                    ['&gt;', 'greater than'],
                    ['&ge;', 'greater than or equal to'],
                    ['&ne;', 'not equal'],
                    ['&asymp;', 'approximately equal to'],
                    ['&equiv;', 'identically equal to'],
                    ['&cong;', 'congruent to'],
                    ['&prop;', 'proportional'],
                    ['&there4;', 'therefore'],
                    ['&sum;', 'summation'],
                    ['&prod;', 'product'],
                    ['&prime;', 'prime or minutes'],
                    ['&Prime;', 'double prime or seconds'],
                    ['&Delta;', 'delta'],
                    ['&nabla;', 'del'],
                    ['&part;', 'partial'],
                    ['&int;', 'integral'],
                    ['&middot;', 'middle dot'],
                    ['&sdot;', 'dot operator'],
                    ['&bull;', 'bullet'],
                    ['&minus;', 'minus sign'],
                    ['&times;', 'multipllcation sign'],
                    ['&divide;', 'division sign'],
                    ['&frasl;', 'fraction slash, (ordinary / \\)'],
                    ['&plusmn;', 'plus or minus'],
                    ['&deg;', 'degree sign'],
                    ['&lfloor;', 'floor function'],
                    ['&rfloor;', 'floor function'],
                    ['&lceil;', 'ceiling function'],
                    ['&rceil;', 'ceiling function'],
                    ['&lowast;', 'asterisk operator, (ordinary *)'],
                    ['&oplus;', 'circled plus'],
                    ['&otimes;', 'circled times'],
                    ['&ordm;', 'masculine ordinal'],
                    ['&lang;', 'bra'],
                    ['&rang;', 'ket'],
                    ['&infin;', 'infinity'],
                    ['&pi;', 'pi'],
                    ['&frac12;', 'half'],
                    ['&alefsym;', 'aleph'],
                    ['&radic;', 'radical'],
                    ['&ang;', 'angle'],
                    ['&perp;', 'perpendicular'],
                    ['&real;', 'real'],
                    ['&isin;', 'is an element of'],
                    ['&notin;', 'not an element of'],
                    ['&empty;', 'null set'],
                    ['&sub;', 'subset of'],
                    ['&sube;', 'subset or or equal to'],
                    ['&nsub;', 'not a subset'],
                    ['&cap;', 'intersection'],
                    ['&cup;', 'union'],
                    ['&sim;', 'tilde operator (ordinary ~)'],
                    ['&Oslash;', 'slash O'],
                    ['&and;', 'logical and'],
                    ['&Lambda;', 'lambda (and)'],
                    ['&or;', 'logical or'],
                    ['&not;', 'not sign'],
                    ['&sim;', 'tilde operator (ordinary ~)'],
                    ['&rarr;', 'right arrow'],
                    ['&rArr;', 'double right arrow'],
                    ['&larr;', 'left arrow'],
                    ['&lArr;', 'left double arrow'],
                    ['&harr;', 'left right arrow'],
                    ['&hArr;', 'left right double arrow']
                ]
            },
            arrows: {
                name: tr('specialCharactersArrows'),
                characters: [
                    ['&darr;', 'down arrow'],
                    ['&dArr;', 'down double arrow'],
                    ['&uarr;', 'up arrow'],
                    ['&uArr;', 'up double arrow'],
                    ['&crarr;', 'arriage return arrow'],
                    ['&rarr;', 'right arrow'],
                    ['&rArr;', 'double right arrow'],
                    ['&larr;', 'left arrow'],
                    ['&lArr;', 'left double arrow'],
                    ['&harr;', 'left right arrow'],
                    ['&hArr;', 'left right double arrow']
                ]
            },
            greekAlphabet: {
                name: tr('specialCharactersGreekAlphabet'),
                characters: [
                    ['&alpha;', 'alpha'],
                    ['&beta;', 'beta'],
                    ['&gamma;', 'gamma'],
                    ['&delta;', 'delta'],
                    ['&epsilon;', 'epsilon'],
                    ['&zeta;', 'zeta'],
                    ['&eta;', 'eta'],
                    ['&theta;', 'theta'],
                    ['&iota;', 'iota'],
                    ['&kappa;', 'kappa'],
                    ['&lambda;', 'lambda'],
                    ['&mu;', 'mu'],
                    ['&nu;', 'nu'],
                    ['&xi;', 'xi'],
                    ['&omicron;', 'omicron'],
                    ['&pi;', 'pi'],
                    ['&rho;', 'rho'],
                    ['&sigma;', 'sigma'],
                    ['&tau;', 'tau'],
                    ['&upsilon;', 'upsilon'],
                    ['&phi;', 'phi'],
                    ['&chi;', 'chi'],
                    ['&psi;', 'psi'],
                    ['&omega;', 'omega'],
                    ['&Alpha;', 'alpha'],
                    ['&Beta;', 'beta'],
                    ['&Gamma;', 'gamma'],
                    ['&Delta;', 'delta'],
                    ['&Epsilon;', 'epsilon'],
                    ['&Zeta;', 'zeta'],
                    ['&Eta;', 'eta'],
                    ['&Theta;', 'theta'],
                    ['&Iota;', 'iota'],
                    ['&Kappa;', 'kappa'],
                    ['&Lambda;', 'lambda'],
                    ['&Mu;', 'mu'],
                    ['&Nu;', 'nu'],
                    ['&Xi;', 'xi'],
                    ['&Omicron;', 'omicron'],
                    ['&Pi;', 'pi'],
                    ['&Rho;', 'rho'],
                    ['&Sigma;', 'sigma'],
                    ['&Tau;', 'tau'],
                    ['&Upsilon;', 'upsilon'],
                    ['&Phi;', 'phi'],
                    ['&Chi;', 'chi'],
                    ['&Psi;', 'psi'],
                    ['&Omega;', 'omega']
                ]
            }
        }
    },

    applyAction: function(dialog) {
        this.raptor.actionApply(function() {
            if (insertCharacter) {
                selectionReplace(insertCharacter);
            }
            insertCharacter = false;
        });
    },

    /**
     * Prepare tabs and add buttons to tab content.
     *
     * @return {Element}
     */
    getDialogTemplate: function() {
        var html = $(this.raptor.getTemplate('special-characters.dialog')).appendTo('body').hide();
        var setKey, tabContent, character, characterButton;
        for (var setOrderIndex = 0; setOrderIndex < this.options.setOrder.length; setOrderIndex++) {
            setKey = this.options.setOrder[setOrderIndex];

            html.find('ul').append(this.raptor.getTemplate('special-characters.tab-li', {
                baseClass: this.options.baseClass,
                name: this.options.characterSets[setKey].name,
                key: setKey
            }));

            tabContent = $(this.raptor.getTemplate('special-characters.tab-content', {
                baseClass: this.options.baseClass,
                key: setKey
            }));
            var tabCharacters = [];
            for (var charactersIndex = 0; charactersIndex < this.options.characterSets[setKey].characters.length; charactersIndex++) {
                character = this.options.characterSets[setKey].characters[charactersIndex];
                characterButton = this.raptor.getTemplate('special-characters.tab-button', {
                    htmlEntity: character[0],
                    description: character[1],
                    setKey: setKey,
                    charactersIndex: charactersIndex
                });
                tabCharacters.push(characterButton);
            }
            tabContent.append(tabCharacters.join(''));
            html.find('ul').after(tabContent);
        }
        html.show();

        var _this = this;
        html.find('button').each(function() {
            aButton($(this));
        }).click(function() {
            var setKey = $(this).attr('data-setKey');
            var charactersIndex = $(this).attr('data-charactersIndex');
            insertCharacter = _this.options.characterSets[setKey].characters[charactersIndex][0];
            _this.getOkButton(_this.name).click.call(this);
        });
        aTabs(html);
        return html;
    },

    getCancelButton: function() {
        return;
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/special-characters/special-characters.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/statistics/statistics.js
/**
 * @fileOverview Contains the statistics code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var statisticsDialog = null;

/**
 * Creates an instance of a dialog button to display the pages statistics.
 */
Raptor.registerUi(new DialogButton({
    name: 'statistics',
    options: {
        maximum: 100,
        showCountInButton: true
    },
    dialogOptions: {
        width: 350
    },

    init: function() {
        if (this.options.showCountInButton) {
            this.raptor.bind('change', this.updateButton.bind(this));
        }
        return DialogButton.prototype.init.apply(this, arguments);
    },

    applyAction: function() {
    },

    getCancelButton: function() {
    },

    getCharacterCount: function() {
        return $('<div>').html(this.raptor.getHtml()).text().trim().length;
    },

    getContent: function() {
        return $('<div>').html(this.raptor.getHtml()).text().trim();
    },

    updateButton: function() {
        var charactersRemaining = null,
            label = null,
            characterCount = this.getCharacterCount();

        // Cases where maximum has been provided
        if (this.options.maximum) {
            charactersRemaining = this.options.maximum - characterCount;
            if (charactersRemaining >= 0) {
                label = tr('statisticsButtonCharacterRemaining', {
                    charactersRemaining: charactersRemaining
                });
            } else {
                label = tr('statisticsButtonCharacterOverLimit', {
                    charactersRemaining: charactersRemaining * -1
                });
            }
        } else {
            label = tr('statisticsButtonCharacters', {
                characters: characterCount
            });
        }

        aButtonSetLabel(this.button, label);

        if (!this.options.maximum) {
            return;
        }

        // Add the error state to the button's text element if appropriate
        if (charactersRemaining < 0) {
            this.button.addClass('ui-state-error').removeClass('ui-state-default');
        } else{
            // Add the highlight class if the remaining characters are in the "sweet zone"
            if (charactersRemaining >= 0 && charactersRemaining <= 15) {
                this.button.addClass('ui-state-highlight').removeClass('ui-state-error ui-state-default');
            } else {
                this.button.removeClass('ui-state-highlight ui-state-error').addClass('ui-state-default');
            }
        }
    },

    getButton: function() {
        if (!this.button) {
            Button.prototype.getButton.call(this);
            aButton(this.button, {
                text: true
            });
            if (this.options.showCountInButton) {
                this.updateButton();
            }
        }
        return this.button;
    },

    getDialogTemplate: function() {
        return $(this.raptor.getTemplate('statistics.dialog', this.options));
    },

    /**
     * Process and return the statistics dialog template.
     *
     * @return {jQuery} The processed statistics dialog template
     */
    openDialog: function() {
        var dialog = this.getDialog(),
            content = this.getContent();

        // If maximum has not been set, use infinity
        var charactersRemaining = this.options.maximum ? this.options.maximum - content.length : '&infin;';
        if (typeIsNumber(charactersRemaining) && charactersRemaining < 0) {
            dialog.find('[data-name=truncation]').html(tr('statisticsDialogTruncated', {
                'limit': this.options.maximum
            }));
        } else {
            dialog.find('[data-name=truncation]').html(tr('statisticsDialogNotTruncated'));
        }

        var totalWords = content.split(' ').length;
        if (totalWords === 1) {
            dialog.find('[data-name=words]').html(tr('statisticsDialogWord', {
                words: totalWords
            }));
        } else {
            dialog.find('[data-name=words]').html(tr('statisticsDialogWords', {
                words: totalWords
            }));
        }

        var totalSentences = content.split('. ').length;
        if (totalSentences === 1) {
            dialog.find('[data-name=sentences]').html(tr('statisticsDialogSentence', {
                sentences: totalSentences
            }));
        } else {
            dialog.find('[data-name=sentences]').html(tr('statisticsDialogSentences', {
                sentences: totalSentences
            }));
        }

        var characters = null;
        if (charactersRemaining >= 0 || !typeIsNumber(charactersRemaining)) {
            dialog.find('[data-name=characters]').html(tr('statisticsDialogCharactersRemaining', {
                characters: content.length,
                charactersRemaining: charactersRemaining
            }));
        } else {
            dialog.find('[data-name=characters]').html(tr('statisticsDialogCharactersOverLimit', {
                characters: content.length,
                charactersRemaining: charactersRemaining * -1
            }));
        }
        DialogButton.prototype.openDialog.call(this);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/statistics/statistics.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-cell-button.js
/**
 * @fileOverview Contains the table cell button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The table cell button class.
 *
 * @constructor
 * @augments FilteredPreviewButton
 *
 * @param {Object} options Options hash.
 */
function TableCellButton(options) {
    FilteredPreviewButton.call(this, options);
}

TableCellButton.prototype = Object.create(FilteredPreviewButton.prototype);

/**
 * @todo
 *
 * @param {RangySelection} range The selection to get the cell from.
 * @returns {Element|null}
 */
TableCellButton.prototype.getElement = function(range) {
    var cell = $(range.commonAncestorContainer.parentNode).closest('td, th');
    if (cell.length && !cell.find(this.raptor.getElement()).length) {
        return cell[0];
    }
    return null;
};
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-cell-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-create.js
/**
 * @fileOverview Contains the table menu class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The table menu class.
 *
 * @constructor
 * @augments Menu
 *
 * @param {Object} options Options hash.
 */
function TableMenu(options) {
    Menu.call(this, {
        name: 'tableCreate'
    });
}

TableMenu.prototype = Object.create(Menu.prototype);

/**
 * Creates the menu table.
 *
 * @param event The mouse event to create the table.
 */
TableMenu.prototype.createTable = function(event) {
    this.raptor.actionApply(function() {
        selectionReplace(elementOuterHtml($(tableCreate(event.target.cellIndex + 1, event.target.parentNode.rowIndex + 1, {
            placeHolder: '&nbsp;'
        }))));
    });
};

/**
 * Highlights the cells inside the table menu.
 *
 * @param event The mouse event to trigger the function.
 */
TableMenu.prototype.highlight = function(event) {
    var cells = tableCellsInRange(this.menuTable.get(0), {
            x: 0,
            y: 0
        }, {
            x: event.target.cellIndex,
            y: event.target.parentNode.rowIndex
        });

    // highlight cells in menu
    this.highlightRemove(event);
    $(cells).addClass(this.options.baseClass + '-menu-hover');

    // Preview create
    this.raptor.actionPreview(function() {
        selectionReplace(elementOuterHtml($(tableCreate(event.target.cellIndex + 1, event.target.parentNode.rowIndex + 1, {
            placeHolder: '&nbsp;'
        }))));
    });
};

/**
 * Removes the highlight from the table menu.
 *
 * @param event The mouse event to trigger the function.
 */
TableMenu.prototype.highlightRemove = function(event) {
    this.menuTable
        .find('.' + this.options.baseClass + '-menu-hover')
        .removeClass(this.options.baseClass + '-menu-hover');
    this.raptor.actionPreviewRestore();
};

/**
 * Prepares and returns the menu for use in the Raptor UI.
 * @returns {Element}
 */
TableMenu.prototype.getMenu = function() {
    if (!this.menu) {
        this.menuContent = this.raptor.getTemplate('table.create-menu', this.options);
        Menu.prototype.getMenu.call(this)
            .on('click', 'td', this.createTable.bind(this))
            .on('mouseenter', 'td', this.highlight.bind(this))
            .mouseleave(this.highlightRemove.bind(this));
        this.menuTable = this.menu.find('table:eq(0)');
    }
    return this.menu;
};

Raptor.registerUi(new TableMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-create.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-column.js
/**
 * @fileOverview Contains the delete column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to delete a column from a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableDeleteColumn',
    applyToElement: function(cell) {
        var position = tableGetCellIndex(cell),
            table = cell.parentNode.parentNode.parentNode,
            nextCell;
        tableDeleteColumn(cell.parentNode.parentNode.parentNode, position.x);
        if (tableIsEmpty(table)) {
            table.parentNode.removeChild(table);
            return;
        }
        nextCell = tableGetCellByIndex(table, position);
        if (!nextCell && position.x > 0) {
            nextCell = tableGetCellByIndex(table, {
                x: position.x - 1,
                y: position.y
            });
        }
        selectionSelectInner(nextCell);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-column.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-row.js
/**
 * @fileOverview Contains the delete column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to delete a row from a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableDeleteRow',
    applyToElement: function(cell) {
        var position = tableGetCellIndex(cell),
            table = cell.parentNode.parentNode.parentNode,
            nextCell;
        tableDeleteRow(cell.parentNode.parentNode.parentNode, position.y);
        if (tableIsEmpty(table)) {
            table.parentNode.removeChild(table);
            return;
        }
        nextCell = tableGetCellByIndex(table, position);
        if (!nextCell && position.y > 0) {
            nextCell = tableGetCellByIndex(table, {
                x: position.x,
                y: position.y - 1
            });
        }
        selectionSelectInner(nextCell);
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-delete-row.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-column.js
/**
 * @fileOverview Contains the insert column button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to insert a column into a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableInsertColumn',
    applyToElement: function(cell) {
        tableInsertColumn(cell.parentNode.parentNode.parentNode, tableGetCellIndex(cell).x + 1, {
            placeHolder: '&nbsp;'
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-column.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-row.js
/**
 * @fileOverview Contains the insert row button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a table cell button to insert a row into a table.
 */
Raptor.registerUi(new TableCellButton({
    name: 'tableInsertRow',
    applyToElement: function(cell) {
        tableInsertRow(cell.parentNode.parentNode.parentNode, tableGetCellIndex(cell).y + 1, {
            placeHolder: '&nbsp;'
        });
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-insert-row.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-merge-cells.js
/**
 * @fileOverview Contains the split cell button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a button to merge the selected cells of a table.
 */
Raptor.registerUi(new Button({
    name: 'tableMergeCells',
    action: function() {
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-merge-cells.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-split-cells.js
/**
 * @fileOverview Contains the split cells button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a button to split the selected cell of a table.
 */
Raptor.registerUi(new Button({
    name: 'tableSplitCells',
    action: function() {
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-split-cells.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-support.js
/**
 * @fileOverview Contains the table helper functions.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var tableSupportDragging = false,
    tableSupportStartCell = null;

/**
 * The supporting table class.
 *
 * @constructor
 *
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function TableSupport(name, overrides) {
    RaptorPlugin.call(this, name || 'tableSupport', overrides);
}

TableSupport.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initialize the table support class.
 */
TableSupport.prototype.init = function() {
    this.raptor.bind('selectionCustomise', this.selectionCustomise.bind(this));
    this.raptor.registerHotkey('tab', this.tabToNextCell.bind(this));
    this.raptor.registerHotkey('shift+tab', this.tabToPrevCell.bind(this));
    this.raptor.getElement()
        .on('mousedown', 'tbody td', this.cellMouseDown.bind(this))
        .on('mouseover', 'tbody td', this.cellMouseOver.bind(this))
        .mouseup(this.cellMouseUp.bind(this));
};

/**
 * @todo i think this has something to do with the cell selection but i'm not sure
 * @returns {Array}
 */
TableSupport.prototype.selectionCustomise = function() {
    var ranges = [],
        range;
    $('.' + this.options.baseClass + '-cell-selected').each(function() {
        range = rangy.createRange();
        range.selectNodeContents(this);
        ranges.push(range);
    });
    return ranges;
};

/**
 * Event handler for mouse down.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseDown = function(event) {
    if (this.raptor.isEditing()) {
        tableSupportStartCell = tableGetCellIndex(event.target);
        if (tableSupportStartCell !== null) {
            tableSupportDragging = true;
            $(event.target).closest('table').addClass(this.options.baseClass + '-selected');
        }
    }
};

/**
 * Event handler for mouse up.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseUp = function(event) {
    tableSupportDragging = false;
    var cell = $(event.target).closest('td'),
        deselect = false;
    if (cell.length > 0 && tableSupportStartCell !== null) {
        var index = tableGetCellIndex(cell.get(0));
        if (index === null ||
                (index.x == tableSupportStartCell.x &&
                index.y == tableSupportStartCell.y)) {
            deselect = true;
        }
    } else {
        deselect = true;
    }
    if (deselect) {
        $('.' + this.options.baseClass + '-selected').removeClass(this.options.baseClass + '-selected');
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
    }
};

/**
 * Event handler for mouse hover.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseOver = function(event) {
    if (tableSupportDragging) {
        var cells = tableCellsInRange($(event.target).closest('table').get(0), tableSupportStartCell, tableGetCellIndex(event.target));
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
        $(cells).addClass(this.options.baseClass + '-cell-selected');
        rangy.getSelection().removeAllRanges();
    }
};

/**
 * Handles tabbing to the next table cell.
 */
TableSupport.prototype.tabToNextCell = function() {
    var range = rangy.getSelection().getRangeAt(0),
        parent = rangeGetCommonAncestor(range),
        cell = $(parent).closest('td');
    if (cell.length === 0) {
        return false;
    }
    var next = cell.next('td');
    if (next.length === 0) {
        next = cell.closest('tr').next('tr').find('td:first');
        if (next.length === 0) {
            next = cell.closest('tbody').find('td:first');
        }
    }
    rangeSelectElementContent(range, next);
    rangy.getSelection().setSingleRange(range);
};

/**
 * Handles tabbing to the next table cell.
 */
TableSupport.prototype.tabToPrevCell = function() {
    var range = rangy.getSelection().getRangeAt(0),
        parent = rangeGetCommonAncestor(range),
        cell = $(parent).closest('td');
    if (cell.length === 0) {
        return false;
    }
    var prev = cell.prev('td');
    if (prev.length === 0) {
        prev = cell.closest('tr').prev('tr').find('td:last');
        if (prev.length === 0) {
            prev = cell.closest('tbody').find('td:last');
        }
    }
    rangeSelectElementContent(range, prev);
    rangy.getSelection().setSingleRange(range);
};

Raptor.registerPlugin(new TableSupport());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/table/table-support.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tag-menu/tag-menu.js
/**
 * @fileOverview Contains the left align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The tag menu class.
 *
 * @constructor
 * @augments SelectMenu
 *
 * @param {Object} options Options hash.
 */
function TagMenu(options) {
    SelectMenu.call(this, {
        name: 'tagMenu'
    });
}

TagMenu.prototype = Object.create(SelectMenu.prototype);

/**
 * Initializes the tag menu.
 */
TagMenu.prototype.init = function() {
    this.raptor.bind('selectionChange', this.updateButton.bind(this));
    return SelectMenu.prototype.init.apply(this, arguments);
};

/**
 * Changes the tags on the selected element(s).
 *
 * @param {HTML} tag The new tag.
 */
TagMenu.prototype.changeTag = function(tag) {
    // Prevent injection of illegal tags
    if (typeof tag === 'undefined' || tag === 'na') {
        return;
    }

    var selectedElement = selectionGetElement(),
        limitElement = this.raptor.getElement();
    if (selectedElement && !selectedElement.is(limitElement)) {
        var cell = selectedElement.closest('td, li, #' + limitElement.attr('id'));
        if (cell.length !== 0) {
            limitElement = cell;
        }
    }
    
    selectionChangeTags(tag, [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'pre', 'address'
    ], limitElement);
};

/**
 * Applies the tag change.
 *
 * @param event The mouse event to trigger the function.
 */
TagMenu.prototype.menuItemClick = function(event) {
    SelectMenu.prototype.menuItemClick.apply(this, arguments);
    this.raptor.actionApply(function() {
        this.changeTag($(event.currentTarget).data('value'));
    }.bind(this));
};

/**
 * Generates a preview state for a change of tag.
 *
 * @param event The mouse event to trigger the preview.
 */
TagMenu.prototype.menuItemMouseEnter = function(event) {
    this.raptor.actionPreview(function() {
        this.changeTag($(event.currentTarget).data('value'));
    }.bind(this));
};

/**
 * Restores the tag menu from it's preview state.
 *
 * @param event The mouse event to trigger the restoration of the tag menu.
 */
TagMenu.prototype.menuItemMouseLeave = function(event) {
    this.raptor.actionPreviewRestore();
};

/**
 * Updates the display of the tag menu button.
 */
TagMenu.prototype.updateButton = function() {
    var tag = selectionGetElements()[0],
        button = this.getButton().getButton();
    if (!tag) {
        return;
    }
    var tagName = tag.tagName.toLowerCase(),
        option = this.getMenu().find('[data-value=' + tagName + ']');
    if (option.length) {
        aButtonSetLabel(button, option.html());
    } else {
        aButtonSetLabel(button, tr('tagMenuTagNA'));
    }
//    if (this.raptor.getElement()[0] === tag) {
//        aButtonDisable(button);
//    } else {
//        aButtonEnable(button);
//    }
};

/**
 * Prepares and returns the menu items for use in the raptor UI.
 * @returns {Element}
 */
TagMenu.prototype.getMenuItems = function() {
    return this.raptor.getTemplate('tag-menu.menu', this.options);
};

Raptor.registerUi(new TagMenu());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tag-menu/tag-menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/text-align-button.js
/**
 * @fileOverview Contains the text align button class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * The text align button class.
 *
 * @constructor
 * @augments PreviewToggleButton
 *
 * @param {Object} options Options hash.
 */
function TextAlignButton(options) {
    PreviewToggleButton.call(this, options);
}

TextAlignButton.prototype = Object.create(PreviewToggleButton.prototype);

TextAlignButton.prototype.action = function() {
    selectionToggleBlockClasses([
        this.getClass()
    ], [
        this.options.cssPrefix + 'center',
        this.options.cssPrefix + 'left',
        this.options.cssPrefix + 'right',
        this.options.cssPrefix + 'justify'
    ], this.raptor.getElement(), 'span');
    this.selectionChange();
};

TextAlignButton.prototype.selectionToggle = function() {
    return rangy.getSelection().getAllRanges().length > 0 &&
        selectionContains('.' + this.getClass(), this.raptor.getElement());
};;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/text-align-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/center.js
/**
 * @fileOverview Contains the center align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text center.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignCenter',
    getClass: function() {
        return this.options.cssPrefix + 'center';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/center.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/justify.js
/**
 * @fileOverview Contains the justify text button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to justify text.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignJustify',
    getClass: function() {
        return this.options.cssPrefix + 'justify';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/justify.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/left.js
/**
 * @fileOverview Contains the left align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text left.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignLeft',
    getClass: function() {
        return this.options.cssPrefix + 'left';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/left.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/right.js
/**
 * @fileOverview Contains the right align button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates a text align button to align text right.
 */
Raptor.registerUi(new TextAlignButton({
    name: 'alignRight',
    getClass: function() {
        return this.options.cssPrefix + 'right';
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-align/right.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/bold.js
/**
 * @fileOverview Contains the bold button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the bold class to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textBold',
    hotkey: 'ctrl+b',
    tag: 'strong',
    classes: ['bold']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/bold.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/italic.js
/**
 * @fileOverview Contains the italic button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the italic class to a
 * selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textItalic',
    hotkey: 'ctrl+i',
    tag: 'em',
    classes: ['italic']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/italic.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/strike.js
/**
 * @fileOverview Contains the strike button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the strike class to a
 * selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textStrike',
    tag: 'del',
    classes: ['strike']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/strike.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/block-quote.js
/**
 * @fileOverview Contains the block quote button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview toggle button to insert a block quote.
 */
Raptor.registerUi(new Button({
    name: 'textBlockQuote',
    action: function() {
        document.execCommand('formatBlock', false, '<blockquote>');
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/block-quote.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-decrease.js
/**
 * @fileOverview Contains the text size decrease button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to apply the text size decrease
 * class to a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'textSizeDecrease',
    action: function() {
        selectionExpandToWord();
        this.raptor.selectionConstrain();
        selectionInverseWrapWithTagClass('small', this.options.cssPrefix + 'small', 'big', this.options.cssPrefix + 'big');
        this.raptor.getElement().find('small.' + this.options.cssPrefix + 'small:empty, big.' + this.options.cssPrefix + 'big:empty').remove();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-decrease.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-increase.js
/**
 * @fileOverview Contains the text size increase button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button to apply the text size increase
 * class to a selection.
 */
Raptor.registerUi(new PreviewButton({
    name: 'textSizeIncrease',
    action: function() {
        selectionExpandToWord();
        this.raptor.selectionConstrain();
        selectionInverseWrapWithTagClass('big', this.options.cssPrefix + 'big', 'small', this.options.cssPrefix + 'small');
        this.raptor.getElement().find('small.' + this.options.cssPrefix + 'small:empty, big.' + this.options.cssPrefix + 'big:empty').remove();
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/size-increase.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/underline.js
/**
 * @fileOverview Contains the underline button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the underline class to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textUnderline',
    hotkey: 'ctrl+u',
    tag: 'u',
    classes: ['underline']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/underline.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/sub.js
/**
 * @fileOverview Contains the subscript button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the subscript class to
 * a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textSub',
    tag: 'sub',
    classes: ['sub']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/sub.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/super.js
/**
 * @fileOverview Contains the superscript button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the CSS applier button to apply the superscript class
 * to a selection.
 */
Raptor.registerUi(new CSSClassApplierButton({
    name: 'textSuper',
    tag: 'sup',
    classes: ['sup']
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/text-style/super.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tool-tip/tool-tip.js
/**
 * @fileOverview Stylised tooltip plugin.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen david@panmedia.co.nz
 */
function ToolTipPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'toolTip', overrides);
}

ToolTipPlugin.prototype = Object.create(RaptorPlugin.prototype);

ToolTipPlugin.prototype.init = function() {
    this.raptor.bind('layoutReady', function(node) {
        $(node)
            .on('mouseover', '[title]', function(event) {
                $(this)
                    .attr('data-title', $(this).attr('title'))
                    .removeAttr('title');
            });
    });
};

Raptor.registerPlugin(new ToolTipPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/tool-tip/tool-tip.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/unsaved-edit-warning/unsaved-edit-warning.js
/**
 * @fileOverview Contains the unsaved edit warning plugin class code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var unsavedEditWarningDirty = 0,
    unsavedEditWarningElement = null;

/**
 * The unsaved edit warning plugin.
 *
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {String} name
 * @param {Object} overrides Options hash.
 */
function UnsavedEditWarningPlugin(name, overrides) {
    RaptorPlugin.call(this, name || 'unsavedEditWarning', overrides);
}

UnsavedEditWarningPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Enables the unsaved edit warning plugin.
 *
 * @todo raptor details
 * @param {type} raptor
 */
UnsavedEditWarningPlugin.prototype.enable = function(raptor) {
    this.raptor.bind('dirty', this.show.bind(this));
    this.raptor.bind('cleaned', this.hide.bind(this));
};

/**
 * Shows the unsaved edit warning.
 */
UnsavedEditWarningPlugin.prototype.show = function() {
    unsavedEditWarningDirty++;
    elementBringToTop(this.getElement());
    this.getElement().addClass(this.options.baseClass + '-visible');
};

/**
 * Hides the unsaved edit warning.
 *
 * @param event The mouse event that triggers the function.
 */
UnsavedEditWarningPlugin.prototype.hide = function(event) {
    if (--unsavedEditWarningDirty === 0) {
        this.getElement().removeClass(this.options.baseClass + '-visible');
    }
};

/**
 * Prepares and returns the unsaved edit warning element for use in the Raptor UI.
 *
 * @todo instance details
 * @param {type} instance
 * @returns {Element}
 */
UnsavedEditWarningPlugin.prototype.getElement = function() {
    if (!unsavedEditWarningElement) {
        var dirtyClass = 'raptor-plugin-unsaved-edit-warning-dirty';
        unsavedEditWarningElement = $(this.raptor.getTemplate('unsaved-edit-warning.warning', this.options))
            .mouseenter(function() {
                Raptor.eachInstance(function(raptor) {
                    if (raptor.isDirty()) {
                        raptor.getElement().addClass(dirtyClass);
                    }
                });
            })
            .mouseleave(function() {
                $('.' + dirtyClass).removeClass(dirtyClass);            })
            .appendTo('body');
    }
    return unsavedEditWarningElement;
};

Raptor.registerPlugin(new UnsavedEditWarningPlugin());
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/unsaved-edit-warning/unsaved-edit-warning.js
;
// File start: c:\work\modules\raptor-gold\raptor-editor\src\plugins/view-source/view-source.js
/**
 * @fileOverview Contains the view source dialog code.
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dialog button to open the view source dialog.
 */
Raptor.registerUi(new DialogButton({
    name: 'viewSource',
    dialogOptions: {
        width: 600,
        height: 400,
        minWidth: 400,
        minHeight: 400
    },

    /**
     * Replace the editing element's content with the HTML from the dialog's textarea
     *
     * @param  {Element} dialog
     */
    applyAction: function(dialog) {
        var html = dialog.find('textarea').val();
        this.raptor.actionApply(function() {
            this.raptor.setHtml(html);
            selectionSelectStart(this.raptor.getElement().first());
            this.raptor.checkSelectionChange();
        }.bind(this));
    },

    /**
     * Update the dialog's text area with the current HTML.
     */
    openDialog: function() {
        var textarea = this.getDialog().find('textarea');
        textarea.val(this.raptor.getHtml());
        DialogButton.prototype.openDialog.call(this);
        textarea.select();
    },

    /**
     * @return {Element}
     */
    getDialogTemplate: function() {
        return $('<div>').html(this.raptor.getTemplate('view-source.dialog', this.options));
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-editor\src\plugins/view-source/view-source.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src\plugins/lorem-ipsum/lorem-ipsum.js
/**
 * @fileOverview 
 * @license http://www.raptor-editor.com/license
 *
 * @author David Neilsen <david@panmedia.co.nz>
 */

Raptor.registerUi(new PreviewButton({
    name: 'loremIpsum',
    action: function() {
        selectionReplace(this.raptor.getTemplate('lorem-ipsum.lorem-ipsum'));
    }
}));
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src\plugins/lorem-ipsum/lorem-ipsum.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-apply-button.js
/**
 * @fileOverview Contains the apply revisions button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the apply button that applies & saves the selected revision
 */
var RevisionsApplyButton = new DialogButton({
    name: 'revisionsApplyButton',

    action: function() {
        var dialog = this.getDialog(this);
        this.openDialog(dialog);
        aDialogOpen(dialog);
    },

    /**
     * @param  {Element} dialog
     */
    applyAction: function(dialog) {
        this.raptor.setHtml(this.options.revision.content);
        this.getSavePlugin().save();
    },

    getSavePlugin: function() {
        var plugin = this.raptor.getPlugin(this.options.plugins.save.plugin);
        // <strict/>
        return plugin;
    },

    /**
     * @return {Element}
     */
    getDialogTemplate: function() {
        return $('<div>').html(this.raptor.getTemplate('revisions.apply-dialog', this.options));
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-apply-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-button.js
/**
 * @fileOverview Contains the view revisions button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the dialog button to open the revisions dialog.
 */
Raptor.registerUi(new DialogButton({
    name: 'revisions',

    dialogOptions: {
        width: 650,
        height: 400,
        modal: false
    },

    init: function() {
        var result = DialogButton.prototype.init.call(this);
        if (typeof this.getUrl() === 'undefined') {
            aButtonSetLabel(this.button, tr('revisionsTextEmpty'))
            aButtonDisable(this.button)
        }
        return result;
    },

    /**
     * Get and either render the revisions for this instance, or
     * display an appropriate error message.
     *
     * @param  {Object} dialog
     */
    openDialog: function() {
        var loadingMessage = $('<p/>')
                .html(tr('revisionsLoading'))
                .addClass(this.options.baseClass + '-loading-revisions');

        this.getDialogContentArea().html(loadingMessage);

        this.state = this.raptor.stateSave();
        this.raptor.getElement().removeClass(this.raptor.options.baseClass + '-editable-hover');
        this.raptor.getElement().addClass(this.options.baseClass + '-reviewing');
        this.getRevisions(this.renderRevisions.bind(this), this.displayAjaxError.bind(this));
        DialogButton.prototype.openDialog.call(this);
    },

    closeDialog: function() {
        // Ensure raptor's previous state is *not* restored
        this.state = null;
        this.raptor.getElement().removeClass(this.options.baseClass + '-reviewing');
        DialogButton.prototype.closeDialog.call(this);
    },

    /**
     * Return the dialog's content element.
     *
     * @return {Element}
     */
    getDialogContentArea: function() {
        return this.getDialog().find('> div');
    },

    /**
     * Render revisions into a table.
     * Calls bindRow to bind events to each row.
     *
     * @param  {Object[]} revisions
     */
    renderRevisions: function(data) {
        if (typeof data.revisions === 'undefined' ||
                !data.revisions ||
                !data.revisions.length) {
            this.displayNoRevisions();
            return;
        }

        var revisions = data.revisions;

        var tbody = this.getDialogContentArea()
                .html(this.raptor.getTemplate('revisions.table', this.options))
                .find('tbody'),
            tableRowTemplate = this.raptor.getTemplate('revisions.tr', this.options),
            tableRows = [],
            tableRow = null,
            controls = null,
            revision = null;

        var currentRow = $(tableRowTemplate).find('.' + this.options.baseClass + '-updated')
            .html((new Date(parseInt(data.current.updated))).toLocaleString())
            .next().html(tr('revisionsButtonCurrent'))
            .parent().addClass(this.options.baseClass + '-current ui-state-highlight');

        tableRows.push(currentRow);

        for (var revisionIndex = 0; revisionIndex < revisions.length; revisionIndex++) {
            tableRow = $(tableRowTemplate);
            revision = revisions[revisionIndex];
            tableRow.data('revision', revision)
                .find('.' + this.options.baseClass + '-updated')
                .html((new Date(parseInt(revision.updated))).toLocaleString());

            controls = tableRow.find('.' + this.options.baseClass + '-controls');

            controls.append(this.prepareRowButton('preview', revision, data.current, RevisionsPreviewButton));
            controls.append(this.prepareRowButton('apply', revision, data.current, RevisionsApplyButton));
            controls.append(this.prepareRowButton('diff', revision, data.current, RevisionsDiffButton));

            tableRows.push(tableRow);
        }
        tbody.append(tableRows);
    },

    /**
     * Prepare a single row button.
     *
     * @param  {String} name
     * @param  {Object} revision The revision represented by this row
     * @param  {Object} current The current revision
     * @param  {Button} buttonObject
     * @return {Element} The button
     */
    prepareRowButton: function(name, revision, current, buttonObject) {
        var button = $.extend({}, buttonObject);
        button.raptor = this.raptor;
        button.options = $.extend({}, this.options, {
            baseClass: this.options.baseClass + '-' + name + '-button',
            revision: revision,
            current: current
        });
        return button.init();
    },

    /**
     * Display a generic error message
     */
    displayAjaxError: function() {
        this.getDialogContentArea().text(tr('revisionsAJAXFailed'));
    },

    /**
     * Display 'no revisions' message';
     * @return {[type]} [description]
     */
    displayNoRevisions: function() {
        this.getDialogContentArea().text(tr('revisionsNone'));
    },

    /**
     * @return {Element}
     */
    getDialogTemplate: function() {
        return $('<div>').html(this.raptor.getTemplate('revisions.dialog', this.options));
    },

    /**
     * @return {Boolean} False to disable the OK button
     */
    getOkButton: function() {
        return false;
    },

    getHeaders: function() {
        if (this.options.headers) {
            return this.options.headers.call(this);
        }
        return {};
    },

    getUrl: function() {
        if (typeof this.options.url === 'string') {
            return this.options.url;
        } else if ($.isFunction(this.options.url)) {
            return this.options.url.call(this);
        }
    },

    /**
     * Get the revisions for this instance from the server.
     * Expected data:
     * <pre>
     * {
     *  // Indicates whether each revision has an accompanying html diff showing changes
     *  // between it and the next revision in history
     *  "hasDiff": Boolean,
     *
     *  // An array of revisions
     *  "revisions": [
     *      {
     *          "identifier": String,
     *          "content": String,
     *          "updated": Integer, // Millisecond timestamp,
     *
     *          // Optional, presence indicated by hasDiff above
     *          "diff": String // The diff between this and the previous revision
     *      }
     *   ]
     * }
     * </pre>
     *
     * @param  {Function} success Function to be called with revisions & hasDiff on success
     * @param  {Function} failure Function that will display a generic error message on failure
     */
    getRevisions: function(success, failure) {
        $.ajax({
            dataType: 'json',
            url: this.getUrl(),
            headers: this.getHeaders()
        }).done(function(data) {
            success(data);
        }).fail(function() {
            failure();
        });
    }

}));
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-diff-button.js
/**
 * @fileOverview Contains the view revisions diff button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var diffs = {};

/**
 * Creates an instance of the dialog button to open the revisions dialog.
 */
var RevisionsDiffButton = new DialogButton({
    name: 'revisionsDiffButton',

    diffTool: false,

    dialogOptions: {
        width: 450,
        height: 400,
        modal: false
    },

    /**
     * Bind to the diffView event so this button can be deactived when
     * another one is clicked.
     *
     * @return {RevisionsDiffButton}
     */
    init: function() {
        return DialogButton.prototype.init.apply(this, arguments);
    },

    action: function() {
        var dialog = this.getDialog(this);
        this.openDialog(dialog);
        aDialogOpen(dialog);
    },

    /**
     * Disable the apply action
     *
     * @param  {Element} dialog
     */
    applyAction: function(dialog) { },

    /**
     * Disable the OK button
     *
     * @param  {String} name
     */
    getOkButton: function(name) {
        return false;
    },

    getDiffTool: function() {
        if (!this.diffTool) {
            this.diffTool = new diff_match_patch();
        }
        return this.diffTool;
    },

    /**
     * Get the diff for this button instance's revision.
     *
     * @return {String} The HTML diff
     */
    getDiff: function() {
        var key = this.options.revision.identifier + '-' + this.options.revision.updated;
        if (typeof diffs[key] === 'undefined') {
            var diff = this.getDiffTool().diff_main(this.options.revision.content, this.options.current.content);
            this.getDiffTool().diff_cleanupSemantic(diff);
            diffs[key] = this.getDiffTool().diff_prettyHtml(diff);
        }
        return diffs[key];
    },

    /**
     * @param  {Object} dialog
     */
    openDialog: function(dialog) {
        dialog.find('.' + this.options.baseClass + '-diff').html(this.getDiff());
    },

    /**
     * @return {Element}
     */
    getDialogTemplate: function() {
        return $('<div>').html(this.raptor.getTemplate('revisions.diff-dialog', this.options));
    }
});
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-diff-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-preview-button.js
/**
 * @fileOverview Contains the preview revisions button code.
 * @license http://www.raptor-editor.com/license
 *
 * @author Michael Robinson <michael@panmedia.co.nz>
 * @author David Neilsen <david@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * Creates an instance of the preview button that applies content directly
 * to the element.
 *
 * @param {type} Button overrides
 */
var RevisionsPreviewButton = new Button({
    name: 'revisionsPreviewButton',

    /**
     * Bind to the revisionsPreview event so this button can be deactived when
     * another one is clicked.
     *
     * @return {RevisionsPreviewButton}
     */
    init: function() {
        this.raptor.bind('revisionsPreview', function() {
            aButtonInactive(this.button);
        }.bind(this));
        return Button.prototype.init.apply(this, arguments);
    },

    /**
     * Set the Raptor instance's html to this button instance's revision.
     * Fire event to allow other preview buttons to deactivate.
     */
    action: function() {
        this.raptor.getElement().html(this.options.revision.content);
        this.raptor.fire('revisionsPreview');
        aButtonActive(this.button);
    }

});
;
// File end: c:\work\modules\raptor-gold\raptor-premium\src\plugins/revisions/revisions-preview-button.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/section.js
var RaptorSection = function(options) {
    this.layouts = [];

    for (var key in options) {
        this[key] = options[key]
    }

    // <strict/>
    if (this.saveUrl) {
        RaptorSection.saveUrl = this.saveUrl;
    }

    this.node.classList.add('raptor-section');
    this.node.raptorSection = this;
    this.nodeItem = null;
    this.nodeLayoutPane = null;

    var properties = JSON.parse(this.node.dataset.container);
    for (var key in properties) {
        this[key] = properties[key];
    }
    this.node.dataset.title = this.title || 'Container';

    // Find UI nodes
    this.nodeUI = nodeFromHtml(templateConvertTokens(RaptorSection.templates.ui));
    this.nodeAddMenu = this.nodeUI.getElementsByClassName('raptor-section-add-menu')[0];
    this.nodeLayoutMenu = this.nodeUI.getElementsByClassName('raptor-section-layout-menu')[0];
    this.nodePlaceholder = nodeFromHtml(templateConvertTokens(RaptorSection.templates.placeholder));
    this.nodeAddSection = this.nodeUI.getElementsByClassName('raptor-section-add-item')[0]
    this.nodeEditSection = this.nodeUI.getElementsByClassName('raptor-section-edit')[0]
    this.nodeRemoveSection = this.nodeUI.getElementsByClassName('raptor-section-remove')[0]
    this.nodeClear = this.nodeUI.getElementsByClassName('raptor-section-clear')[0]
    this.nodeLayout = this.nodeUI.getElementsByClassName('raptor-section-add-layout')[0]
    this.nodeGuides = this.nodeUI.getElementsByClassName('raptor-section-guides')[0]
    this.nodeSave = this.nodeUI.getElementsByClassName('raptor-section-save')[0]

    var top = 0;
    this.sortableOptions = {
        connectWith: '.raptor-section, .raptor-section-layout-pane',
        tolerance: 'pointer',
        placeholder: 'raptor-section-sortable-placeholder',
        cancel: '[contenteditable=true], :input',
        cursorAt: {
            left: -10,
            top: 0
        },
        sort: function(event, ui) {
            // Fix for weird positioning of helper when using position relative
            ui.helper.css('top', event.pageY - ui.helper.parent().offset().top - top);
        },
        start: function(event, ui) {
            top = ui.helper.position().top;
            RaptorSection.sorting = true;
            RaptorSection.hideAllUI();
        }.bind(this),
        stop: function(event, ui) {
            RaptorSection.sorting = false;
            var section = ui.item[0].parentNode;
            while (!section.raptorSection) {
                section = section.parentNode;
            }
            if (ui.item[0] === document.elementFromPoint(event.clientX, event.clientY)) {
                section.raptorSection.nodeItem = ui.item[0];
            } else {
                section.raptorSection.nodeItem = null;
            }
            section.raptorSection.showUI();
        }.bind(this)
    };

    // Initialise section menu items
    this.sections.sort(function(a, b) {
        return a.label.localeCompare(b.label);
    });

    for (var i = 0, l = this.sections.length; i < l; i++) {
        if (this.sections[i].choices) {
            console.log('Section insert via choice is deprecated.', this.sections[i]);
        }
        if (this.sections[i].ajax) {
            console.log('Section insert via ajax is deprecated.', this.sections[i]);
        }
        if (typeof this.sections[i].insert !== 'function') {
            console.log('Section insert via static HTML is deprecated.', this.sections[i]);
        }
        this.sections[i].label = this.sections[i].label.replace(/ /g, '&nbsp;');
        var menuItem = nodeFromHtml(templateConvertTokens(RaptorSection.templates.menuItem, this.sections[i]));
        menuItem.addEventListener('click', this.hideMenu.bind(this));
        menuItem.raptorSectionItem = this.sections[i];
        this.nodeAddMenu.appendChild(menuItem);
    }

    this.layoutInitMenu();

    document.body.appendChild(this.nodeUI);
    document.body.appendChild(this.nodePlaceholder);

    // Initialise items already present in the section
    var initialItems = this.getItems();
    for (var i = 0; i < initialItems.length; i++) {
        nodeUniqueId(initialItems[i]);
        this.itemBind(initialItems[i], this.getItemDefinition(initialItems[i].dataset.raptorSection));
        initialItems[i].raptorSectionItem = JSON.parse(initialItems[i].dataset.raptorSection);
    }

    // Initialise layouts already present in the section
    var initialLayouts = this.getLayouts();
    for (var i = 0; i < initialLayouts.length; i++) {
        this.layoutBind(initialLayouts[i], this.getLayoutDefinition(initialLayouts[i].dataset['layout']));
    }

    // Create jQuery UI menus
    aMenu($(this.nodeAddMenu), {
        select: this.menuAddItemSelect.bind(this)
    });

    aMenu($(this.nodeLayoutMenu), {
        select: this.menuAddLayoutSelect.bind(this)
    });

    // Create jQuery UI buttons
    aButton(this.nodeAddSection, {
        icons: {
            primary: 'ui-icon-add'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeEditSection, {
        icons: {
            primary: 'ui-icon-edit'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeRemoveSection, {
        icons: {
            primary: 'ui-icon-remove'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeClear, {
        icons: {
            primary: 'ui-icon-clear'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeLayout, {
        icons: {
            primary: 'ui-icon-layout'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeGuides, {
        icons: {
            primary: 'ui-icon-guides'
        },
        text: false
    }).removeClass('ui-corner-all');
    aButton(this.nodeSave, {
        icons: {
            primary: 'ui-icon-save'
        },
        text: false
    }).removeClass('ui-corner-all');

    this.nodeAddSection.addEventListener('click', function() {
        this.toggleMenu(this.nodeAddMenu);
    }.bind(this));
    this.nodeLayout.addEventListener('click', function() {
        this.toggleMenu(this.nodeLayoutMenu);
    }.bind(this));

    this.nodeGuides.addEventListener('click', RaptorSection.toggleGuides);
    this.nodeSave.addEventListener('click', RaptorSection.save);

    this.mouseBind();

    this.nodeEditSection.addEventListener('click', function() {
        if (!this.nodeItem) {
            return;
        }
        var sectionItemDefinition = this.getItemDefinition(this.nodeItem.raptorSectionItem.name);
        if (typeof sectionItemDefinition.edit !== 'function') {
            return;
        }
        sectionItemDefinition.edit(this.createWidget(this.nodeItem));
    }.bind(this));

    this.nodeRemoveSection.addEventListener('click', function() {
        if (this.nodeItem) {
            this.nodeItem.remove();
            this.nodeItem = null;
            this.showUI();
        } else if (this.nodeLayoutPane) {
            var layout = RaptorSection.findParentLayout(this.nodeLayoutPane, this.node);
            layout.remove();
            this.nodeLayoutPane = null;
            this.showUI();
        }
    }.bind(this));

    this.nodeClear.addEventListener('click', this.clear.bind(this));

    $(this.node).sortable(this.sortableOptions);

    RaptorSection.initialise(this);
};

RaptorSection.prototype = Object.create(RaptorSection);

/**
 * Binds events and data to a item node.
 */
RaptorSection.prototype.itemBind = function(nodeItem, itemDefinition) {
    nodeItem.raptorSectionDefinition = itemDefinition;
    this.mouseBindItem(nodeItem);
};

/**
 * Binds events and data to a layout node.
 */
RaptorSection.prototype.layoutBind = function(nodeLayout, layoutDefinition) {
    nodeLayout.classList.add('raptor-section-layout');
    nodeLayout.raptorSectionLayout = JSON.parse(nodeLayout.dataset.raptorLayout);

    var layoutPanes = nodeLayout.querySelectorAll('[data-pane]')
    for (var i = 0; i < layoutPanes.length; i++) {
        layoutPanes[i].classList.add('raptor-section-layout-pane');
        layoutPanes[i].raptorSectionLayoutPane = JSON.parse(layoutPanes[i].dataset.raptorLayoutPane);
        this.mouseBindLayoutPane(layoutPanes[i]);
        $(layoutPanes[i]).sortable(this.sortableOptions);
    }
};

/**
 * Initialise layout menu items.
 */
RaptorSection.prototype.layoutInitMenu = function() {
    // Hide the menu if there is no layouts
    if (!this.layouts || this.layouts.length === 0) {
        this.hideNode(this.nodeLayout);
        return;
    }

    // Sort the menu items
    this.layouts.sort(function(a, b) {
        return a.label.localeCompare(b.label);
    });

    for (var i = 0, l = this.layouts.length; i < l; i++) {
        var menuItem = nodeFromHtml(templateConvertTokens(RaptorSection.templates.menuItem, this.layouts[i]));
        menuItem.addEventListener('click', this.hideMenu.bind(this));
        menuItem.raptorSectionLayout = this.layouts[i];
        this.nodeLayoutMenu.appendChild(menuItem);
    }
};

/**
 * Event triggered when an item is selected from the add section menu.
 */
RaptorSection.prototype.menuAddItemSelect = function(event, ui) {
    this.hidePlaceholder();
    var itemDefinition = event.currentTarget.raptorSectionItem,
        widgetNode = nodeFromHtml(templateConvertTokens(RaptorSection.templates.sectionItem, {
            content: ui.item.text()
        }));
    this.itemBind(widgetNode, itemDefinition);
    widgetNode.raptorSectionItem = {
        name: itemDefinition.name
    };

    // Call widget
    var widget = this.createWidget(widgetNode);

    this.insertNode(widgetNode);

    itemDefinition.insert(widget);
};

RaptorSection.prototype.createWidget = function(widgetNode) {
    return {
        title: widgetNode.raptorSectionItem.title,
        properties: widgetNode.raptorSectionItem.properties,

        loading: function(message) {
            widgetNode.innerHTML = '<div class="raptor-section-placeholder ui-state-information">' + (message || 'Loading...') + '</div>'
            widgetNode.dataset.title = 'Loading...';
        },

        error: function(message) {
            widgetNode.innerHTML = '<div class="raptor-section-placeholder ui-state-error">' + (message || 'Widget error.') + '</div>'
            widgetNode.dataset.title = 'Error';
        },

        remove: function() {
            widgetNode.parentNode.removeChild(widgetNode);
        },

        save: function(content, properties, options) {
            widgetNode.innerHTML = content;
            widgetNode.raptorSectionItem.properties = properties;

            for (var key in options) {
                widgetNode.raptorSectionItem[key] = options[key];
            }
            widgetNode.dataset.title = widgetNode.raptorSectionItem.title + ' ' + widgetNode.raptorSectionItem.titleSuffix;

            // Run scripts
            var scripts = widgetNode.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src) {
                    var tag = document.createElement('script');
                    tag.setAttribute('type', 'text/javascript')
                    tag.setAttribute('src', scripts[i].src)
                    document.getElementsByTagName('head')[0].appendChild(tag)
                } else {
                    (function(script) {
                        eval.call(this, script);
                    }(scripts[i].innerText));
                }
            }
        }.bind(this)
    };
};


/**
 * Event triggered when an item is selected from the layout menu.
 */
RaptorSection.prototype.menuAddLayoutSelect = function(event, ui) {
    this.hidePlaceholder();
    var layoutDefinition = event.currentTarget.raptorSectionLayout,
        nodeLayout = nodeFromHtml(layoutDefinition.layout);
    this.layoutBind(nodeLayout, layoutDefinition);
    this.insertNode(nodeLayout);
};

/**
 * Inserts a node into the correct posisition on the DOM based on the currently
 * active item/layout/section.
 *
 * @param {Node} node
 */
RaptorSection.prototype.insertNode = function(node) {
    if (this.nodeItem) {
        this.nodeItem.parentNode.insertBefore(node, this.nodeItem);
    } else if (this.nodeLayoutPane) {
        this.nodeLayoutPane.appendChild(node);
    } else {
        this.node.appendChild(node);
    }
};

RaptorSection.prototype.clear = function() {
    this.nodeItem = null
    this.nodeLayoutPane = null
    this.node.innerHTML = '';
};

/**
 * Get an item definition by its name.

 * @returns {Object|null}
 * @param {string} name
 */
RaptorSection.prototype.getItemDefinition = function(name) {
    for (var i = 0; i < this.sections.length; i++) {
        if (this.sections[i].name === name) {
            return this.sections[i];
        }
    }
    return null;
};

/**
 * Get a layout definition by its name.
 *
 * @param {string} name
 * @returns {Object|null}
 */
RaptorSection.prototype.getLayoutDefinition = function(name) {
    for (var i = 0; i < this.layouts.length; i++) {
        if (this.layouts[i].name === name) {
            return this.layouts[i];
        }
    }
    return null;
};

RaptorSection.prototype.hideUI = function() {
    this.hidePlaceholder();
    this.hideNode(this.nodeUI);
    this.hideMenu();
};

RaptorSection.prototype.showUI = function() {
    if (RaptorSection.sorting || RaptorSection.menuVisible) {
        return;
    }
    RaptorSection.hideAllUI(this);
    this.showNode(this.nodeUI);
};

/**
 * Repositions the UI based on the mouse position.
 *
 * @param {MouseEvent} event
 */
RaptorSection.prototype.repositionUI = function(event) {
    if (RaptorSection.menuVisible) {
        return;
    }
    // Reposition UI to same Y position as the mouse
    var top, left;
    if (this.nodeItem) {
        left =
            $(this.nodeItem).offset().left +
            this.nodeItem.offsetWidth -
            parseInt(getComputedStyle(this.nodeItem).borderRightWidth);
    } else if (this.nodeLayoutPane) {
        left =
            $(this.nodeLayoutPane).offset().left +
            this.nodeLayoutPane.offsetWidth -
            parseInt(getComputedStyle(this.nodeLayoutPane).borderRightWidth);
    } else {
        left =
            $(this.node).offset().left +
            this.node.offsetWidth -
            parseInt(getComputedStyle(this.node).borderRightWidth);
    }

    // Fix position when outside the window
    this.nodeUI.style.left = '0px';
    if (left > document.body.offsetWidth - this.nodeUI.offsetWidth) {
        left = document.body.offsetWidth - this.nodeUI.offsetWidth;
    }

    top = event.pageY - this.nodeUI.offsetHeight / 2;
    this.nodeUI.style.top = top + 'px';
    this.nodeUI.style.left = left + 'px';
    this.fadeUI(event);
};


/**
 * Fades the UI based on the distance of the mouse position to the UI.
 *
 * @param {MouseEvent} event
 */
RaptorSection.prototype.fadeUI = function(event) {
    // Fade UI when mouse is not close to it
    var width = this.nodeUI.offsetWidth,
        height = this.nodeUI.offsetHeight;
    if (width !== 0 && height !== 0) {
        var x = this.nodeUI.offsetLeft + (width / 2),
            y = this.nodeUI.offsetTop + (height / 2),
            distance = Math.sqrt(Math.pow(x - event.pageX, 2) + Math.pow(y - event.pageY, 2));
        this.nodeUI.style.opacity = (1 - Math.min(distance / 1000, 1)) * 2;
    }
};

RaptorSection.prototype.getNode = function() {
    return this.node;
};

RaptorSection.prototype.getItems = function() {
    // @fixme: this won't work for nested sections
    return this.node.getElementsByClassName('raptor-section-item');
    var result = [];
    for (var i = 0; i < this.node.children.length; i++) {
        if (this.node.children[i].classList.contains('raptor-section-item')) {
            result.push(this.node.children[i]);
        }
    }
    return result;
};

RaptorSection.prototype.querySelectorAllNested = function(selector) {
    var nodes = this.node.querySelectorAll(selector),
        result = [];
    for (var i = 0; i < nodes.length; i++) {
        var closest = nodes[i];
        do {
            if (closest.dataset.container) {
                break;
            }
        } while (closest = closest.parentNode);
        if (closest == this.node) {
            result.push(nodes[i]);
        }
    }
    return result;
};

RaptorSection.prototype.getLayouts = function() {
    return this.querySelectorAllNested('[data-layout]');
};

RaptorSection.prototype.getLayoutPanes = function() {
    return this.querySelectorAllNested('[data-pane]');
};

RaptorSection.prototype.serialize = function() {
    return this.querySelectorAllNested('[data-layout], .raptor-section-item');

};

RaptorSection.prototype.showPlaceholder = function() {
    this.insertNode(this.nodePlaceholder);
    this.showNode(this.nodePlaceholder);
};

RaptorSection.prototype.hidePlaceholder = function() {
    if (RaptorSection.menuVisible || !this.nodePlaceholder) {
        return;
    }
    this.hideNode(this.nodePlaceholder);
    if (this.nodePlaceholder.parentNode) {
        this.nodePlaceholder.parentNode.removeChild(this.nodePlaceholder);
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-section\src/section.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/menu.js
RaptorSection.prototype.hideMenu = function() {
    if (RaptorSection.menuVisible !== null) {
        this.hideNode(RaptorSection.menuVisible);
        RaptorSection.menuVisible = null;
    }
};

RaptorSection.prototype.showMenu = function(menu) {
    if (RaptorSection.menuVisible === null) {
        this.hideMenu();
        RaptorSection.menuVisible = menu;
        this.showNode(menu);
        this.repositionMenu(menu);
    }
};

RaptorSection.prototype.toggleMenu = function(menu) {
    if (RaptorSection.menuVisible === menu) {
        this.hideMenu();
    } else if (RaptorSection.menuVisible !== null) {
        this.hideMenu();
        this.showMenu(menu);
    } else {
        this.showMenu(menu);
    }
};

RaptorSection.prototype.repositionMenu = function(menu) {
    var under = menu.parentNode.getElementsByClassName(menu.dataset['for'])[0];
    menu.style.top = under.offsetBottom + 'px';
    menu.style.left = under.offsetLeft + 'px';
};
;
// File end: c:\work\modules\raptor-gold\raptor-section\src/menu.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/templates.js
RaptorSection.templates = {
    "layoutDialog": "<div> <h1>Layouts<\/h1> <ul> <li><a href=\"#\">Full Width<\/a><\/li> <li><a href=\"#\">Right Sidebar<\/a><\/li> <li><a href=\"#\">Left Sidebar<\/a><\/li> <li><a href=\"#\">2 Column<\/a><\/li> <li><a href=\"#\">3 Column<\/a><\/li> <\/ul> <\/div>",
    "layoutItem": "<div class=\"raptor-section-layout\" data-layout=\"\">{{content}}<\/div>",
    "menuItem": "<li><a class=\"raptor-section-menu-item\">{{label}}<\/a><\/li>",
    "pane": "<div class=\"raptor-section-pane\"><\/div>",
    "placeholder": "<div class=\"raptor-section-placeholder raptor-section-hidden ui-state-information ui-corner-all\">Insert new item...<\/div>",
    "sectionItem": "<div class=\"raptor-section-item\">{{content}}<\/div>",
    "sortablePlaceholder": "<div class=\"raptor-section-placeholder ui-state-information ui-corner-all\">Move here...<\/div>",
    "ui": "<div class=\"raptor-section-ui raptor-section-hidden ui-front ui-state-default ui-corner-all ui-front\"> <button type=\"button\" class=\"raptor-section-add-item ui-corner-left\">Add Block<\/button> <button type=\"button\" class=\"raptor-section-add-layout\">Layout<\/button> <button type=\"button\" class=\"raptor-section-edit\">Edit<\/button> <button type=\"button\" class=\"raptor-section-remove\">Remove<\/button> <button type=\"button\" class=\"raptor-section-clear\">Clear<\/button> <button type=\"button\" class=\"raptor-section-guides\">Guides<\/button> <button type=\"button\" class=\"raptor-section-save ui-corner-right\">Save<\/button> <ul class=\"raptor-section-menu raptor-section-add-menu raptor-section-hidden\" data-for=\"raptor-section-add-item\"><\/ul> <ul class=\"raptor-section-menu raptor-section-layout-menu raptor-section-hidden\" data-for=\"raptor-section-add-layout\"><\/ul> <\/div>"
};;
// File end: c:\work\modules\raptor-gold\raptor-section\src/templates.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/static.js
RaptorSection.initialised = false;
RaptorSection.instances = [];
RaptorSection.sorting = false;
RaptorSection.saveUrl = null;
RaptorSection.menuVisible = null;
RaptorSection.state = {};

RaptorSection.initialise = function(instance) {
    RaptorSection.instances.push(instance);

    var initialState = RaptorSection.getContainerSaveData(instance);
    RaptorSection.state[initialState.id] = JSON.stringify(initialState);

    if (!RaptorSection.initialised) {
        RaptorSection.initialised = true;

        stateSetDirty('raptor-section', RaptorSection.isDirty);

        document.addEventListener('click', function(event) {
            // Clicked guide label
            var item =
                event.target.raptorSection ||
                event.target.raptorSectionItem ||
                event.target.raptorSectionLayout ||
                event.target.raptorSectionLayoutPane;
            if (item && event.offsetY < 0) {
                var title = prompt('Rename ' + event.target.dataset.title);
                if (title) {
                    item.title = title;
                    event.target.dataset.title = title;
                    if (item.titleSuffix) {
                        event.target.dataset.title += ' ' + item.titleSuffix;
                    }
                }
            }

            // Click off event
            var target = event.target;
            do {
                if (target.classList.contains('raptor-section-ui')) {
                    return;
                }
            } while ((target = target.parentNode) && target.classList);
            RaptorSection.hideAllUI();
        });

        // Enable guides if presisted
        document.addEventListener('DOMContentLoaded', function() {
            if (persistGet('RaptorSection.guides')) {
                document.body.classList.add('raptor-section-guide');
            }
        });
    }
};

RaptorSection.isDirty = function() {
    for (var i = 0; i < RaptorSection.instances.length; i++) {
        containerSaveData = RaptorSection.getContainerSaveData(RaptorSection.instances[i]);
        if (RaptorSection.state[containerSaveData.id] != JSON.stringify(containerSaveData)) {
            return true;
        }
    }
    return false;
}

RaptorSection.hideAllUI = function(excludeInstance) {
    for (var i = 0, l = RaptorSection.instances.length; i < l; i++) {
        if (excludeInstance !== RaptorSection.instances[i]) {
            RaptorSection.instances[i].hideUI();
        }
    }
};

RaptorSection.showNode = function(node) {
    nodeClassSwitch(node, 'raptor-section-visible', 'raptor-section-hidden');
};

RaptorSection.hideNode = function(node) {
    nodeClassSwitch(node, 'raptor-section-hidden', 'raptor-section-visible');
};

RaptorSection.toggleGuides = function() {
    document.body.classList.toggle('raptor-section-guide');
    persistSet('RaptorSection.guides', document.body.classList.contains('raptor-section-guide'));
};

RaptorSection.getContainerSaveData = function(container) {
    // @todo make this an instance method
    var node = container.node,
        id = container.id;

    // Get the ID from the section config
    if (typeof id === 'function') {
        id = id(container);
    }

    // Section data contains layouts and items
    var saveData = {
        id: id,
        title: container.title == container.defaultTitle ? null : container.title,
        items: []
    };

    var items = container.serialize();
    for (var j = 0; j < items.length; j++) {
        // Find if the node is nested
        var parentLayoutPane = RaptorSection.findParentLayoutPane(items[j], node),
            parentLayout = null;

        if (parentLayoutPane) {
            parentLayout = RaptorSection.findParentLayout(parentLayoutPane, node);
        }

        // Set the index of the current node
        items[j].raptorSectionLayoutIndex = j;

        if (items[j].raptorSectionItem) {
            // Add the item to the section data
            saveData.items.push($.extend(items[j].raptorSectionItem, {
                layoutIndex: parentLayout ? parentLayout.raptorSectionLayoutIndex : null,
                layoutPane: parentLayoutPane ? parentLayoutPane.dataset['pane'] : null,
                type: 'item',
                name: items[j].raptorSectionItem.name,
                title: items[j].raptorSectionItem.title == items[j].raptorSectionItem.defaultTitle ? null : items[j].raptorSectionItem.title
            }));
        } else if (items[j].raptorSectionLayout) {
            var panes = {},
                paneNodes = nodeFindUnnested(items[j], '[data-pane]', '[data-raptor-layout]');
            for (var k = 0; k < paneNodes.length; k++) {
                panes[paneNodes[k].dataset.pane] = paneNodes[k].raptorSectionLayoutPane;
                if (panes[paneNodes[k].dataset.pane].title == panes[paneNodes[k].dataset.pane].defaultTitle) {
                    panes[paneNodes[k].dataset.pane].title = null;
                }
            }
            // Add the layout to the section data
            saveData.items.push({
                layoutIndex: parentLayout ? parentLayout.raptorSectionLayoutIndex : null,
                layoutPane: parentLayoutPane ? parentLayoutPane.dataset['pane'] : null,
                type: 'layout',
                name: items[j].raptorSectionLayout.name,
                title: items[j].raptorSectionLayout.title == items[j].raptorSectionLayout.defaultTitle ? null : items[j].raptorSectionLayout.title,
                panes: panes
            });
        }
    }
    return saveData;
};

RaptorSection.getSaveData = function() {
    var saveData = {};
    for (var i = 0; i < RaptorSection.instances.length; i++) {
        containerSaveData = RaptorSection.getContainerSaveData(RaptorSection.instances[i]);
        saveData[containerSaveData.id] = containerSaveData;
    }
    return saveData;
};

RaptorSection.findParentLayoutPane = function(node, limit) {
    var current = node;
    do {
        if (current.raptorSectionLayoutPane) {
            return current;
        }
        current = current.parentNode
    } while (current && current != limit);
}

RaptorSection.findParentLayout = function(node, limit) {
    var current = node;
    do {
        if (current.raptorSectionLayout) {
            return current;
        }
        current = current.parentNode
    } while (current && current != limit);
}

RaptorSection.save = function(saveBlocks) {
    if (RaptorSection.saveUrl) {
        $.ajax({
            url: RaptorSection.saveUrl,
            method: 'post',
            dataType: 'json',
            data: {
                sections: JSON.stringify(RaptorSection.getSaveData())
            }
        }).done(function(response) {
            if (response) {
                for (var i = 0, l = RaptorSection.instances.length; i < l; i++) {
                    var items = RaptorSection.instances[i].getItems(),
                        id = RaptorSection.instances[i].id;
                    if (typeof id === 'function') {
                        id = id(RaptorSection.instances[i]);
                    }
                    for (var j = 0; j < items.length; j++) {
                        if (typeof response[id] !== 'undefined' && typeof response[id][j] !== 'undefined') {
                            items[j].raptorSectionItem = response[id][j];
                        }
                    }
                    var initialState = RaptorSection.getContainerSaveData(RaptorSection.instances[i]);
                    RaptorSection.state[initialState.id] = JSON.stringify(initialState);
                }
                aNotify({
                    title: 'Saved Sections',
                    text: 'Sucessfully saved all CMS sections on this page.',
                    type: 'success'
                });
            } else {
                aNotify({
                    title: 'Save Failed',
                    text: 'Failed to save all CMS sections on this page.',
                    type: 'error'
                });
            }
        }).error(function() {
            aNotify({
                title: 'Save Failed',
                text: 'Failed to save all CMS sections on this page.',
                type: 'error'
            });
        }).always(function() {
            // Hack save raptor blocks at the same time
            if (saveBlocks !== false) {
                var saved = false;
                Raptor.eachInstance(function(raptor) {
                    if (!saved && raptor.isDirty() && raptor.unify) {
                        raptor.getUi('save').getPlugin().save(false);
                        saved = true;
                    }
                });
            }
        });
    }
};
;
// File end: c:\work\modules\raptor-gold\raptor-section\src/static.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/jquery.js
jQuery.fn.raptorSection = function(options) {
    return this.each(function() {
        new RaptorSection($.extend({
            node: this
        }, options));
    });
};;
// File end: c:\work\modules\raptor-gold\raptor-section\src/jquery.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/mouse.js
RaptorSection.prototype.mouseBind = function(type) {
    this.node.addEventListener('mouseover', function(event) {
        this.mouseBlur();
        this.showUI();
        event.stopPropagation();
    }.bind(this));

    this.node.addEventListener('mousemove', this.repositionUI.bind(this));
    document.addEventListener('mousemove', this.fadeUI.bind(this));

    /**
     * Bind mouse over/out events to add button show the placeholder where a new
     * section/layout will be added.
     */
    this.nodeAddSection.addEventListener('mouseover', this.showPlaceholder.bind(this));
    this.nodeLayout.addEventListener('mouseover', this.showPlaceholder.bind(this));

    this.nodeAddSection.addEventListener('mouseout', this.hidePlaceholder.bind(this));
    this.nodeLayout.addEventListener('mouseout', this.hidePlaceholder.bind(this));

    /**
     * Bind mouse over/out events to remove button preview the section when removed.
     */
    this.nodeRemoveSection.addEventListener('mouseover', function() {
        nodeFreezeHeight(document.body);
        if (this.nodeItem) {
            this.hideNode(this.nodeItem);
        } else if (this.nodeLayoutPane) {
            var layout = RaptorSection.findParentLayout(this.nodeLayoutPane, this.node);
            this.hideNode(layout);
        }
    }.bind(this));

    this.nodeRemoveSection.addEventListener('mouseout', function(e) {
        if (this.nodeRemoveSection.contains(e.toElement)) {
            return;
        }
        if (this.nodeItem) {
            this.showNode(this.nodeItem);
        } else if (this.nodeLayoutPane) {
            var layout = RaptorSection.findParentLayout(this.nodeLayoutPane, this.node);
            this.showNode(layout);
        }
        nodeUnfreezeHeight(document.body);
    }.bind(this));
};

/**
 * Binds mouse events to a new widget.
 *
 * @param {Node} nodeWidget
 */
RaptorSection.prototype.mouseBindItem = function(nodeWidget) {
    nodeWidget.addEventListener('mousemove', function(event) {
        // Prevent propagation to a nested layout
        if (event.raptorSectionHandled) {
            return;
        }

        var focusItem;
        if (event.pageY - nodeOffsetTop(nodeWidget) < nodeWidget.offsetHeight / 2) {
            focusItem = nodeWidget;
        } else {
            focusItem = nodeWidget.nextElementSibling;
        }
        if (focusItem === null) {
            this.mouseBlur();
            this.showUI();
        } else {
            event.raptorSectionHandled = true;
            if (this.nodeItem !== focusItem) {
                this.mouseFocusItem(focusItem);
            }
        }
    }.bind(this));
    nodeWidget.addEventListener('mouseover', function(event) {
        event.stopPropagation();
    }.bind(this));
    nodeWidget.addEventListener('mouseout', function(event) {
        var related = (event.toElement || event.relatedTarget);
        if (related && related.raptorSection) {
            this.mouseBlur();
        }
    }.bind(this));
};

/**
 * Binds mouse events to a new layout pane.

 * @param {Node} nodeLayoutPane
 */
RaptorSection.prototype.mouseBindLayoutPane = function(nodeLayoutPane) {
    nodeLayoutPane.addEventListener('mousemove', function(event) {
        // Prevent propagation to a nested layout
        if (event.raptorSectionHandled) {
            return;
        }
        event.raptorSectionHandled = true;

        if (event.target.querySelector('.raptor-section-layout-pane')) {
            return;
        }

        if (this.nodeLayoutPane !== nodeLayoutPane) {
            this.mouseFocusLayoutPane(nodeLayoutPane);
        }
    }.bind(this));
    nodeLayoutPane.addEventListener('mouseover', function(event) {
        event.stopPropagation();
    }.bind(this));
    nodeLayoutPane.addEventListener('mouseout', function(event) {
        var related = (event.toElement || event.relatedTarget);
        if (!related) {
            return;
        }
        do {
            if (related.raptorSection) {
                this.mouseBlur();
                break;
            }
            related = related.parentNode;
        } while (related);
    }.bind(this));
};

RaptorSection.prototype.mouseFocusItem = function(nodeWidget) {
    if (RaptorSection.menuVisible) {
        return;
    }
    this.mouseBlur();
    this.nodeItem = nodeWidget;
    this.nodeItem.classList.add('raptor-section-item-active');
    this.showUI();
    if (this.nodeItem.raptorSectionItem && typeof this.getItemDefinition(this.nodeItem.raptorSectionItem.name).edit === 'function') {
        aButtonEnable(this.nodeEditSection);
    }
    aButtonEnable(this.nodeRemoveSection);
};

RaptorSection.prototype.mouseFocusLayoutPane = function(nodeLayoutPane) {
    if (RaptorSection.menuVisible) {
        return;
    }
    this.mouseBlur();
    this.nodeLayoutPane = nodeLayoutPane;
    this.nodeLayoutPane.classList.add('raptor-section-layout-pane-active');
    this.showUI();
    aButtonDisable(this.nodeEditSection);
    aButtonEnable(this.nodeRemoveSection);
};

RaptorSection.prototype.mouseBlur = function() {
    if (RaptorSection.menuVisible) {
        return;
    }
    if (this.nodeItem) {
        this.nodeItem.classList.remove('raptor-section-item-active');
        this.nodeItem = null;
    } else if (this.nodeLayoutPane) {
        this.nodeLayoutPane.classList.remove('raptor-section-layout-pane-active');
        this.nodeLayoutPane = null;
    }
    aButtonDisable(this.nodeEditSection);
    aButtonDisable(this.nodeRemoveSection);
};
;
// File end: c:\work\modules\raptor-gold\raptor-section\src/mouse.js
;
// File start: c:\work\modules\raptor-gold\raptor-section\src/expose.js
// <expose>
window.RaptorSection = RaptorSection;
// </expose>
;
// File end: c:\work\modules\raptor-gold\raptor-section\src/expose.js
})();document.write('<style type="text/css">@media screen{/* Libraries */\n\
\n\
/* Non styles */\n\
\n\
/**\n\
\n\
 * Style global variables\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/**\n\
\n\
 * Z index variables\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 9, mixins.scss */\n\
\n\
.raptor-ui-cancel .ui-icon, .raptor-ui-class-menu .ui-icon, .raptor-ui-clean-block .ui-icon, .raptor-ui-clear-formatting .ui-icon, .raptor-ui-click-button-to-edit .ui-icon, .raptor-ui-close .ui-icon, .raptor-ui-dock-to-screen .ui-icon, .raptor-ui-dock-to-element .ui-icon, .raptor-ui-embed .ui-icon, .raptor-ui-float-left .ui-icon, .raptor-ui-float-none .ui-icon, .raptor-ui-float-right .ui-icon, .raptor-ui-guides .ui-icon, .raptor-ui-history-undo .ui-icon, .raptor-ui-history-redo .ui-icon, .raptor-ui-hr-create .ui-icon, .raptor-ui-image-resize .ui-icon, .raptor-ui-insert-file .ui-icon, .raptor-ui-link-create .ui-icon, .raptor-ui-link-remove .ui-icon, .raptor-ui-list-unordered .ui-icon, .raptor-ui-list-ordered .ui-icon, .raptor-ui-save .ui-icon, .raptor-ui-snippet-menu .ui-icon, .raptor-ui-special-characters .ui-icon, .raptor-ui-statistics .ui-icon, .raptor-ui-table-create .ui-icon, .raptor-ui-table-insert-row .ui-icon, .raptor-ui-table-insert-column .ui-icon, .raptor-ui-table-delete-row .ui-icon, .raptor-ui-table-delete-column .ui-icon, .raptor-ui-table-merge-cells .ui-icon, .raptor-ui-table-split-cells .ui-icon, .raptor-ui-tag-menu .ui-icon, .raptor-ui-align-left .ui-icon, .raptor-ui-align-right .ui-icon, .raptor-ui-align-center .ui-icon, .raptor-ui-align-justify .ui-icon, .raptor-ui-text-bold .ui-icon, .raptor-ui-text-italic .ui-icon, .raptor-ui-text-strike .ui-icon, .raptor-ui-text-block-quote .ui-icon, .raptor-ui-text-size-increase .ui-icon, .raptor-ui-text-size-decrease .ui-icon, .raptor-ui-text-underline .ui-icon, .raptor-ui-text-sub .ui-icon, .raptor-ui-text-super .ui-icon, .raptor-ui-view-source .ui-icon, .raptor-ui-lorem-ipsum .ui-icon, .raptor-ui-revisions .ui-icon, .raptor-ui-revisions-preview-button .ui-icon, .raptor-ui-revisions-apply-button .ui-icon, .raptor-ui-revisions-diff-button .ui-icon, .raptor-section-add-item .ui-icon, .raptor-section-edit .ui-icon, .raptor-section-remove .ui-icon, .raptor-section-add-layout .ui-icon, .raptor-section-guides .ui-icon, .raptor-section-save .ui-icon, .raptor-section-clear .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
\n\
  opacity: 0.85;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, mixins.scss */\n\
\n\
.raptor-ui-cancel .ui-icon:before, .raptor-ui-class-menu .ui-icon:before, .raptor-ui-clean-block .ui-icon:before, .raptor-ui-clear-formatting .ui-icon:before, .raptor-ui-click-button-to-edit .ui-icon:before, .raptor-ui-close .ui-icon:before, .raptor-ui-dock-to-screen .ui-icon:before, .raptor-ui-dock-to-element .ui-icon:before, .raptor-ui-embed .ui-icon:before, .raptor-ui-float-left .ui-icon:before, .raptor-ui-float-none .ui-icon:before, .raptor-ui-float-right .ui-icon:before, .raptor-ui-guides .ui-icon:before, .raptor-ui-history-undo .ui-icon:before, .raptor-ui-history-redo .ui-icon:before, .raptor-ui-hr-create .ui-icon:before, .raptor-ui-image-resize .ui-icon:before, .raptor-ui-insert-file .ui-icon:before, .raptor-ui-link-create .ui-icon:before, .raptor-ui-link-remove .ui-icon:before, .raptor-ui-list-unordered .ui-icon:before, .raptor-ui-list-ordered .ui-icon:before, .raptor-ui-save .ui-icon:before, .raptor-ui-snippet-menu .ui-icon:before, .raptor-ui-special-characters .ui-icon:before, .raptor-ui-statistics .ui-icon:before, .raptor-ui-table-create .ui-icon:before, .raptor-ui-table-insert-row .ui-icon:before, .raptor-ui-table-insert-column .ui-icon:before, .raptor-ui-table-delete-row .ui-icon:before, .raptor-ui-table-delete-column .ui-icon:before, .raptor-ui-table-merge-cells .ui-icon:before, .raptor-ui-table-split-cells .ui-icon:before, .raptor-ui-tag-menu .ui-icon:before, .raptor-ui-align-left .ui-icon:before, .raptor-ui-align-right .ui-icon:before, .raptor-ui-align-center .ui-icon:before, .raptor-ui-align-justify .ui-icon:before, .raptor-ui-text-bold .ui-icon:before, .raptor-ui-text-italic .ui-icon:before, .raptor-ui-text-strike .ui-icon:before, .raptor-ui-text-block-quote .ui-icon:before, .raptor-ui-text-size-increase .ui-icon:before, .raptor-ui-text-size-decrease .ui-icon:before, .raptor-ui-text-underline .ui-icon:before, .raptor-ui-text-sub .ui-icon:before, .raptor-ui-text-super .ui-icon:before, .raptor-ui-view-source .ui-icon:before, .raptor-ui-lorem-ipsum .ui-icon:before, .raptor-ui-revisions .ui-icon:before, .raptor-ui-revisions-preview-button .ui-icon:before, .raptor-ui-revisions-apply-button .ui-icon:before, .raptor-ui-revisions-diff-button .ui-icon:before, .raptor-section-add-item .ui-icon:before, .raptor-section-edit .ui-icon:before, .raptor-section-remove .ui-icon:before, .raptor-section-add-layout .ui-icon:before, .raptor-section-guides .ui-icon:before, .raptor-section-save .ui-icon:before, .raptor-section-clear .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 20, mixins.scss */\n\
\n\
.raptor-ui-cancel:hover .ui-icon, .raptor-ui-class-menu:hover .ui-icon, .raptor-ui-clean-block:hover .ui-icon, .raptor-ui-clear-formatting:hover .ui-icon, .raptor-ui-click-button-to-edit:hover .ui-icon, .raptor-ui-close:hover .ui-icon, .raptor-ui-dock-to-screen:hover .ui-icon, .raptor-ui-dock-to-element:hover .ui-icon, .raptor-ui-embed:hover .ui-icon, .raptor-ui-float-left:hover .ui-icon, .raptor-ui-float-none:hover .ui-icon, .raptor-ui-float-right:hover .ui-icon, .raptor-ui-guides:hover .ui-icon, .raptor-ui-history-undo:hover .ui-icon, .raptor-ui-history-redo:hover .ui-icon, .raptor-ui-hr-create:hover .ui-icon, .raptor-ui-image-resize:hover .ui-icon, .raptor-ui-insert-file:hover .ui-icon, .raptor-ui-link-create:hover .ui-icon, .raptor-ui-link-remove:hover .ui-icon, .raptor-ui-list-unordered:hover .ui-icon, .raptor-ui-list-ordered:hover .ui-icon, .raptor-ui-save:hover .ui-icon, .raptor-ui-snippet-menu:hover .ui-icon, .raptor-ui-special-characters:hover .ui-icon, .raptor-ui-statistics:hover .ui-icon, .raptor-ui-table-create:hover .ui-icon, .raptor-ui-table-insert-row:hover .ui-icon, .raptor-ui-table-insert-column:hover .ui-icon, .raptor-ui-table-delete-row:hover .ui-icon, .raptor-ui-table-delete-column:hover .ui-icon, .raptor-ui-table-merge-cells:hover .ui-icon, .raptor-ui-table-split-cells:hover .ui-icon, .raptor-ui-tag-menu:hover .ui-icon, .raptor-ui-align-left:hover .ui-icon, .raptor-ui-align-right:hover .ui-icon, .raptor-ui-align-center:hover .ui-icon, .raptor-ui-align-justify:hover .ui-icon, .raptor-ui-text-bold:hover .ui-icon, .raptor-ui-text-italic:hover .ui-icon, .raptor-ui-text-strike:hover .ui-icon, .raptor-ui-text-block-quote:hover .ui-icon, .raptor-ui-text-size-increase:hover .ui-icon, .raptor-ui-text-size-decrease:hover .ui-icon, .raptor-ui-text-underline:hover .ui-icon, .raptor-ui-text-sub:hover .ui-icon, .raptor-ui-text-super:hover .ui-icon, .raptor-ui-view-source:hover .ui-icon, .raptor-ui-lorem-ipsum:hover .ui-icon, .raptor-ui-revisions:hover .ui-icon, .raptor-ui-revisions-preview-button:hover .ui-icon, .raptor-ui-revisions-apply-button:hover .ui-icon, .raptor-ui-revisions-diff-button:hover .ui-icon, .raptor-section-add-item:hover .ui-icon, .raptor-section-edit:hover .ui-icon, .raptor-section-remove:hover .ui-icon, .raptor-section-add-layout:hover .ui-icon, .raptor-section-guides:hover .ui-icon, .raptor-section-save:hover .ui-icon, .raptor-section-clear:hover .ui-icon {\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
\n\
  opacity: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* Base style */\n\
\n\
/**\n\
\n\
 * Main editor styles\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 7, style.scss */\n\
\n\
.raptor-editing {\n\
\n\
  outline: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, style.scss */\n\
\n\
.raptor-editable-block-hover:not(.raptor-editing),\n\
\n\
.raptor-editable-block:hover:not(.raptor-editing) {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAABlBMVEUAAACfn5/FQV4CAAAAAnRSTlMAG/z2BNQAAABPSURBVHhexc2xEYAgEAXRdQwILYFSKA1LsxRKIDRwOG8LMDb9++aO8tAvjps4qXMLaGNf5JglxyyEhWVBXpAfyCvyhrwjD74OySfy8dffFyMcWadc9txXAAAAAElFTkSuQmCC\) 0 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, style.scss */\n\
\n\
.raptor-editing-inline {\n\
\n\
  width: 600px;\n\
\n\
  min-height: 150px;\n\
\n\
  padding: 5px !important;\n\
\n\
  background-color: #fff;\n\
\n\
  border: 1px solid #c1c1c1 !important;\n\
\n\
  border-top: none !important;\n\
\n\
  color: #333;\n\
\n\
  font-size: 1em;\n\
\n\
  text-shadow: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 28, style.scss */\n\
\n\
.raptor-editing-inline * {\n\
\n\
  text-shadow: inherit;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 32, style.scss */\n\
\n\
.raptor-editing-inline *:not(.cms-color) {\n\
\n\
  color: inherit;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Unsupported warning styles\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 8, support.scss */\n\
\n\
.raptor-unsupported {\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, support.scss */\n\
\n\
.raptor-unsupported-overlay {\n\
\n\
  position: fixed;\n\
\n\
  top: 0;\n\
\n\
  left: 0;\n\
\n\
  bottom: 0;\n\
\n\
  right: 0;\n\
\n\
  background-color: black;\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);\n\
\n\
  opacity: 0.5;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 22, support.scss */\n\
\n\
.raptor-unsupported-content {\n\
\n\
  position: fixed;\n\
\n\
  top: 50%;\n\
\n\
  left: 50%;\n\
\n\
  margin: -200px 0 0 -300px;\n\
\n\
  width: 600px;\n\
\n\
  height: 400px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 31, support.scss */\n\
\n\
.raptor-unsupported-input {\n\
\n\
  position: absolute;\n\
\n\
  bottom: 10px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 36, support.scss */\n\
\n\
.raptor-unsupported-content {\n\
\n\
  padding: 10px;\n\
\n\
  background-color: white;\n\
\n\
  border: 1px solid #777;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Toolbar layout.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 9, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-outer {\n\
\n\
  overflow: visible;\n\
\n\
  position: fixed;\n\
\n\
  font-size: 12px;\n\
\n\
  z-index: 1300;\n\
\n\
  -webkit-user-select: none;\n\
\n\
  -moz-user-select: none;\n\
\n\
  user-select: none;\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #f7f7f7), color-stop(100%, #fafafa));\n\
\n\
  background: -webkit-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: -moz-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: -o-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: linear-gradient(#f7f7f7, #fafafa);\n\
\n\
}\n\
\n\
/* line 17, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-outer * {\n\
\n\
  -webkit-user-select: none;\n\
\n\
  -moz-user-select: none;\n\
\n\
  user-select: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 22, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-inner {\n\
\n\
  border: 1px solid #c1c1c1;\n\
\n\
  border-top: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-toolbar {\n\
\n\
  padding: 6px 0 0 5px;\n\
\n\
  overflow: visible;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 32, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-path {\n\
\n\
  padding: 5px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 36, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group {\n\
\n\
  float: left;\n\
\n\
  margin-right: 5px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 41, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group .ui-button {\n\
\n\
  padding: 0;\n\
\n\
  margin-top: 0;\n\
\n\
  margin-left: -1px;\n\
\n\
  margin-bottom: 5px;\n\
\n\
  margin-right: 0;\n\
\n\
  height: 32px;\n\
\n\
  float: left;\n\
\n\
  -webkit-box-sizing: border-box;\n\
\n\
  -moz-box-sizing: border-box;\n\
\n\
  box-sizing: border-box;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 52, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group .ui-button:hover {\n\
\n\
  z-index: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 56, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group .ui-button-icon-only {\n\
\n\
  width: 32px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 60, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group .ui-button-text-only .ui-button-text {\n\
\n\
  padding: 8px 16px 10px 16px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 63, toolbar.scss */\n\
\n\
.raptor-layout-toolbar-group .ui-button-text-icon-primary .ui-button-text {\n\
\n\
  padding: 8px 16px 10px 32px;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Hover panel layout.\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 7, hover-panel.scss */\n\
\n\
.raptor-layout-hover-panel {\n\
\n\
  z-index: 1100;\n\
\n\
  position: absolute;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, hover-panel.scss */\n\
\n\
.raptor-layout-hover-panel .raptor-layout-toolbar-group:last-child {\n\
\n\
  margin-right: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, hover-panel.scss */\n\
\n\
.raptor-layout-hover-panel .raptor-layout-toolbar-group .ui-button {\n\
\n\
  margin-bottom: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Select menu UI widget styles\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 6, menu.scss */\n\
\n\
.raptor-menu {\n\
\n\
  z-index: 1600;\n\
\n\
  padding: 6px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 11, menu.scss */\n\
\n\
.raptor-menu .ui-menu-item:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, menu.scss */\n\
\n\
.raptor-menu .ui-menu-item a,\n\
\n\
.raptor-menu .ui-menu-item a:hover {\n\
\n\
  white-space: pre;\n\
\n\
  padding: 3px 10px;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Select menu UI widget styles\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 6, select-menu.scss */\n\
\n\
.raptor-selectmenu {\n\
\n\
  overflow: visible;\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 11, select-menu.scss */\n\
\n\
.raptor-selectmenu-button {\n\
\n\
  text-align: left;\n\
\n\
  padding: 3px 18px 5px 5px !important;\n\
\n\
  float: none !important;\n\
\n\
}\n\
\n\
/* line 18, select-menu.scss */\n\
\n\
.raptor-selectmenu-button .ui-icon {\n\
\n\
  position: absolute;\n\
\n\
  right: 1px;\n\
\n\
  top: 8px;\n\
\n\
}\n\
\n\
/* line 23, select-menu.scss */\n\
\n\
.raptor-selectmenu-button .raptor-selectmenu-text {\n\
\n\
  font-size: 13px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 28, select-menu.scss */\n\
\n\
.raptor-selectmenu-wrapper {\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 32, select-menu.scss */\n\
\n\
.raptor-selectmenu-button .ui-button-text {\n\
\n\
  padding: 0 25px 0 5px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 35, select-menu.scss */\n\
\n\
.raptor-selectmenu-button .ui-icon {\n\
\n\
  background-repeat: no-repeat;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 39, select-menu.scss */\n\
\n\
.raptor-selectmenu-menu {\n\
\n\
  position: absolute;\n\
\n\
  top: 100%;\n\
\n\
  left: 0;\n\
\n\
  right: auto;\n\
\n\
  display: none;\n\
\n\
  margin-top: -1px !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 48, select-menu.scss */\n\
\n\
.raptor-selectmenu-visible .raptor-selectmenu-menu {\n\
\n\
  display: block;\n\
\n\
  z-index: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 53, select-menu.scss */\n\
\n\
.raptor-selectmenu-menu-item {\n\
\n\
  padding: 5px;\n\
\n\
  margin: 3px;\n\
\n\
  z-index: 1;\n\
\n\
  text-align: left;\n\
\n\
  font-size: 13px;\n\
\n\
  font-weight: normal !important;\n\
\n\
  border: 1px solid transparent;\n\
\n\
  cursor: pointer;\n\
\n\
  background-color: inherit;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 65, select-menu.scss */\n\
\n\
.raptor-selectmenu-button {\n\
\n\
  background: #f5f5f5;\n\
\n\
  border: 1px solid #ccc;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Cancel plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-cancel .ui-icon, .raptor-ui-cancel.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEX///+nAABhAACnAACjAACCAACgAACHAACjAAByAAB1AAByAACDAACnAACCAACHAACgAACNAACbAACXAACMAACSAABfAACYAACRAACjAACbAAChAACqAACNAACcAACHAACqAADEERGsERHQERG+NjaiERHUTEzYERG4ERGlFBSfFRX/d3f6cnK0JSWoHh7qYmLkXFyvFRXmXl7vZ2fNRUX4cHDXT0/+dnbbU1O3Li7GPT26MTG2f8oMAAAAIXRSTlMASEjMzADMzAAASMxIAMwAAMzMzEjMzEhISABIzABISEg/DPocAAAAj0lEQVR4Xo3PVw6DMBBF0RgXTO+hBYhtILX3sv99RRpvgPcxVzp/M5syb7lYepxDABDeYcQ5wg+MAMhr3JOyJKfxTABqduuvjD37O6sBwjZ+f76/7TFuQw1VnhyGYZPklYagKbKLlDIrmkBDGq1hUaqhM4UQJpwOwFdK+a4LAbCdlWNTCgGwjLlhUQqZ8uofSk8NKY1Fm8EAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Snippet menu plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-class-menu .ui-icon, .raptor-ui-class-menu.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNJREFUeNpskn9MG2UYx7/3o7TlSgNLi1jciiA71jkt6UgAnQpdTMYMTkayLCQzWbIY3faHiQR1TP/TLJkxLsaYmDidM1kTBQqZEp1hKyMgGRMhYXTgoCBFFhmchZZe797X9zpK0O25e3Nv7r6f7/O8z3Ncz1ERRnDpG86t8d2tUuKRkwv8RO+Kn4hCSUFVfHy2TRuOfEooHdQIVglNI5BXnwF/fwsbW4cFi61ZjWadtMkylDD2xPOlKlmuwKKEhtyiXScI+OPr2nSEpT4Y6bdR8EccZZWVzidrqucxglAggLzaHeASJly+fAku607MeF97pa+0rCF3qs1tWxo1jJD9bQBc9xHxVKm/6YDFWeLT1BSXcTdlZUE0m6Elk0ipKt6f3QePx4NQKARd1zk5FIA7dAnirEJ3el2yx5Rl4YhV1/RUih2L428ND0RG+q/dfarq+fwd3kr3buF3fPfDNOTFrt8K1dtwhIaQZIlEZQ0DF8+edrC9YGQuLJHz6l49Uf7Hzd7JQnfRXva88nRVjbuxVEFx+ONf7iqTY+p1ihRwiABvGT04ZyzeGAMHV/TO+HnBZML+Y80VqeTa30TX0k0f6DzfE52aDAv99EN9kb6rCkJjQtcvpGdowCY+PZtTFXWNj68pCsxmqz1bsoOy68evzvX+eWfipnQDX+r36Ht8Ts6elVjsZ5UlFiXTBsykyMvfVmwTLGYtlUyqC3MzsaGrP81EB28P2qa5LtyjXzjcblc4EhlkcCtDiMhxFNr6j6ETBNo/O6OoOraywnVW+1/mJXQ4h0GToB+9UF/v+76zs4/BbzL5qsGI2BQ6RTBFEDROTViH5i1lsK/Bb8f4mXV4KAG0sE/RDPMfg0w85spBR6wWlNLty9Kc/6Xq6gzcyuC+zVoxz2HbXAEcTul+P/6h2+Px+L6LPT3v1Hk8nzwHdDO4+//JmIH0sCL8u6TIwWMffP66z+c7HdO04LPA6MOE4lj28Qde5sZ/PXvoRbu35ejL38RifJAQsgFveZTDlgJuk4H1jQcMFLXJ2/7123OJ5cQFQqyjGfCJcn4DXh8c/hVgAAYpUQUdUKm5AAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Clean block plugin styles.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-clean-block .ui-icon, .raptor-ui-clean-block.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoNJREFUeNqkU11Ik1EYfo6bm7WZW2r+MDNTZ9ZQcbYws0iNpiZEBF4UXWgXCXURXQQiBTYhgi4qRo0y+gEpNImauKVkhkzDNrxoCjrNZSSapnNLv+n2nc5HGmFJgQcezuGc93nPc877vIRSivUMYqwkEFIIeQQQsnzA5rP1FEe0BKXZP894Bm6AQiKGPsjDsLSEmpD/uCSX8e4JYOv9LJF+noNhb/ExrW8BBvE/yClmO824YbpaKUgwG6sjvy8gQVdwQNv4qNkeCK6tQMHiz7H5kMs1fKe1Rw7/xARKTl8+Gq4hX5496bR/nkINz8MiKAhliGCIYohjRF2YLCJnW2ZelrM8I6mlxYzCQj1arX4cTBzC4ZMXyhYD11soD074E3KrglwJkyl3S2WbZBvCI8OjE1JjlDGqqCXvojjg4bB5ZwKaO0NRUFAKq/U5CpOGIRKJYG2638AuOxHCZLT5PDP+NF3JvvhkbSY3y8eOdA+IvV9nsFGlxLf+MZRle2E2NyI/vxQvnXGYc88hEABhgEifSdw2O521dfSmyyjiZRFyxKSqIGK1Gu8bgTI5FgEfh3TFPBra+6BW70H5+dqGvBTUs2d8XKmCJVtDFqanHRd35GqKhxz9EFMRtmakwDc1C8oFoUjcglO7PNCdKW9i8beZ/C7BMr+qwDY6+/rpTeO1h3ZFlAJJOWqMD36CZ3IG0mg5Jj+48fjp3bdV+dTEwrtWeKt9YEnbTvy21y+q1ercIp59UHJWGsYcQ7B0tHUz99WFSdH+O+EPIzElHa5RKnWN2pQVVce1gz1OvHn3vpcPolYiwavV8Ws50SKVgD4wNdUt98ilEALLX5tp3d243gQ/BBgABJ4L2+7frOgAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Clear formatting style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-clear-formatting .ui-icon, .raptor-ui-clear-formatting.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wGGxcPH7KJ9wUAAAEKSURBVDjL3ZG9SgNBFIW/I76D1RIEazEIFitWNguxUPANUkUIKG4jYiEBC7WwUFJZiNssFvoOFipMFx/AoIVVEAvxB7w2MyBhV5Iq4IHLPecy9zBzBv4nJLUltQc5O1awXAE+gAnPhzMAFoE7YNzzoQ0WgBvg1vPBDSRNAl9m9gC4ebPpc+jkkADkkOTggi4KryFpV9KMpHgfXr/T1DJwGWxn4IIuM7iQdB1qDu73oPder9spuNDPYLZoeUrSZd9saQUej6DzUqvZCbhj2Pjr+pu/ZzuwnMLbc7Vqh+BCPyjIIAaefMVhuA69bhTZGnyuwlULXDeKrFWWQT+akDTAbfk3B90s+4WR4Acs5VZuyM1J1wAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Click to edit plugin\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-click-button-to-edit .ui-icon, .raptor-ui-click-button-to-edit.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABSlBMVEWymwFVVVWymgEKCgqtlQG2AQEDAwOvmQOokQKlfACgiQLTAQHiAQGFbwEICAgcHBwQEBDkAQF8ZwEGBgZbTwJ1YACIdwNbRwhhTA5VBQVACAhQUFDSAQFvBgbgAQEXFxcxCQlgBgaVgxW0AQHFAQEMDAxVVVWoAACkjQKpkgK8FRWbhQKhigKgAACwmgPkAQGJcwGPeQFVVVWlfACojQGAawGGcAG8cwOmfQCOeAGbdQCXcgDx5MB5YwF9aAGDBgaXgQKSfAKYggKOawG7pWLdzqBvWQF2YAB/cyyMegh7XgGlkVVnTgFnTgGslQNnYkFoTgFnTgFnTgFnTgGrlALy5sL29vbd3d3k02D/7oji0V3v3nH4aGjMzMzh0Fv864P4537r2mkAAAD/iIj043jj0l3m1WO7qjPk01/yXFzMu0Tfzljgz1rezVaqP1K6AAAAVXRSTlMAAEAAtwAAAAAAAAAAAAAAAAAAAAAAAAAAAABpPwCdgykAo0O5LySxwkSdw0UyQyvHRR8npshGAAAABmzvyke1AMVFOcD1w0cAsIXRljzAAJZJCQAA2U4xywAAALVJREFUeF41yNOaA0EUAOHTmUxo27axto1RzPW+/21y+uvUXf1gtVmcmk0uIKQaCfEUcAFIo7BIJSngAmSC4vA7Cz6vB2iqhDiSjsqg77FXK59SNOZHYD/5v0lzHAX607/HCscAf7nK5bUM8AdysaRjgD+TT04NW9j8x1etfryFZkvpj9udHYRAOA67e/s/vweHZoSuycjD2blwcXnlQLi2I9wKd/cPboQnQmH+/PL6hvBOKKwBNYghCPFyErUAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Close plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-close .ui-icon, .raptor-ui-close.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEX///+nAABhAACnAACjAACCAACgAACHAACjAAByAAB1AAByAACDAACnAACCAACHAACgAACNAACbAACXAACMAACSAABfAACYAACRAACjAACbAAChAACqAACNAACcAACHAACqAADEERGsERHQERG+NjaiERHUTEzYERG4ERGlFBSfFRX/d3f6cnK0JSWoHh7qYmLkXFyvFRXmXl7vZ2fNRUX4cHDXT0/+dnbbU1O3Li7GPT26MTG2f8oMAAAAIXRSTlMASEjMzADMzAAASMxIAMwAAMzMzEjMzEhISABIzABISEg/DPocAAAAj0lEQVR4Xo3PVw6DMBBF0RgXTO+hBYhtILX3sv99RRpvgPcxVzp/M5syb7lYepxDABDeYcQ5wg+MAMhr3JOyJKfxTABqduuvjD37O6sBwjZ+f76/7TFuQw1VnhyGYZPklYagKbKLlDIrmkBDGq1hUaqhM4UQJpwOwFdK+a4LAbCdlWNTCgGwjLlhUQqZ8uofSk8NKY1Fm8EAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Basic color menu plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 6, color-menu-basic/color-menu-basic.scss */\n\
\n\
.raptor-ui-color-menu-basic-menu > div {\n\
\n\
  min-width: 100px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 10, color-menu-basic/color-menu-basic.scss */\n\
\n\
.raptor-ui-color-menu-basic-menu span {\n\
\n\
  padding-left: 2px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, color-menu-basic/color-menu-basic.scss */\n\
\n\
.raptor-ui-color-menu-basic-swatch,\n\
\n\
.raptor-ui-color-menu-basic .ui-icon-swatch {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  background-image: none;\n\
\n\
  border: 1px solid rgba(0, 0, 0, 0.35);\n\
\n\
}\n\
\n\
\n\
\n\
/* line 23, color-menu-basic/color-menu-basic.scss */\n\
\n\
.raptor-ui-color-menu-basic-swatch {\n\
\n\
  float: left;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Dock plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 8, dock/dock.scss */\n\
\n\
.raptor-plugin-dock-docked .raptor-layout-toolbar-path, .raptor-plugin-dock-docked-to-element .raptor-layout-toolbar-path {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 13, dock/dock.scss */\n\
\n\
.raptor-plugin-dock-docked {\n\
\n\
  line-height: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 17, dock/dock.scss */\n\
\n\
.raptor-plugin-dock-visible {\n\
\n\
  display: block;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 21, dock/dock.scss */\n\
\n\
.raptor-plugin-dock-hidden {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Dock to screen plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-dock-to-screen .ui-icon, .raptor-ui-dock-to-screen.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAwFBMVEX///8NDQ1VVVVVVVVTU1M5OTlLS0tHR0dVVVVDQ0MfHx8vLy8+Pj40NDQPDw/Gxsa4uMTr6+vz8/O2xO0tT8Tv7++uut0lR7PBz/hcdcwiRKvp6emqt9s+XtbQ1ehHac1thuX5+fmptdzk5OT29vbh4eFXed/n5+fu7u7x8fGfrecoSq739/fCz/jFxcjLy8q4xu3KytbDzevb29vY2NjU1NPQ0M7P1eY1V7vBzvdkhuzHx8bFxcbg4ujFxczHx9F6WxVSAAAAEXRSTlMAhmZZWnNrbSJvfnhxdWTT046to6oAAACXSURBVHheZco1FsMwAATRTcxhkZnCzMz3v1WkyvbLb6YZ2Fq9oNmA3j2ezpft87X5fPc9HXhUAZN12QTI/HvBz4BbFWD2V5K7dFX6JmCNKKVxyMJYdmQBDhVi4DHGvIEQ1AFac0ICzhnnASHzFmDMplKyS1RmBtAmQyk/5CqkDTSjsbS4LlSiJtAg6k3fqQppAJ1aWQd/fntuHFvCkQDlAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 13, dock-to-screen/dock-to-screen.scss */\n\
\n\
.raptor-plugin-dock-docked .raptor-layout-toolbar-inner {\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-pack: center;\n\
\n\
  -moz-box-pack: center;\n\
\n\
  -ms-box-pack: center;\n\
\n\
  box-pack: center;\n\
\n\
  -webkit-box-align: center;\n\
\n\
  -moz-box-align: center;\n\
\n\
  -ms-box-align: center;\n\
\n\
  box-align: center;\n\
\n\
  width: 100%;\n\
\n\
}\n\
\n\
/* line 21, dock-to-screen/dock-to-screen.scss */\n\
\n\
.raptor-plugin-dock-docked .raptor-layout-toolbar-toolbar {\n\
\n\
  text-align: center;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Dock to element plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-dock-to-element .ui-icon, .raptor-ui-dock-to-element.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAsVBMVEX///9VVVUNDQ1VVVVVVVUvLy9TU1MfHx+4uMTGxsZBY+hAYuYREREPDw9BY+kiRK0lR7Wwvue9y/O5x/C+zPVcfuO4xe5CZMjBz/iywOgzVc81V7q0weoqTLAjRasrTcE7Xd1Qcte2xO3Azfa7yfHQ0M7Ly8rFxcbFxcy1wuvHx9HKyta/zPXp6enBzve2w+zY2Njb29vh4eHU1NPr6+tlh+3Hx8a5xu/FxcjCz/jn5+fv4craAAAADnRSTlMAZoZZInhaftPTwIBCZLWComUAAACBSURBVHheZcRVcgJRFADRJiNYMu5uuBPP/heWx9eF4lR1o2sjoelgTi/n98Xya/Wz3u4mJnw+gvD3XghtchRJC3G/F30MeeCJIIfSG4RXQjV8i6EC2++Eb4MTFSJyoO7StBaQbVw3uyqG6mBAcyqK5k8Zqz7GMLMsa/6ivN72xpN/8isdAjArQVYAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-inline-wrapper {\n\
\n\
  width: 100% !important;\n\
\n\
  padding: 0 !important;\n\
\n\
  margin: 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Dialog docked to element\n\
\n\
 */\n\
\n\
/* line 25, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-to-element-wrapper {\n\
\n\
  font-size: inherit;\n\
\n\
  color: inherit;\n\
\n\
  font-family: inherit;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 30, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-to-element-wrapper .raptor-layout-toolbar-outer {\n\
\n\
  /* Removed fixed position from the editor */\n\
\n\
  position: relative !important;\n\
\n\
  top: auto !important;\n\
\n\
  left: auto !important;\n\
\n\
  border: 0 none !important;\n\
\n\
  padding: 0 !important;\n\
\n\
  margin: 0 !important;\n\
\n\
  z-index: auto !important;\n\
\n\
  width: 100% !important;\n\
\n\
  font-size: inherit !important;\n\
\n\
  color: inherit !important;\n\
\n\
  font-family: inherit !important;\n\
\n\
  float: none !important;\n\
\n\
  width: auto !important;\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-orient: vertical;\n\
\n\
  -moz-box-orient: vertical;\n\
\n\
  -ms-box-orient: vertical;\n\
\n\
  box-orient: vertical;\n\
\n\
}\n\
\n\
/* line 50, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-to-element-wrapper .raptor-layout-toolbar-outer .raptor-layout-toolbar-toolbar {\n\
\n\
  margin: 0;\n\
\n\
  z-index: 2;\n\
\n\
  -webkit-box-ordinal-group: 1;\n\
\n\
  -moz-box-ordinal-group: 1;\n\
\n\
  -ms-box-ordinal-group: 1;\n\
\n\
  box-ordinal-group: 1;\n\
\n\
}\n\
\n\
/* line 57, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-to-element-wrapper .raptor-layout-toolbar-outer .raptor-layout-toolbar-toolbar .ui-widget-header {\n\
\n\
  border-top: 0;\n\
\n\
  border-left: 0;\n\
\n\
  border-right: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 64, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-element {\n\
\n\
  /* Override margin so toolbars sit flush next to element */\n\
\n\
  margin: 0 !important;\n\
\n\
  display: block;\n\
\n\
  z-index: 1;\n\
\n\
  position: relative !important;\n\
\n\
  top: auto !important;\n\
\n\
  left: auto !important;\n\
\n\
  border: 0 none;\n\
\n\
  padding: 0;\n\
\n\
  margin: 0;\n\
\n\
  z-index: auto;\n\
\n\
  width: 100%;\n\
\n\
  font-size: inherit;\n\
\n\
  color: inherit;\n\
\n\
  font-family: inherit;\n\
\n\
  float: none;\n\
\n\
  width: auto;\n\
\n\
  -webkit-box-ordinal-group: 2;\n\
\n\
  -moz-box-ordinal-group: 2;\n\
\n\
  -ms-box-ordinal-group: 2;\n\
\n\
  box-ordinal-group: 2;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 89, dock-to-element/dock-to-element.scss */\n\
\n\
.raptor-plugin-dock-docked-to-element .raptor-layout-toolbar-inner {\n\
\n\
  border-top: 1px solid #c1c1c1;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Embed plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-embed .ui-icon, .raptor-ui-embed.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAxlBMVEX////////fNzfaMTHVLCzKISHFGxvvR0flPDzpSEjdMTH4Y2PaKyvtTk7PJibXIyOnLi7lQECkKyvSHR3mPj6eJCSUGhqRFxfqQkL0XFziOTmOFBSBBwehKCiHDQ3PFRWaISGXHR3wVlaECgqqMTGLEBDGHR365eW1ICDaXFz139/LDg7NLi6tNDTSKSnMNzd9AwP1TEy/Fhbwxsbqv7+7EhKzFBS6EBDonZ3akJDkhISxBwf8a2vLIiLPcHD88fH67+/fYGAnLmvBAAAAAXRSTlMAQObYZgAAAJtJREFUeF5Vx0WShFAUBMB631F3afdxd7v/pQaiN5C7BK4mgM3nxAahczfihIgrrfVTqs+qGN2qLMvHwy4tB6sOmWeMIXp7/jI9L8PCYowR0e/3xzVj1gLLiHNOg9OR82iJvBZC0GD/J0Sdo7B93+/78+737AKNK6Uker2UA7fBNlBKPdyos2CLWXI/ksywnr+MzNdoLyZa4HYC/3EAHWTN0A0YAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 13, embed/embed.scss */\n\
\n\
.raptor-ui-embed-panel-tabs {\n\
\n\
  height: 100%;\n\
\n\
  width: 100%;\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-orient: vertical;\n\
\n\
  -moz-box-orient: vertical;\n\
\n\
  -ms-box-orient: vertical;\n\
\n\
  box-orient: vertical;\n\
\n\
  -webkit-box-flex: 1;\n\
\n\
  -moz-box-flex: 1;\n\
\n\
  -ms-box-flex: 1;\n\
\n\
  box-flex: 1;\n\
\n\
}\n\
\n\
/* line 22, embed/embed.scss */\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-code-tab,\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-preview-tab {\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-orient: vertical;\n\
\n\
  -moz-box-orient: vertical;\n\
\n\
  -ms-box-orient: vertical;\n\
\n\
  box-orient: vertical;\n\
\n\
  -webkit-box-flex: 1;\n\
\n\
  -moz-box-flex: 1;\n\
\n\
  -ms-box-flex: 1;\n\
\n\
  box-flex: 1;\n\
\n\
  -webkit-box-sizing: border-box;\n\
\n\
  -moz-box-sizing: border-box;\n\
\n\
  box-sizing: border-box;\n\
\n\
}\n\
\n\
/* line 28, embed/embed.scss */\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-code-tab p,\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-preview-tab p {\n\
\n\
  padding-top: 10px;\n\
\n\
}\n\
\n\
/* line 32, embed/embed.scss */\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-code-tab textarea,\n\
\n\
.raptor-ui-embed-panel-tabs .raptor-ui-embed-preview-tab textarea {\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-flex: 4;\n\
\n\
  -moz-box-flex: 4;\n\
\n\
  -ms-box-flex: 4;\n\
\n\
  box-flex: 4;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 39, embed/embed.scss */\n\
\n\
.raptor-ui-embed-dialog .ui-dialog-content {\n\
\n\
  display: -webkit-box !important;\n\
\n\
  display: -moz-box !important;\n\
\n\
  display: box !important;\n\
\n\
  width: 100% !important;\n\
\n\
  overflow: hidden;\n\
\n\
  -webkit-box-sizing: border-box;\n\
\n\
  -moz-box-sizing: border-box;\n\
\n\
  box-sizing: border-box;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Float block plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-float-left .ui-icon, .raptor-ui-float-left.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAS5JREFUeNpi/P//PwMlgImBQsACY1zaIH4A6Bp7dAUzV31jnLHy22YgkxFqIQhf/vfvXymKAQ8eidtra35lYAQqY+FgZWBmZ2X49fk7AxvbX6DsN1+CLlgwn5khMECAwcLiL4OogiIDj6QEw9uLZ4AGfAVJ70BzAQg7ohigrnaP4cEDLoY3bzkYzL6/ZVA34ma4ev07w/sPv0HSHgRdoKICUvgR6IWPDK8evWb49+8iw/1bfxhevwYbsBfNdhC2BkkwwqLRxRhuFgM3HyMDrwAjw8vH/xj2nvuH1WZgIDKgGMDExLQNiz9xYWagASboBpAU/zAXsCCJ7SbCZjaghexAmgOIFUh2AXKyh7GRXTARiI2w2MoKVMwBtRVkOysQHwNiPxQXDFhmotgAgAADAKYzbYynfqX2AAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-float-none .ui-icon, .raptor-ui-float-none.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAkFBMVEUAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAABAQEAAADRrxbRsBYBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAACcegnCrQ6ffgqukQv+/GixkS3duyLhwyfkyizevSNRMDCigDLauC/y41DcuiLrzTTQrhWCYBiObSDErz3r4VvApCt4Vg6dewnDaH3NAAAAGHRSTlMAycfDxcu9v8HYu+DAwIm3uZnRkdDn7LIyy/h+AAAAWklEQVR4Xp2KRwqFMBQAYzfGXmPtvfx//9spgvAWQcRZzgx6gz6dGEDkQ1FWNRBN2/XZCMRvXtZtB4LSfxon6AHTsjVZUQWR5xz2cWfJxYR9eFf2MQnCCH3hAIfwBUXJe8YuAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-float-right .ui-icon, .raptor-ui-float-right.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAS1JREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzZYRzBaaHcWE4kZGJ8aCe/0sHFAOAoB5d4avXfAwPH4swaGt+ZWAEGsnCwcrAzM7K8Ovzd3sMFwDBWpjNMPrK5b++C94yMwQGCDBYWPxlEFVQZOCRlGB4e/EMAzYDgtFdICr6kUFd7QfDgwdcDG/ecjCYfX/LoG7EzXD1+ncGeyNMAzYiuQDsCmHhf54qKr+BzI9AL3xkePXoNcO/fxcZ7t/6wwDzAyMsGoGBiDWUnQwR4tx8jAy8AowMLx//Y9h95g+GAdvQXIAPM//798+EKBfgAkADMMJgNxE2swEtZAfSHECsQLILkJM9jI3sgolAbITFVlagYg6orSDbWYH4GBD7obhgwDITxQYABBgAdBpg+9sXURwAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Show guides plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-guides .ui-icon, .raptor-ui-guides.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHZJREFUeNpi/P//PwNFAGQAIyMjDK9BYqNgXHqZ0MSYcFmEyxBGsClMTGS5+t+/fxg2biLGAGTXoBvATGoYkuUFGMDmhd2kGjL4vHCUUi9cIjcpnwPi2UAsBaXPQZPwOXxscD5Cy0xLSbUc3YDnJLue0uwMEGAA2O1APJOrHFQAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 10, guides/guides.scss */\n\
\n\
.raptor-ui-guides-visible * {\n\
\n\
  outline: 1px dashed rgba(0, 0, 0, 0.5);\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * History plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-history-undo .ui-icon, .raptor-ui-history-undo.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe1JREFUeNrEUzFrFEEU/mazu7d3x8U9g0ROwkHEwrSrNmksJBxok1RRwUIEz0awFStZoqQw5B9ok1jYiRDBwl4PSaFJVLCMMfHWS7zb3ZndGd9ssgdXiVzhwGNnH+/75n3vm2FKKQyzDAy5zKmHLRSKRdiOA6tQgGlZDcrPUme3dcFBEPSLlZQQcZyFTFN8WZiGOUCnVCMRws9/4zD8BwkEFpz7N66c8vQJUbeLNEn+LuEQqxo8jv0716e8/f0UPIp0+n1OTbFLsUF1z+n7boAgA0eRf/em521tdeE4BuYunfa0OYehEMUJ3wt6Fza+7s4EkVwh3DJFLyPgYejfa0576+u/MsZe70g/tX8QRujSHDgXtpTpmOvarkjYrZ97Qg/xUTYDOv3B46U3rcnJMqRUUKaBtsXwzWDYJmfax1y0x07gx/FxfLbckd+1Wj0dYddI8vlcwhp1gcUnr/z55mXvbcfA99WXrVwjMwzGHNs0yiWbVSpFXqtVMTFxkrU+zOt55ENc04N7tvTCP9O86mn76D6cIzDSODYRhhUEnXFguy4/bs6gWr1IubN9F3KShHN8Wn6a3QNtZaFU0lvtZXAUm1LK13Jn5z7Vzw0Q9EmE0NvZDNnpoDw6OuC7voFUs0C19Uzif39MQxP8EWAA91//GdkHdYEAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-history-redo .ui-icon, .raptor-ui-history-redo.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAd9JREFUeNrEU89LG0EUfjP7KyvEGsRorRhoySGCuSyht0IPgicFQZCcvXsvHoP/Q8FDKZRCpQityKIHvZT2YI6t6MUfCJqQKpt1d7Ozu7N9O9vWhIIUcvDBt/OY4X3z3vfNkjiOoZ+g0GfIyaf46gtQSQJF0wQIvePN5nJiJYS8xmUzDAIz8H1gnQ74npcS3BeubYOm60lqCKQjm/89QhSG0HEcSG6tzo4bAWM1JJntGaE7UNQKcL6EaQkxknQfcS6Imk0GizOTxrvPx7Xf4pvdBAOc85VBnVTLU6OPhx8NZBVZUjmPIYpStNsMGo0I5l8+NT5sfxckggCFAYrFzyaHlo1yoYDdSs2WD9e2A/atC4wFooMkJBT79EqBF88Lxu7eYU0QMN+v5Eey1enSRKF1y6ULFoKFAFUDntMgwpsiDuAEMbgBhydDKmxtH9TRmdWUwPOWSsXi2Fmr7RyfNG6sa9vzbI+FHT+MI3730hbmjIwEcLTxSRSrup5qgH6Wvn39cd76ae9TSndw6wzRQNiSooQxiohjHij4Pqy379PiTMb86wJalL+6ZB+pLK9RSv+x0XddkQfrb9K2VdXssRHZk4M1mRDc6XXWsaw/aT15ibKimN3n5MF/pr4JfgkwANDA599q/NhJAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Horizontal rule plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-hr-create .ui-icon, .raptor-ui-hr-create.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAXhJREFUeNpi/P//PwMTExMDEmgEYi0gZsSCrwJxNUzhv3//GBixGEA0ABnAgkV8LZqtTFDaF6aAX8KCwdBrA4QDckFq+1sGSUVrBkZGRqKwvEEhg2PyS7BeuAv07AsZXjw4BmJuQLIV5gImJLYrv7g53LlwA8TkLRgCi28wXDzQF/Dr10+G379/M/z58wfoz/9gfUxMrAzMzGwMsnr5DBwcvBgGHABiexBDyTiV4cuXTwxfv35j+PHjB9CQ/0BnszCwsHAysLHxIofVQSB2gBlgnxogAqREiI6B+ikf7ZFdcHD2hjf2X79+Zfj8+TNeF7Cz84K9wMrKdRDZAAcQ8fbJaYYndw4zYAsDHlFjBjZxKwyXwAPx1cMTDIdWxoKY+5BCHo7f31tp8VM9iUFQ0oaBQ9YBYQIoLo1dygmmA2QgIGHJoGhUCtaLLSkfweICVqA6diDNAcQKyJYTlRdAanCJY8sL04HYFM3WM0Acgs0QRlymEwsAAgwAwwCYinucCRoAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Image resize button.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-image-resize .ui-icon, .raptor-ui-image-resize.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABAlBMVEX///9TddoqTLAjRasiRK1ihOlOcNVYet9miO5QctdWeN05W9k4WthCZMgyVM0zVc9BY8ddf+VSdNk0VtE+YOM8Xt8rTcFCZOssTsBCZOolR7U1V7o1V9Nlh+1CZMj5/Pz9/v5BY+kiRK3y9/f///9cfuP2+vojRasrTcHu9fUqTLD1+vo1V7o7Xd0zVc8lR7VTmv9sqf9coP/v9v/I3uvV5/fb6v1BfIS33Opxp7BZkpv+///s9PRQctdVnP9CdahShbhlmMri7v+Qw/Ci1fuPvv+71/+JvcZJlf8pZW2Cs8yw0fx7rt692f+rz//A2v/c6/+01P8cV2A2aZwxdFNuoZMUoDQrAAAAHXRSTlMAAAAAAADAAMAAAAAAAMAAAMDAwADAAAAAwAAAACp/YQ8AAACvSURBVHhehcc1csNQAAXA98WMljFiNjMFmRnuf5VM4lGVwtst/nFdgeXJL54VXBdITYlUJDMFLMIdVzhiAaLqJYc7iaeKgNHpB3cn4+nk+ibodwyAorr+w+P788vrm9+lKICm897X93yxvJj1cpoGGCaKP+5X283tOo4YBmi2R+Xn6dn50+VVOWo3Ab1eZEc7WVHXAVvRhhVNsYGBUzuo1JwBEIathvxXudEKQ+z3A1iJGpAw1RqcAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 10, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image {\n\
\n\
  position: relative;\n\
\n\
  min-width: 300px;\n\
\n\
}\n\
\n\
/* line 13, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image .form-text {\n\
\n\
  width: 40%;\n\
\n\
}\n\
\n\
/* line 16, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image label {\n\
\n\
  width: 35%;\n\
\n\
  display: inline-block;\n\
\n\
}\n\
\n\
/* line 20, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image .form-text, .raptor-resize-image label {\n\
\n\
  -webkit-box-sizing: border-box;\n\
\n\
  -moz-box-sizing: border-box;\n\
\n\
  box-sizing: border-box;\n\
\n\
}\n\
\n\
/* line 23, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image div {\n\
\n\
  margin-bottom: 1.25em;\n\
\n\
  z-index: 10;\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
/* line 28, image-resize/image-resize.scss */\n\
\n\
.raptor-resize-image .raptor-ui-image-resize-lock-proportions-container {\n\
\n\
  position: absolute;\n\
\n\
  z-index: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 34, image-resize/image-resize.scss */\n\
\n\
.raptor-ui-image-resize-lock-proportions-container {\n\
\n\
  right: 16%;\n\
\n\
  top: 19px;\n\
\n\
  height: 54px;\n\
\n\
  width: 40%;\n\
\n\
  border-color: #ccc;\n\
\n\
  border-width: 1px 1px 1px 0;\n\
\n\
  border-style: solid solid solid none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 46, image-resize/image-resize.scss */\n\
\n\
.raptor-ui-image-resize-lock-proportions {\n\
\n\
  position: absolute;\n\
\n\
  right: -21px;\n\
\n\
  top: 50%;\n\
\n\
  margin-top: -21px;\n\
\n\
  height: 26px;\n\
\n\
  width: 26px;\n\
\n\
  border: 8px solid #ddd;\n\
\n\
  -webkit-border-radius: 39px;\n\
\n\
  -moz-border-radius: 39px;\n\
\n\
  -ms-border-radius: 39px;\n\
\n\
  -o-border-radius: 39px;\n\
\n\
  border-radius: 39px;\n\
\n\
  -webkit-box-shadow: 0 0 0 1px white inset;\n\
\n\
  -moz-box-shadow: 0 0 0 1px white inset;\n\
\n\
  box-shadow: 0 0 0 1px white inset;\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #eaeaea), color-stop(100%, #ffffff));\n\
\n\
  background: -webkit-linear-gradient(#eaeaea, #ffffff);\n\
\n\
  background: -moz-linear-gradient(#eaeaea, #ffffff);\n\
\n\
  background: -o-linear-gradient(#eaeaea, #ffffff);\n\
\n\
  background: linear-gradient(#eaeaea, #ffffff);\n\
\n\
}\n\
\n\
/* line 60, image-resize/image-resize.scss */\n\
\n\
.raptor-ui-image-resize-lock-proportions .ui-button-text {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
/* line 64, image-resize/image-resize.scss */\n\
\n\
.raptor-ui-image-resize-lock-proportions .ui-icon {\n\
\n\
  margin-left: -8px;\n\
\n\
  margin-top: -8px;\n\
\n\
  left: 50%;\n\
\n\
  top: 50%;\n\
\n\
  position: absolute;\n\
\n\
  background-repeat: no-repeat;\n\
\n\
}\n\
\n\
/* line 73, image-resize/image-resize.scss */\n\
\n\
.raptor-ui-image-resize-lock-proportions.ui-state-hover {\n\
\n\
  cursor: pointer;\n\
\n\
  border-width: 8px;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Insert file plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-insert-file .ui-icon, .raptor-ui-insert-file.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcVJREFUeNrEkz1rFFEUhp+587nzmY2JYXeNki1isWKihZ0gaGFjIULA3sYfEQikFVsrwTaF+gdsY2ljF4KdYuNmY9yM2bkz47kzECxlU3jgMncu87znPS9zrbquuUgpLljO1s7OI3n25+S/OWVZDt7u7r6ah36yvf3cKbW2Ksnh7ksLZYFriy1ZMw0mnrQjK5AzGXa4BKMe6Aq2btcY1tFaq1K+3Lhi4TmQCbAUwfef0HHbdxPz5BRuyKAbAzidgWEM6+iiaAT60T7rvTW6Ub/pfH0FVpJWKBdgeKl1cqZb0UZA2EZAVxUfPr3mYxDy8NZj7o3uN5aNI2M7L2AxhKJsz0LXjFG1AoURELWDwwMWsgX2Tt5wfPKV1eWr9BZXuZx26XjS2gpb2GtH+13VFI3AbKZKUTs7HvDjl8N07PFu8plOcEgURsRRTBzHJHFClqQi3GdtecCdaz6GPXcw7D3A8zx83ycMQ5IkJssSut1UlsBZRCohRJGL8hW6zs8d2JU4+LvqJuGSXNJTKpe9YjqtOToqCYKgaXJzVBkHtjMZjz3bdXn/4uk//j6mWY7tehjWyjY3n4mD4VwXSakv1n+/jX8EGAAI68BpoWbP4wAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Link plugin\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-link-create .ui-icon, .raptor-ui-link-create.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAilBMVEX///8EBARUVFRUVFQEBARTU1MqKiwfHx5MTEzGxsZNTU1FRUWAgH8SEhJnZ2fd3d06Ojrg4ODIyMgODg4DAwMSEhLCwsGcnKXExNEvLy+ysrh+foMQEBBBQUEEBATJydeenqcDAwPT09OIiIjj4+OZmZl3d3fU1OPCwsHW1tXq6urr6+va2trGxsaRnmwcAAAAI3RSTlMAimdfRTOWgDXbAGXFj339cv3dAHtC3OP8bt+2cnuA/OMA+Akct2IAAABoSURBVHhetcVZFoIgGAbQ7wcVwyEKtBi01OZh/9urw2EJdV8ufkHmnDHG85RE2a7Wp812GGJtiaqvG1rOXws1dV9BzWKi2/3xfL1pErOCdT6YS2SCdxZdsdtfD8ci1UFnIxGNWUrjHz6V6QhqNdQf6wAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-link-remove .ui-icon, .raptor-ui-link-remove.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA2FBMVEX///8WFhYvLy9LS0sEBAQODg4EBARNTU0DAwNVVVVUVFQtLS1nZ2cfHx46OjoSEhLGxsZTU1OAgH/T09NUVFQEBAQ6OjpMTEwvLy+4uMDCwsEQEBCvr7sSEhIEBAR+foMqKixFRUUEBARDQ0MBAQEBAQG5ucQiIiICAgIODg7Z2dlAQEBMTEwsLCxGRkYAAABPT0/e3t4mJiYqKiopKSlUVFQiIiJJSUkjIyNFRUU5OTkBAQEoKCi/v8zCws+qgFWFZkY7MSbc3Nzj4+Pm5ubOztzU1OTQ0N6IE/7FAAAAQ3RSTlMAAAAAigAAAAAAZwB9gACP2zPF+F9ocjVu39xy40KAtpZlRQBrUPx9AIb8AE8AAAAA/AAAAAAAAAAAAAAA/PwAAAD8PWHlxQAAALtJREFUeF5dzsVWxEAQheHqpGPEPeMWGXfcmQHe/42oC+ewmH95F1UfGWFyhZLQUBHlTvBxOp92gZP/DaN25Esp/ag9ukeUxa5p6qbpxpmHqGgNOtWm6gxahaIokwX1ht16ps3q7rAn9utrg7RxX6Z6KvtjbWJZGHTuuLLtw8P2f/CAWd4uGYNBqCpj5s1NM2cMPd3xc2D4EDDkIWCmj1NgSEHAlGUJDAnEmOfPr+8XxtDr27sQwHDA0GU/2RcVwEV78WkAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* Dialog */\n\
\n\
/* line 18, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu {\n\
\n\
  height: 100%;\n\
\n\
  width: 200px;\n\
\n\
  float: left;\n\
\n\
  border-right: 1px dashed #D4D4D4;\n\
\n\
  display: -webkit-box;\n\
\n\
  display: -moz-box;\n\
\n\
  display: -ms-box;\n\
\n\
  display: box;\n\
\n\
  -webkit-box-orient: vertical;\n\
\n\
  -moz-box-orient: vertical;\n\
\n\
  -ms-box-orient: vertical;\n\
\n\
  box-orient: vertical;\n\
\n\
}\n\
\n\
/* line 27, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu p {\n\
\n\
  font-weight: bold;\n\
\n\
  margin: 12px 0 8px;\n\
\n\
}\n\
\n\
/* line 31, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu fieldset {\n\
\n\
  -webkit-box-flex: 2;\n\
\n\
  -moz-box-flex: 2;\n\
\n\
  -ms-box-flex: 2;\n\
\n\
  box-flex: 2;\n\
\n\
  margin: 2px 4px;\n\
\n\
  padding: 7px 4px;\n\
\n\
  font-size: 13px;\n\
\n\
}\n\
\n\
/* line 36, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu fieldset label {\n\
\n\
  display: block;\n\
\n\
  margin-bottom: 10px;\n\
\n\
}\n\
\n\
/* line 39, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu fieldset label span {\n\
\n\
  display: inline-block;\n\
\n\
  width: 150px;\n\
\n\
  font-size: 13px;\n\
\n\
  vertical-align: top;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 50, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-menu fieldset,\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset {\n\
\n\
  border: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 54, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap {\n\
\n\
  margin-left: 200px;\n\
\n\
  padding-left: 20px;\n\
\n\
  min-height: 200px;\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
/* line 60, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap.raptor-ui-link-create-loading:after {\n\
\n\
  content: \Loading...\;\n\
\n\
  position: absolute;\n\
\n\
  top: 60px;\n\
\n\
  left: 200px;\n\
\n\
  padding-left: 20px;\n\
\n\
}\n\
\n\
/* line 68, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap h2 {\n\
\n\
  margin: 10px 0 0;\n\
\n\
}\n\
\n\
/* line 71, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset {\n\
\n\
  margin: 2px 4px;\n\
\n\
  padding: 7px 4px;\n\
\n\
  font-size: 13px;\n\
\n\
}\n\
\n\
/* line 75, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset input[type=text] {\n\
\n\
  width: 300px;\n\
\n\
  padding: 5px;\n\
\n\
}\n\
\n\
/* line 80, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset input[type=text].raptor-external-href,\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset input[type=text].raptor-document-href {\n\
\n\
  width: 400px;\n\
\n\
}\n\
\n\
/* line 83, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset.raptor-email label {\n\
\n\
  display: inline-block;\n\
\n\
  width: 140px;\n\
\n\
}\n\
\n\
/* line 87, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset.raptor-email input {\n\
\n\
  width: 340px;\n\
\n\
}\n\
\n\
/* line 92, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap ol li {\n\
\n\
  list-style: decimal inside;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 99, link/link.scss */\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap\n\
\n\
.raptor-ui-link-create-panel .raptor-ui-link-create-wrap fieldset #raptor-ui-link-create-external-target {\n\
\n\
  vertical-align: middle;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 104, link/link.scss */\n\
\n\
.raptor-ui-link-create-error-message div {\n\
\n\
  padding: 0 .7em;\n\
\n\
}\n\
\n\
/* line 106, link/link.scss */\n\
\n\
.raptor-ui-link-create-error-message div p {\n\
\n\
  margin: 0;\n\
\n\
}\n\
\n\
/* line 108, link/link.scss */\n\
\n\
.raptor-ui-link-create-error-message div p .ui-icon {\n\
\n\
  margin-top: 2px;\n\
\n\
  float: left;\n\
\n\
  margin-right: 2px;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * List plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-list-unordered .ui-icon, .raptor-ui-list-unordered.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMlJREFUeNpi/P//PwNFAGQAIyNjGBCvgdIMxGKQXhaoORFlZWWBXV1dTED2KqjYGiBmRMJMaOwrQFwOc0EEEG+A0iS5gBFEMDExkeX9f//+MTAxUAhgBsQC8U4oTRKABWJ8Rkae84wZk5iB7MVQsW1IAYYLW8MCMRGID0Bp+gYiC46EhTPR4QrEdCA+A6VJT8pAcDMsLB3EuAniQP14BIiPAfEJID4FxGehqe8OED8B4vVgvVADioH4GZTGGWhYvUtpbqQ4JQIEGABjeFYu055ToAAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-list-ordered .ui-icon, .raptor-ui-list-ordered.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAM1JREFUeNpi/P//PwNFAGQAIyNjIxCvAWJBIGYgFoP0skDNqQfidUDMiGT2GigfhpnQ2FeAuJwFSQMTmuNCiPEBTFMblF1CahAwgvzBxMREVvj9+/cP7oIuIN4Bpcl2gRMQJwFxDFRuG1KAYcVAF1jDojEBiGcAsQSp0QjzgiEQawLxSiibNoGInmqRE9J0IJaEYnNSXAAzYC4QNwJxIJLcEbRAYwZidiDmgOLTYPVIzgJpPgD2F45Aw+olqAFrgfg5EBeTagAjpdkZIMAAg/ZGwsH5qkAAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Logo plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 8, logo/logo.scss */\n\
\n\
.raptor-ui-logo {\n\
\n\
  border: none !important;\n\
\n\
  background: transparent !important;\n\
\n\
  -webkit-box-shadow: none !important;\n\
\n\
  -moz-box-shadow: none !important;\n\
\n\
  box-shadow: none !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 14, logo/logo.scss */\n\
\n\
.raptor-ui-logo .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNjE5MjlDMjdFRkUxMUUyOUY4RjkzODc5OEQ0RTRCQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoyNjE5MjlDMzdFRkUxMUUyOUY4RjkzODc5OEQ0RTRCQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIyNDkzQTBGN0RDQjExRTI5RjhGOTM4Nzk4RDRFNEJDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkIyNDkzQTEwN0RDQjExRTI5RjhGOTM4Nzk4RDRFNEJDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+fRcgAAAABzFJREFUeNrsVwtQVNcZ/u7dZR+siAILyPJaWECEgtNMRk0oIlIFwQeZpMamTTBqo2JriWmiMdWmvpsUNdhOYm0Tg0bbmhCxBtxFY3B8kIQWNBpgWdmFBQQUlceyj3v39r8LpmamOuNqZ9IZz8w393XOd79z/u/897+MIAj4rjQW36H2UMz/hRjpnR4sSx39rWtZaDAiJT04bXRiilaKz1r4MLr9CCFmpMtlQm28HB1NDmBJig+EIQ4mq/tbPKvOD927mLu0pwl5i2do4qaNl2t8pKw/x/GDnXbebKq50lLV4Gyj5zsIHQ9sZe7QNq1bHrdiYq52NMSM4OQBzi0Ge9RoiRCSMEs7aZajC8f29i+wW7st1ON1guF/IWaXMlFbGJ8RAVg44FZ+Eo+Ce+SawARh5vPqcChiw5sNFr1pt1lND64+SAPnZCQqCpf+gMfa18woq6RIhPgAahrOjPRgxBOCQO9t7wGau6CbGoGEx+THWI0UFic88EqM1cZ9g+TMCWvmpDEw7TNim64B87RNOPznSzAcaAFEf7K3aERBQf8RZ+1B3vKY79NV6QNZGf/gsJVZM6akFe22IeeIC/MNWvCtMcjkW5EV3gqjsZ3eLxkWwtw2kMIFQQ3TKQeWLo78Cd3J91qMOLGCraUK/6DQ38RND2eiYq7C5BTQoNFhRRWLV0wJcHAsLplcELp53BYvmC67ULzjDBncgsPlFih1EmROUDybmSjzToybvCiVSl9yuZxj3KZOnLGIBpUhM16LP3xxHorMRfj1CTXMDjcJZ4bNy5JXInwQm67FsiVkdLkMLxZN8ewTbax2clyE2rvdtHBraYBEplzLMCwYTkB09Di6a4RBr0d5+WHsXFeC3z8vx8qiOGCAEpmc5mWNxsW3z9N2v0LMJFDCoA0tyM6ToksaHtw/eVtAEtB7zysjl8sXyZS+CnHWAmn+YbKvZ/Zt7Z14ruBXcDs6MTVODoTTbVUc+qtUqNg9QHnYhKSeQSSxA0gK7wccg2iso066F1iR06swyZW+P5XKFPDjYrBnZR2y09ORMpGFfWgQ/X0mjKePQMrPtAAZ9F/zPkVHiR1pF4DI6HjgcSKIpuTSmozGqyH4ciAV0vhJIuezXoWJdws6w6bNmD0pA+pz9fjTxjrU1qzE03nvwN7FYP8bGWIUUPnUaWT3aYB4ovJJR3+zEv3CJ+gOrUN5SxOmFzfBbh8i2OG0C7HeieF4T4hw7Sa6A8agoCUKJQuO45B+KSU0M4UnGEcmHsDsPvKSirxCntJlK9H6xwYkMb8EFAYUFgfgnZeTkbalDhzHeTi93dpM/sYNONx4Dh+ajTBmPwpFp5JUhtHXmLbz1x1w+YZCP1EKvdaMVvYy5OPD0DqqGphTBb9IDu+9+iYm//wjMJQUWQKVuMzdxDB3qoGPflLpVodrGYVCgb8sXoz84AlIhgTb+Wps/Nsk2PddQBujQoirj0icUIUxGOyU4aKgQ63hKGR+Icj47afgeQ5Oh9MTpq62y8Ls3Bz2nsPEcS7xSyIXz194fy/+/upaVNy4gTXCo2g+0o7IsRzK3/2cdpfgyTPKMAn8lFHwZ0/i+thEzF/3obgSuH2ybp5zeRWmMf6jr9qHbMOElAF/tGULnnplNbayFJ4LofBJDsKymWHITI/AIyu247mSC7BJVFi+ZxZe2zUBH297Bm632zNW5HAQF3H2eCUmKipqX/0XZygTCwS3h/Ca/QZMV77EyfZqDBpMWL27DVUnLEjt2YyDL87DhrcTwZ08B+54DX6RI6BsfcHIeAF1xEWc+73yDLWAsrKyboncTxKl00EikeJ3BdPw/qldqPi4AntW78HBf+4dLiUfW4S31gdjl74LHTdTwPf2QhrAY8GGKgoND3OzEbyjn8/Pzw+GNxmYfNCbGuNbWl97lpJcHxmRh0KlAi6uQk7uDPy1/hB8qtcPk7BuNFrcyPC1Y27RTjxTUoH5r+s9Y/r6bkLkSE9PLy7OUfV6XULEpM5c/sScvLajHx1Eh7UNgREJqCulwqryZUiri/HSW83YOWUBNqUNIFZyBactPlDWbPZ4RYQ4Rhy7cOFCS2Bg4Pr7KjtpdYYojJmFgeqaffv3B3zd3I2t9UosCmpFiNIKxuzEkgwB9B2F1TgIDZUU1fpyfC+lCIYTxzFKKceKwsJrGo0m69A8v6H2rrv/St/RM8Nlwa0yV9DabLaKQwc+SDj7+SmcP3uSsnAnlj3ugj9tfoZqqxv+DIxNAmqESEQkZ2Hu3FxMmz6zUaVSZVes0pm/utSOz0wC/tFkvz8xI4Io/aLIam5cc1Z/bFRjSwe6rl3HoMvh6eunYBEbFgh/9ThMzcodiIqN30L9t+8ojBtCRzfMZhsqGxk02Jz3L+Y2UWPp8GNCNiGFMG7kUSeBihlUEj44XfvVdZfLBSflTgdlX4fDgSfzZsDbrf3wx/+hmP/W/i3AALMDE5j9eIuBAAAAAElFTkSuQmCC\) 0 0;\n\
\n\
  background-repeat: no-repeat;\n\
\n\
  width: 35px !important;\n\
\n\
  height: 35px !important;\n\
\n\
  left: 0 !important;\n\
\n\
  top: 0 !important;\n\
\n\
  margin: 0 !important;\n\
\n\
  padding: 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Paste plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 7, paste/paste.scss */\n\
\n\
.raptor-plugin-paste-panel-tabs {\n\
\n\
  width: 100%;\n\
\n\
  height: 100%;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, paste/paste.scss */\n\
\n\
.raptor-plugin-paste .ui-tabs a {\n\
\n\
  outline: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, paste/paste.scss */\n\
\n\
.raptor-plugin-paste-panel-tabs .raptor-plugin-paste-tab {\n\
\n\
  border-top: none;\n\
\n\
  border: 1px solid #c2c2c2;\n\
\n\
  overflow: scroll;\n\
\n\
  height: 80%;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 23, paste/paste.scss */\n\
\n\
.raptor-plugin-paste-panel-tabs .raptor-plugin-paste-area {\n\
\n\
  background-color: #fff;\n\
\n\
  border: none;\n\
\n\
  min-height: 300px;\n\
\n\
  min-width: 90%;\n\
\n\
  padding: 2px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 31, paste/paste.scss */\n\
\n\
.raptor-plugin-paste-dialog .ui-dialog-content {\n\
\n\
  overflow: hidden;\n\
\n\
  width: 100% !important;\n\
\n\
  height: 100%;\n\
\n\
  -webkit-box-sizing: border-box;\n\
\n\
  -moz-box-sizing: border-box;\n\
\n\
  box-sizing: border-box;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Save plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-save .ui-icon, .raptor-ui-save.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVNJREFUeNqkU71ugzAQPowtwdAdqRLK3odg6161a+cukZonoGrElgWWDqhb16oP0AfoytStirows0QRMj/unQsohAQi5aTD5vju4/Pd2VBKwTnG6cEYe8bl6s73P09Jel8ur3H5ruv6CUiBYRgfQRAosnrCyQhLOZTLG1ImpYQSA1VVjf7dNE0gLOV0R6AXlAMSk4uiGCUQ6ITdJzDpz0SQTxAoxlqVZo+gLEuQyDxFwIQAwg4IiPV3vYbL2WyUgDBHFbxG0Um9t237sIIkSeDYYGHbur3neQMCTgqoRWEYDToh8NyLxSO4rgtpmrY14D0CUsA5h80mh/n8QQdXq7CTTN/ILMtqa9AjEDjOGrTdSnAcRwdpr1unzB5BMweiGwY8tx/H8U+WZbmUSoPJlfr3NrZLgDkXujbNXaD9DfoLAt8OFRHPfb8X+sLcW+Pc6/wnwABHMdnKf4KT4gAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Snippet menu plugin.\n\
\n\
 *\n\
\n\
 * @author Melissa Richards <melissa@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-snippet-menu .ui-icon, .raptor-ui-snippet-menu.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAUVBMVEX///8XODhUfn5PeXkwVVVUfn5JcXE5X19BaWkbPT2/0ND+///5/f3r9/fr+vry+vq2x8f+/v66y8vs9PTU5eXl9PT2+vrCcW7i7u6uv78zqiKT+FVrAAAACnRSTlMAgmdpd01sc29httCJoAAAAEhJREFUeF61yEcOgDAMBdFAup1GL/c/KOLLygngzW7UN+zYWQzNk2CN4dK9z+tbchihLqIGDJ+P8yJqRNljmLKJYjDi0EX1jwctjAPf3g65IAAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Special Characters plugin\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-special-characters .ui-icon, .raptor-ui-special-characters.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANRJREFUeNrUkz0KAjEQhZNFUAtxt9B7WC1Y2e45rDyAp1ms9yZrKXgD27VYsRELs76BF0nY+AOpHPhg5k3mEYZEd12nYiJRkRFtMPDcEs9vDGbMz+BmG8aYsAEjBWuwoIni8AHswMU7LUu0aK2FLSjBnLViXrLnzYR2kIMjaBytoZb/ssQryAJ6xt5XgwosQeFoBbWqdzqwA2EFaqeuqamPO6C4QdqCkdOSvJVe7+W6bogp2IMTmRBbSy/1bu064npiMHzzPiQe4I6Z11vQ//+ZngIMAFDvbrCjwfedAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Statistics plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 * @author Micharl Robinson <michael@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-statistics .ui-icon, .raptor-ui-statistics.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhFJREFUeNrEk7tv01AUxr/4kcRO7Fh1HghFgSAeYglDlIfUbGEBhaWoUxFiQWJGMDDyhzB2ZmANYmAoIvQPaIHIkVJjKyWkcdzYSR1zbhSGQhFDB47007333PN9V/cVCcMQ5wkO54wIxe+5q8Rt4gaRW+VsYo9oE1/+ZpAktjKZzL1arXatWCzmFEVhOYzH40m327U7nc7nwWDwhlLbxITN8SsDVvisXq9vtVqtuqZp2XK5HDcMg5vNZlylUon7vq+XSqXLi8WiYJqmTvWfiNkvg8e06gMqLDmOI5AIvV4P8/l8CeuzHMHn8/kcmeiWZQWk6zCD67quP280GuXNdlv4qKrwTk6WwpXoFNVqNTKdTtf6/X7C87wPzOAhrX4nCIK195KEp4aBtxyHKRm4roujozGdwQSO49LYx/7+VzIPeVEUOcsyh+wab9Ge0+SKGW3nhSzj5WiEoWlhMvHolKOIRmVIkgpZVhGPKxAEGdlsIc20zOASz/NSs9lkl4IwJuOJH+CVksDi2APPx0iYIgNlCTNYXy8hmdQkpmUGCfag2u134DgJipKGdqGAR6NjbKdVOAMbQRAiRsaCEKMaHru7XdYutRw95R+Hh0NXVTNIpXQy0KDrOVy8chOb34Z4XcjCMvZoO86p12bbBy7Tsv5dYoc4OAtFFM3BxkZ4xtzOSvvPuE98X7V//oX//ht/CjAAagzmsnB4V5cAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Table plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 8, table/style/table-support.scss */\n\
\n\
.raptor-plugin-table-support-selected ::selection,\n\
\n\
.raptor-plugin-table-support-selected ::-moz-selection {\n\
\n\
  background: transparent;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, table/style/table-support.scss */\n\
\n\
.raptor-plugin-table-support-cell-selected {\n\
\n\
  background-color: Highlight;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Table plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 6, table/style/table.scss */\n\
\n\
.raptor-ui-table-create-menu td {\n\
\n\
  width: 14px;\n\
\n\
  height: 14px;\n\
\n\
  border: 1px solid #000;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, table/style/table.scss */\n\
\n\
.raptor-ui-table-create-menu .raptor-ui-table-create-menu-hover {\n\
\n\
  border: 1px solid #f00;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-create .ui-icon, .raptor-ui-table-create.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA81BMVEX///9Vf38LKytAZ2cpTU0wVVU0WlpLc3NVf39TfX04Xl4YOjoNLS08Y2NRenpEa2tOd3dHb2/C09NEzP+8zc31+fn6/Pzx9/fu9fXA0dHF1tbD1NRDy/73/Pzp9vbk9PSG0uz+//+I7v/p+fk0vO/5/f38/v7u+Pg9xfj0+/tCyv3r9/fm9fXx+fm+z8/H2Ng4wPOF6/w6wvU2vvE1vfCE6vvM2tpkzvU/x/rO3d29zs7J2tr///88w/Z/5fZ94/R64PF43u/K2dni8/PM3NxByfzQ3t6D0OmBzueAzOV+y+R8yeJ6x+B5xt94xd7I2NiF0utdtcIgAAAAEnRSTlMAZodwend1a01nc4Flcmhuam1CIHuOAAAAuElEQVR4Xl3KRZbCQBQAwM9EcGuXOO5u4+52/9PQLytCrQsKuYwCFK8zilCLsTd82fdvlvPVuh3XoNHFyXCx6d/eze8f2t0G5DvY2/2/vX98fn3//Hby0PRxEjGmGJOMEb8J9QH2oqvZq0bb6SUZ1MGamEGpolRSSiYWVHvpOGj0aEavCqWRGZwrziXnZFQCN0jHs0Z/ZgQuOGMzhFBCSCHI2AE7TIfSSJoR2lBuPZ1olaFykVGBc0fWbx5/ckww/gAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-insert-row .ui-icon, .raptor-ui-table-insert-row.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAeZJREFUeNqcU0FrE0EU/mYyIaRoaNOQJlGSbjy0FuxR8VIoUcGDN4X+gUJ/QA899dBf0V76CwTBS6EVIsVLBQ8hLdbiRgrRCKE2JmmTNtmZvre7WVBEGx+83fd23vfN997MiuerqxBCPAOQxvBWU8YYkGderq2tD4umzZeUdhyOhaHHkw+ATwitdeB/yt8XRkFYoRyPQGrDFAKP7whsfzbuW2tyWt62gYLFJJ6/qQBcT1ipnH7fVeD4BDu2QV51Yb6dwfBu5I+iBPyuIbTnnDsmBsIK1fcIfAXwdq52sDwTD3rdOzzEg+npIN8tlUhBFoSV6ufDL7j5LvuVFbxI9ICmgTWmcFyvB/Ow0mlUarUgTycS4HpXweVY25zet+cdkrbx6em1T6CY2vIUnLdaxxhpFZmRYtydu/dP8MfdsqvAJWienORudJPz9KFIMfZevb2WApeg1xNK1qMidmAt6EWDlcI+qEvkQx1YqhP0/LuzaV+BTJRmOMgx4+tGFJ34CMotIBOP49b4OG7TwJrtNrLJJHITE5hMpfCj0RgokOqi22XC0OAY+R4UIsBRtRrcPLaybf+Scz1hQ+qU+iaLhMNhbE61/Q6JAZm/zoDrCRsRsdlZ7muRmPPD/kxSyooYDOV/7UqAAQBguExUpw0RrAAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-insert-column .ui-icon, .raptor-ui-table-insert-column.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABFFBMVEX///8LKytVf39TfX08Y2NVf393rpBLc3NHb29Reno4Xl5Od3c0WlopTU1AZ2dEa2swVVUYOjoNLS0wt0BEzP+8zc3x9/fu9fUrsDmG0uxDy/4xuEHp9vYcnSbI6cu9zs71+fn6/PwgoisHgQozu0QorDXr9/cwt0Dp+fnu+Pg0vO8WlB38/v7+//8kpzD5/f3k9PTx+fmI7v/3/PxCyv0utD3m9fX0+/vi8/P///943u/I2dl4xd6w5/u/8/tAyPu67vau5fpS6mNf0PpayvS95PEr4zy54O2F6/zX5OTb5+cg4DHP3t7X4+PT4uJkzvVd7W4W3idG6Fdl7nbQ4OB5xt/M3Nzg9f055UrT4OA1vfCE0eoavkAQAAAAFHRSTlMAh2Znck0aa21oc2p1enBud4Fl4L/CnmUAAADNSURBVHheZcpFUgRBAAXRDy3jSkm7y7gL7u6u978HXWwggtzk5kFZFanpWqpmVwBp4ycncMQkoNAnxmzvaOft4Piz0y8ApR6ZzM53oyja3+z0SkBuSIy7rxPzyTx72R7mgPyUTHTfn9/PfZ9O80BtSQx961I71G5cuqwB1XEmPC9+jD2PjquA3BbiYvA++HBpWwaKSSYYC04DxmhSBMqWELf2lX3tUqsM1BeZ4Lz70OWcLupAZSTEcxiGry4dVYBGa/23VgNorvytiX99A3lfH44tztyBAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-delete-row .ui-icon, .raptor-ui-table-delete-row.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfhJREFUeNqcU0FrE0EU/mbdEHpQJA1tk0hs4iGttIgUKhVvsaIWL2L/QMHizYvnFvoLehEKgtScPemt5lTQkkICxVaKNAElJEKJhhib1N2Z8b3Z7EJFAvHBx74H833zvfdmxeLq6gMAMQweda31W1spFX+9trYxKPvRysoT/tpKSqEpuVMESNGARAP8q97NXgTzjICU0lKaJQTmrwhsHWnzVYogga0ykE2xiId8BeDzzPMEXFfInsC7skba7kLXfkHzbYTbQ0T8piCUB66lvgDmGQHXdXsO4N1c7eDZ1UjQa+HwEDcmJoJ6e2+PHCTBvDMOFqMODuoWUuEwvhwfB/NIxWKo1OtBHYtGweev7+zsKt+BJGvjD+cwv76Or5kZVO4t9N1AlXCtVHpOvoueACn+PDlBaXkZNwsFfKB8YXa2/x6npmZe5XLkwHFMC41WC3ObmzhoC5Pn8vn+r6hWK9q+Ax7i6fYRNjo20q0O7pILv+e/wZGgudxfWnqa2d9/b5ED08Kb5hCSiRB+Ow7ikQgSw8O4RANrtdtIjozg8ugoxsfG8L3ZNEOkd3Dr0+Qk7NNu95y/Rn4H2TDwuVoNXh7Hx3L5TG0cE8+s8UejEQ6FQniZafe6IwXE+/bP55nHuTg/Pf2YlNOD/kyWZVWEEC+EP5j/jT8CDADTO03xCBe9dwAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-delete-column .ui-icon, .raptor-ui-table-delete-column.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABJlBMVEX///9Vf38LKytEFBRRenowVVVEa2sYOjp6AABHb28pTU00WlpTfX0LKyuKAABVf39AZ2dOd3cIKCg8Y2NLc3MNLS04Xl5jVlZDYGBzAABEzP+8zc29zs76/Pz1+flDy/7u9fXx9/e3MDC7MzP+///M3NyI7v/8/v7x+fm4MTH0+/uqJiblxsahHx/u+PiG0uyyLCylIyPk9PS1Ly/3/Pz5/f00vO9Cyv2uKSnp+fnp9vacHBye4vzm9fXr9/fT4OD6Z2fI7PmF6/zX5OSiICDX4+PH6/j8bW2a5/RAyPua3vhkzvX4YGCE0er+c3PQ4OD2+vrzUlKJ0ut5xt94xd543u/xTEw1vfD1WVn///+O1/HvR0fI2dmh7vvb5+fH19f/d3fi8/OZ9EmDAAAAGnRSTlMAZocAaHdugZltenVnAMxNcGoAcmtlc0REzGDVx0oAAADWSURBVHheTcrDYgRBAIThSgZrZZnuMde2FdvW+79Eum/7H6ouHxJ7uyWA6NtuUUB0iD44m1qWdf7Sd0Qg5RNvsP6qbqunT30/BWR6RL+4el/dHt8/PPYyQKhLvIaq2ratqrQbAuQy0Ruf36Xf0pFCyzKQLDKhaZ3rjqbRYhJI17nYNE+aC4XW00BuzoRpDpdD06TzHBAZc+FWLis/Ch1HAGnGhGG0XluGQWcSEG5zcVO7q7kKbYeBwOiPN3mesB0FgOw+Lx//iBfYZ4HYAU8IHgYF9jH8A8JjJyK0AUFIAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-merge-cells .ui-icon, .raptor-ui-table-merge-cells.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA81BMVEX///9Vf38LKytOd3c8Y2NLc3MwVVUpTU0YOjoNLS1Vf39TfX04Xl5RenpEa2tAZ2c0WlpHb29EzP/6/Pzu9fXA0dH5/f3r9/eG0uzk9PTp+fk0vO/1+fnx9/e8zc3u+PhDy/7F1tb0+/tCyv3C09M4wPP8/v7i8/O+z8/m9fXx+flhg+n+//8nSbg5W9o9xfi9zs73/PyI7v8mSK3D1NRCZMjJ2trp9vbH2Ng1vfA2vvE/x/qF6/w8w/Y6wvV94/R64PF43u+E6vt/5fZByfyF0uuD0OmBzuf///+AzOV+y+R8yeJ6x+B5xt94xd5kzvXK2dmu5BAUAAAAEnRSTlMAZodqcmt3eoFlTWdzaG5wdW1C/rgCAAAAtklEQVR4Xl3Kw7rDUBRA4d0b1TgIjdq2dYn3f5qeL5k0/QdrtCCbSshC7j0hB4UOcoPLur/dVVdLo1MAroZGwebUP++rh6NR40CQkft3vd0/Pr++f35lASpDNFIx9jCmGNvDChR95KqzRTvmF6HUYodpTk2TsrZKwDvRMZ6E/43B2OEhr7DDsrqWRVmVPJTn0dGLzcsgNtlBiEcIJcRuiiBp0eFNQtoY2JoEab3+RE9D5i0hA68e7McfFiRaMwIAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-table-split-cells .ui-icon, .raptor-ui-table-split-cells.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAA8FBMVEX///9Vf38LKys8Y2MwVVU0WlpVf39TfX0YOjoNLS1Od3dAZ2dRenpEa2s4Xl5Lc3MpTU1Hb29EzP/6/Pzu9fXm9fW8zc35/f3k9PTp+fnu+Pjx9/f8/v7A0dH0+/tDy/7+///F1tY4wPOG0uz3/Pw9xfjp9vZCyv1CZMjx+fn1+fk0vO8mSK3r9/eI7v8nSbjJ2tqF0uuD0Ok1vfA2vvGAzOWBzuc/x/qF6/w8w/Y6wvV94/R64PF43u+E6vt/5fZByfzD1NTC09O+z8+9zs7///9hg+nH2Nji8/M5W9p+y+R8yeJ6x+B5xt94xd5kzvVtEZTHAAAAEnRSTlMAZodyd3VNZ4FlanBobnNrem0aKGmPAAAArUlEQVR4Xl3KRZLDMBQA0Z8xU0CSmR1mZoZhuv9t4rI2cV71soEv5PAgvOYIoEYobJ6W9fUmmU27kQqyhwbN1aF+3Ca7fdeToWSi8H88Wcy/vn9+/8wSVGpoUMU4xtjH2KhVQAtQWB29v1GBBko7PTqdFq2tAONkR49yGCj208N1h7R+EbhGdnxSDQ5YPT0IiQnxCTF0FspWdsTni3+9GVYZRPvjgS2C9JIjwbM7cpQh7ppJ8UgAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Tag menu plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-tag-menu .ui-icon, .raptor-ui-tag-menu.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAU5JREFUeNpi/P//PwMlgAVEMDExNQIpbRL1Xv337189C5Sj29zcHPjnzx+4LMhlQAVg/PfvXzgNwuzs7AxdXV1McBcAAfPv378Zbt68+XblypVHYYYUFxf7gTRMmDBhE0zM0tLSWl1dXRikB+x6ZK8ANZ8EUv5QzPLp0yeGz58/w+TB4sePHz/JxsYG1wNzwbWmpiYQex5y+Pz8+ZMBGsgsSOLzZs2aBeJfQ5YoxRbA379/B/sZzYC1UMyALoEOWH/+/AUMPLALWPFGIy4DQEHEyMhAvgGMjCxAAxiJMwBLimRjZgaFNiNIjg1dEmowJBqxaDYHYg6QARBDGDigYgzoFjJhcdUKUJLQ1TUVg6QVZgY9PTMxkBhUDtUlIJNgzoGCZ9HRWZIg8b9/QbbAXMcITGgzngMZUsiuwGbABiC2whFmx4A4AMMASgBAgAEAx96Jw4UbHlsAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Text alignment plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-align-left .ui-icon, .raptor-ui-align-left.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAItJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAjWYrEN2VYPbAZR1QUb0WxEZmPD1lR3wTYCttpSJQxg6mE0sgt2E/AzCLMBMTsQcwCxAskuQE722FwwEYiNsNjKClR8EUjH4w2DActMFBsAEGAAnS84DrgEl1wAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-align-right .ui-icon, .raptor-ui-align-right.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAIxJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAvYjGYrMhuEHanugo0EbETH1jQPg714bGcGYhOqu2A3AT+DMBvQQnYgzQHECiS7ADnZw9j4wmA61J+sQMUcUFtBtrMC8TEg9kNxwYBlJooNAAgwAJo0OAu5XKT8AAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-align-center .ui-icon, .raptor-ui-align-center.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAI1JREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAlswGErjO2KrJiqLtiIw0Zc2JpmYbCTgM2WFIUBTD2MRnbBbgI2gzAbELMDMQcQK5DsAuRkj80FMDAFiI2RbGUFKuaA2noGiEOwhsGAZSaKDQAIMAB/BzgOq8akNwAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-align-justify .ui-icon, .raptor-ui-align-justify.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJFJREFUeNpi/P//PwMlgImBQsACN4mJqRFIaQExIxQzYWEzQfHlf//+lYL0McK8ADSAJJuBBqC6AAjWYrEN2VZkNgg7Ut0FGwnYiI6tqe6CbUTYCsPMQGxCdRfsJsJmNqCF7ECaA4gVSHYBcrKHsZFdMBGIjbDYygpUzAG1FWQ7KxAfA2I/FBcMWGai2ACAAAMAvPA4C7ttvJ4AAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Bold text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-bold .ui-icon, .raptor-ui-text-bold.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKRJREFUeNpi/P//PwMlgImBQjDwBrCgmMbEpA2kGnGofQ3E9UD86t+/fzhdcBWIpwExMxQ3AHEIEK8BYgkgdsLrAih4A8SsaBYwQcWYiDGAEcmAbiwuJBiIIAPYoLgfiMuBeBmUXwHEXIQMYEIy4BUQXwDiy1C+HBBrEPKCDBCzwwwDpVRGRkZksU8ozkVOykCFVkBqOZ5oB3lpAoqe0bzAABBgANfuIyxmXKp/AAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Italic text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-italic .ui-icon, .raptor-ui-text-italic.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAH1JREFUeNpi/P//PwMlgImBQjDwBrBgmMgEN1MbiBvRpOv//ft3FUUEFIjImJGRERnrAPF6IO6BiaGrZyLCi6xAvJDcMLAA4j9AfJlcA/yBeCe5sWAExAJAfIKkWIAFJBAUATE7kM+M143ooQoEVkD8EA1b4Yy10bzAABBgAC7mS5rTXrDAAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * strike text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-strike .ui-icon, .raptor-ui-text-strike.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAL5JREFUeNpi/P//PwMlgImBQkCxASwopjHBzbMB4nQg5oTyrwKxNhAXAfGjf//+EXRBFhC/BOI0KAapYwZpxusCJPASquEdlD8FiHWwKWREjgUkL4gDcQ0QfwfiXqiBcIDsBXQD9hATcEADXOAckAEwzMjIiI4lgHgiEM8GYkmYOLIeXAZ4I2sA4vlQjGEArkBsAeJzQAUVYH8yMnIAKTmC6QAaHhpALALEPCBDoOJfgFQ5wVgYmnmBYgMAAgwAEGZWNyZpBykAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Block quote plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-block-quote .ui-icon, .raptor-ui-text-block-quote.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGVJREFUeNpi/P//PwMlgImBQjAcDWBhYZEA4r1AHA/EKHxiXQBS+BKIF+LgEzTAG4h3I0UvOh+/AUCFbECcDmROA2lC5mMzgAWLGDuUtsTBJ+iFeUDMC6Wx8VEA42hSptwAgAADAO3wKLgntfGkAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Font size plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-size-increase .ui-icon, .raptor-ui-text-size-increase.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAOhJREFUeNpi/P//PwMlgImBQkCxASxgU5gwzJkOpTORBZ2ilzO8+MjFwMIixnBhnTlOF8gD8U8gFoey4UBSyZooLzgD8Umo65xhgsYu5USHgS0QHwfiE1A2TtuxGaAIxL+B+AEQnwFiaagYg6Qi2AAHIP4PpbEa4AHEz4HYAIi/QL3hgSS/H4gfQmlELCAHNBBLQGlksenP7x9l4Bc3YMTnBRWogbZIuBOIZUFyW2b5EQwDVyA+giYPcionSA6U5Jc0yTK8vrUcVQU0L1gB8RMotkKSXoMkXgQT5BM3A+sDYcahn5kAAgwArro7Z1GYijsAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-size-decrease .ui-icon, .raptor-ui-text-size-decrease.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKxJREFUeNpi/P//PwMlgImBQjAMDGBBMY0Jbp4JEFcAcQcQnwEJpLa/Zfj27SvD+fPnGVhYxBgurDPH6wI9IP4DpRmMXcpJ9oIZELcBcRiaOCjOH0BpnAYoAbE6EE8EYnYgtjq7pxMm5wjE8lAapwFOQLwFiIuB+AQ0PBi2zvYHUQeAmBFKYxoATJWWQOwLxJJAfA6I5YE4FyT+9O5hBiSXwAHjaFKm3ACAAAMA85o8WKYZErQAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Underline text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-underline .ui-icon, .raptor-ui-text-underline.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKZJREFUeNpi/P//PwMlgImBQkCxASwopjExhQGpMCSheijdiCz279+/q3AeKAxgmJGREYSdgHgdlIaJ6SCLIevB5oXXUJe9RhK7gkUMZxgwAjEzlEYG2MRwGsCKRTErKQawYFHMQqwBn6G2qSCJGULFPmPYhpwSgdEIY6YCcTKa2rlAPBvEAEYjdgNAUYRMowOYWmQ9LFjUPSGQP2RwemFoZiaAAAMAlEI7bVBRJkoAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Sub script text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-sub .ui-icon, .raptor-ui-text-sub.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKZJREFUeNpi/P//PwMlgImBQjDwBrDATWJCMWs6lM7Ep/nfv39YXSAPxL+AWALKJtkLLkB8EohZoWySDbAH4uNQQ+xJNUAJiH8DMT8QPwZiWagYDEwA4v1QGgJACQmEGRkZQTgXiI+i4VyoHAy7AfEaEBucCNEM2AzEKkiKu6BiYMuAdAYQLwZiKQwDgGAVED+E0iBgBeUjiy1HErMCWzyaFxgAAgwA5Gw9vTeiCqoAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Super script text style plugin.\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-text-super .ui-icon, .raptor-ui-text-super.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNpi/P//PwMlgImBQjDwBrCgmMaEYt50KJ0JpRuBWBuIrwJx/b9///C6QB6IfwGxBJQNAvVAPAkqRtALLkB8EohZoWwQiAbiICCuI8YAeyA+DjXEHiqmD8SaQLwIysYMAyhQAuLfQMwPxI+B2AkqVkZsLHgDsQYQTwXiVCBmg4phB6CUCMOMjIwgvBmIVaBsEO6CijEgY5geFAOAYBUQP4TSIGAF5SOLoVjMOJoXGAACDACTRz3jjn6PnwAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Basic text style plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 9, tool-tip/tool-tip.scss */\n\
\n\
.raptor-layout [data-title]:after {\n\
\n\
  opacity: 0;\n\
\n\
  content: attr(data-title);\n\
\n\
  display: block;\n\
\n\
  position: absolute;\n\
\n\
  top: 100%;\n\
\n\
  font-size: 12px;\n\
\n\
  font-weight: normal;\n\
\n\
  color: white;\n\
\n\
  padding: 11px 16px 7px;\n\
\n\
  white-space: nowrap;\n\
\n\
  text-shadow: none;\n\
\n\
  overflow: visible;\n\
\n\
  -webkit-pointer-events: none;\n\
\n\
  -moz-pointer-events: none;\n\
\n\
  pointer-events: none;\n\
\n\
  -webkit-transition: opacity 0.23s;\n\
\n\
  -webkit-transition-delay: 0s;\n\
\n\
  -moz-transition: opacity 0.23s 0s;\n\
\n\
  -o-transition: opacity 0.23s 0s;\n\
\n\
  transition: opacity 0.23s 0s;\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(5px, rgba(40, 40, 40, 0)), color-stop(6px, #282828), color-stop(100%, #282828)), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 10px 0;\n\
\n\
  background: -webkit-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 10px 0;\n\
\n\
  background: -moz-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 10px 0;\n\
\n\
  background: -o-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 10px 0;\n\
\n\
  background: linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 10px 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 30, tool-tip/tool-tip.scss */\n\
\n\
.raptor-layout [data-title]:hover:after {\n\
\n\
  opacity: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 34, tool-tip/tool-tip.scss */\n\
\n\
.raptor-layout .raptor-select-element {\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 38, tool-tip/tool-tip.scss */\n\
\n\
.raptor-layout .raptor-select-element:after {\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(5px, rgba(40, 40, 40, 0)), color-stop(6px, #282828), color-stop(100%, #282828)), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 3px 0;\n\
\n\
  background: -webkit-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 3px 0;\n\
\n\
  background: -moz-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 3px 0;\n\
\n\
  background: -o-linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 3px 0;\n\
\n\
  background: linear-gradient(rgba(40, 40, 40, 0) 5px, #282828 6px, #282828), url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAgMAAACKgJcSAAAADFBMVEUAAAAoKCgoKCgoKCj7f2xyAAAAA3RSTlMATLP00ibhAAAAJklEQVR4XgXAMRUAEBQF0GtSwK6KYrKpIIz5P4eBTcvSc808J/UBPj4IdoCAGiAAAAAASUVORK5CYII=\) no-repeat 3px 0;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Unsaved edit warning plugin\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 11, unsaved-edit-warning/unsaved-edit-warning.scss */\n\
\n\
.raptor-plugin-unsaved-edit-warning {\n\
\n\
  position: fixed;\n\
\n\
  bottom: 0;\n\
\n\
  right: 0;\n\
\n\
  height: 30px;\n\
\n\
  line-height: 30px;\n\
\n\
  border: 1px solid #D4D4D4;\n\
\n\
  padding-right: 7px;\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #fffff2), color-stop(100%, #edecbd));\n\
\n\
  background: -webkit-linear-gradient(top, #fffff2, #edecbd);\n\
\n\
  background: -moz-linear-gradient(top, #fffff2, #edecbd);\n\
\n\
  background: -o-linear-gradient(top, #fffff2, #edecbd);\n\
\n\
  background: linear-gradient(top, #fffff2, #edecbd);\n\
\n\
  -webkit-transition: opacity 0.5s;\n\
\n\
  -moz-transition: opacity 0.5s;\n\
\n\
  -o-transition: opacity 0.5s;\n\
\n\
  transition: opacity 0.5s;\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0);\n\
\n\
  opacity: 0;\n\
\n\
}\n\
\n\
/* line 23, unsaved-edit-warning/unsaved-edit-warning.scss */\n\
\n\
.raptor-plugin-unsaved-edit-warning .ui-icon {\n\
\n\
  display: inline-block;\n\
\n\
  float: left;\n\
\n\
  margin: 8px 5px 0 5px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 30, unsaved-edit-warning/unsaved-edit-warning.scss */\n\
\n\
.raptor-plugin-unsaved-edit-warning-visible {\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
\n\
  opacity: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 34, unsaved-edit-warning/unsaved-edit-warning.scss */\n\
\n\
.raptor-plugin-unsaved-edit-warning-dirty {\n\
\n\
  outline: 1px dotted #aaa;\n\
\n\
  background-image: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAABlBMVEUAAACfn5/FQV4CAAAAAnRSTlMAG/z2BNQAAABPSURBVHhexc2xEYAgEAXRdQwILYFSKA1LsxRKIDRwOG8LMDb9++aO8tAvjps4qXMLaGNf5JglxyyEhWVBXpAfyCvyhrwjD74OySfy8dffFyMcWadc9txXAAAAAElFTkSuQmCC\) !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * View source plugin\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-view-source .ui-icon, .raptor-ui-view-source.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKtJREFUeNpi/P//PwMlgImBQkCxAQwgLzAyMqLjMCCehsSfBhVDUQf2PhYDIoB4JhCLIYmJQcUiCBkQBcRzgFgci6vEoXJRuAyIAeIFODQjG7IAqhbFAAMg3gOlGQhguFp0FyQC8UoglgTx0QFUjSRUTSKuMEgG4nUghVgMkITKJROKhXQg3gbUI42kXxokBpUjGI0gDYVAfBzJABC7EFs6YBz6eYFiAwACDAADJlDtLE22CAAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 13, view-source/view-source.scss */\n\
\n\
.raptor-ui-view-source-dialog .ui-dialog-content {\n\
\n\
  overflow: visible;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 18, view-source/view-source.scss */\n\
\n\
.raptor-ui-view-source-dialog textarea,\n\
\n\
.raptor-ui-view-source-inner-wrapper {\n\
\n\
  width: 100%;\n\
\n\
  height: 100%;\n\
\n\
  min-height: 200px;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Horizontal rule plugin\n\
\n\
 *\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-lorem-ipsum .ui-icon, .raptor-ui-lorem-ipsum.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAPBJREFUeNpi/P//PwNFgJGRcQ0Qg2gGkGHEYpgeJqAZzJQ4gAWIWaHsaCYmpkggvRyILwFxOxAvAzkSiEHiVUDcBlV7GYh1wWqBztgJdQ4+OhaKMeRALmCDmoqPXgxlJ6HLMUE5RkC8BIiPQmlkRTBxLySxKzA1jCCnUBqNe2FRQg5mBhKgEH1BgQMYjwBpGyA+AhWbD8TnodEmgSSHrOYCEBuA1QINOA51DjZaEo8cmGaCJiYGLHQwEG/CIQenWYDpmhvIMAdiEH0NiKdCJfcA8VMgNgXiBVA5GLgKpbmRw+MROYHIjJYvjpFqAECAAQDLL1QeEMDiXQAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/**\n\
\n\
 * Revision history plugin.\n\
\n\
 *\n\
\n\
 * @author Michael Robinson <michael@panmedia.co.nz>\n\
\n\
 * @author David Neilsen <david@panmedia.co.nz>\n\
\n\
 */\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-revisions .ui-icon, .raptor-ui-revisions.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfRJREFUeNqMU89LAlEQnn27WiFUl0ASCbp0Cgm6dulWEHXoIF26Vv9Bh4Io6B5C5yDp1K1TUGQQCAqK1wLFyLIfaz9Eaddd++bxVhaxaGAc39uZ7/tmmKcRbHJ+niamp0nTNGq32xwXcD1Kve3CcZw7p9WSucby9nankI3/IyFyvLNzaCPJdl36dhxy8D2Xy9HR+fk6p8FvOd/oQpfM+Dpzmc1SCwAuCm0ARMNhqtfrdLq7e7i0ubmh8m81TwEbmNd+Y27ifF8sUn8gIHMPkskthD3jv8wrc3N0gvNYJEJR+Fkm8yFbcIEM+7Xn8uMjVapVSiSTkqlUKtFqPE4t2xYSgKfJQ3FRJJm5GLFpWT2Zr9Np6hOCbAUguAguBOags+s69RsGDQSDZJqmZH6DitTNDekoJCgMMIBlCTgZkCKBGECoBGIQXC5iP1jJQCjUYWaFnOsp6ABoSgF1gbD5mR0PwLJ0CWB7CuSPKu4CET5mXjgGfDfN4HM+T7IP7sebASf7I8/Ez7yXSFyNTE3tv5bLX03THO8o8NZY9/T4lPiZrUYj+1UoJFR3TfH+8CD7kUOEaz2U+JlrT08VFHJnHGvGXSo1PDY7G1STJPWiSAOjyyD8yHBWzLxNNWb2Hg+v8hD6+RyMxfbpD3MbjRdVWPHf/wgwAAuqSbfOGi3pAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 16, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-apply-button,\n\
\n\
.raptor-ui-revisions-preview-button {\n\
\n\
  margin-right: 10px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-revisions-preview-button .ui-icon, .raptor-ui-revisions-preview-button.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAltJREFUeNqMUktoE1EUPW++SfNp1RowFFwoBRFEigtdBRUtLlzo3v9CkCoIQt2IguDKnbEKQpEq4gdKQRQUuigiuDNYCpaqdAo2NJNOM0kmv2ZmvG+SaSZQxQeHefPuvefdc95lqdvTaK+ThCT+vSjZ/QHXhTbzDIszE5DowA8OjF9PjVXrTdiOA9t24TgUc1vxBS2Hx9OLV2jL+O/O1BlwCF5CC2J9vQmzUkOhXINRrCBnWMjmy1jWSyiVK3gxenSM8oaJYNC/tYuAMQZBACRJgCyLUBQBoiiAn+tGAU8nP+H4oPqAWfotAjiCEkTeXIvE9Uj81WgA+/bspjtcJLfH8HG++tWPSXCdjT3VUjEj7diUxLbbua4jBQjcDgG14MvYjGR2PovMdw1lq6Ja5JXAPA8ctCG3OvBldMh8T4pk5MVTB/FTW46v6EZKzxvdEoIeOA5DrdbAWtGCvlqGUbDozEFWNzH3fOTG/rNphVLFIIHMJQQ96I2H0N8Xwd5dO6BKEiSxIyczMXLtwIW00kXQ6qBjZJHPw5qFlbyJ/GoJVrWO08eGkEz04dCl9LgsYCpoosxHjEvgT8tJYtEQohEVA8mt3hO+efvFKz5y+eFrVWSTddv9IJhLsxsm8utZ2we/E99I/u2Nqbj3aAqJ/i3VeCzyjpkahMzLOzCXvoE56xG/g7+RDB8ewtXzJyAKTLCNX9De3wd3JZx5dTeBZm2bRFlhSUZYVtAjy+hRFEQI0ZCCWEhFPKxClWmGKNeroVo+UWFCorA0lzt388ln/Mcq/F7I8RpC848AAwBUZQYbBk0VIwAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-revisions-apply-button .ui-icon, .raptor-ui-revisions-apply-button.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqZJREFUeNp0k01IFVEUx/9z753XpCBqQWjfi1pE6quoiBA/yKWrei3a1KawTdGuRSCYYJt2hoGLEnsu0jZRmotQqJWRXyUiDWJBUanzevk+5vt27vQePMwOHObMnXN/55z/vaMlOjvbAdTiX3sd+L7p+z6qy2+BMdbMOZ8IgkALwxBFF5S0e7Crq8+jRCcI4JJPz8xgYHz8OkE08k+F5AmCfaZ3n3xOSnmJnkuMFpmkTQSC9Dx4to1MJoNn3d199K2Nkg5v2COguCWfz+2np3Acp8O28/ccx4YCaEzTwMl1IVAWi8GyLPQmk2irq3uwOD9/8ePcGHasJydV+1Wrg/j1e+mdbdv95BCe57EIwBioT4AgifZ25FwXumHg+dRU+qg1jYq1J6gmVzaJWdTuvDxqxA5A+K7LFYApgLICpIzClbm3OGgtNFY4KXezwF9XH5uRiK7rsuII2ASx0+vo6b6fsF0nEZJOktZXTBPDgy86CiCTeY7DlNS8AFGdqHEiYCgRSCDvesiTwFkaSwm8MDz8kKqfo22HmFsywmaIDAPQ2VMznNZ4FCuBk713cacl3lf/ZfKK2EinY6oXVhhBdcOkREhxGAEEAUTUL500TjU1gU4D5XRa78cGVsWP5WWrMh7v2eIm4kxF/vTTkZetqnLRFCQqSAV8P+AiY5qP6L1yK8CuxtqQNrcWOyiFaAT1g0CI4xemc7TWnF2fHc2uzaDmyDV8X+xHvTYEnSFXOkKpcdLEow6Yrhsgv1pVc/bkvoabSiy5t/5Gc0BHRgkiEjQS8i+oGCuw+k62HZqm3SYfInAD57r6YSZefbCqzh+rNDiPwdgGKGAY+JGAIc2gbkwm5xhRb7R5SdPYCVWNMV2mvr1pUbqs/Mxm2hr29OI/lrZl6o8AAwDbC1i/F0MeZgAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, mixins.scss */\n\
\n\
.raptor-ui-revisions-diff-button .ui-icon, .raptor-ui-revisions-diff-button.ui-state-hover .ui-icon {\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgpJREFUeNpiTGl7c4CRkdGeAQv4////wV+/fjosbpQBcTcBMRMQM0Kxl5Z1LgNjXMPT/yn+wtj0M2w7+pnh6eufB3/+/Olw7egkFDkt6zyGf//+MrB8+/YVyBVmmDlrFshKBjD8z8CQmZHB4GXNy7Bu3w/7Jy///tewzEYxAKQZ5EJGj6xz/6tStRjIAW2zrzGwfPnyBcyZPmMG1AVgzzNkZWWhKJ40eRLD/38Q+f///zEUFhQygPRCvQBxMj6Ql5uHIQbSy/L9+w8wZ9q0aRD/Q23JzckBi/fOPclw6/47rIYCY+8gy69ff8AcdCeDQOfMYww37709+OvjdYdv766iyHEJaTNwi+gyMCq5rDkA5NvjcPlBRsb/Dvf2hIHYh6HxD0sLlhpeW8EGMPz4cI3hx3tUGzgEtRk4BLQY2NkFwFH29s4SFHlhlRgGJiZmBhY+PhmG+3tDQWK7kUwH0Q66/kdAmh0YGH7tF1WLxxIGTAcZTcIugjnPr81AkZTUygBr/vv31/68OBUGVQUeDANymy4wsABNAecFaZ1sDAUgJ3o5SII1t7W3M/z7+5fhz98/DH/+/GVoaW4Geo+HgVFaJwvkFKwhKCBh6SAoZb0/JVSYQVGaFUO+esILsH/5gZgT6Io1yGEATOeBYEMkrRwMvdYvxWbBh+fHDsENgGomFvwD4u+gxAgQYABaINAvYKeykgAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 33, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-loading-revisions {\n\
\n\
  text-align: center;\n\
\n\
  padding: 20px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 40, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-table thead th {\n\
\n\
  display: table-cell;\n\
\n\
}\n\
\n\
/* line 45, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-table tbody tr.ui-state-hover {\n\
\n\
  cursor: pointer;\n\
\n\
}\n\
\n\
/* line 48, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-table tbody td {\n\
\n\
  vertical-align: middle;\n\
\n\
}\n\
\n\
/* line 50, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-table tbody td.raptor-ui-revisions-controls {\n\
\n\
  white-space: pre;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 57, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-diff-button-diff {\n\
\n\
  font-family: monospace;\n\
\n\
}\n\
\n\
/* line 59, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-diff-button-diff del {\n\
\n\
  background-color: #FFC8C8;\n\
\n\
}\n\
\n\
/* line 63, revisions/revisions.scss */\n\
\n\
.raptor-ui-revisions-diff-button-diff ins {\n\
\n\
  background-color: #BEF0BE;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 9, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-item,\n\
\n\
.raptor-section-guide .raptor-section-layout-pane,\n\
\n\
.raptor-section-guide .raptor-section-layout,\n\
\n\
.raptor-section-guide .raptor-section {\n\
\n\
  position: relative !important;\n\
\n\
  margin-top: 20px !important;\n\
\n\
  margin-bottom: 5px !important;\n\
\n\
  padding-top: 5px !important;\n\
\n\
  padding-bottom: 5px !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 20, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-item:before,\n\
\n\
.raptor-section-guide .raptor-section-layout-pane:before,\n\
\n\
.raptor-section-guide .raptor-section-layout:before,\n\
\n\
.raptor-section-guide .raptor-section:before {\n\
\n\
  font-size: 11px;\n\
\n\
  font-family: "Courer New", monospace;\n\
\n\
  color: white;\n\
\n\
  padding: 0 2px;\n\
\n\
  position: absolute;\n\
\n\
  height: 15px;\n\
\n\
  top: -17px;\n\
\n\
  left: 0;\n\
\n\
  text-overflow: ellipsis;\n\
\n\
  overflow: hidden;\n\
\n\
  white-space: nowrap;\n\
\n\
  max-width: calc(100% - 3px);\n\
\n\
  line-height: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 36, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-item {\n\
\n\
  outline: 1px solid #156108 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 40, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-item:before {\n\
\n\
  content: attr(data-title);\n\
\n\
  background-color: #156108;\n\
\n\
  outline: 1px solid #156108 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 46, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-layout-pane {\n\
\n\
  outline: 1px solid #1962ff !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 50, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-layout-pane:before {\n\
\n\
  content: attr(data-title);\n\
\n\
  background-color: #1962ff;\n\
\n\
  outline: 1px solid #1962ff !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 56, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-layout {\n\
\n\
  outline: 1px solid #002f94 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 60, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-layout:before {\n\
\n\
  content: attr(data-title);\n\
\n\
  background-color: #002f94;\n\
\n\
  outline: 1px solid #002f94 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 66, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section {\n\
\n\
  outline: 1px solid #9f0d00 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 70, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section:before {\n\
\n\
  content: attr(data-title);\n\
\n\
  background-color: #9f0d00;\n\
\n\
  outline: 1px solid #9f0d00 !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 80, section/theme/guides.scss */\n\
\n\
.raptor-section-guide .raptor-section-item:after,\n\
\n\
.raptor-section-guide .raptor-section-layout-pane:after,\n\
\n\
.raptor-section-guide .raptor-section-layout:after,\n\
\n\
.raptor-section-guide .raptor-section:after {\n\
\n\
  content: " ";\n\
\n\
  display: table;\n\
\n\
  clear: both;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 1, section/theme/section.scss */\n\
\n\
.raptor-ui-cancel .ui-icon, .raptor-ui-class-menu .ui-icon, .raptor-ui-clean-block .ui-icon, .raptor-ui-clear-formatting .ui-icon, .raptor-ui-click-button-to-edit .ui-icon, .raptor-ui-close .ui-icon, .raptor-ui-dock-to-screen .ui-icon, .raptor-ui-dock-to-element .ui-icon, .raptor-ui-embed .ui-icon, .raptor-ui-float-left .ui-icon, .raptor-ui-float-none .ui-icon, .raptor-ui-float-right .ui-icon, .raptor-ui-guides .ui-icon, .raptor-ui-history-undo .ui-icon, .raptor-ui-history-redo .ui-icon, .raptor-ui-hr-create .ui-icon, .raptor-ui-image-resize .ui-icon, .raptor-ui-insert-file .ui-icon, .raptor-ui-link-create .ui-icon, .raptor-ui-link-remove .ui-icon, .raptor-ui-list-unordered .ui-icon, .raptor-ui-list-ordered .ui-icon, .raptor-ui-save .ui-icon, .raptor-ui-snippet-menu .ui-icon, .raptor-ui-special-characters .ui-icon, .raptor-ui-statistics .ui-icon, .raptor-ui-table-create .ui-icon, .raptor-ui-table-insert-row .ui-icon, .raptor-ui-table-insert-column .ui-icon, .raptor-ui-table-delete-row .ui-icon, .raptor-ui-table-delete-column .ui-icon, .raptor-ui-table-merge-cells .ui-icon, .raptor-ui-table-split-cells .ui-icon, .raptor-ui-tag-menu .ui-icon, .raptor-ui-align-left .ui-icon, .raptor-ui-align-right .ui-icon, .raptor-ui-align-center .ui-icon, .raptor-ui-align-justify .ui-icon, .raptor-ui-text-bold .ui-icon, .raptor-ui-text-italic .ui-icon, .raptor-ui-text-strike .ui-icon, .raptor-ui-text-block-quote .ui-icon, .raptor-ui-text-size-increase .ui-icon, .raptor-ui-text-size-decrease .ui-icon, .raptor-ui-text-underline .ui-icon, .raptor-ui-text-sub .ui-icon, .raptor-ui-text-super .ui-icon, .raptor-ui-view-source .ui-icon, .raptor-ui-lorem-ipsum .ui-icon, .raptor-ui-revisions .ui-icon, .raptor-ui-revisions-preview-button .ui-icon, .raptor-ui-revisions-apply-button .ui-icon, .raptor-ui-revisions-diff-button .ui-icon, .raptor-section-add-item .ui-icon, .raptor-section-edit .ui-icon, .raptor-section-remove .ui-icon, .raptor-section-add-layout .ui-icon, .raptor-section-guides .ui-icon, .raptor-section-save .ui-icon, .raptor-section-clear .ui-icon {\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=85);\n\
\n\
  opacity: 0.85;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 5, section/theme/section.scss */\n\
\n\
.raptor-ui-cancel:hover .ui-icon, .raptor-ui-class-menu:hover .ui-icon, .raptor-ui-clean-block:hover .ui-icon, .raptor-ui-clear-formatting:hover .ui-icon, .raptor-ui-click-button-to-edit:hover .ui-icon, .raptor-ui-close:hover .ui-icon, .raptor-ui-dock-to-screen:hover .ui-icon, .raptor-ui-dock-to-element:hover .ui-icon, .raptor-ui-embed:hover .ui-icon, .raptor-ui-float-left:hover .ui-icon, .raptor-ui-float-none:hover .ui-icon, .raptor-ui-float-right:hover .ui-icon, .raptor-ui-guides:hover .ui-icon, .raptor-ui-history-undo:hover .ui-icon, .raptor-ui-history-redo:hover .ui-icon, .raptor-ui-hr-create:hover .ui-icon, .raptor-ui-image-resize:hover .ui-icon, .raptor-ui-insert-file:hover .ui-icon, .raptor-ui-link-create:hover .ui-icon, .raptor-ui-link-remove:hover .ui-icon, .raptor-ui-list-unordered:hover .ui-icon, .raptor-ui-list-ordered:hover .ui-icon, .raptor-ui-save:hover .ui-icon, .raptor-ui-snippet-menu:hover .ui-icon, .raptor-ui-special-characters:hover .ui-icon, .raptor-ui-statistics:hover .ui-icon, .raptor-ui-table-create:hover .ui-icon, .raptor-ui-table-insert-row:hover .ui-icon, .raptor-ui-table-insert-column:hover .ui-icon, .raptor-ui-table-delete-row:hover .ui-icon, .raptor-ui-table-delete-column:hover .ui-icon, .raptor-ui-table-merge-cells:hover .ui-icon, .raptor-ui-table-split-cells:hover .ui-icon, .raptor-ui-tag-menu:hover .ui-icon, .raptor-ui-align-left:hover .ui-icon, .raptor-ui-align-right:hover .ui-icon, .raptor-ui-align-center:hover .ui-icon, .raptor-ui-align-justify:hover .ui-icon, .raptor-ui-text-bold:hover .ui-icon, .raptor-ui-text-italic:hover .ui-icon, .raptor-ui-text-strike:hover .ui-icon, .raptor-ui-text-block-quote:hover .ui-icon, .raptor-ui-text-size-increase:hover .ui-icon, .raptor-ui-text-size-decrease:hover .ui-icon, .raptor-ui-text-underline:hover .ui-icon, .raptor-ui-text-sub:hover .ui-icon, .raptor-ui-text-super:hover .ui-icon, .raptor-ui-view-source:hover .ui-icon, .raptor-ui-lorem-ipsum:hover .ui-icon, .raptor-ui-revisions:hover .ui-icon, .raptor-ui-revisions-preview-button:hover .ui-icon, .raptor-ui-revisions-apply-button:hover .ui-icon, .raptor-ui-revisions-diff-button:hover .ui-icon, .raptor-section-add-item:hover .ui-icon, .raptor-section-edit:hover .ui-icon, .raptor-section-remove:hover .ui-icon, .raptor-section-add-layout:hover .ui-icon, .raptor-section-guides:hover .ui-icon, .raptor-section-save:hover .ui-icon, .raptor-section-clear:hover .ui-icon {\n\
\n\
  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n\
\n\
  opacity: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 23, section/theme/section.scss */\n\
\n\
.raptor-section {\n\
\n\
  min-height: 10px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 27, section/theme/section.scss */\n\
\n\
.raptor-section-ui {\n\
\n\
  position: absolute;\n\
\n\
  padding: 5px;\n\
\n\
  background: -webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, #f7f7f7), color-stop(100%, #fafafa));\n\
\n\
  background: -webkit-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: -moz-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: -o-linear-gradient(#f7f7f7, #fafafa);\n\
\n\
  background: linear-gradient(#f7f7f7, #fafafa);\n\
\n\
}\n\
\n\
\n\
\n\
/* line 33, section/theme/section.scss */\n\
\n\
.raptor-section-ui .ui-button {\n\
\n\
  margin: 0;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 37, section/theme/section.scss */\n\
\n\
.raptor-section-ui-inner {\n\
\n\
  position: relative;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 41, section/theme/section.scss */\n\
\n\
.raptor-section-menu {\n\
\n\
  position: absolute;\n\
\n\
  top: 36px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 46, section/theme/section.scss */\n\
\n\
.raptor-section-visible {\n\
\n\
  display: block;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 50, section/theme/section.scss */\n\
\n\
.raptor-section-hidden {\n\
\n\
  display: none !important;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-add-item .ui-icon, .raptor-section-add-item.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAYRJREFUeNqkU71KA0EQnt3EUxNsbRTEVrRaS4n4APoIgoXkNWx8iHSCzyDYCKJtLmBjIQiKYGGhRvF+N7vO7Nx5t0mssrDZ3ZuZb7/v24mw1sIso0k/6mQHBhsPfkRAj0LFKQQLXS8+1GCP3xlgsHIPEAmARVklWFBHe4eKGJ5dn/vgsfEZuKFRSoSB+QokjmPejGrFKeaM7BQAl4iBBBPmBOemKTiPyoIcV2MnPfAGJWS4IpEkSRiA2BHrKYaXAD3SXOnngizLwBjDAAD9sdoQZ7dZ6Ff7uweKNNON5SzPnc2Oqn+XUsLt3U2NAd6Q57mbTIDPw68hRFHE8nUO1nBxEAQlqz+A8PLqYkLf6vqaMg0Dr88v4URQOAkFADVJ3R/rzOzrBV15IMU2CPjXxNor4My4UXQLu43Q6PloDaR7nf8B6KafqmvMkuFnTE3VRO0GVokpANSeb5mHZ9uFrk9dfaT9MprYkmMAj7HPzUL4cfrEeylCT/835m612ctZ/86/AgwAeFDT7aictlMAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-add-item .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-edit .ui-icon, .raptor-section-edit.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABSlBMVEWymwFVVVWymgEKCgqtlQG2AQEDAwOvmQOokQKlfACgiQLTAQHiAQGFbwEICAgcHBwQEBDkAQF8ZwEGBgZbTwJ1YACIdwNbRwhhTA5VBQVACAhQUFDSAQFvBgbgAQEXFxcxCQlgBgaVgxW0AQHFAQEMDAxVVVWoAACkjQKpkgK8FRWbhQKhigKgAACwmgPkAQGJcwGPeQFVVVWlfACojQGAawGGcAG8cwOmfQCOeAGbdQCXcgDx5MB5YwF9aAGDBgaXgQKSfAKYggKOawG7pWLdzqBvWQF2YAB/cyyMegh7XgGlkVVnTgFnTgGslQNnYkFoTgFnTgFnTgFnTgGrlALy5sL29vbd3d3k02D/7oji0V3v3nH4aGjMzMzh0Fv864P4537r2mkAAAD/iIj043jj0l3m1WO7qjPk01/yXFzMu0Tfzljgz1rezVaqP1K6AAAAVXRSTlMAAEAAtwAAAAAAAAAAAAAAAAAAAAAAAAAAAABpPwCdgykAo0O5LySxwkSdw0UyQyvHRR8npshGAAAABmzvyke1AMVFOcD1w0cAsIXRljzAAJZJCQAA2U4xywAAALVJREFUeF41yNOaA0EUAOHTmUxo27axto1RzPW+/21y+uvUXf1gtVmcmk0uIKQaCfEUcAFIo7BIJSngAmSC4vA7Cz6vB2iqhDiSjsqg77FXK59SNOZHYD/5v0lzHAX607/HCscAf7nK5bUM8AdysaRjgD+TT04NW9j8x1etfryFZkvpj9udHYRAOA67e/s/vweHZoSuycjD2blwcXnlQLi2I9wKd/cPboQnQmH+/PL6hvBOKKwBNYghCPFyErUAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-edit .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-remove .ui-icon, .raptor-section-remove.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAtFBMVEX///+nAABhAACnAACjAACCAACgAACHAACjAAByAAB1AAByAACDAACnAACCAACHAACgAACNAACbAACXAACMAACSAABfAACYAACRAACjAACbAAChAACqAACNAACcAACHAACqAADEERGsERHQERG+NjaiERHUTEzYERG4ERGlFBSfFRX/d3f6cnK0JSWoHh7qYmLkXFyvFRXmXl7vZ2fNRUX4cHDXT0/+dnbbU1O3Li7GPT26MTG2f8oMAAAAIXRSTlMASEjMzADMzAAASMxIAMwAAMzMzEjMzEhISABIzABISEg/DPocAAAAj0lEQVR4Xo3PVw6DMBBF0RgXTO+hBYhtILX3sv99RRpvgPcxVzp/M5syb7lYepxDABDeYcQ5wg+MAMhr3JOyJKfxTABqduuvjD37O6sBwjZ+f76/7TFuQw1VnhyGYZPklYagKbKLlDIrmkBDGq1hUaqhM4UQJpwOwFdK+a4LAbCdlWNTCgGwjLlhUQqZ8uofSk8NKY1Fm8EAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-remove .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-add-layout .ui-icon, .raptor-section-add-layout.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARZJREFUeNqkUktqhEAQrdKKSDauk0Wu4cIzzAGydBNnE8jCuFIQvERm72W8RjbeIP41/RoCjuMwSedBQ1HV7/HqdXOe5wcieiAz1DKO42NRFB8m7CzLjjJNE6VpGpkIzPPMFMfxUYksyok+qJMkeVn39g7m4GIFhgulplUty6Ku62jd2wPugSvDMOiLIPwAAtveHsCVvu95fZmZqW1bWpZF19eAObhwoFfYCoRheDNY13XvLhxgt6ZpqCzL060Moih6FbXvmYBt29qBCggWrwo4joOs+MIB6t+EiLnOACpoiMjZK2x7ewCXgyB4U5a/TH6iCvFe6rqWqqpO2PkvgDvf99/Z87xntc+TiQP1Ep+MD/EffAswAIdz96wtUrFAAAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-add-layout .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-guides .ui-icon, .raptor-section-guides.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHZJREFUeNpi/P//PwNFAGQAIyMjDK9BYqNgXHqZ0MSYcFmEyxBGsClMTGS5+t+/fxg2biLGAGTXoBvATGoYkuUFGMDmhd2kGjL4vHCUUi9cIjcpnwPi2UAsBaXPQZPwOXxscD5Cy0xLSbUc3YDnJLue0uwMEGAA2O1APJOrHFQAAAAASUVORK5CYII=\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-guides .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-save .ui-icon, .raptor-section-save.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAVNJREFUeNqkU71ugzAQPowtwdAdqRLK3odg6161a+cukZonoGrElgWWDqhb16oP0AfoytStirows0QRMj/unQsohAQi5aTD5vju4/Pd2VBKwTnG6cEYe8bl6s73P09Jel8ur3H5ruv6CUiBYRgfQRAosnrCyQhLOZTLG1ImpYQSA1VVjf7dNE0gLOV0R6AXlAMSk4uiGCUQ6ITdJzDpz0SQTxAoxlqVZo+gLEuQyDxFwIQAwg4IiPV3vYbL2WyUgDBHFbxG0Um9t237sIIkSeDYYGHbur3neQMCTgqoRWEYDToh8NyLxSO4rgtpmrY14D0CUsA5h80mh/n8QQdXq7CTTN/ILMtqa9AjEDjOGrTdSnAcRwdpr1unzB5BMweiGwY8tx/H8U+WZbmUSoPJlfr3NrZLgDkXujbNXaD9DfoLAt8OFRHPfb8X+sLcW+Pc6/wnwABHMdnKf4KT4gAAAABJRU5ErkJggg==\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-save .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 12, section/theme/section.scss */\n\
\n\
.raptor-section-clear .ui-icon, .raptor-section-clear.ui-state-hover .ui-icon {\n\
\n\
  width: 16px;\n\
\n\
  height: 16px;\n\
\n\
  display: block;\n\
\n\
  background: url(\data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAipJREFUeNqMU0toE1EUvW/mZWbSTCaTT+uH2qgE7KZCwUXW7ixIFn42LgQ3Ki66M7iquikIihtFF7pQQXBlwI2b4lJwUxUkRFKjqfhJY4ckne/7OJM0OilDyYXH3Hvn3MO58+YgzjkEUSqVTtZqtX31eh08zwtaE/7JSpIkq6pKNU1z0um0reu6nUwmG5VK5WUAwrAd67ML2utHz6+s/d76M6nKyt6Mkvtp2N8cjyHLpcglDAFwmMkl0mfvPLs1nBOGia8EwZgRxu5KgAWEVQUnY6KAxyEQwiBxMKzffuIdM7fwgTBJGBupwPPEyXsvetM3HvbmEgolT1/Z+QlZVMZSEJdE+c07e+r08Xh76aL6cWPTxecWpK+mQ+1dFTDG+qwiQsL8bKy7JytajAO9fjm1mtTYumGg6YSM42FspIKeQ6ypHPpebzr64nJzXkBI7HZ59v0nU2ec050KcEjB/6aI5KX7DT2Twt7i8pe5/H7ZOnMi07Rc4vqvE2Fs5C0Qyp2lSzPGrw0rdvfaoQ/nT2VXCaI/orB45zcY5JwW8vHNBzePfO6anm17LJCOorCRK/Rrf1/TIV3C+lc28pONrDtMCo0V5+3KwaOdTgdqjIFpmtButwuEEFAUBXxDQSqVgpamBVhf0dVRgmq1KhWLRTAMAyzLAkIYtFo9cBzuE8TBd2OfwHcjlMvlf3NoaGffthcopYeDervXl43QQH3oyQVBWHNd93FQ/xVgAApZHj+O2++5AAAAAElFTkSuQmCC\) 0 0 !important;\n\
\n\
}\n\
\n\
/* line 18, section/theme/section.scss */\n\
\n\
.raptor-section-clear .ui-icon:before {\n\
\n\
  display: none;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 82, section/theme/section.scss */\n\
\n\
.raptor-section-ui .ui-button-icon-only {\n\
\n\
  height: 32px;\n\
\n\
  width: 32px;\n\
\n\
  float: left;\n\
\n\
  margin-left: -1px;\n\
\n\
  z-index: 2;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 90, section/theme/section.scss */\n\
\n\
.raptor-section-ui .ui-button-icon-only:hover {\n\
\n\
  z-index: 3;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 94, section/theme/section.scss */\n\
\n\
.raptor-section-ui .ui-button-icon-only:first-child {\n\
\n\
  margin-left: 0px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 98, section/theme/section.scss */\n\
\n\
.raptor-section-placeholder {\n\
\n\
  padding: 5px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 102, section/theme/section.scss */\n\
\n\
.raptor-section-menu {\n\
\n\
  min-width: 160px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 1, section/theme/sortable.scss */\n\
\n\
.raptor-section-sortable-placeholder {\n\
\n\
  height: 0 !important;\n\
\n\
  padding: 0;\n\
\n\
  margin: 0;\n\
\n\
  border-top: 1px dashed #ff4136;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 9, section/theme/sortable.scss */\n\
\n\
.raptor-section-sortable-placeholder:before,\n\
\n\
.raptor-section-sortable-placeholder:after {\n\
\n\
  position: relative;\n\
\n\
  font-size: 14px;\n\
\n\
  font-family: "Courer New", monospace;\n\
\n\
  font-weight: bold;\n\
\n\
  color: #ff4136;\n\
\n\
  top: -9px;\n\
\n\
  line-height: 1;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 19, section/theme/sortable.scss */\n\
\n\
.raptor-section-sortable-placeholder:before {\n\
\n\
  content: ">";\n\
\n\
  float: left;\n\
\n\
  left: -10px;\n\
\n\
}\n\
\n\
\n\
\n\
/* line 25, section/theme/sortable.scss */\n\
\n\
.raptor-section-sortable-placeholder:after {\n\
\n\
  content: "<";\n\
\n\
  float: right;\n\
\n\
  right: -10px;\n\
\n\
}\n\
\n\
}</style>');