"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// SVG Components (reused from original)
const RockIcon = () => (
  <svg
    aria-label="Rock"
    className="h-full w-full"
    viewBox="0 0 309.274 282.945"
  >
    <title>Rock</title>
    <g>
      <path
        d="M274.085,123.143c-2.976-11.404-7.057-22.556-11.228-33.537c-2.789-7.34-5.713-14.627-8.475-21.98
        c-0.385-1.024-0.791-2.045-1.191-3.066c-2.01-1.381-3.938-2.896-5.791-4.482c-7.007-4.258-13.768-8.834-21.1-12.621
        c-9.2-4.752-18.252-9.584-27.888-13.422c-13.671-5.445-28.599-9.875-43.546-11.748c0.018-0.005,0.036-0.008,0.055-0.012
        c-0.365-0.047-0.73-0.093-1.095-0.139c-3.302,0.229-6.676,0.841-10.009,0.803c-0.162,0.051-0.324,0.094-0.486,0.146
        c-0.779,0.246-1.561,0.488-2.342,0.728c-0.816,0.16-1.629,0.335-2.434,0.546c-2.658,0.699-5.27,1.576-7.85,2.535
        c-2.545,0.777-5.08,1.589-7.596,2.486c-2.974,1.061-5.942,2.295-8.652,3.926c-0.384,0.23-0.764,0.508-1.143,0.81
        c-0.785,0.369-1.574,0.735-2.347,1.129c-1.886,0.957-3.677,1.976-5.506,3.016c-1.637,0.928-2.372,2.989-3.39,4.45
        C90.282,59.617,80.513,77.49,72.122,96.288c-4.256,9.536-8.756,18.917-12.242,28.776c-0.881,2.492-1.629,5.028-2.337,7.573
        c-0.563,2.023-1.343,3.656-1.258,5.78c0.059,1.488,0.778,2.899,1.353,4.242c1.242,2.903,2.686,5.693,3.82,8.65
        c1.725,4.49,3.205,8.773,5.467,13.022c2.499,4.694,5.213,9.275,7.684,13.982c2.158,4.109,4.158,8.031,6.895,11.795
        c2.473,3.402,4.197,6.496,7.715,8.92c2.375,1.636,4.496,3.618,6.746,5.42c2.568,2.053,5.464,3.684,8.205,5.493
        c5.732,3.782,11.178,7.83,16.553,12.105c9.818,7.813,20.291,14.984,30.879,21.764c1.907,0.524,3.748,1.369,5.475,2.246
        c0.604,0.307,1.201,0.625,1.793,0.95c0.756-0.188,1.49-0.388,2.182-0.62c4.195-1.416,8.299-3.123,12.441-4.688
        c8.129-3.068,16.268-6.092,24.266-9.48c3.873-1.643,7.879-2.959,11.689-4.729c3.83-1.778,7.668-3.577,11.564-5.2
        c3.805-1.585,7.596-3.186,11.318-4.957c3.862-1.835,7.355-4.249,11.131-6.212c2.633-1.367,5.592-2.651,7.125-5.359
        c1.693-2.99,2.536-6.691,3.563-9.957c2.76-8.782,5.019-17.742,7.746-26.544c2.627-8.474,5.528-16.849,8.408-25.239
        c0.74-2.158,1.463-4.403,2.207-6.672c0.787-2.829,1.851-5.588,2.678-8.41C274.676,127.024,274.271,125.094,274.085,123.143z"
        fill="currentColor"
      />
    </g>
  </svg>
);

