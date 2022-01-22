import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color } from "three";

const SCALE = 50;

type LinkableNumber = {
  value: number;
  isLinked: boolean;
};

type Box = {
  position: [x: LinkableNumber, y: LinkableNumber, z: LinkableNumber];
  size: [width: LinkableNumber, height: LinkableNumber, depth: LinkableNumber];
  color: string;
};

type PartialBox = {
  position?: [x?: LinkableNumber, y?: LinkableNumber, z?: LinkableNumber];
  size?: [
    width?: LinkableNumber,
    height?: LinkableNumber,
    depth?: LinkableNumber
  ];
};

const boxKeys: ("size" | "position")[] = ["size", "position"];

function computeBoxValues(
  key: "position" | "size",
  box: Box,
  globalValue: number
): [number, number, number] {
  return box[key].map(
    (linkableNum) =>
      (linkableNum.isLinked ? globalValue : linkableNum.value) / SCALE
  ) as [number, number, number];
}

function r(): LinkableNumber {
  return {
    value: Math.round(3 * SCALE * (Math.random() * 2 - 1)),
    isLinked: false,
  };
}

function rp(): LinkableNumber {
  return {
    value: Math.round(3 * SCALE * Math.random()),
    isLinked: false,
  };
}

function useBoxes(): [
  Box[],
  () => void,
  (i: number, update: PartialBox) => void,
  (i: number) => void
] {
  const [boxes, setBoxes] = useState<Box[]>([]);

  const addBox = () => {
    const colorNames = Object.keys(Color.NAMES);

    setBoxes([
      ...boxes,
      {
        position: [r(), r(), { value: 0, isLinked: false }],
        size: [rp(), rp(), rp()],
        color: colorNames[Math.floor(Math.random() * colorNames.length)],
      },
    ]);
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

export default function App() {
  const [boxes, addBox, updateBox, deleteBox] = useBoxes();
  const [globalValue, setGlobalValue] = useState("100");

  return (
    <>
      <div className="settings">
        <h3>Global value</h3>
        <input
          type="number"
          value={globalValue}
          onChange={(e) => setGlobalValue(e.target.value)}
        />
      </div>

      <div className="canvasWrapper">
        <Canvas>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          {boxes.map((box, i) => (
            <ThreeBox key={i} box={box} globalValue={parseInt(globalValue)} />
          ))}
        </Canvas>
      </div>

      <div className="settings bottom">
        <button onClick={addBox}>Add box</button>

        {boxes.map((box, i) => (
          <BoxSettings
            key={i}
            {...{ i, box, updateBox, deleteBox }}
            globalValue={parseInt(globalValue)}
          />
        ))}
      </div>
    </>
  );
}

type ThreeBoxProps = {
  box: Box;
  globalValue: number;
};

function ThreeBox({ box, globalValue }: ThreeBoxProps) {
  const ref = useRef<any>();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);

  useFrame((state, delta) => ref.current && (ref.current.rotation.x += delta));

  return (
    <mesh
      position={computeBoxValues("position", box, globalValue)}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={computeBoxValues("size", box, globalValue)} />
      <meshStandardMaterial color={hovered ? "hotpink" : box.color} />
    </mesh>
  );
}

type BoxSettingsProps = {
  i: number;
  box: Box;
  updateBox: (i: number, update: PartialBox) => void;
  deleteBox: (i: number) => void;
  globalValue: number;
};

function BoxSettings({
  i,
  box,
  updateBox,
  deleteBox,
  globalValue,
}: BoxSettingsProps) {
  return (
    <>
      <h3>
        Box {i + 1}{" "}
        <div className="color" style={{ backgroundColor: box.color }} />{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            deleteBox(i);
          }}
        >
          Delete
        </a>
      </h3>

      <div className="oneBox">
        {boxKeys.map((key) => (
          <div key={key}>
            <h4>{key}</h4>
            {[0, 1, 2].map((l) => (
              <LinkableInput
                key={key + l}
                globalValue={globalValue}
                value={box[key][l].value}
                isLinked={box[key][l].isLinked}
                onSetLink={(isLinked) => {
                  const newArray: PartialBox["size"] = [
                    undefined,
                    undefined,
                    undefined,
                  ];
                  newArray[l] = {
                    value: box[key][l].value,
                    isLinked,
                  };

                  updateBox(i, { [key]: newArray });
                }}
                onChange={(value) => {
                  const newArray: PartialBox["size"] = [
                    undefined,
                    undefined,
                    undefined,
                  ];
                  newArray[l] = {
                    value,
                    isLinked: box[key][l].isLinked,
                  };

                  updateBox(i, { [key]: newArray });
                }}
              />
            ))}
            <br />
          </div>
        ))}
      </div>
    </>
  );
}

type LinkableInputProps = {
  value: number;
  globalValue: number;
  onChange: (value: number) => void;
  onSetLink: (isLinked: boolean) => void;
  isLinked: boolean;
};

function LinkableInput({
  value,
  onChange,
  isLinked,
  globalValue,
  onSetLink,
}: LinkableInputProps) {
  return (
    <>
      <input
        type="number"
        value={isLinked ? globalValue : value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={isLinked}
      />
      <button onClick={() => onSetLink(!isLinked)}>
        {isLinked ? "Unlink" : "Link"}
      </button>
    </>
  );
}
