import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@env/server.mjs";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const getImageData = (imageFile: string) => {
  const imageData: ArrayBuffer = Buffer.from(
    imageFile.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const hash: string = createHash("sha256").update(imageData).digest("hex");
  const md5hash: string = createHash("md5").update(imageData).digest("hex");
  return { imageData, hash, md5hash };
};

const extractImageType = (imageFile: string) => {
  const fileType = imageFile.split(";")[0]?.split("/")[1];
  return fileType;
};

export const uploadRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, image } = input;
      const { imageData, hash, md5hash } = getImageData(image);
      const imageType = extractImageType(image);
      if (imageType === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "invalid image type",
        });
      }
      const key = `${ctx.session.user.id}/${title}-${hash.substring(
        0,
        10
      )}.${imageType}`;
      try {
        const res = await ctx.s3.send(
          new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            Body: imageData,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/${imageType}`,
            ContentMd5: md5hash,
          })
        );
        if (res.$metadata.httpStatusCode !== 200) {
          console.error(res);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "something went wrong",
          });
        }
        return `https://${env.R2_OBJECT_URL}/${key}`;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
          cause: err,
        });
      }
    }),
});
