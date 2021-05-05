import FlexSearch from 'flexsearch';

const tokenizer = (str: string) => {
  const lower = str.toLowerCase();
  const matched = lower.match(/[一-龠]+|[ァ-ヴー]+|[a-z0-9]+/g);
  if (!matched) {
    return [];
  } else {
    const words = matched.filter((word) => {
      return word.length > 1;
    });
    const results = words.map((word) => {
      if (word.match(/[a-z0-9]+/g)) {
        let token = '';
        return Array.from(word)
          .map((char) => (token += char))
          .filter((token) => token.length > 1);
      } else {
        return word;
      }
    });
    return results.flat();
  }
};

export const index = FlexSearch.create({
  tokenize: tokenizer,
  doc: { id: 'id', field: ['url', 'title', 'comment', 'tags'] },
});
