import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@env/server.mjs";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { createHash } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

type ImageType = "png" | "jpeg";

type Base64<imageType extends ImageType> =
  `data:image/${imageType};base64,${string}`;

const extractImageType = (imageFile: string) => {
  // regex match the image type and data
  const regex = /^data:image\/(\w+);base64,(.+)/;
  const matches = imageFile.match(regex);
  if (matches === null || matches.length !== 3) {
    return undefined;
  }
  const imageType = matches[1];
  if (imageType !== "png" && imageType !== "jpeg") {
    return undefined;
  }
  return [
    imageType as ImageType,
    imageFile as Base64<typeof imageType>,
  ] as const; // matches[1] is the image type
};

const getImageData = (imageFile: string) => {
  const image = extractImageType(imageFile);
  if (!image) return;
  const cuid = createId();
  const md5hash = createHash("md5").update(image[1]).digest("base64");
  return { image, cuid, md5hash };
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
      const imageData = getImageData(input.image);
      if (imageData?.image === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "invalid image type",
        });
      }
      const key = `${ctx.session.user.id}/${imageData.cuid}.${imageData.image[0]}`;
      try {
        const putCommand = new PutObjectCommand({
          Bucket: env.R2_BUCKET_NAME,
          Key: key,
          Body: imageData.image[1],
          ACL: "public-read",
          ContentEncoding: "base64",
          ContentType: `image/${imageData.image[0]}`,
          ContentMD5: imageData.md5hash,
        });
        const res = await ctx.s3.send(putCommand);
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
