export let stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({
      id: "asdfasdf",
    }),
  },
};
