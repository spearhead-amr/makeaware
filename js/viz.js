/*
   Visualizzazione dati per MAKEAWARE! - Spearhead.

       Creato da Matteo Subet - Ultima versione del giorno 16 giugno 2023

   SUPSI - Scuola Universitaria della Svizzera Italiana
   DACD  - Dipartimento Architettura Costruzioni e Design
   IDe   - Istituto di Design

*/

// Code based on: array of bouncing balls with vectors in a class by 2sman

let makeawarePeople = [];
var numBalls;
let colors = ["#FF3A17", "#ABABAB", "#FF46ED"];
var antibioticDimension = 25;
let ballMoving = true;
let anyCollision = false;
let button;
let buttonActive = false;

let font, fontsize = 17;

let textCursorPos = [];
let highlineCursorText = 25;

function preload(){
  font = loadFont("font/SuisseIntl-Medium.otf");
}

function setup() {
  let vizLanding = createCanvas(windowWidth, windowHeight*0.53);
  vizLanding.parent("vizLanding");

  //Debug for JSON file
  //console.log(abDimension); console.log(abSpeedX); console.log(abSpeedY); console.log(abColor);

  abDimension.forEach((element, index) => {
    if (element == undefined){
      console.error("In the JSON file, under the dimension row a value is missing. Check the item number " + (index + 1));
    }
  });
  abSpeedX.forEach((element, index) => {
    if (element == undefined){
      console.error("In the JSON file, under the speedX row a value is missing. Check the item number " + (index + 1));
    }
  });
  abColor.forEach((element, index) => {
    if (element == undefined){
      console.error("In the JSON file, under the speedY row a value is missing. Check the item number " + (index + 1));
    } else if (element >= 3){
      console.error("To select the color insert a value between 0 and 2. In the item number " + (index + 1) + " you inserted the value " + element);
    }
  });

  numBalls = abDimension.length;
  
  for (let i = 0; i < numBalls; i++){
      makeawarePeople[i] = new Ball(
        abDimension[i],     //Dimension
        random(200, width - 200),      //Random is ok forever
        random(200, height - 200),     //Random is ok forever
        abSpeedX[i],        //Speed in x axis
        random(abSpeedX[i]-.5, abSpeedX[i]+.5),        //Speed in y axis
        abColor[i],         //Color from array color
        questCluster1[i]);  //Cluster 1     
  }

  textFont(font);
  textSize(fontsize);
  textAlign(CENTER, CENTER);
  /* BUTTON
  button = createButton("Have you ever personally experienced Antimicrobial Resistance?");
  button.position(30, height-70);
  button.mousePressed(onButtonClick);
  button.addClass("btn");*/
}

function draw() {
  background("#EFEFEF");

  /* TEXT FOR BUTTON
  push();
  textAlign(LEFT);
  fill(0);
  text("Exploring people's antibiotic consuption behaviour:", 30, height - 100);
  pop();*/

  if (!ballMoving){
    push();
    fill("black");
    //strokeWeight(1);
    //stroke(colors[0]);
    //square(50,50,250);
    textAlign(LEFT, TOP);
    text("YES", 50,320);
    //stroke(colors[1]);
    //square(width/2 - 125,height - 300,250);
    text("NO", width/2 - 125,height - 30);
    //stroke(colors[2]);
    //square(width - 300,50,250);
    text("NOT SURE", width - 300,320);
    pop();
  }
  
  for (let i = 0; i < numBalls; i++){
    makeawarePeople[i].display();
    if (ballMoving){
      makeawarePeople[i].move();
      makeawarePeople[i].bounce();
    }
      if(makeawarePeople[i].selected){
        anyCollision = true;
        makeawarePeople[i].collided();
      }else if (!anyCollision){
        makeawarePeople[i].checkCollision();
      }
  }

}


class Ball {
  constructor(dimension, tempX, tempY, tempXspeed, tempYspeed, abColor, questCluster1) {
    this.position = createVector(tempX, tempY);
    this.originalVelocity = createVector(tempXspeed, tempYspeed);
    this.velocity = createVector(tempXspeed, tempYspeed);
    this.dimension = dimension;
    var colorNumber = int(abColor);
    this.color = colors[colorNumber];
    this.selected = false;
    this.cluster1 = questCluster1;
  }

  display() {
    strokeWeight(0);
    if(this.dimension < antibioticDimension){
      fill(this.color);
      circle(this.position.x, this.position.y, 25);
      fill("#FFFFFF");
      circle(this.position.x, this.position.y, antibioticDimension-8);
    } else{
      fill("#FFFFFF");
      circle(this.position.x, this.position.y, this.dimension);
      fill(this.color);
      circle(this.position.x, this.position.y, antibioticDimension);
    }


    
  }

  move() {
    this.position.add(this.velocity);
  }

  bounce() {
    if ((this.position.x + (this.dimension/2) > width) || (this.position.x - (this.dimension/2) < 0)) {
      this.velocity.x = this.velocity.x * -1;
    }
    if ((this.position.y + (this.dimension/2) > height) || (this.position.y - (this.dimension/2) < 0)) {
      this.velocity.y = this.velocity.y * -1;
    }
  }

  checkCollision(){
    this.hit = collideCircleCircle(mouseX, mouseY, antibioticDimension+10, this.position.x, this.position.y, antibioticDimension);
    
      if (this.hit){
        console.log("hit");
        this.originalVelocity = this.velocity;
        this.selected = true;
      }
    }

