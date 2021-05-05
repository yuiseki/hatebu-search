import Dexie from 'dexie';

export const VERSION = 2;

export interface Bookmark {
  id: string;
  title: string;
  comment: string;
  tags: string;
  url: string;
  published_at: number;
  count: number;
}

interface BookmarkDB extends Dexie {
  bookmarks: Dexie.Table<Bookmark, string>;
}

export const db = (id) => {
  const db = new Dexie(`bookmark-${id}`) as BookmarkDB;
  db.version(VERSION).stores({
    bookmarks: 'id, published_at',
  });
  return db;
};

export const newestHatebu = async (id) => {
  return await db(id).bookmarks.orderBy('published_at').last();
};

export const oldestHatebu = async (id) => {
  return await db(id).bookmarks.orderBy('published_at').first();
};
