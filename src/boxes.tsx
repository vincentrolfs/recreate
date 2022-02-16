import {
  Box,
  boxKeys,
  LinkableNumber,
  PartialBox,
  r,
  rp,
  SCALE,
} from "./types";
import { useState } from "react";
import distinctColors from "distinct-colors";

const COLORS = distinctColors({ count: 21 });
COLORS.shift();
let COLOR_INDEX = 0;

export function computeBoxValues(
  key: "position" | "size",
  box: Box,
  globalValue: number
): [number, number, number] {
  return box[key].map(
    (linkableNum) =>
      (linkableNum.isLinked ? globalValue : linkableNum.value) / SCALE
  ) as [number, number, number];
}

export function useBoxes(): [
  Box[],
  () => void,
  (i: number, update: PartialBox) => void,
  (i: number) => void
] {
  const [boxes, setBoxes] = useState<Box[]>([]);

  const addBox = () => {
    const sizeLink = Math.floor(Math.random() * 3);
    const size = [0, 1, 2].map((index) => ({
      ...rp(),
      isLinked: index === sizeLink,
    })) as [LinkableNumber, LinkableNumber, LinkableNumber];

    setBoxes([
      ...boxes,
      {
        position: [r(), r(), { value: 0, isLinked: false }],
        size,
        color: COLORS[COLOR_INDEX].hex(),
      },
    ]);

    COLOR_INDEX = (COLOR_INDEX + 1) % COLORS.length;
  };

  const updateBox = (i: number, update: PartialBox) => {
    const newBoxes = [...boxes];
    newBoxes[i] = {
      position: [...newBoxes[i].position],
      size: [...newBoxes[i].size],
      color: newBoxes[i].color,
    };

    boxKeys.forEach((key) =>
      update[key]?.forEach((value, index) => {
        newBoxes[i][key][index] = value ?? newBoxes[i][key][index];
      })
    );

    setBoxes(newBoxes);
  };

  const deleteBox = (i: number) => {
    const newBoxes = [...boxes];
    newBoxes.splice(i, 1);
    setBoxes(newBoxes);
  };

  return [boxes, addBox, updateBox, deleteBox];
}
