import {
  defineNestedType,
  defineDocumentType,
  makeSource,
} from "contentlayer/source-files";

const NameSlugPair = defineNestedType(() => ({
  name: "NameSlugPair",
  fields: {
    name: {
      type: "string",
      required: true,
    },
    slug: {
      type: "string",
      required: true,
    },
  },
}));

const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    summary: {
      type: "string",
      required: true,
    },
    topic: {
      type: "nested",
      of: NameSlugPair,
      required: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post],
});
