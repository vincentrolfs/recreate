export const SCALE = 30;
export type LinkableNumber = {
  value: number;
  isLinked: boolean;
};
export type Box = {
  position: [x: LinkableNumber, y: LinkableNumber, z: LinkableNumber];
  size: [width: LinkableNumber, height: LinkableNumber, depth: LinkableNumber];
  color: string;
};
export type PartialBox = {
  position?: [x?: LinkableNumber, y?: LinkableNumber, z?: LinkableNumber];
  size?: [
    width?: LinkableNumber,
    height?: LinkableNumber,
    depth?: LinkableNumber
  ];
};
export const boxKeys: ("size" | "position")[] = ["size", "position"];

export function r(): LinkableNumber {
  return {
    value: Math.round(3 * SCALE * (Math.random() * 2 - 1)),
    isLinked: false,
  };
}

export function rp(): LinkableNumber {
  return {
    value: Math.round(3 * SCALE * Math.random()),
    isLinked: false,
  };
}
