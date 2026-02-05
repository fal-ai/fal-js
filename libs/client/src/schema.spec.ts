jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { createConfig } from "./config";
import { dispatchRequest } from "./request";
import { fetchEndpointSchemas, JSONSchema } from "./schema";

const mockConfig = createConfig({ credentials: "test-key" });

// Helper to create a minimal valid OpenAPI schema
function createOpenAPI(
  endpointId: string,
  inputSchema: JSONSchema | { $ref: string },
  outputSchema: JSONSchema | { $ref: string },
  componentSchemas: Record<string, JSONSchema> = {},
) {
  return {
    openapi: "3.0.4",
    paths: {
      [`/${endpointId}`]: {
        post: {
          requestBody: {
            content: {
              "application/json": { schema: inputSchema },
            },
          },
        },
      },
      [`/${endpointId}/requests/{request_id}`]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": { schema: outputSchema },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: componentSchemas,
    },
  };
}

describe("fetchEndpointSchemas", () => {
  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
  });

  describe("basic schema parsing", () => {
    it("parses simple inline schemas with basic types", async () => {
      const openapi = createOpenAPI(
        "fal-ai/simple",
        {
          type: "object",
          properties: {
            prompt: { type: "string" },
            count: { type: "integer" },
            enabled: { type: "boolean" },
          },
          required: ["prompt"],
        },
        {
          type: "object",
          properties: {
            result: { type: "string" },
          },
          required: ["result"],
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas("fal-ai/simple", mockConfig);

      expect(schemas.input).toEqual({
        type: "object",
        properties: {
          prompt: { type: "string" },
          count: { type: "integer" },
          enabled: { type: "boolean" },
        },
        required: ["prompt"],
      });
      expect(schemas.output).toEqual({
        type: "object",
        properties: {
          result: { type: "string" },
        },
        required: ["result"],
      });
    });

    it("parses schemas with enums", async () => {
      const openapi = createOpenAPI(
        "fal-ai/enum-test",
        {
          type: "object",
          properties: {
            size: { type: "string", enum: ["small", "medium", "large"] },
            quality: { type: "integer", enum: [1, 2, 3] },
          },
        },
        { type: "object", properties: { status: { type: "string" } } },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/enum-test",
        mockConfig,
      );

      expect(schemas.input.properties?.size).toEqual({
        type: "string",
        enum: ["small", "medium", "large"],
      });
      expect(schemas.input.properties?.quality).toEqual({
        type: "integer",
        enum: [1, 2, 3],
      });
    });

    it("parses schemas with arrays", async () => {
      const openapi = createOpenAPI(
        "fal-ai/array-test",
        {
          type: "object",
          properties: {
            tags: { type: "array", items: { type: "string" } },
            scores: { type: "array", items: { type: "number" } },
          },
        },
        {
          type: "object",
          properties: {
            images: {
              type: "array",
              items: {
                type: "object",
                properties: { url: { type: "string" } },
              },
            },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/array-test",
        mockConfig,
      );

      expect(schemas.input.properties?.tags).toEqual({
        type: "array",
        items: { type: "string" },
      });
      expect(schemas.output.properties?.images).toEqual({
        type: "array",
        items: {
          type: "object",
          properties: { url: { type: "string" } },
        },
      });
    });
  });

  describe("reference resolution ($ref)", () => {
    it("resolves simple $ref to component schemas", async () => {
      const openapi = createOpenAPI(
        "fal-ai/ref-test",
        { $ref: "#/components/schemas/SimpleInput" },
        { $ref: "#/components/schemas/SimpleOutput" },
        {
          SimpleInput: {
            type: "object",
            properties: { prompt: { type: "string" } },
            required: ["prompt"],
          },
          SimpleOutput: {
            type: "object",
            properties: { result: { type: "string" } },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas("fal-ai/ref-test", mockConfig);

      expect(schemas.input).toEqual({
        type: "object",
        properties: { prompt: { type: "string" } },
        required: ["prompt"],
      });
      expect(schemas.output).toEqual({
        type: "object",
        properties: { result: { type: "string" } },
      });
    });

    it("resolves nested $ref within properties", async () => {
      const openapi = createOpenAPI(
        "fal-ai/nested-ref",
        { $ref: "#/components/schemas/InputWithFile" },
        { $ref: "#/components/schemas/OutputWithFile" },
        {
          InputWithFile: {
            type: "object",
            properties: {
              file: { $ref: "#/components/schemas/File" },
            },
          },
          OutputWithFile: {
            type: "object",
            properties: {
              result: { $ref: "#/components/schemas/File" },
            },
          },
          File: {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: { type: "string" },
              file_size: { type: "integer" },
            },
            required: ["url"],
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/nested-ref",
        mockConfig,
      );

      expect(schemas.input.properties?.file).toEqual({
        type: "object",
        properties: {
          url: { type: "string" },
          content_type: { type: "string" },
          file_size: { type: "integer" },
        },
        required: ["url"],
      });
      expect(schemas.output.properties?.result).toEqual({
        type: "object",
        properties: {
          url: { type: "string" },
          content_type: { type: "string" },
          file_size: { type: "integer" },
        },
        required: ["url"],
      });
    });

    it("resolves $ref within array items", async () => {
      const openapi = createOpenAPI(
        "fal-ai/array-ref",
        {
          type: "object",
          properties: {
            images: {
              type: "array",
              items: { $ref: "#/components/schemas/ImageInput" },
            },
          },
        },
        { type: "object", properties: {} },
      );
      openapi.components.schemas = {
        ImageInput: {
          type: "object",
          properties: {
            url: { type: "string" },
            weight: { type: "number" },
          },
        },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/array-ref",
        mockConfig,
      );

      expect(schemas.input.properties?.images).toEqual({
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string" },
            weight: { type: "number" },
          },
        },
      });
    });
  });

  describe("schema composition", () => {
    it("resolves allOf with $ref", async () => {
      const openapi = createOpenAPI(
        "fal-ai/allof-test",
        { type: "object", properties: {} },
        {
          type: "object",
          properties: {
            video: {
              allOf: [{ $ref: "#/components/schemas/File" }],
            },
          },
        },
        {
          File: {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: { type: "string" },
            },
            required: ["url"],
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/allof-test",
        mockConfig,
      );

      expect(schemas.output.properties?.video).toEqual({
        allOf: [
          {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: { type: "string" },
            },
            required: ["url"],
          },
        ],
      });
    });

    it("resolves anyOf for nullable/union types", async () => {
      const openapi = createOpenAPI(
        "fal-ai/anyof-test",
        {
          type: "object",
          properties: {
            optional_url: {
              anyOf: [{ $ref: "#/components/schemas/File" }, { type: "null" }],
            },
          },
        },
        { type: "object", properties: {} },
        {
          File: {
            type: "object",
            properties: { url: { type: "string" } },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/anyof-test",
        mockConfig,
      );

      expect(schemas.input.properties?.optional_url).toEqual({
        anyOf: [
          {
            type: "object",
            properties: { url: { type: "string" } },
          },
          { type: "null" },
        ],
      });
    });
  });

  describe("complex real-world schema (Kling Video)", () => {
    const klingVideoOpenAPI = {
      openapi: "3.0.4",
      paths: {
        "/fal-ai/kling-video/v3/pro/image-to-video": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/KlingVideoV3ProImageToVideoInput",
                  },
                },
              },
            },
          },
        },
        "/fal-ai/kling-video/v3/pro/image-to-video/requests/{request_id}": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/KlingVideoV3ProImageToVideoOutput",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          KlingVideoV3ProImageToVideoInput: {
            type: "object",
            properties: {
              prompt: { type: "string", maxLength: 2500 },
              start_image_url: { type: "string" },
              duration: {
                type: "string",
                enum: [
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                  "13",
                  "14",
                  "15",
                ],
              },
              aspect_ratio: {
                type: "string",
                enum: ["16:9", "9:16", "1:1"],
                default: "16:9",
              },
              multi_prompt: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/KlingV3MultiPromptElement",
                },
              },
              elements: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/KlingV3ComboElementInput",
                },
              },
            },
            required: ["start_image_url"],
          },
          KlingVideoV3ProImageToVideoOutput: {
            type: "object",
            properties: {
              video: { allOf: [{ $ref: "#/components/schemas/File" }] },
            },
            required: ["video"],
          },
          KlingV3MultiPromptElement: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              duration: { type: "string" },
            },
            required: ["prompt"],
          },
          KlingV3ComboElementInput: {
            type: "object",
            properties: {
              video_url: { type: "string" },
              frontal_image_url: { type: "string" },
            },
          },
          File: {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: { type: "string" },
              file_size: { type: "integer" },
            },
            required: ["url"],
          },
        },
      },
    };

    it("resolves all refs in complex Kling Video schema", async () => {
      (dispatchRequest as jest.Mock).mockResolvedValue(klingVideoOpenAPI);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/kling-video/v3/pro/image-to-video",
        mockConfig,
      );

      // Verify input schema structure
      expect(schemas.input.type).toBe("object");
      expect(schemas.input.required).toEqual(["start_image_url"]);
      expect(schemas.input.properties?.prompt).toEqual({
        type: "string",
        maxLength: 2500,
      });
      expect(schemas.input.properties?.duration).toEqual({
        type: "string",
        enum: [
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
          "13",
          "14",
          "15",
        ],
      });
      expect(schemas.input.properties?.aspect_ratio).toEqual({
        type: "string",
        enum: ["16:9", "9:16", "1:1"],
        default: "16:9",
      });
    });

    it("resolves array refs (multi_prompt -> KlingV3MultiPromptElement)", async () => {
      (dispatchRequest as jest.Mock).mockResolvedValue(klingVideoOpenAPI);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/kling-video/v3/pro/image-to-video",
        mockConfig,
      );

      expect(schemas.input.properties?.multi_prompt).toEqual({
        type: "array",
        items: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            duration: { type: "string" },
          },
          required: ["prompt"],
        },
      });
    });

    it("resolves array refs (elements -> KlingV3ComboElementInput)", async () => {
      (dispatchRequest as jest.Mock).mockResolvedValue(klingVideoOpenAPI);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/kling-video/v3/pro/image-to-video",
        mockConfig,
      );

      expect(schemas.input.properties?.elements).toEqual({
        type: "array",
        items: {
          type: "object",
          properties: {
            video_url: { type: "string" },
            frontal_image_url: { type: "string" },
          },
        },
      });
    });

    it("resolves output allOf with File schema", async () => {
      (dispatchRequest as jest.Mock).mockResolvedValue(klingVideoOpenAPI);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/kling-video/v3/pro/image-to-video",
        mockConfig,
      );

      expect(schemas.output.required).toEqual(["video"]);
      expect(schemas.output.properties?.video).toEqual({
        allOf: [
          {
            type: "object",
            properties: {
              url: { type: "string" },
              content_type: { type: "string" },
              file_size: { type: "integer" },
            },
            required: ["url"],
          },
        ],
      });
    });
  });

  describe("circular reference handling", () => {
    it("handles self-referencing schemas", async () => {
      const openapi = createOpenAPI(
        "fal-ai/circular",
        { $ref: "#/components/schemas/Node" },
        { type: "object", properties: {} },
        {
          Node: {
            type: "object",
            properties: {
              value: { type: "string" },
              children: {
                type: "array",
                items: { $ref: "#/components/schemas/Node" },
              },
            },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas("fal-ai/circular", mockConfig);

      // Should resolve the first level and continue resolving nested refs
      // The implementation uses new Set(visited) for each branch, allowing
      // re-resolution of the same type in different paths until max depth
      expect(schemas.input.type).toBe("object");
      expect(schemas.input.properties?.value).toEqual({ type: "string" });
      // Children array items get resolved (since path is fresh)
      expect(schemas.input.properties?.children?.type).toBe("array");
      expect(schemas.input.properties?.children?.items?.type).toBe("object");
      // At some nesting level, circular ref placeholder will appear
      const items = schemas.input.properties?.children?.items;
      expect(items?.properties?.children?.items).toEqual({
        $ref: "#/$defs/Node",
      });
    });

    it("handles mutually referencing schemas (A refs B, B refs A)", async () => {
      const openapi = createOpenAPI(
        "fal-ai/mutual-circular",
        { $ref: "#/components/schemas/TypeA" },
        { type: "object", properties: {} },
        {
          TypeA: {
            type: "object",
            properties: {
              name: { type: "string" },
              related: { $ref: "#/components/schemas/TypeB" },
            },
          },
          TypeB: {
            type: "object",
            properties: {
              id: { type: "integer" },
              parent: { $ref: "#/components/schemas/TypeA" },
            },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/mutual-circular",
        mockConfig,
      );

      expect(schemas.input.type).toBe("object");
      expect(schemas.input.properties?.name).toEqual({ type: "string" });
      // TypeB should be resolved
      expect(schemas.input.properties?.related).toMatchObject({
        type: "object",
        properties: {
          id: { type: "integer" },
        },
      });
      // Note: fetchEndpointSchemas extracts the root $ref manually,
      // so TypeA isn't in visited when processing starts. This means
      // TypeA gets resolved again in parent, and TypeB triggers circular detection.
      const parent = schemas.input.properties?.related?.properties?.parent;
      expect(parent?.type).toBe("object");
      expect(parent?.properties?.name).toEqual({ type: "string" });
      expect(parent?.properties?.related).toEqual({ $ref: "#/$defs/TypeB" });
    });

    it("respects max depth (10) for deeply nested refs", async () => {
      // Create a deeply nested schema (more than 10 levels)
      const schemas: Record<string, JSONSchema> = {};
      for (let i = 1; i <= 15; i++) {
        schemas[`Level${i}`] = {
          type: "object",
          properties: {
            value: { type: "string" },
            ...(i < 15
              ? { next: { $ref: `#/components/schemas/Level${i + 1}` } }
              : {}),
          },
        };
      }

      const openapi = createOpenAPI(
        "fal-ai/deep-nested",
        { $ref: "#/components/schemas/Level1" },
        { type: "object", properties: {} },
        schemas,
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const result = await fetchEndpointSchemas(
        "fal-ai/deep-nested",
        mockConfig,
      );

      // Should resolve up to max depth, then stop
      expect(result.input.type).toBe("object");
      expect(result.input.properties?.value).toEqual({ type: "string" });

      // Navigate to check depth handling
      let current = result.input;
      let depth = 0;
      while (current.properties?.next && depth < 15) {
        current = current.properties.next;
        depth++;
      }
      // Should have stopped resolving at some point before reaching all 15 levels
      expect(depth).toBeLessThanOrEqual(10);
    });
  });

  describe("error cases (malformed OpenAPI)", () => {
    it("throws error when input path is missing", async () => {
      const openapi = {
        openapi: "3.0.4",
        paths: {
          "/fal-ai/test/requests/{request_id}": {
            get: {
              responses: {
                "200": {
                  content: {
                    "application/json": { schema: { type: "object" } },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/test", mockConfig),
      ).rejects.toThrow(
        "Could not find input schema for endpoint: fal-ai/test",
      );
    });

    it("throws error when output path is missing", async () => {
      const openapi = {
        openapi: "3.0.4",
        paths: {
          "/fal-ai/test": {
            post: {
              requestBody: {
                content: { "application/json": { schema: { type: "object" } } },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/test", mockConfig),
      ).rejects.toThrow(
        "Could not find output schema for endpoint: fal-ai/test",
      );
    });

    it("throws error when requestBody is missing on POST", async () => {
      const openapi = {
        openapi: "3.0.4",
        paths: {
          "/fal-ai/test": {
            post: {},
          },
          "/fal-ai/test/requests/{request_id}": {
            get: {
              responses: {
                "200": {
                  content: {
                    "application/json": { schema: { type: "object" } },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/test", mockConfig),
      ).rejects.toThrow(
        "Could not find input schema for endpoint: fal-ai/test",
      );
    });

    it("throws error when response schema is missing on GET", async () => {
      const openapi = {
        openapi: "3.0.4",
        paths: {
          "/fal-ai/test": {
            post: {
              requestBody: {
                content: { "application/json": { schema: { type: "object" } } },
              },
            },
          },
          "/fal-ai/test/requests/{request_id}": {
            get: {
              responses: {
                "200": {},
              },
            },
          },
        },
        components: { schemas: {} },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/test", mockConfig),
      ).rejects.toThrow(
        "Could not find output schema for endpoint: fal-ai/test",
      );
    });

    it("throws error when $ref target is missing in input", async () => {
      const openapi = createOpenAPI(
        "fal-ai/missing-ref",
        { $ref: "#/components/schemas/NonExistent" },
        { type: "object", properties: {} },
        {},
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/missing-ref", mockConfig),
      ).rejects.toThrow(
        "Could not resolve input schema ref: #/components/schemas/NonExistent",
      );
    });

    it("throws error when $ref target is missing in output", async () => {
      const openapi = createOpenAPI(
        "fal-ai/missing-ref-output",
        { type: "object", properties: {} },
        { $ref: "#/components/schemas/NonExistent" },
        {},
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      await expect(
        fetchEndpointSchemas("fal-ai/missing-ref-output", mockConfig),
      ).rejects.toThrow(
        "Could not resolve output schema ref: #/components/schemas/NonExistent",
      );
    });
  });

  describe("edge cases", () => {
    it("handles inline schemas (no $ref)", async () => {
      const openapi = createOpenAPI(
        "fal-ai/inline",
        {
          type: "object",
          properties: {
            nested: {
              type: "object",
              properties: {
                deep: { type: "string" },
              },
            },
          },
        },
        {
          type: "object",
          properties: {
            data: { type: "array", items: { type: "integer" } },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas("fal-ai/inline", mockConfig);

      expect(schemas.input.properties?.nested).toEqual({
        type: "object",
        properties: {
          deep: { type: "string" },
        },
      });
      expect(schemas.output.properties?.data).toEqual({
        type: "array",
        items: { type: "integer" },
      });
    });

    it("handles empty components.schemas", async () => {
      const openapi = createOpenAPI(
        "fal-ai/empty-components",
        { type: "object", properties: { x: { type: "string" } } },
        { type: "object", properties: { y: { type: "number" } } },
        {},
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/empty-components",
        mockConfig,
      );

      expect(schemas.input.properties?.x).toEqual({ type: "string" });
      expect(schemas.output.properties?.y).toEqual({ type: "number" });
    });

    it("handles schema with only optional properties (no required array)", async () => {
      const openapi = createOpenAPI(
        "fal-ai/optional-only",
        {
          type: "object",
          properties: {
            optional_field: { type: "string" },
            another_optional: { type: "integer" },
          },
        },
        { type: "object", properties: {} },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/optional-only",
        mockConfig,
      );

      expect(schemas.input.required).toBeUndefined();
      expect(schemas.input.properties?.optional_field).toEqual({
        type: "string",
      });
    });

    it("handles additionalProperties with $ref", async () => {
      const openapi = createOpenAPI(
        "fal-ai/additional-props",
        {
          type: "object",
          additionalProperties: { $ref: "#/components/schemas/MetaValue" },
        },
        { type: "object", properties: {} },
        {
          MetaValue: {
            type: "object",
            properties: { value: { type: "string" } },
          },
        },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/additional-props",
        mockConfig,
      );

      expect(schemas.input.additionalProperties).toEqual({
        type: "object",
        properties: { value: { type: "string" } },
      });
    });

    it("handles missing components object", async () => {
      const openapi = {
        openapi: "3.0.4",
        paths: {
          "/fal-ai/no-components": {
            post: {
              requestBody: {
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { a: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          "/fal-ai/no-components/requests/{request_id}": {
            get: {
              responses: {
                "200": {
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: { b: { type: "number" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/no-components",
        mockConfig,
      );

      expect(schemas.input.properties?.a).toEqual({ type: "string" });
      expect(schemas.output.properties?.b).toEqual({ type: "number" });
    });

    it("preserves validation constraints (min, max, minLength, maxLength, pattern)", async () => {
      const openapi = createOpenAPI(
        "fal-ai/validation",
        {
          type: "object",
          properties: {
            count: { type: "integer", minimum: 1, maximum: 100 },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              pattern: "^[a-z]+$",
            },
          },
        },
        { type: "object", properties: {} },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas(
        "fal-ai/validation",
        mockConfig,
      );

      expect(schemas.input.properties?.count).toEqual({
        type: "integer",
        minimum: 1,
        maximum: 100,
      });
      expect(schemas.input.properties?.name).toEqual({
        type: "string",
        minLength: 1,
        maxLength: 50,
        pattern: "^[a-z]+$",
      });
    });

    it("preserves default values", async () => {
      const openapi = createOpenAPI(
        "fal-ai/defaults",
        {
          type: "object",
          properties: {
            quality: { type: "integer", default: 80 },
            format: {
              type: "string",
              default: "png",
              enum: ["png", "jpg", "webp"],
            },
          },
        },
        { type: "object", properties: {} },
      );

      (dispatchRequest as jest.Mock).mockResolvedValue(openapi);

      const schemas = await fetchEndpointSchemas("fal-ai/defaults", mockConfig);

      expect(schemas.input.properties?.quality).toEqual({
        type: "integer",
        default: 80,
      });
      expect(schemas.input.properties?.format).toEqual({
        type: "string",
        default: "png",
        enum: ["png", "jpg", "webp"],
      });
    });
  });
});
