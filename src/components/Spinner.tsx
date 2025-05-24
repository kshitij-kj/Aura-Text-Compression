
const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-4 w-4 rounded-full border-2 border-b-transparent border-purple-500 animate-spin"></div>
      <span className="ml-2 text-purple-700 dark:text-purple-400">Processing...</span>
    </div>
  );
};

export { Spinner };
