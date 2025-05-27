import { describe, expect, it } from "bun:test";
import { extractPlaceholders, splitSource } from "./placeholders";

describe("placeholder extraction", () => {
  it("Should extract placeholders from comment blocks", () => {
    const script = `
      // valid cases
      // @placeholder userId: Coll[Byte]          User ID
      // @placeholder isActive: Boolean = false   User active status
      // @placeholder _deadline: Int = 50         Payment deadline
      //   @placeholder $amount: Int
         @placeholder $head: Byte                 

      // invalid cases
      // test: Int                                no placeholder keyword
      // test: Int // @placeholder                invalid placeholder
      // test: Int @placeholder                   invalid placeholder
      // @placeholder test                        invalid placeholder, no type
    `;

    expect(extractPlaceholders(script)).toEqual([
      { name: "userId", type: "Coll[Byte]", value: undefined, description: "User ID" },
      { name: "isActive", type: "Boolean", value: "false", description: "User active status" },
      { name: "_deadline", type: "Int", value: "50", description: "Payment deadline" },
      { name: "$amount", type: "Int", value: undefined, description: "" },
      { name: "$head", type: "Byte", value: undefined, description: "" }
    ]);
  });

  it("Should extract placeholders from inline code comments", () => {
    const lines = `
      // valid cases
      val userId: Coll[Byte] = userId //   @placeholder User ID
      val isActive: Boolean = $active //   @placeholder
      val deadline: Int = _deadline //     @placeholder     Payment deadline

      // invalid cases
      val _deadline: Int = 50 //           Payment deadline" // should be ignored, @placeholder it not present
    `;

    expect(extractPlaceholders(lines)).toEqual([
      { name: "userId", type: "Coll[Byte]", description: "User ID" },
      { name: "$active", type: "Boolean", description: "" },
      { name: "_deadline", type: "Int", description: "Payment deadline" }
    ]);
  });
});

describe("line splitting", () => {
  it("Should split lines by statement", () => {
    const script = `
         // This is a comment
         val x: Int = 10; val y: Int = 20
         val z: Int = x + y
   

         // Another comment
         val test = if (z > 0) {
         1
         } else { 2 }
      `;

    const expectedLines = [
      "// This is a comment",
      "val x: Int = 10",
      "val y: Int = 20",
      "val z: Int = x + y",
      "// Another comment",
      "val test = if (z > 0) {",
      "1",
      "} else { 2 }"
    ];

    expect(splitSource(script)).toEqual(expectedLines);
  });
});
