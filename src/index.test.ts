import { describe, expect, it } from "vitest";
import { toJSON } from "./index";

describe("formson", () => {
  describe("toJSON", () => {
    it("converts plain fields", () => {
      const formData = new FormData();
      formData.append("firstName", "John");
      formData.append("lastName", "Doe");
      const json = toJSON(formData);
      expect(json).toEqual({
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("nests dot-separated fields", () => {
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

    it("nests multiple dot-separated levels", () => {
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

    it("collects indexed fields into arrays", () => {
      const formData = new FormData();
      formData.append("persons[0]", "John");
      formData.append("persons[1]", "Jane");
      const json = toJSON(formData);
      expect(json).toEqual({
        persons: ["John", "Jane"],
      });
    });

    it("nests indexed arrays", () => {
      const formData = new FormData();
      formData.append("matrix[0][0]", "A");
      formData.append("matrix[0][1]", "B");
      const json = toJSON(formData);
      expect(json).toEqual({
        matrix: [["A", "B"]],
      });
    });

    it("combines object paths with array indices", () => {
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

    it("collects object fields inside arrays", () => {
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

    it("preserves nested objects and arrays", () => {
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

    it("returns an empty object for an empty form", () => {
      expect(toJSON(new FormData())).toEqual({});
    });

    it("preserves empty strings", () => {
      const formData = new FormData();
      formData.append("note", "");
      expect(toJSON(formData)).toEqual({ note: "" });
    });

    it("collects repeated fields into an array", () => {
      const formData = new FormData();
      formData.append("tag", "first");
      formData.append("tag", "second");
      formData.append("tag", "third");
      expect(toJSON(formData)).toEqual({ tag: ["first", "second", "third"] });
    });

    it("collects repeated nested fields into an array", () => {
      const formData = new FormData();
      formData.append("person.tags", "first");
      formData.append("person.tags", "second");
      expect(toJSON(formData)).toEqual({
        person: { tags: ["first", "second"] },
      });
    });

    it("collects repeated file values into an array", () => {
      const a = new File(["a"], "a.txt", { type: "text/plain" });
      const b = new File(["b"], "b.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("uploads", a);
      formData.append("uploads", b);
      const json = toJSON(formData);
      expect(json.uploads).toEqual([a, b]);
    });

    it("preserves file values", () => {
      const file = new File(["hello"], "hello.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("upload", file);
      expect(toJSON(formData).upload).toBe(file);
    });

    it("replaces a scalar with a nested object", () => {
      const formData = new FormData();
      formData.append("user", "John");
      formData.append("user.age", "30");
      expect(toJSON(formData)).toEqual({ user: { age: "30" } });
    });

    it("replaces a nested object with a scalar", () => {
      const formData = new FormData();
      formData.append("user.age", "30");
      formData.append("user", "John");
      expect(toJSON(formData)).toEqual({ user: "John" });
    });

    it("accepts the largest supported array index", () => {
      const formData = new FormData();
      formData.append("items[10000]", "x");
      const json = toJSON(formData);
      expect(Array.isArray(json.items)).toBe(true);
      expect(json.items).toHaveLength(10001);
      expect(json.items).toMatchObject({ 10000: "x" });
    });

    it("keeps indices above the array limit as object keys", () => {
      const formData = new FormData();
      formData.append("items[10001]", "x");
      const json = toJSON(formData);
      expect(Array.isArray(json.items)).toBe(false);
      expect(json.items).toEqual({ "10001": "x" });
    });

    it("keeps negative indices as object keys", () => {
      const formData = new FormData();
      formData.append("items[-1]", "x");
      expect(toJSON(formData)).toEqual({ items: { "-1": "x" } });
    });

    it("keeps fractional indices as object keys", () => {
      const formData = new FormData();
      formData.append("items[1.5]", "x");
      expect(toJSON(formData)).toEqual({ items: { "1.5": "x" } });
    });

    it("preserves dots inside bracket keys", () => {
      const formData = new FormData();
      formData.append("items[a.b]", "x");
      expect(toJSON(formData)).toEqual({ items: { "a.b": "x" } });
    });

    it("collects fields with empty brackets into an array", () => {
      const formData = new FormData();
      formData.append("items[]", "a");
      formData.append("items[]", "b");
      expect(toJSON(formData)).toEqual({ items: ["a", "b"] });
    });

    it("ignores prototype-pollution keys", () => {
      const formData = new FormData();
      formData.append("__proto__.polluted", "yes");
      formData.append("constructor.prototype.polluted", "yes");
      formData.append("a.__proto__.polluted", "yes");
      formData.append("safe", "ok");
      const json = toJSON(formData);
      expect(json).toEqual({ safe: "ok" });
      expect(
        Object.getOwnPropertyDescriptor(Object.prototype, "polluted"),
      ).toBeUndefined();
    });

    it("keeps a top-level index as an object key", () => {
      const formData = new FormData();
      formData.append("[0]", "x");
      expect(toJSON(formData)).toEqual({ "0": "x" });
    });

    it("collapses consecutive dots", () => {
      const formData = new FormData();
      formData.append("a..b", "x");
      expect(toJSON(formData)).toEqual({ a: { b: "x" } });
    });

    it("ignores a trailing dot", () => {
      const formData = new FormData();
      formData.append("a.", "x");
      expect(toJSON(formData)).toEqual({ a: "x" });
    });

    it("drops a dot-only key", () => {
      const formData = new FormData();
      formData.append(".", "x");
      expect(toJSON(formData)).toEqual({});
    });

    it("preserves whitespace in keys", () => {
      const formData = new FormData();
      formData.append(" spaced key ", "x");
      expect(toJSON(formData)).toEqual({ " spaced key ": "x" });
    });

    it("preserves file values in indexed arrays", () => {
      const a = new File(["a"], "a.txt", { type: "text/plain" });
      const b = new File(["b"], "b.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("attachments[0]", a);
      formData.append("attachments[1]", b);
      const json = toJSON(formData);
      expect(json.attachments).toEqual([a, b]);
      if (!Array.isArray(json.attachments))
        throw new Error("Expected attachments array");
      const attachments: unknown[] = json.attachments;
      expect(attachments[0]).toBe(a);
      expect(attachments[1]).toBe(b);
    });

    it("fills skipped array indices with undefined", () => {
      const formData = new FormData();
      formData.append("numbers[0]", "A");
      formData.append("numbers[2]", "B");
      formData.append("numbers[5]", "C");
      const json = toJSON(formData);
      expect(json).toEqual({
        numbers: ["A", undefined, "B", undefined, undefined, "C"],
      });
    });

    it.each(["toString", "valueOf", "hasOwnProperty"])(
      "preserves a field named %s without inherited values",
      (name) => {
        const formData = new FormData();
        formData.append(name, "first");
        expect(toJSON(formData)).toEqual({ [name]: "first" });
        formData.append(name, "second");
        expect(toJSON(formData)).toEqual({ [name]: ["first", "second"] });
      },
    );
  });
});
