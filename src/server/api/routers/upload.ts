import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const uploadRouter = createTRPCRouter({
  createPresignedUrl: protectedProcedure
    .input(z.object({ type: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [dataType, ext] = input.type.split("/");
      if (dataType !== "image" || ext === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "invalid file type",
        });
      }
      const key = `${ctx.session.user.id}/${createId()}.${ext}`;
      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      });

      const imageUrl = `https://${env.R2_OBJECT_URL}/${key}`;

      return {
        presignedUrl: await getSignedUrl(ctx.s3, command, {
          expiresIn: 60 * 5, // 1 minutes
        }),
        imageUrl,
      };
    }),
});
