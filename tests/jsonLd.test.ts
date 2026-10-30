import { describe, expect, it } from "bun:test";
import { siteConfig } from "@/config/site";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  hubPageJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "@/lib/seo/jsonLd";

describe("JSON-LD & Schema Helpers", () => {
  it("websiteJsonLd includes @id, license, author and publisher", () => {
    const data = websiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data["@id"]).toBe(`${siteConfig.url}/#website`);
    expect(data.url).toBe(siteConfig.url);
  });
  it("personJsonLd includes @id, jobTitle, and sameAs links", () => {
    const data = personJsonLd();
    expect(data["@type"]).toBe("Person");
    expect(data["@id"]).toBe(`${siteConfig.url}/#author`);
    expect(data.sameAs).toContain(siteConfig.author.github);
  });
  it("breadcrumbJsonLd prepends Home root item if not provided", () => {
    const breadcrumb = breadcrumbJsonLd([
      { name: "Collections", url: `${siteConfig.url}/collections` },
    ]);
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    const items = breadcrumb.itemListElement as {
      "@type": string;
      position: number;
      name: string;
      item: string;
    }[];
    expect(items.length).toBe(2);
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${siteConfig.url}/`,
    });
    expect(items[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Collections",
      item: `${siteConfig.url}/collections`,
    });
  });
  it("faqPageJsonLd creates valid FAQPage schema", () => {
    const faqs = [
      {
        question: "Is Momented free?",
        answer: "Yes, under CC0.",
      },
    ];
    const data = faqPageJsonLd(faqs);
    expect(data["@type"]).toBe("FAQPage");
    const mainEntity = data.mainEntity as {
      "@type": string;
      name: string;
      acceptedAnswer: { "@type": string; text: string };
    }[];
    expect(mainEntity[0].name).toBe("Is Momented free?");
    expect(mainEntity[0].acceptedAnswer.text).toBe("Yes, under CC0.");
  });
  it("hubPageJsonLd creates valid CollectionPage with ItemList", () => {
    const data = hubPageJsonLd({
      title: "Hub Title",
      description: "Hub Description",
      url: `${siteConfig.url}/hub`,
      items: [
        {
          name: "Item 1",
          url: `${siteConfig.url}/item-1`,
          description: "Description 1",
        },
      ],
    });
    expect(data["@type"]).toBe("CollectionPage");
    expect(data.name).toBe("Hub Title");
    const mainEntity = data.mainEntity as {
      "@type": string;
      numberOfItems: number;
      itemListElement: unknown[];
    };
    expect(mainEntity["@type"]).toBe("ItemList");
    expect(mainEntity.numberOfItems).toBe(1);
  });
});
