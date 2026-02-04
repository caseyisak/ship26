'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import type {
  SectionStyleTile,
  SectionStyleTileId,
} from '@/lib/section-style-types';
import { cn } from '@/lib/utils';

interface SectionGridCanvasProps {
  tiles: SectionStyleTile[];
  gridColumns: number;
  gridRows: number;
  onTilesChange: (tiles: SectionStyleTile[]) => void;
  onGridRowsChange: (rows: number) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface DragState {
  tileId: SectionStyleTileId | null;
  type: 'move' | 'resize' | null;
  startX: number;
  startY: number;
  startCol: number;
  startRow: number;
  startColSpan: number;
  startRowSpan: number;
  resizeHandle: ResizeHandle | null;
}

const MAX_CELL_SIZE = 56; // Base size for larger screens

/** Tile colors by type */
const TILE_COLORS: Record<
  SectionStyleTileId,
  { bg: string; border: string; text: string; label: string }
> = {
  content: {
    bg: 'bg-teal-400',
    border: 'border-teal-500',
    text: 'text-slate-900',
    label: 'Content',
  },
  media: {
    bg: 'bg-blue-400',
    border: 'border-blue-500',
    text: 'text-slate-900',
    label: 'Media',
  },
  background: {
    bg: 'bg-slate-600',
    border: 'border-slate-500',
    text: 'text-white',
    label: 'Background',
  },
};

export function SectionGridCanvas({
  tiles,
  gridColumns,
  gridRows,
  onTilesChange,
  onGridRowsChange,
}: SectionGridCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(MAX_CELL_SIZE);
  const gapRef = useRef(4);
  const isDraggingRef = useRef(false);
  const [cellSize, setCellSize] = useState(MAX_CELL_SIZE);
  const [gap, setGap] = useState(4);
  const [activeTileId, setActiveTileId] = useState<SectionStyleTileId | null>(
    null,
  );
  const [dragState, setDragState] = useState<DragState>({
    tileId: null,
    type: null,
    startX: 0,
    startY: 0,
    startCol: 1,
    startRow: 1,
    startColSpan: 1,
    startRowSpan: 1,
    resizeHandle: null,
  });
  const [previewPosition, setPreviewPosition] = useState<{
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
  } | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate responsive cell size using CSS-based approach instead of ResizeObserver
  // This prevents feedback loops where grid size changes trigger container resize
  useEffect(() => {
    const updateCellSize = () => {
      // Skip updates during drag operations to prevent feedback loop
      if (isDraggingRef.current) return;

      const container = containerRef.current;
      if (!container) return;

      // Account for container padding (p-2 = 8px on each side = 16px total)
      const containerPadding = 16; // p-2 = 0.5rem = 8px * 2 sides
      const containerWidth =
        container.getBoundingClientRect().width - containerPadding;
      const baseCellSize =
        containerWidth < 500
          ? (containerWidth / gridColumns) * 0.95 // Scale down for small screens
          : Math.min(MAX_CELL_SIZE, containerWidth / gridColumns);
      const newGap = baseCellSize * 0.07;

      // Only update if cell size changed significantly (threshold: 1px)
      // This prevents micro-adjustments from triggering layout changes
      const sizeDiff = Math.abs(cellSizeRef.current - baseCellSize);
      if (sizeDiff > 1) {
        cellSizeRef.current = baseCellSize;
        gapRef.current = newGap;
        setCellSize(baseCellSize);
        setGap(newGap);
      }
    };

    // Initial calculation
    updateCellSize();

    // Use a debounced window resize listener instead of ResizeObserver
    // This avoids the feedback loop since window resize is independent of grid size
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCellSize, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [gridColumns]);

  // Auto-adjust tiles when gridRows decreases
  // Use a ref to prevent infinite loops
  const prevGridRowsRef = useRef(gridRows);
  useEffect(() => {
    // Only adjust if gridRows decreased (not on initial mount or increase)
    if (gridRows >= prevGridRowsRef.current) {
      prevGridRowsRef.current = gridRows;
      return;
    }
    prevGridRowsRef.current = gridRows;

    const needsAdjustment = tiles.some(
      (t) => t.rowSpan > gridRows || t.gridRow + t.rowSpan - 1 > gridRows,
    );
    if (needsAdjustment) {
      const adjustedTiles = tiles.map((t) => {
        const maxRowSpan = gridRows - t.gridRow + 1;
        return {
          ...t,
          rowSpan: Math.min(t.rowSpan, Math.max(1, maxRowSpan)),
        };
      });
      onTilesChange(adjustedTiles);
    }
  }, [gridRows, tiles, onTilesChange]);

  // Reset activeTileId when background tile becomes invisible
  useEffect(() => {
    const backgroundTile = tiles.find((t) => t.id === 'background');
    if (
      activeTileId === 'background' &&
      (!backgroundTile || backgroundTile.visible === false)
    ) {
      setActiveTileId(null);
    }
  }, [tiles, activeTileId]);

  // ESC key handler to reset active tile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTileId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get occupied cells map (exclude background from collision detection)
  const getOccupiedCells = useCallback(
    (excludeTileId?: SectionStyleTileId) => {
      const occupied = new Set<string>();
      tiles.forEach((tile) => {
        // Background doesn't occupy cells for collision purposes
        if (tile.id === 'background') return;
        if (tile.id === excludeTileId) return;
        if (tile.visible === false) return;
        for (let c = tile.gridCol; c < tile.gridCol + tile.colSpan; c++) {
          for (let r = tile.gridRow; r < tile.gridRow + tile.rowSpan; r++) {
            occupied.add(`${c}-${r}`);
          }
        }
      });
      return occupied;
    },
    [tiles],
  );

  // Check if position is valid (within bounds and no overlap for content/media)
  const isValidPosition = useCallback(
    (
      col: number,
      row: number,
      colSpan: number,
      rowSpan: number,
      tileId: SectionStyleTileId,
    ) => {
      // Check bounds
      if (col < 1 || row < 1) return false;
      if (col + colSpan - 1 > gridColumns || row + rowSpan - 1 > gridRows)
        return false;

      // Background can overlap anything
      if (tileId === 'background') return true;

      // Check overlap for content and media
      const occupied = getOccupiedCells(tileId);
      for (let c = col; c < col + colSpan; c++) {
        for (let r = row; r < row + rowSpan; r++) {
          if (occupied.has(`${c}-${r}`)) return false;
        }
      }
      return true;
    },
    [gridColumns, gridRows, getOccupiedCells],
  );

  // Convert pixel position to grid position
  const pixelToGrid = useCallback(
    (x: number, y: number) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return { col: 1, row: 1 };

      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
      const currentGap = gapRef.current;

      // Calculate cell size based on current canvas dimensions
      const cellWidth =
        (canvasWidth - (gridColumns - 1) * currentGap) / gridColumns;
      const cellHeight =
        (canvasHeight - (gridRows - 1) * currentGap) / gridRows;

      const col = Math.max(
        1,
        Math.min(gridColumns, Math.round(x / (cellWidth + currentGap)) + 1),
      );
      const row = Math.max(
        1,
        Math.min(gridRows, Math.round(y / (cellHeight + currentGap)) + 1),
      );
      return { col, row };
    },
    [gridColumns, gridRows],
  );

  // Handle mouse down on tile (for moving)
  const handleTileMouseDown = (
    e: React.MouseEvent,
    tileId: SectionStyleTileId,
  ) => {
    if ((e.target as HTMLElement).dataset.resize) return;
    e.preventDefault();
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || tile.visible === false) return;

    isDraggingRef.current = true;
    setActiveTileId(tileId);
    setDragState({
      tileId,
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      startCol: tile.gridCol,
      startRow: tile.gridRow,
      startColSpan: tile.colSpan,
      startRowSpan: tile.rowSpan,
      resizeHandle: null,
    });
  };

