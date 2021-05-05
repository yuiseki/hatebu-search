import { useRouter } from 'next/router';
import tw, { css } from 'twin.macro';
import React, { useEffect, useState } from 'react';
import { fetchNewHatebu, fetchOldHatebu } from '~/lib/hatebu';
import { index } from '~/lib/flex';
import { useDebounce } from '~/hooks/useDebounce';
import { db } from '~/lib/db';
import Head from 'next/head';

const search = async (id, query) => {
  if (query === '' || query === undefined) {
    const latest = await db(id)
      .bookmarks.orderBy('published_at')
      .reverse()
      .limit(100)
      .toArray();
    return latest;
  }
  const results = await index.search(query);
  return results;
};

const container = css`
  ${tw`mx-auto m-4 p-4 rounded bg-gray-400`}
`;

let bookmarks = [];
const Search = () => {
  const router = useRouter();
  const [id, setId] = useState<string>();
  const [dbloading, setdbLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(undefined);
  const debouncedQuery = useDebounce(query, 50);
  const [results, setResults] = useState(undefined);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (router.asPath !== router.route) {
      setId(router.query.id as string);
    }
  }, [router]);

  useEffect(() => {
    let unmounted = false;
    if (!id) {
      return;
    }
    const f = async () => {
      setLoading(true);
      await fetchNewHatebu(id);
      await fetchOldHatebu(id);
      if (!unmounted) {
        setLoading(false);
      }
    };
    f();
    return () => {
      unmounted = true;
    };
  }, [id]);

  useEffect(() => {
    let unmounted = false;
    const f = async () => {
      const cache = await db(id).bookmarks.toArray();
      bookmarks = bookmarks.concat(cache);
      await index.add(bookmarks);
      if (!unmounted) {
        setCount(bookmarks.length);
        setdbLoading(false);
      }
    };
    f();
    return () => {
      unmounted = true;
    };
  }, [id]);

  useEffect(() => {
    let unmounted = false;
    const f = async () => {
      if (!loading && id) {
        const r = await search(id, undefined);
        if (!unmounted) {
          setResults(r);
        }
      }
    };
    f();
    return () => {
      unmounted = true;
    };
  }, [id, loading]);

  useEffect(() => {
    let unmounted = false;
    const f = async () => {
      const r = await search(id, debouncedQuery);
      if (!unmounted) {
        setResults(r);
      }
    };
    f();
    return () => {
      unmounted = true;
    };
  }, [id, debouncedQuery]);

  return (
    <>
      <Head>
        <title>はてブ爆速検索君： {id}</title>
      </Head>
      <div css={container}>
        <main>
          <h1 tw='text-5xl font-bold'>はてブ爆速検索君: {id}</h1>
          {dbloading || loading ? (
            <h2>ロード中... : {count}件</h2>
          ) : (
            <h2>ロード完了 : {count}件</h2>
          )}
          <input
            type='text'
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          {results?.map((result) => {
            return (
              <div key={result.id} tw='bg-gray-50 m-2'>
                <h3 tw='text-3xl'>
                  <a href={result.url}>{result.title}</a>
                </h3>
                <a href={result.url}>{result.url}</a>
                <p>{result.categories}</p>
                <p tw='text-xl'>{result.comment}</p>
              </div>
            );
          })}
        </main>
      </div>
    </>
  );
};

export default Search;
