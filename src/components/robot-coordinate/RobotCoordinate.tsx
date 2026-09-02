type RobotCoordinateProps = {
  x: number;
  y: number;
  theta?: number;
  connected?: boolean;
};

export const RobotCoordinate = ({
  x,
  y,
  theta,
  connected = true,
}: RobotCoordinateProps) => {
  return (
    <div
      style={{
        marginTop: 8,
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 8,
        fontFamily: "monospace",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span>x: {Math.round(x)}</span>
        <span>y: {Math.round(y)}</span>
        {typeof theta === "number" && <span>θ: {theta.toFixed(2)}</span>}
        <span
          style={{
            marginLeft: "auto",
            color: connected ? "#16a34a" : "#dc2626",
            fontWeight: 700,
          }}
        >
          {connected ? "CONNECTED" : "DISCONNECTED"}
        </span>
      </div>
    </div>
  );
};
