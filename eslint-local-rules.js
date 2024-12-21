"use strict";

module.exports = {
  "restrict-import": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Restrict a specific member from a package import to a specific file",
      },
      schema: [
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
      ],
    },
    create(context) {
      const checkPackage = context.options[0]?.checkPackage;
      const allowedFile = context.options[0]?.allowedFile;
      const restrictedMembers = context.options[0]?.restrictedMembers || [];

      // Determine if allowedFile is a regex pattern
      const isRegex = allowedFile.startsWith("^");
      const allowedFileRegex = isRegex ? new RegExp(allowedFile) : null;

      return {
        ImportDeclaration(node) {
          const filename = context.getFilename();
          const sourceValue = node.source.value;

          // Check if the imported package is the one we want to restrict
          if (sourceValue === checkPackage) {
            const fileMatches = isRegex
              ? allowedFileRegex.test(filename) // If allowedFile is a regex, test it
              : filename === allowedFile; // Otherwise, do a string comparison

            // Check the specific members being imported
            node.specifiers.forEach(specifier => {
              if (specifier.type === "ImportSpecifier") {
                const importedMember = specifier.imported.name;

                // If the member is restricted, report an error
                if (
                  restrictedMembers.includes(importedMember) &&
                  !fileMatches
                ) {
                  context.report({
                    node: specifier,
                    message: `Importing the member "${importedMember}" from "${checkPackage}" is restricted to ${allowedFile}.`,
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
                  message: `Default or namespace imports from "${checkPackage}" are restricted to ${allowedFile}.`,
                });
              }
            });
          }
        },
      };
    },
  },
};
