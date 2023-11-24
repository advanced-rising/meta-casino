const initModules = async () => {
  return {};
};

export default initModules;

export type AppModules = Awaited<ReturnType<typeof initModules>>;
