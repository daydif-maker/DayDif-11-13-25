/**
 * ESLint rule to prevent hard-coded style values
 * Enforces use of design tokens instead of magic numbers/colors
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hard-coded style values, enforce token usage',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const HARDCODED_COLOR_PATTERNS = [
      /#[0-9a-fA-F]{3,6}/, // Hex colors
      /rgb\(/i,
      /rgba\(/i,
      /hsl\(/i,
      /hsla\(/i,
    ];

    const HARDCODED_SIZE_PATTERNS = [
      /^\d+px$/,
      /^\d+pt$/,
      /^\d+rem$/,
      /^\d+em$/,
    ];

    function checkValue(value, node) {
      if (typeof value === 'string') {
        // Check for hard-coded colors
        if (HARDCODED_COLOR_PATTERNS.some(pattern => pattern.test(value))) {
          context.report({
            node,
            message:
              'Hard-coded color values are not allowed. Use design tokens from theme instead.',
          });
        }
        // Check for hard-coded sizes (but allow 'auto', '100%', etc.)
        if (
          HARDCODED_SIZE_PATTERNS.some(pattern => pattern.test(value)) &&
          !value.includes('%') &&
          !['auto', 'none', 'inherit'].includes(value)
        ) {
          context.report({
            node,
            message:
              'Hard-coded size values are not allowed. Use spacing/typography tokens from theme instead.',
          });
        }
      } else if (typeof value === 'number') {
        // Numbers in style objects should use tokens
        context.report({
          node,
          message:
            'Hard-coded numeric values are not allowed. Use design tokens from theme instead.',
        });
      }
    }

    function checkStyleObject(node) {
      if (node.type === 'ObjectExpression') {
        node.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key) {
            const keyName = prop.key.name || prop.key.value;
            if (prop.value) {
              checkValue(prop.value.value || prop.value, prop.value);
            }
          }
        });
      }
    }

    return {
      Property(node) {
        // Check for style properties
        if (
          node.key &&
          (node.key.name === 'style' || node.key.name === 'styles') &&
          node.value
        ) {
          if (node.value.type === 'ObjectExpression') {
            checkStyleObject(node.value);
          }
        }
      },
      JSXAttribute(node) {
        if (node.name.name === 'style' && node.value) {
          if (node.value.expression && node.value.expression.type === 'ObjectExpression') {
            checkStyleObject(node.value.expression);
          }
        }
      },
    };
  },
};

