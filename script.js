const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const landmarkContainer = document.getElementsByClassName("landmark-grid-container")[0];

function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function onResults(results) {
  // const printResult = () => {
    // let dotA = results.poseLandmarks[23]; // Left_hip
    // let dotB = results.poseLandmarks[25]; // Left_knee
    // let dotC = results.poseLandmarks[27]; // Left_ankle
    // console.log(dotA);
    // console.log(dotB);
    // console.log(dotC);
    // let dotBx = results.poseLandmarks[25].x;
    // let dotBy = results.poseLandmarks[25].y;
    // let dotBz = results.poseLandmarks[12].z;
    // let dotBBz = results.poseLandmarks[11].z;
    // console.log(`The Z of your right Knee is ${dotBBz}`);
    // console.log(dotBx);
    // console.log(`The X of your left Knee is ${dotBx}`);
    // console.log(dotBy);
    // console.log(`The Y of your left Knee is ${dotBy}`);
    // console.log(dotBz);
    // console.log(`The Z of your left Knee is ${dotBz}`);
  // };

  function calculation() {
    let dotAx = results.poseLandmarks[23].x; // Left_hip x
    let dotAy = results.poseLandmarks[23].y; // Left_hip y
    let dotAz = results.poseLandmarks[23].z; // Left_hip z
    let dotBx = results.poseLandmarks[25].x; // Left_knee x
    let dotBy = results.poseLandmarks[25].y; // Left_knee y
    let dotBz = results.poseLandmarks[25].z; // Left_knee z
    let dotCx = results.poseLandmarks[27].x; // Left_ankle
    let dotCy = results.poseLandmarks[27].y; // Left_ankle
    let dotCz = results.poseLandmarks[27].z; // Left_ankle

    let vectorBAU = [dotAx - dotBx, dotAy - dotBy, dotAz - dotBz];
    let vectorBCV = [dotCx - dotBx, dotCy - dotBy, dotCz - dotBz];
    let vectorsMultiple = vectorBAU[0] * vectorBCV[0] + vectorBAU[1] * vectorBCV[1] + vectorBAU[2] * vectorBCV[2];

    let vectorRoots =
      Math.sqrt(Math.pow(vectorBAU[0], 2) + Math.pow(vectorBAU[1], 2) + Math.pow(vectorBAU[2], 0)) * Math.sqrt(Math.pow(vectorBCV[0], 2) + Math.pow(vectorBCV[1], 2) + Math.pow(vectorBCV[2], 2));

    let multiRootsDivide = vectorsMultiple / vectorRoots; // -5/V66*V5

    let raDangle = 0;
    raDangle = Math.acos(multiRootsDivide);

    let degreeAngel = raDangle * (180 / Math.PI);
    console.log(`The angle of your left knee is: ${degreeAngel} !!!`);
    //--Magnitude (length of a vector) --\
    //|a| = sqwrt((x)^2+(y)^2)
    //|b| = sqwrt((x)^2+(y)^2)
  }

  calculation();

  // console.log(results.poseLandmarks);
  // if (!results.poseLandmarks) {
  //   grid.updateLandmarks([]);
  //   return;
  // }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = "source-in";
  // canvasCtx.fillStyle = "#00FF00";
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = "destination-atop";
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = "source-over";
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
  drawLandmarks(canvasCtx, results.poseLandmarks, POSE_LANDMARKS_NEUTRAL, { color: "#FF0000", lineWidth: 2 });

  canvasCtx.restore();

  // grid.updateLandmarks(results.poseWorldLandmarks);
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();
