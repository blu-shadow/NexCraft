// ═══════════════════════════════════════════════════════════
//                    DATA TABLE
//   Reusable table: sort, search, pagination, bulk actions
// ═══════════════════════════════════════════════════════════
import { useState, useMemo, useCallback } from "react";

// ── Icons
const SortAsc  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>;
const SortDesc = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;
const SortNone = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 13 12 7 6 13"/><polyline points="18 17 12 11 6 17" opacity="0.4"/></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const FilterIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
const ChevLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const EditIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const EyeIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const RefreshIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const DotsIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>;

// ─────────────────────────────────────────
//   Status Badge helper
// ─────────────────────────────────────────
export const StatusBadge = ({ value, statusMap }) => {
  const s = statusMap?.[value] || { label: value, color: "#8888aa", bg: "rgba(136,136,170,0.12)" };
  return (
    <span style={{
      display     : "inline-flex",
      alignItems  : "center",
      gap         : "5px",
      padding     : "3px 10px",
      background  : s.bg,
      borderRadius: "20px",
      fontSize    : "11.5px",
      fontWeight  : "600",
      color       : s.color,
      letterSpacing: "0.03em",
      fontFamily  : "var(--font-display)",
      whiteSpace  : "nowrap",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
//   DATA TABLE COMPONENT
// ═══════════════════════════════════════════════════════════
/**
 * columns: [{ key, label, sortable, width, render }]
 * data: array of objects
 * onEdit, onDelete, onView: (row) => void
 * actions: custom action array [{ label, icon, onClick, color, condition }]
 * bulkActions: [{ label, icon, onClick }]
 * loading, emptyText, searchable, rowsPerPageOptions
 */
const DataTable = ({
  columns          = [],
  data             = [],
  onEdit           = null,
  onDelete         = null,
  onView           = null,
  actions          = [],
  bulkActions      = [],
  loading          = false,
  emptyText        = "No data found",
  emptyIcon        = "📭",
  searchable       = true,
  searchPlaceholder= "Search...",
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  onRefresh        = null,
  title            = null,
  headerExtra      = null,
}) => {
  const [searchQuery,   setSearchQuery  ] = useState("");
  const [sortKey,       setSortKey      ] = useState(null);
  const [sortDir,       setSortDir      ] = useState("asc");
  const [page,          setPage         ] = useState(1);
  const [rowsPerPage,   setRowsPerPage  ] = useState(defaultRowsPerPage);
  const [selected,      setSelected     ] = useState([]);
  const [openMenuId,    setOpenMenuId   ] = useState(null);

  // ── Sort handler
  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }, [sortKey]);

  // ── Filter + Sort + Paginate
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val || "").toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortDir]);

  const totalPages  = Math.ceil(processedData.length / rowsPerPage);
  const paginatedData = processedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // ── Select all (current page)
  const allSelected = paginatedData.length > 0 &&
    paginatedData.every((row) => selected.includes(row._id || row.id));

  const toggleSelectAll = () => {
    const ids = paginatedData.map((r) => r._id || r.id);
    if (allSelected) {
      setSelected((s) => s.filter((id) => !ids.includes(id)));
    } else {
      setSelected((s) => [...new Set([...s, ...ids])]);
    }
  };

  const toggleRow = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  // ── Skeleton rows
  const SkeletonRows = () => (
    <>
      {Array.from({ length: rowsPerPage }).map((_, i) => (
        <tr key={i}>
          {bulkActions.length > 0 && (
            <td style={tdStyle}><div className="skeleton" style={{ width: "16px", height: "16px", borderRadius: "4px" }} /></td>
          )}
          {columns.map((col) => (
            <td key={col.key} style={tdStyle}>
              <div className="skeleton" style={{ height: "14px", borderRadius: "4px", width: `${40 + Math.random() * 40}%` }} />
            </td>
          ))}
          {(onEdit || onDelete || onView || actions.length > 0) && (
            <td style={tdStyle}><div className="skeleton" style={{ width: "60px", height: "28px", borderRadius: "6px" }} /></td>
          )}
        </tr>
      ))}
    </>
  );

  return (
    <div style={{
      background  : "rgba(16,16,30,0.8)",
      border      : "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      overflow    : "hidden",
      backdropFilter: "blur(10px)",
    }}>
      {/* ── Header */}
      <div style={{
        display       : "flex",
        alignItems    : "center",
        gap           : "12px",
        padding       : "16px 20px",
        borderBottom  : "1px solid rgba(255,255,255,0.06)",
        flexWrap      : "wrap",
      }}>
        {title && (
          <h3 style={{
            fontFamily  : "var(--font-display)",
            fontSize    : "14px",
            fontWeight  : "700",
            color       : "#e8e8f0",
            marginRight : "8px",
            whiteSpace  : "nowrap",
          }}>
            {title}
            <span style={{
              marginLeft  : "8px",
              padding     : "2px 8px",
              background  : "rgba(108,99,255,0.15)",
              borderRadius: "20px",
              fontSize    : "11px",
              color       : "#a78bfa",
              fontWeight  : "600",
            }}>
              {processedData.length}
            </span>
          </h3>
        )}

        {/* Search */}
        {searchable && (
          <div style={{
            display    : "flex",
            alignItems : "center",
            gap        : "8px",
            background : "rgba(255,255,255,0.04)",
            border     : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9px",
            padding    : "0 12px",
            height     : "36px",
            minWidth   : "200px",
            flex       : 1,
            maxWidth   : "320px",
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}><SearchIcon /></span>
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#e8e8f0", fontSize: "13px", fontFamily: "var(--font-body)",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>
                ×
              </button>
            )}
          </div>
        )}

        {headerExtra && <div style={{ marginLeft: "auto" }}>{headerExtra}</div>}

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              ...actionBtnBase,
              background: "rgba(255,255,255,0.04)",
              border    : "1px solid rgba(255,255,255,0.08)",
              color     : "rgba(255,255,255,0.5)",
              marginLeft: headerExtra ? 0 : "auto",
            }}
            title="Refresh"
          >
            <RefreshIcon />
          </button>
        )}

        {/* Bulk action bar */}
        {selected.length > 0 && bulkActions.length > 0 && (
          <div style={{
            display    : "flex",
            alignItems : "center",
            gap        : "8px",
            padding    : "6px 12px",
            background : "rgba(108,99,255,0.12)",
            border     : "1px solid rgba(108,99,255,0.25)",
            borderRadius: "9px",
          }}>
            <span style={{ fontSize: "12px", color: "#a78bfa", fontFamily: "var(--font-display)", fontWeight: "600" }}>
              {selected.length} selected
            </span>
            {bulkActions.map((action, i) => (
              <button
                key={i}
                onClick={() => { action.onClick(selected); setSelected([]); }}
                style={{
                  ...actionBtnBase,
                  background: action.color ? `${action.color}18` : "rgba(239,68,68,0.12)",
                  border    : `1px solid ${action.color || "#ef4444"}30`,
                  color     : action.color || "#ef4444",
                  fontSize  : "12px",
                  gap       : "5px",
                  padding   : "5px 10px",
                }}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width          : "100%",
          borderCollapse : "collapse",
          fontSize       : "13px",
          fontFamily     : "var(--font-body)",
        }}>
          {/* Head */}
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {bulkActions.length > 0 && (
                <th style={{ ...thStyle, width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    style={checkboxStyle}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...thStyle,
                    width   : col.width || "auto",
                    cursor  : col.sortable !== false ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {col.label}
                    {col.sortable !== false && (
                      <span style={{ color: sortKey === col.key ? "#a78bfa" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                        {sortKey === col.key
                          ? (sortDir === "asc" ? <SortAsc /> : <SortDesc />)
                          : <SortNone />
                        }
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {(onEdit || onDelete || onView || actions.length > 0) && (
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length > 0 ? 1 : 0) + 1}
                  style={{ padding: "56px 20px", textAlign: "center" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "36px" }}>{emptyIcon}</span>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", fontFamily: "var(--font-display)" }}>
                      {searchQuery ? `No results for "${searchQuery}"` : emptyText}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{
                          ...actionBtnBase,
                          background: "rgba(108,99,255,0.1)",
                          border    : "1px solid rgba(108,99,255,0.2)",
                          color     : "#a78bfa",
                          padding   : "6px 14px",
                          fontSize  : "12px",
                        }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const id         = row._id || row.id || rowIdx;
                const isSelected = selected.includes(id);
                const isMenuOpen = openMenuId === id;

                return (
                  <tr
                    key={id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background  : isSelected
                        ? "rgba(108,99,255,0.06)"
                        : "transparent",
                      transition  : "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Checkbox */}
                    {bulkActions.length > 0 && (
                      <td style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          style={checkboxStyle}
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((col) => (
                      <td key={col.key} style={{ ...tdStyle, maxWidth: col.width || "200px" }}>
                        {col.render
                          ? col.render(row[col.key], row)
                          : (
                            <span style={{
                              display     : "block",
                              overflow    : "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace  : col.nowrap ? "nowrap" : "normal",
                              color       : "rgba(255,255,255,0.8)",
                            }}>
                              {row[col.key] ?? "—"}
                            </span>
                          )
                        }
                      </td>
                    ))}

                    {/* Actions */}
                    {(onEdit || onDelete || onView || actions.length > 0) && (
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                          {onView && (
                            <button onClick={() => onView(row)} style={{ ...rowActionBtn, color: "#60a5fa" }} title="View">
                              <EyeIcon />
                            </button>
                          )}
                          {onEdit && (
                            <button onClick={() => onEdit(row)} style={{ ...rowActionBtn, color: "#a78bfa" }} title="Edit">
                              <EditIcon />
                            </button>
                          )}
                          {actions.filter((a) => !a.condition || a.condition(row)).map((action, ai) => (
                            <button
                              key={ai}
                              onClick={() => action.onClick(row)}
                              style={{ ...rowActionBtn, color: action.color || "#a78bfa" }}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          ))}
                          {onDelete && (
                            <button onClick={() => onDelete(row)} style={{ ...rowActionBtn, color: "#ef4444" }} title="Delete">
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: Rows per page + Pagination */}
      {!loading && processedData.length > 0 && (
        <div style={{
          display        : "flex",
          alignItems     : "center",
          justifyContent : "space-between",
          padding        : "12px 20px",
          borderTop      : "1px solid rgba(255,255,255,0.06)",
          flexWrap       : "wrap",
          gap            : "10px",
        }}>
          {/* Info + rows per page */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
              {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, processedData.length)} of {processedData.length}
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              style={{
                background  : "rgba(255,255,255,0.06)",
                border      : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "7px",
                color       : "rgba(255,255,255,0.6)",
                fontSize    : "12px",
                padding     : "4px 8px",
                cursor      : "pointer",
                fontFamily  : "var(--font-body)",
                outline     : "none",
              }}
            >
              {rowsPerPageOptions.map((n) => (
                <option key={n} value={n} style={{ background: "#111124" }}>{n} / page</option>
              ))}
            </select>
          </div>

          {/* Page buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              style={{ ...pageBtn, opacity: page === 1 ? 0.35 : 1 }}
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              style={{ ...pageBtn, opacity: page === 1 ? 0.35 : 1 }}
            >
              <ChevLeft />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p;
              if (totalPages <= 5) {
                p = i + 1;
              } else if (page <= 3) {
                p = i + 1;
              } else if (page >= totalPages - 2) {
                p = totalPages - 4 + i;
              } else {
                p = page - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    ...pageBtn,
                    background  : p === page ? "rgba(108,99,255,0.3)" : "transparent",
                    border      : `1px solid ${p === page ? "rgba(108,99,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                    color       : p === page ? "#a78bfa" : "rgba(255,255,255,0.4)",
                    fontWeight  : p === page ? "700" : "400",
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              style={{ ...pageBtn, opacity: page === totalPages ? 0.35 : 1 }}
            >
              <ChevRight />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{ ...pageBtn, opacity: page === totalPages ? 0.35 : 1 }}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared micro styles
const thStyle = {
  padding    : "10px 16px",
  textAlign  : "left",
  fontSize   : "11px",
  fontWeight : "600",
  color      : "rgba(255,255,255,0.35)",
  fontFamily : "var(--font-display)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  whiteSpace : "nowrap",
  background : "rgba(255,255,255,0.02)",
};

const tdStyle = {
  padding    : "12px 16px",
  verticalAlign: "middle",
  color      : "rgba(255,255,255,0.7)",
};

const actionBtnBase = {
  display       : "inline-flex",
  alignItems    : "center",
  justifyContent: "center",
  gap           : "5px",
  padding       : "6px 10px",
  borderRadius  : "8px",
  border        : "none",
  cursor        : "pointer",
  fontFamily    : "var(--font-display)",
  fontSize      : "12px",
  fontWeight    : "500",
  transition    : "all 0.15s",
};

const rowActionBtn = {
  ...actionBtnBase,
  width     : "30px",
  height    : "30px",
  padding   : 0,
  background: "rgba(255,255,255,0.04)",
  border    : "1px solid rgba(255,255,255,0.07)",
  borderRadius: "7px",
};

const checkboxStyle = {
  width        : "15px",
  height       : "15px",
  accentColor  : "#6c63ff",
  cursor       : "pointer",
};

const pageBtn = {
  width         : "30px",
  height        : "30px",
  display       : "flex",
  alignItems    : "center",
  justifyContent: "center",
  background    : "transparent",
  border        : "1px solid rgba(255,255,255,0.08)",
  borderRadius  : "7px",
  color         : "rgba(255,255,255,0.4)",
  fontSize      : "12px",
  fontFamily    : "var(--font-display)",
  cursor        : "pointer",
  transition    : "all 0.15s",
};

export { StatusBadge };
export default DataTable;
