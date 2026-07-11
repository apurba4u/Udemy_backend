export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = generateSlug(baseSlug);
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${generateSlug(baseSlug)}-${counter}`;
    counter++;
  }

  return slug;
};
