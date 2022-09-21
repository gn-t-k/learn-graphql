import { Photo } from "@/repository";

export type Mutation = {
  postPhoto: (
    _: any,
    args: { input: { name: string; category: string; description?: string } }
  ) => Promise<Photo>;
};

export const getMutation = (repository: Repository): Mutation => {
  const mutation: Mutation = {
    postPhoto: (
      _: any,
      args: { input: { name: string; category: string; description?: string } }
    ): Photo => {
      const newPhoto: Omit<Photo, "url" | "githubUser"> = {
        id: _id++,
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto as Photo);

      return newPhoto as Photo;
    },
  };
};
