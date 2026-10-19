import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Photo from "./Photo";

const SRC = "https://cdn.contoh.id/foto.jpg";

describe("<Photo />", () => {
  it("memuat gambar secara lazy dan async secara bawaan", () => {
    render(<Photo src={SRC} alt="Ban" />);
    const img = screen.getByRole("img", { name: "Ban" });
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
  });

  it("priority (gambar hero) dimuat segera, tidak lazy", () => {
    render(<Photo src={SRC} alt="Hero" priority />);
    expect(screen.getByRole("img", { name: "Hero" })).toHaveAttribute("loading", "eager");
  });

  it("meneruskan width, height, srcSet, dan sizes ke <img>", () => {
    render(<Photo src={SRC} alt="Ban" width={600} height={400} srcSet="/a-400.webp 400w, /a-800.webp 800w" sizes="50vw" />);
    const img = screen.getByRole("img", { name: "Ban" });
    expect(img).toHaveAttribute("width", "600");
    expect(img).toHaveAttribute("height", "400");
    expect(img).toHaveAttribute("srcset", "/a-400.webp 400w, /a-800.webp 800w");
    expect(img).toHaveAttribute("sizes", "50vw");
  });

  it("tanpa src / URL placeholder dummy: tampil blok placeholder berlabel, bukan <img>", () => {
    const { container, rerender } = render(<Photo src={null} alt="Kosong" />);
    expect(screen.getByRole("img", { name: "Kosong" }).tagName).toBe("DIV");

    rerender(<Photo src="https://placehold.co/600x600?text=Ban" alt="Dummy" />);
    expect(screen.getByRole("img", { name: "Dummy" }).tagName).toBe("DIV");
    expect(container.querySelector("img")).toBeNull();
  });

  it("gambar gagal dimuat -> placeholder; src baru yang valid dicoba lagi (tidak menempel)", () => {
    const { container, rerender } = render(<Photo src={SRC} alt="Ban" />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(screen.getByRole("img", { name: "Ban" }).tagName).toBe("DIV");

    rerender(<Photo src="https://cdn.contoh.id/baru.jpg" alt="Ban" />);
    expect(screen.getByRole("img", { name: "Ban" }).tagName).toBe("IMG");
  });

  it("sources merender <picture> dengan <source> berurutan dan <img> sebagai fallback", () => {
    const { container } = render(
      <Photo
        src="/a.jpg"
        alt="Ban"
        sources={[
          { type: "image/avif", srcSet: "/a.avif" },
          { type: "image/webp", srcSet: "/a.webp" },
        ]}
      />
    );
    const types = Array.from(container.querySelectorAll("picture > source")).map((s) => s.getAttribute("type"));
    expect(types).toEqual(["image/avif", "image/webp"]);
    expect(container.querySelector("picture > img")).toHaveAttribute("src", "/a.jpg");
  });
});
