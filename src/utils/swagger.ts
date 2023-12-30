import { APP } from "config";
import { Express, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import log from "winston";
import { version } from "../../package.json";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Kima API Docs",
      version,
    },
    definitions: {
      createdAt: {
        type: "string",
        format: "date-time",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
      },
      numberId: {
        type: "number",
        default: 1,
      },
      userId: {
        type: "string",
        default: "ed86eedf-0964-4b70-a297-557289f792b5",
      },
    },
    components: {
      schemas: {
        PageInfo: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              default: 1,
            },
            totalPages: {
              type: "integer",
              default: 1,
            },
            itemsPerPage: {
              type: "integer",
              default: 2,
            },
            totalItems: {
              type: "integer",
              default: 1,
            },
          },
        },
      },
      parameters: {
        OffsetPage: {
          in: "query",
          name: "page",
          schema: {
            type: "integer",
            default: 1,
          },
          description: "Numeric value of the page you want to retrieve.",
        },
        OffsetPerPage: {
          in: "query",
          name: "perPage",
          schema: {
            type: "integer",
            default: 2,
          },
          description:
            "Numeric value of the number of items you want to retrieve per page.",
        },
      },
      responses: {
        "400": {
          description: "Validation Error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "${validationMessage}",
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "Unauthorized Access",
                  },
                },
              },
            },
          },
        },
        "403": {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "Forbidden Access",
                  },
                },
              },
            },
          },
        },
        "404": {
          description: "Not Found",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "Not Found",
                  },
                },
              },
            },
          },
        },
        "409": {
          description: "Conflict",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "${key} Already Exists",
                  },
                },
              },
            },
          },
        },
        "498": {
          description: "Invalid Token",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "Invalid Token",
                  },
                },
              },
            },
          },
        },
        "500": {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    default: "Internal Server Error",
                  },
                },
              },
            },
          },
        },
      },
      securitySchemes: {
        authorization: {
          type: "apiKey",
          name: "authorization",
          in: "header",
        },
      },
    },
    security: [
      {
        authorization: [],
      },
    ],
  },
  apis: ["./src/api/**/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app: Express) => {
  app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  app.get("/swagger", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.json(swaggerSpec);
  });

  log.info(`Docs available at http://${APP.HOST}:${APP.PORT}/docs`);
};
