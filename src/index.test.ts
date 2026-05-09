import { describe, expect, test } from "vitest";
import { toJSON } from "./index";

describe("formson", () => {
  describe("toJSON", () => {
    test("is a function", () => {
      expect(toJSON).toBeTypeOf("function");
    });

    test("regular", () => {
      const formData = new FormData();
      formData.append("firstName", "John");
      formData.append("lastName", "Doe");
      const json = toJSON(formData);
      expect(json).toEqual({
        firstName: "John",
        lastName: "Doe",
      });
    });

    test("dots", () => {
      const formData = new FormData();
      formData.append("person.firstName", "John");
      formData.append("person.lastName", "Doe");
      const json = toJSON(formData);
      expect(json).toEqual({
        person: {
          firstName: "John",
          lastName: "Doe",
        },
      });
    });

    test("nested dots", () => {
      const formData = new FormData();
      formData.append("person.name.first", "John");
      formData.append("person.name.last", "Doe");
      const json = toJSON(formData);
      expect(json).toEqual({
        person: {
          name: {
            first: "John",
            last: "Doe",
          },
        },
      });
    });

    test("brackets", () => {
      const formData = new FormData();
      formData.append("persons[0]", "John");
      formData.append("persons[1]", "Jane");
      const json = toJSON(formData);
      expect(json).toEqual({
        persons: ["John", "Jane"],
      });
    });

    test("nested brackets", () => {
      const formData = new FormData();
      formData.append("matrix[0][0]", "A");
      formData.append("matrix[0][1]", "B");
      const json = toJSON(formData);
      expect(json).toEqual({
        matrix: [["A", "B"]],
      });
    });

    test("mixed dots and brackets", () => {
      const formData = new FormData();
      formData.append("user.info.name", "John Doe");
      formData.append("user.info.skills[0]", "JavaScript");
      formData.append("user.info.skills[1]", "TypeScript");
      const json = toJSON(formData);
      expect(json).toEqual({
        user: {
          info: {
            name: "John Doe",
            skills: ["JavaScript", "TypeScript"],
          },
        },
      });
    });

    test("objects in arrays", () => {
      const formData = new FormData();
      formData.append("projects[0].name", "Project A");
      formData.append("projects[0].status", "In Progress");
      formData.append("projects[1].name", "Project B");
      formData.append("projects[1].status", "Completed");
      const json = toJSON(formData);
      expect(json).toEqual({
        projects: [
          { name: "Project A", status: "In Progress" },
          { name: "Project B", status: "Completed" },
        ],
      });
    });

    test("complex nested structure", () => {
      const formData = new FormData();
      formData.append("user.name", "John Doe");
      formData.append("user.skills[0]", "JavaScript");
      formData.append("user.skills[1]", "TypeScript");
      formData.append("user.address.street", "123 Main St");
      formData.append("user.address.city", "Anytown");
      formData.append("user.projects[0].name", "Project A");
      formData.append("user.projects[0].tasks[0]", "Task 1");
      formData.append("user.projects[0].tasks[1]", "Task 2");
      formData.append("user.projects[1].name", "Project B");
      formData.append("user.projects[1].tasks[0]", "Task 3");
      const json = toJSON(formData);
      expect(json).toEqual({
        user: {
          name: "John Doe",
          skills: ["JavaScript", "TypeScript"],
          address: {
            street: "123 Main St",
            city: "Anytown",
          },
          projects: [
            {
              name: "Project A",
              tasks: ["Task 1", "Task 2"],
            },
            {
              name: "Project B",
              tasks: ["Task 3"],
            },
          ],
        },
      });
    });

    test("empty form data", () => {
      expect(toJSON(new FormData())).toEqual({});
    });

    test("empty string values are preserved", () => {
      const formData = new FormData();
      formData.append("note", "");
      expect(toJSON(formData)).toEqual({ note: "" });
    });

    test("repeated key keeps the last value", () => {
      const formData = new FormData();
      formData.append("tag", "first");
      formData.append("tag", "second");
      expect(toJSON(formData)).toEqual({ tag: "second" });
    });

    test("File values pass through unchanged", () => {
      const file = new File(["hello"], "hello.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("upload", file);
      expect(toJSON(formData).upload).toBe(file);
    });

    test("scalar then nested overwrites the scalar", () => {
      const formData = new FormData();
      formData.append("user", "John");
      formData.append("user.age", "30");
      expect(toJSON(formData)).toEqual({ user: { age: "30" } });
    });

    test("nested then scalar overwrites the object", () => {
      const formData = new FormData();
      formData.append("user.age", "30");
      formData.append("user", "John");
      expect(toJSON(formData)).toEqual({ user: "John" });
    });

    test("MAX_ARRAY_INDEX boundary: 10000 is an array", () => {
      const formData = new FormData();
      formData.append("items[10000]", "x");
      const json = toJSON(formData);
      expect(Array.isArray((json as any).items)).toBe(true);
    });

    test("just past MAX_ARRAY_INDEX: 10001 is an object key", () => {
      const formData = new FormData();
      formData.append("items[10001]", "x");
      const json = toJSON(formData);
      expect(Array.isArray((json as any).items)).toBe(false);
      expect((json as any).items).toEqual({ "10001": "x" });
    });

    test("negative indices become object keys", () => {
      const formData = new FormData();
      formData.append("items[-1]", "x");
      expect(toJSON(formData)).toEqual({ items: { "-1": "x" } });
    });

    test("float indices become object keys", () => {
      const formData = new FormData();
      formData.append("items[1.5]", "x");
      expect(toJSON(formData)).toEqual({ items: { "1.5": "x" } });
    });

    test("dots inside brackets are treated as part of the key", () => {
      const formData = new FormData();
      formData.append("items[a.b]", "x");
      expect(toJSON(formData)).toEqual({ items: { "a.b": "x" } });
    });

    test("empty brackets collapse to a scalar key", () => {
      const formData = new FormData();
      formData.append("items[]", "a");
      formData.append("items[]", "b");
      expect(toJSON(formData)).toEqual({ items: "b" });
    });

    test("ignores prototype-pollution keys", () => {
      const formData = new FormData();
      formData.append("__proto__.polluted", "yes");
      formData.append("constructor.prototype.polluted", "yes");
      formData.append("a.__proto__.polluted", "yes");
      formData.append("safe", "ok");
      const json = toJSON(formData);
      expect(json).toEqual({ safe: "ok" });
      expect(({} as any).polluted).toBeUndefined();
    });

    test("rejects oversized array indices", () => {
      const formData = new FormData();
      formData.append("items[999999999]", "x");
      const json = toJSON(formData);
      expect(Array.isArray((json as any).items)).toBe(false);
      expect((json as any).items).toEqual({ "999999999": "x" });
    });

    test("non-sequential array indices", () => {
      const formData = new FormData();
      formData.append("numbers[0]", "A");
      formData.append("numbers[2]", "B");
      formData.append("numbers[5]", "C");
      const json = toJSON(formData);
      expect(json).toEqual({
        numbers: ["A", undefined, "B", undefined, undefined, "C"],
      });
    });
  });
});
