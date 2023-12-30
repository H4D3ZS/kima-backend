import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS } from "config";
import log from "winston";

const s3 = new S3Client({
  region: AWS.BUCKET_REGION,
  credentials: {
    accessKeyId: AWS.ACCESS_KEY,
    secretAccessKey: AWS.SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (file, buffer?) => {
  const params = {
    Bucket: AWS.BUCKET_NAME,
    Key: file.fileName,
    Body: buffer ? buffer : file.buffer,
    ContentType: "image/jpeg",
  };

  const command = new PutObjectCommand(params);

  await s3.send(command);

  return file.fileName;
};

export const getFromS3 = async (fileName) => {
  const params = {
    Bucket: AWS.BUCKET_NAME,
    Key: fileName,
  };
  const command = new GetObjectCommand(params);
  return await getSignedUrl(s3, command, { expiresIn: 86400 });
};

export const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: AWS.BUCKET_NAME,
    Key: fileName,
  };
  const command = new DeleteObjectCommand(params);
  return await s3.send(command);
};

export const emptyBucket = async (fileName) => {
  var params = {
    Bucket: AWS.BUCKET_NAME,
    Prefix: fileName,
  };

  const listCommand = new ListObjectsV2Command(params);

  let list = await s3.send(listCommand);
  if (list.KeyCount) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: AWS.BUCKET_NAME,
      Delete: {
        Objects: list.Contents.map((item) => ({ Key: item.Key })),
        Quiet: false,
      },
    });

    let deleted = await s3.send(deleteCommand);

    if (deleted.Errors) {
      deleted.Errors.map((error) =>
        log.error(`${error.Key} could not be deleted - ${error.Code}`)
      );
    }

    return deleted;
  }
};
