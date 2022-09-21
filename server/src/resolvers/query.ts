import { QueryResolvers } from "generated/graphql";

export const getQuery = (): QueryResolvers => {
  const query: QueryResolvers = {
    totalPhotos: async (_parent, _args, context) => {
      const photos = (await context.get("photos")) ?? [];

      return photos.length;
    },
    allPhotos: async (_parent, args, context) => {
      const [photos, users, tags] = await Promise.all([
        context.get("photos"),
        context.get("users"),
        context.get("tags"),
      ]);

      return (photos ?? [])
        .filter(
          (photo) =>
            args.after &&
            new Date(photo.created).getTime() > args.after.getTime()
        )
        .map((photo) => {
          const maybePostedBy = (users ?? []).find(
            (user) => user.githubLogin === photo.githubUser
          );

          if (!maybePostedBy) {
            throw new Error("author not found");
          }

          const postedBy = {
            ...maybePostedBy,
            postedPhotos: (photos ?? []).filter(
              (photo) => photo.githubUser === maybePostedBy.githubLogin
            ),
            inPhotos: (tags ?? [])
              .filter((tag) => tag.userID === maybePostedBy.githubLogin)
              .map((tag) => tag.photoID)
              .flatMap((photoId) => {
                const photo = (photos ?? [])?.find(
                  (photo) => photo.id === photoId
                );

                return photo ? [photo] : [];
              }),
          };

          const taggedUserIds = (tags ?? [])
            .filter((tag) => tag.photoID === photo.id)
            .map((tag) => tag.userID);
          const taggedUsers = taggedUserIds.flatMap((taggedUserId) => {
            const user = users?.find(
              (user) => user.githubLogin === taggedUserId
            );

            return user ? [user] : [];
          });

          return {
            ...photo,
            created: new Date(photo.created),
            postedBy,
            taggedUsers,
          };
        });
    },
  };

  return query;
};
