import { kvsEnvStorage } from "@kvs/env";

export type Context = Awaited<ReturnType<typeof kvsEnvStorage<StorageSchema>>>;

export type StorageSchema = {
  photos: Photo[];
  users: User[];
  tags: Tag[];
};

export type Photo = {
  id: string;
  name: string;
  category: Category;
  url: string;
  description?: string;
  githubUser: string;
  created: string;
};
type Category = "SELFIE" | "PORTRAIT" | "ACTION" | "LANDSCAPE" | "GRAPHIC";

export type User = {
  githubLogin: string;
  name: string;
};

export type Tag = {
  photoID: string;
  userID: string;
};

type GetContext = () => Promise<Context>;
export const getContext: GetContext = async () => {
  const context = await kvsEnvStorage<StorageSchema>({
    name: "photo-share",
    version: 1,
  });

  return context;
};
