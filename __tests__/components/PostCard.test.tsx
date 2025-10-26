import React from "react";
import { render, screen } from "@testing-library/react";
import PostCard from "@/components/blog/PostCard";
import { Post } from "@/lib/supabase";

const mockPost: Post = {
  id: "1",
  title: "Test Post",
  slug: "test-post",
  excerpt: "Test excerpt",
  content: "Test content",
  cover_image: null,
  published: true,
  featured: false,
  tags: ["test"],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("PostCard", () => {
  it("renders post title", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Test Post")).toBeInTheDocument();
  });

  it("renders post excerpt", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Test excerpt")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("#test")).toBeInTheDocument();
  });
});
