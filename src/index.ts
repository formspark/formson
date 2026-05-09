const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const MAX_ARRAY_INDEX = 10_000;

export const toJSON = function (formData: FormData): Record<string, any> {
  const object: Record<string, any> = {};

  formData.forEach((value, key) => {
    const parts = key.split(/[.\[\]]+/).filter(Boolean);
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
