import { useEffect, useRef } from "react";
import Matter from "matter-js";
import template from "../images/template.svg";

export default function Component() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const width = 500;
  const height = 800;

  useEffect(() => {
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let World = Matter.World;
    let Bodies = Matter.Bodies;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
    const mock = Array.from({ length: 16 });
    const lst = [];

    let engine = Engine.create();
    let wallOptions = {
      isStatic: true, // 정적 객체로 설정하여 이동하지 않도록 함
      restitution: 0,
      friction: 0,
      density: 0,
    };

    let wallStyle = {
      fillStyle: "transparent", // 투명색으로 설정
      strokeStyle: "white", // 테두리 색상
      lineWidth: 2, // 테두리 두께
    };

    let leftWall = Bodies.rectangle(0, height / 2, 10, height, {
      ...wallOptions,
      render: wallStyle,
    });
    let rightWall = Bodies.rectangle(width, height / 2, 10, height, {
      ...wallOptions,
      render: wallStyle,
    });
    let topWall = Bodies.rectangle(width / 2, 0, width, 10, {
      ...wallOptions,
      render: wallStyle,
    });
    let bottomWall = Bodies.rectangle(width / 2, height, width, 10, {
      ...wallOptions,
      render: wallStyle,
    });

    World.add(engine.world, [leftWall, rightWall, topWall, bottomWall]);

    let render = Render.create({
      element: containerRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: width,
        height: height,
        background: "white",
        wireframes: false,
      },
    });

    // const floor = Bodies.rectangle(300, 600, 600, 30, {
    //   isStatic: true,
    //   render: {
    //     fillStyle: "white",
    //   },
    // });

    for (let i = 0; i < mock.length; i++) {
      lst.push(
        Bodies.circle(300, 0, 69, {
          label: `ball`,
          restitution: 0.9,
          render: {
            sprite: {
              texture: template,
              xScale: 1.1,
              yScale: 1.1,
            },
          },
        })
      );
    }

    // World.add(engine.world, [floor]);

    const timeout = setInterval(() => {
      if (lst.length > 0) {
        Array.from({ length: Math.random() * 5 }).forEach((item) => {
          if (lst.length > 0) {
            World.add(engine.world, [lst.pop()]);
          }
        });
      } else {
        clearTimeout(timeout);
      }
    }, 10);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
    });
    World.add(engine.world, mouseConstraint);
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      const clickedBody = event.source.body;
      if (clickedBody && clickedBody.label === "ball") {
        console.log(clickedBody.render);
        clickedBody.render.sprite.xScale = 1.5;
        clickedBody.render.sprite.yScale = 1.5;
      }
    });

    Matter.Runner.run(engine);
    Render.run(render);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: width,
        height: height,
        border: "solid 1px black",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