const PaperIcon = () => (
  <svg id="svg4883" version="1.1" viewBox="0 0 765 990">
    <title>Paper Icon</title>
    <defs id="defs4885">
      <filter id="filter12589">
        <feGaussianBlur id="feGaussianBlur12591" stdDeviation="2.6717241" />
      </filter>
    </defs>
    <g id="layer1" transform="translate(0 -62.362)">
      <path
        d="m11.084 72.444v969.55h699.16c27.525 0 49.597-21.711 49.597-48.663v-872.23c0-26.952-22.072-48.663-49.597-48.663h-699.16z"
        fill="#fff"
        id="path8098"
        stroke="#979797"
        strokeWidth="3.5504"
      />
      <path
        d="m10.143 182.56h750.64"
        fill="#00f"
        id="path5538"
        stroke="#01f"
        strokeWidth="1.6689px"
        style={{ color: "#000000" }}
      />
      <path
        d="m10.143 229.33h750.64"
        fill="#00f"
        id="path5540"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 277.12h750.64"
        fill="#00f"
        id="path5542"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 324.91h750.64"
        fill="#00f"
        id="path5544"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 372.7h750.64"
        fill="#00f"
        id="path5546"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 420.49h750.64"
        fill="#00f"
        id="path5548"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 468.28h750.64"
        fill="#00f"
        id="path5550"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 516.07h750.64"
        fill="#00f"
        id="path5552"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 563.86h750.64"
        fill="#00f"
        id="path5554"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 611.65h750.64"
        fill="#00f"
        id="path5556"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 659.45h750.64"
        fill="#00f"
        id="path5592"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 707.24h750.64"
        fill="#00f"
        id="path5594"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 755.03h750.64"
        fill="#00f"
        id="path5596"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 802.82h750.64"
        fill="#00f"
        id="path5598"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 850.61h750.64"
        fill="#00f"
        id="path5600"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 898.4h750.64"
        fill="#00f"
        id="path5602"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 946.19h750.64"
        fill="#00f"
        id="path5604"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
      <path
        d="m10.143 993.98h750.64"
        fill="#00f"
        id="path5606"
        stroke="#01f"
        strokeWidth="1.6689px"
      />
    </g>
  </svg>
);

