let abDimension = [];
let abSpeedX = [];
let abColor = [];
let questCluster1 = [];

document.addEventListener("DOMContentLoaded", function() {
  fetch("ballData.json")
      .then(response => response.json())
      .then(data => renderData(data))
      .catch(error => console.error(error));
});

function renderData(data) {
  console.log("File " + data.title + " uploaded!");
  abDimension = [];
  abSpeedX = [];
  abColor = [];
  questCluster1 = [];
  
  data.items.forEach(item => {
      abDimension.push(item.dimension);
      abSpeedX.push(item.speedX);
      abColor.push(item.color);
      questCluster1.push(item.cluster1);
  });
}