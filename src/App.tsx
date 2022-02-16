import React, { useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Box, PartialBox } from "./types";
import { computeBoxValues, useBoxes } from "./boxes";
import { DragControls } from "three/examples/jsm/controls/DragControls";

export default function App() {
  const [boxes, addBox, updateBox, deleteBox] = useBoxes();
  const [globalValue, setGlobalValue] = useState("100");

  return (
    <>
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
        <h1>Recreate Prototype version 0.0.1</h1>

        <h3>Global value</h3>

        <div>
          <input
            type="range"
            min="10"
            max="300"
            value={globalValue}
            onChange={(e) => setGlobalValue(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "16px" }}>
          <button onClick={addBox}>Add box</button>
        </div>

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
  const {
    camera,
    gl: { domElement },
  } = useThree();

  if (ref.current) {
    new DragControls([ref.current], camera, domElement);
  }

  return (
    <>
      <mesh
        position={computeBoxValues("position", box, globalValue)}
        ref={ref}
        onClick={() => click(!clicked)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry args={computeBoxValues("size", box, globalValue)} />
        <meshStandardMaterial color={box.color} />
      </mesh>
    </>
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
        <div>
          <h4>Size</h4>
          {[0, 1, 2].map((l) => (
            <LinkableInput
              key={l}
              globalValue={globalValue}
              value={box.size[l].value}
              isLinked={box.size[l].isLinked}
              onSetLink={(isLinked) => {
                const newArray: PartialBox["size"] = [
                  undefined,
                  undefined,
                  undefined,
                ];
                newArray[l] = {
                  value: box.size[l].value,
                  isLinked,
                };

                updateBox(i, { size: newArray });
              }}
              onChange={(value) => {
                const newArray: PartialBox["size"] = [
                  undefined,
                  undefined,
                  undefined,
                ];
                newArray[l] = {
                  value,
                  isLinked: box.size[l].isLinked,
                };

                updateBox(i, { size: newArray });
              }}
            />
          ))}
          <br />
        </div>
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