const ScissorsIcon = () => (
  <svg
    aria-label="Scissors Icon"
    style={{ background: "new 0 0 2122 2122" }}
    viewBox="0 0 2122 2122"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Scissors Icon</title>
    <g>
      <path
        d="M809.446,1224.667c-10.28-20.243-26.041-41.598-39.552-63.893
		c-117.091,138.042-211.927,310.679-281.676,467.488c-29.023,65.325-53.091,133.077-68.424,202.938
		c-7.445,34.007-43.035,158.772,29.213,114.879l0.176-0.088c60.019-36.619,103.805-98.212,150.869-150.353
		c52.96-58.641,105.871-117.257,158.83-175.893c40.326-44.662,80.663-89.359,120.989-134.017
		c-4.867-24.068-7.191-48.867-10.904-73.232C859.093,1347.547,839.22,1283.328,809.446,1224.667z"
        style={{ fill: "#91A9D8" }}
      />
      <path
        d="M975.643,1223.386c-11.24,2.943-22.611,3.235-33.481-0.969
		c-13.179-5.077-25.174-13.613-36.312-24.151c-32.526-30.772-41.403-77.252-64.75-114.027
		c-24.57,23.951-48.321,49.568-71.206,76.536c13.51,22.295,29.271,43.649,39.552,63.893c29.773,58.661,49.647,122.879,59.523,187.83
		c3.712,24.365,6.036,49.164,10.904,73.232c54.095-59.907,108.19-119.815,162.28-179.722
		c-12.365-15.099-24.736-30.198-37.101-45.296C995.77,1249.374,985.66,1236.819,975.643,1223.386z"
        style={{ fill: "#7594C6" }}
      />
      <path
        d="M1767.093,400.834c-25.843-94.243-104.968-163.191-190.58-203.752
		c-73.838-35.023-162.443-38.266-237.029-8.731c-86.51,34.275-150.12,109.06-185.392,192.676
		c-35.323,83.616-44.952,175.813-46.698,266.863c-0.698,38.914-0.25,78.927-14.668,114.897
		c-8.581,21.403-21.703,39.812-37.168,56.725c41.009,46.298,97.436,83.816,126.821,138.396c8.033,14.867,13.969,31.83,10.626,48.493
		c-1.446,7.134-4.49,13.77-8.231,20.106c9.43,7.833,18.509,16.065,27.29,24.446c14.669,14.069,28.987,28.787,42.956,44.053
		c30.682-38.964,122.78-118.539,163.691-138.595C1611.885,861.721,1832.999,641.256,1767.093,400.834z M1220.346,601.293
		c-8.233-76.532,9.129-160.198,56.126-220.315c59.169-75.484,167.033-96.438,254.191-61.465
		c112.951,45.25,145.33,168.729,102.175,277.141c-26.692,67.003-83.566,135.602-153.163,159.898
		C1356.595,799.557,1232.019,709.406,1220.346,601.293z"
        style={{ fill: "#C11833" }}
      />
      <path
        d="M1575.292,1648.964c-62.105-159.985-148.506-336.993-258.806-480.521
		c-14.568,21.617-31.338,42.183-42.587,61.91c-32.57,57.154-55.512,120.346-68.511,184.74c-4.882,24.156-8.4,48.818-14.421,72.619
		c38.129,46.558,76.263,93.145,114.387,139.697c50.07,61.126,100.098,122.222,150.168,183.347
		c44.497,54.349,85.262,117.983,143.44,157.457l0.171,0.092c70.051,47.328,40.516-79.011,34.723-113.335
		C1621.908,1784.448,1601.133,1715.619,1575.292,1648.964z"
        style={{ fill: "#B5C5E7" }}
      />
      <path
        d="M1273.899,1230.353c11.25-19.727,28.019-40.292,42.587-61.91
		c-19.718-25.642-40.205-50.192-61.447-73.413c-13.997-15.294-28.307-30.022-42.971-44.051
		c-8.794-8.412-17.886-16.619-27.279-24.453c-2.543,4.358-5.389,8.587-8.273,12.726c-42.168,60.392-94.388,114.375-153.997,159.135
		c-13.929,10.456-30.256,20.648-46.874,24.999c10.017,13.432,20.127,25.988,29.408,37.325
		c12.365,15.098,24.736,30.197,37.101,45.296c49.608,60.57,99.211,121.14,148.814,181.705c6.022-23.801,9.54-48.463,14.421-72.619
		C1218.386,1350.699,1241.329,1287.508,1273.899,1230.353z"
        style={{ fill: "#91A9D8" }}
      />
      <path
        d="M1182.379,957.909c-29.385-54.58-85.811-92.098-126.821-138.396
		c-17.412-19.657-32.03-40.91-40.612-65.755c-12.672-36.57-10.277-76.532-9.129-115.446c2.693-91.05-2.495-183.596-33.726-268.809
		c-31.231-85.213-91.2-162.992-175.913-201.357c-73.09-33.127-161.695-34.175-237.179-2.794
		c-87.458,36.42-169.827,101.527-200.21,194.373C281.41,596.703,491.647,827.546,680.033,931.468
		c41.06,22.65,133.207,110.856,159.15,149.771c0.7,0.948,1.298,1.996,1.897,2.993c23.348,36.769,32.229,83.267,64.757,114.049
		c11.175,10.527,23.149,19.058,36.321,24.147c10.876,4.191,22.251,3.891,33.476,0.948c16.614-4.34,32.977-14.518,46.896-24.995
		c59.62-44.752,111.805-98.733,153.962-159.15c2.893-4.141,5.737-8.332,8.282-12.722c3.742-6.336,6.786-12.971,8.231-20.106
		C1196.348,989.739,1190.412,972.777,1182.379,957.909z M895.26,586.326C878.448,693.74,749.63,777.755,628.746,728.913
		c-68.299-27.639-121.832-98.883-145.231-167.133c-37.916-110.357,0.35-232.14,115.347-271.902
		c88.755-30.683,195.52-4.59,250.949,73.688C893.913,425.879,907.184,510.293,895.26,586.326z"
        style={{ fill: "#E51C37" }}
      />
      <path
        d="M922.956,1007.813c11.435,39.6,52.804,62.429,92.404,50.994
		c39.601-11.435,62.431-52.806,50.991-92.404c-11.435-39.6-52.804-62.431-92.404-50.993
		C934.347,926.843,911.517,968.215,922.956,1007.813z"
        style={{ fill: "#577FBD" }}
      />
      <path
        d="M657.938,840.327c-79.166-56.312-152.287-111.383-210.406-190.136
		c-3.693-5.004-11.493-0.762-8.487,4.96c40.614,77.262,119.756,131.206,189.023,180.541c78.48,55.896,153.696,110.991,209.88,190.49
		c2.256,3.196,7.084,0.467,5.281-3.087C803.527,944.736,727.77,890.003,657.938,840.327z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M707.8,196.155c29.408,11.583,60.511,13.805,89.666,28.192
		c27.036,13.345,51.727,31.513,72.517,53.338c44.687,46.913,68.399,109.342,75.176,173.093c0.248,2.331,3.616,2.434,3.708,0
		c2.607-67.566-23.83-132.785-70.241-181.737c-23.274-24.548-51.411-44.675-82.095-58.913
		c-26.085-12.109-59.522-26.029-88.73-21.839C703.342,188.927,704.569,194.883,707.8,196.155z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M1550.848,826.035c-2.67,1.917-0.36,6.132,2.621,4.482
		c68.049-37.678,119.488-100.475,150.933-171.081c29.578-66.414,46.358-150.618,25.534-221.834
		c-1.198-4.095-7.868-3.476-7.649,1.035c3.65,75.198,0.541,144.611-29.559,214.962
		C1662.702,723.777,1612.587,781.706,1550.848,826.035z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M1264.276,307.039c26.748-15.486,48.555-36.92,76.901-50.38
		c31.722-15.057,66.441-23.52,101.539-24.643c68.268-2.18,129.198,24.87,182.406,65.715c2.324,1.786,4.902-1.944,3.031-3.929
		c-47.674-50.628-120.468-76.704-189.461-74.504c-59.951,1.912-146.743,27.659-179.362,82.794
		C1257.475,305.222,1261.158,308.845,1264.276,307.039z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M1111.126,929.06c13.559,15.695,53.34,47.851,43.586,70.926
		c-4.668,11.043-18.913,22.606-26.845,31.637c-8.365,9.532-16.736,19.067-25.106,28.599c-14.914,16.992-29.778,33.941-42.134,52.919
		c-1.949,2.996,2.222,5.637,4.662,3.596c25.481-21.335,46.777-47.396,68.896-72.081c12.673-14.139,37.306-33.252,36.745-54.753
		c-0.482-18.575-21.817-35.406-32.735-47.856c-20.575-23.469-39.854-50.848-64.745-69.876c-2.572-1.966-5.554,1.737-4.185,4.185
		C1080.208,895.932,1096.54,912.166,1111.126,929.06z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M740.964,1264.093c-88.238,96.964-155.166,210.533-210.728,328.827
		c-2.562,5.457,5.462,10.266,8.166,4.775c57.578-117.004,131.152-224.448,207.805-329.559
		C748.443,1265.072,743.493,1261.311,740.964,1264.093z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M508.945,1653.617c-21.92,34.406-38.913,73.028-47.766,112.969c-0.385,1.735,2.27,3.113,3.05,1.286
		c15.995-37.51,32.409-74.216,51.284-110.421C517.773,1653.11,511.581,1649.476,508.945,1653.617z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M1435.019,1424.239c-3.727-6.002-12.677-0.726-9.447,5.525
		c34.397,66.46,69.184,131.43,96.853,201.184c26.655,67.206,44.424,136.706,67.678,204.94c1.486,4.356,7.513,2.558,6.797-1.875
		c-11.858-73.17-39.508-145.846-67.186-214.348C1502.819,1553.111,1472.958,1485.31,1435.019,1424.239z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M1402.649,1370.197c1.213,2.07,4.287,0.243,3.201-1.871c-9.301-18.11-18.212-36.434-27.742-54.421
		c-8.2-15.479-15.391-33.525-27.693-46.134c-1.267-1.296-3.342,0.044-2.948,1.715c4.053,17.165,15.488,32.965,24.166,48.205
		C1381.689,1335.347,1392.364,1352.667,1402.649,1370.197z"
        style={{ fill: "#1A1A1A" }}
      />
      <path
        d="M455.035,359.151c24.702-54.441,64.623-92.158,105.364-134.219
		c10.49-10.833-2.689-24.971-15.118-19.595c-58.46,25.298-101.983,85.942-125.798,143.089
		c-27.016,64.83-37.349,149.724-12.112,216.911c6.996,18.633,31.835,11.072,29.242-8.061
		C427.264,488.218,425.432,424.391,455.035,359.151z"
        style={{ fill: "#FFFFFF" }}
      />
      <path
        d="M796.789,1507.303c-47.98,43.269-86.656,100.677-127.225,150.821
		c-41.466,51.249-82.943,102.48-123.912,154.129c-7.103,8.95,5.262,21.798,12.774,12.775
		c43.192-51.874,85.837-104.181,128.526-156.473c40.282-49.344,87.829-98.271,119.975-153.432
		C810.708,1508.633,802.153,1502.47,796.789,1507.303z"
        style={{ fill: "#FFFFFF" }}
      />
      <path
        d="M1487.521,1774.669c-23.05-31.488-46.845-62.509-70.909-93.232
		c-25.457-32.502-51.366-64.657-77.437-96.662c-14.041-17.237-28.161-34.407-42.358-51.517
		c-11.177-13.467-20.278-27.703-37.218-33.715c-4.317-1.53-7.381,2.996-6.748,6.748c3.035,17.842,16.428,29.671,27.688,43.245
		c12.17,14.665,24.283,29.374,36.336,44.131c27.128,33.203,53.914,66.674,80.511,100.302c25.578,32.341,50.976,64.842,76.735,97.037
		c23.757,29.681,46.27,68.658,76.551,91.717c2.948,2.246,7.552-1.491,6.319-4.857
		C1543.491,1840.964,1510.644,1806.255,1487.521,1774.669z"
        style={{ fill: "#FFFFFF" }}
      />
    </g>
  </svg>
);

