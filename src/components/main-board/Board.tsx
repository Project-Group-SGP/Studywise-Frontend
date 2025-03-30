import { Room } from "../room";
import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/canvas-loading";

export const Board = () => {
  return (
    <Room  fallback={<Loading/>}>
      <Canvas />
    </Room>
  )
}