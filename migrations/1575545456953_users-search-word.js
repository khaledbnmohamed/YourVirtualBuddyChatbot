exports.up = (pgm) => {
  pgm.addColumns('users', {
    search_word: { type: 'text', notNull: false },
  });
};
