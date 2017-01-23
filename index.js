'use strict';

module.exports = {
    _jsonParse: require('./lib/json-parser'),
    _jsonPathParse: require('./lib/json-path-parser'),

    /**
     * Returns line/column location of path in json
     *
     * @param {String} json
     * @param {Array.<String|Number>|String} path - path in json like '["prop1", 1, "prop2"]' or 'prop1[1].prop2'
     *
     * @returns {AstLocation}
     */
    getLocationOf: function(json, path) {
        const parsedPath = Array.isArray(path) ? path : this._jsonPathParse(path),
            beginAst = this._jsonParse(json);

        const endAst = parsedPath.reduce((currentAst, pathItem) => {
            if (!currentAst) return;

            if (typeof pathItem === 'number' && currentAst.type === 'ArrayExpression') {
                return currentAst.elements[pathItem];
            }

            if (typeof pathItem === 'string' && currentAst.type === 'ObjectExpression') {
                const itemProperty = currentAst.properties.find(property => {
                    const key = property.key;

                    return (key.type === 'Identifier' && key.name === pathItem) ||
                        (key.type === 'Literal' && key.value === pathItem);
                });

                return itemProperty && itemProperty.value;
            }
        }, beginAst);

        if (!endAst) {
            throw new Error('unexpected end of path ' + JSON.stringify(path));
        }

        return endAst.loc.start;
    }
};
