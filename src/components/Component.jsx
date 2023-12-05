import { useEffect, useRef } from "react";
import Matter from "matter-js";
import template from "../images/template.svg";
import result from "../images/result.svg";
import { Tween, Easing } from "@tweenjs/tween.js";
import { useState } from "react";

export default function Component() {
  const containerRef = useRef();
  const canvasRef = useRef();
  const [obj, setObj] = useState(null);
  const width = 550;
  const height = 740;
  const mock = Array.from({ length: 15 });

  useEffect(() => {
    let Engine = Matter.Engine;
    let Render = Matter.Render;
    let World = Matter.World;
    let Bodies = Matter.Bodies;
    let Mouse = Matter.Mouse;
    let MouseConstraint = Matter.MouseConstraint;
    let store = [];
    const lst = [];

    let engine = Engine.create();
    let wallOptions = {
      isStatic: true, // 정적 객체로 설정하여 이동하지 않도록 함
      restitution: 0,
      friction: 0,
      density: 0,
      angularSpeed: 0,
      positionIterations: 10,
      velocityIterations: 10,
    };

    let wallStyle = {
      fillStyle: "transparent", // 투명색으로 설정
      strokeStyle: "transparent", // 테두리 색상
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
    let topWall = Bodies.rectangle(width / 2, -100, width, 10, {
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
        showCollisions: false,
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
        Bodies.circle(300, 0, 65, {
          label: `ball`,
          restitution: 0,
          motion: 0.4,
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

    const generate = () => {
      if (lst.length > 0) {
        Array.from({ length: Math.random() * 5 }).forEach((item) => {
          if (lst.length > 0) {
            World.add(engine.world, [lst.pop()]);
          }
        });
      }
      requestAnimationFrame(generate);
    };

    setTimeout(() => {
      generate();
    }, 200);

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      stiffness: 0, // 클릭된 물체와 마우스 간의 스프링 강도 (0에서 1 사이의 값)
      angularStiffness: 0, // 각속도의 스프링 강도 (0에서 1 사이의 값)
      constraint: {
        render: {
          visible: false,
        },
      },
    });
    World.add(engine.world, mouseConstraint);

    // 렌더러에 대해 Z-인덱스를 기반으로 정렬하는 함수
    function depthSortBodies() {
      // 현재 씬의 모든 바디 가져오기
      const bodies = Matter.Composite.allBodies(engine.world);
      // Z-인덱스에 따라 정렬
      bodies.sort((a, b) => (a.render.zIndex || 0) - (b.render.zIndex || 0));
      // 새로 정렬된 순서로 다시 그리기
      Matter.Render.world(render); // render는 렌더러 객체입니다.
    }

    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      if (store.length > 0) {
        // 배경을 클릭한 경우, clickedBody 제거
        const storeBall = store.shift();
        World.remove(engine.world, storeBall.scale);
        // World.add(engine.world, [storeBall.origin]);
        World.add(
          engine.world,
          Bodies.circle(300, 0, 65, {
            label: `ball`,
            restitution: 0,
            motion: 0.4,
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

      const clickedBody = event.source.body;
      if (clickedBody && clickedBody.label === "ball") {
        store.push({
          scale: event.source.body,
          origin: event.source.body,
        });
        clickedBody.render.zIndex = 999;
        clickedBody.render.sprite.texture = result;
        depthSortBodies();

        clickedBody.collisionFilter = {
          group: -1, // 클릭된 구슬끼리는 서로 무시
          category: 0x0002,
          mask: 0x0002,
        };

        const targetPosition = {
          x: width / 2,
          y: height / 3,
        };

        const targetScale = {
          x: 2.9,
          y: 2.9,
        };

        const initialPosition = {
          x: clickedBody.position.x,
          y: clickedBody.position.y,
        };

        const startTime = Date.now();
        const duration = 500; // 1000ms = 1초

        function animate() {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(1, elapsed / duration); // 1 이상으로 진행되지 않도록 제한

          // 부드러운 이동
          const interpolatedX =
            initialPosition.x +
            (targetPosition.x - initialPosition.x) * progress;
          const interpolatedY =
            initialPosition.y +
            (targetPosition.y - initialPosition.y) * progress;
          Matter.Body.setPosition(clickedBody, {
            x: interpolatedX,
            y: interpolatedY,
          });

          // 부드러운 크기 조절
          const interpolatedScaleX = 1 + (targetScale.x - 1) * progress;
          const interpolatedScaleY = 1 + (targetScale.y - 1) * progress;
          clickedBody.render.sprite.xScale = interpolatedScaleX;
          clickedBody.render.sprite.yScale = interpolatedScaleY;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            Matter.Body.setStatic(clickedBody, true);
          }
        }

        // 애니메이션 시작
        animate();
        clickedBody.collisionFilter = {
          group: 0, // 클릭된 구슬끼리 서로 충돌 허용
          category: 0x0002,
          mask: 0x0002,
        };
      }
    });

    // // 중력이 활성화되어 있으면 구슬을 떠오르게 함
    // Matter.Events.on(engine, "beforeUpdate", () => {
    //   if (gravityEnabled && lst.length > 0) {
    //     Array.from({ length: Math.random() * 5 }).forEach((item) => {
    //       if (lst.length > 0) {
    //         World.add(engine.world, [lst.pop()]);
    //       }
    //     });
    //   }
    // });

    Matter.Runner.run(engine);
    Render.run(render);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: width - 100,
          height: height,
          border: "solid 1px black",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: "999",
          display: "flex",
          justifyContent: "center",
          overflow: "scroll",
        }}
      >
        <p
          style={{
            paddingLeft: "1rem",
            background: "transparent",
            position: "absolute",
            marginBottom: "auto",
          }}
        ></p>
        <canvas ref={canvasRef} style={{ zIndex: "-1" }} />
      </div>
    </>
  );
}
