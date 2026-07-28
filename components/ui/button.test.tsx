import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
  it("should render with label", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });
});
