module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Restrict PrismaClient import to a specific file",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedFile: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    debugger;
    const allowedFile = context.options[0]?.allowedFile;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "@prisma/client") {
          const filename = context.getFilename();
          if (filename !== allowedFile) {
            context.report({
              node,
              message: `PrismaClient can only be imported in ${allowedFile}`,
            });
          }
        }
      },
    };
  },
};
