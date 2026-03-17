const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full mt-2" />
    </div>
  </div>
);

export default SkeletonCard;
