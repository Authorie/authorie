import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { HiEye, HiHeart } from "react-icons/hi2";
import TextareaAutoSize from "react-textarea-autosize";
import z from "zod";
import { api } from "~/utils/api";

const validationSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Title is required" })
    .max(700, { message: "Title is too long" }),
  bio: z.string().max(150, { message: "Your bio is too long" }),
  facebook: z
    .string()
    .max(100, { message: "Your Facebook contact is too long" }),
  ig: z.string().max(100, { message: "Your Instagram contact is too long" }),
  email: z.string().max(100, { message: "Your Email contact is too long" }),
  location: z.string().max(400, { message: "Your location is too long" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const AboutPage = () => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const utils = api.useContext();
  const penname = router.query.penname as string;
  const isOwner = session?.user.penname === penname;
  const { data: user } = api.user.getData.useQuery({ penname });
  const ownedBooks = api.useQueries(
    (t) =>
      user?.ownedBooks.map(({ bookId }) => t.book.getData({ id: bookId })) ?? []
  );
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      description: user?.description ? user.description : "",
      bio: user?.bio ? user.bio : "",
      facebook: user?.facebookContact ? user.facebookContact : "",
      ig: user?.instagramContact ? user.instagramContact : "",
      email: user?.email ? user.email : "",
      location: user?.location ? user.location : "",
    },
  });
  useEffect(() => {
    setValue("description", user?.description || "");
    setValue("bio", user?.bio || "");
    setValue("facebook", user?.facebookContact || "");
    setValue("ig", user?.instagramContact || "");
    setValue("email", user?.emailContact || "");
    setValue("location", user?.location || "");
  }, [user, setValue]);

  const [totalViews, totalLikes] = ownedBooks.reduce(
    (acc, { data: book }) => {
      if (!book) return acc;
      book.chapters.forEach(({ _count }) => {
        acc[0] += _count.views;
        acc[1] += _count.likes;
      });
      return acc;
    },
    [0, 0]
  );

  const updateProfile = api.user.update.useMutation({
    async onMutate(variables) {
      await utils.user.getData.cancel(undefined);
      await utils.user.getData.cancel({
        penname: variables.penname ? variables.penname : session!.user.penname!,
      });
      const prevData = utils.user.getData.getData(undefined);
      utils.user.getData.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          penname: variables.penname ? variables.penname : old.penname,
          bio: variables.bio ? variables.bio : old.bio,
          image: variables.profileImageUrl
            ? variables.profileImageUrl
            : old.image,
          wallpaperImage: variables.wallpaperImageUrl
            ? variables.wallpaperImageUrl
            : old.wallpaperImage,
          description: variables.description
            ? variables.description
            : old.description,
          location: variables.location ? variables.location : old.location,
          facebookContact: variables.facebookContact
            ? variables.facebookContact
            : old.facebookContact,
          instagramContact: variables.instagramContact
            ? variables.instagramContact
            : old.instagramContact,
          emailContact: variables.emailContact
            ? variables.emailContact
            : old.emailContact,
        };
      });
      utils.user.getData.setData(
        {
          penname: variables.penname
            ? variables.penname
            : session!.user.penname!,
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            penname: variables.penname ? variables.penname : old.penname,
            bio: variables.bio ? variables.bio : old.bio,
            image: variables.profileImageUrl
              ? variables.profileImageUrl
              : old.image,
            wallpaperImage: variables.wallpaperImageUrl
              ? variables.wallpaperImageUrl
              : old.wallpaperImage,
            description: variables.description
              ? variables.description
              : old.description,
            location: variables.location ? variables.location : old.location,
            facebookContact: variables.facebookContact
              ? variables.facebookContact
              : old.facebookContact,
            instagramContact: variables.instagramContact
              ? variables.instagramContact
              : old.instagramContact,
            emailContact: variables.emailContact
              ? variables.emailContact
              : old.emailContact,
          };
        }
      );
      return { prevData };
    },
    onError(_error, variables, context) {
      if (context?.prevData) {
        utils.user.getData.setData(undefined, context.prevData);
        utils.user.getData.setData(
          {
            penname: variables.penname
              ? variables.penname
              : session!.user.penname!,
          },
          context.prevData
        );
      }
    },
    onSettled(_data, _error, variables, _context) {
      void utils.user.getData.invalidate(undefined);
      void utils.user.getData.invalidate({
        penname: variables.penname ? variables.penname : session!.user.penname!,
      });
    },
  });

  const onSaveHandler = handleSubmit(async (data: ValidationSchema) => {
    const promiseUpdate = updateProfile.mutateAsync({
      description: data.description ? data.description : user?.description,
      bio: data.bio ? data.bio : user?.bio,
      facebookContact: data.facebook ? data.facebook : user?.facebookContact,
      instagramContact: data.ig ? data.ig : user?.instagramContact,
      emailContact: data.email ? data.email : user?.emailContact,
      location: data.location ? data.location : user?.location,
    });
    await toast.promise(promiseUpdate, {
      loading: "Updating information...",
      success: "Information updated!",
      error: "Error occured during update",
    });
    setIsEditing(false);
  });

  return (
    <div className="my-5">
      <form
        onSubmit={(e) => void onSaveHandler(e)}
        className="relative flex gap-16 rounded-xl bg-white p-10 pr-16"
      >
        {isOwner && (
          <div className="absolute right-2 top-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="h-6 w-16 rounded-lg border-2 border-black text-sm text-black hover:bg-gray-200"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="h-6 w-20 rounded-lg border-2 border-red-400 text-sm text-red-400 hover:bg-red-100"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  className="h-6 w-20 rounded-lg border-2 border-green-500 text-sm text-green-500 hover:bg-green-100"
                >
                  save
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="text-xl font-semibold text-gray-600">Description</p>
              <div className="w-96 border-b" />
            </div>
            {isEditing ? (
              <div className="h-full">
                <div className="flex items-end gap-2">
                  <TextareaAutoSize
                    rows={2}
                    placeholder={
                      user?.description
                        ? user.description
                        : "put your description here"
                    }
                    {...register("description")}
                    className="w-full resize-none rounded-lg bg-transparent text-gray-600 placeholder-gray-300 outline-none"
                  />
                  <p
                    className={`${"text-xs"} 
                          ${watch("description") &&
                        watch("description").length > 700
                        ? "text-red-500"
                        : "text-black"
                      }`}
                  >
                    {watch("description") ? watch("description").length : 0}/700
                  </p>
                </div>
                {errors.description && (
                  <p className="text-xs text-red-400" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="max-w-lg text-gray-600">{user?.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="text-xl font-semibold text-gray-600">Bio</p>
              <div className="w-96 border-b" />
            </div>
            {isEditing ? (
              <div className="h-full">
                <div className="flex items-end gap-2">
                  <TextareaAutoSize
                    rows={1}
                    placeholder={user?.bio ? user.bio : "put your bio here"}
                    {...register("bio")}
                    className="w-full resize-none rounded-lg bg-transparent text-gray-600 placeholder-gray-300 outline-none"
                  />
                  <p
                    className={`${"text-xs"} 
                          ${watch("bio") && watch("bio").length > 150
                        ? "text-red-500"
                        : "text-black"
                      }`}
                  >
                    {watch("bio") ? watch("bio").length : 0}/150
                  </p>
                </div>
                {errors.bio && (
                  <p className="text-xs text-red-400" role="alert">
                    {errors.bio.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="max-w-lg text-gray-600">{user?.bio}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-gray-600">Contact</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full">
                  <Image
                    src="/facebook-about-icon.svg"
                    alt="facebook logo"
                    width={20}
                    height={20}
                  />
                </div>
                {isEditing ? (
                  <div className="h-full">
                    <div className="flex items-end gap-2">
                      <TextareaAutoSize
                        rows={1}
                        placeholder={
                          user?.facebookContact
                            ? user.facebookContact
                            : "put your facebook here"
                        }
                        {...register("facebook")}
                        className="w-full resize-none rounded-lg bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                      />
                      <p
                        className={`${"text-xs"} 
                          ${watch("facebook") && watch("facebook").length > 100
                            ? "text-red-500"
                            : "text-black"
                          }`}
                      >
                        {watch("facebook") ? watch("facebook").length : 0}/100
                      </p>
                    </div>
                    {errors.facebook && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.facebook.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {user?.facebookContact}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full">
                  <Image
                    src="/ig-about-icon.svg"
                    alt="instagram logo"
                    width={20}
                    height={20}
                  />
                </div>
                {isEditing ? (
                  <div className="h-full">
                    <div className="flex items-end gap-2">
                      <TextareaAutoSize
                        rows={1}
                        placeholder={
                          user?.instagramContact
                            ? user.instagramContact
                            : "put your instagram here"
                        }
                        {...register("ig")}
                        className="w-full resize-none rounded-lg bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                      />
                      <p
                        className={`${"text-xs"} 
                          ${watch("ig") && watch("ig").length > 100
                            ? "text-red-500"
                            : "text-black"
                          }`}
                      >
                        {watch("ig") ? watch("ig").length : 0}/100
                      </p>
                    </div>
                    {errors.ig && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.ig.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {user?.instagramContact}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full">
                  <Image
                    src="/mail-about-icon.png"
                    alt="mail logo"
                    width={20}
                    height={20}
                  />
                </div>
                {isEditing ? (
                  <div className="h-full">
                    <div className="flex items-end gap-2">
                      <TextareaAutoSize
                        rows={1}
                        placeholder={
                          user?.facebookContact
                            ? user.facebookContact
                            : "put your email here"
                        }
                        {...register("email")}
                        className="w-full resize-none rounded-lg bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                      />
                      <p
                        className={`${"text-xs"} 
                          ${watch("email") && watch("email").length > 100
                            ? "text-red-500"
                            : "text-black"
                          }`}
                      >
                        {watch("email") ? watch("email").length : 0}/100
                      </p>
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{user?.emailContact}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-gray-600">Location</p>
            {isEditing ? (
              <div className="h-full">
                <div className="flex items-end gap-2">
                  <TextareaAutoSize
                    rows={1}
                    placeholder={
                      user?.location ? user.location : "put your location here"
                    }
                    {...register("location")}
                    className="w-full resize-none rounded-lg bg-transparent text-sm text-gray-600 placeholder-gray-300 outline-none"
                  />
                  <p
                    className={`${"text-xs"} 
                          ${watch("location") && watch("location").length > 100
                        ? "text-red-500"
                        : "text-black"
                      }`}
                  >
                    {watch("location") ? watch("location").length : 0}/100
                  </p>
                </div>
                {errors.location && (
                  <p className="text-xs text-red-400" role="alert">
                    {errors.location.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">{user?.location}</p>
            )}
          </div>
          <div className="flex items-center gap-5">
            <p className="text-lg font-semibold text-gray-600">Total</p>
            <div className="flex items-center gap-2">
              <HiEye className="h-4 w-4" />
              <p className="text-gray-500">{totalViews}</p>
            </div>
            <div className="flex items-center gap-2">
              <HiHeart className="h-4 w-4" />
              <p className="text-gray-500">{totalLikes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-gray-600">Joined</p>
            <p className="text-gray-500">{user?.createdAt?.toDateString()}</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AboutPage;
