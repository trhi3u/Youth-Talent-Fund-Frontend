import rawCategoryMap from '@/assets/category.txt?raw';

const categoryMap = (() => {
  const map = {};
  if (!rawCategoryMap) return map;
  rawCategoryMap
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      const parts = line.split(/\s*(?:=|->|→)\s*/);
      const key = parts[0];
      const label = parts.slice(1).join('→').trim();
      if (key && label) {
        map[key.trim()] = label;
      }
    });
  return map;
})();

export const getCategoryLabel = category => {
  const key = (category || '').trim();
  if (!key) return category;
  return categoryMap[key] || category;
};


export const getCategoryOptions = () => {
  return Object.entries(categoryMap).map(([value, label]) => ({
    label,
    value
  }));
};

export { categoryMap };