  // Handle mouse down on resize handle
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    tileId: SectionStyleTileId,
    handle: ResizeHandle,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || tile.visible === false) return;

    isDraggingRef.current = true;
    setActiveTileId(null); // Reset active tile on resize
    setDragState({
      tileId,
      type: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      startCol: tile.gridCol,
      startRow: tile.gridRow,
      startColSpan: tile.colSpan,
      startRowSpan: tile.rowSpan,
      resizeHandle: handle,
    });
  };

  // Handle mouse move and mouse up
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.tileId || !dragState.type) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const relX = e.clientX - canvasRect.left;
      const relY = e.clientY - canvasRect.top;

      if (dragState.type === 'move') {
        const canvasWidth = canvasRect.width;
        const canvasHeight = canvasRect.height;
        const currentGap = gapRef.current;
        const cellWidth =
          (canvasWidth - (gridColumns - 1) * currentGap) / gridColumns;
        const cellHeight =
          (canvasHeight - (gridRows - 1) * currentGap) / gridRows;

        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        const deltaCols = Math.round(deltaX / (cellWidth + currentGap));
        const deltaRows = Math.round(deltaY / (cellHeight + currentGap));

        const newCol = Math.max(
          1,
          Math.min(
            gridColumns - dragState.startColSpan + 1,
            dragState.startCol + deltaCols,
          ),
        );
        const newRow = Math.max(
          1,
          Math.min(
            gridRows - dragState.startRowSpan + 1,
            dragState.startRow + deltaRows,
          ),
        );

        // Only update if position actually changed to prevent unnecessary re-renders
        if (
          !previewPosition ||
          previewPosition.col !== newCol ||
          previewPosition.row !== newRow
        ) {
          const newPreview = {
            col: newCol,
            row: newRow,
            colSpan: dragState.startColSpan,
            rowSpan: dragState.startRowSpan,
          };
          setPreviewPosition(newPreview);

          // Update tiles in real-time for live preview (debounced but frequent)
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            if (
              isValidPosition(
                newPreview.col,
                newPreview.row,
                newPreview.colSpan,
                newPreview.rowSpan,
                dragState.tileId!,
              )
            ) {
              onTilesChange(
                tiles.map((tile) =>
                  tile.id === dragState.tileId
                    ? {
                        ...tile,
                        gridCol: newPreview.col,
                        gridRow: newPreview.row,
                        colSpan: newPreview.colSpan,
                        rowSpan: newPreview.rowSpan,
                      }
                    : tile,
                ),
              );
            }
          }, 30); // Reduced debounce to 30ms for near real-time updates
        }
      } else if (dragState.type === 'resize') {
        const { col, row } = pixelToGrid(relX, relY);
        let newCol = dragState.startCol;
        let newRow = dragState.startRow;
        let newColSpan = dragState.startColSpan;
        let newRowSpan = dragState.startRowSpan;

        const handle = dragState.resizeHandle;

        // Handle all resize directions
        if (handle === 'nw') {
          // Top-left corner: adjust both col/row and spans
          const newTopRow = Math.max(1, row);
          const newLeftCol = Math.max(1, col);
          const rowDiff = dragState.startRow - newTopRow;
          const colDiff = dragState.startCol - newLeftCol;
          newRow = newTopRow;
          newCol = newLeftCol;
          newRowSpan = dragState.startRowSpan + rowDiff;
          newColSpan = dragState.startColSpan + colDiff;
        } else if (handle === 'ne') {
          // Top-right corner: adjust row and colSpan
          const newTopRow = Math.max(1, row);
          const rowDiff = dragState.startRow - newTopRow;
          newRow = newTopRow;
          newRowSpan = dragState.startRowSpan + rowDiff;
          newColSpan = Math.max(
            1,
            Math.min(
              gridColumns - dragState.startCol + 1,
              col - dragState.startCol + 1,
            ),
          );
        } else if (handle === 'sw') {
          // Bottom-left corner: adjust col and rowSpan
          const newLeftCol = Math.max(1, col);
          const colDiff = dragState.startCol - newLeftCol;
          newCol = newLeftCol;
          newColSpan = dragState.startColSpan + colDiff;
          newRowSpan = Math.max(
            1,
            Math.min(
              gridRows - dragState.startRow + 1,
              row - dragState.startRow + 1,
            ),
          );
        } else if (handle === 'se') {
          // Bottom-right corner: adjust spans only
          newColSpan = Math.max(
            1,
            Math.min(
              gridColumns - dragState.startCol + 1,
              col - dragState.startCol + 1,
            ),
          );
          newRowSpan = Math.max(
            1,
            Math.min(
              gridRows - dragState.startRow + 1,
              row - dragState.startRow + 1,
            ),
          );
        } else if (handle === 'n') {
          // Top edge: adjust row and rowSpan
          const newTopRow = Math.max(1, row);
          const rowDiff = dragState.startRow - newTopRow;
          newRow = newTopRow;
          newRowSpan = dragState.startRowSpan + rowDiff;
        } else if (handle === 's') {
          // Bottom edge: adjust rowSpan only
          newRowSpan = Math.max(
            1,
            Math.min(
              gridRows - dragState.startRow + 1,
              row - dragState.startRow + 1,
            ),
          );
        } else if (handle === 'e') {
          // Right edge: adjust colSpan only
          newColSpan = Math.max(
            1,
            Math.min(
              gridColumns - dragState.startCol + 1,
              col - dragState.startCol + 1,
            ),
          );
        } else if (handle === 'w') {
          // Left edge: adjust col and colSpan
          const newLeftCol = Math.max(1, col);
          const colDiff = dragState.startCol - newLeftCol;
          newCol = newLeftCol;
          newColSpan = dragState.startColSpan + colDiff;
        }

        // Clamp spans to valid ranges
        newColSpan = Math.max(
          1,
          Math.min(gridColumns - newCol + 1, newColSpan),
        );
        newRowSpan = Math.max(1, Math.min(gridRows - newRow + 1, newRowSpan));

        // Ensure tile doesn't go out of bounds
        if (newCol + newColSpan - 1 > gridColumns) {
          newColSpan = gridColumns - newCol + 1;
        }
        if (newRow + newRowSpan - 1 > gridRows) {
          newRowSpan = gridRows - newRow + 1;
        }

        // Only update if position actually changed to prevent unnecessary re-renders
        if (
          !previewPosition ||
          previewPosition.col !== newCol ||
          previewPosition.row !== newRow ||
          previewPosition.colSpan !== newColSpan ||
          previewPosition.rowSpan !== newRowSpan
        ) {
          const newPreview = {
            col: newCol,
            row: newRow,
            colSpan: newColSpan,
            rowSpan: newRowSpan,
          };
          setPreviewPosition(newPreview);

          // Update tiles in real-time for live preview (debounced but frequent)
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            if (
              isValidPosition(
                newPreview.col,
                newPreview.row,
                newPreview.colSpan,
                newPreview.rowSpan,
                dragState.tileId!,
              )
            ) {
              onTilesChange(
                tiles.map((tile) =>
                  tile.id === dragState.tileId
                    ? {
                        ...tile,
                        gridCol: newPreview.col,
                        gridRow: newPreview.row,
                        colSpan: newPreview.colSpan,
                        rowSpan: newPreview.rowSpan,
                      }
                    : tile,
                ),
              );
            }
          }, 30); // Reduced debounce to 30ms for near real-time updates
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;

      // Clear any pending debounced updates
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = null;
      }

      // Final update on mouse up to ensure latest position is saved
      if (dragState.tileId && previewPosition) {
        const valid = isValidPosition(
          previewPosition.col,
          previewPosition.row,
          previewPosition.colSpan,
          previewPosition.rowSpan,
          dragState.tileId,
        );

        if (valid) {
          onTilesChange(
            tiles.map((tile) =>
              tile.id === dragState.tileId
                ? {
                    ...tile,
                    gridCol: previewPosition.col,
                    gridRow: previewPosition.row,
                    colSpan: previewPosition.colSpan,
                    rowSpan: previewPosition.rowSpan,
                  }
                : tile,
            ),
          );
        }
      }

      setDragState({
        tileId: null,
        type: null,
        startX: 0,
        startY: 0,
        startCol: 1,
        startRow: 1,
        startColSpan: 1,
        startRowSpan: 1,
        resizeHandle: null,
      });
      setPreviewPosition(null);
    };

    if (dragState.tileId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [
    dragState,
    tiles,
    onTilesChange,
    previewPosition,
    isValidPosition,
    gridColumns,
    gridRows,
    pixelToGrid,
  ]);

  const gridWidth = gridColumns * cellSize + (gridColumns - 1) * gap;
  const gridHeight = gridRows * cellSize + (gridRows - 1) * gap;

  // Sort tiles so background renders first (underneath), unless active
  const sortedTiles = [...tiles].sort((a, b) => {
    if (activeTileId === a.id) return 1;
    if (activeTileId === b.id) return -1;
    if (a.id === 'background') return -1;
    if (b.id === 'background') return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {/* Rows selector */}
      <div
        className="flex items-center gap-3 rounded-[var(--border-radius-medium)] p-2"
        style={{ backgroundColor: 'var(--gray-100)' }}
      >
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--gray-700)' }}
        >
          Rows:
        </span>
        <div className="flex items-center gap-1">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onGridRowsChange(n)}
              className={cn(
                'h-7 w-7 rounded-[var(--border-radius-small)] text-xs font-medium transition-colors',
                gridRows === n
                  ? 'bg-[var(--blue-500)] text-white'
                  : 'border border-[var(--gray-300)] bg-white text-[var(--gray-700)] hover:bg-[var(--gray-100)]',
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs" style={{ color: 'var(--gray-500)' }}>
          Drag to move. Drag corners/edges to resize.
        </span>
      </div>

      {/* Grid canvas */}
      <div
        ref={containerRef}
        className="flex w-full items-center justify-center rounded-[var(--border-radius-medium)] p-2"
        style={{
          backgroundColor: 'var(--gray-800)',
          borderColor: 'var(--gray-700)',
          minHeight: gridHeight,
        }}
      >
        <div
          ref={canvasRef}
          className="relative grid overflow-hidden"
          style={{
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            gridTemplateColumns: `repeat(${gridColumns}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cellSize}px)`,
            gap: `${gap}px`,
          }}
        >
          {/* Grid background cells */}
          {Array.from({ length: gridRows }).map((_, rowIdx) =>
            Array.from({ length: gridColumns }).map((_, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="box-border rounded border-2 border-dashed"
                style={{
                  borderColor: 'var(--gray-600)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  boxSizing: 'border-box',
                }}
              />
            )),
          )}

          {/* Preview position indicator */}
          {previewPosition && dragState.tileId && (
            <div
              className={cn(
                'rounded border-2',
                isValidPosition(
                  previewPosition.col,
                  previewPosition.row,
                  previewPosition.colSpan,
                  previewPosition.rowSpan,
                  dragState.tileId,
                )
                  ? 'border-[var(--blue-500)] bg-[var(--blue-500)]/20'
                  : 'border-red-500 bg-red-500/20',
              )}
              style={{
                gridColumn: `${previewPosition.col} / span ${previewPosition.colSpan}`,
                gridRow: `${previewPosition.row} / span ${previewPosition.rowSpan}`,
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            />
          )}

          {/* Tiles */}
          {sortedTiles.map((tile) => {
            if (tile.visible === false) return null;
            const colors = TILE_COLORS[tile.id];
            const isDragging = dragState.tileId === tile.id;
            const isActive = activeTileId === tile.id;

            return (
              <div
                key={tile.id}
                className={cn(
                  'relative box-border flex cursor-move flex-col items-center justify-center rounded border-2 p-1 transition-shadow select-none',
                  colors.bg,
                  colors.border,
                  isDragging
                    ? 'z-50 opacity-30 shadow-2xl'
                    : isActive
                      ? 'z-50 opacity-90 shadow-xl'
                      : tile.id === 'background'
                        ? 'z-0 opacity-60'
                        : 'z-10 shadow-md hover:shadow-lg',
                )}
                style={{
                  gridColumn: `${tile.gridCol} / span ${tile.colSpan}`,
                  gridRow: `${tile.gridRow} / span ${tile.rowSpan}`,
                  boxSizing: 'border-box',
                }}
                onMouseDown={(e) => handleTileMouseDown(e, tile.id)}
              >
                <span
                  className={cn(
                    'text-center text-xs font-semibold',
                    colors.text,
                  )}
                >
                  {colors.label}
                </span>

                {/* Resize handles - all 8 directions */}
                {!isDragging && (
                  <>
                    {/* Corners */}
                    {/* NW */}
                    <div
                      data-resize="nw"
                      className="absolute top-0 left-0 h-3 w-3 cursor-nw-resize rounded-br bg-slate-900 opacity-0 transition-opacity hover:opacity-100"
                      style={{ left: -1, top: -1 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'nw')
                      }
                    />
                    {/* NE */}
                    <div
                      data-resize="ne"
                      className="absolute top-0 right-0 h-3 w-3 cursor-ne-resize rounded-bl bg-slate-900 opacity-0 transition-opacity hover:opacity-100"
                      style={{ right: -1, top: -1 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'ne')
                      }
                    />
                    {/* SW */}
                    <div
                      data-resize="sw"
                      className="absolute bottom-0 left-0 h-3 w-3 cursor-sw-resize rounded-tr bg-slate-900 opacity-0 transition-opacity hover:opacity-100"
                      style={{ bottom: -1, left: -1 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'sw')
                      }
                    />
                    {/* SE */}
                    <div
                      data-resize="se"
                      className="absolute right-0 bottom-0 h-3 w-3 cursor-se-resize rounded-tl bg-slate-900 opacity-0 transition-opacity hover:opacity-100"
                      style={{ bottom: -1, right: -1 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'se')
                      }
                    />

                    {/* Edges */}
                    {/* N */}
                    <div
                      data-resize="n"
                      className="absolute top-0 left-1/2 h-1.5 w-6 -translate-x-1/2 cursor-n-resize rounded-b bg-slate-900/50 opacity-0 transition-opacity hover:opacity-100"
                      style={{ top: -2 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'n')
                      }
                    />
                    {/* S */}
                    <div
                      data-resize="s"
                      className="absolute bottom-0 left-1/2 h-1.5 w-6 -translate-x-1/2 cursor-s-resize rounded-t bg-slate-900/50 opacity-0 transition-opacity hover:opacity-100"
                      style={{ bottom: -2 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 's')
                      }
                    />
                    {/* E */}
                    <div
                      data-resize="e"
                      className="absolute top-1/2 right-0 h-6 w-1.5 -translate-y-1/2 cursor-e-resize rounded-l bg-slate-900/50 opacity-0 transition-opacity hover:opacity-100"
                      style={{ right: -2 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'e')
                      }
                    />
                    {/* W */}
                    <div
                      data-resize="w"
                      className="absolute top-1/2 left-0 h-6 w-1.5 -translate-y-1/2 cursor-w-resize rounded-r bg-slate-900/50 opacity-0 transition-opacity hover:opacity-100"
                      style={{ left: -2 }}
                      onMouseDown={(e) =>
                        handleResizeMouseDown(e, tile.id, 'w')
                      }
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
