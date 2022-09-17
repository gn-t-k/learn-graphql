import { ApolloServer } from "apollo-server";

const typeDefs = `
  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

let _id = 0;

type Photo = {
  id: number;
  name: string;
  category: string;
  url: string;
  description?: string;
  githubUser: string;
};
const photos: Photo[] = [
  {
    id: 1,
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite cutes",
    url: "https://via.placeholder.com/640x360/0bd/fff?text=1",
    category: "ACTION",
    githubUser: "gPlake",
  },
  {
    id: 2,
    name: "Enjoying the sunshine",
    url: "https://via.placeholder.com/640x360/0bd/fff?text=1",
    category: "SELFIE",
    githubUser: "sSchmidt",
  },
  {
    id: 3,
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    url: "https://via.placeholder.com/640x360/0bd/fff?text=1",
    category: "LANDSCAPE",
    githubUser: "Schmidt",
  },
];

type User = {
  githubLogin: string;
  name: string;
};
const users: User[] = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];

type Tag = {
  photoID: number;
  userID: string;
};
const tags: Tag[] = [
  { photoID: 1, userID: "gPlake" },
  { photoID: 2, userID: "sSchmidt" },
  { photoID: 2, userID: "mHattrup" },
  { photoID: 2, userID: "gPlake" },
];

const resolvers = {
  Query: {
    totalPhotos: (): number => photos.length,
    allPhotos: (): Photo[] => photos,
  },
  Mutation: {
    postPhoto: (
      _: any,
      args: { input: { name: string; category: string; description?: string } }
    ): Photo => {
      const newPhoto: Omit<Photo, "url" | "githubUser"> = {
        id: _id++,
        ...args.input,
      };
      photos.push(newPhoto as Photo);

      return newPhoto as Photo;
    },
  },
  Photo: {
    url: (parent: Photo): string =>
      `https://via.placeholder.com/640x360/0bd/fff?text=${parent.id}`,
    postedBy: (parent: Photo): User =>
      users.find((user) => user.githubLogin === parent.githubUser) ?? {
        githubLogin: "unknown",
        name: "user not found",
      },
    taggedUsers: (parent: Photo): User[] =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map(
          (userID) =>
            users.find((user) => user.githubLogin === userID) ?? {
              githubLogin: "unknown",
              name: "user not found",
            }
        ),
  },
  User: {
    postedPhotos: (parent: User): Photo[] =>
      photos.filter((photo) => photo.githubUser === parent.githubLogin),
    inPhotos: (parent: User): Photo[] =>
      tags
        .filter((tag) => tag.userID === parent.githubLogin)
        .map((tag) => tag.photoID)
        .map(
          (photoID) =>
            photos.find((photo) => photo.id === photoID) ?? {
              id: 0,
              name: "photo not found",
              category: "",
              url: "",
              description: "",
              githubUser: "",
            }
        ),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`GraphQL Service running on ${url}`);
});
