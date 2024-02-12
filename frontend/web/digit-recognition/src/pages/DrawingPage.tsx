import { useRef, useState } from "react";

type DrawingPageProps = {};

function DrawingPage({}: DrawingPageProps) {
  const [paths, setPaths] = useState<string[][]>([]); // [ [path1], [path2], ...
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [lastDrawTime, setLastDrawTime] = useState<number>(-1);

  const [prediction, setPrediction] = useState<string>("");
  const [predictions, setPredictions] = useState<{
    [key: number]: { label: string; value: number };
  }>({
    0: { label: "0", value: 0 },
    1: { label: "0", value: 0 },
    2: { label: "0", value: 0 },
    3: { label: "0", value: 0 },
    4: { label: "0", value: 0 },
    5: { label: "0", value: 0 },
    6: { label: "0", value: 0 },
    7: { label: "0", value: 0 },
    8: { label: "0", value: 0 },
    9: { label: "0", value: 0 },
  });
  const svgRef = useRef<SVGSVGElement>(null);

  const mouseDown = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    console.log("Mouse down");
  };

  const mouseUp = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    console.log("Mouse up");
    setPaths([...paths, currentPath]);
    setCurrentPath([]);
  };

  const mouseMove = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    // if the mouse is down, draw
    if (event.buttons === 1) {
      console.log("Drawing");

      setLastDrawTime(Date.now());

      const newPath = [...currentPath];
      const locationX = event.nativeEvent.offsetX;
      const locationY = event.nativeEvent.offsetY;
      const newPoint = `${newPath.length === 0 ? "M" : ""}${locationX.toFixed(
        0
      )},${locationY.toFixed(0)} `;
      newPath.push(newPoint);
      setCurrentPath(newPath);

      // Increase line thickness
      const svgElement = svgRef.current;
    }

    // if the mouse is up, stop drawing
  };

  const clearPaths = () => {
    setCurrentPath([]);
    setPaths([]);
  };

  const Predict = () => {
    const svg = svgRef.current;

    if (svg === null) {
      console.log("SVG is null");
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      console.log("Context is null");
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      console.log(dataUrl);

      // send to server

      fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataUrl: dataUrl }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("data:");
          console.log(data);
          const prediction = data.prediction;
          setPrediction(prediction);
          // sort predictions
          const originalPredictionsDict = data["prediction_array"]; // {0: ".8", 1: ".2", 2: ".1", ...
          console.log("Predictions:");
          console.log(originalPredictionsDict);

          const predArray = Object.keys(originalPredictionsDict)
            .map((key) => {
              return {
                label: key,
                value: originalPredictionsDict[key],
              };
            })
            .sort((a, b) => {
              return b.value - a.value;
            });

          setPredictions(predArray);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    img.src = url;

    // upload to server under request.files['image']
  };

  const Upload = () => {
    const svg = svgRef.current;

    if (svg === null) {
      console.log("SVG is null");
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      console.log("Context is null");
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 500;
      canvas.height = 500;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      console.log(dataUrl);

      // send to server

      fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataUrl: dataUrl }),
      });
    };

    img.src = url;

    // upload to server under request.files['image']
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "white",
          boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "lighter",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Digit Recognition
        </h1>
      </div>

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Draw Here
            </h2>
          </div>

          <div
            style={{
              padding: "1rem",
              paddingTop: "0",
            }}
          >
            {/* Drawing area will be displayed here */}
            <svg
              style={{
                width: "500px",
                height: "500px",
                backgroundColor: "white",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              }}
              onMouseDown={mouseDown}
              onMouseUp={mouseUp}
              onMouseMove={mouseMove}
              ref={svgRef}
            >
              <path
                d={currentPath.join("")}
                stroke={"black"}
                fill={"transparent"}
                strokeWidth={10}
                strokeLinejoin={"round"}
                strokeLinecap={"round"}
              />
              {paths.map((path, index) => {
                return (
                  <path
                    key={index}
                    d={path.join("")}
                    stroke={"black"}
                    fill={"transparent"}
                    strokeWidth={10}
                    strokeLinejoin={"round"}
                    strokeLinecap={"round"}
                  />
                );
              })}
            </svg>
          </div>

          <div
            style={{
              padding: "1rem",
              paddingTop: "0",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "250px",
            }}
          >
            <button
              style={{
                padding: "1rem",
                backgroundColor: "white",
                border: "0px solid black",
                cursor: "pointer",
                borderRadius: "5px",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              }}
              onClick={clearPaths}
            >
              Clear
            </button>
            <button
              style={{
                padding: "1rem",
                backgroundColor: "indigo",
                color: "white",
                border: "0px solid black",
                cursor: "pointer",
                borderRadius: "5px",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              }}
              onClick={Predict}
            >
              Evaluate
            </button>
            <button
              style={{
                padding: "1rem",
                backgroundColor: "white",
                border: "0px solid black",
                cursor: "pointer",
                borderRadius: "5px",
                boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
              }}
              onClick={Upload}
            >
              Upload
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >


          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: "1rem",
            }}
          >
            {prediction !== "" ? (
              <>
                <div style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                }}>
                    <div style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    textAlign: "center",

                    }}>
                  <h3 style={{padding: 5, fontSize: 32}}>{prediction}</h3>
                  </div>
                  <div style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    {Object.keys(predictions).map((key) => {
                      return (
                        <div
                          style={{
                            width: "400px",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "white",
                            margin: "5px",
                            height: "50px",
                            borderRadius: "120px",
                          }}
                        >
                          <div key={key} style={{ 
                            padding: "5px", zIndex: 4, color: "white", fontFamily: "Arial", 
                            fontSize: 32, 
                            fontWeight: "bold",
                            textShadow: "0px 0px 4px rgb(0,0,0,1)",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            width: "100%"

                        
                        }}>
                            {predictions[parseInt(key)].label}:{" "}
                            {(predictions[parseInt(key)].value * 100)
                              .toString()
                              .substring(0, 5)}
                            %
                          </div>

                          {/* percentage */}
                          <div
                            style={{
                              position: "absolute",
                              width: `${
                                predictions[parseInt(key)].value * 250
                              }px`,
                              height: "50px",
                              border: ".5px solid black",
                              color: "white",
                              zIndex: 3,
                              borderRadius: "120px",
                              display: predictions[parseInt(key)].value > 0.02 ? "flex" : "none",
                            }}
                          ></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              "No prediction yet"
            )}

            {}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawingPage;
