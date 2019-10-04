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
 * @param compareStartsWith
 * @returns {boolean}
 */
function hasIgnoredSelectors (selectors, ignoredSelectors, compareStartsWith) {
    return selectors.some(selector =>
        ignoredSelectors.find(ignored => {
            if (compareStartsWith) return selector.startsWith(ignored);
            return ignored === selector;
        }));
}

/**
 * Is ignored rule
 *
 * @param rule
 * @param opts
 * @returns {boolean}
 */
function isIgnoredRule (rule, opts) {
    const isIgnored = opts.ignoredSelectors && opts.ignoredSelectors.length &&
        hasIgnoredSelectors(rule.selectors, opts.ignoredSelectors);
    const isIgnoredStartsWith = opts.ignoredSelectorsStartsWith && opts.ignoredSelectorsStartsWith.length &&
        hasIgnoredSelectors(rule.selectors, opts.ignoredSelectorsStartsWith, true);
    return isIgnored || isIgnoredStartsWith;
}

module.exports = postcss.plugin('postcss-parent-selector', function (opts) {
    opts = opts || {};

    // Work with options here
    return function (root /* , result*/) {
        root.walkRules(rule => {
            if (isNonRelevantRule(rule) ||
                isIgnoredRule(rule, opts)) {
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
