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
let labelMouse = ["","",""];

let pointerBall = false;

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
        questCluster1[i],  //Cluster 1
        map(100,0,100,0,255));                //Alpha Value
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
      makeawarePeople[i].modifyAlpha(255);
      makeawarePeople[i].move();
      makeawarePeople[i].bounce();
    }
      if(makeawarePeople[i].selected){
        anyCollision = true;
        makeawarePeople[i].modifyAlpha(255);
        makeawarePeople[i].collided();
      }else if (!anyCollision){
        makeawarePeople[i].checkCollision();
      } else {
        makeawarePeople[i].modifyAlpha(120);
      }
  }
  
  //Drawing only if necessary, information of balls and relative pointer
  push();
  if (mouseX >= width/2){
    textAlign(RIGHT);
    fill("#000000");
    text(labelMouse[0], mouseX - 5,mouseY + 20);
    text(labelMouse[1], mouseX - 5,mouseY + 20 + highlineCursorText); 
    text(labelMouse[2], mouseX - 5,mouseY + 20 + highlineCursorText + highlineCursorText);
  } else {
    textAlign(LEFT);
    fill("#000000");
    text(labelMouse[0], mouseX + 5,mouseY + 20);
    text(labelMouse[1], mouseX + 5,mouseY + 20 + highlineCursorText); 
    text(labelMouse[2], mouseX + 5,mouseY + 20 + highlineCursorText + highlineCursorText);
      }
  pop();
  
  if (pointerBall == true){
    push();
    stroke("black");
    strokeWeight(2);
    line(mouseX-20,mouseY,mouseX+20,mouseY);
    line(mouseX,mouseY-20,mouseX,mouseY+20);
    pop();
    push();
  }

  labelMouse = ["","",""];
  pointerBall = false;
}


class Ball {
  constructor(dimension, tempX, tempY, tempXspeed, tempYspeed, abColor, questCluster1, alphaValueConstr) {
    this.position = createVector(tempX, tempY);
    this.originalVelocity = createVector(tempXspeed, tempYspeed);
    this.velocity = createVector(tempXspeed, tempYspeed);
    this.dimension = dimension;
    var colorNumber = int(abColor);
    this.color = colors[colorNumber];
    this.selected = false;
    this.cluster1 = questCluster1;
    //console.log(alphaValueConstr);
    this.alphaValue = alphaValueConstr;
    this.moveable = true; // Add a moveable flag to control movement
  }

  display() {
    strokeWeight(0);
    if(this.dimension < antibioticDimension){
      let fillColor = color(this.color);
      fillColor = color(red(fillColor), green(fillColor), blue(fillColor), this.alphaValue);
      fill(fillColor);
      circle(this.position.x, this.position.y, 25);
      fill(255,255,255,this.alphaValue);
      circle(this.position.x, this.position.y, antibioticDimension-8);
    } else{
      fill(255,255,255,this.alphaValue);
      circle(this.position.x, this.position.y, this.dimension);
      let fillColor = color(this.color);
      fillColor = color(red(fillColor), green(fillColor), blue(fillColor), this.alphaValue);
      fill(fillColor);
      circle(this.position.x, this.position.y, antibioticDimension);
    }


    
  }

  move() {
    if (this.moveable) {
      this.position.add(this.velocity);
    }
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
    if (width >= 500){
      this.hit = collideCircleCircle(mouseX, mouseY, antibioticDimension+10, this.position.x, this.position.y, antibioticDimension);
      
        if (this.hit){
          //console.log("hit");
          this.originalVelocity = this.velocity;
          this.selected = true;
          this.moveable = false; // Set moveable to false when collided
        }
    }
    }

  collided(){
    this.hit = collideCircleCircle(mouseX, mouseY, antibioticDimension+10, this.position.x, this.position.y, antibioticDimension);
    noCursor();
    pointerBall = true;

    fill("black");
    //Here the cursor will display the values for each ball
      textAlign(LEFT);
      
      //Here the first answer
      if(this.color === colors[0]){
        labelMouse[0] = "Color: I don't know what AMR is";
      }else if(this.color === colors[1]){
        labelMouse[0] = "Color: I'm not sure what AMR is";
      }else if(this.color === colors[2]){
        labelMouse[0] = "Color: I know what AMR is";
      }else{
        console.error("Color error in JSON file -> Text not displayed");
        console.error(this.color);
      }

      //Here the second answer
      if(this.originalVelocity.x === 0.1 || this.originalVelocity.x === -0.1){
        labelMouse[1] = "Velocity: I’ve never consumed antibiotics";
      }else if(this.originalVelocity.x === 1.5 || this.originalVelocity.x === -1.5){
        labelMouse[1] = "Velocity: I consumed the last antibioticics more than 10 years ago";
      }else if(this.originalVelocity.x === 3 || this.originalVelocity.x === -3){
        labelMouse[1] = "Velocity: I consumed the last antibioticics between 10 and 5 years ago";
      }else if(this.originalVelocity.x === 4.5 || this.originalVelocity.x === -4.5){
        labelMouse[1] = "Velocity: I consumed the last antibioticics between 5 and 1 year ago";
      }else if(this.originalVelocity.x === 6 || this.originalVelocity.x === -6){
        labelMouse[1] = "Velocity: I've consumed the last antibioticics in the last year";
      }else if(this.originalVelocity.x === 7.5 || this.originalVelocity.x === -7.5){
        labelMouse[1] = "Velocity: I've consumed the last antibioticics in the last six months";
      }else if(this.originalVelocity.x === 10 || this.originalVelocity.x === -10){
        labelMouse[1] = "Velocity: I am currently under antibiotic treatment";
      }else{
        console.error("Speed error in JSON file -> Text not displayed");
        console.error(this.originalVelocity.x);
      }

      //Here the third answer
      if(this.dimension === 110){
        labelMouse[2] = "Dimension: I don't want to consume antibiotics for any reason";
      }else if(this.dimension === 95){
        labelMouse[2] = "Dimension: I don’t take antibiotics even if prescribed";
      }else if(this.dimension === 80){
        labelMouse[2] = "Dimension: I do my best to avoid antibiotics";
      }else if(this.dimension === 65){
        labelMouse[2] = "Dimension: I look for alternatives to antibiotics";
      }else if(this.dimension === 50){
        labelMouse[2] = "Dimension: I follow the prescription";
      }else if(this.dimension === 35){
        labelMouse[2] = "Dimension: I take antibiotics even without prescription";
      }else if(this.dimension === 20){
        labelMouse[2] = "Dimension: I take antibiotics for prevention";
      }else{
        console.error("Dimension error in JSON file -> Text not displayed");
        console.error(this.dimension);
      }

    if(!this.hit){
      cursor();
      //console.log("Not hitted anymore");
      this.selected = false;
      anyCollision = false;
      this.velocity = this.originalVelocity;
      //console.log(this.velocity);
      this.moveable = true; // Set moveable to true when not collided
    }
  }

  modifyAlpha(alphaNew) {
    this.alphaValue = alphaNew; // Modifying the alphaChannel
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
        //("The distance of the ball nr " + i + " is " + distance);
        while (distance <= ballsCluster1[i].dimension){
          ballsCluster1[i].position = createVector(random(50, 300),random(50, 300));
        }
      }
    }

    for(let i = 0; i < ballsCluster2.length; i++){
      if (i >= 1){
        var distance = dist(ballsCluster2[i].position.x, ballsCluster2[i].position.y, ballsCluster2[i-1].position.x, ballsCluster2[i-1].position.y);
        //console.log("The distance of the ball nr " + i + " is " + distance);
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