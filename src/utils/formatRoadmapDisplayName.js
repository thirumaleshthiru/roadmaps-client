export const formatRoadmapDisplayName = (roadmapName) => {
  if (!roadmapName) return '';
  
  return roadmapName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
