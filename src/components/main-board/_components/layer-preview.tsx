import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react/suspense";
import React, { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./Path";
import { colotToCss } from "@/lib/utils";
interface LayerPreviewProps {
  id:string;
  onLayerPointerDown:(e:React.PointerEvent,layerId:string)=> void;
  selectionColor?:string;
}

export const LayerPreview = memo(({
  id,
  onLayerPointerDown,
  selectionColor
}:LayerPreviewProps) => {
  const layer = useStorage((root)=>root?.layers?.get(id));

  if(!layer) return null;

  console.log({layer},"LayerPreview");
  
  switch(layer.type){
    case LayerType.Path:
      return (
        <Path
          key={id}
          points={layer.points!}
          onPointerDown={(e)=>onLayerPointerDown(e,id)}
          x={layer.x}
          y={layer.y}
          fill={layer.fill?colotToCss(layer.fill):"#000"}
          stroke={selectionColor}
        />
      )
    case LayerType.Note:
      return (
        <Note 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Ellipse:
      return (
        <Ellipse 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Text:
      return (
        <Text 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Reactangle:
      return (
          <Rectangle
            id={id}
            onLayerPointerDown={onLayerPointerDown}
            layer={layer}
            selectionColor={selectionColor}
          />
      );
    default:
      console.warn("Unknown layer type",layer);
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";