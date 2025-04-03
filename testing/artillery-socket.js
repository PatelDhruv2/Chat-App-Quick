module.exports = {
    beforeScenario: async (context, ee, next) => {
      context.vars.room = `room-${Math.floor(Math.random() * 1000)}`;
      next();
    },
  };
  