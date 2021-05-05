import Parser from 'rss-parser';
import { db, newestHatebu, oldestHatebu } from './db';
import { index } from './flex';

const feedUrl = (id, date) => {
  return `https://b.hatena.ne.jp/${id}/bookmark.rss?date=${date}`;
};

const dateToStr = (date: Date) => {
  const yearStr = date.getFullYear().toString();
  const monthStr = ('0' + date.getMonth() + 1).slice(-2).toString();
  const dateStr = ('0' + date.getDate()).slice(-2).toString();
  const dayStr = `${yearStr}${monthStr}${dateStr}`;
  return dayStr;
};

const parser: Parser = new Parser({
  defaultRSS: 1.0,
  customFields: {
    item: [
      ['hatena:bookmarkcount', 'count'],
      ['dc:subject', 'tags', { keepArray: true }],
    ],
  },
});

export const fetchHatebu = async (id: string, dayStr: string) => {
  const CORS_PROXY = 'https://hatebu-cors.herokuapp.com/';
  const path = feedUrl(id, dayStr);
  const json = await parser.parseURL(CORS_PROXY + path);
  const items = json.items.map((i) => {
    const tags = i.tags ? i.tags : [];
    return {
      id: i['rdf:about'] as string,
      url: i.link,
      title: i.title,
      published_at: new Date(i.date).getTime(),
      count: i.count as number,
      comment: i.content,
      tags: tags.join(','),
    };
  });
  return items;
};

const fetchHatebuByDays = async (id, startDay, days) => {
  const daysList = [...Array(days)].map((_, i) => {
    return i;
  });
  for (const i of daysList) {
    const date = new Date(new Date().setDate(new Date(startDay).getDate() - i));
    const dateStr = dateToStr(date);
    const items = await fetchHatebu(id, dateStr);
    for await (const item of items) {
      await db(id).bookmarks.put(item);
    }
    await index.add(items);
  }
};

export const fetchNewHatebu = async (id) => {
  const newest = await newestHatebu(id);
  // TODO: 最新の日時から現在時刻まで取得するべき
  if (newest) {
    await fetchHatebuByDays(id, new Date(newest.published_at), 1);
  } else {
    await fetchHatebuByDays(id, new Date(), 10);
  }
};

export const fetchOldHatebu = async (id) => {
  const oldest = await oldestHatebu(id);
  if (oldest) {
    await fetchHatebuByDays(id, new Date(oldest.published_at), 20);
  }
};
