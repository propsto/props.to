"use strict";

module.exports = {
  rules: {
    "restrict-import": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Restrict a specific member from a package import to a specific file",
        },
        schema: [
          {
            oneOf: [
              {
                type: "object",
                properties: {
                  allowedFile: {
                    type: "string", // The file where the import is allowed, can be a regex string starting with ^
                  },
                  checkPackage: {
                    type: "string", // The package to check
                  },
                  restrictedMembers: {
                    type: "array",
                    items: { type: "string" }, // List of restricted members
                  },
                },
                additionalProperties: false,
              },
              {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    allowedFile: {
                      type: "string",
                    },
                    checkPackage: {
                      type: "string",
                    },
                    restrictedMembers: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  additionalProperties: false,
                },
              },
            ],
          },
        ],
      },
      create(context) {
        const options = context.options;
        const configList = Array.isArray(options[0]) ? options[0] : options;
        const normalizedConfigs = configList.filter(Boolean);

        const compiledConfigs = normalizedConfigs.map(config => {
          const allowedFile = config.allowedFile || "";
          const isRegex = allowedFile.startsWith("^");
          const allowedFileRegex = isRegex ? new RegExp(allowedFile) : null;

          return {
            allowedFile,
            checkPackage: config.checkPackage,
            restrictedMembers: config.restrictedMembers || [],
            isRegex,
            allowedFileRegex,
          };
        });

        return {
          ImportDeclaration(node) {
            const filename = context.getFilename();
            const sourceValue = node.source.value;

            // Check if the imported package is the one we want to restrict
            compiledConfigs.forEach(config => {
              if (sourceValue !== config.checkPackage) {
                return;
              }

              const fileMatches = config.isRegex
                ? config.allowedFileRegex.test(filename)
                : filename === config.allowedFile;

              // Check the specific members being imported
              node.specifiers.forEach(specifier => {
                if (specifier.type === "ImportSpecifier") {
                  const importedMember = specifier.imported.name;

                  // If the member is restricted, report an error
                  if (
                    config.restrictedMembers.includes(importedMember) &&
                    !fileMatches
                  ) {
                    context.report({
                      node: specifier,
                      message: `Importing the member "${importedMember}" from "${config.checkPackage}" is restricted to ${config.allowedFile}.`,
                    });
                  }
                }

                // Handle default or namespace imports
                if (
                  specifier.type === "ImportDefaultSpecifier" ||
                  specifier.type === "ImportNamespaceSpecifier"
                ) {
                  context.report({
                    node: specifier,
                    message: `Default or namespace imports from "${config.checkPackage}" are restricted to ${config.allowedFile}.`,
                  });
                }
              });
            });
          },
        };
      },
    },
  },
};
