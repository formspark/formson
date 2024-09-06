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
