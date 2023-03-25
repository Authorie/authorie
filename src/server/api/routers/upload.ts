import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@env/server.mjs";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const getImageData = (imageFile: string) => {
  const imageData = Buffer.from(
    imageFile.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const cuid = createId();
  const md5hash = createHash("md5").update(imageData).digest("base64");
  return { imageData, cuid, md5hash };
};

const extractImageType = (imageFile: string) => {
  const fileType = imageFile.split(";")[0]?.split("/")[1];
  return fileType;
};

export const uploadRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(), // deprecated
        image: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { image } = input;
      const { imageData, cuid, md5hash } = getImageData(image);
      const imageType = extractImageType(image);
      if (imageType === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "invalid image type",
        });
      }
      const key = `${ctx.session.user.id}/${cuid}.${imageType}`;
      try {
        const res = await ctx.s3.send(
          new PutObjectCommand({
            Bucket: env.R2_BUCKET_NAME,
            Key: key,
            Body: imageData,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: `image/${imageType}`,
            ContentMD5: md5hash,
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
