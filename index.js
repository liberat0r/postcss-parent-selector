var postcss = require('postcss');

/**
 * Not a declaration that we want to prefix
 *
 * @param rule
 * @returns {Window | boolean}
 */
function isNonRelevantRule (rule) {
    return rule.parent && rule.parent.type === 'atrule' &&
        rule.parent.name.indexOf('keyframes') !== -1;
}

/**
 * Has ignored selector or selector .startWith
 *
 * @param selectors
 * @param ignoredSelectors
 * @param startsWith
 * @returns {boolean}
 */
function hasIgnoredSelectors (selectors, ignoredSelectors, startsWith) {
    return selectors.some(selector =>
        ignoredSelectors.find(ignored => {
            if (startsWith) return selector.startsWith(ignored);
            return ignored === selector;
        }));
}

/**
 * Is ignored rule
 *
 * @param rule
 * @param ignoredSelectors
 * @returns {*|boolean}
 */
function isIgnoredRule (rule, ignoredSelectors) {
    return ignoredSelectors && ignoredSelectors.length &&
        hasIgnoredSelectors(rule.selectors, ignoredSelectors);
}

/**
 * Is ignored rule (.startsWith)
 *
 * @param rule
 * @param ignoredStartsWithSelectors
 * @returns {*|boolean}
 */
function isIgnoredStartsWithRule (rule, ignoredStartsWithSelectors) {
    return ignoredStartsWithSelectors && ignoredStartsWithSelectors.length &&
        hasIgnoredSelectors(rule.selectors, ignoredStartsWithSelectors, true);
}

module.exports = postcss.plugin('postcss-parent-selector', function (opts) {
    opts = opts || {};

    // Work with options here
    return function (root /* , result*/) {
        root.walkRules(rule => {
            if (isNonRelevantRule(rule) ||
                isIgnoredRule(rule, opts.ignoredSelectors) ||
                isIgnoredStartsWithRule(rule, opts.ignoredStartsWithSelectors)) {
                return;
            }
            rule.selectors = rule.selectors.map(selectors => {
                return selectors.split(/,[\s]* /g).map(selector => {
                    // don't add the parent class to a rule that is
                    // exactly equal to the one defined by the user
                    if (selector === opts.selector) {
                        return selector;
                    }
                    return `${opts.selector} ${selector}`;
                });
            });
        });
    };
});
