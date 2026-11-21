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

export const toJSON = function (formData: FormData): Record<string, unknown> {
  const object: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    const parts = parsePath(key);
    if (parts.some((part) => UNSAFE_KEYS.has(part))) return;
    let current: object = object;

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
        const existing: unknown = Object.getOwnPropertyDescriptor(
          current,
          part,
        )?.value;
        if (Array.isArray(existing)) {
          existing.push(value);
        } else if (
          existing !== undefined &&
          !(
            typeof existing === "object" &&
            existing !== null &&
            existing.constructor === Object
          )
        ) {
          // Repeated fields, such as checkbox groups, collect their values.
          Reflect.set(current, part, [existing, value]);
        } else {
          Reflect.set(current, part, value);
        }
      } else {
        const existing: unknown = Object.getOwnPropertyDescriptor(
          current,
          part,
        )?.value;
        if (isNextArray) {
          const next = Array.isArray(existing) ? existing : [];
          Reflect.set(current, part, next);
          current = next;
        } else {
          const next =
            typeof existing === "object" && existing !== null ? existing : {};
          Reflect.set(current, part, next);
          current = next;
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
