import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("menampilkan label status dikenal", () => {
    render(<StatusBadge value="MENUNGGU_PEMBAYARAN" />);
    expect(screen.getByText("Menunggu pembayaran")).toBeInTheDocument();
  });

  it("menampilkan fallback netral untuk enum baru", () => {
    render(<StatusBadge value="STATUS_BARU" />);
    expect(screen.getByText("STATUS BARU")).toBeInTheDocument();
  });
});
