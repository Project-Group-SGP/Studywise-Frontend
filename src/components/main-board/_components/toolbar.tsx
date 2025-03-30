import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
  Triangle,
  Diamond,
  Hexagon,
  Pentagon,
  Star,
  Shapes,
} from "lucide-react";
import { useState } from "react";
import { ToolButton } from "./tool-button";
import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";
import SvgDownloader from "./svg-download-button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  boardId: string;
}

type ShapeOption = {
  label: string;
  icon: React.ElementType;
  layerType: LayerType;
};

export const Toolbar = ({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canRedo,
  canUndo,
  boardId,
}: ToolbarProps) => {
  const [showShapesPanel, setShowShapesPanel] = useState(false);
  const { initialValues } = useRenameModal();

  // Define shape options in two categories
  const basicShapes: ShapeOption[] = [
    { label: "Rectangle", icon: Square, layerType: LayerType.Reactangle },
    { label: "Ellipse", icon: Circle, layerType: LayerType.Ellipse },
    { label: "Triangle", icon: Triangle, layerType: LayerType.Triangle },
    { label: "Diamond", icon: Diamond, layerType: LayerType.Diamond },
  ];

  const specialShapes: ShapeOption[] = [
    { label: "Star", icon: Star, layerType: LayerType.Star },
    { label: "Pentagon", icon: Pentagon, layerType: LayerType.Pentagon },
    { label: "Hexagon", icon: Hexagon, layerType: LayerType.Hexagon },
  ];

  // Check if any shape is currently active
  const isAnyShapeActive = [...basicShapes, ...specialShapes].some(
    (shape) =>
      canvasState.mode === CanvasMode.Inserting &&
      canvasState.layerType === shape.layerType
  );

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-2 flex flex-col gap-y-4">
      <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md">
        <ToolButton
          lable="Select"
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.Resizing ||
            canvasState.mode === CanvasMode.Pressing
          }
        />
        <ToolButton
          lable="Text"
          icon={Type}
          onClick={() => {
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            });
            setShowShapesPanel(false);
          }}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />
        <ToolButton
          lable="Sticky note"
          icon={StickyNote}
          onClick={() => {
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            });
            setShowShapesPanel(false);
          }}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
        />

        {/* Shapes toggle button */}
        <ToolButton
          lable="Shapes"
          icon={Shapes}
          onClick={() => {
            setShowShapesPanel(!showShapesPanel);
          }}
          
          isActive={showShapesPanel || isAnyShapeActive}
        />

        <ToolButton
          lable="Pen"
          icon={Pencil}
          onClick={() => {
            setCanvasState({
              mode: CanvasMode.Pencil,
            });
            setShowShapesPanel(false);
          }}
          isActive={canvasState.mode === CanvasMode.Pencil}
        />
        <SvgDownloader
          svgId="mySvg"
          fileName={`${initialValues.title}.svg`}
          buttonText="Download SVG Image"
        />
      </div>

      {/* Shapes panel - appears to the right of the toolbar */}
      {showShapesPanel && (
        <div className="absolute left-14 top-20 bg-white p-3 rounded-md shadow-md z-50 min-w-[120px] py-0">
          {/* Basic shapes row */}
          <div className="flex mb-4 justify-center gap-2 mt-3">
            {basicShapes.map((shape) => (
              <div
                key={shape.label}
                className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
                  canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === shape.layerType
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    //@ts-ignore
                    layerType: shape.layerType,
                  });
                  setShowShapesPanel(false); // Close panel after selection
                }}
              >
                <shape.icon size={18} />
              </div>
            ))}
          </div>

          {/* Special shapes row */}
          <div className="flex justify-center gap-2 mb-3">
            {specialShapes.map((shape) => (
              <div
                key={shape.label}
                className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer ${
                  canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === shape.layerType
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    //@ts-ignore
                    layerType: shape.layerType,
                  });
                  setShowShapesPanel(false); // Close panel after selection
                }}
              >
                <shape.icon size={18} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ToolButton
          lable="Undo"
          icon={Undo2}
          onClick={undo}
          isActive={false}
          isDisabled={!canUndo}
        />
        <ToolButton
          lable="Redo"
          icon={Redo2}
          onClick={redo}
          isActive={false}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 left-2 flex
    flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md"
    />
  );
};
