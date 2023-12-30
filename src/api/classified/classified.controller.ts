import type { Request, Response } from "express";
import express from "express";
import moment from "moment";
import { CLASSIFIED_CATEGORIES, EVENT_TYPES } from "../../constants/defaults";
import Error from "../../constants/error";
import { getFromS3 } from "../../helpers/s3";
import {
  deleteFunction,
  errorHandler,
  responseHandler,
  uploadFunction,
} from "../../helpers/utils";
import { filesUpload } from "../../middlewares/upload";
import {
  createClassified,
  deleteClassified,
  getClassified,
  getClassifieds,
  updateClassified,
  uploadGallery,
} from "./classified.model";

export const classifiedRouter = express.Router();

classifiedRouter.get("/", async (req: Request, res: Response) => {
  const { page, perPage, ...body } = req.query;
  try {
    const classifieds = await getClassifieds(body, page, perPage);
    const classifiedWithUrl = await Promise.all(
      classifieds.data.map(async (item: any) => {
        const imageUrl = await Promise.all(
          item.gallery.map(async (item) => ({
            ...item,
            imageUrl: await getFromS3(item.imageUrl),
          }))
        );

        return {
          ...item,
          gallery: imageUrl,
        };
      })
    );

    return responseHandler({
      status: 200,
      body: { data: classifiedWithUrl, pageInfo: classifieds.pageInfo },
      res,
      req,
    });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

classifiedRouter.get("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  try {
    const data: any = await getClassified(id);

    const gallery = await Promise.all(
      data.gallery.map(async (item) => ({
        ...item,
        imageUrl: await getFromS3(item.imageUrl),
      }))
    );

    const classified = { ...data, gallery };

    if (classified)
      return responseHandler({
        status: 200,
        body: classified,
        res,
        req,
      });
    else
      return responseHandler({
        ...Error.notFound,
        res,
        req,
      });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

classifiedRouter.post("/:type", async (req: Request, res: Response) => {
  const type: string = req.params.type;
  const userId: string = req.headers.idFromJWT.toString();

  const { category, eventDetails, forSaleDetails, jobPostingDetails, ...data } =
    req.body;

  let newEventDetails, newForSaleDetails, newJobPostingDetails;

  switch (type) {
    case CLASSIFIED_CATEGORIES[0]: {
      if (!eventDetails)
        return responseHandler({
          status: Error.badRequest.status,
          body: {
            message: `Classified Type ${CLASSIFIED_CATEGORIES[0]} requires eventDetails`,
          },
          res,
          req,
        });

      const { tickets, date, time, eventType } = eventDetails;
      newEventDetails = {
        create: {
          date: moment(date, "YYYY-MM-DD").toISOString(),
          time: moment(time, "HH:mm").toISOString(),
          eventType,
          tickets:
            eventType === EVENT_TYPES[0] && tickets && tickets.length > 0
              ? {
                  create: tickets,
                }
              : undefined,
        },
      };
      break;
    }

    case CLASSIFIED_CATEGORIES[1]: {
      if (!forSaleDetails)
        return responseHandler({
          status: Error.badRequest.status,
          body: {
            message: `Classified Type ${CLASSIFIED_CATEGORIES[1]} requires forSaleDetails`,
          },
          res,
          req,
        });

      const { itemCondition, price } = forSaleDetails;
      newForSaleDetails = {
        create: {
          itemCondition,
          price,
        },
      };
      break;
    }

    case CLASSIFIED_CATEGORIES[2]: {
      if (!jobPostingDetails)
        return responseHandler({
          status: Error.badRequest.status,
          body: {
            message: `Classified Type ${CLASSIFIED_CATEGORIES[2]} requires forSaleDetails`,
          },
          res,
          req,
        });

      const { sections } = jobPostingDetails;
      newJobPostingDetails =
        sections && sections.length > 0
          ? {
              create: { sections: { create: sections } },
            }
          : undefined;
      break;
    }
  }

  try {
    const classified = await createClassified({
      userId,
      category: type,
      eventDetails: newEventDetails,
      forSaleDetails: newForSaleDetails,
      jobPostingDetails: newJobPostingDetails,
      ...data,
    });

    if (classified)
      return responseHandler({
        status: 201,
        body: {
          message: `Created a classified`,
          data: classified,
        },
        res,
        req,
      });
    else
      return responseHandler({
        ...Error.notFound,
        res,
        req,
      });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

classifiedRouter.put("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const userId: string = req.headers.idFromJWT.toString();

  const { eventDetails, forSaleDetails, jobPostingDetails, ...data } = req.body;

  let newEventDetails, newForSaleDetails, newJobPostingDetails;

  const classified = await getClassified(id);

  switch (classified.category) {
    case CLASSIFIED_CATEGORIES[0]: {
      if (eventDetails) {
        const { tickets, date, time, eventType } = eventDetails;
        newEventDetails = {
          date: moment(date, "YYYY-MM-DD").toISOString(),
          time: moment(time, "HH:mm").toISOString(),
          eventType,
          tickets: [...tickets],
        };
      }
      break;
    }

    case CLASSIFIED_CATEGORIES[1]: {
      if (forSaleDetails) {
        const { itemCondition, price } = forSaleDetails;
        newForSaleDetails = {
          itemCondition,
          price,
        };
      }
      break;
    }

    case CLASSIFIED_CATEGORIES[2]: {
      if (jobPostingDetails) {
        const { sections } = jobPostingDetails;
        newJobPostingDetails =
          sections && sections.length > 0 ? { ...sections } : undefined;
      }
      break;
    }
  }

  try {
    const updatedClassified = await updateClassified({
      id,
      userId,
      eventDetails: newEventDetails,
      forSaleDetails: newForSaleDetails,
      jobPostingDetails: newJobPostingDetails,
      ...data,
    });

    if (updatedClassified)
      return responseHandler({
        status: 200,
        body: {
          message: `Classified ${id} Updated`,
          data: updatedClassified,
        },
        res,
        req,
      });
    else
      return responseHandler({
        ...Error.notFound,
        res,
        req,
      });
  } catch (error: any) {
    return errorHandler({ error, res, req });
  }
});

classifiedRouter.delete("/:id", (req, res) =>
  deleteFunction(req, res, deleteClassified, parseInt(req.params.id))
);

classifiedRouter.post(
  "/:id/upload/gallery",
  filesUpload,
  async (req: Request & { files?: any }, res: Response) => {
    const id: number = parseInt(req.params.id);
    try {
      const files = req.files;
      await getClassified(id);
      const uploadedUrl = files
        ? await Promise.all(
            files.map(async (file, index) => {
              const uploadedFile = await uploadFunction(
                "gallery",
                {
                  size: { height: 720, width: 1280 },
                  crop: { height: 312, width: 820 },
                },
                req,
                res,
                file.buffer,
                `${id}/${moment().format("YYYYMMDDHHmmss")}-${index}`
              );
              return { imageUrl: uploadedFile };
            })
          )
        : [];

      const updatedClassified = await uploadGallery({
        id,
        gallery: {
          create: uploadedUrl,
        },
      });

      if (updatedClassified)
        return responseHandler({
          status: 200,
          body: {
            message: `Classified ${id} Updated`,
            ...updatedClassified,
          },
          res,
          req,
        });
      else
        return responseHandler({
          ...Error.notFound,
          res,
          req,
        });
    } catch (error: any) {
      return errorHandler({ error, res, req });
    }
  }
);