  collided(){
    this.hit = collideCircleCircle(mouseX, mouseY, antibioticDimension+10, this.position.x, this.position.y, antibioticDimension);
    noCursor();
    push();
    stroke("black");
    strokeWeight(2);
    line(mouseX-20,mouseY,mouseX+20,mouseY);
    line(mouseX,mouseY-20,mouseX,mouseY+20);
    pop();
    push();
    fill("black");
    //Here the cursor will display the values for each ball
      textAlign(LEFT);
      textCursorPos = [mouseX + 5, mouseY + 20];
      
      //Here the first answer
      if(this.color === colors[0]){
        text("Color: I don't know what AMR is", textCursorPos[0],textCursorPos[1]);
      }else if(this.color === colors[1]){
        text("Color: I'm not sure what AMR is", textCursorPos[0],textCursorPos[1]);
      }else if(this.color === colors[2]){
        text("Color: I know what AMR is", textCursorPos[0],textCursorPos[1]);
      }else{
        console.error("Color error in JSON file -> Text not displayed");
        console.error(this.color);
      }

      //Here the second answer
      if(this.originalVelocity.x === 0.1 || this.originalVelocity.x === -0.1){
        text("Velocity: I’ve never consumed antibiotics", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 1.5 || this.originalVelocity.x === -1.5){
        text("Velocity: I consumed the last antibioticics more than 10 years ago", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 3 || this.originalVelocity.x === -3){
        text("Velocity: I consumed the last antibioticics between 10 and 5 years ago", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 4.5 || this.originalVelocity.x === -4.5){
        text("Velocity: I consumed the last antibioticics between 5 and 1 year ago", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 6 || this.originalVelocity.x === -6){
        text("Velocity: I've consumed the last antibioticics in the last year", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 7.5 || this.originalVelocity.x === -7.5){
        text("Velocity: I've consumed the last antibioticics in the last six months", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else if(this.originalVelocity.x === 10 || this.originalVelocity.x === -10){
        text("Velocity: I am currently under antibiotic treatment", textCursorPos[0],textCursorPos[1]+highlineCursorText);
      }else{
        console.error("Speed error in JSON file -> Text not displayed");
        console.error(this.originalVelocity.x);
      }

      //Here the third answer
      if(this.dimension === 110){
        text("Dimension: I don't want to consume antibiotics for any reason", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 95){
        text("Dimension: I don’t take antibiotics even if prescribed", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 80){
        text("Dimension: I do my best to avoid antibiotics", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 65){
        text("Dimension: I look for alternatives to antibiotics", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 50){
        text("Dimension: I follow the prescription", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 35){
        text("Dimension: I take antibiotics even without prescription", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else if(this.dimension === 20){
        text("Dimension: I take antibiotics for prevention", textCursorPos[0],textCursorPos[1]+highlineCursorText+highlineCursorText);
      }else{
        console.error("Dimension error in JSON file -> Text not displayed");
        console.error(this.dimension);
      }

    pop();
    this.velocity = 0;
    if(!this.hit){
      cursor();
      console.log("Not hitted anymore");
      this.selected = false;
      anyCollision = false;
      this.velocity = this.originalVelocity;
      console.log(this.velocity);
    }
  }
  }

function onButtonClick(){
  if (!buttonActive){
    buttonActive = true;
    button.addClass("pressed");
    ballMoving = false;
    var ballsCluster1 = [];
    var ballsCluster2 = [];
    var ballsCluster3 = [];

    for (let i = 0; i < numBalls; i++){
      if (makeawarePeople[i].cluster1 === 2){
        ballsCluster1.push(makeawarePeople[i]);
        makeawarePeople[i].position = createVector(random(50, 300),random(50, 300));
      } else if (makeawarePeople[i].cluster1 === 1){
        ballsCluster2.push(makeawarePeople[i]);
        makeawarePeople[i].position = createVector(random(width/2 - 125, width/2 + 125),random(height - 300, height - 50));
      } else if (makeawarePeople[i].cluster1 === 0){
        ballsCluster3.push(makeawarePeople[i]);
        makeawarePeople[i].position = createVector(random(width - 300, width - 50),random(50, 300));
      }
    }

    for(let i = 0; i < ballsCluster1.length; i++){
      if (i >= 1){
        var distance = dist(ballsCluster1[i].position.x, ballsCluster1[i].position.y, ballsCluster1[i-1].position.x, ballsCluster1[i-1].position.y);
        console.log("The distance of the ball nr " + i + " is " + distance);
        while (distance <= ballsCluster1[i].dimension){
          ballsCluster1[i].position = createVector(random(50, 300),random(50, 300));
        }
      }
    }

    for(let i = 0; i < ballsCluster2.length; i++){
      if (i >= 1){
        var distance = dist(ballsCluster2[i].position.x, ballsCluster2[i].position.y, ballsCluster2[i-1].position.x, ballsCluster2[i-1].position.y);
        console.log("The distance of the ball nr " + i + " is " + distance);
        while (distance <= ballsCluster2[i].dimension){
          ballsCluster2[i].position = createVector(random(width/2 - 125, width/2 + 125),random(height - 300, height - 50));
        }
      }
    }
    
    /*
    for(let i = 0; i < ballsCluster3.length; i++){
      if (i >= 1){
        var distance = dist(ballsCluster3[i].position.x, ballsCluster3[i].position.y, ballsCluster3[i-1].position.x, ballsCluster3[i-1].position.y);
        while (distance <= ballsCluster3[i].dimension){
          ballsCluster3[i].position = createVector(random(width - 300, width - 50),random(50, 300));
        }
      }
    }
    */

  } else{
    buttonActive = false;
    ballMoving = true;
    button.removeClass("pressed");
  }
}

function keyPressed(){
  if (key == "r"){
    ballMoving = true;
    button.removeClass("pressed");
  }
}