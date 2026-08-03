const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const MAX_ARRAY_INDEX = 10_000;
const PART = /[^.\[\]]+|\[([^\]]*)\]/g;

const parsePath = (key: string): string[] => {
  const parts: string[] = [];
  for (const match of key.matchAll(PART)) {
    const part = match[1] ?? match[0];
    if (part) parts.push(part);
  }
  return parts;
};

export const toJSON = function (formData: FormData): Record<string, any> {
  const object: Record<string, any> = {};

  formData.forEach((value, key) => {
    const parts = parsePath(key);
    if (parts.some((part) => UNSAFE_KEYS.has(part))) return;
    let current = object;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const nextPart = parts[index + 1];
      const nextIndex = Number(nextPart);
      const isNextArray =
        !isLast &&
        Number.isInteger(nextIndex) &&
        nextIndex >= 0 &&
        nextIndex <= MAX_ARRAY_INDEX;

      if (isLast) {
        current[part] = value;
      } else {
        if (isNextArray) {
          if (!Array.isArray(current[part])) {
            current[part] = [];
          }
          current = current[part];
        } else {
          if (!(typeof current[part] === "object" && current[part] !== null)) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    });
  });

  return object;
};

/* Default export must stay: some consumers import this module as a
   single default value and call `.toJSON` off it rather than
   destructuring the named export. */
export default { toJSON };