type Choice = "rock" | "paper" | "scissors";
type GameResult = "win" | "lose" | "tie";
type GameState = "ready" | "playing" | "result";

type GameStats = {
  playerWins: number;
  aiWins: number;
  ties: number;
};

const choices: Choice[] = ["rock", "paper", "scissors"];

const SVGChoice = ({
  choice,
  isSelected,
  onClick,
  disabled = false,
}: {
  choice: Choice;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const renderChoice = () => {
    if (choice === "rock") {
      return <RockIcon />;
    }
    if (choice === "paper") {
      return <PaperIcon />;
    }
    if (choice === "scissors") {
      return <ScissorsIcon />;
    }
    return null;
  };

  return (
    <button
      aria-label={`Select ${choice}`}
      className={`cursor-pointer transition-transform hover:scale-105 ${
        isSelected ? "scale-110" : ""
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <svg
        aria-label={choice}
        className="rounded-lg border-2 border-border bg-card"
        height="120"
        viewBox="0 0 120 120"
        width="120"
      >
        <title>{choice}</title>
        {renderChoice()}
      </svg>
      <p className="mt-2 text-center font-medium text-foreground capitalize">
        {choice}
      </p>
    </button>
  );
};

export default function RockPaperScissorsGame() {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const [stats, setStats] = useState<GameStats>({
    playerWins: 0,
    aiWins: 0,
    ties: 0,
  });

  const getWinner = (player: Choice, computer: Choice): GameResult => {
    if (player === computer) {
      return "tie";
    }
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win";
    }
    return "lose";
  };

  const updateStats = (gameResult: GameResult) => {
    setStats((prev) => {
      if (gameResult === "win") {
        return { ...prev, playerWins: prev.playerWins + 1 };
      }
      if (gameResult === "lose") {
        return { ...prev, aiWins: prev.aiWins + 1 };
      }
      return { ...prev, ties: prev.ties + 1 };
    });
  };

  const playGame = (selectedChoice: Choice) => {
    if (gameState !== "ready" || isAnimating) {
      return;
    }

    setIsAnimating(true);
    setPlayerChoice(selectedChoice);
    setGameState("playing");

    const ANIMATION_DELAY = 1000;
    const RESULT_DELAY = 1000;

    // Animate computer choice selection
    setTimeout(() => {
      const aiChoice = choices[Math.floor(Math.random() * choices.length)];
      const gameResult = getWinner(selectedChoice, aiChoice);

      setComputerChoice(aiChoice);
      setResult(gameResult);
      setIsAnimating(false);
      setGameState("result");

      updateStats(gameResult);

      // Show result dialog
      setTimeout(() => {
        setShowResultDialog(true);
      }, RESULT_DELAY);
    }, ANIMATION_DELAY);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setIsAnimating(false);
    setGameState("ready");
    setShowResultDialog(false);
  };

  const getResultMessage = () => {
    if (!result) {
      return "Choose your move!";
    }
    switch (result) {
      case "win":
        return "🎉 You Win!";
      case "lose":
        return "💻 AI Wins!";
      case "tie":
        return "🤝 It's a Tie!";
      default:
        return "Choose your move!";
    }
  };

  const getResultColor = () => {
    switch (result) {
      case "win":
        return "text-green-600";
      case "lose":
        return "text-red-600";
      case "tie":
        return "text-yellow-600";
      default:
        return "text-foreground";
    }
  };

  return (
    <>
      {/* Instruction Dialog */}
      <Dialog open={showInstructions}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-2xl">
              🪨📄✂️ ROCK PAPER SCISSORS ✂️📄🪨
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-center">
                <p className="font-semibold text-lg">How to Play:</p>

                <div className="space-y-2 text-left">
                  <p>• Choose Rock, Paper, or Scissors</p>
                  <p>• Rock beats Scissors</p>
                  <p>• Paper beats Rock</p>
                  <p>• Scissors beats Paper</p>
                  <p>• Play against the AI and track your wins!</p>
                </div>

                <Button
                  className="w-full font-mono"
                  onClick={() => setShowInstructions(false)}
                  size="lg"
                >
                  START GAME
                </Button>

                <Link className="w-full" href="/games">
                  <Button
                    className="w-full font-mono"
                    size="lg"
                    variant="outline"
                  >
                    🏠 GO TO GAMES
                  </Button>
                </Link>
              </div>
            </DialogDescription>
            s
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog}>
        <DialogContent
          className="max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center font-mono text-2xl">
              {result === "win" && "🎉 VICTORY! 🎉"}
              {result === "lose" && "💀 DEFEAT 💀"}
              {result === "tie" && "🤝 TIE! 🤝"}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 text-center">
                <p className="font-semibold text-lg">{getResultMessage()}</p>

                {result === "win" && (
                  <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900">
                    <p className="font-bold text-green-800 dark:text-green-200">
                      Congratulations! You won! 🎉
                    </p>
                  </div>
                )}

                {result === "lose" && (
                  <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900">
                    <p className="font-bold text-red-800 dark:text-red-200">
                      The AI won this round! 💀
                    </p>
                  </div>
                )}

                {result === "tie" && (
                  <div className="rounded-lg bg-yellow-100 p-4 dark:bg-yellow-900">
                    <p className="font-bold text-yellow-800 dark:text-yellow-200">
                      It's a tie! Great minds think alike! 🤝
                    </p>
                  </div>
                )}

                <Button
                  className="w-full font-mono"
                  onClick={() => {
                    resetGame();
                    setShowResultDialog(false);
                  }}
                  size="lg"
                >
                  PLAY AGAIN
                </Button>

                <div className="flex justify-center space-x-4 text-sm">
                  <span className="text-primary">
                    Your Wins: {stats.playerWins}
                  </span>
                  <span className="text-muted-foreground">VS</span>
                  <span className="text-destructive">
                    AI Wins: {stats.aiWins}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-yellow-600">Ties: {stats.ties}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Main Game */}
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center font-bold text-4xl text-foreground">
            🪨📄✂️ Rock Paper Scissors ✂️📄🪨
          </h1>

          {/* Score Board */}
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg">You</h3>
                <p className="font-bold text-3xl text-accent">
                  {stats.playerWins}
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-2xl text-foreground">VS</h3>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg">AI</h3>
                <p className="font-bold text-3xl text-accent">{stats.aiWins}</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-lg">Ties</h3>
                <p className="font-bold text-3xl text-yellow-600">
                  {stats.ties}
                </p>
              </div>
            </div>
          </Card>

          <div className="mb-8 text-center">
            <h2 className={`font-bold text-2xl ${getResultColor()}`}>
              {getResultMessage()}
            </h2>
            {isAnimating && (
              <p className="mt-2 text-muted-foreground">AI is thinking...</p>
            )}
          </div>

          {/* Game Area */}
          <div className="mb-8 grid gap-8 md:grid-cols-2">
            {/* Player Side */}
            <Card className="p-6">
              <h3 className="mb-4 text-center font-semibold text-foreground text-xl">
                Your Choice
              </h3>
              <div className="flex justify-center gap-4">
                {choices.map((choice) => (
                  <SVGChoice
                    choice={choice}
                    disabled={gameState !== "ready" || isAnimating}
                    isSelected={playerChoice === choice}
                    key={choice}
                    onClick={() => playGame(choice)}
                  />
                ))}
              </div>
            </Card>

            {/* Computer Side */}
            <Card className="p-6">
              <h3 className="mb-4 text-center font-semibold text-foreground text-xl">
                AI's Choice
              </h3>
              <div className="flex justify-center">
                {computerChoice ? (
                  <SVGChoice
                    choice={computerChoice}
                    isSelected={true}
                    onClick={() => {
                      // No action needed for computer choice
                    }}
                  />
                ) : (
                  <div className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border-2 border-muted-foreground border-dashed bg-muted">
                    <span className="text-2xl text-muted-foreground">?</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-x-4 text-center">
            {gameState === "result" && (
              <Button
                className="bg-secondary px-8 py-2 text-secondary-foreground hover:bg-secondary/90"
                onClick={resetGame}
              >
                Play Again
              </Button>
            )}

            <Link href="/games">
              <Button
                className="bg-muted px-8 py-2 text-muted-foreground hover:bg-muted/90"
                variant="outline"
              >
                Back to Games
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
