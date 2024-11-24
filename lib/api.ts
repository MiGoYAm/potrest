import axios from "axios";

export const api = axios.create({ baseURL: "https://api.potterdb.com/v1" });

export type Pagination<T> = {
  data: Resource<T>[];
  meta: {
    pagination: {
      current: number;
      next: number;
      records: number;
    };
  };
};

export type Single<T> = {
  data: Resource<T>;
};

export type Resource<T> = {
  id: string;
  type: string;
  attributes: T;
};

export type CharacterAttributes = {
  slug: string;
  name: string;
  born?: string;
  died?: string;
  gender?: string;
  species?: string;
  height?: string;
  weight?: string;
  hair_color?: string;
  eye_color?: string;
  skin_color?: string;
  blood_status?: string;
  marital_status?: string;
  nationality?: string;
  animagus?: string;
  boggart?: string;
  house?: string;
  patronus?: string;
  alias_names: string[];
  family_members: string[];
  jobs: string[];
  romances: string[];
  titles: string[];
  wands: string[];
  image: string;
  wiki?: string;
};

export type BookAttributes = {
  slug: string;
  title: string;
  author: string;
  cover: string;
  pages: number;
  summary: string;
  dedication: string;
  release_date: string;
  wiki: string;
};

export type ChapterAttributes = {
  slug: string;
  title: string;
  order: number;
  summary: string;
};
