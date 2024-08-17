import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export function GET(): ImageResponse {
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:3001`;
  const calSans = fs.readFileSync(
    path.resolve("./public/fonts/CalSans-SemiBold.ttf")
  );
  const interRegular = fs.readFileSync(
    path.resolve("./public/fonts/Inter-Regular.ttf")
  );
  const interSemiBold = fs.readFileSync(
    path.resolve("./public/fonts/Inter-SemiBold.ttf")
  );
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage: `url("${url}/triangles.png")`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "repeat",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: "3rem",
            fontWeight: "bold",
            letterSpacing: "-0.025em",
            alignItems: "center",
            color: "#1F2937",
            textAlign: "left",
            marginTop: "-2rem",
          }}
        >
          <h2
            style={{
              fontWeight: "bold",
              fontFamily: "Cal Sans",
            }}
          >
            props.to/
          </h2>
          <div
            style={{
              color: "#374151",
              fontFamily: "Inter",
              fontWeight: 400,
              display: "flex",
              height: "5rem",
              alignItems: "center",
              marginTop: "1rem",
              marginLeft: "-0.5rem",
              border: "2px solid darkgray",
              borderRadius: "15px",
              padding: "0.1rem 1rem",
              backgroundColor: "white",
            }}
          >
            https://any.address.you.want.com
            <div
              style={{
                width: "3px",
                height: "70%",
                backgroundColor: "black",
              }}
            />
          </div>
        </div>
        <h3
          style={{
            fontSize: "3rem",
            fontFamily: "Inter",
            fontWeight: 500,
            marginTop: "-1rem",
          }}
        >
          Open Source Feedback Platform
        </h3>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cal Sans",
          data: calSans,
          weight: 600,
          style: "normal",
        },
        {
          name: "Inter",
          data: interSemiBold,
          weight: 500,
          style: "normal",
        },
        {
          name: "Inter",
          data: interRegular,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
