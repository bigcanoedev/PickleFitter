"use client";

import { useState, useMemo } from "react";
import { PaddleScore } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface PaddleRankingsProps {
  allRanked: PaddleScore[];
  onSelectPaddle?: (paddle: PaddleScore) => void;
}

type SortKey = "match" | "price" | "swing_weight" | "twist_weight" | "power_mph" | "spin_rpm";

const PAGE_SIZE = 25;

export function PaddleRankings({ allRanked, onSelectPaddle }: PaddleRankingsProps) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState<SortKey>("match");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterShape, setFilterShape] = useState("");
  const [filterBuild, setFilterBuild] = useState("");

  const brands = useMemo(() => {
    const set = new Set(allRanked.map((p) => p.brand));
    return Array.from(set).sort();
  }, [allRanked]);

  const shapes = useMemo(() => {
    const set = new Set(allRanked.map((p) => p.shape).filter(Boolean));
    return Array.from(set).sort();
  }, [allRanked]);

  const builds = useMemo(() => {
    const set = new Set(allRanked.map((p) => p.build_style).filter(Boolean));
    return Array.from(set).sort();
  }, [allRanked]);

  const sorted = useMemo(() => {
    let list = [...allRanked];

    // Filter
    if (filterBrand) list = list.filter((p) => p.brand === filterBrand);
    if (filterShape) list = list.filter((p) => p.shape === filterShape);
    if (filterBuild) list = list.filter((p) => p.build_style === filterBuild);

    // Sort
    const dir = sortAsc ? 1 : -1;
    list.sort((a, b) => {
      const av = getSortValue(a, sortBy);
      const bv = getSortValue(b, sortBy);
      return (av - bv) * dir;
    });

    return list;
  }, [allRanked, sortBy, sortAsc, filterBrand, filterShape, filterBuild]);

  const visible = sorted.slice(0, visibleCount);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortBy !== key) return "\u2195";
    return sortAsc ? "\u2191" : "\u2193";
  };

  if (!expanded) {
    return (
      <div className="text-center">
        <Button variant="outline" size="lg" onClick={() => setExpanded(true)}>
          View Full Rankings ({allRanked.length} paddles)
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Full Rankings</h2>
        <span className="text-sm text-muted-foreground">
          {sorted.length} paddles
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filterBrand}
          onChange={(e) => { setFilterBrand(e.target.value); setVisibleCount(PAGE_SIZE); }}
          className="px-3 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={filterShape}
          onChange={(e) => { setFilterShape(e.target.value); setVisibleCount(PAGE_SIZE); }}
          className="px-3 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="">All shapes</option>
          {shapes.map((s) => (
            <option key={s} value={s!}>{s}</option>
          ))}
        </select>
        <select
          value={filterBuild}
          onChange={(e) => { setFilterBuild(e.target.value); setVisibleCount(PAGE_SIZE); }}
          className="px-3 py-1.5 text-sm border rounded-md bg-background"
        >
          <option value="">All builds</option>
          {builds.map((b) => (
            <option key={b} value={b!}>{b}</option>
          ))}
        </select>
        {(filterBrand || filterShape || filterBuild) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterBrand(""); setFilterShape(""); setFilterBuild(""); }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2 font-medium w-8">#</th>
              <th className="text-left px-3 py-2 font-medium">Paddle</th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary"
                onClick={() => toggleSort("match")}
              >
                Match {sortIcon("match")}
              </th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary"
                onClick={() => toggleSort("price")}
              >
                Price {sortIcon("price")}
              </th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary hidden md:table-cell"
                onClick={() => toggleSort("swing_weight")}
              >
                SW {sortIcon("swing_weight")}
              </th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary hidden md:table-cell"
                onClick={() => toggleSort("twist_weight")}
              >
                TW {sortIcon("twist_weight")}
              </th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary hidden lg:table-cell"
                onClick={() => toggleSort("power_mph")}
              >
                Power {sortIcon("power_mph")}
              </th>
              <th
                className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary hidden lg:table-cell"
                onClick={() => toggleSort("spin_rpm")}
              >
                Spin {sortIcon("spin_rpm")}
              </th>
              <th className="text-center px-3 py-2 font-medium hidden lg:table-cell">Shape</th>
              <th className="text-center px-3 py-2 font-medium hidden xl:table-cell">Core</th>
              <th className="px-3 py-2 font-medium w-20"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((paddle, i) => {
              const globalRank = sorted.indexOf(paddle) + 1;
              return (
                <tr
                  key={paddle.id}
                  className={`border-t hover:bg-muted/50 ${i < 3 ? "bg-primary/5" : ""}`}
                >
                  <td className="px-3 py-2 text-muted-foreground">{globalRank}</td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{paddle.name}</div>
                    <div className="text-xs text-muted-foreground">{paddle.brand}</div>
                  </td>
                  <td className="text-right px-3 py-2">
                    <span
                      className={`font-bold ${
                        paddle.matchPercentage >= 90
                          ? "text-primary"
                          : paddle.matchPercentage >= 75
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {paddle.matchPercentage}%
                    </span>
                  </td>
                  <td className="text-right px-3 py-2">${paddle.price}</td>
                  <td className="text-right px-3 py-2 hidden md:table-cell">{paddle.swing_weight}</td>
                  <td className="text-right px-3 py-2 hidden md:table-cell">{paddle.twist_weight}</td>
                  <td className="text-right px-3 py-2 hidden lg:table-cell">
                    {paddle.power_mph ? `${paddle.power_mph}` : "—"}
                  </td>
                  <td className="text-right px-3 py-2 hidden lg:table-cell">
                    {paddle.spin_rpm || paddle.rpm ? `${paddle.spin_rpm || paddle.rpm}` : "—"}
                  </td>
                  <td className="text-center px-3 py-2 hidden lg:table-cell">
                    <span className="text-xs">{paddle.shape || "—"}</span>
                  </td>
                  <td className="text-center px-3 py-2 hidden xl:table-cell">
                    <span className="text-xs">{paddle.core_thickness_mm ? `${paddle.core_thickness_mm}mm` : "—"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <a
                        href={paddle.affiliateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Buy
                      </a>
                      {onSelectPaddle && (
                        <>
                          <span className="text-muted-foreground">|</span>
                          <button
                            onClick={() => onSelectPaddle(paddle)}
                            className="text-xs text-muted-foreground hover:text-primary font-medium"
                          >
                            Optimize
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {visibleCount < sorted.length && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            Show more ({Math.min(PAGE_SIZE, sorted.length - visibleCount)} more of {sorted.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

function getSortValue(paddle: PaddleScore, key: SortKey): number {
  switch (key) {
    case "match": return paddle.matchPercentage;
    case "price": return paddle.price;
    case "swing_weight": return paddle.swing_weight;
    case "twist_weight": return paddle.twist_weight;
    case "power_mph": return paddle.power_mph || 0;
    case "spin_rpm": return paddle.spin_rpm || paddle.rpm || 0;
  }
}
