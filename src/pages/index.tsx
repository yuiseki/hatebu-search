/// <reference types="@emotion/react/types/css-prop" />
import { useRouter } from 'next/router';
import { useState } from 'react';
import tw, { css } from 'twin.macro';

const container = css`
  ${tw`mx-auto m-4 p-4 rounded bg-gray-400`}
`;

const Home = () => {
  const router = useRouter();
  const [id, setId] = useState('');
  return (
    <div css={container}>
      <main>
        <h1 tw='text-5xl font-bold mb-3'>はてブ爆速検索君</h1>
        <div tw='m-1'>
          <label>はてなID：</label>
          <input
            type='text'
            tw='p-2 m-1'
            onChange={(e) => {
              setId(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                router.push('/search/' + id);
              }
            }}
          />
          <button
            type='button'
            tw='bg-blue-500 rounded p-2 m-1'
            onClick={() => {
              router.push('/search/' + id);
            }}
          >
            爆速検索する
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
