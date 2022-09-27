import { User } from "@/context";
import { QueryResolvers, Resolvers } from "generated/graphql";

export const getQuery = (): QueryResolvers => {
  const query: QueryResolvers = {
    totalPhotos: async (_parent, _args, context) => {
      const photos = (await context.get("photos")) ?? [];

      return photos.length;
    },
    allPhotos: async (_parent, args, context) => {
      const [maybePhotos, maybeUsers, maybeTags] = await Promise.all([
        context.get("photos"),
        context.get("users"),
        context.get("tags"),
      ]);
      const photos = maybePhotos ?? [];
      const users = maybeUsers ?? [];
      const tags = maybeTags ?? [];

      return photos.map((photo) => {
        const postedBy = users.find(
          (user) => user.githubLogin === photo.githubUser
        );

        if (postedBy === undefined) {
          throw new Error("user not found");
        }

        const taggedUsers = tags
          .filter((tag) => tag.photoID === photo.id)
          .map((tag) => tag.userID)
          .flatMap((id) => {
            const maybeUser = users.find((user) => user.githubLogin === id);

            return maybeUser === undefined ? [] : [maybeUser];
          });

        return {
          id: photo.id,
          url: photo.url,
          name: photo.name,
          description: photo.description,
          postedBy,
          taggedUsers,
          category: photo.category,
          created: new Date(photo.created),
        };
      });
    },
  };

  return query;
};

const contextUserToSchemaUser = (user: User): Resolvers["User"] => {};
